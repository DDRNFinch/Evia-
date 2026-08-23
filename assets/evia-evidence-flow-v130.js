(()=>{
"use strict";
const VERSION=130;
function bypassSlowImageCapture(){
  try{
    const proto=window.ImageCapture&&window.ImageCapture.prototype;
    if(proto&&typeof proto.grabFrame==="function"&&!proto.__eviaFastFrameV130){
      Object.defineProperty(proto,"__eviaFastFrameV130",{value:true,configurable:true});
      proto.grabFrame=function(){return Promise.reject(new Error("Evia uses the live video frame for instant photo capture"))}
    }
  }catch(error){console.debug("Evia fast photo capture",error)}
}
let queued=false;
function autoAdvanceCapturedMedia(){
  queued=false;
  const panel=document.querySelector(".self-panel");
  if(!panel||panel.classList.contains("evia-capture-active-v129"))return;
  const card=panel.querySelector(".self-card.photo");
  const preview=card?.querySelector("img,video");
  const next=panel.querySelector("[data-action='next']");
  if(!preview||!next||next.disabled)return;
  const key=String(preview.currentSrc||preview.src||preview.getAttribute("src")||"media");
  if(next.dataset.eviaAutoAdvanceV130===key)return;
  next.dataset.eviaAutoAdvanceV130=key;
  requestAnimationFrame(()=>setTimeout(()=>{
    if(document.contains(next)&&!next.disabled&&!document.querySelector(".self-panel.evia-capture-active-v129"))next.click();
  },20));
}
function queueAdvance(){if(queued)return;queued=true;requestAnimationFrame(autoAdvanceCapturedMedia)}
function start(){
  bypassSlowImageCapture();
  const root=document.getElementById("root")||document.body;
  new MutationObserver(queueAdvance).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["src","class","disabled"]});
  document.addEventListener("change",event=>{if(event.target?.id==="selfPhoto")setTimeout(queueAdvance,20)},true);
  window.addEventListener("pageshow",queueAdvance);
  queueAdvance();
  window.EviaEvidenceFlowV130=Object.freeze({version:VERSION,check:autoAdvanceCapturedMedia});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
