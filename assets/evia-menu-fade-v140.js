(()=>{
"use strict";
if(window.__eviaMenuFadeV140)return;window.__eviaMenuFadeV140=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"]';
let bypass=false,busy=false;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function clearInline(el){if(!el)return;el.style.removeProperty("opacity");el.style.removeProperty("transition");el.style.removeProperty("pointer-events")}
function fadeIn(el){if(!el){busy=false;return}el.style.opacity="0";el.style.pointerEvents="none";el.style.transition="none";void el.offsetWidth;el.style.transition="opacity 170ms ease";requestAnimationFrame(()=>{el.style.opacity="1"});setTimeout(()=>{clearInline(el);busy=false},190)}
document.addEventListener("click",event=>{
  if(bypass||busy||reduced())return;
  const button=event.target?.closest?.(selector);if(!button)return;
  const panel=button.closest?.(".self-panel");if(!panel||button.closest?.(".evia-stage-overlay-v132"))return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();busy=true;
  panel.style.pointerEvents="none";panel.style.transition="opacity 95ms ease";panel.style.opacity="0";
  setTimeout(()=>{
    bypass=true;try{button.click()}finally{bypass=false}
    const incoming=document.querySelector(".evia-stage-overlay-v132")||document.querySelector(".self-panel");
    clearInline(panel);fadeIn(incoming)
  },95)
},true);
window.EviaMenuFadeV140=Object.freeze({version:140});
})();
