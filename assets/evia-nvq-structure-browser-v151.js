(()=>{
"use strict";
const VERSION=173,RPL_KEY="evia-rpl-ksbs-v1",EVIDENCE_KEY="evia-selfobs-live-v3",OBS_KEY="evia-mini-milos-observed-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const numeric=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"&&c?.courseId==="6570-05"?c:null}
function framework(){return window.EviaTrowelFramework||null}
function desc(code){return window.EviaTrowelACText?.describe?.(code)||window.EviaTrowelHandbook?.describe?.(code)||"Assessment criterion"}
function routeId(c=ctx()){if(!c)return"";const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}
function snapshot(){
  const c=ctx(),allowed=new Set(c?.codes||[]),rawRpl=read(RPL_KEY,[]),rpl=new Set((Array.isArray(rawRpl)?rawRpl:[]).filter(code=>allowed.has(code))),evidence=new Map(),xs=read(EVIDENCE_KEY,[]),observedMap=read(OBS_KEY,{}),observed=new Set(Object.keys(observedMap?.[routeId(c)]||{}).filter(code=>allowed.has(code)));
  if(Array.isArray(xs))xs.forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).forEach(code=>{if(allowed.has(code))evidence.set(code,(evidence.get(code)||0)+1)}));
  const covered=new Set([...rpl,...observed]);evidence.forEach((n,code)=>{if(n>0)covered.add(code)});
  return{allowed,rpl,evidence,observed,covered}
}
function stats(codes,s){const xs=[...new Set((codes||[]).filter(code=>s.allowed.has(code)))];return{codes:xs,total:xs.length,covered:xs.filter(c=>s.covered.has(c)).length,evidence:xs.filter(c=>(s.evidence.get(c)||0)>0).length,rpl:xs.filter(c=>s.rpl.has(c)).length,observed:xs.filter(c=>s.observed.has(c)).length}}
function close(){document.querySelector(".evia-nvq-structure-layer-v151")?.remove()}
function layer(body,title,back=close){close();document.querySelector(".evia-nvq-ac-browser-layer")?.remove();const el=document.createElement("div");el.className="evia-tools-layer evia-nvq-layer evia-nvq evia-nvq-ac-browser-layer evia-nvq-structure-layer-v151";el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-nvq151-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;document.body.appendChild(el);el.querySelector("[data-nvq151-back]").onclick=back;return el}
function relevantCodes(activity,s){return (activity.codes||[]).filter(code=>s.allowed.has(code))}
function overall(s){const c=ctx(),st=stats(c?.codes||[],s),pct=st.total?Math.round(st.covered/st.total*100):0;return `<div class="evia-nvq-overall"><strong>${pct}%</strong><span>${st.covered} of ${st.total} official ACs covered · ${st.rpl} RPL · ${st.observed} assessor observed</span></div>`}
function groupCodes(group,s){return group.subcategories.flatMap(sub=>sub.activities.flatMap(a=>relevantCodes(a,s)))}
function subCodes(sub,s){return sub.activities.flatMap(a=>relevantCodes(a,s))}
function row(id,title,st,attr,extra=""){const evidenceDot=st.evidence?'<i class="evia-acb-row-evidence" title="Learner evidence recorded" aria-label="Learner evidence recorded"></i>':"";return `<button type="button" class="evia-tools-row evia-acb-theme-row" ${attr}="${esc(id)}"><span><b>${esc(title)}</b><small>${st.covered}/${st.total} ACs covered${extra}</small></span><em>${evidenceDot}›</em></button>`}
function openGroups(){
  const s=snapshot(),f=framework();if(!f)return;
  const rows=(f.groups||[]).map(g=>{const st=stats(groupCodes(g,s),s),activities=g.subcategories.reduce((n,sub)=>n+sub.activities.filter(a=>relevantCodes(a,s).length).length,0);return st.total?row(g.id,g.title,st,"data-nvq151-group",` · ${activities} activit${activities===1?"y":"ies"}`):""}).join("");
  const el=layer(`${overall(s)}<p class="evia-tools-copy evia-acb-intro">AC coverage now follows the same NVQ structure used to collect evidence. Open a category, sub-category and activity to see the official ACs mapped underneath it.</p>${rows}<p class="evia-nvq-note">Yellow = Evia evidence. Purple = recognised prior learning. Blue = observed as competent by the assessor in Milos.</p>`,`AC coverage`,close);
  el.querySelectorAll("[data-nvq151-group]").forEach(b=>b.onclick=()=>openGroup(b.dataset.nvq151Group))
}
function openGroup(id){
  const s=snapshot(),g=framework()?.groups?.find(x=>x.id===id);if(!g)return openGroups();
  const rows=g.subcategories.map(sub=>{const st=stats(subCodes(sub,s),s);return st.total?row(sub.id,sub.title,st,"data-nvq151-sub",` · ${sub.activities.filter(a=>relevantCodes(a,s).length).length} activities`):""}).join("");
  const st=stats(groupCodes(g,s),s),el=layer(`<p class="evia-tools-kicker">Main category ${esc(g.id)}</p><h2>${esc(g.title)}</h2><p class="evia-tools-copy">${st.covered} of ${st.total} mapped ACs are covered.</p>${rows}`,g.title,openGroups);
  el.querySelectorAll("[data-nvq151-sub]").forEach(b=>b.onclick=()=>openSub(g.id,b.dataset.nvq151Sub))
}
function openSub(groupId,subId){
  const s=snapshot(),g=framework()?.groups?.find(x=>x.id===groupId),sub=g?.subcategories?.find(x=>x.id===subId);if(!sub)return openGroup(groupId);
  const rows=sub.activities.map(a=>{const st=stats(relevantCodes(a,s),s);return st.total?row(a.code,a.title,st,"data-nvq151-activity"):""}).join("");
  const st=stats(subCodes(sub,s),s),el=layer(`<p class="evia-tools-kicker">Sub-category ${esc(sub.id)}</p><h2>${esc(sub.title)}</h2><p class="evia-tools-copy">${st.covered} of ${st.total} mapped ACs are covered.</p>${rows}`,sub.title,()=>openGroup(groupId));
  el.querySelectorAll("[data-nvq151-activity]").forEach(b=>b.onclick=()=>openActivity(groupId,subId,b.dataset.nvq151Activity))
}
function status(code,s){const r=s.rpl.has(code),n=s.evidence.get(code)||0,o=s.observed.has(code);if(!r&&!n&&!o)return'<span class="evia-acb-status empty">Not covered</span>';return `<span class="evia-acb-status">${r?'<i class="evia-acb-rpl" title="Recognised prior learning">o</i>':""}${n?'<i class="evia-acb-evidence" title="Learner evidence recorded" aria-label="Learner evidence recorded"></i>':""}${o?'<i class="evia-milos-arch-marker" title="Observed as competent by assessor in Milos">o</i>':""}</span>`}
function acRow(code,s){return `<article class="evia-acb-ac${s.covered.has(code)?" covered":""}"><div class="evia-acb-ac-head"><b>Unit ${esc(String(code).split(".")[0])} · AC ${esc(String(code).split(".").slice(1).join("."))}</b>${status(code,s)}</div><p>${esc(desc(code))}</p></article>`}
function openActivity(groupId,subId,code){
  const s=snapshot(),g=framework()?.groups?.find(x=>x.id===groupId),sub=g?.subcategories?.find(x=>x.id===subId),a=sub?.activities?.find(x=>x.code===code);if(!a)return openSub(groupId,subId);
  const codes=relevantCodes(a,s).slice().sort(numeric),st=stats(codes,s),practical=Array.isArray(a.stages)&&a.stages.length?`<p class="evia-tools-copy">This practical activity is collected through ${a.stages.length} visible evidence activities: ${a.stages.map((x,i)=>`${a.code}.${i+1} ${x.title}`).join(" · ")}.</p>`:"";
  layer(`<p class="evia-tools-kicker">Activity ${esc(a.code)}</p><h2>${esc(a.title)}</h2><p class="evia-tools-copy">${st.covered} of ${st.total} mapped ACs are covered.</p>${practical}${codes.map(c=>acRow(c,s)).join("")}`,a.code,()=>openSub(groupId,subId))
}
function intercept(e){if(!ctx())return;const target=e.target?.closest?.('[data-arch="AC"],[data-arch="KSB"],[data-action="coverage"]');if(!target)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openGroups()}
window.addEventListener("click",intercept,true);
window.addEventListener("evia:rpl-changed",()=>{if(document.querySelector(".evia-nvq-structure-layer-v151"))openGroups()});
window.EviaNvqStructureBrowser=Object.freeze({version:VERSION,open:openGroups});
})();
