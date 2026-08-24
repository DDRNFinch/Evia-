(()=>{
"use strict";
const VERSION=154;
const LABELS={TOC:"Time",KSB:"Course",AC:"Course",OTJ:"Learn",GLH:"Learn",EPA:"Test",ARP:"Test",Units:"Test"};
let queued=false,observer=null;
function apply(){
  queued=false;
  const buttons=[...document.querySelectorAll(".progress-arch[data-arch]")];
  if(!buttons.length)return false;
  buttons.forEach(button=>{
    const label=LABELS[button.dataset.arch];
    if(!label)return;
    const el=button.querySelector(".arch-label");
    if(el&&el.textContent!==label)el.textContent=label;
    button.setAttribute("aria-label",`${label} ${button.querySelector(".arch-number")?.textContent||""}`.trim());
  });
  return true
}
function stopObserver(){observer?.disconnect?.();observer=null}
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{if(apply())stopObserver()})
}
function start(){
  window.addEventListener("pageshow",schedule);
  if(apply())return;
  const root=document.getElementById("root")||document.documentElement;
  observer=new MutationObserver(schedule);
  observer.observe(root,{subtree:true,childList:true})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArchLabels=Object.freeze({version:VERSION,refresh:apply});
})();
