(()=>{
"use strict";
if(window.__eviaMenuFadeV141)return;window.__eviaMenuFadeV141=true;
const selector='[data-cat],[data-job],[data-opp],[data-tab],[data-action="back"],[data-action="evidence"],[data-action="coverage"],[data-action="home"],[data-action="submit"],[data-action="finish"]';
let busy=false;
const DURATION=135;
const EASING="cubic-bezier(.22,1,.36,1)";
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
function stripInteractive(node){
  if(node.nodeType!==1)return;
  node.removeAttribute("id");
  for(const attr of [...node.attributes])if(attr.name.startsWith("data-"))node.removeAttribute(attr.name);
  node.setAttribute("aria-hidden","true");
  for(const child of node.children)stripInteractive(child)
}
function makeGhost(panel){
  const rect=panel.getBoundingClientRect(),ghost=panel.cloneNode(true),host=document.querySelector(".evia-app.selfobs")||document.body;
  stripInteractive(ghost);ghost.classList.add("evia-menu-crossfade-ghost-v141");
  Object.assign(ghost.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",zIndex:"9999",pointerEvents:"none",overflow:"hidden",opacity:"1",transform:"none"});
  host.appendChild(ghost);return ghost
}
function animate(el,frames,options,done){
  if(!el){done?.();return}
  if(typeof el.animate==="function"){
    const a=el.animate(frames,options);a.onfinish=()=>done?.();a.oncancel=()=>done?.();return
  }
  el.style.transition=`opacity ${DURATION}ms ${EASING}`;el.style.opacity=String(frames.at(-1).opacity);setTimeout(()=>done?.(),DURATION+20)
}
function finish(panel,ghost){
  panel.style.removeProperty("opacity");panel.style.removeProperty("pointer-events");panel.style.removeProperty("will-change");ghost?.remove();busy=false
}
document.addEventListener("click",event=>{
  if(busy||reduced())return;
  const button=event.target?.closest?.(selector);if(!button)return;
  const panel=button.closest?.(".self-panel");if(!panel||button.closest?.(".evia-stage-overlay-v132"))return;
  busy=true;
  const ghost=makeGhost(panel);
  panel.style.opacity="0";panel.style.pointerEvents="none";panel.style.willChange="opacity";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const incoming=document.querySelector(".evia-stage-overlay-v132")||panel;
    incoming.style.opacity="0";incoming.style.willChange="opacity";
    animate(ghost,[{opacity:1},{opacity:0}],{duration:DURATION,easing:EASING,fill:"forwards"});
    animate(incoming,[{opacity:0},{opacity:1}],{duration:DURATION,easing:EASING,fill:"forwards"},()=>{
      incoming.style.removeProperty("opacity");incoming.style.removeProperty("will-change");finish(panel,ghost)
    })
  }))
},true);
window.EviaMenuFadeV141=Object.freeze({version:141,durationMs:DURATION,mode:"crossfade"});
})();
