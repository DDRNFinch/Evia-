(()=>{
"use strict";
const VERSION=154;
const LABELS={TOC:"Time",KSB:"Course",AC:"Course",OTJ:"Learn",GLH:"Learn",EPA:"Test",ARP:"Test",Units:"Test"};
let queued=false;
function apply(){
  queued=false;
  document.querySelectorAll(".progress-arch[data-arch]").forEach(button=>{
    const label=LABELS[button.dataset.arch];
    if(!label)return;
    const el=button.querySelector(".arch-label");
    if(el&&el.textContent!==label)el.textContent=label;
    button.setAttribute("aria-label",`${label} ${button.querySelector(".arch-number")?.textContent||""}`.trim());
  })
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}
const observer=new MutationObserver(records=>{
  if(records.some(r=>r.type==="childList"||r.type==="attributes"||r.type==="characterData"))schedule()
});
function start(){apply();observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["data-arch"],characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArchLabels=Object.freeze({version:VERSION,refresh:apply});
})();
