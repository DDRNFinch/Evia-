(()=>{
"use strict";
const VERSION=214,RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1",STYLE_ID="evia-option-source-sync-v214-style";
let codeMap=new Map(),queued=false,loading=false;
const ctx=()=>window.EviaCourseContext?.current?.()||null;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
function intersects(codes,set){return codes.some(code=>set.has(code))}
function marker(type,label){const mark=document.createElement("span");mark.className=`evia-option-source-v214 ${type}`;mark.textContent="✓";mark.title=label;mark.setAttribute("aria-label",label);mark.setAttribute("role","img");return mark}
function apply(){
  const active=window.EviaCoursePacks?.active?.(),naxos=active?.pathway?.naxosMappingPack===1||active?.pack?.naxosMappingPack===1;
  document.querySelectorAll("button[data-opp] .evia-option-source-rail-v214").forEach(x=>x.remove());
  if(naxos)return;
  const api=window.EviaEvidenceStateV204;if(!api||!codeMap.size)return;
  const rpl=new Set(api.rpl?.()||[]),milos=new Set(api.milos?.()||[]),witness=new Set(api.witness?.()||[]);
  document.querySelectorAll("button[data-opp]").forEach(btn=>{
    const side=btn.querySelector(":scope > .self-side");if(!side)return;
    const codes=codeMap.get(String(btn.dataset.opp||""))||[];
    if(!codes.length)return;
    const states=[];
    if(intersects(codes,rpl))states.push(["rpl","Recorded Prior Learning"]);
    if(intersects(codes,milos))states.push(["milos","Assessor Observation"]);
    if(intersects(codes,witness))states.push(["witness","Witness testimony"]);
    if(!states.length)return;
    const rail=document.createElement("em");rail.className="evia-option-source-rail-v214";rail.setAttribute("aria-label","Existing evidence sources");
    states.forEach(([type,label])=>rail.appendChild(marker(type,label)));
    const arrow=side.querySelector(":scope > i:last-child");side.insertBefore(rail,arrow||null)
  })
}
async function loadCodes(){
  if(loading)return;loading=true;
  try{
    const prefix=ctx()?.dataPrefix||"evia-site-data",parts=await Promise.all([1,2,3].map(async n=>{
      const text=await fetch(`./app/${prefix}-${n}.ts?v=99`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});
      const match=text.match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);if(!match)throw Error("data parse");return JSON.parse(match[1])
    }));
    const next=new Map();
    parts.flat().forEach(cat=>(cat.jobs||[]).forEach(job=>(job.opps||[]).forEach(o=>next.set(String(o.id),Array.isArray(o.codes)?o.codes.map(code=>String(code).toUpperCase()):[]))));
    codeMap=next;schedule()
  }catch(e){console.warn("Evia option source sync could not load the course map",e)}finally{loading=false}
}
function hookStorage(){
  if(window.__eviaOptionSourceStorageV214)return;window.__eviaOptionSourceStorageV214=true;
  const native=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){const out=native.call(this,key,value);if(this===localStorage&&[RPL_KEY,OBS_KEY,WITNESS_KEY].includes(String(key)))schedule();return out}
}
function relevant(node){return node?.nodeType===1&&(node.matches?.("button[data-opp]")||node.querySelector?.("button[data-opp]"))}
function start(){
  hookStorage();loadCodes();
  const root=document.getElementById("root")||document.body;
  if(root&&!root.__eviaOptionSourceObserverV214){root.__eviaOptionSourceObserverV214=true;new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(relevant(node)){schedule();return}}).observe(root,{childList:true,subtree:true})}
  document.addEventListener("click",e=>{if(e.target?.closest?.("[data-evia],[data-cat],[data-job],[data-opp],[data-action]"))schedule()},false);
  window.addEventListener("pageshow",schedule);window.addEventListener("storage",e=>{if([RPL_KEY,OBS_KEY,WITNESS_KEY].includes(e.key))schedule()});window.addEventListener("evia:milos-observed-changed",schedule);window.addEventListener("evia:witness-changed",schedule);window.addEventListener("evia:rpl-changed",schedule)
}
const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
.selfobs button[data-opp] .self-side>.evia-option-source-rail-v214{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.1rem!important;margin:0 .06rem 0 .1rem!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;font-style:normal!important}
.selfobs .evia-option-source-v214{display:inline-grid!important;place-items:center!important;width:.86rem!important;height:.86rem!important;min-width:.86rem!important;border-radius:50%!important;font:850 .58rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-style:normal!important;box-shadow:none!important}
.selfobs .evia-option-source-v214.rpl{background:#7b3fc6!important;color:#fff!important}
.selfobs .evia-option-source-v214.milos{background:#367fd0!important;color:#fff!important}
.selfobs .evia-option-source-v214.witness{background:#d88b45!important;color:#fff!important}
`;document.head.appendChild(style);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaOptionSourceSync=Object.freeze({version:VERSION,refresh:schedule,reload:loadCodes});
})();
