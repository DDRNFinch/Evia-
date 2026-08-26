(()=>{
"use strict";
const VERSION=233;
const SINGLE_PREFIX="NISI:EVIA:PROGRESS:1:";
const MULTI_PREFIX="NISI:EVIA:PROGRESS:2:";
const CHUNK_SIZE=850;
const MAX_PARTS=24;
const QRLIB="./assets/qrcode.js?v=233";
let qrPromise=null,cycleTimer=null;
function uid(){try{return crypto.randomUUID().replace(/-/g,"").slice(0,20)}catch{return`${Date.now().toString(36)}${Math.random().toString(36).slice(2,12)}`}}
function forceFrames(raw,share=uid()){
  const text=String(raw||"");
  if(!text.startsWith(SINGLE_PREFIX))throw Error("This Evia progress record cannot be split safely.");
  const encoded=text.slice(SINGLE_PREFIX.length),chunks=[];
  for(let i=0;i<encoded.length;i+=CHUNK_SIZE)chunks.push(encoded.slice(i,i+CHUNK_SIZE));
  if(!chunks.length||chunks.length>MAX_PARTS)throw Error("This Coach Snapshot is too large to share by QR.");
  return chunks.map((chunk,index)=>`${MULTI_PREFIX}${share}:${index+1}/${chunks.length}:${chunk}`)
}
function framesFor(raw){
  const api=window.EviaCoachQR;
  if(api&&typeof api.framesFor==="function")return api.framesFor(raw);
  return forceFrames(raw)
}
function ensureQr(){
  if(typeof window.qrcode==="function")return Promise.resolve(true);
  if(qrPromise)return qrPromise;
  qrPromise=new Promise(resolve=>{
    const existing=document.querySelector("script[data-evia-coach-qrcode-v233]");
    const done=()=>resolve(typeof window.qrcode==="function");
    if(existing){existing.addEventListener("load",done,{once:true});existing.addEventListener("error",()=>resolve(false),{once:true});setTimeout(done,1800);return}
    const script=document.createElement("script");script.src=QRLIB;script.async=true;script.dataset.eviaCoachQrcodeV233="1";script.onload=done;script.onerror=()=>resolve(false);document.head.appendChild(script)
  }).finally(()=>{if(typeof window.qrcode!=="function")qrPromise=null});
  return qrPromise
}
function ensureStyle(){
  if(document.getElementById("evia-qr-exchange-v107-style")||document.getElementById("evia-coach-qr-v233-style"))return;
  const style=document.createElement("style");style.id="evia-coach-qr-v233-style";style.textContent=`.evia-qrx-layer{position:fixed;inset:0;z-index:10080;background:rgba(251,250,247,.97);backdrop-filter:blur(22px);overflow:auto;color:#242428;font-family:inherit}.evia-qrx-screen{min-height:100%;max-width:650px;margin:0 auto;padding:max(1rem,env(safe-area-inset-top)) 1rem max(2rem,env(safe-area-inset-bottom));box-sizing:border-box}.evia-qrx-head{display:grid;grid-template-columns:4rem 1fr 4rem;align-items:center;margin:.3rem 0 1.35rem}.evia-qrx-head b{text-align:center;font-size:1rem}.evia-qrx-head button{border:0;background:transparent;color:#777;font:inherit;text-align:left;padding:.7rem 0}.evia-qrx-screen h2{text-align:center;font-size:1.28rem;font-weight:520;margin:.3rem 0 .65rem}.evia-qrx-qr{background:#fff;border-radius:1.5rem;padding:1rem;margin:1rem auto;max-width:330px;min-height:12rem;display:grid;place-items:center;box-shadow:0 12px 36px rgba(50,50,50,.07)}.evia-qrx-status{text-align:center;color:#737277;font-size:.74rem;line-height:1.4;min-height:1.2rem}.evia-qrx-status.error{color:#9c2f2f}.evia-qrx-card{background:#ffffffb0;border:1px solid #ffffffd6;border-radius:1.15rem;padding:1rem;margin:1rem auto;max-width:420px}.evia-qrx-card b{display:block;font-size:.82rem}.evia-qrx-card span{display:block;color:#777;font-size:.7rem;line-height:1.4;margin-top:.25rem}`;document.head.appendChild(style)
}
function renderQr(node,text){
  let qr;
  try{qr=window.qrcode(0,"M");qr.addData(text,"Byte");qr.make()}
  catch{qr=window.qrcode(0,"L");qr.addData(text,"Byte");qr.make()}
  node.innerHTML=qr.createSvgTag({cellSize:5,margin:16,scalable:true,alt:"Evia Coach Snapshot QR code"});
  const svg=node.querySelector("svg");if(svg){svg.style.width="100%";svg.style.maxWidth="310px";svg.style.height="auto";svg.style.display="block";svg.style.margin="0 auto"}
}
function close(){if(cycleTimer){clearInterval(cycleTimer);cycleTimer=null}document.querySelector(".evia-qrx-layer")?.remove()}
function shell(total){
  ensureStyle();
  const el=document.createElement("div");el.className="evia-qrx-layer";
  el.innerHTML=`<section class="evia-qrx-screen"><div class="evia-qrx-head"><button type="button" data-coach233-close>‹ Back</button><b>Share with assessor</b><span></span></div><h2>Show this QR code to Milos</h2><div class="evia-qrx-qr" data-coach233-qr></div><p class="evia-qrx-status" data-coach233-status>${total>1?`Coach Snapshot 1 of ${total} · Keep the screen still while Milos collects every part automatically.`:"Milos receives anonymous course progress and the current review-period Coach Snapshot."}</p><div class="evia-qrx-card"><b>Private by design</b><span>No learner name, contact details, media files, signatures or private written wellbeing notes are included.</span></div></section>`;
  document.body.appendChild(el);el.querySelector("[data-coach233-close]").onclick=close;return el
}
async function show(raw,inputFrames){
  close();
  const ok=await ensureQr();if(!ok)throw Error("QR generator could not load.");
  let frames=inputFrames&&inputFrames.length?inputFrames:[String(raw||"")];
  let el=shell(frames.length),box=el.querySelector("[data-coach233-qr]"),status=el.querySelector("[data-coach233-status]"),index=0;
  const paint=()=>{
    if(!document.body.contains(el)){close();return}
    try{renderQr(box,frames[index])}
    catch(error){
      if(frames.length===1&&String(raw||"").startsWith(SINGLE_PREFIX)){
        frames=forceFrames(raw);index=0;el.remove();el=shell(frames.length);box=el.querySelector("[data-coach233-qr]");status=el.querySelector("[data-coach233-status]");renderQr(box,frames[0])
      }else throw error
    }
    status.textContent=frames.length>1?`Coach Snapshot ${index+1} of ${frames.length} · Keep the screen still while Milos collects every part automatically.`:"Milos receives anonymous course progress and the current review-period Coach Snapshot.";
    index=(index+1)%frames.length
  };
  paint();if(frames.length>1)cycleTimer=setInterval(paint,950)
}
function patch(){
  const old=window.EviaQrExchange;
  if(!old||old.__coach233||typeof old.buildProgress!=="function")return false;
  async function openShare(){
    try{const raw=String(old.buildProgress()),frames=framesFor(raw);await show(raw,frames)}
    catch(error){close();const el=shell(1),status=el.querySelector("[data-coach233-status]");status.textContent=error?.message||"The Coach Snapshot QR could not be created.";status.classList.add("error")}
  }
  window.EviaQrExchange=Object.freeze({...old,openShare,__coach233:true});return true
}
function start(){if(patch())return;let tries=0;const timer=setInterval(()=>{tries++;if(patch()||tries>50)clearInterval(timer)},100)}
window.addEventListener("pagehide",close);
window.EviaCoachQRDisplay=Object.freeze({version:VERSION,forceFrames,show});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
