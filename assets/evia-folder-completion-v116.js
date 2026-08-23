(()=>{
"use strict";
const VERSION=116;
const STORE="evia-selfobs-live-v3",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1";
let DATA=[],dataKey="",dataPromise=null,queued=false;
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function ctx(){return window.EviaCourseContext?.current?.()||null}
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"}
  return""
}
function entries(){const x=read(STORE,[]);return Array.isArray(x)?x:[]}
function learnerOppSet(){return new Set(entries().map(e=>String(e?.opportunityId||"")).filter(Boolean))}
function allowedSet(){return new Set((ctx()?.codes||[]).map(c=>String(c).toUpperCase()))}
function rplSet(){const allowed=allowedSet(),x=read(RPL_KEY,[]);return new Set((Array.isArray(x)?x:[]).map(c=>String(c).toUpperCase()).filter(c=>!allowed.size||allowed.has(c)))}
function routeMapSet(key){const c=ctx(),route=routeId(c),allowed=allowedSet(),map=read(key,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};return new Set(Object.keys(bucket||{}).map(x=>String(x).toUpperCase()).filter(code=>!allowed.size||allowed.has(code)))}
function milosSet(){return routeMapSet(OBS_KEY)}
function witnessSet(){return routeMapSet(WITNESS_KEY)}
function codesOf(o){return(o?.codes||[]).map(c=>String(c).toUpperCase()).filter(Boolean)}
function allBy(o,set){const codes=codesOf(o);return !!codes.length&&codes.every(c=>set.has(c))}
function visibleComplete(o,learnerOpp,rpl,milos,witness){return !!o&&(learnerOpp.has(String(o.id))||allBy(o,rpl)||allBy(o,milos)||allBy(o,witness))}
function jobComplete(j,learnerOpp,rpl,milos,witness){const opps=(j?.opps||[]).filter(o=>codesOf(o).length);return !!opps.length&&opps.every(o=>visibleComplete(o,learnerOpp,rpl,milos,witness))}
function catComplete(c,learnerOpp,rpl,milos,witness){const jobs=(c?.jobs||[]).filter(j=>(j.opps||[]).some(o=>codesOf(o).length));return !!jobs.length&&jobs.every(j=>jobComplete(j,learnerOpp,rpl,milos,witness))}
async function ensureData(){
  const c=ctx();if(!c||c.noCourse||!c.dataPrefix)return[];
  const key=`${c.courseId}|${c.pathway||""}|${c.dataPrefix}`;
  if(DATA.length&&dataKey===key)return DATA;if(dataPromise&&dataKey===key)return dataPromise;dataKey=key;
  dataPromise=(async()=>{try{const parts=await Promise.all([1,2,3].map(async n=>{const t=await fetch(`./app/${c.dataPrefix}-${n}.ts?v=${VERSION}`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});const m=t.match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);if(!m)throw Error("data parse");return JSON.parse(m[1])}));DATA=parts.flat();return DATA}catch(e){console.warn("Evia folder completion could not load course map",e);DATA=[];return[]}finally{dataPromise=null}})();return dataPromise
}
function findCat(id){return DATA.find(c=>String(c.id)===String(id))}
function findJob(id){for(const c of DATA){const j=(c.jobs||[]).find(x=>String(x.id)===String(id));if(j)return j}return null}
function side(btn){return btn?.querySelector?.(".self-side")||null}
function folderMark(btn,on,label){
  const s=side(btn);if(!s)return;
  let mark=s.querySelector(":scope > b.evia-folder-complete-v107");
  if(!on){mark?.remove();return}
  if(!mark){mark=document.createElement("b");mark.className="evia-evidence-check evia-folder-complete-v107";const arrow=s.querySelector(":scope > i");if(arrow)s.insertBefore(mark,arrow);else s.appendChild(mark)}
  mark.textContent="✓";mark.title=label;mark.setAttribute("aria-label",label);mark.setAttribute("role","img")
}
async function patch(){
  queued=false;await ensureData();if(!DATA.length)return;
  const learnerOpp=learnerOppSet(),rpl=rplSet(),milos=milosSet(),witness=witnessSet();
  document.querySelectorAll("button[data-job]").forEach(btn=>{const j=findJob(btn.dataset.job);folderMark(btn,jobComplete(j,learnerOpp,rpl,milos,witness),"Every evidence box in this job is complete")});
  document.querySelectorAll("button[data-cat]").forEach(btn=>{const c=findCat(btn.dataset.cat);folderMark(btn,catComplete(c,learnerOpp,rpl,milos,witness),"Every job in this section is complete")})
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
const WATCH="button[data-cat],button[data-job],button[data-opp],.evia-folder-complete-v107,.evia-opportunity-source-v107";
function relevant(records){return records.some(r=>{const target=r.target instanceof Element?r.target:r.target?.parentElement;if(target&&(target.matches?.(WATCH)||target.closest?.(WATCH)))return true;return[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(WATCH)||n.querySelector?.(WATCH)))})}
function start(){queue();const root=document.getElementById("root")||document.body;if(root&&!root.__eviaFolderCompletionV116){root.__eviaFolderCompletionV116=true;new MutationObserver(records=>{if(relevant(records))queue()}).observe(root,{subtree:true,childList:true,characterData:true})}}
window.addEventListener("load",start);window.addEventListener("pageshow",queue);window.addEventListener("storage",e=>{if([STORE,RPL_KEY,OBS_KEY,WITNESS_KEY].includes(e.key))queue()});window.addEventListener("evia:milos-observed-changed",queue);window.addEventListener("evia:witness-changed",queue);document.addEventListener("click",()=>{setTimeout(queue,0);setTimeout(queue,180)},true);if(document.readyState!=="loading")start();else document.addEventListener("DOMContentLoaded",start,{once:true});
window.EviaFolderCompletion=Object.freeze({version:VERSION,refresh:queue});
})();
