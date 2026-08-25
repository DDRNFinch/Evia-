(()=>{
"use strict";
const VERSION=195;
let observer=null,queued=false,timers=[];
function rowsReady(){const layer=document.querySelector(".evia-arp-layer");return !!(layer?.querySelector('[data-fs194-subject="maths"]')&&layer?.querySelector('[data-fs194-subject="english"]'))}
function refresh(){queued=false;const layer=document.querySelector(".evia-arp-layer");if(!layer)return false;const practical=layer.querySelector('[data-arp-option="practical"]');if(!practical)return false;window.EviaFunctionalSkills?.refresh?.();return rowsReady()}
function queue(){if(queued)return;queued=true;queueMicrotask(refresh)}
function retry(){timers.forEach(clearTimeout);timers=[0,30,80,160,320,650].map(ms=>setTimeout(()=>{if(refresh())timers.forEach(clearTimeout)},ms))}
function relevant(records){return records.some(record=>{const target=record.target?.nodeType===1?record.target:record.target?.parentElement;if(target?.closest?.(".evia-arp-layer"))return true;return [...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.evia-arp-layer,[data-arp-option="practical"]')||node.querySelector?.('.evia-arp-layer,[data-arp-option="practical"]')))})}
function start(){queue();retry();observer?.disconnect();observer=new MutationObserver(records=>{if(relevant(records))queue()});observer.observe(document.body,{childList:true,subtree:true});document.addEventListener("click",event=>{if(event.target?.closest?.('.progress-arch[data-arch="ARP"],.progress-arch[data-arch="EPA"],.progress-arch[data-arch="Q&A"],.progress-arch[data-arch="Units"]'))retry()},true);window.addEventListener("pageshow",retry);window.addEventListener("focus",retry)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaFunctionalSkillsPlacement=Object.freeze({version:VERSION,refresh,retry});
})();