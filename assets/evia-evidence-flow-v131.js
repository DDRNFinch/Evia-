(()=>{
"use strict";
const VERSION=131;
let photoReviewUrl="",videoFinishPending=false,advanceTimer=null;
const $=q=>document.querySelector(q);
function stopTracks(stream){try{stream?.getTracks?.().forEach(track=>track.stop())}catch{}}
function clearPhotoUrl(){if(photoReviewUrl){try{URL.revokeObjectURL(photoReviewUrl)}catch{}photoReviewUrl=""}}
function canvasBlob(canvas){return new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.9))}
async function liveSquarePhoto(video){
  if(!video||video.readyState<2||!video.videoWidth||!video.videoHeight)throw Error("camera frame unavailable");
  const w=video.videoWidth,h=video.videoHeight,side=Math.min(w,h),sx=(w-side)/2,sy=(h-side)/2,size=Math.min(1440,Math.max(720,side));
  const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext("2d",{alpha:false});if(!ctx)throw Error("camera canvas unavailable");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,size,size);ctx.drawImage(video,sx,sy,side,side,0,0,size,size);
  const blob=await canvasBlob(canvas);if(!blob||blob.size<1000)throw Error("empty photo");
  return new File([blob],`evia-photo-${Date.now()}.jpg`,{type:"image/jpeg",lastModified:Date.now()})
}
function dispatchFile(file){
  const input=$("#selfPhoto");if(!input||!file)return false;
  try{
    const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
    input.dispatchEvent(new Event("change",{bubbles:true}));
    return true
  }catch(error){console.error("Evia v131 media handoff",error);return false}
}
function scheduleNext(kind,attempt=0){
  clearTimeout(advanceTimer);
  advanceTimer=setTimeout(()=>{
    const panel=$(".self-panel");
    const next=panel?.querySelector("[data-action='next']");
    if(next&&!next.disabled&&!panel.classList.contains("evia-capture-active-v129")){
      if(kind==="video")videoFinishPending=false;
      next.click();return
    }
    if(attempt<30)scheduleNext(kind,attempt+1)
  },attempt?35:0)
}
function showFastPhotoReview(file,video){
  const layer=$(".evia-inline-capture-v129.photo"),body=layer?.querySelector("[data-capture-body]");if(!layer||!body)return;
  stopTracks(video?.srcObject);clearPhotoUrl();photoReviewUrl=URL.createObjectURL(file);
  body.innerHTML=`<div class="evia-camera-square-v129"><img src="${photoReviewUrl}" alt="Captured evidence preview"></div><p class="evia-camera-hint-v129">Check the stage is clear before you use it.</p><div class="self-actions evia-camera-actions-v129"><button type="button" class="self-button" data-v131-retake>Retake</button><button type="button" class="self-button primary" data-v131-use>Use photo</button></div>`;
  body.querySelector("[data-v131-retake]").onclick=()=>{clearPhotoUrl();window.EviaStagedEvidence?.openPhoto?.($("#selfPhoto"))};
  body.querySelector("[data-v131-use]").onclick=()=>{
    const panel=$(".self-panel");panel?.classList.remove("evia-capture-active-v129");clearPhotoUrl();
    if(!dispatchFile(file)){window.EviaStagedEvidence?.openPhoto?.($("#selfPhoto"))}
  }
}
async function fastPhotoCapture(button){
  const video=$(".evia-inline-capture-v129.photo .evia-camera-square-v129 video");if(!video)return;
  button.disabled=true;button.textContent="Capturing…";
  try{const file=await liveSquarePhoto(video);showFastPhotoReview(file,video)}catch(error){console.error("Evia v131 photo capture",error);button.disabled=false;button.textContent="Take photo"}
}
function checkVideoFinish(){if(!videoFinishPending)return;const panel=$(".self-panel");if(!panel||panel.classList.contains("evia-capture-active-v129"))return;const next=panel.querySelector("[data-action='next']");if(next&&!next.disabled)scheduleNext("video")}
function clickGuard(event){
  const button=event.target?.closest?.("button");if(!button)return;
  if(button.matches("[data-photo-shutter]")){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();fastPhotoCapture(button);return
  }
  if(button.matches("[data-video-next]")&&/finish recording/i.test(button.textContent||"")){
    videoFinishPending=true;setTimeout(checkVideoFinish,0)
  }
}
function changeGuard(event){
  if(event.target?.id!=="selfPhoto")return;
  const file=event.target.files?.[0];if(!file)return;
  const kind=file.type?.startsWith("video/")?"video":"photo";
  scheduleNext(kind)
}
function start(){
  document.addEventListener("click",clickGuard,true);
  document.addEventListener("change",changeGuard,true);
  const root=$("#root")||document.body;new MutationObserver(checkVideoFinish).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["class","disabled"]});
  window.EviaEvidenceFlowV131=Object.freeze({version:VERSION,checkVideoFinish})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
