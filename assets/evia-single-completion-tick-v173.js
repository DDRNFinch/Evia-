(()=>{
"use strict";
const VERSION=173;
let queued=false;
function cleanSide(side){
  if(!side)return;
  const progress=side.querySelector(":scope > .evia-section-progress-v175");
  const directTicks=[...side.children].filter(el=>el.tagName==="B"&&el.textContent.trim()==="✓");
  if(progress){
    directTicks.forEach(el=>el.remove());
    return;
  }
  if(directTicks.length<=1)return;
  const keep=directTicks.find(el=>el.classList.contains("evia-learner-source-v107")||el.classList.contains("evia-evidence-check"))||directTicks[0];
  directTicks.forEach(el=>{if(el!==keep)el.remove()});
}
function clean(){
  queued=false;
  document.querySelectorAll(".selfobs .option-row .self-side").forEach(cleanSide);
}
function queue(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(clean);
}
function start(){
  queue();
  const root=document.getElementById("root")||document.body;
  new MutationObserver(queue).observe(root,{subtree:true,childList:true,characterData:true});
  document.addEventListener("click",()=>setTimeout(queue,0),true);
  window.addEventListener("evia:evidence-saved",queue);
  window.addEventListener("pageshow",queue);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaSingleCompletionTick=Object.freeze({version:VERSION,refresh:queue});
})();
