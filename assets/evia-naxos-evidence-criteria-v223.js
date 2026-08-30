(()=>{
"use strict";
const VERSION=242,STORE="evia-selfobs-live-v3",PACK_KEY="nisi-installed-course-packs-v1",TIMELINE_KEY="evia-course-timeline";
let queued=false;
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
function active(){
 const t=read(TIMELINE_KEY,{}),packs=read(PACK_KEY,{}),pack=packs?.[String(t.courseId||"")];if(!pack)return null;
 const p=Array.isArray(pack.pathways)?pack.pathways.find(x=>String(x?.id)===String(t.pathway||""))||pack.pathways[0]:null;
 const criteria=p?.evidenceCriteria||pack.evidenceCriteria||{};
 return{pack,pathway:p,criteria,codes:(p?.codes||pack.codes||[]).map(String)}
}
function secondary(){
 const api=window.EviaEvidenceStateV204||window.EviaEvidenceStateV203||window.EviaEvidenceStateV202;
 const out=new Set();
 for(const fn of ["rpl","milos","witness"])try{(api?.[fn]?.()||[]).forEach(c=>out.add(String(c).toUpperCase()))}catch{}
 return out
}
function state(){
 const a=active();if(!a||!a.criteria||!Object.keys(a.criteria).length)return null;
 const entries=read(STORE,[]),byOpp=new Set(),byCode=new Set(),other=secondary();
 (Array.isArray(entries)?entries:[]).forEach(e=>{if(e?.opportunityId)byOpp.add(String(e.opportunityId));(e?.codes||[]).forEach(c=>byCode.add(String(c).toUpperCase()))});
 const learnerCovered=new Set(),covered=new Set();
 const partDone=part=>{const ids=Array.isArray(part?.opportunityIds)&&part.opportunityIds.length?part.opportunityIds:[part?.opportunityId];return ids.some(id=>id&&byOpp.has(String(id)))};
 for(const code of a.codes){const key=String(code).toUpperCase(),parts=a.criteria[code]||a.criteria[key],learnerDone=Array.isArray(parts)&&parts.length?parts.every(partDone):byCode.has(key);if(learnerDone)learnerCovered.add(key);if(learnerDone||other.has(key))covered.add(key)}
 return{...a,covered,learnerCovered,other,entries,byOpp}
}
function removeLearner(btn){
 btn.querySelectorAll?.(".evia-ksb-marker-v204.learner,.evia-ksb-marker-v203.learner,.evia-ksb-marker-v202.learner,.evia-ksb-marker-v107.learner").forEach(x=>x.remove());
 const rail=btn.querySelector?.(".evia-ksb-marker-rail-v204,.evia-ksb-marker-rail-v203,.evia-ksb-marker-rail-v202,.evia-ksb-marker-rail-v107");if(rail&&!rail.children.length)rail.remove()
}
function patch(){
 queued=false;const s=state();if(!s)return;
 document.querySelectorAll(".self-ksbs button[data-code]").forEach(btn=>{const code=String(btn.dataset.code||"").toUpperCase(),parts=s.criteria[code];if(Array.isArray(parts)&&parts.length&&!s.learnerCovered.has(code))removeLearner(btn)});
 const n=s.codes.filter(c=>s.covered.has(String(c).toUpperCase())).length,pct=Math.round(n/Math.max(1,s.codes.length)*100),arch=document.querySelector('[data-arch="KSB"],[data-arch="AC"]');
 if(arch){arch.querySelector(".arch-value")?.setAttribute("stroke-dasharray",`${pct} 100`);const num=arch.querySelector(".arch-number");if(num)num.textContent=`${pct}%`;arch.setAttribute("aria-label",`Course ${pct}%`)}
 const mini=[...document.querySelectorAll(".self-mini button")].find(b=>/course coverage/i.test(b.textContent||"")),text=mini?.querySelector("span");if(text)text.textContent=`${n} of ${s.codes.length} evidenced`;
 document.querySelectorAll("[data-opp]").forEach(btn=>{const id=String(btn.dataset.opp||""),part=Object.values(s.criteria).flat().find(x=>{const ids=Array.isArray(x?.opportunityIds)&&x.opportunityIds.length?x.opportunityIds:[x?.opportunityId];return ids.some(v=>String(v)===id)});if(!part)return;const copy=btn.querySelector(".option-row-copy small");if(copy&&!copy.dataset.criteriaLabel){copy.dataset.criteriaLabel="1";const prefix=document.createElement("span");prefix.className="evia-naxos-criterion-v223";prefix.textContent=`${part.parentCode} · criterion ${part.index} of ${part.total}`;copy.before(prefix)}})
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(patch))}
function start(){
 const native=Storage.prototype.setItem;if(!window.__eviaNaxosCriteriaStorage223){window.__eviaNaxosCriteriaStorage223=true;Storage.prototype.setItem=function(k,v){const r=native.call(this,k,v);if(this===localStorage&&String(k).startsWith(STORE))queue();return r}}
 document.addEventListener("click",e=>{if(e.target?.closest?.('[data-evia],[data-code],[data-opp],[data-action="coverage"],[data-action="save"]'))queue()},false);window.addEventListener("pageshow",queue);window.addEventListener("storage",queue);queue()
}
const style=document.createElement("style");style.textContent='.evia-naxos-criterion-v223{display:block!important;color:#929096!important;font-size:.54rem!important;font-weight:550!important;letter-spacing:.02em!important;margin:0 0 .12rem!important}';document.head.appendChild(style);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaNaxosEvidenceCriteriaV223=Object.freeze({version:VERSION,state,refresh:queue});
})();
