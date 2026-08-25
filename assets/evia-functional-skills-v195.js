(()=>{
"use strict";
const VERSION=201;
let queued=false,timers=[];
function rowsReady(){const layer=document.querySelector(".evia-arp-layer");return !!(layer?.querySelector('[data-fs194-subject="maths"]')&&layer?.querySelector('[data-fs194-subject="english"]'))}
function refresh(){queued=false;const layer=document.querySelector(".evia-arp-layer");if(!layer)return false;const practical=layer.querySelector('[data-arp-option="practical"]');if(!practical)return false;window.EviaFunctionalSkills?.refresh?.();return rowsReady()}
function queue(){if(queued)return;queued=true;queueMicrotask(refresh)}
function retry(){timers.forEach(clearTimeout);timers=[0,30,80,160,320,650].map(ms=>setTimeout(()=>{if(refresh())timers.forEach(clearTimeout)},ms))}
function start(){
  queue();
  document.addEventListener("click",event=>{
    if(event.target?.closest?.('.progress-arch[data-arch="ARP"],.progress-arch[data-arch="EPA"],.progress-arch[data-arch="Q&A"],.progress-arch[data-arch="Units"]'))retry()
  },true);
  window.addEventListener("pageshow",()=>{if(document.querySelector(".evia-arp-layer"))retry()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaFunctionalSkillsPlacement=Object.freeze({version:VERSION,refresh,retry});
})();
