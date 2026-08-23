(()=>{
"use strict";
const VERSION=119;
let queued=false,observer=null;
function refresh(){
  queued=false;
  window.EviaArpIntegrity?.refresh?.()
}
function queue(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(refresh)
}
function relevant(records){
  return records.some(record=>{
    const target=record.target instanceof Element?record.target:record.target?.parentElement;
    if(target?.closest?.(".evia-arp-layer"))return true;
    return [...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(".evia-arp-layer")||node.querySelector?.(".evia-arp-layer")))
  })
}
function start(){
  queue();
  if(observer)return;
  observer=new MutationObserver(records=>{if(relevant(records))queue()});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArpIntegrityWatch=Object.freeze({version:VERSION,refresh:queue});
})();