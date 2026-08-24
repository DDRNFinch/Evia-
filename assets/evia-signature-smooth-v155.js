(()=>{
"use strict";
const VERSION=155;
function install(canvas){
  if(!canvas||canvas.dataset.eviaSignatureSmooth==="1")return;
  canvas.dataset.eviaSignatureSmooth="1";
  canvas.style.touchAction="none";
  const modal=canvas.closest(".evia-nvq-pack-sign-v150"),input=modal?.querySelector("#eviaNvqSignerName"),button=modal?.querySelector("[data-nvq-pack-download]"),g=canvas.getContext("2d");
  if(!modal||!input||!button||!g)return;
  let drawing=false,pointerId=null,last=null,mid=null,signed=false;
  function setup(){
    const r=canvas.getBoundingClientRect(),d=Math.max(1,window.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));
    if(!signed&&(canvas.width!==w||canvas.height!==h)){canvas.width=w;canvas.height=h}
    g.setTransform(d,0,0,d,0,0);g.lineWidth=2.2;g.lineCap="round";g.lineJoin="round";g.strokeStyle="#222";g.imageSmoothingEnabled=true
  }
  function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  function drawPoint(p){
    if(!last){last=p;mid=p;return}
    const nextMid={x:(last.x+p.x)/2,y:(last.y+p.y)/2};
    g.beginPath();g.moveTo(mid.x,mid.y);g.quadraticCurveTo(last.x,last.y,nextMid.x,nextMid.y);g.stroke();
    mid=nextMid;last=p
  }
  function updateButton(){button.disabled=!(signed&&input.value.trim())}
  function down(e){
    if(e.pointerType==="mouse"&&e.button!==0)return;
    e.preventDefault();e.stopImmediatePropagation();setup();drawing=true;pointerId=e.pointerId;last=mid=null;canvas.setPointerCapture?.(e.pointerId);drawPoint(point(e));signed=true;updateButton()
  }
  function move(e){
    if(!drawing||e.pointerId!==pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();const events=typeof e.getCoalescedEvents==="function"?e.getCoalescedEvents():null,points=events?.length?events:[e];for(const item of points)drawPoint(point(item))
  }
  function end(e){
    if(!drawing||e.pointerId!==pointerId)return;
    e.preventDefault();e.stopImmediatePropagation();drawPoint(point(e));drawing=false;pointerId=null;last=mid=null;updateButton()
  }
  setup();
  canvas.addEventListener("pointerdown",down,true);canvas.addEventListener("pointermove",move,true);canvas.addEventListener("pointerup",end,true);canvas.addEventListener("pointercancel",end,true);
  input.addEventListener("input",updateButton);
}
function scan(root=document){root.querySelectorAll?.(".evia-nvq-pack-sign-v150 canvas.evia-sign-pad").forEach(install)}
const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1){if(node.matches?.(".evia-nvq-pack-sign-v150,.evia-nvq-pack-sign-v150 canvas.evia-sign-pad"))scan(node.matches?.("canvas.evia-sign-pad")?node.parentElement:node);else scan(node)}});
function start(){scan();observer.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaSignatureSmooth=Object.freeze({version:VERSION,refresh:scan});
})();
