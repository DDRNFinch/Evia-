(()=>{
"use strict";
const VERSION=136,STORE="evia-selfobs-live-v3",DB="evia-self-observation-media",DBS="files",STYLE_ID="evia-evidence-media-v122-style";
let observer=null,frame=0;
const objectUrls=new WeakMap(),pending=new WeakSet();
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs .self-entry.evia-media-row-v122{display:grid!important;grid-template-columns:5rem minmax(0,1fr)!important;gap:.72rem!important;align-items:center!important;min-height:5.7rem!important}
.selfobs .self-entry.evia-media-row-v122.evia-no-media-v136{grid-template-columns:minmax(0,1fr)!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122{position:relative!important;width:5rem!important;height:5rem!important;border-radius:.8rem!important;overflow:hidden!important;background:#eee!important;box-shadow:inset 0 0 0 1px rgba(0,0,0,.04)!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122 img,.selfobs .self-entry.evia-media-row-v122>.self-entry-thumb-v122 video{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;margin:0!important;border-radius:0!important;background:#eee!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-copy-v122{display:grid!important;gap:.18rem!important;min-width:0!important;align-content:center!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-copy-v122>b{display:block!important;font-size:.72rem!important;line-height:1.3!important;color:#383633!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-copy-v122>span{display:block!important;font-size:.66rem!important;line-height:1.35!important;color:#85817a!important;white-space:normal!important;overflow:visible!important}
.selfobs .self-entry.evia-media-row-v122>.self-entry-copy-v122>small{display:block!important;font-size:.58rem!important;line-height:1.3!important;color:#aaa59c!important}
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
async function mediaFor(e){for(const id of mediaIds(e)){const unpacked=unpack(await recordFor(id).catch(()=>null));if(unpacked)return unpacked}return embeddedSource(e)}
function entriesForTab(){
  const all=read(STORE,[]);if(!Array.isArray(all))return[];
  const downloaded=document.querySelector(".self-tabs button.on")?.dataset?.tab==="downloaded";
  const list=all.filter(e=>downloaded?!!e.downloadedAt:!e.downloadedAt),groups={};
  list.forEach(e=>(groups[e.bundle]||(groups[e.bundle]=[])).push(e));
  return Object.keys(groups).sort().flatMap(k=>groups[k])
}
function isVideoEntry(e,type="",name=""){return e?.mediaKind==="video"||Array.isArray(e?.videoPromptMarkers)||String(type).toLowerCase().startsWith("video/")||/\.(mp4|webm|mov|m4v)$/i.test(String(name||""))}
function methodSummary(e,isVideo,hasMedia){
  if(isVideo){const n=Array.isArray(e?.videoPromptMarkers)?e.videoPromptMarkers.length:0,d=Number(e?.videoDurationSeconds);const bits=["Guided video"];if(Number.isFinite(d)&&d>0)bits.push(`${d}s`);if(n)bits.push(`${n} prompt${n===1?"":"s"}`);return bits.join(" · ")}
  if(e?.audioId||e?.answerMode==="talk")return "Voice explanation";
  if(hasMedia||e?.photoId||e?.mediaKind==="photo")return e?.answerText?"Photo + written explanation":"Photo evidence";
  return "Written explanation"
}
function formatDate(value){try{return new Date(value).toLocaleDateString("en-GB")}catch{return""}}
function cleanRow(row,e,summary){
  if(!row?.isConnected||!e)return null;
  row.querySelectorAll(":scope > .self-entry-copy-v122,:scope > .self-entry-copy,:scope > .self-entry-thumb,:scope > .self-entry-thumb-v122").forEach(node=>{if(node.classList?.contains("self-entry-thumb-v122"))revoke(row);node.remove()});
  [...row.childNodes].forEach(n=>n.remove());
  const copy=document.createElement("div");copy.className="self-entry-copy-v122";
  const title=document.createElement("b");title.textContent=`${e.title||"Evidence"}${e.jobTitle?` · ${e.jobTitle}`:""}`;
  const line=document.createElement("span");line.textContent=summary;
  const meta=document.createElement("small"),codes=Array.isArray(e.codes)?e.codes.join(" · "):"",date=formatDate(e.createdAt);meta.textContent=[codes,date].filter(Boolean).join(" · ");
  copy.append(title,line,meta);row.appendChild(copy);
  row.classList.remove("evia-media-row-v115","evia-media-row-v117");row.classList.add("evia-media-row-v122","evia-no-media-v136");row.dataset.eviaEvidenceId=String(e.id||"");return copy
}
function revoke(row){const url=objectUrls.get(row);if(url){try{URL.revokeObjectURL(url)}catch{}objectUrls.delete(row)}}
async function decorate(row,e){
  if(!row?.isConnected||!e||pending.has(row))return;pending.add(row);
  try{
    const found=await mediaFor(e),type=String(found?.type||found?.blob?.type||"").toLowerCase(),name=String(found?.name||"").toLowerCase(),video=isVideoEntry(e,type,name),summary=methodSummary(e,video,!!found);
    cleanRow(row,e,summary);if(!found||!row.isConnected)return;
    let src=found.src||"",owned=false;if(found.blob){src=URL.createObjectURL(found.blob);owned=true}if(!src)return;
    revoke(row);if(owned)objectUrls.set(row,src);
    const thumb=document.createElement("div");thumb.className="self-entry-thumb-v122";
    if(video){const v=document.createElement("video");v.src=src;v.muted=true;v.playsInline=true;v.preload="metadata";v.setAttribute("aria-label","Video evidence thumbnail");v.addEventListener("loadedmetadata",()=>{try{if(Number.isFinite(v.duration)&&v.duration>0)v.currentTime=Math.min(.25,Math.max(.02,v.duration/6))}catch{}},{once:true});thumb.appendChild(v);const badge=document.createElement("span");badge.className="self-video-badge-v122";badge.textContent="▶ VIDEO";thumb.appendChild(badge)}else{const img=document.createElement("img");img.src=src;img.alt="Evidence thumbnail";thumb.appendChild(img)}
    row.insertBefore(thumb,row.firstChild);row.classList.remove("evia-no-media-v136");row.dataset.eviaMediaId=String(e.id||"")
  }catch(err){console.debug("Evia evidence media v136",err)}finally{pending.delete(row)}
}
async function apply(){
  frame=0;ensureStyle();if(document.querySelector(".self-title")?.textContent?.trim()!=="Evidence")return;
  const rows=[...document.querySelectorAll(".self-entry")],list=entriesForTab();
  for(let i=0;i<rows.length;i++){const row=rows[i],e=list[i];if(row&&e)decorate(row,e)}
}
function schedule(){if(frame)return;frame=requestAnimationFrame(apply)}
function refresh(){schedule();setTimeout(schedule,70);setTimeout(schedule,220);setTimeout(schedule,650)}
function start(){
  ensureStyle();refresh();
  const root=document.getElementById("root")||document.body;observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});
  document.addEventListener("click",e=>{if(e.target.closest?.("[data-action='evidence'],[data-tab],[data-quick]"))refresh()},true);
  window.addEventListener("pageshow",refresh);window.addEventListener("focus",refresh)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaEvidenceMedia=Object.freeze({version:VERSION,refresh});
})();
