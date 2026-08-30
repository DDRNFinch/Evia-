(()=>{
"use strict";
const VERSION=241,RPL_KEY="evia-rpl-ksbs-v1",EVIDENCE_KEY="evia-selfobs-live-v3",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1",STYLE_ID="evia-nvq-structure-v241-style";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const numeric=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"?c:null}
function meta(){return window.EviaTrowelMeta||null}
function desc(code){return meta()?.codeDescriptions?.[String(code)]||window.EviaTrowelACText?.describe?.(code)||window.EviaTrowelHandbook?.describe?.(code)||"Assessment criterion"}
function routeIds(c=ctx()){if(!c)return[];const p=String(c.pathway||"thin"),up=p.toUpperCase(),ids=[];if(c.courseId==="6570-05")ids.push(({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[up]||"6570-05-THIN");ids.push(`${c.courseId}-${up}`,p,up);return[...new Set(ids.filter(Boolean))]}
function routeSet(key,c=ctx()){
  const allowed=new Set((c?.codes||[]).map(String)),map=read(key,{}),out=new Set();
  for(const id of routeIds(c)){const bucket=map&&typeof map[id]==="object"?map[id]:{};Object.keys(bucket||{}).map(String).filter(code=>allowed.has(code)).forEach(code=>out.add(code))}
  return out
}
function snapshot(){
  const c=ctx(),allowed=new Set((c?.codes||[]).map(String)),rawRpl=read(RPL_KEY,[]),rpl=new Set((Array.isArray(rawRpl)?rawRpl:[]).map(String).filter(code=>allowed.has(code))),evidence=new Map(),xs=read(EVIDENCE_KEY,[]),observed=routeSet(OBS_KEY,c),witness=routeSet(WITNESS_KEY,c),active=window.EviaCoursePacks?.active?.(),isNaxos=active?.pathway?.naxosMappingPack===1||active?.pack?.naxosMappingPack===1,criteria=isNaxos?window.EviaNaxosEvidenceCriteriaV223?.state?.():null;
  if(criteria?.learnerCovered){for(const code of criteria.learnerCovered){if(allowed.has(String(code)))evidence.set(String(code),1)}}else if(Array.isArray(xs))xs.forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).map(String).forEach(code=>{if(allowed.has(code))evidence.set(code,(evidence.get(code)||0)+1)}));
  const covered=new Set([...rpl,...observed,...witness]);evidence.forEach((n,code)=>{if(n>0)covered.add(code)});
  return{allowed,rpl,evidence,observed,witness,covered}
}
function stats(codes,s){const xs=[...new Set((codes||[]).map(String).filter(code=>s.allowed.has(code)))];return{codes:xs,total:xs.length,covered:xs.filter(c=>s.covered.has(c)).length,rpl:xs.filter(c=>s.rpl.has(c)).length,observed:xs.filter(c=>s.observed.has(c)).length,witness:xs.filter(c=>s.witness.has(c)).length}}
function close(){document.querySelector(".evia-nvq-structure-layer-v241")?.remove();document.querySelector(".evia-nvq-structure-layer-v151")?.remove()}
function layer(body,title,back=close){close();document.querySelector(".evia-nvq-ac-browser-layer")?.remove();const el=document.createElement("div");el.className="evia-tools-layer evia-nvq-layer evia-nvq evia-nvq-ac-browser-layer evia-nvq-structure-layer-v241";el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-nvq241-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;document.body.appendChild(el);el.querySelector("[data-nvq241-back]").onclick=back;return el}
function overall(s){const c=ctx(),st=stats(c?.codes||[],s),pct=st.total?Math.round(st.covered/st.total*100):0;return `<div class="evia-nvq-overall"><strong>${pct}%</strong><span>${st.covered} of ${st.total} official ACs covered · ${st.rpl} RPL · ${st.observed} Milos · ${st.witness} Tinos</span></div>`}
function unitCodes(unit,s){const m=meta();return (m?.unitCodes?.[String(unit)]||[]).map(String).filter(code=>s.allowed.has(code)).sort(numeric)}
function routeUnits(s){
  const c=ctx(),m=meta();if(!c||!m)return[];
  const configured=Array.isArray(c.units)?c.units:[];
  const fallback=m.routeUnits?.[String(c.pathway||"thin").toLowerCase()]||[];
  return [...new Set((configured.length?configured:fallback).map(x=>String(x)))].filter(unit=>unitCodes(unit,s).length)
}
function unitTitle(unit){return meta()?.unitTitles?.[String(unit)]||`Unit ${unit}`}
function unitRow(unit,s){const st=stats(unitCodes(unit,s),s);return `<button type="button" class="evia-tools-row evia-acb-theme-row" data-nvq241-unit="${esc(unit)}"><span><b>Unit ${esc(unit)} — ${esc(unitTitle(unit))}</b><small>${st.covered}/${st.total} ACs covered</small></span><em>›</em></button>`}
function legend(){return '<p class="evia-nvq-note">Yellow ✓ = Evia evidence. Purple ✓ = RPL. Blue ✓ = Milos observation. Orange ✓ = Tinos witness testimony.</p>'}
function openUnits(){
  const s=snapshot(),units=routeUnits(s);if(!ctx()||!meta())return;
  const rows=units.map(unit=>unitRow(unit,s)).join("");
  const el=layer(`${overall(s)}${rows||'<div class="evia-nvq-empty">No qualification units are available for this pathway.</div>'}${legend()}`,`Course progress`,close);
  el.querySelectorAll("[data-nvq241-unit]").forEach(b=>b.onclick=()=>openUnit(b.dataset.nvq241Unit))
}
function sourceTick(type,label){return `<i class="evia-acb-source-tick ${type}" title="${esc(label)}" aria-label="${esc(label)}" role="img">✓</i>`}
function status(code,s){
  const marks=[];
  if((s.evidence.get(code)||0)>0)marks.push(sourceTick("learner","Evia evidence"));
  if(s.rpl.has(code))marks.push(sourceTick("rpl","Recognised prior learning"));
  if(s.observed.has(code))marks.push(sourceTick("milos","Observed as competent by assessor in Milos"));
  if(s.witness.has(code))marks.push(sourceTick("witness","Witness testimony from Tinos"));
  return marks.length?`<span class="evia-acb-status">${marks.join("")}</span>`:'<span class="evia-acb-status empty">Not covered</span>'
}
function acLabel(code,unit){const text=String(code),prefix=`${unit}.`;return text.startsWith(prefix)?text.slice(prefix.length):text}
function acRow(code,unit,s){return `<article class="evia-acb-ac${s.covered.has(code)?" covered":""}"><div class="evia-acb-ac-head"><b>AC ${esc(acLabel(code,unit))}</b>${status(code,s)}</div><p>${esc(desc(code))}</p></article>`}
function openUnit(unit){
  const s=snapshot(),codes=unitCodes(unit,s),st=stats(codes,s);if(!codes.length)return openUnits();
  layer(`<p class="evia-tools-kicker">Unit ${esc(unit)}</p><h2>${esc(unitTitle(unit))}</h2><p class="evia-tools-copy">${st.covered} of ${st.total} official assessment criteria covered.</p>${codes.map(code=>acRow(code,unit,s)).join("")}${legend()}`,`Unit ${unit}`,openUnits)
}
function refreshOpen(){const layerEl=document.querySelector(".evia-nvq-structure-layer-v241");if(!layerEl)return;const title=layerEl.querySelector(".evia-tools-head b")?.textContent||"";const unit=title.match(/^Unit\s+(\d+)$/i)?.[1];requestAnimationFrame(()=>unit?openUnit(unit):openUnits())}
function intercept(e){if(!ctx())return;const target=e.target?.closest?.('[data-arch="AC"],[data-arch="KSB"],[data-action="coverage"]');if(!target)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openUnits()}
function installStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
.evia-nvq-structure-layer-v241 .evia-acb-status{display:flex!important;align-items:center!important;gap:.18rem!important;white-space:nowrap!important}
.evia-nvq-structure-layer-v241 .evia-acb-source-tick{display:inline-grid!important;place-items:center!important;width:.92rem!important;height:.92rem!important;min-width:.92rem!important;border-radius:50%!important;font:850 .62rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-style:normal!important;box-shadow:none!important}
.evia-nvq-structure-layer-v241 .evia-acb-source-tick.learner{background:#efc33d!important;color:#4c3b0b!important}
.evia-nvq-structure-layer-v241 .evia-acb-source-tick.rpl{background:#7b3fc6!important;color:#fff!important}
.evia-nvq-structure-layer-v241 .evia-acb-source-tick.milos{background:#367fd0!important;color:#fff!important}
.evia-nvq-structure-layer-v241 .evia-acb-source-tick.witness{background:#d88b45!important;color:#fff!important}
`;document.head.appendChild(style)}
installStyle();
window.addEventListener("click",intercept,true);
["evia:rpl-changed","evia:milos-observed-changed","evia:witness-changed","evia:nvq-coverage-changed"].forEach(name=>window.addEventListener(name,refreshOpen));
window.addEventListener("storage",e=>{if([RPL_KEY,OBS_KEY,WITNESS_KEY,EVIDENCE_KEY].includes(e.key))refreshOpen()});
window.EviaNvqStructureBrowser=Object.freeze({version:VERSION,open:openUnits,openUnit,refresh:refreshOpen});
})();
