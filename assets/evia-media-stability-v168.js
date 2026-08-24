(()=>{
"use strict";
const VERSION=168;

function inEvidence(){return document.querySelector(".self-title")?.textContent?.trim()==="Evidence"}
let hydrateToken=0,mutationTimer=0;
function refreshEvidenceMedia(){try{window.EviaEvidenceMedia?.refresh?.()}catch(error){console.debug("Evia evidence media refresh",error)}}
function hydrateEvidence(){
  const token=++hydrateToken;
  [0,120,280,520,900,1450,2200].forEach(delay=>setTimeout(()=>{
    if(token!==hydrateToken||!inEvidence())return;
    refreshEvidenceMedia();
  },delay))
}
function observeEvidence(){
  const panel=document.querySelector(".self-panel");
  if(!panel)return;
  const observer=new MutationObserver(()=>{
    if(!inEvidence())return;
    clearTimeout(mutationTimer);
    mutationTimer=setTimeout(refreshEvidenceMedia,140)
  });
  observer.observe(panel,{childList:true,subtree:true});
}
document.addEventListener("click",event=>{
  if(event.target?.closest?.("[data-action='evidence'],[data-tab],[data-quick]"))setTimeout(hydrateEvidence,20)
},true);
window.addEventListener("pageshow",()=>setTimeout(hydrateEvidence,80));
window.addEventListener("focus",()=>{if(inEvidence())hydrateEvidence()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{observeEvidence();hydrateEvidence()},{once:true});else{observeEvidence();hydrateEvidence()}

const NativeMediaRecorder=window.MediaRecorder;
if(typeof NativeMediaRecorder==="function"){
  const supports=type=>{try{return !!NativeMediaRecorder.isTypeSupported?.(type)}catch{return false}};
  function StableMediaRecorder(stream,options){
    const hasVideo=!!stream?.getVideoTracks?.().length,hasAudio=!!stream?.getAudioTracks?.().length;
    let opts=options?{...options}:{};
    if(hasVideo&&hasAudio){
      const stableType=["video/webm;codecs=vp8,opus","video/webm;codecs=vp9,opus","video/webm"].find(supports);
      if(stableType){
        opts.mimeType=stableType;
        opts.audioBitsPerSecond=Math.max(128000,Number(opts.audioBitsPerSecond)||0);
      }
    }
    let recorder;
    try{recorder=new NativeMediaRecorder(stream,opts)}catch{recorder=new NativeMediaRecorder(stream,options)}
    if(hasVideo&&hasAudio){
      const nativeStart=recorder.start.bind(recorder);
      recorder.start=()=>nativeStart();
    }
    return recorder
  }
  StableMediaRecorder.prototype=NativeMediaRecorder.prototype;
  try{Object.setPrototypeOf(StableMediaRecorder,NativeMediaRecorder)}catch{}
  StableMediaRecorder.isTypeSupported=type=>supports(type);
  try{Object.defineProperty(window,"MediaRecorder",{value:StableMediaRecorder,writable:true,configurable:true})}catch{try{window.MediaRecorder=StableMediaRecorder}catch{}}
}
window.EviaMediaStability=Object.freeze({version:VERSION,hydrate:hydrateEvidence});
})();