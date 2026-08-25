(()=>{
"use strict";
const VERSION=201,STYLE_ID="evia-ksb-clean-v201-style";
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent='.selfobs .self-ksbs button[data-code]>span:not(.evia-ksb-marker-rail-v107){display:none!important}';
  document.head.appendChild(style);
}
function clean(){
  ensureStyle();
  document.querySelectorAll(".selfobs .self-ksbs button[data-code]").forEach(btn=>{
    [...btn.children].forEach(el=>{
      if(el.tagName==="SPAN"&&!el.classList.contains("evia-ksb-marker-rail-v107"))el.remove();
    });
  });
}
function schedule(){requestAnimationFrame(clean)}
function start(){
  ensureStyle();
  schedule();
  document.addEventListener("click",event=>{
    if(event.target?.closest?.('.progress-arch[data-arch="KSB"],.progress-arch[data-arch="AC"],[data-action="coverage"]'))setTimeout(schedule,0);
  },true);
  window.addEventListener("pageshow",schedule);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaKsbCleanV201=Object.freeze({version:VERSION,refresh:clean});
})();
