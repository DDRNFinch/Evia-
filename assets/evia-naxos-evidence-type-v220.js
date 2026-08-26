(()=>{
"use strict";
const VERSION=220;
function siteData(){const a=window.EviaCoursePacks?.active?.();return Array.isArray(a?.pathway?.siteData)?a.pathway.siteData:Array.isArray(a?.pack?.siteData)?a.pack.siteData:[]}
function findOpp(id){for(const cat of siteData())for(const job of cat?.jobs||[])for(const opp of job?.opps||[])if(String(opp?.id)===String(id))return opp;return null}
function clearStageOverlay(){
  try{localStorage.removeItem("evia-stage-route-v133")}catch{}
  document.querySelector(".evia-stage-overlay-v132")?.remove();
  document.querySelector(".menu-stage")?.classList.remove("evia-stage-managed-v132")
}
function route(type){
  if(type==="photo"){const b=document.querySelector(".evia-stage-overlay-v132 [data-stage-photo]");if(b&&!b.disabled)b.click();return}
  if(type==="video"){const b=document.querySelector(".evia-stage-overlay-v132 [data-stage-video]");if(b&&!b.disabled)b.click();return}
  if(type==="audio"){
    clearStageOverlay();
    const talk=document.querySelector(".self-panel [data-mode='talk']");if(talk&&!talk.disabled)talk.click()
  }
}
function schedule(type,tries=0){setTimeout(()=>{if(type==="audio"){route(type);return}const selector=type==="video"?"[data-stage-video]":"[data-stage-photo]";if(document.querySelector(`.evia-stage-overlay-v132 ${selector}`))route(type);else if(tries<8)schedule(type,tries+1)},tries?35:0)}
document.addEventListener("click",event=>{
  const button=event.target?.closest?.("[data-opp]");if(!button)return;
  const opp=findOpp(button.dataset.opp),type=String(opp?.evidenceType||"").toLowerCase();
  if(type!=="photo"&&type!=="video"&&type!=="audio")return;
  schedule(type)
},true);
window.EviaNaxosEvidenceType=Object.freeze({version:VERSION,findOpp});
})();
