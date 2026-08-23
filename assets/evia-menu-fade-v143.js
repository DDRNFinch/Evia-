(()=>{
"use strict";
if(window.__eviaMenuFadeV143)return;window.__eviaMenuFadeV143=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"]';
const DURATION=115,EASE="cubic-bezier(.22,.72,.28,1)",START_OPACITY=.82;
let active=null;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function animateIncoming(){
  const panel=document.querySelector(".self-panel");
  if(!panel)return;
  try{active?.cancel?.()}catch{}
  if(typeof panel.animate==="function"){
    active=panel.animate([{opacity:START_OPACITY},{opacity:1}],{duration:DURATION,easing:EASE,fill:"none"});
    active.onfinish=()=>{active=null};active.oncancel=()=>{active=null};
  }
}
document.addEventListener("click",event=>{
  if(reduced())return;
  const button=event.target?.closest?.(selector);if(!button)return;
  const panel=button.closest?.(".self-panel");if(!panel||button.closest?.(".evia-stage-overlay-v132"))return;
  queueMicrotask(()=>requestAnimationFrame(animateIncoming));
},true);
window.EviaMenuFadeV143=Object.freeze({version:143,durationMs:DURATION,mode:"immediate-single-panel-fade"});
})();
