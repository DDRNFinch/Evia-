(()=>{
"use strict";
const VERSION=226;
const DAY=86400000,WEEK=7*DAY;
const EVIDENCE_KEY="evia-selfobs-live-v3",TARGETS_KEY="evia-targets-v1";
const WELLBEING_KEY="evia-pulse-wellbeing-v1",CONFIDENCE_KEY="evia-pulse-confidence-v1",INTRO_KEY="evia-pulse-introduced-v1",SNOOZE_KEY="evia-pulse-confidence-snooze-v1";
const CONFIDENCE_COPY={
  1:{title:"Not confident yet",detail:"I need help or more training."},
  2:{title:"Getting there",detail:"I can do some of this but need more practice."},
  3:{title:"Fairly confident",detail:"I can usually do this and explain the basics."},
  4:{title:"Confident",detail:"I can do this independently and explain what I’m doing."},
  5:{title:"Very confident",detail:"I can do this independently and confidently explain why it’s done that way."}
};
let courseMap=[],courseKey="",mapLoading=false,lastEvidenceSignature="",checkingPrompt=false,timer=null,observer=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function ctx(){return window.EviaCourseContext?.current?.()||null}
function keyForCourse(){const c=ctx();if(!c||c.noCourse)return"";return `${String(c.courseId||"course")}:${String(c.pathway||"")}`}
function scopedRead(base,fallback){const all=read(base,{});return all&&typeof all==="object"&&!Array.isArray(all)&&courseKey in all?all[courseKey]:fallback}
function scopedWrite(base,value){const all=read(base,{}),next=all&&typeof all==="object"&&!Array.isArray(all)?all:{};next[courseKey]=value;return write(base,next)}
function targetState(){const x=read(TARGETS_KEY,null),c=ctx();if(!x||typeof x!=="object"||Array.isArray(x))return null;if(c?.courseId&&x.courseId&&String(c.courseId)!==String(x.courseId))return null;if(c?.pathway!=null&&x.pathway!=null&&String(c.pathway)!==String(x.pathway))return null;return x}
function periodStart(){return Math.max(0,Number(targetState()?.createdAt)||0)}
function fmtDate(value){let d;if(value instanceof Date)d=value;else if(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value))d=new Date(`${value}T12:00:00`);else d=new Date(Number.isFinite(Number(value))?Number(value):String(value||""));if(!Number.isFinite(d.getTime()))return"Not set";return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
function reviewDate(){const s=targetState();return s?.calculatedForDate||s?.dueDate||""}
function face(state,cls=""){return `<span class="evia-pulse-face evia-pulse-face-${state} ${cls}" aria-hidden="true"><span class="evia-pulse-eye eye-left"></span><span class="evia-pulse-eye eye-right"></span></span>`}
function wellbeingAll(){const xs=scopedRead(WELLBEING_KEY,[]);return Array.isArray(xs)?xs.filter(x=>x&&[1,2,3].includes(Number(x.state))&&Number(x.at)>0):[]}
function wellbeingCurrent(){const start=periodStart();return wellbeingAll().filter(x=>Number(x.at)>=start)}
function wellbeingDue(){if(!courseKey)return false;const xs=wellbeingAll();if(!xs.length)return true;const latest=Math.max(...xs.map(x=>Number(x.at)||0));return Date.now()-latest>=WEEK}
function wellbeingOverall(items=wellbeingCurrent()){if(!items.length)return null;const avg=items.reduce((n,x)=>n+Number(x.state||0),0)/items.length;return avg>=2.5?3:avg<1.5?1:2}
function saveWellbeing(state){const xs=wellbeingAll();xs.push({at:Date.now(),state:Number(state)});scopedWrite(WELLBEING_KEY,xs.slice(-104));refreshOpenPulse()}
function confidenceStore(){const x=scopedRead(CONFIDENCE_KEY,{version:1,items:{}});return x&&typeof x==="object"&&!Array.isArray(x)?{version:1,items:x.items&&typeof x.items==="object"?x.items:{}}:{version:1,items:{}}}
function saveConfidence(job,score,source="manual"){
  const store=confidenceStore(),k=jobKey(job),old=store.items[k]||{},history=Array.isArray(old.history)?old.history:[],next=Number(score);
  if(Number(old.current)!==next)history.push({at:Date.now(),score:next,source});
  store.items[k]={...old,jobId:job.jobId,jobTitle:job.jobTitle,categoryId:job.categoryId,categoryTitle:job.categoryTitle,current:next,updatedAt:Date.now(),history:history.slice(-40)};
  scopedWrite(CONFIDENCE_KEY,store);refreshOpenPulse();
}
function jobKey(job){return `${String(job.categoryId||"")}::${String(job.jobId||"")}`}
function currentEntries(){const c=ctx(),xs=read(EVIDENCE_KEY,[]);if(!Array.isArray(xs))return[];return xs.filter(e=>{if(!e)return false;if(e.courseId&&c?.courseId&&String(e.courseId)!==String(c.courseId))return false;if(e.pathway!=null&&c?.pathway!=null&&String(e.pathway)!==String(c.pathway))return false;return true})}
function completedJobs(){const xs=currentEntries();return courseMap.map(job=>{
  const matches=job.opportunityIds.map(id=>xs.filter(e=>String(e.categoryId)===String(job.categoryId)&&String(e.jobId)===String(job.jobId)&&String(e.opportunityId)===String(id)));
  const complete=job.opportunityIds.length>0&&matches.every(list=>list.length>0);
  const firstPerOpportunity=complete?matches.map(list=>Math.min(...list.map(e=>Number(e.createdAt)||0).filter(Boolean))):[];
  const at=complete&&firstPerOpportunity.every(Boolean)?Math.max(...firstPerOpportunity):0;
  return{...job,complete,completedAt:at};
}).filter(x=>x.complete)}
function confidenceStats(){
  const store=confidenceStore(),jobs=completedJobs(),rated=jobs.map(job=>({job,item:store.items[jobKey(job)]||null})).filter(x=>Number(x.item?.current)>=1&&Number(x.item?.current)<=5);
  const average=rated.length?rated.reduce((n,x)=>n+Number(x.item.current),0)/rated.length:null,start=periodStart();
  const baselineVals=[];
  rated.forEach(({item})=>{const h=(Array.isArray(item.history)?item.history:[]).filter(x=>Number(x.at)<=start).sort((a,b)=>Number(a.at)-Number(b.at));if(h.length)baselineVals.push(Number(h[h.length-1].score))});
  const baseline=baselineVals.length?baselineVals.reduce((a,b)=>a+b,0)/baselineVals.length:null;
  return{jobs,rated,average,baseline,store};
}
function evidenceSignature(){const xs=currentEntries(),latest=xs.reduce((m,e)=>Math.max(m,Number(e?.createdAt)||0),0);return `${xs.length}:${latest}`}
function ensureIntroduced(){const all=read(INTRO_KEY,{}),k=courseKey;if(!all[k]){all[k]=Date.now();write(INTRO_KEY,all)}return Number(all[k])||Date.now()}
function snoozeStore(){const x=scopedRead(SNOOZE_KEY,{});return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}
function snooze(job,ms=DAY){const x=snoozeStore();x[jobKey(job)]=Date.now()+ms;scopedWrite(SNOOZE_KEY,x)}
function clearSnooze(job){const x=snoozeStore();delete x[jobKey(job)];scopedWrite(SNOOZE_KEY,x)}
function modalOpen(){return !!document.querySelector(".evia-pulse-modal")}
function closeModal(){document.querySelector(".evia-pulse-modal")?.remove();checkingPrompt=false}
function modalShell(title,copy,body,extraClass=""){return `<div class="evia-pulse-modal ${extraClass}" role="dialog" aria-modal="true"><section class="evia-pulse-modal-card"><div class="evia-pulse-modal-mark">Evia Pulse</div><h2>${esc(title)}</h2>${copy?`<p>${esc(copy)}</p>`:""}${body}</section></div>`}
function openWellbeingCheck(force=false){
  if(modalOpen()||(!force&&!wellbeingDue()))return false;
  const el=document.createElement("div");el.innerHTML=modalShell("How are you this week?","",`<div class="evia-pulse-wellbeing-choices"><button type="button" data-wellbeing="3" aria-label="Top check-in option">${face(3)}</button><button type="button" data-wellbeing="2" aria-label="Middle check-in option">${face(2)}</button><button type="button" data-wellbeing="1" aria-label="Lower check-in option">${face(1)}</button></div><button type="button" class="evia-pulse-later" data-pulse-later>Not now</button>`,"evia-pulse-weekly");
  const modal=el.firstElementChild;document.body.appendChild(modal);
  modal.querySelectorAll("[data-wellbeing]").forEach(b=>b.addEventListener("click",()=>{saveWellbeing(Number(b.dataset.wellbeing));closeModal()}));
  modal.querySelector("[data-pulse-later]").onclick=closeModal;return true
}
function confidenceHistory(item){const h=(Array.isArray(item?.history)?item.history:[]).slice().reverse();if(!h.length)return"";return `<div class="evia-pulse-rating-history"><b>Previous ratings</b>${h.slice(0,8).map(x=>`<div><span>${fmtDate(Number(x.at))}</span><strong>${Number(x.score)} / 5</strong></div>`).join("")}</div>`}
function openConfidence(job,{source="manual",completed=false}={}){
  if(modalOpen())return false;checkingPrompt=true;const item=confidenceStore().items[jobKey(job)]||null,question=source==="completion"?"How confident do you feel doing and explaining this work?":"How confident do you feel doing and explaining this work now?";
  const rows=Object.entries(CONFIDENCE_COPY).map(([score,c])=>`<button type="button" class="evia-pulse-rating-row${Number(item?.current)===Number(score)?" is-current":""}" data-confidence="${score}"><i>${score}</i><span><b>${esc(c.title)}</b><small>${esc(c.detail)}</small></span></button>`).join("");
  const el=document.createElement("div");el.innerHTML=modalShell(completed?`${job.jobTitle} complete`:job.jobTitle,question,`<div class="evia-pulse-rating-list">${rows}</div>${confidenceHistory(item)}<button type="button" class="evia-pulse-later" data-pulse-later>Not now</button>`,"evia-pulse-confidence-modal");
  const modal=el.firstElementChild;document.body.appendChild(modal);
  modal.querySelectorAll("[data-confidence]").forEach(b=>b.addEventListener("click",()=>{saveConfidence(job,Number(b.dataset.confidence),source);clearSnooze(job);closeModal()}));
  modal.querySelector("[data-pulse-later]").onclick=()=>{snooze(job);closeModal()};return true
}
async function loadCourseMap(){
  if(mapLoading)return;const c=ctx(),nextKey=keyForCourse();if(!c||!nextKey||!c.dataPrefix)return;if(courseKey===nextKey&&courseMap.length)return;mapLoading=true;courseKey=nextKey;
  try{const prefix=c.dataPrefix||"evia-site-data",parts=await Promise.all([1,2,3].map(async n=>{const text=await fetch(`./app/${prefix}-${n}.ts?v=226`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()}),m=text.match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);if(!m)throw Error("course map parse");return JSON.parse(m[1])}));const data=parts.flat();courseMap=data.flatMap(cat=>(cat.jobs||[]).map(job=>({categoryId:cat.id,categoryTitle:cat.title,jobId:job.id,jobTitle:job.title,opportunityIds:(job.opps||[]).map(o=>o.id)}))).filter(x=>x.jobId&&x.opportunityIds.length);window.EviaPulseCourseMap=Object.freeze(courseMap.map(x=>Object.freeze({...x,opportunityIds:Object.freeze([...x.opportunityIds])})));ensureIntroduced();lastEvidenceSignature=evidenceSignature()}catch(e){console.warn("Evia Pulse course map unavailable",e);courseMap=[]}finally{mapLoading=false}}
function checkConfidencePrompt(){
  if(checkingPrompt||modalOpen()||!courseMap.length)return;const intro=ensureIntroduced(),store=confidenceStore(),snoozes=snoozeStore(),candidates=completedJobs().filter(job=>!store.items[jobKey(job)]?.current&&Number(job.completedAt)>intro&&Number(snoozes[jobKey(job)]||0)<=Date.now()).sort((a,b)=>Number(a.completedAt)-Number(b.completedAt));if(candidates.length)openConfidence(candidates[0],{source:"completion",completed:true})
}
function maybeCheckEvidence(){const sig=evidenceSignature();if(sig!==lastEvidenceSignature){lastEvidenceSignature=sig;setTimeout(checkConfidencePrompt,500)}}
function pulseSummaryMarkup(){
  const state=targetState(),done=(state?.targets||[]).filter(t=>t.completedAt).length,total=(state?.targets||[]).length,well=wellbeingCurrent(),overall=wellbeingOverall(well),conf=confidenceStats();
  const wellbeingValue=well.length?`${face(overall,"evia-pulse-face-mini")}<span>${well.length} check-in${well.length===1?"":"s"}</span>`:'<span>No check-in yet</span>';
  const confidenceValue=conf.average==null?'<span>Not rated yet</span>':`<strong>${conf.average.toFixed(1)} / 5</strong><span>${conf.rated.length} area${conf.rated.length===1?"":"s"}</span>`;
  return `<section class="evia-pulse-summary"><p class="evia-tools-kicker">Evia Pulse</p><div class="evia-pulse-review"><span>Next review</span><strong>${esc(fmtDate(reviewDate()))}</strong><small>${total} current target${total===1?"":"s"}</small></div><div class="evia-pulse-summary-list"><button type="button" data-pulse-view="targets"><span><b>Overall targets</b><small>${done} of ${total} achieved</small></span><i>›</i></button><button type="button" data-pulse-view="wellbeing"><span><b>Overall wellbeing</b><small class="evia-pulse-inline" data-pulse-wellbeing-value>${wellbeingValue}</small></span><i>›</i></button><button type="button" data-pulse-view="confidence"><span><b>Overall confidence</b><small class="evia-pulse-inline" data-pulse-confidence-value>${confidenceValue}</small></span><i>›</i></button></div></section>`
}
function deepHead(title){return `<div class="evia-pulse-deep-head"><button type="button" data-pulse-home>‹ Pulse</button><b>${esc(title)}</b><span></span></div>`}
function showSummary(layer){const summary=layer.querySelector(".evia-pulse-summary"),targets=layer.querySelector(".evia-pulse-targets-deep");layer.querySelectorAll(".evia-pulse-generated-deep").forEach(x=>x.remove());if(summary)summary.hidden=false;if(targets)targets.hidden=true;const h=layer.querySelector(".evia-tools-head b");if(h)h.textContent="Evia Pulse";refreshOpenPulse()}
function showTargets(layer){const summary=layer.querySelector(".evia-pulse-summary"),targets=layer.querySelector(".evia-pulse-targets-deep");if(summary)summary.hidden=true;if(targets){targets.hidden=false;if(!targets.querySelector(".evia-pulse-deep-head")){const h=document.createElement("div");h.innerHTML=deepHead("Overall targets");targets.prepend(h.firstElementChild);targets.querySelector("[data-pulse-home]").onclick=()=>showSummary(layer)}}}
function showWellbeing(layer){
  const summary=layer.querySelector(".evia-pulse-summary"),targets=layer.querySelector(".evia-pulse-targets-deep");if(summary)summary.hidden=true;if(targets)targets.hidden=true;layer.querySelectorAll(".evia-pulse-generated-deep").forEach(x=>x.remove());const all=wellbeingAll().slice().sort((a,b)=>Number(b.at)-Number(a.at)),start=periodStart(),current=all.filter(x=>Number(x.at)>=start),earlier=all.filter(x=>Number(x.at)<start),overall=wellbeingOverall(current),deep=document.createElement("section");deep.className="evia-pulse-generated-deep evia-pulse-wellbeing-deep";
  const rows=list=>list.map(x=>`<div class="evia-pulse-history-row"><span>${esc(fmtDate(Number(x.at)))}</span>${face(Number(x.state),"evia-pulse-face-small")}</div>`).join("");
  deep.innerHTML=deepHead("Overall wellbeing")+`<div class="evia-pulse-deep-hero">${overall?face(overall,"evia-pulse-face-hero"):""}<span>${current.length?`${current.length} weekly check-in${current.length===1?"":"s"} since the last review`:"No check-ins since the last review"}</span></div>${current.length?`<h3>Since last review</h3><div class="evia-pulse-history">${rows(current)}</div>`:""}${earlier.length?`<h3>Earlier check-ins</h3><div class="evia-pulse-history">${rows(earlier)}</div>`:""}${wellbeingDue()?'<button type="button" class="evia-tools-primary" data-pulse-check-now>Check in now</button>':""}`;layer.querySelector(".evia-tools-body").appendChild(deep);deep.querySelector("[data-pulse-home]").onclick=()=>showSummary(layer);deep.querySelector("[data-pulse-check-now]")?.addEventListener("click",()=>openWellbeingCheck(true))
}
function showConfidence(layer){
  const summary=layer.querySelector(".evia-pulse-summary"),targets=layer.querySelector(".evia-pulse-targets-deep");if(summary)summary.hidden=true;if(targets)targets.hidden=true;layer.querySelectorAll(".evia-pulse-generated-deep").forEach(x=>x.remove());const stats=confidenceStats(),deep=document.createElement("section");deep.className="evia-pulse-generated-deep evia-pulse-confidence-deep";const items=stats.jobs.map(job=>({job,item:stats.store.items[jobKey(job)]||null})).sort((a,b)=>{const aa=Number(a.item?.current)||0,bb=Number(b.item?.current)||0;if(!aa&&bb)return-1;if(aa&&!bb)return 1;return aa-bb||a.job.jobTitle.localeCompare(b.job.jobTitle)});
  const trend=stats.average!=null&&stats.baseline!=null?`<small>${stats.baseline.toFixed(1)} / 5 at the last review</small>`:"";
  deep.innerHTML=deepHead("Overall confidence")+`<div class="evia-pulse-confidence-hero"><strong>${stats.average==null?"—":stats.average.toFixed(1)}</strong><span>${stats.average==null?"No ratings yet":"/ 5 current overall"}</span>${trend}</div><div class="evia-pulse-confidence-list">${items.length?items.map(({job,item})=>`<button type="button" data-confidence-job="${esc(jobKey(job))}"><span><b>${esc(job.jobTitle)}</b><small>${esc(job.categoryTitle||"")}</small></span><em>${Number(item?.current)||"Rate"}${Number(item?.current)?" / 5":""}</em><i>›</i></button>`).join(""):'<div class="evia-pulse-empty">Completed subcategories will appear here.</div>'}</div>`;layer.querySelector(".evia-tools-body").appendChild(deep);deep.querySelector("[data-pulse-home]").onclick=()=>showSummary(layer);deep.querySelectorAll("[data-confidence-job]").forEach(b=>b.onclick=()=>{const job=stats.jobs.find(x=>jobKey(x)===b.dataset.confidenceJob);if(job)openConfidence(job,{source:"manual",completed:false})})
}
function patchTargetLayer(layer){
  const body=layer.querySelector(".evia-tools-body");if(!body||body.querySelector(".evia-pulse-summary")||!body.querySelector(".evia-target-hero")||!body.querySelector(".evia-target-list"))return;const header=layer.querySelector(".evia-tools-head b");if(header)header.textContent="Evia Pulse";const original=document.createElement("section");original.className="evia-pulse-targets-deep";original.hidden=true;while(body.firstChild)original.appendChild(body.firstChild);const wrap=document.createElement("div");wrap.innerHTML=pulseSummaryMarkup();const summary=wrap.firstElementChild;body.append(summary,original);summary.querySelector('[data-pulse-view="targets"]').onclick=()=>showTargets(layer);summary.querySelector('[data-pulse-view="wellbeing"]').onclick=()=>showWellbeing(layer);summary.querySelector('[data-pulse-view="confidence"]').onclick=()=>showConfidence(layer)
}
function refreshOpenPulse(){document.querySelectorAll(".evia-target-layer").forEach(layer=>{const summary=layer.querySelector(".evia-pulse-summary");if(!summary)return;const mode=layer.querySelector(".evia-pulse-confidence-deep")?"confidence":layer.querySelector(".evia-pulse-wellbeing-deep")?"wellbeing":"",wasHidden=summary.hidden,targets=layer.querySelector(".evia-pulse-targets-deep"),body=layer.querySelector(".evia-tools-body");const next=document.createElement("div");next.innerHTML=pulseSummaryMarkup();const fresh=next.firstElementChild;summary.replaceWith(fresh);fresh.hidden=wasHidden;fresh.querySelector('[data-pulse-view="targets"]').onclick=()=>showTargets(layer);fresh.querySelector('[data-pulse-view="wellbeing"]').onclick=()=>showWellbeing(layer);fresh.querySelector('[data-pulse-view="confidence"]').onclick=()=>showConfidence(layer);if(!wasHidden){body?.querySelectorAll(".evia-pulse-generated-deep").forEach(x=>x.remove());if(targets)targets.hidden=true}else if(mode==="confidence")showConfidence(layer);else if(mode==="wellbeing")showWellbeing(layer)})}
function patchMini(){const b=document.querySelector(".selfobs .evia-target-mini");if(!b)return;b.classList.add("evia-pulse-mini");const count=Number(b.querySelector(".evia-target-count")?.textContent||0);b.dataset.pulseZero=count>0?"0":"1";b.setAttribute("aria-label",`Open Evia Pulse${count?`; ${count} unfinished target${count===1?"":"s"}`:""}`);b.title="Evia Pulse"}
function patch(){patchMini();document.querySelectorAll(".evia-target-layer").forEach(patchTargetLayer)}
function safeForWeekly(){return !modalOpen()&&!document.querySelector(".selfobs.is-open,.evia-tools-layer,.evia-stage-overlay-v132,.evia-welcome-layer,.evia-first-run-layer,.evia-demo-welcome")}
function maybeWeekly(){if(wellbeingDue()&&safeForWeekly())openWellbeingCheck(false)}
function tick(){const next=keyForCourse();if(next&&next!==courseKey)loadCourseMap();else if(!courseMap.length)loadCourseMap();patch();if(courseMap.length){maybeCheckEvidence();checkConfidencePrompt()}if(wellbeingDue()&&safeForWeekly())maybeWeekly()}
function startObserver(){if(observer||!document.body)return;observer=new MutationObserver(()=>requestAnimationFrame(patch));observer.observe(document.body,{childList:true,subtree:true})}
function start(){courseKey=keyForCourse();loadCourseMap();startObserver();patch();clearInterval(timer);timer=setInterval(tick,2000);setTimeout(maybeWeekly,2200);window.addEventListener("pageshow",()=>{loadCourseMap();setTimeout(()=>{patch();maybeWeekly();checkConfidencePrompt()},450)});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>{patch();maybeWeekly();checkConfidencePrompt()},450)})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaPulse=Object.freeze({version:VERSION,openWellbeing:()=>openWellbeingCheck(true),openConfidenceByJobId:id=>{const job=courseMap.find(x=>String(x.jobId)===String(id));return job?openConfidence(job,{source:"manual"}):false},refresh:refreshOpenPulse});
})();
