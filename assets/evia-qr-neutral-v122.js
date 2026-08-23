(()=>{
"use strict";
const VERSION=122,STYLE_ID="evia-qr-neutral-v122-style",CLASS="evia-qrx-neutral-v122";
let observer=null;
const app=()=>document.querySelector(".evia-app.selfobs");
const anchor=()=>app()?.querySelector(".evia-anchor[data-evia]");
function clearGaze(){
  const a=anchor();if(!a)return;
  [...a.classList].filter(c=>c.startsWith("evia-life-look-")).forEach(c=>a.classList.remove(c));
  a.classList.remove("evia-life-blink");
}
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs.${CLASS} .evia-anchor .evia-eyes{transform:none!important}
.selfobs.${CLASS} .evia-anchor .evia-eye{translate:0 0!important}
`;
  document.head.appendChild(s)
}
function prepare(){
  ensureStyle();const root=app();if(root)root.classList.add(CLASS);clearGaze()
}
function sync(){
  ensureStyle();
  const root=app();if(!root)return;
  const qr=!!document.querySelector(".evia-qrx-layer");
  root.classList.toggle(CLASS,qr);
  if(qr)clearGaze()
}
function start(){
  ensureStyle();
  window.addEventListener("click",e=>{
    if(!e.target.closest?.("[data-evia-share-qr],[data-evia-receive-qr]"))return;
    prepare();requestAnimationFrame(sync)
  },true);
  observer=new MutationObserver(sync);observer.observe(document.body,{subtree:true,childList:true});
  sync()
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaQrNeutral=Object.freeze({version:VERSION,prepare,refresh:sync});
})();
