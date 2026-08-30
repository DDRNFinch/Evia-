(()=>{
"use strict";
const VERSION=234;
const VISITS_KEY="evia-mini-milos-visits-v2";
const OBS_KEY="evia-mini-milos-observed-v1";
const REF_KEY="evia-mini-milos-learner-ref-v1";
const PARTS_KEY="evia-milos-visit-parts-v2";
let stream=null,timer=null,canvas=null,detector=null;
const old=window.EviaQrExchange;
if(!old)return;
const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const clean=(value,max=220)=>String(value??"").replace(/\s+/g," ").trim().slice(0,max);
function unb64(value){const x=String(value||"").replace(/-/g,"+").replace(/_/g,"/"),p=x+"=".repeat((4-x.length%4)%4),bin=atob(p),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes))}
function ctx(){return window.EviaCourseContext?.current?.()||null}
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  const naxosRoute=window.EviaNaxosCoursePacks?.routeId?.(c);if(naxosRoute)return naxosRoute;
  if(c.courseId==="st0171-v1-1")return"ST0171";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}
  const family=String(c.packFamilyId||"").trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9.-]{2,30}$/.test(family)?family:""
}
function exact(value){
  const ref=clean(localStorage.getItem(REF_KEY)||"",80),route=routeId();
  if(!ref)throw Error("Share this Evia course with Milos first, then scan the completed review back into Evia.");
  if(!value||clean(value.r,80)!==ref)throw Error("This Milos QR code belongs to a different learner.");
  if(!route||clean(value.c,60)!==route)throw Error("This Milos QR code is for a different course.");
}
function safeDate(value){const text=clean(value,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return"";const d=new Date(`${text}T12:00:00`);return Number.isFinite(d.getTime())?text:""}
function stopCamera(){if(timer){clearTimeout(timer);timer=null}if(stream){stream.getTracks().forEach(track=>track.stop());stream=null}detector=null}
function style(){if(document.getElementById("evia-milos-return-v234-style"))return;const s=document.createElement("style");s.id="evia-milos-return-v234-style";s.textContent=`.evia-qrx-layer{position:fixed;inset:0;z-index:10080;background:rgba(251,250,247,.97);backdrop-filter:blur(22px);overflow:auto;color:#242428;font-family:inherit}.evia-qrx-screen{min-height:100%;max-width:650px;margin:0 auto;padding:max(1rem,env(safe-area-inset-top)) 1rem max(2rem,env(safe-area-inset-bottom));box-sizing:border-box}.evia-qrx-head{display:grid;grid-template-columns:4rem 1fr 4rem;align-items:center;margin:.3rem 0 1.35rem}.evia-qrx-head b{text-align:center;font-size:1rem}.evia-qrx-head button{border:0;background:transparent;color:#777;font:inherit;text-align:left;padding:.7rem 0}.evia-qrx-screen h2{text-align:center;font-size:1.28rem;font-weight:520;margin:.3rem 0 .65rem}.evia-qrx-status{text-align:center;color:#737277;font-size:.74rem;line-height:1.4;min-height:1.2rem}.evia-qrx-status.error{color:#9c2f2f}.evia-qrx-camera{position:relative;aspect-ratio:3/4;max-width:360px;margin:1rem auto;border-radius:1.45rem;overflow:hidden;background:#111}.evia-qrx-camera video{width:100%;height:100%;object-fit:cover}.evia-qrx-camera i{position:absolute;inset:19%;border:2px solid #fff;border-radius:1rem;box-shadow:0 0 0 999px rgba(0,0,0,.22)}.evia-qrx-actions{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;max-width:420px;margin:.7rem auto}.evia-qrx-primary,.evia-qrx-secondary{border:0;border-radius:999px;min-height:2.9rem;font:inherit}.evia-qrx-primary{background:#efc33d;color:#4c3b0b}.evia-qrx-secondary{background:#ffffffa8;color:#666;border:1px solid #ffffffd0;display:grid;place-items:center}.evia-qrx-secondary input{display:none}.evia-qrx-card{background:#ffffffb0;border:1px solid #ffffffd6;border-radius:1.15rem;padding:1rem;margin:4.5rem auto 1rem;max-width:420px}.evia-qrx-card b{display:block;font-size:.92rem}.evia-qrx-card span{display:block;color:#777;font-size:.76rem;line-height:1.5;margin-top:.35rem}`;document.head.appendChild(s)}
function layer(){style();let el=document.querySelector(".evia-qrx-layer");if(!el){el=document.createElement("div");el.className="evia-qrx-layer";document.body.appendChild(el)}return el}
function close(){stopCamera();document.querySelector(".evia-qrx-layer")?.remove()}
function head(){return`<div class="evia-qrx-head"><button type="button" data-v234-close>‹ Back</button><b>Receive QR code</b><span></span></div>`}
function setStatus(text,error=false){const node=document.querySelector("[data-v234-status]");if(node){node.textContent=text;node.classList.toggle("error",error)}}
function confirmation(title,detail){stopCamera();const el=layer();el.innerHTML=`<section class="evia-qrx-screen">${head()}<div class="evia-qrx-card"><b>${clean(title,100)}</b><span>${clean(detail,260)}</span></div></section>`}
function sanitizeReview(value){
  exact(value);
  if(Number(value.v)!==2||String(value.t||"").toLowerCase()!=="review")throw Error("This Milos QR is not a completed progress review.");
  const data=value.data&&typeof value.data==="object"?value.data:{},next=safeDate(data.nextReviewDate);
  if(!next)throw Error("This Milos review does not contain a valid next review date.");
  const targets=(Array.isArray(data.targets)?data.targets:[]).slice(0,6).map(item=>({title:clean(item?.title,220),code:clean(item?.code,32).toUpperCase(),dueDate:next})).filter(item=>item.title);
  return {v:2,t:"review",i:clean(value.i,80)||`milos-${Date.now()}`,r:clean(value.r,80),c:clean(value.c,60),d:safeDate(value.d),u:Number(value.u)||Date.now(),summary:"Progress review",data:{overallProgress:clean(data.overallProgress||value.summary,320),nextReviewDate:next,targets}}
}
function storeReview(value){
  const item=sanitizeReview(value),list=read(VISITS_KEY,[]),items=Array.isArray(list)?list:[],at=items.findIndex(x=>x&&String(x.i||"")===item.i&&String(x.r||"")===item.r);
  if(at>=0)items[at]=item;else items.push(item);
  if(!write(VISITS_KEY,items.slice(-100)))throw Error("Evia could not save this review on this device.");
  if(item.d)localStorage.setItem("evia-mini-milos-last-review-date",item.d);
  queueMicrotask(()=>{window.EviaMilosReviewSync?.sync?.();window.EviaNextVisit?.sync?.()});
  return item
}
function storeObservation(value){
  exact(value);if(String(value.t||"observation").toLowerCase()!=="observation")throw Error("This is not a Milos observation QR.");
  const allowed=new Set(ctx()?.codes||[]),codes=[...new Set((Array.isArray(value.z)?value.z:[]).map(x=>String(x).toUpperCase()).filter(x=>!allowed.size||allowed.has(x)))];
  if(!codes.length)throw Error("This Milos observation does not contain any valid course criteria.");
  const route=routeId(),map=read(OBS_KEY,{}),bucket=map&&typeof map[route]==="object"?map[route]:{},id=clean(value.o,80)||`milos-${Date.now()}`,date=safeDate(value.d);
  codes.forEach(code=>{bucket[code]={observationId:id,date,at:Number(value.u)||Date.now()}});map[route]=bucket;
  if(!write(OBS_KEY,map))throw Error("Evia could not save this observation on this device.");
  window.dispatchEvent(new CustomEvent("evia:milos-observed-changed",{detail:{codes,id}}));
  return codes
}
function visitPart(match){
  const share=match[1],part=Number(match[2]),total=Number(match[3]),chunk=match[4];
  if(part<1||total<1||part>total||total>20)throw Error("This Milos review QR part is invalid.");
  if(total===1)return chunk;
  const all=read(PARTS_KEY,{}),slot=all[share]&&all[share].total===total?all[share]:{total,parts:{},at:Date.now()};slot.parts[part]=chunk;all[share]=slot;write(PARTS_KEY,all);
  const count=Object.keys(slot.parts).length;if(count<total){setStatus(`Review QR part ${part} saved — ${count} of ${total}. Scan the next part.`);return""}
  const encoded=Array.from({length:total},(_,i)=>slot.parts[i+1]||"").join("");delete all[share];write(PARTS_KEY,all);return encoded
}
async function accept(raw){
  const text=String(raw||"").trim();
  const visit=text.match(/^NISI:MILOS:VISIT:2:([A-Za-z0-9_-]{1,80}):(\d+)\/(\d+):([A-Za-z0-9_-]+)$/);
  if(visit){const encoded=visitPart(visit);if(!encoded)return false;const review=storeReview(unb64(encoded)),count=review.data.targets.length;confirmation("Milos review received",`Next review date and ${count} agreed target${count===1?"":"s"} updated in Evia.`);return true}
  const obs=text.match(/^NISI:MILOS:OBS:1:([A-Za-z0-9_-]+)$/);
  if(obs){const codes=storeObservation(unb64(obs[1]));confirmation("Milos observation received",`${codes.length} course item${codes.length===1?"":"s"} marked as assessor observed.`);return true}
  await old.accept(text);return true
}
async function decodeSource(source){
  if(typeof BarcodeDetector==="function"){try{detector=detector||new BarcodeDetector({formats:["qr_code"]});const found=await detector.detect(source);if(found?.[0]?.rawValue)return found[0].rawValue}catch{}}
  if(typeof window.jsQR!=="function")return null;
  const w=Number(source.videoWidth||source.naturalWidth||source.width||0),h=Number(source.videoHeight||source.naturalHeight||source.height||0);if(!w||!h)return null;
  const scale=Math.min(1,1100/Math.max(w,h)),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));canvas=canvas||document.createElement("canvas");canvas.width=cw;canvas.height=ch;const context=canvas.getContext("2d",{willReadFrequently:true});context.drawImage(source,0,0,cw,ch);const pixels=context.getImageData(0,0,cw,ch);return window.jsQR(pixels.data,cw,ch,{inversionAttempts:"attemptBoth"})?.data||null
}
async function startCamera(video=document.querySelector("[data-v234-video]")){
  if(!video||!navigator.mediaDevices?.getUserMedia){setStatus("Camera is unavailable. Choose a saved QR image instead.",true);return}
  stopCamera();try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:1280}},audio:false});video.srcObject=stream;await video.play();setStatus("Ready — hold the QR code inside the square.");scanLoop(video)}catch{setStatus("Camera could not start. Allow camera access or choose a saved QR image.",true)}
}
async function scanLoop(video){if(!stream||!document.body.contains(video))return;try{if(video.readyState>=2){const raw=await decodeSource(video);if(raw){stopCamera();await accept(raw);return}}}catch(error){setStatus(error.message||"That QR code could not be imported.",true)}timer=setTimeout(()=>scanLoop(video),240)}
async function imageFile(file){if(typeof createImageBitmap==="function"){const image=await createImageBitmap(file);return{image,close:()=>image.close?.()}}const url=URL.createObjectURL(file),image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});return{image,close:()=>URL.revokeObjectURL(url)}}
async function scanFile(file){let source;try{setStatus("Reading QR image…");source=await imageFile(file);const raw=await decodeSource(source.image);if(!raw)throw Error("No QR code was found in that image.");await accept(raw)}catch(error){setStatus(error.message||"That QR image could not be read.",true)}finally{source?.close?.()}}
function openReceive(){
  stopCamera();const el=layer();el.innerHTML=`<section class="evia-qrx-screen">${head()}<h2>Scan QR code</h2><div class="evia-qrx-camera"><video data-v234-video playsinline muted autoplay></video><i></i></div><p class="evia-qrx-status" data-v234-status>Starting camera…</p><div class="evia-qrx-actions"><button class="evia-qrx-primary" type="button" data-v234-camera>Use camera</button><label class="evia-qrx-secondary">Choose QR image<input type="file" accept="image/*" data-v234-file></label></div></section>`;startCamera(el.querySelector("[data-v234-video]"))
}
document.addEventListener("click",event=>{if(event.target.closest?.("[data-v234-close]")){event.preventDefault();close()}else if(event.target.closest?.("[data-v234-camera]")){event.preventDefault();startCamera()}},true);
document.addEventListener("change",event=>{if(!event.target.matches?.("[data-v234-file]"))return;const file=event.target.files?.[0];event.target.value="";if(file)scanFile(file)},true);
window.addEventListener("pagehide",stopCamera);
window.EviaQrExchange=Object.freeze({...old,version:VERSION,openReceive,accept,__milosReturn234:true});
window.EviaMilosReturn=Object.freeze({version:VERSION,accept,routeId,storeReview,storeObservation});
})();
