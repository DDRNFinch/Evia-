(()=>{
"use strict";
const VERSION=208,BACKUP_KEY="evia-course-timeline-backup-v206",STYLE_ID="evia-recovery-v207-style";
const FORBIDDEN='[data-discussion-mode="learn"],[data-discussion-mode="practice"],[data-practical-mode="learn"],[data-practical-mode="guided"]';
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;
  s.textContent=`.evia-practical-media-actions-v207{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin:.6rem 0}.evia-practical-media-actions-v207 button{min-height:2.75rem;border:0;border-radius:999px;background:rgba(255,255,255,.78);font:inherit;font-weight:700;color:#35332e}.evia-course-recovery-v207{display:grid;gap:.8rem;width:min(88vw,24rem);margin:auto;text-align:center}.evia-course-recovery-v207 strong{font-size:1.05rem;color:#34322c}.evia-course-recovery-v207 span{font-size:.86rem;line-height:1.45;color:#77736b}.evia-course-recovery-v207 button{min-height:3rem;border:0;border-radius:999px;padding:.8rem 1rem;background:#efc33d;color:#34322c;font:inherit;font-weight:750}.evia-course-recovery-v207 button.secondary{background:rgba(255,255,255,.82);border:1px solid rgba(0,0,0,.08)}@media(max-width:360px){.evia-practical-media-actions-v207{grid-template-columns:1fr}}`;
  document.head.appendChild(s)
}
function enforceMockOnly(){
  document.querySelectorAll(FORBIDDEN).forEach(node=>node.remove());
  const discussion=document.querySelector('.evia-arp-layer [data-arp-option="discussion"]');
  if(discussion){const small=discussion.querySelector("small");if(small)small.textContent="24 course-specific scenarios · mock discussion";discussion.setAttribute("aria-label","Open Mock Discussion")}
  const practical=document.querySelector('.evia-arp-layer [data-arp-option="practical"]');
  if(practical){const small=practical.querySelector("small");if(small)small.textContent="12 course-specific tasks · mock practical";practical.setAttribute("aria-label","Open Mock Practical")}
}
function splitCameraGallery(root=document){
  ensureStyle();
  root.querySelectorAll?.('.evia-practical-upload').forEach(label=>{
    const input=label.querySelector('input[data-evidence-file]');
    if(!input||label.dataset.eviaCameraSplitV207==="1")return;
    label.dataset.eviaCameraSplitV207="1";label.style.display="none";
    const wrap=document.createElement("div");wrap.className="evia-practical-media-actions-v207";
    const camera=document.createElement("button");camera.type="button";camera.textContent="Camera";camera.setAttribute("aria-label","Open camera");
    const gallery=document.createElement("button");gallery.type="button";gallery.textContent="Gallery";gallery.setAttribute("aria-label","Choose from gallery");
    camera.addEventListener("click",()=>{input.setAttribute("capture","environment");input.click()});
    gallery.addEventListener("click",()=>{input.removeAttribute("capture");input.click()});
    wrap.append(camera,gallery);label.parentNode?.insertBefore(wrap,label)
  })
}
function readBackup(){try{const x=JSON.parse(localStorage.getItem(BACKUP_KEY)||"null");return x&&typeof x==="object"?x:null}catch{return null}}
function wrapCourseActivation(){
  const packs=window.EviaCoursePacks;if(!packs?.activate||packs.activate.__eviaV207)return;
  const original=packs.activate.bind(packs);
  const wrapped=function(id,pathwayId=""){
    try{const raw=localStorage.getItem("evia-course-timeline");if(raw){const before=JSON.parse(raw);if(before?.courseId&&String(before.courseId)!==String(id))localStorage.setItem(BACKUP_KEY,JSON.stringify(before))}}catch{}
    return original(id,pathwayId)
  };
  wrapped.__eviaV207=true;packs.activate=wrapped
}
function repairCourseError(){
  const error=document.querySelector(".self-load-error");
  if(!error||error.dataset.eviaRecoveryV207==="1")return;
  ensureStyle();error.dataset.eviaRecoveryV207="1";
  const previous=readBackup(),packs=window.EviaCoursePacks,current=window.EviaCourseContext?.current?.();
  const canRestore=!!(previous?.courseId&&packs?.get?.(previous.courseId)&&String(previous.courseId)!==String(current?.courseId||""));
  error.innerHTML='<div class="evia-course-recovery-v207"><strong>This course could not open</strong><span>Your Evia data is still on this device. Choose the correct installed course to get back into the app.</span>'+(canRestore?'<button type="button" data-course-restore-v207>Return to previous course</button>':'')+'<button type="button" class="secondary" data-course-choose-v207>Choose course</button></div>';
  error.querySelector("[data-course-restore-v207]")?.addEventListener("click",()=>{packs.activate(previous.courseId,previous.pathway||"");location.reload()});
  error.querySelector("[data-course-choose-v207]")?.addEventListener("click",()=>{if(packs?.manager)packs.manager(()=>location.reload());else location.reload()})
}
function restoreFunctionalSkills(){window.EviaFunctionalSkills?.refresh?.()}
function apply(){enforceMockOnly();splitCameraGallery();wrapCourseActivation();repairCourseError();restoreFunctionalSkills()}
function retry(){[0,40,100,200,400,700].forEach(ms=>setTimeout(apply,ms))}
function start(){
  [0,100,350,800,1600,3000].forEach(ms=>setTimeout(apply,ms));
  document.addEventListener("click",event=>{
    const blocked=event.target?.closest?.(FORBIDDEN);if(blocked){event.preventDefault();event.stopImmediatePropagation();blocked.remove();return}
    if(event.target?.closest?.('.progress-arch[data-arch="ARP"],[data-arp-option="discussion"],[data-arp-option="practical"],[data-discussion-mode="mock"],[data-practical-mode="mock"],[data-evidence-card]'))retry()
  },true);
  window.addEventListener("pageshow",retry)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaRecoveryV207=Object.freeze({version:VERSION,apply,enforceMockOnly,splitCameraGallery,repairCourseError,restoreFunctionalSkills});
})();
