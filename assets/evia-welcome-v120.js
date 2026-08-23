(()=>{
"use strict";
const VERSION=120,STYLE_ID="evia-welcome-v120-style",SESSION_KEY="evia-welcome-dismissed-v120",NAME_KEY="evia-full-name";
let observer=null,queued=false,lateReacted=false;
function firstName(){const full=String(localStorage.getItem(NAME_KEY)||"").trim();return full?full.split(/\s+/)[0]:""}
function greeting(){const hour=new Date().getHours(),name=firstName(),tail=name?` ${name}`:"";if(hour>=4&&hour<8)return{late:false,text:`Good morning${tail}`};if(hour>=8&&hour<17)return{late:false,text:`Ready to get started${tail}`};if(hour>=17&&hour<22)return{late:false,text:`Good evening${tail}`};return{late:true,text:`Wow its late!, how's things${tail}?`}}
function dismissed(){try{return sessionStorage.getItem(SESSION_KEY)==="1"}catch{return false}}
function markDismissed(){try{sessionStorage.setItem(SESSION_KEY,"1")}catch{}}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .self-invite.evia-welcome-v120{width:min(23rem,calc(100% - 2rem));display:grid;gap:.2rem;text-align:center;white-space:normal!important;color:#66636a!important;pointer-events:none}
.selfobs .self-invite.evia-welcome-v120 strong{display:block;font:600 clamp(.78rem,2.7vw,.94rem)/1.28 -apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI Variable","Segoe UI",sans-serif;letter-spacing:-.018em;color:#3a393d}
.selfobs .self-invite.evia-welcome-v120 small{display:block;font:500 .5rem/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif;color:#9a989d}
.selfobs .self-invite.evia-welcome-v120.evia-welcome-simple-v120{display:block;width:auto;white-space:nowrap!important;font-size:.55rem;color:#9a989d!important}
@media(max-width:560px){.selfobs .self-invite.evia-welcome-v120{top:calc(40.5% + 6.15rem)}}
`;document.head.appendChild(s)}
function patch(){queued=false;ensureStyle();const invite=document.querySelector(".evia-app.selfobs .self-invite");if(!invite)return;invite.classList.add("evia-welcome-v120");if(dismissed()){if(invite.dataset.welcomeState!=="simple"){invite.dataset.welcomeState="simple";invite.classList.add("evia-welcome-simple-v120");invite.textContent="Tap me to get started"}return}const g=greeting(),key=`${g.text}|${g.late}`;if(invite.dataset.welcomeState!==key){invite.dataset.welcomeState=key;invite.classList.remove("evia-welcome-simple-v120");invite.innerHTML="";const strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=g.text;small.textContent="Tap me to get started";invite.append(strong,small)}if(g.late&&!lateReacted){lateReacted=true;setTimeout(()=>window.EviaAvatarLife?.react?.("attention"),180)}}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
function start(){ensureStyle();queue();const root=document.getElementById("root")||document.body;if(!observer){observer=new MutationObserver(queue);observer.observe(root,{subtree:true,childList:true})}document.addEventListener("click",e=>{if(!e.target.closest?.(".evia-anchor[data-evia]"))return;markDismissed();setTimeout(queue,0)},true);window.addEventListener("pageshow",queue);window.addEventListener("focus",queue)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.EviaWelcome=Object.freeze({version:VERSION,refresh:queue});
})();
