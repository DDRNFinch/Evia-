(()=>{
"use strict";
const VERSION=214,STORE="evia-selfobs-live-v3",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1",STYLE_ID="evia-linked-source-markers-v214-style";
const parts=new Map(),categoryCodes=new Map(),jobCodes=new Map(),opportunityCodes=new Map();
let queued=false,observer=null;
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const ctx=()=>window.EviaCourseContext?.current?.()||null;
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"}
  return""
}
function allowedSet(){return new Set((ctx()?.codes||[]).map(c=>String(c).toUpperCase()))}
function learnerSet(){const out=new Set(),xs=read(STORE,[]);(Array.isArray(xs)?xs:[]).forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).forEach(c=>out.add(String(c).toUpperCase())));return out}
function rplSet(){const allowed=allowedSet(),xs=read(RPL_KEY,[]);return new Set((Array.isArray(xs)?xs:[]).map(c=>String(c).toUpperCase()).filter(c=>!allowed.size||allowed.has(c)))}
function routeMapSet(key){const c=ctx(),route=routeId(c),allowed=allowedSet(),map=read(key,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};return new Set(Object.keys(bucket||{}).map(c=>String(c).toUpperCase()).filter(c=>!allowed.size||allowed.has(c)))}
const milosSet=()=>routeMapSet(OBS_KEY),witnessSet=()=>routeMapSet(WITNESS_KEY);
function addCodes(map,id,codes){if(!id)return;let set=map.get(String(id));if(!set){set=new Set();map.set(String(id),set)};(Array.isArray(codes)?codes:[]).forEach(code=>set.add(String(code).toUpperCase()))}
function rebuildMap(){
  categoryCodes.clear();jobCodes.clear();opportunityCodes.clear();
  for(const data of parts.values())for(const category of Array.isArray(data)?data:[]){
    const categoryAll=[];
    for(const job of Array.isArray(category?.jobs)?category.jobs:[]){
      const jobAll=[];
      for(const opp of Array.isArray(job?.opps)?job.opps:[]){const codes=Array.isArray(opp?.codes)?opp.codes:[];addCodes(opportunityCodes,opp?.id,codes);jobAll.push(...codes)}
      addCodes(jobCodes,job?.id,jobAll);categoryAll.push(...jobAll)
    }
    addCodes(categoryCodes,category?.id,categoryAll)
  }
  queue()
}
function parseCoursePart(text,part){try{const m=String(text||"").match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);if(!m)return;const data=JSON.parse(m[1]);if(!Array.isArray(data))return;parts.set(String(part),data);rebuildMap()}catch{}}
function hookFetch(){
  if(window.__eviaLinkedSourceMarkersV214Fetch)return;
  window.__eviaLinkedSourceMarkersV214Fetch=true;
  const native=window.fetch?.bind(window);if(!native)return;
  window.fetch=async function(input,init){const response=await native(input,init);try{const value=typeof input==="string"?input:input?.url||"",match=String(value).match(/\/app\/[^/?]+-(\d+)\.ts(?:\?|$)/);if(match)response.clone().text().then(text=>parseCoursePart(text,match[1])).catch(()=>{})}catch{}return response}
}
function codesForRow(row){if(row.dataset.opp)return opportunityCodes.get(row.dataset.opp)||null;if(row.dataset.job)return jobCodes.get(row.dataset.job)||null;if(row.dataset.cat)return categoryCodes.get(row.dataset.cat)||null;return null}
function hasAny(codes,set){if(!codes||!set?.size)return false;for(const code of codes)if(set.has(code))return true;return false}
function marker(type,label){const i=document.createElement("i");i.className=`evia-linked-source-v214 ${type}`;i.textContent="✓";i.title=label;i.setAttribute("aria-label",label);i.setAttribute("role","img");return i}
function decorate(){
  queued=false;
  const learner=learnerSet(),rpl=rplSet(),milos=milosSet(),witness=witnessSet();
  document.querySelectorAll(".selfobs .option-row[data-cat],.selfobs .option-row[data-job],.selfobs .option-row[data-opp]").forEach(row=>{
    const side=row.querySelector(":scope > .self-side"),codes=codesForRow(row);if(!side||!codes)return;
    side.querySelectorAll(":scope > .evia-linked-source-rail-v214,:scope > b").forEach(el=>el.remove());
    const states=[];
    if(hasAny(codes,learner))states.push(["learner","Learner evidence"]);
    if(hasAny(codes,rpl))states.push(["rpl","Recorded Prior Learning"]);
    if(hasAny(codes,milos))states.push(["milos","Assessor Observation"]);
    if(hasAny(codes,witness))states.push(["witness","Witness testimony"]);
    row.dataset.eviaLinkedSources=states.map(([type])=>type).join(" ");
    if(!states.length)return;
    const rail=document.createElement("em");rail.className="evia-linked-source-rail-v214";rail.setAttribute("aria-label","Evidence sources");
    states.forEach(([type,label])=>rail.appendChild(marker(type,label)));
    const chevron=side.querySelector(":scope > i");side.insertBefore(rail,chevron||null)
  })
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(decorate)}
function relevant(node){return node?.nodeType===1&&(node.matches?.(".option-row,[data-cat],[data-job],[data-opp],.self-panel")||node.querySelector?.(".option-row,[data-cat],[data-job],[data-opp]"))}
function hookStorage(){if(window.__eviaLinkedSourceMarkersV214Storage)return;window.__eviaLinkedSourceMarkersV214Storage=true;const native=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){const result=native.call(this,key,value);if(this===localStorage&&[STORE,RPL_KEY,OBS_KEY,WITNESS_KEY].includes(String(key)))queue();return result}}
function start(){
  hookStorage();queue();
  const root=document.getElementById("root")||document.body;if(root&&!observer){observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(relevant(node)){queue();return}});observer.observe(root,{childList:true,subtree:true})}
  window.addEventListener("pageshow",queue);window.addEventListener("storage",e=>{if([STORE,RPL_KEY,OBS_KEY,WITNESS_KEY].includes(e.key))queue()});window.addEventListener("evia:milos-observed-changed",queue);window.addEventListener("evia:witness-changed",queue)
}
const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
.selfobs .evia-linked-source-rail-v214{display:inline-flex!important;align-items:center!important;justify-content:flex-end!important;gap:.1rem!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;font-style:normal!important}
.selfobs .evia-linked-source-v214{display:inline-grid!important;place-items:center!important;width:.86rem!important;height:.86rem!important;min-width:.86rem!important;border-radius:50%!important;font:850 .58rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-style:normal!important;box-shadow:none!important}
.selfobs .evia-linked-source-v214.learner{background:#efc33d!important;color:#4c3b0b!important}
.selfobs .evia-linked-source-v214.rpl{background:#7b3fc6!important;color:#fff!important}
.selfobs .evia-linked-source-v214.milos{background:#367fd0!important;color:#fff!important}
.selfobs .evia-linked-source-v214.witness{background:#d88b45!important;color:#fff!important}
`;document.head.appendChild(style);
hookFetch();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaLinkedSourceMarkersV214=Object.freeze({version:VERSION,refresh:queue,rebuild:rebuildMap});
})();
