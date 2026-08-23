(()=>{
"use strict";
const VERSION=122,STORE="evia-selfobs-live-v3",DB="evia-self-observation-media",DBS="files",STYLE_ID="evia-evidence-media-v122-style";
let observer=null,frame=0;
const objectUrls=new WeakMap(),pending=new WeakSet();
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const norm=s=>String(s??"").replace(/\s+/g," ").trim().toLowerCase();
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .self-entry.evia-media-row-v122{display:grid!important;grid-template-columns:5rem minmax(0,1fr)!important;gap:.72rem!important;align-items:center!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122{position:relative!important;width:5rem!important;height:5rem!important;border-radius:.8rem!important;overflow:hidden!important;background:#eee!important;box-shadow:inset 0 0 0 1px rgba(0,0,0,.04)!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122 img,.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122 video{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;margin:0!important;border-radius:0!important;background:#eee!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-copy-v122{display:grid!important;gap:.18rem!important;min-width:0!important}
.selfobs .self-entry.evia-media-row-v122 .self-video-badge-v122{position:absolute!important;left:.32rem!important;bottom:.32rem!important;padding:.18rem .34rem!important;border-radius:999px!important;background:rgba(25,25,27,.82)!important;color:#fff!important;font-size:.44rem!important;font-weight:700!important;line-height:1!important}
@media(max-width:360px){.selfobs .self-entry.evia-media-row-v122{grid-template-columns:4.3rem minmax(0,1fr)!important}.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122{width:4.3rem!important;height:4.3rem!important}}
`;
  document.head.appendChild(s)
}
function openDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DB);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);q.onblocked=()=>reject(new Error("Evidence media database is blocked"))})}
async function recordFor(id){if(!id)return null;const db=await openDb();try{return await new Promise((resolve,reject)=>{if(!db.objectStoreNames.contains(DBS)){resolve(null);return}const q=db.transaction(DBS,"readonly").objectStore(DBS).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}finally{db.close()}}
function mediaIds(e){return[e?.photoId,e?.videoId,e?.mediaId,e?.imageId,e?.fileId,e?.attachmentId].filter((v,i,a)=>v&&a.indexOf(v)===i)}
function embeddedSource(e){for(const k of ["thumbnail","thumbnailUrl","preview","previewUrl","imageData","dataUrl","photoUrl"]){const v=e?.[k];if(typeof v==="string"&&/^(data:|blob:)/i.test(v))return{src:v,type:/^data:video/i.test(v)?"video/embedded":"image/embedded",owned:false}}return null}
function unpack(record){
  if(!record)return null;
  if(record instanceof Blob)return{blob:record,type:record.type||""};
  for(const key of ["blob","file","data","media","content"]){const v=record?.[key];if(v instanceof Blob)return{blob:v,type:String(record?.type||v.type||""),name:String(record?.name||v.name||"")}}
  for(const key of ["dataUrl","url","src","preview"]){const v=record?.[key];if(typeof v==="string"&&/^(data:|blob:)/i.test(v))return{src:v,type:String(record?.type||(/video/i.test(v)?"video/embedded":"image/embedded")),owned:false}}
  return null
}
async function mediaFor(e){
  for(const id of mediaIds(e)){const unpacked=unpack(await recordFor(id).catch(()=>null));if(unpacked)return unpacked}
  return embeddedSource(e)
}
function entriesForTab(){const all=read(STORE,[]);if(!Array.isArray(all))return[];const downloaded=document.querySelector(".self-tabs button.on")?.dataset?.tab==="downloaded";return all.filter(e=>downloaded?!!e.downloadedAt:!e.downloadedAt)}
function scoreRow(row,e){
  const text=norm(row.textContent),title=norm(e?.title),job=norm(e?.jobTitle);let score=0;
  if(title&&text.includes(title))score+=5;if(job&&text.includes(job))score+=4;
  const codes=Array.isArray(e?.codes)?e.codes:[];for(const c of codes)if(text.includes(norm(c)))score+=1;
  try{const d=new Date(e?.createdAt).toLocaleDateString("en-GB");if(d&&text.includes(norm(d)))score+=3}catch{}
  return score
}
function matchEntries(rows,list){
  const unused=new Set(list),pairs=[];
  for(const row of rows){let best=null,bestScore=-1;for(const e of unused){const s=scoreRow(row,e);if(s>bestScore){best=e;bestScore=s}}if(!best&&unused.size)best=unused.values().next().value;if(best)unused.delete(best);pairs.push([row,best])}
  return pairs
}
function wrapCopy(row){
  let copy=row.querySelector(":scope > .self-entry-copy-v122");if(copy)return copy;
  copy=document.createElement("div");copy.className="self-entry-copy-v122";
  [...row.childNodes].filter(n=>!(n.nodeType===1&&(n.classList?.contains("self-entry-thumb-v122")||n.classList?.contains("self-entry-thumb")))).forEach(n=>copy.appendChild(n));row.appendChild(copy);return copy
}
function revoke(row){const url=objectUrls.get(row);if(url){try{URL.revokeObjectURL(url)}catch{}objectUrls.delete(row)}}
async function decorate(row,e){
  if(!row?.isConnected||!e||pending.has(row))return;
  if(row.querySelector(":scope > .self-entry-thumb-v122"))return;
  pending.add(row);
  try{
    const found=await mediaFor(e);if(!found||!row.isConnected)return;
    let src=found.src||"",owned=false;if(found.blob){src=URL.createObjectURL(found.blob);owned=true}
    if(!src)return;
    row.querySelector(":scope > .self-entry-thumb")?.remove();revoke(row);if(owned)objectUrls.set(row,src);
    const type=String(found.type||found.blob?.type||"").toLowerCase(),name=String(found.name||"").toLowerCase(),isVideo=type.startsWith("video/")||/\.(mp4|webm|mov|m4v)$/.test(name);
    const thumb=document.createElement("div");thumb.className="self-entry-thumb-v122";
    if(isVideo){const v=document.createElement("video");v.src=src;v.muted=true;v.playsInline=true;v.preload="metadata";v.setAttribute("aria-label","Video evidence thumbnail");v.addEventListener("loadedmetadata",()=>{try{if(Number.isFinite(v.duration)&&v.duration>0)v.currentTime=Math.min(.25,Math.max(.02,v.duration/6))}catch{}},{once:true});thumb.appendChild(v);const badge=document.createElement("span");badge.className="self-video-badge-v122";badge.textContent="▶ VIDEO";thumb.appendChild(badge)}else{const img=document.createElement("img");img.src=src;img.alt="Evidence thumbnail";thumb.appendChild(img)}
    wrapCopy(row);row.insertBefore(thumb,row.firstChild);row.classList.remove("evia-media-row-v115","evia-media-row-v117");row.classList.add("evia-media-row-v122");row.dataset.eviaMediaId=String(e.id||"")
  }catch(err){console.debug("Evia evidence media v122",err)}finally{pending.delete(row)}
}
async function apply(){
  frame=0;ensureStyle();if(document.querySelector(".self-title")?.textContent?.trim()!=="Evidence")return;
  const rows=[...document.querySelectorAll(".self-entry")],list=entriesForTab();
  for(const [row,e] of matchEntries(rows,list))if(row&&e)decorate(row,e)
}
function schedule(){if(frame)return;frame=requestAnimationFrame(apply)}
function refresh(){schedule();setTimeout(schedule,70);setTimeout(schedule,220);setTimeout(schedule,650);setTimeout(schedule,1400)}
function start(){
  ensureStyle();refresh();
  const root=document.getElementById("root")||document.body;observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});
  document.addEventListener("click",e=>{if(e.target.closest?.("[data-action='evidence'],[data-tab],[data-quick]"))refresh()},true);
  window.addEventListener("pageshow",refresh);window.addEventListener("focus",refresh)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaEvidenceMedia=Object.freeze({version:VERSION,refresh});
})();
