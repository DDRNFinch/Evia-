(()=>{
"use strict";
const VERSION=230,STYLE_ID="evia-avatar-life-v230-style";
let idleTimer=null,clearTimer=null,scanTimer=null;
const LOOK_CLASSES=["evia-v230-look-left","evia-v230-look-right","evia-v230-look-up","evia-v230-look-down","evia-v230-curious-left","evia-v230-curious-right"];
const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const anchor=()=>document.querySelector(".evia-app.selfobs .evia-anchor[data-evia]");
const app=()=>document.querySelector(".evia-app.selfobs");
function visible(){const a=anchor(),root=app();return !!(a&&root&&!document.hidden&&!document.querySelector(".evia-qrx-layer,.evia-profile-v113,.evia-profile-v114")&&!root.classList.contains("evia-exchange-open"))}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .evia-anchor .evia-eye{transition:translate .24s cubic-bezier(.22,1,.36,1),scale .11s ease,border-color .25s ease,border-radius .25s ease,opacity .3s ease!important;will-change:translate}
.selfobs .evia-anchor.evia-v230-look-left .evia-eye{translate:-3.1px 0!important}
.selfobs .evia-anchor.evia-v230-look-right .evia-eye{translate:3.1px 0!important}
.selfobs .evia-anchor.evia-v230-look-up .evia-eye{translate:0 -2.7px!important}
.selfobs .evia-anchor.evia-v230-look-down .evia-eye{translate:0 2.25px!important}
.selfobs .evia-anchor.evia-v230-curious-left .evia-eye{translate:-2.45px -1.55px!important}
.selfobs .evia-anchor.evia-v230-curious-right .evia-eye{translate:2.45px -1.55px!important}
.selfobs .evia-anchor.evia-v230-curious-left .evia-face{rotate:-2.2deg!important}
.selfobs .evia-anchor.evia-v230-curious-right .evia-face{rotate:2.2deg!important}
@media(prefers-reduced-motion:reduce){.selfobs .evia-anchor .evia-eye{transition:none!important;translate:0 0!important}.selfobs .evia-anchor .evia-face{rotate:0deg!important}}
`;document.head.appendChild(s)}
function later(fn,min,max){return setTimeout(fn,Math.round(min+Math.random()*(max-min)))}
function clearLook(a=anchor()){clearTimeout(clearTimer);clearTimeout(scanTimer);scanTimer=null;if(!a)return;LOOK_CLASSES.forEach(c=>a.classList.remove(c))}
function setLook(cls,duration=760){if(reduced()||!visible())return;const a=anchor();if(!a)return;clearLook(a);a.classList.add(cls);clearTimer=setTimeout(()=>{a.classList.remove(cls)},duration)}
function scan(){if(reduced()||!visible())return;const a=anchor();if(!a)return;clearLook(a);a.classList.add("evia-v230-look-left");scanTimer=setTimeout(()=>{if(!visible())return clearLook(a);a.classList.remove("evia-v230-look-left");a.classList.add("evia-v230-look-right");scanTimer=setTimeout(()=>{a.classList.remove("evia-v230-look-right")},520)},520)}
function idleMove(){if(reduced()||!visible()){schedule();return}const r=Math.random();if(r<.23)setLook("evia-v230-look-left",650+Math.random()*240);else if(r<.46)setLook("evia-v230-look-right",650+Math.random()*240);else if(r<.61)setLook("evia-v230-look-up",700+Math.random()*260);else if(r<.71)setLook("evia-v230-look-down",560+Math.random()*220);else if(r<.84)setLook("evia-v230-curious-left",800+Math.random()*260);else if(r<.97)setLook("evia-v230-curious-right",800+Math.random()*260);else scan();schedule()}
function schedule(){clearTimeout(idleTimer);idleTimer=later(idleMove,4700,9200)}
function lookTowardPoint(x,y){if(reduced()||!visible())return;const a=anchor();if(!a)return;const rect=a.getBoundingClientRect();const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;const dx=x-cx,dy=y-cy;if(Math.abs(dx)<45&&Math.abs(dy)<45)return;let cls;if(Math.abs(dx)>Math.abs(dy)*1.25)cls=dx<0?"evia-v230-look-left":"evia-v230-look-right";else if(dy<-8)cls=dx<0?"evia-v230-curious-left":"evia-v230-curious-right";else cls="evia-v230-look-down";setLook(cls,520);schedule()}
function onPointer(e){const target=e.target?.closest?.("button,.option-row,.self-panel,[role='button']");if(!target||target.closest?.(".evia-anchor[data-evia]"))return;lookTowardPoint(e.clientX,e.clientY)}
function onAvatarTap(e){if(!e.target.closest?.(".evia-anchor[data-evia]"))return;setLook(Math.random()<.5?"evia-v230-curious-left":"evia-v230-curious-right",620);schedule()}
function resume(){clearLook();schedule()}
function start(){ensureStyle();resume();document.addEventListener("pointerdown",onPointer,{passive:true,capture:true});document.addEventListener("pointerdown",onAvatarTap,{passive:true,capture:true})}
window.addEventListener("pageshow",resume);window.addEventListener("focus",resume);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")resume();else clearLook()});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.EviaAvatarMotionV230=Object.freeze({version:VERSION,look:setLook,scan,resume});
})();
