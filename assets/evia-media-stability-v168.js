(()=>{
"use strict";
const VERSION=171;

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
  observer.observe(panel,{childList:true,subtree:true})
}
document.addEventListener("click",event=>{
  if(event.target?.closest?.("[data-action='evidence'],[data-tab],[data-quick]"))setTimeout(hydrateEvidence,20)
},true);
window.addEventListener("pageshow",()=>setTimeout(hydrateEvidence,80));
window.addEventListener("focus",()=>{if(inEvidence())hydrateEvidence()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{observeEvidence();hydrateEvidence()},{once:true});else{observeEvidence();hydrateEvidence()}

const mediaDevices=navigator.mediaDevices;
if(mediaDevices?.getUserMedia){
  const nativeGetUserMedia=mediaDevices.getUserMedia.bind(mediaDevices);
  mediaDevices.getUserMedia=async constraints=>{
    if(constraints?.video&&constraints?.audio){
      const video=typeof constraints.video==="object"?{...constraints.video}:{};
      const audio=typeof constraints.audio==="object"?{...constraints.audio}:{};
      constraints={
        ...constraints,
        video:{
          ...video,
          width:{ideal:1920,max:1920},
          height:{ideal:1080,max:1080},
          frameRate:{ideal:30,min:24,max:30}
        },
        audio:{
          ...audio,
          channelCount:{ideal:1,max:1},
          echoCancellation:true,
          noiseSuppression:true
        }
      }
    }
    return nativeGetUserMedia(constraints)
  }
}

const NativeMediaRecorder=window.MediaRecorder;
if(typeof NativeMediaRecorder==="function"){
  const supports=type=>{try{return !!NativeMediaRecorder.isTypeSupported?.(type)}catch{return false}};
  function StableMediaRecorder(stream,options){
    const hasVideo=!!stream?.getVideoTracks?.().length,hasAudio=!!stream?.getAudioTracks?.().length;
    let opts=options?{...options}:{};
    if(hasVideo&&hasAudio){
      const hardwareType=[
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
        "video/mp4",
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ].find(supports);
      if(hardwareType)opts.mimeType=hardwareType;
      opts.videoBitsPerSecond=Math.max(6000000,Number(opts.videoBitsPerSecond)||0);
      opts.audioBitsPerSecond=Math.max(160000,Number(opts.audioBitsPerSecond)||0)
    }
    let recorder;
    try{recorder=new NativeMediaRecorder(stream,opts)}catch{recorder=new NativeMediaRecorder(stream,options)}
    if(hasVideo&&hasAudio){
      const nativeStart=recorder.start.bind(recorder);
      recorder.start=()=>nativeStart()
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