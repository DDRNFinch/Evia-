(()=>{
"use strict";
const VERSION=197;
let queued=false;
function patch(){
  queued=false;
  const layer=document.querySelector(".evia-arp-layer");
  if(!layer)return;
  layer.querySelectorAll('[data-discussion-mode="learn"],[data-discussion-mode="practice"],[data-practical-mode="learn"],[data-practical-mode="guided"]').forEach(node=>node.remove());
  const discussion=layer.querySelector('[data-arp-option="discussion"]');
  if(discussion){
    const small=discussion.querySelector("small");
    if(small)small.textContent="24 course-specific scenarios · mock discussion";
    discussion.setAttribute("aria-label","Open Mock Discussion");
  }
  const practical=layer.querySelector('[data-arp-option="practical"]');
  if(practical){
    const small=practical.querySelector("small");
    if(small)small.textContent="12 course-specific tasks · mock practical";
    practical.setAttribute("aria-label","Open Mock Practical");
  }
}
function queue(){if(queued)return;queued=true;queueMicrotask(patch)}
function start(){
  patch();
  new MutationObserver(records=>{
    if(records.some(record=>record.target?.closest?.(".evia-arp-layer")||[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(".evia-arp-layer")||node.querySelector?.(".evia-arp-layer")))))queue();
  }).observe(document.body,{childList:true,subtree:true});
  document.addEventListener("click",event=>{
    if(event.target?.closest?.('[data-arp-option="discussion"],[data-arp-option="practical"],.progress-arch[data-arch="ARP"]'))setTimeout(patch,0);
  },true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArpMockOnly=Object.freeze({version:VERSION,patch});
})();
