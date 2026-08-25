(()=>{
"use strict";
const FLAG="evia-export-download-started-v1",STYLE_ID="evia-export-progress-v205-style";
let timer=null,currentButton=null,started=0,originalText="",progressLayer=null;
function stopTimer(){if(timer){clearTimeout(timer);timer=null}}
function ensureProgressStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");
  s.id=STYLE_ID;
  s.textContent=`.evia-export-progress-layer-v205{position:fixed;inset:0;z-index:12050;display:grid;place-items:center;background:rgba(250,249,246,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.evia-export-progress-card-v205{display:grid;place-items:center;gap:.8rem;min-width:12rem;padding:1.5rem 1.7rem;border:1px solid rgba(255,255,255,.95);border-radius:1.5rem;background:rgba(255,255,255,.94);box-shadow:0 18px 48px rgba(76,61,15,.12);color:#34322c;text-align:center}.evia-export-progress-ring-v205{position:relative;width:5.4rem;height:5.4rem;border-radius:50%;display:grid;place-items:center;background:rgba(239,195,61,.16)}.evia-export-progress-ring-v205::before{content:"";position:absolute;inset:.48rem;border-radius:50%;background:#fff}.evia-export-progress-ring-v205::after{content:"";position:absolute;inset:-.22rem;border:2px solid transparent;border-top-color:#efc33d;border-radius:50%;animation:eviaExportSpin205 .85s linear infinite}.evia-export-progress-ring-v205 span{position:relative;z-index:1;font-size:.72rem;font-weight:760;color:#6f5810}.evia-export-progress-card-v205 strong{font-size:.82rem}.evia-export-progress-card-v205 small{font-size:.58rem;color:#8c877c}@keyframes eviaExportSpin205{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.evia-export-progress-ring-v205::after{animation:none}}`;
  document.head.appendChild(s);
}
function showProgress(){
  ensureProgressStyle();
  progressLayer?.remove();
  progressLayer=document.createElement("div");
  progressLayer.className="evia-export-progress-layer-v205";
  progressLayer.innerHTML='<div class="evia-export-progress-card-v205"><div class="evia-export-progress-ring-v205"><span>Evia</span></div><strong>Preparing download</strong><small data-export-progress-note>Building your evidence pack…</small></div>';
  document.body.appendChild(progressLayer);
}
function progressNote(text){const note=progressLayer?.querySelector?.("[data-export-progress-note]");if(note)note.textContent=text}
function hideProgress(){progressLayer?.remove();progressLayer=null}
function resetButton(){if(currentButton?.isConnected){currentButton.textContent=originalText||"Sign & download";currentButton.style.removeProperty("min-width");currentButton.removeAttribute("aria-busy")}currentButton=null;originalText="";stopTimer();hideProgress()}
function begin(button){if(currentButton&&currentButton!==button)resetButton();if(currentButton===button)return;currentButton=button;started=Date.now();originalText=button.textContent.trim()||"Sign & download";const width=Math.ceil(button.getBoundingClientRect().width);if(width)button.style.minWidth=`${width}px`;button.setAttribute("aria-busy","true");button.textContent="Preparing evidence…";showProgress();timer=setTimeout(()=>{if(currentButton===button&&button.isConnected){if(!button.disabled){resetButton();return}button.textContent="Still preparing…";progressNote("Still preparing your evidence pack…")}},9000)}
function markStarting(anchor){if(!String(anchor.download||"").startsWith("Evia-New-Evidence-"))return;try{sessionStorage.setItem(FLAG,String(Date.now()))}catch{}stopTimer();if(currentButton?.isConnected){currentButton.textContent="Download starting…";currentButton.setAttribute("aria-label","Evidence download starting")}progressNote("Download starting…");setTimeout(hideProgress,500)}
function showComplete(){let stamp="";try{stamp=sessionStorage.getItem(FLAG)||"";sessionStorage.removeItem(FLAG)}catch{}if(!stamp)return;const banner=document.createElement("div");banner.className="evia-export-complete";banner.innerHTML="<b>Evidence download started</b><span>Check your phone's Downloads folder.</span>";document.body.appendChild(banner);requestAnimationFrame(()=>banner.classList.add("show"));setTimeout(()=>{banner.classList.remove("show");setTimeout(()=>banner.remove(),300)},3600)}
document.addEventListener("click",e=>{const button=e.target.closest?.("[data-sign-download]");if(button&&!button.disabled){begin(button);return}const anchor=e.target.closest?.("a[download]");if(anchor)markStarting(anchor)},true);
window.addEventListener("pagehide",()=>{stopTimer();hideProgress()});window.addEventListener("load",showComplete);
window.EviaExportStatus=Object.freeze({version:205,reset:resetButton})
})();