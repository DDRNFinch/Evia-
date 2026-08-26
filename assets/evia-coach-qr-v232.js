(()=>{
"use strict";
const VERSION=232;
const SINGLE_PREFIX="NISI:EVIA:PROGRESS:1:";
const MULTI_PREFIX="NISI:EVIA:PROGRESS:2:";
const SINGLE_LIMIT=1800;
const CHUNK_SIZE=850;
const MAX_PARTS=24;
const QRLIB="./assets/qrcode.js?v=232";
let qrPromise=null,cycleTimer=null;
function uid(){try{return crypto.randomUUID().replace(/-/g,"").slice(0,20)}catch{return`${Date.now().toString(36)}${Math.random().toString(36).slice(2,12)}`}}
function bytes(text){return new TextEncoder().encode(String(text||"")).length}
function framesFor(raw,share=uid()){
  const text=String(raw||"");
  if(bytes(text)<=SINGLE_LIMIT)return[text];
  if(!text.startsWith(SINGLE_PREFIX))throw Error("This Evia progress record cannot be split safely.");
  const encoded=text.slice(SINGLE_PREFIX.length);
  const chunks=[];for(let i=0;i<encoded.length;i+=CHUNK_SIZE)chunks.push(encoded.slice(i,i+CHUNK_SIZE));
  if(!chunks.length||chunks.length>MAX_PARTS)throw Error("This Coach Snapshot is too large to share by QR.");
  return chunks.map((chunk,index)=>`${MULTI_PREFIX}${share}:${index+1}/${chunks.length}:${chunk}`);
}
function reassemble(frames){
  const items=(Array.isArray(frames)?frames:[]).map(x=>String(x||""));
  if(items.length===1&&items[0].startsWith(SINGLE_PREFIX))return items[0];
  const parts=new Map();let share="",total=0;
  for(const text of items){const m=text.match(/^NISI:EVIA:PROGRESS:2:([A-Za-z0-9_-]{1,80}):(\d+)\/(\d+):([A-Za-z0-9_-]+)$/);if(!m)throw Error("Invalid Coach Snapshot frame.");if(!share)share=m[1];if(share!==m[1])throw Error("Coach Snapshot frames do not belong together.");const part=Number(m[2]),n=Number(m[3]);if(!total)total=n;if(total!==n||part<1||part>n||n>MAX_PARTS)throw Error("Invalid Coach Snapshot part count.");parts.set(part,m[4])}
  if(parts.size!==total)throw Error("Coach Snapshot frames are incomplete.");
  return SINGLE_PREFIX+Array.from({length:total},(_,i)=>parts.get(i+1)||"").join("");
}
function ensureQr(){if(typeof window.qrcode==="function")return Promise.resolve(true);if(qrPromise)return qrPromise;qrPromise=new Promise(resolve=>{const old=document.querySelector("script[data-evia-coach-qrcode]");const done=()=>resolve(typeof window.qrcode==="function");if(old){old.addEventListener("load",done,{once:true});old.addEventListener("error",()=>resolve(false),{once:true});setTimeout(done,1600);return}const script=document.createElement("script");script.src=QRLIB;script.async=true;script.dataset.eviaCoachQrcode="1";script.onload=done;script.onerror=()=>resolve(false);document.head.appendChild(script)}).finally(()=>{if(typeof window.qrcode!=="function")qrPromise=null});return qrPromise}
function renderQr(node,text){let qr;try{qr=window.qrcode(0,"M");qr.addData(text,"Byte");qr.make()}catch{qr=window.qrcode(0,"L");qr.addData(text,"Byte");qr.make()}node.innerHTML=qr.createSvgTag({cellSize:5,margin:16,scalable:true,alt:"Evia Coach Snapshot QR code"});const svg=node.querySelector("svg");if(svg){svg.style.width="100%";svg.style.maxWidth="310px";svg.style.height="auto";svg.style.display="block";svg.style.margin="0 auto"}}
function close(){if(cycleTimer){clearInterval(cycleTimer);cycleTimer=null}document.querySelector(".evia-qrx-layer")?.remove()}
function shell(total){const el=document.createElement("div");el.className="evia-qrx-layer";el.innerHTML=`<section class="evia-qrx-screen"><div class="evia-qrx-head"><button type="button" data-coach232-close>‹ Back</button><b>Share with assessor</b><span></span></div><h2>Show this QR code to Milos</h2><div class="evia-qrx-qr" data-coach232-qr></div><p class="evia-qrx-status" data-coach232-status>${total>1?`Coach Snapshot 1 of ${total} · Keep the screen still while Milos collects every part automatically.`:"Milos receives anonymous course progress and the current review-period Coach Snapshot."}</p><div class="evia-qrx-card"><b>Private by design</b><span>No learner name, contact details, media files, signatures or private written wellbeing notes are included.</span></div></section>`;document.body.appendChild(el);el.querySelector("[data-coach232-close]").onclick=close;return el}
async function openMultipart(old,raw,frames){close();if(frames.length===1){return old.openShare()}
  const ok=await ensureQr();if(!ok)throw Error("QR generator could not load.");
  const el=shell(frames.length),box=el.querySelector("[data-coach232-qr]"),status=el.querySelector("[data-coach232-status]");let index=0;
  const paint=()=>{if(!document.body.contains(el)){close();return}renderQr(box,frames[index]);status.textContent=`Coach Snapshot ${index+1} of ${frames.length} · Keep the screen still while Milos collects every part automatically.`;index=(index+1)%frames.length};
  paint();cycleTimer=setInterval(paint,950);
}
function patch(){const old=window.EviaQrExchange;if(!old||old.__coach232||typeof old.buildProgress!=="function")return false;async function openShare(){try{const raw=String(old.buildProgress()),frames=framesFor(raw);return await openMultipart(old,raw,frames)}catch(error){close();const el=shell(1),status=el.querySelector("[data-coach232-status]");status.textContent=error?.message||"The Coach Snapshot QR could not be created.";status.classList.add("error")}}window.EviaQrExchange=Object.freeze({...old,openShare,__coach232:true});return true}
function start(){if(patch())return;let tries=0;const timer=setInterval(()=>{tries++;if(patch()||tries>40)clearInterval(timer)},100)}
window.addEventListener("pagehide",()=>{if(cycleTimer)clearInterval(cycleTimer)});
window.EviaCoachQR=Object.freeze({version:VERSION,SINGLE_PREFIX,MULTI_PREFIX,SINGLE_LIMIT,CHUNK_SIZE,framesFor,reassemble});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
