(()=>{
"use strict";
const FLAG="evia-export-download-started-v1";
let timer=null,currentButton=null,started=0,originalText="";
function stopTimer(){if(timer){clearTimeout(timer);timer=null}}
function resetButton(){if(currentButton?.isConnected){currentButton.textContent=originalText||"Sign & download";currentButton.style.removeProperty("min-width");currentButton.removeAttribute("aria-busy")}currentButton=null;originalText="";stopTimer()}
function begin(button){if(currentButton&&currentButton!==button)resetButton();if(currentButton===button)return;currentButton=button;started=Date.now();originalText=button.textContent.trim()||"Sign & download";const width=Math.ceil(button.getBoundingClientRect().width);if(width)button.style.minWidth=`${width}px`;button.setAttribute("aria-busy","true");button.textContent="Preparing evidence…";timer=setTimeout(()=>{if(currentButton===button&&button.isConnected){if(!button.disabled){resetButton();return}button.textContent="Still preparing…"}},9000)}
function markStarting(anchor){if(!String(anchor.download||"").startsWith("Evia-New-Evidence-"))return;try{sessionStorage.setItem(FLAG,String(Date.now()))}catch{}stopTimer();if(currentButton?.isConnected){currentButton.textContent="Download starting…";currentButton.setAttribute("aria-label","Evidence download starting")}}
function showComplete(){let stamp="";try{stamp=sessionStorage.getItem(FLAG)||"";sessionStorage.removeItem(FLAG)}catch{}if(!stamp)return;const banner=document.createElement("div");banner.className="evia-export-complete";banner.innerHTML="<b>Evidence download started</b><span>Check your phone's Downloads folder.</span>";document.body.appendChild(banner);requestAnimationFrame(()=>banner.classList.add("show"));setTimeout(()=>{banner.classList.remove("show");setTimeout(()=>banner.remove(),300)},3600)}
document.addEventListener("click",e=>{const button=e.target.closest?.("[data-sign-download]");if(button&&!button.disabled){begin(button);return}const anchor=e.target.closest?.("a[download]");if(anchor)markStarting(anchor)},true);
window.addEventListener("pagehide",stopTimer);window.addEventListener("load",showComplete);
window.EviaExportStatus=Object.freeze({version:133,reset:resetButton})
})();