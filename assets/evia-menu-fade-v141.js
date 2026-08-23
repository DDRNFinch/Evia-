(()=>{
"use strict";
if(window.__eviaMenuFadeV141)return;window.__eviaMenuFadeV141=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"]';
const OUT_MS=55,IN_MS=115,EASE="cubic-bezier(.22,.72,.28,1)";
let bypass=false,busy=false;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function clean(el){if(!el)return;el.style.removeProperty("opacity");el.style.removeProperty("transition");el.style.removeProperty("pointer-events");el.style.removeProperty("will-change")}
function fadeIn(el){if(!el){busy=false;return}el.style.opacity="0";el.style.pointerEvents="none";el.style.willChange="opacity";el.style.transition="none";requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition=`opacity ${IN_MS}ms ${EASE}`;el.style.opacity="1";setTimeout(()=>{clean(el);busy=false},IN_MS+20)}))}
document.addEventListener("click",event=>{
  if(bypass||busy||reduced())return;
  const button=event.target?.closest?.(selector);if(!button)return;
  const panel=button.closest?.(".self-panel");if(!panel||button.closest?.(".evia-stage-overlay-v132"))return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();busy=true;
  panel.style.pointerEvents="none";panel.style.willChange="opacity";panel.style.transition=`opacity ${OUT_MS}ms ${EASE}`;panel.style.opacity="0";
  setTimeout(()=>{
    bypass=true;try{button.click()}finally{bypass=false}
    const incoming=document.querySelector(".evia-stage-overlay-v132")||document.querySelector(".self-panel");
    clean(panel);fadeIn(incoming)
  },OUT_MS)
},true);
window.EviaMenuFadeV141=Object.freeze({version:141,outMs:OUT_MS,inMs:IN_MS});
})();
