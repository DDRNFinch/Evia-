(()=>{
"use strict";
const VERSION=177;
const STORE="evia-selfobs-live-v3";
let overlay=null,current=null,raf=0,returnFromEvidence=false,restoring=false;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
function course(){return window.EviaCourseContext?.current?.()||{}}
function isTrowel(){const c=course();return c.courseType==="nvq"&&c.courseId==="6570-05"}
function appOpen(){return !!document.querySelector(".evia-app.selfobs.is-open")}
function siteData(){const a=window.EviaCoursePacks?.active?.(),d=a?.pathway?.siteData||a?.pack?.siteData;return Array.isArray(d)?d:[]}
function findOpp(id){for(const cat of siteData())for(const job of cat.jobs||[])for(const opp of job.opps||[])if(String(opp.id)===String(id))return{cat,job,opp};return null}
function findJob(id){for(const cat of siteData())for(const job of cat.jobs||[])if(String(job.id)===String(id))return{cat,job};return null}
function findCat(id){return siteData().find(cat=>String(cat.id)===String(id))||null}
function children(parent,job){return (job?.opps||[]).filter(o=>o?.nvqPracticalChild&&String(o.parentActivityId)===String(parent.id))}
function practicalParents(job){return (job?.opps||[]).filter(o=>o?.nvqPracticalParent)}
function savedCount(id){const xs=read(STORE,[]),courseId=String(course()?.courseId||"");return Array.isArray(xs)?xs.filter(e=>String(e?.opportunityId)===String(id)&&(!e?.courseId||!courseId||String(e.courseId)===courseId)).length:0}
function progressFromTargets(xs){const unique=[...new Map((xs||[]).filter(Boolean).map(x=>[String(x.id),x])).values()],total=unique.length,done=unique.reduce((n,target)=>n+(savedCount(target.id)>0?1:0),0);return{done,total,pct:total?done/total:0}}
function targetsForOpp(opp,job){if(!opp)return[];if(opp.nvqPracticalChild)return[];if(opp.nvqPracticalParent){const xs=children(opp,job);return xs.length?xs:[opp]}return[opp]}
function targetsForJob(job){const xs=[];for(const opp of job?.opps||[])xs.push(...targetsForOpp(opp,job));return xs}
function targetsForCategory(cat){const xs=[];for(const job of cat?.jobs||[])xs.push(...targetsForJob(job));return xs}
function progressFor(parent,job){const xs=children(parent,job);return progressFromTargets(xs.length?xs:[parent])}
function progressForJob(job){return progressFromTargets(targetsForJob(job))}
function progressForCategory(cat){return progressFromTargets(targetsForCategory(cat))}
function progressMarkup(progress){if(!progress?.total)return"";const complete=progress.done>=progress.total,pct=Math.max(0,Math.min(1,progress.pct)),key=`${progress.done}/${progress.total}`;return `<span class="evia-section-progress-v175${complete?" is-complete":""}" data-progress-key="${key}" style="--evia-section-progress:${pct*360}deg" role="img" aria-label="${progress.done} of ${progress.total} complete"><span>${complete?"✓":""}</span></span>`}
function legacyTick(side){return [...(side?.children||[])].find(el=>el.tagName==="B"&&!el.classList.contains("evia-section-progress-v175"))||null}
function applyProgressValue(button,progress){if(!button)return;const side=button.querySelector(".self-side");if(!side)return;const existing=side.querySelector(".evia-section-progress-v175"),legacy=legacyTick(side);if(!progress?.total){existing?.remove();if(legacy)legacy.hidden=false;return}if(legacy)legacy.hidden=true;const key=`${progress.done}/${progress.total}`;if(existing?.dataset.progressKey===key)return;existing?.remove();const holder=document.createElement("span");holder.innerHTML=progressMarkup(progress);const ring=holder.firstElementChild;if(ring)side.prepend(ring)}
function applyProgress(button,parent,job){applyProgressValue(button,progressFor(parent,job))}
function style(){if(document.getElementById("evia-nvq-practical-nav-v151-style"))return;const s=document.createElement("style");s.id="evia-nvq-practical-nav-v151-style";s.textContent=`
.selfobs .evia-nvq-practical-list-v151{position:absolute;inset:0;z-index:10;background:linear-gradient(180deg,#fff 0%,#fff 62%,#fff9dd 100%);overflow:auto;padding:0 0 7rem}
.selfobs .evia-nvq-practical-list-v151 .self-list{margin-top:.65rem}
.selfobs .evia-section-progress-v175{--evia-section-progress:0deg;position:relative;display:grid;place-items:center;width:1.28rem;height:1.28rem;flex:0 0 1.28rem;border-radius:50%;background:conic-gradient(#f2db7d 0 var(--evia-section-progress),#eceae3 var(--evia-section-progress) 360deg);color:#756727;box-sizing:border-box}
.selfobs .evia-section-progress-v175:before{content:"";position:absolute;inset:2px;border-radius:50%;background:#fff}
.selfobs .evia-section-progress-v175>span{position:relative;z-index:1;display:grid;place-items:center;width:100%;height:100%;font:800 .52rem/1 system-ui,-apple-system,sans-serif;white-space:nowrap}
.selfobs .evia-section-progress-v175.is-complete{background:#f2db7d;color:#6d5d1e}
.selfobs .evia-section-progress-v175.is-complete:before{display:none}
.selfobs .option-row .self-side>b:not([hidden]),.selfobs .self-ksbs button>span:not(:empty),.selfobs .self-card.group>strong>em:not(:empty){display:inline-grid!important;place-items:center!important;width:1.28rem!important;height:1.28rem!important;min-width:1.28rem!important;min-height:1.28rem!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;background:#f2db7d!important;color:#6d5d1e!important;font:800 .52rem/1 system-ui,-apple-system,sans-serif!important;letter-spacing:0!important;box-sizing:border-box!important;vertical-align:middle}
.selfobs .option-row .self-side{gap:.38rem}
`;document.head.appendChild(s)}
function removeList(clearCurrent=true){overlay?.remove();overlay=null;if(clearCurrent)current=null}
function close(){returnFromEvidence=false;restoring=false;removeList(true)}
function openParent(ctx){
  if(!appOpen()){close();return}
  removeList(false);style();const host=document.querySelector(".menu-stage");if(!host)return;
  const xs=children(ctx.opp,ctx.job);if(!xs.length)return;current=ctx;
  overlay=document.createElement("section");overlay.className="evia-nvq-practical-list-v151";
  overlay.innerHTML=`<button class="self-back" type="button" data-practical-back>‹ Back</button><h2 class="self-title">${esc(ctx.opp.title)}</h2><p class="self-copy">Choose the part of the activity you can evidence now. Each one saves separately under ${esc(ctx.opp.activityCode||ctx.opp.title)}.</p><div class="self-list">${xs.map(child=>{const n=savedCount(child.id);return `<button class="option-row" type="button" data-nvq-child="${esc(child.id)}"><span class="option-row-copy"><span>${esc(child.title)}</span><small>${esc(child.instruction||"")}</small></span><span class="self-side">${n?`<b>✓</b>`:""}<i>›</i></span></button>`}).join("")}</div>`;
  host.appendChild(overlay);
  overlay.querySelector("[data-practical-back]").onclick=close;
  overlay.querySelectorAll("[data-nvq-child]").forEach(button=>button.onclick=()=>openChild(button.dataset.nvqChild,ctx))
}
async function openChild(id,ctx){
  if(!appOpen()){close();return}
  if(!window.EviaStagedEvidence?.openForOpp)return;
  current=ctx;returnFromEvidence=true;removeList(false);
  try{
    const opened=await window.EviaStagedEvidence.openForOpp(id);
    if(opened===false){returnFromEvidence=false;openParent(ctx)}
  }catch(error){
    console.error("Evia NVQ practical evidence",error);returnFromEvidence=false;openParent(ctx)
  }
}
function selector(value){return CSS.escape(String(value))}
function restoreParent(ctx,tries=0){
  if(!returnFromEvidence||!ctx||!isTrowel()||!appOpen()){close();return}
  if(document.querySelector(".evia-stage-overlay-v132")){restoring=false;return}
  const parent=document.querySelector(`.self-panel [data-opp="${selector(ctx.opp.id)}"]`);
  if(parent){returnFromEvidence=false;restoring=false;openParent(ctx);return}
  const job=document.querySelector(`.self-panel [data-job="${selector(ctx.job.id)}"]`);
  if(job){job.click();setTimeout(()=>restoreParent(ctx,tries+1),55);return}
  const cat=document.querySelector(`.self-panel [data-cat="${selector(ctx.cat.id)}"]`);
  if(cat){cat.click();setTimeout(()=>restoreParent(ctx,tries+1),55);return}
  if(tries<10){setTimeout(()=>restoreParent(ctx,tries+1),70);return}
  close()
}
function maybeRestore(){
  if(!returnFromEvidence||restoring||document.querySelector(".evia-stage-overlay-v132"))return;
  if(!appOpen()){close();return}
  const ctx=current;if(!ctx){returnFromEvidence=false;return}
  restoring=true;setTimeout(()=>restoreParent(ctx,0),0)
}
function patchPanel(){
  if(!appOpen()){if(overlay||returnFromEvidence)close();return}
  const panel=document.querySelector(".self-panel");if(!panel)return;
  const trowel=isTrowel();let practical=false;
  panel.querySelectorAll("[data-opp]").forEach(button=>{
    const ctx=findOpp(button.dataset.opp);if(!ctx)return;
    if(trowel&&ctx.opp.nvqPracticalChild){button.style.display="none";button.setAttribute("aria-hidden","true")}
    if(trowel&&ctx.opp.nvqPracticalParent){practical=true;applyProgress(button,ctx.opp,ctx.job)}
  });
  panel.querySelectorAll("[data-job]").forEach(button=>{
    const found=findJob(button.dataset.job);if(found)applyProgressValue(button,progressForJob(found.job))
  });
  panel.querySelectorAll("[data-cat]").forEach(button=>{
    const cat=findCat(button.dataset.cat);if(cat)applyProgressValue(button,progressForCategory(cat))
  });
  if(trowel&&practical){const copy=panel.querySelector(".self-copy");if(copy)copy.textContent="Choose the activity you want to collect evidence for."}
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;patchPanel();maybeRestore()})}
function intercept(event){
  if(!isTrowel())return;
  const jobButton=event.target?.closest?.("[data-job]");
  if(jobButton){
    const found=findJob(jobButton.dataset.job),parents=practicalParents(found?.job);
    if(found&&String(found.cat?.id)==="E"&&parents.length===1){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
      openParent({cat:found.cat,job:found.job,opp:parents[0]});return
    }
  }
  const button=event.target?.closest?.("[data-opp]");if(!button)return;
  const ctx=findOpp(button.dataset.opp);if(!ctx?.opp?.nvqPracticalParent)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();openParent(ctx)
}
document.addEventListener("click",intercept,true);
window.addEventListener("evia:evidence-saved",schedule);
window.addEventListener("evia:evidence-reflection-saved",()=>{if(isTrowel())close();schedule()});
const observer=new MutationObserver(schedule);
function start(){style();observer.observe(document.documentElement,{childList:true,subtree:true});schedule()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaNvqPracticalNav=Object.freeze({version:VERSION,open:openParent,close});
})();
