(()=>{
"use strict";
if(window.__eviaMenuFadeV144)return;window.__eviaMenuFadeV144=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"],[data-code]';
const OUT_MS=90,IN_MS=170,OUT_TO=.18;
const OUT_EASE="cubic-bezier(.4,0,1,1)",IN_EASE="cubic-bezier(.16,1,.3,1)";
let outAnim=null,inAnim=null,pendingPanel=null,fallbackTimer=null;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function clearTimer(){if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=null}}
function clean(panel){if(!panel)return;panel.style.removeProperty("opacity");panel.style.removeProperty("will-change");panel.style.removeProperty("transition")}
function cancel(anim){try{anim?.cancel?.()}catch{}}
function fadeIn(panel){
  if(!panel||pendingPanel!==panel)return;
  clearTimer();cancel(outAnim);cancel(inAnim);outAnim=null;pendingPanel=null;
  let start=parseFloat(getComputedStyle(panel).opacity);if(!Number.isFinite(start))start=OUT_TO;start=Math.max(.12,Math.min(.35,start));
  panel.style.opacity=String(start);panel.style.willChange="opacity";
  if(typeof panel.animate==="function"){
    inAnim=panel.animate([{opacity:start},{opacity:1}],{duration:IN_MS,easing:IN_EASE,fill:"forwards"});
    const done=()=>{clean(panel);inAnim=null};inAnim.onfinish=done;inAnim.oncancel=done;
  }else{
    panel.style.transition=`opacity ${IN_MS}ms ${IN_EASE}`;requestAnimationFrame(()=>panel.style.opacity="1");setTimeout(()=>clean(panel),IN_MS+30)
  }
}
function fadeOut(panel){
  if(!panel)return;clearTimer();cancel(outAnim);cancel(inAnim);inAnim=null;pendingPanel=panel;panel.style.willChange="opacity";
  if(typeof panel.animate==="function")outAnim=panel.animate([{opacity:1},{opacity:OUT_TO}],{duration:OUT_MS,easing:OUT_EASE,fill:"forwards"});
  else{panel.style.transition=`opacity ${OUT_MS}ms ${OUT_EASE}`;panel.style.opacity=String(OUT_TO)}
  fallbackTimer=setTimeout(()=>fadeIn(panel),280)
}
function targetPanel(target){
  const button=target?.closest?.(selector);if(!button||button.closest?.(".evia-stage-overlay-v132"))return null;
  return button.closest?.(".self-panel")||null
}
document.addEventListener("pointerdown",event=>{if(reduced())return;const panel=targetPanel(event.target);if(panel)fadeOut(panel)},{capture:true,passive:true});
document.addEventListener("keydown",event=>{if(reduced()||!(event.key==="Enter"||event.key===" "))return;const panel=targetPanel(event.target);if(panel)fadeOut(panel)},true);
const observer=new MutationObserver(records=>{
  const panel=pendingPanel;if(!panel)return;
  for(const record of records){if(record.type==="childList"&&(record.target===panel||panel.contains(record.target))){requestAnimationFrame(()=>fadeIn(panel));return}}
});
function start(){const panel=document.querySelector(".self-panel");if(panel)observer.observe(panel,{childList:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaMenuFadeV144=Object.freeze({version:144,outMs:OUT_MS,inMs:IN_MS,mode:"pointer-fade-out-render-fade-in"});
})();
