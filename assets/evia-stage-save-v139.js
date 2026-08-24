(()=>{
"use strict";
const STORE="evia-selfobs-live-v3",DRAFTS="evia-stage-drafts-v133",ROUTE="evia-stage-route-v133",DB="evia-self-observation-media",DBS="files";
let busy=false;
const $=q=>document.querySelector(q);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const clock=s=>`${String(Math.floor(Math.max(0,Number(s)||0)/60)).padStart(2,"0")}:${String(Math.max(0,Number(s)||0)%60).padStart(2,"0")}`;
function siteData(){const a=window.EviaCoursePacks?.active?.(),data=a?.pathway?.siteData||a?.pack?.siteData;if(Array.isArray(data)&&data.length)return data;if(Array.isArray(window.EviaST0171Map)&&window.EviaST0171Map.length)return window.EviaST0171Map;return[]}
function contextFor(oppId){for(const cat of siteData())for(const job of cat.jobs||[])for(const opp of job.opps||[])if(String(opp.id)===String(oppId))return{cat,job,opp};return null}
function openDb(){return new Promise((res,rej)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(DBS))q.result.createObjectStore(DBS,{keyPath:"id"})};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function getMedia(id){const db=await openDb();try{return await new Promise((res,rej)=>{const q=db.transaction(DBS,"readonly").objectStore(DBS).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}finally{db.close()}}
async function deleteMedia(id){if(!id)return;const db=await openDb();try{await new Promise((res,rej)=>{const tx=db.transaction(DBS,"readwrite");tx.objectStore(DBS).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}finally{db.close()}}
function draftFor(route){const all=read(DRAFTS,{}),suffix=`::${route.oppId}::${Number(route.stageIndex)||0}`;let key=Object.keys(all).find(k=>k.endsWith(suffix));if(!key&&route.courseId)key=`${route.courseId}${suffix}`;return{all,key,d:key?all[key]:null}}
async function clearDraft(route,draft){if(draft?.d?.id)await deleteMedia(draft.d.id).catch(()=>{});if(draft?.key){delete draft.all[draft.key];write(DRAFTS,draft.all)}}
function stageFor(ctx,route){const stages=Array.isArray(ctx?.opp?.stages)?ctx.opp.stages:[];return stages[Math.max(0,Number(route?.stageIndex)||0)]||{title:ctx?.opp?.title||"Evidence",instruction:ctx?.opp?.instruction||""}}
function callHandler(el){if(!el||typeof el.onclick!=="function")return false;el.onclick();return true}
async function prepareCore(route){const panel=$(".self-panel");if(!panel)throw Error("evidence panel unavailable");const esc=window.CSS?.escape?CSS.escape:(s=>String(s).replace(/["\\]/g,"\\$&"));for(let i=0;i<10;i++){
  const opp=panel.querySelector(`[data-opp="${esc(route.oppId)}"]`);if(opp){callHandler(opp);await wait(0);return}
  const job=panel.querySelector(`[data-job="${esc(route.jobId)}"]`);if(job){callHandler(job);await wait(0);continue}
  const cat=panel.querySelector(`[data-cat="${esc(route.catId)}"]`);if(cat){callHandler(cat);await wait(0);continue}
  const back=panel.querySelector("[data-action='back']");if(back){callHandler(back);await wait(0);continue}
  break
}throw Error("could not restore evidence task")}
async function saveThroughCore(file,answer,kind,meta,route,ctx,s){
  const before=new Set((read(STORE,[])||[]).map(e=>e?.id));
  await prepareCore(route);
  const input=$("#selfPhoto");if(!input||typeof input.onchange!=="function")throw Error("evidence input unavailable");
  input.onchange({target:{files:[file],value:""}});await wait(0);
  const next=$(".self-panel [data-action='next']");if(!next||next.disabled||!callHandler(next))throw Error("evidence continue unavailable");await wait(0);
  const type=$(".self-panel [data-mode='type']");if(!type||!callHandler(type))throw Error("evidence explanation unavailable");await wait(0);
  const ta=$("#selfText"),save=$(".self-panel [data-action='save']");if(!ta||!save)throw Error("evidence save unavailable");
  ta.value=answer;ta.dispatchEvent(new Event("input",{bubbles:true}));callHandler(save);
  let xs=[],entry=null;
  for(let i=0;i<125;i++){await wait(80);xs=read(STORE,[]);entry=Array.isArray(xs)?xs.find(e=>e?.id&&!before.has(e.id)):null;if(entry)break}
  if(!entry)throw Error("evidence store did not confirm save");
  entry.categoryId=ctx.cat.id;entry.categoryTitle=ctx.cat.title;entry.jobId=ctx.job.id;entry.jobTitle=ctx.job.title;entry.opportunityId=ctx.opp.id;entry.title=ctx.opp.title;entry.bundle=ctx.opp.bundle;entry.question=ctx.opp.question;entry.codes=[...(ctx.opp.codes||[])];entry.answerMode="type";entry.answerText=answer;entry.stageIndex=Math.max(0,Number(route.stageIndex)||0);entry.stageTitle=s.title;entry.stageInstruction=s.instruction;entry.mediaKind=kind;
  if(kind==="video"&&meta){entry.videoStartedAt=meta.startedAt||null;entry.videoPromptMarkers=Array.isArray(meta.markers)?meta.markers:[];entry.videoDurationSeconds=meta.durationSeconds??null}
  if(!write(STORE,xs))throw Error("evidence metadata could not be saved");
  return entry
}
function videoAnswer(s,meta,extra){const started=new Date(meta?.startedAt||Date.now()).toLocaleString("en-GB"),lines=[`Stage: ${s.title}`,"Guided video explanation",`Recording started: ${started}`,...(meta?.markers||[]).map(m=>`${clock(m.seconds)} — ${m.prompt}`)];if(String(extra||"").trim())lines.push("","Additional learner note:",String(extra).trim());return lines.join("\n")}
function setStatus(text,error=false){const o=$(".evia-stage-overlay-v132");if(!o)return;let status=o.querySelector(".evia-stage-saving-v132");if(!status){status=document.createElement("div");status.className="evia-stage-saving-v132";o.appendChild(status)}status.textContent=text;status.dataset.error=error?"1":"0"}
async function run(button){
  if(busy)return;busy=true;const overlay=$(".evia-stage-overlay-v132"),buttons=overlay?.querySelectorAll("button")||[];buttons.forEach(b=>b.disabled=true);setStatus("Saving evidence…");
  try{
    const route=read(ROUTE,null);if(!route?.oppId)throw Error("evidence route unavailable");const ctx=contextFor(route.oppId);if(!ctx)throw Error("evidence task unavailable");const s=stageFor(ctx,route),draft=draftFor(route);if(!draft.d?.id)throw Error("captured media unavailable");const rec=await getMedia(draft.d.id);if(!rec?.blob)throw Error("captured media unavailable");
    const file=new File([rec.blob],rec.name||"evidence",{type:rec.type||rec.blob.type||"application/octet-stream",lastModified:Date.now()}),kind=draft.d.kind||rec.kind||"photo",meta=draft.d.meta||rec.meta||null;
    let answer="";
    if(button.matches("[data-save-photo]")){const text=overlay.querySelector("[data-photo-text]")?.value?.trim()||draft.d.text?.trim()||"";if((text.match(/\S+/g)||[]).length<3)throw Error("photo explanation is too short");answer=`Stage: ${s.title}\n${text}`}
    else{const extra=button.matches("[data-save-video]")?(overlay.querySelector("[data-video-extra]")?.value||draft.d.text||""):"";answer=videoAnswer(s,meta,extra)}
    const entry=await saveThroughCore(file,answer,kind,meta,route,ctx,s);await clearDraft(route,draft);localStorage.removeItem(ROUTE);
    if(window.EviaSmoothFlow?.start){window.dispatchEvent(new CustomEvent("evia:evidence-saved",{detail:{entry}}))}
    else{setStatus("Evidence saved.");await wait(0);if(window.EviaStagedEvidence?.openForOpp)await window.EviaStagedEvidence.openForOpp(route.oppId)}
  }catch(error){console.error("Evia staged evidence save",error);setStatus("That evidence could not be saved. Try again.",true);buttons.forEach(b=>b.disabled=false)}finally{busy=false}
}
document.addEventListener("click",event=>{const button=event.target?.closest?.("[data-save-photo],[data-skip-video],[data-save-video]");if(!button||!button.closest(".evia-stage-overlay-v132"))return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();run(button)},true);
window.addEventListener("evia:evidence-reflection-saved",()=>{if(!document.querySelector(".evia-stage-overlay-v132"))return;try{window.EviaStagedEvidence?.close?.()}catch(error){console.debug("Evia staged evidence cleanup",error)}});
window.EviaStageSaveV139=Object.freeze({version:139});
})();