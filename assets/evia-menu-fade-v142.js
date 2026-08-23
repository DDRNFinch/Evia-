(()=>{
"use strict";
if(window.__eviaMenuFadeV142)return;window.__eviaMenuFadeV142=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"]';
const DURATION=130,EASE="cubic-bezier(.22,.72,.28,1)";
let busy=false;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function clean(el){if(!el)return;el.style.removeProperty("opacity");el.style.removeProperty("transition");el.style.removeProperty("pointer-events");el.style.removeProperty("will-change")}
function stripInteractive(node){if(!node||node.nodeType!==1)return;node.removeAttribute("id");for(const attr of [...node.attributes])if(attr.name.startsWith("data-"))node.removeAttribute(attr.name);node.setAttribute("aria-hidden","true");for(const child of node.children)stripInteractive(child)}
function ghostOf(panel){const rect=panel.getBoundingClientRect(),ghost=panel.cloneNode(true);stripInteractive(ghost);Object.assign(ghost.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",opacity:"1",pointerEvents:"none",overflow:"hidden",zIndex:"2147482000",willChange:"opacity"});document.body.appendChild(ghost);return ghost}
function animateOpacity(el,from,to,done){if(!el){done?.();return}if(typeof el.animate==="function"){const a=el.animate([{opacity:from},{opacity:to}],{duration:DURATION,easing:EASE,fill:"forwards"});a.onfinish=()=>done?.();a.oncancel=()=>done?.();return}el.style.opacity=String(from);el.style.transition=`opacity ${DURATION}ms ${EASE}`;requestAnimationFrame(()=>{el.style.opacity=String(to)});setTimeout(()=>done?.(),DURATION+20)}
document.addEventListener("click",event=>{
  if(busy||reduced())return;
  const button=event.target?.closest?.(selector);if(!button)return;
  const panel=button.closest?.(".self-panel");if(!panel||button.closest?.(".evia-stage-overlay-v132"))return;
  busy=true;
  const ghost=ghostOf(panel);
  panel.style.opacity="0";panel.style.pointerEvents="none";panel.style.willChange="opacity";
  requestAnimationFrame(()=>{
    const incoming=document.querySelector(".evia-stage-overlay-v132")||document.querySelector(".self-panel");
    if(!incoming){ghost.remove();clean(panel);busy=false;return}
    incoming.style.opacity="0";incoming.style.pointerEvents="none";incoming.style.willChange="opacity";
    requestAnimationFrame(()=>{
      animateOpacity(ghost,1,0);
      animateOpacity(incoming,0,1,()=>{clean(incoming);if(panel!==incoming)clean(panel);ghost.remove();busy=false})
    })
  })
},true);
window.EviaMenuFadeV142=Object.freeze({version:142,durationMs:DURATION,mode:"immediate-crossfade"});
})();
