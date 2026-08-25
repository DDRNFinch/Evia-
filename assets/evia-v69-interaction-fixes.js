(()=>{
"use strict";
const VERSION=73,STYLE_ID="evia-v73-interaction-fixes-style";
const LEGACY_LOOK=[
  "evia-team-look-milos","evia-team-look-tinos","evia-team-look-symi","evia-team-look-center",
  "evia-v72-gazing","evia-v72-look-milos","evia-v72-look-tinos","evia-v72-look-symi","evia-v72-look-center"
];
let strokeTimer=null;
let frozenChoices=[],freezeTimer=null;
function ensureStyles(){
  document.getElementById("evia-v72-interaction-fixes-style")?.remove();
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
/* Prevent Android/Google text selection popups on the app chrome and controls. */
.evia-app.selfobs,.evia-app.selfobs *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}
.evia-app.selfobs input,.evia-app.selfobs textarea,.evia-app.selfobs select,.evia-app.selfobs [contenteditable="true"],.evia-app.selfobs [contenteditable=""]{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}
/* Legacy gaze classes are neutral only; there is no gaze animation. */
.selfobs.evia-team-look-milos [data-evia] .evia-face,.selfobs.evia-team-look-tinos [data-evia] .evia-face,.selfobs.evia-team-look-symi [data-evia] .evia-face,.selfobs.evia-team-look-center [data-evia] .evia-face,.selfobs.evia-v72-gazing [data-evia] .evia-face,.selfobs.evia-v72-look-milos [data-evia] .evia-face,.selfobs.evia-v72-look-tinos [data-evia] .evia-face,.selfobs.evia-v72-look-symi [data-evia] .evia-face,.selfobs.evia-v72-look-center [data-evia] .evia-face{translate:0 0!important;rotate:0deg!important}
.selfobs.evia-team-look-milos [data-evia] .evia-eyes,.selfobs.evia-team-look-tinos [data-evia] .evia-eyes,.selfobs.evia-team-look-symi [data-evia] .evia-eyes,.selfobs.evia-team-look-center [data-evia] .evia-eyes,.selfobs.evia-v72-gazing [data-evia] .evia-eyes,.selfobs.evia-v72-look-milos [data-evia] .evia-eyes,.selfobs.evia-v72-look-tinos [data-evia] .evia-eyes,.selfobs.evia-v72-look-symi [data-evia] .evia-eyes,.selfobs.evia-v72-look-center [data-evia] .evia-eyes{transform:none!important;translate:0 0!important;transition:none!important}
`;
  document.head.appendChild(s)
}
function app(){return document.querySelector(".evia-app.selfobs")}
function editableTarget(t){return !!t?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]')}
function resetEviaStroke(){document.querySelectorAll(".evia-anchor[data-evia]").forEach(b=>b.style.removeProperty("--evia-stroke"))}
function clearLegacyLook(){const a=app();if(!a)return;LEGACY_LOOK.forEach(c=>a.classList.remove(c))}
function clearFrozenChoices(){
  clearTimeout(freezeTimer);freezeTimer=null;
  for(const item of frozenChoices){
    const el=item.el;if(!el?.isConnected)continue;
    el.style.removeProperty("transform");el.style.removeProperty("opacity");el.style.removeProperty("transition");el.style.removeProperty("pointer-events")
  }
  frozenChoices=[]
}
function freezeAssistantPositions(){
  clearFrozenChoices();const a=app();if(!a)return;
  frozenChoices=[...a.querySelectorAll(".evia-team-choice")].map(el=>{const cs=getComputedStyle(el);return{el,transform:cs.transform,opacity:cs.opacity}});
  for(const item of frozenChoices){item.el.style.setProperty("transition","none","important");item.el.style.setProperty("transform",item.transform==="none"?"none":item.transform,"important");item.el.style.setProperty("opacity",item.opacity,"important");item.el.style.setProperty("pointer-events","auto","important")}
  freezeTimer=setTimeout(clearFrozenChoices,1000)
}
function fadeFrozenChoices(){
  if(!frozenChoices.length)return;
  requestAnimationFrame(()=>{for(const item of frozenChoices){if(!item.el?.isConnected)continue;item.el.style.setProperty("transition","opacity .22s ease","important");item.el.style.setProperty("opacity","0","important");item.el.style.setProperty("pointer-events","none","important")}});
  clearTimeout(freezeTimer);freezeTimer=setTimeout(clearFrozenChoices,760)
}
document.addEventListener("pointerup",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest("[data-evia-team]")){freezeAssistantPositions();return}
  if(t.closest(".evia-anchor[data-evia]")){clearTimeout(strokeTimer);strokeTimer=setTimeout(resetEviaStroke,1120)}
},true);
document.addEventListener("pointercancel",e=>{const t=e.target instanceof Element?e.target:null;if(t?.closest("[data-evia-team]"))clearFrozenChoices()},true);
document.addEventListener("click",e=>{const t=e.target instanceof Element?e.target:null;if(t?.closest("[data-evia-team]"))fadeFrozenChoices()},true);
document.addEventListener("selectstart",e=>{const t=e.target instanceof Element?e.target:null;if(t?.closest(".evia-app.selfobs")&&!editableTarget(t))e.preventDefault()},true);
document.addEventListener("contextmenu",e=>{const t=e.target instanceof Element?e.target:null;if(t?.closest(".evia-app.selfobs")&&!editableTarget(t))e.preventDefault()},true);
function start(){ensureStyles();clearLegacyLook()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.addEventListener("pageshow",()=>{resetEviaStroke();clearFrozenChoices();clearLegacyLook()});
window.EviaInteractionFixes=Object.freeze({version:VERSION});
})();