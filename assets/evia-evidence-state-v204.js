(()=>{
"use strict";
const VERSION=210,STORE="evia-selfobs-live-v3",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1",STYLE_ID="evia-evidence-state-v204-style";
let queued=false;
const LEGACY_MARKERS=[
  ".evia-ksb-marker-rail-v203",".evia-ksb-marker-v203",".evia-coverage-key-v203",
  ".evia-ksb-marker-rail-v202",".evia-ksb-marker-v202",".evia-opportunity-source-v202",".evia-coverage-key-v202",
  ".evia-ksb-marker-rail-v107",".evia-ksb-marker-rail-v106",".evia-opportunity-source-v107",".evia-opportunity-source-v106",
  ".evia-rpl-evidence-marks",".evia-milos-evidence-marks",".evia-source-tick-v105",".evia-rpl-o",".evia-milos-arch-marker",".evia-milos-observed-marker",
  ".evia-learner-source-v107",".evia-evidence-check"
].join(",");
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const ctx=()=>window.EviaCourseContext?.current?.()||null;
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"}
  return""
}
function entries(){const x=read(STORE,[]);return Array.isArray(x)?x:[]}
function learnerCodeSet(xs=entries()){const out=new Set();xs.forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).forEach(c=>out.add(String(c).toUpperCase())));return out}
function allowedSet(){return new Set((ctx()?.codes||[]).map(c=>String(c).toUpperCase()))}
function rplSet(){const allowed=allowedSet(),x=read(RPL_KEY,[]);return new Set((Array.isArray(x)?x:[]).map(c=>String(c).toUpperCase()).filter(c=>!allowed.size||allowed.has(c)))}
function routeMapSet(key){const c=ctx(),route=routeId(c),allowed=allowedSet(),map=read(key,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};return new Set(Object.keys(bucket||{}).map(x=>String(x).toUpperCase()).filter(code=>!allowed.size||allowed.has(code)))}
const milosSet=()=>routeMapSet(OBS_KEY),witnessSet=()=>routeMapSet(WITNESS_KEY);
function combinedCodeSet(xs=entries()){const out=learnerCodeSet(xs);rplSet().forEach(c=>out.add(c));milosSet().forEach(c=>out.add(c));witnessSet().forEach(c=>out.add(c));return out}
function removeLegacyMarkers(root=document){root.querySelectorAll?.(LEGACY_MARKERS).forEach(mark=>mark.remove())}
function clearOpportunityExtras(){
  document.querySelectorAll("button[data-opp] .self-side").forEach(side=>{
    removeLegacyMarkers(side);
    side.querySelectorAll(":scope > span,:scope > b[class]").forEach(mark=>mark.remove());
  })
}
function cleanKsbButton(btn){
  removeLegacyMarkers(btn);
  [...btn.children].forEach(el=>{if(el.tagName!=="B")el.remove()});
}
function setKsbMarkers(btn,learner,rpl,milos,witness){
  cleanKsbButton(btn);
  const states=[];
  if(learner)states.push(["learner","Learner evidence"]);
  const secondary=rpl?["rpl","Recorded Prior Learning"]:milos?["milos","Assessor Observation"]:witness?["witness","Witness testimony"]:null;
  if(secondary)states.push(secondary);
  if(!states.length)return;
  const rail=document.createElement("span");rail.className="evia-ksb-marker-rail-v204";rail.setAttribute("aria-label","Evidence sources");
  for(const[type,label]of states){const mark=document.createElement("i");mark.className=`evia-ksb-marker-v204 ${type}`;mark.textContent="✓";mark.title=label;mark.setAttribute("aria-label",label);mark.setAttribute("role","img");rail.appendChild(mark)}
  btn.appendChild(rail)
}
function setGroup(card,on){const em=card.querySelector("strong em");if(!em)return;em.textContent=on?"✓":"";em.classList.toggle("evia-group-check-v204",!!on)}
function setArchCoverage(covered){const c=ctx(),codes=(c?.codes||[]).map(x=>String(x).toUpperCase());if(!codes.length)return;const n=codes.filter(code=>covered.has(code)).length,pct=Math.round(n/codes.length*100),arch=document.querySelector('[data-arch="KSB"],[data-arch="AC"]');if(arch){const path=arch.querySelector(".arch-value"),num=arch.querySelector(".arch-number"),dash=`${pct} 100`;if(path)path.setAttribute("stroke-dasharray",dash);if(num)num.textContent=`${pct}%`}const mini=[...document.querySelectorAll(".self-mini button")].find(b=>/course coverage/i.test(b.textContent||"")),text=mini?.querySelector("span");if(text)text.textContent=`${n} of ${codes.length} evidenced`}
function legend(){const title=[...document.querySelectorAll(".self-title")].find(x=>(x.textContent||"").trim()==="Course coverage");if(!title)return;title.nextElementSibling?.classList?.contains("self-copy")&&title.nextElementSibling.remove();title.parentElement?.querySelectorAll(":scope > .evia-coverage-key-v204,:scope > .evia-coverage-key-v203,:scope > .evia-coverage-key-v202,:scope > .evia-coverage-key-v107").forEach(x=>x.remove());const key=document.createElement("div");key.className="evia-coverage-key-v204";key.innerHTML='<span><i class="learner">✓</i><b>Learner evidence</b></span><span><i class="rpl">✓</i><b>Recorded Prior Learning</b></span><span><i class="milos">✓</i><b>Assessor Observation</b></span><span><i class="witness">✓</i><b>Witness testimony</b></span>';title.insertAdjacentElement("afterend",key)}
function patch(){queued=false;removeLegacyMarkers();clearOpportunityExtras();const xs=entries(),learner=learnerCodeSet(xs),rpl=rplSet(),milos=milosSet(),witness=witnessSet(),covered=combinedCodeSet(xs);document.querySelectorAll(".self-ksbs button[data-code]").forEach(btn=>{const code=String(btn.dataset.code||"").toUpperCase();setKsbMarkers(btn,learner.has(code),rpl.has(code),milos.has(code),witness.has(code))});document.querySelectorAll(".self-card.group").forEach(card=>setGroup(card,!!card.querySelector(".self-entry")));setArchCoverage(covered);legend()}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
function hookStorage(){if(window.__eviaEvidenceStateStorageV204)return;window.__eviaEvidenceStateStorageV204=true;const native=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){const out=native.call(this,key,value);if(this===localStorage&&[STORE,RPL_KEY,OBS_KEY,WITNESS_KEY].includes(String(key)))queue();return out}}
function start(){hookStorage();removeLegacyMarkers();queue();document.addEventListener("click",event=>{if(event.target?.closest?.('[data-evia],[data-cat],[data-job],[data-opp],[data-action="back"],[data-action="coverage"],.progress-arch[data-arch="KSB"],.progress-arch[data-arch="AC"]'))queue()},false);window.addEventListener("pageshow",queue);window.addEventListener("storage",e=>{if([STORE,RPL_KEY,OBS_KEY,WITNESS_KEY].includes(e.key))queue()});window.addEventListener("evia:milos-observed-changed",queue);window.addEventListener("evia:witness-changed",queue)}
const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
.selfobs .evia-ksb-marker-rail-v204{display:flex!important;justify-content:center!important;align-items:center!important;gap:.1rem!important;min-height:.86rem!important;margin:.18rem auto 0!important}
.selfobs .evia-ksb-marker-v204,.evia-coverage-key-v204 i{display:inline-grid!important;place-items:center!important;width:.86rem!important;height:.86rem!important;min-width:.86rem!important;border-radius:50%!important;font:850 .58rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-style:normal!important;box-shadow:none!important}
.selfobs .evia-ksb-marker-v204.learner,.evia-coverage-key-v204 i.learner{background:#efc33d!important;color:#4c3b0b!important}
.selfobs .evia-ksb-marker-v204.rpl,.evia-coverage-key-v204 i.rpl{background:#7b3fc6!important;color:#fff!important}
.selfobs .evia-ksb-marker-v204.milos,.evia-coverage-key-v204 i.milos{background:#367fd0!important;color:#fff!important}
.selfobs .evia-ksb-marker-v204.witness,.evia-coverage-key-v204 i.witness{background:#d88b45!important;color:#fff!important}
.evia-coverage-key-v204{display:grid;grid-template-columns:repeat(2,max-content);justify-content:center;gap:.34rem .85rem;margin:.45rem auto .7rem;max-width:100%;font-size:.55rem;color:#6f6d73}
.evia-coverage-key-v204>span{display:flex;align-items:center;gap:.32rem;white-space:nowrap}
.evia-coverage-key-v204 b{font:500 .55rem/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif;color:#6f6d73}
.evia-group-check-v204{color:#d3a817!important}
`;document.head.appendChild(style);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
const api=Object.freeze({version:VERSION,refresh:queue,covered:()=>[...combinedCodeSet()],rpl:()=>[...rplSet()],milos:()=>[...milosSet()],witness:()=>[...witnessSet()]});window.EviaEvidenceStateV204=api;window.EviaEvidenceStateV203=api;window.EviaEvidenceStateV202=api;window.EviaEvidenceStateV107=api;window.EviaEvidenceStateV106=api;window.EviaEvidenceStateV105=api;
})();
