(()=>{
"use strict";
const VERSION=117,STORE="evia-selfobs-live-v3",DB="evia-self-observation-media",DBS="files",STYLE_ID="evia-evidence-media-v117-style";
let observer=null,frame=0;
const pending=new Set(),urls=new WeakMap();
function read(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function ensureStyle(){
  ["evia-evidence-media-v115-style"].forEach(id=>document.getElementById(id)?.remove());
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .self-entry.evia-media-row-v117{display:grid!important;grid-template-columns:4.75rem minmax(0,1fr)!important;gap:.72rem!important;align-items:center!important}
.selfobs .self-entry.evia-media-row-v117 .self-entry-thumb{position:relative!important;width:4.75rem!important;height:4.75rem!important;border-radius:.75rem!important;overflow:hidden!important;background:#eee!important;box-shadow:inset 0 0 0 1px rgba(0,0,0,.035)!important}
.selfobs .self-entry.evia-media-row-v117 .self-entry-thumb img,.selfobs .self-entry.evia-media-row-v117 .self-entry-thumb video{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;background:#eee!important;margin:0!important;border-radius:0!important}
.selfobs .self-entry.evia-media-row-v117 .self-entry-thumb video{pointer-events:none!important}
.selfobs .self-entry.evia-media-row-v117 .self-entry-copy{display:grid!important;gap:.18rem!important;min-width:0!important}
.selfobs .self-entry.evia-media-row-v117 .self-video-badge{position:absolute!important;left:.3rem!important;bottom:.3rem!important;display:inline-flex!important;align-items:center!important;gap:.15rem!important;padding:.18rem .34rem!important;border-radius:999px!important;background:rgba(25,25,27,.8)!important;color:#fff!important;font-size:.45rem!important;font-weight:700!important;letter-spacing:.04em!important;line-height:1!important}
@media(max-width:360px){.selfobs .self-entry.evia-media-row-v117{grid-template-columns:4.2rem minmax(0,1fr)!important}.selfobs .self-entry.evia-media-row-v117 .self-entry-thumb{width:4.2rem!important;height:4.2rem!important}}
`;document.head.appendChild(s)
}
function openDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(DBS))q.result.createObjectStore(DBS,{keyPath:"id"})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function getBlob(id){if(!id)return null;const db=await openDb();try{return await new Promise((resolve,reject)=>{const q=db.transaction(DBS,"readonly").objectStore(DBS).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}finally{db.close()}}
function activeTab(){return document.querySelector(".self-tabs button.on")?.dataset?.tab||"new"}
function evidenceList(){const all=read(STORE,[]);if(!Array.isArray(all))return[];const downloaded=activeTab()==="downloaded",list=all.filter(e=>downloaded?!!e.downloadedAt:!e.downloadedAt),groups={};list.forEach(e=>(groups[e.bundle]||(groups[e.bundle]=[])).push(e));return Object.keys(groups).sort().flatMap(k=>groups[k])}
function mediaIds(e){return[e?.photoId,e?.videoId,e?.mediaId,e?.imageId,e?.fileId].filter((v,i,a)=>v&&a.indexOf(v)===i)}
async function storedMedia(e){for(const id of mediaIds(e)){const found=await getBlob(id).catch(()=>null);if(found?.blob)return found}return null}
function revoke(row){const old=urls.get(row);if(old){try{URL.revokeObjectURL(old)}catch{}urls.delete(row)}}
function copyWrap(row){let copy=row.querySelector(":scope > .self-entry-copy");if(copy)return copy;copy=document.createElement("div");copy.className="self-entry-copy";const children=[...row.childNodes].filter(n=>!(n.nodeType===1&&n.classList?.contains("self-entry-thumb")));children.forEach(n=>copy.appendChild(n));row.appendChild(copy);return copy}
async function decorateRow(row,e){
  if(!row?.isConnected||row.querySelector(":scope > .self-entry-thumb"))return;
  const ids=mediaIds(e);if(!ids.length){row.removeAttribute("data-thumb-ready");return}
  const key=`${e?.id||"row"}:${ids.join("|")}`;if(pending.has(key))return;pending.add(key);
  try{
    const stored=await storedMedia(e);
    if(!stored?.blob||!row.isConnected||row.querySelector(":scope > .self-entry-thumb")){row.removeAttribute("data-thumb-ready");return}
    const type=String(stored.type||stored.blob.type||"").toLowerCase(),isVideo=type.startsWith("video/"),url=URL.createObjectURL(stored.blob);revoke(row);urls.set(row,url);
    const media=document.createElement("div");media.className="self-entry-thumb";
    if(isVideo){const v=document.createElement("video");v.src=url;v.muted=true;v.playsInline=true;v.preload="metadata";v.setAttribute("aria-label","Video evidence thumbnail");v.addEventListener("loadedmetadata",()=>{try{if(Number.isFinite(v.duration)&&v.duration>0)v.currentTime=Math.min(.2,Math.max(.01,v.duration/5))}catch{}},{once:true});media.appendChild(v);const badge=document.createElement("span");badge.className="self-video-badge";badge.textContent="▶ VIDEO";media.appendChild(badge)}
    else{const img=document.createElement("img");img.src=url;img.alt="Evidence thumbnail";media.appendChild(img)}
    copyWrap(row);row.insertBefore(media,row.firstChild);row.classList.remove("evia-media-row-v115");row.classList.add("evia-media-row-v117");row.dataset.thumbReady="1"
  }catch(err){row.removeAttribute("data-thumb-ready");console.debug("Evia evidence thumbnail",err)}finally{pending.delete(key)}
}
async function apply(){
  frame=0;ensureStyle();if(document.querySelector(".self-title")?.textContent?.trim()!=="Evidence")return;
  const rows=[...document.querySelectorAll(".self-entry")],list=evidenceList();
  for(let i=0;i<rows.length&&i<list.length;i++){
    const row=rows[i],e=list[i];if(!row||!e)continue;
    if(row.querySelector(":scope > .self-entry-thumb")){row.classList.remove("evia-media-row-v115");row.classList.add("evia-media-row-v117");continue}
    row.removeAttribute("data-thumb-ready");decorateRow(row,e)
  }
}
function schedule(){if(frame)return;frame=requestAnimationFrame(apply)}
function retry(){schedule();setTimeout(schedule,80);setTimeout(schedule,260);setTimeout(schedule,700)}
function start(){ensureStyle();retry();const root=document.getElementById("root")||document.body;if(!observer){observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]})}document.addEventListener("click",e=>{if(e.target.closest?.("[data-action='evidence'],[data-tab],[data-quick]"))retry()},true);window.addEventListener("pageshow",retry);window.addEventListener("focus",retry)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.EviaEvidenceMedia=Object.freeze({version:VERSION,refresh:retry});
})();
