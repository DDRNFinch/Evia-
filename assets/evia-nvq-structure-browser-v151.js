(()=>{
"use strict";
const VERSION=240,RPL_KEY="evia-rpl-ksbs-v1",EVIDENCE_KEY="evia-selfobs-live-v3",OBS_KEY="evia-mini-milos-observed-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const numeric=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"&&c?.courseId==="6570-05"?c:null}
function meta(){return window.EviaTrowelMeta||null}
function desc(code){return window.EviaTrowelACText?.describe?.(code)||window.EviaTrowelHandbook?.describe?.(code)||"Assessment criterion"}
function routeId(c=ctx()){if(!c)return"";const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}
function snapshot(){
  const c=ctx(),allowed=new Set(c?.codes||[]),rawRpl=read(RPL_KEY,[]),rpl=new Set((Array.isArray(rawRpl)?rawRpl:[]).filter(code=>allowed.has(code))),evidence=new Map(),xs=read(EVIDENCE_KEY,[]),observedMap=read(OBS_KEY,{}),observed=new Set(Object.keys(observedMap?.[routeId(c)]||{}).filter(code=>allowed.has(code)));
  if(Array.isArray(xs))xs.forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).forEach(code=>{if(allowed.has(code))evidence.set(code,(evidence.get(code)||0)+1)}));
  const covered=new Set([...rpl,...observed]);evidence.forEach((n,code)=>{if(n>0)covered.add(code)});
  return{allowed,rpl,evidence,observed,covered}
}
function stats(codes,s){const xs=[...new Set((codes||[]).filter(code=>s.allowed.has(code)))];return{codes:xs,total:xs.length,covered:xs.filter(c=>s.covered.has(c)).length,rpl:xs.filter(c=>s.rpl.has(c)).length,observed:xs.filter(c=>s.observed.has(c)).length}}
function close(){document.querySelector(".evia-nvq-structure-layer-v151")?.remove()}
function layer(body,title,back=close){close();document.querySelector(".evia-nvq-ac-browser-layer")?.remove();const el=document.createElement("div");el.className="evia-tools-layer evia-nvq-layer evia-nvq evia-nvq-ac-browser-layer evia-nvq-structure-layer-v151";el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-nvq151-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;document.body.appendChild(el);el.querySelector("[data-nvq151-back]").onclick=back;return el}
function overall(s){const c=ctx(),st=stats(c?.codes||[],s),pct=st.total?Math.round(st.covered/st.total*100):0;return `<div class="evia-nvq-overall"><strong>${pct}%</strong><span>${st.covered} of ${st.total} official ACs covered · ${st.rpl} RPL · ${st.observed} assessor observed</span></div>`}
function unitCodes(unit,s){const m=meta();return (m?.unitCodes?.[String(unit)]||[]).filter(code=>s.allowed.has(code)).sort(numeric)}
function routeUnits(s){
  const c=ctx(),m=meta();if(!c||!m)return[];
  const configured=Array.isArray(c.units)?c.units:[];
  const fallback=m.routeUnits?.[String(c.pathway||"thin").toLowerCase()]||[];
  return [...new Set((configured.length?configured:fallback).map(x=>String(x)))].filter(unit=>unitCodes(unit,s).length)
}
function unitTitle(unit){return meta()?.unitTitles?.[String(unit)]||`Unit ${unit}`}
function unitRow(unit,s){const st=stats(unitCodes(unit,s),s);return `<button type="button" class="evia-tools-row evia-acb-theme-row" data-nvq151-unit="${esc(unit)}"><span><b>Unit ${esc(unit)} — ${esc(unitTitle(unit))}</b><small>${st.covered}/${st.total} ACs covered</small></span><em>›</em></button>`}
function openUnits(){
  const s=snapshot(),units=routeUnits(s);if(!ctx()||!meta())return;
  const rows=units.map(unit=>unitRow(unit,s)).join("");
  const el=layer(`${overall(s)}${rows||'<div class="evia-nvq-empty">No qualification units are available for this pathway.</div>'}<p class="evia-nvq-note">Yellow = Evia evidence. Purple = recognised prior learning. Blue = observed as competent by the assessor in Milos.</p>`,`Course progress`,close);
  el.querySelectorAll("[data-nvq151-unit]").forEach(b=>b.onclick=()=>openUnit(b.dataset.nvq151Unit))
}
function status(code,s){const r=s.rpl.has(code),n=s.evidence.get(code)||0,o=s.observed.has(code);if(!r&&!n&&!o)return'<span class="evia-acb-status empty">Not covered</span>';return `<span class="evia-acb-status">${r?'<i class="evia-acb-rpl" title="Recognised prior learning">o</i>':""}${n?`<i class="evia-acb-evidence" title="Evia evidence items">${n>5?`o × ${n}`:"o".repeat(n)}</i>`:""}${o?'<i class="evia-milos-arch-marker" title="Observed as competent by assessor in Milos">o</i>':""}</span>`}
function acLabel(code,unit){const text=String(code),prefix=`${unit}.`;return text.startsWith(prefix)?text.slice(prefix.length):text}
function acRow(code,unit,s){return `<article class="evia-acb-ac${s.covered.has(code)?" covered":""}"><div class="evia-acb-ac-head"><b>AC ${esc(acLabel(code,unit))}</b>${status(code,s)}</div><p>${esc(desc(code))}</p></article>`}
function openUnit(unit){
  const s=snapshot(),codes=unitCodes(unit,s),st=stats(codes,s);if(!codes.length)return openUnits();
  layer(`<p class="evia-tools-kicker">Unit ${esc(unit)}</p><h2>${esc(unitTitle(unit))}</h2><p class="evia-tools-copy">${st.covered} of ${st.total} official assessment criteria covered.</p>${codes.map(code=>acRow(code,unit,s)).join("")}<p class="evia-nvq-note">Yellow = Evia evidence. Purple = recognised prior learning. Blue = observed as competent by the assessor in Milos.</p>`,`Unit ${unit}`,openUnits)
}
function intercept(e){if(!ctx())return;const target=e.target?.closest?.('[data-arch="AC"],[data-arch="KSB"],[data-action="coverage"]');if(!target)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openUnits()}
window.addEventListener("click",intercept,true);
window.addEventListener("evia:rpl-changed",()=>{if(document.querySelector(".evia-nvq-structure-layer-v151"))openUnits()});
window.EviaNvqStructureBrowser=Object.freeze({version:VERSION,open:openUnits,openUnit});
})();
