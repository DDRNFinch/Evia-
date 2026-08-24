(()=>{
"use strict";
const VERSION=151;
const STORE="evia-selfobs-live-v3";
let overlay=null,raf=0;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
function course(){return window.EviaCourseContext?.current?.()||{}}
function isTrowel(){const c=course();return c.courseType==="nvq"&&c.courseId==="6570-05"}
function siteData(){const a=window.EviaCoursePacks?.active?.(),d=a?.pathway?.siteData||a?.pack?.siteData;return Array.isArray(d)?d:[]}
function findOpp(id){for(const cat of siteData())for(const job of cat.jobs||[])for(const opp of job.opps||[])if(String(opp.id)===String(id))return{cat,job,opp};return null}
function children(parent,job){return (job?.opps||[]).filter(o=>o?.nvqPracticalChild&&String(o.parentActivityId)===String(parent.id))}
function savedCount(id){const xs=read(STORE,[]);return Array.isArray(xs)?xs.filter(e=>String(e?.opportunityId)===String(id)).length:0}
function style(){if(document.getElementById("evia-nvq-practical-nav-v151-style"))return;const s=document.createElement("style");s.id="evia-nvq-practical-nav-v151-style";s.textContent=`
.selfobs .evia-nvq-practical-list-v151{position:absolute;inset:0;z-index:64;background:linear-gradient(180deg,#fff 0%,#fff 62%,#fff9dd 100%);overflow:auto;padding:0 0 7rem}
.selfobs .evia-nvq-practical-list-v151 .self-list{margin-top:.65rem}
.selfobs .option-row[data-nvq-child] .self-side b{color:#b88f00}
`;document.head.appendChild(s)}
function close(){overlay?.remove();overlay=null}
function openParent(ctx){
  close();style();const host=document.querySelector(".menu-stage");if(!host)return;
  const xs=children(ctx.opp,ctx.job);if(!xs.length)return;
  overlay=document.createElement("section");overlay.className="evia-nvq-practical-list-v151";
  overlay.innerHTML=`<button class="self-back" type="button" data-practical-back>‹ Back</button><h2 class="self-title">${esc(ctx.opp.title)}</h2><p class="self-copy">Choose the part of the activity you can evidence now. Each one saves separately under ${esc(ctx.opp.activityCode||ctx.opp.title)}.</p><div class="self-list">${xs.map(child=>{const n=savedCount(child.id);return `<button class="option-row" type="button" data-nvq-child="${esc(child.id)}"><span class="option-row-copy"><span>${esc(child.title)}</span><small>${esc(child.instruction||"")}</small></span><span class="self-side">${n?`<b>✓</b>`:""}<i>›</i></span></button>`}).join("")}</div>`;
  host.appendChild(overlay);
  overlay.querySelector("[data-practical-back]").onclick=close;
  overlay.querySelectorAll("[data-nvq-child]").forEach(button=>button.onclick=()=>{const id=button.dataset.nvqChild;close();window.EviaStagedEvidence?.openForOpp?.(id)})
}
function patchPanel(){
  if(!isTrowel())return;
  const panel=document.querySelector(".self-panel");if(!panel)return;
  let practical=false;
  panel.querySelectorAll("[data-opp]").forEach(button=>{
    const ctx=findOpp(button.dataset.opp);if(!ctx)return;
    if(ctx.opp.nvqPracticalChild){button.style.display="none";button.setAttribute("aria-hidden","true")}
    if(ctx.opp.nvqPracticalParent)practical=true
  });
  if(practical){const copy=panel.querySelector(".self-copy");if(copy)copy.textContent="Choose the activity you want to collect evidence for."}
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;patchPanel()})}
function intercept(event){
  if(!isTrowel())return;
  const button=event.target?.closest?.("[data-opp]");if(!button)return;
  const ctx=findOpp(button.dataset.opp);if(!ctx?.opp?.nvqPracticalParent)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();openParent(ctx)
}
document.addEventListener("click",intercept,true);
const observer=new MutationObserver(schedule);
function start(){style();observer.observe(document.documentElement,{childList:true,subtree:true});schedule()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaNvqPracticalNav=Object.freeze({version:VERSION,open:openParent,close});
})();
