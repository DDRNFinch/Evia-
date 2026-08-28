(()=>{
"use strict";
const VERSION=240;
const EVIDENCE_KEY="evia-selfobs-live-v3",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}};
const numeric=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"?c:null}
function meta(){return window.EviaTrowelMeta||null}
function desc(code){return window.EviaTrowelACText?.describe?.(code)||window.EviaTrowelHandbook?.describe?.(code)||"Assessment criterion"}
function routeId(c=ctx()){
  if(!c||c.courseId!=="6570-05")return"";
  const pathway=String(c.pathway||"thin").toUpperCase();
  return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[pathway]||"6570-05-THIN"
}
function snapshot(){
  const c=ctx(),allowed=new Set(c?.codes||[]),rawRpl=read(RPL_KEY,[]),rpl=new Set((Array.isArray(rawRpl)?rawRpl:[]).filter(code=>allowed.has(code))),evidence=new Map(),observedMap=read(OBS_KEY,{}),route=routeId(c),bucket=route&&observedMap&&typeof observedMap[route]==="object"?observedMap[route]:{},observed=new Set(Object.keys(bucket||{}).filter(code=>allowed.has(code)));
  const entries=read(EVIDENCE_KEY,[]);
  if(Array.isArray(entries))entries.forEach(entry=>(Array.isArray(entry?.codes)?entry.codes:[]).forEach(code=>{if(allowed.has(code))evidence.set(code,(evidence.get(code)||0)+1)}));
  const covered=new Set([...rpl,...observed]);
  evidence.forEach((count,code)=>{if(count>0)covered.add(code)});
  return{allowed,rpl,evidence,observed,covered}
}
function unitCodes(unit,c=ctx(),m=meta()){
  const mapped=Array.isArray(m?.unitCodes?.[String(unit)])?m.unitCodes[String(unit)]:[];
  const fallback=(c?.codes||[]).filter(code=>String(code).split(".")[0]===String(unit));
  return [...new Set((mapped.length?mapped:fallback).filter(code=>c?.codes?.includes(code)))].sort(numeric)
}
function unitStats(){
  const c=ctx(),m=meta(),s=snapshot();if(!c)return[];
  return(c.units||[]).map(unit=>{
    const codes=unitCodes(unit,c,m),covered=codes.filter(code=>s.covered.has(code)).length,rpl=codes.filter(code=>s.rpl.has(code)).length,observed=codes.filter(code=>s.observed.has(code)).length;
    return{unit:String(unit),title:m?.unitTitles?.[String(unit)]||`Unit ${unit}`,codes,covered,rpl,observed,pct:codes.length?Math.round(covered/codes.length*100):0}
  })
}
function close(){document.querySelector(".evia-course-matrix-layer-v240")?.remove()}
function layer(body,title,back=close){
  close();document.querySelector(".evia-nvq-layer")?.remove();document.querySelector(".evia-tools-layer:not(.evia-course-matrix-layer-v240)")?.remove();
  const el=document.createElement("div");el.className="evia-tools-layer evia-nvq-layer evia-nvq evia-course-matrix-layer-v240";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-course-matrix-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-course-matrix-back]").onclick=back;return el
}
function markerCounts(row){
  const bits=[];
  if(row.observed)bits.push(`<span><i class="evia-milos-arch-marker" aria-hidden="true">o</i> ${row.observed} observed</span>`);
  if(row.rpl)bits.push(`<span><i class="evia-nvq-rpl-mark" aria-hidden="true">o</i> ${row.rpl} RPL</span>`);
  return bits.length?` · ${bits.join(" · ")}`:""
}
function overall(s){
  const c=ctx(),codes=(c?.codes||[]).filter(code=>s.allowed.has(code)),covered=codes.filter(code=>s.covered.has(code)).length,pct=codes.length?Math.round(covered/codes.length*100):0;
  return{covered,total:codes.length,pct}
}
function openMatrix(){
  const c=ctx(),rows=unitStats(),s=snapshot();if(!c)return;
  const total=overall(s);
  const el=layer(`
    <p class="evia-tools-kicker">Course matrix</p>
    <div class="evia-nvq-overall"><strong>${total.pct}%</strong><span>${total.covered} of ${total.total} official ACs covered</span></div>
    <p class="evia-tools-copy">Your qualification is shown by official unit. Evidence, RPL and assessor observations all feed into the unit coverage below.</p>
    ${rows.map(row=>`<button type="button" class="evia-tools-row evia-nvq-unit" data-course-matrix-unit="${esc(row.unit)}"><span><b>Unit ${esc(row.unit)}${row.observed?' <i class="evia-milos-arch-marker" title="Assessor-observed ACs">o</i>':""}${row.rpl?' <i class="evia-nvq-rpl-mark" title="Recognised prior learning">o</i>':""}</b><small>${esc(row.title)} · ${row.covered}/${row.codes.length} ACs covered${markerCounts(row)}</small></span><em>${row.pct}% ›</em></button>`).join("")}
    <p class="evia-nvq-note">Yellow = Evia evidence. Purple = recognised prior learning. Blue = observed as competent by the assessor in Milos.</p>
  `,"Course matrix",close);
  el.querySelectorAll("[data-course-matrix-unit]").forEach(button=>button.onclick=()=>openUnit(button.dataset.courseMatrixUnit))
}
function acStatus(code,s){
  const evidence=s.evidence.get(code)||0,rpl=s.rpl.has(code),observed=s.observed.has(code);
  if(!evidence&&!rpl&&!observed)return'<span class="evia-acb-status empty">Not covered</span>';
  return `<span class="evia-acb-status">${evidence?`<i class="evia-acb-evidence" title="Evia evidence">${evidence>5?`o × ${evidence}`:"o".repeat(evidence)}</i>`:""}${rpl?'<i class="evia-acb-rpl" title="Recognised prior learning">o</i>':""}${observed?'<i class="evia-milos-arch-marker" title="Observed as competent in Milos">o</i>':""}</span>`
}
function openUnit(unit){
  const row=unitStats().find(item=>item.unit===String(unit)),s=snapshot();if(!row)return openMatrix();
  layer(`
    <p class="evia-tools-kicker">Unit ${esc(row.unit)}</p>
    <h2>${esc(row.title)}</h2>
    <p class="evia-tools-copy">${row.covered} of ${row.codes.length} official ACs are covered${row.observed?` · ${row.observed} assessor observed`:""}${row.rpl?` · ${row.rpl} RPL`:""}.</p>
    ${row.codes.map(code=>`<article class="evia-acb-ac${s.covered.has(code)?" covered":""}"><div class="evia-acb-ac-head"><b>${esc(code)}</b>${acStatus(code,s)}</div><p>${esc(desc(code))}</p></article>`).join("")}
  `,`Unit ${row.unit}`,openMatrix)
}
function intercept(event){
  if(!ctx())return;
  const target=event.target?.closest?.('[data-arch="Course"],[data-arch="AC"],[data-arch="KSB"]');
  if(!target)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();openMatrix()
}
window.addEventListener("click",intercept,true);
window.addEventListener("evia:rpl-changed",()=>{if(document.querySelector(".evia-course-matrix-layer-v240"))openMatrix()});
window.addEventListener("evia:milos-observed-changed",()=>{if(document.querySelector(".evia-course-matrix-layer-v240"))openMatrix()});
window.EviaCourseMatrixV240=Object.freeze({version:VERSION,open:openMatrix,unitStats});
})();
