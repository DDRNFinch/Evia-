(()=>{
"use strict";
const VERSION=127;
const STORE="evia-selfobs-live-v3",DRAFTS="evia-evidence-drafts-v127",ROUTE="evia-evidence-route-v127",DB="evia-self-observation-media",DBS="files";
let dataIndex=new Map(),route={catId:"",jobId:"",oppId:""},captureKind="",stageIndex=0,lastVideoMeta=null,restoring=false,photoLayer=null,photoStream=null,photoObjectUrl="",resumeAttempted=false;
const $=q=>document.querySelector(q),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const currentCourse=()=>window.EviaCourseContext?.current?.()||{};
const clock=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,"0")}:${String(Math.max(0,s)%60).padStart(2,"0")}`;

const STAGE_OVERRIDES={
  plumbing_fault:[
    ["Plumbing fault","Show the plumbing fault or affected component before the repair begins."],
    ["Isolation & preparation","Show how the water has been isolated and the repair area prepared safely."],
    ["Repair","Show the repair or replacement work being carried out."],
    ["Completed repair","Show the completed repair and the final checks for leaks or correct operation."]
  ],
  drainage_fault:[
    ["Drainage problem","Show the drainage problem before work begins."],
    ["Access & preparation","Show the access point and how the area has been prepared for the repair or clearance."],
    ["Completed repair","Show the completed drainage repair or cleared system."]
  ],
  energy_fault:[
    ["System or component","Show the environmental or energy-management component before maintenance."],
    ["Maintenance or repair","Show the maintenance or repair being carried out."],
    ["Completed check","Show the completed work or final operational check."]
  ],
  door_window:[
    ["Defect before repair","Show the door, window, frame, glazing unit or fitting and the defect before work starts."],
    ["Repair in progress","Show the repair, adjustment or replacement work being carried out."],
    ["Finished repair","Show the completed repair and finished fit or operation."]
  ],
  plaster_repair:[
    ["Plaster defect","Show the damaged plaster before you begin."],
    ["Preparation","Show the damaged area prepared and ready for the repair."],
    ["Finished repair","Show the completed plaster repair and finish."]
  ],
  paint_repair:[
    ["Surface condition","Show the defect or surface condition before preparation."],
    ["Preparation","Show the surface after it has been prepared for decoration."],
    ["Coating or sealing","Show the coating, paint or sealing work being applied."],
    ["Finished decoration","Show the completed decorated or sealed surface."]
  ],
  tile_repair:[
    ["Tiling defect","Show the damaged or affected tiling before the repair."],
    ["Preparation & setting out","Show the prepared area and how the replacement work has been set out."],
    ["Cutting or fitting","Show any cutting, fitting or work around obstacles."],
    ["Finished repair","Show the completed tiling repair."]
  ],
  floor_repair:[
    ["Flooring defect","Show the flooring defect before work begins."],
    ["Preparation","Show the floor or sub-surface prepared for the repair."],
    ["Setting out & fitting","Show the material being set out, cut or fitted."],
    ["Finished repair","Show the completed flooring repair."]
  ],
  masonry_repair:[
    ["Masonry or damp defect","Show the masonry or damp defect before the repair."],
    ["Repair in progress","Show the repair method and materials being used."],
    ["Finished repair","Show the completed masonry or damp repair."]
  ],
  fence_repair:[
    ["Defect","Show the fencing or railing defect before the repair."],
    ["Repair in progress","Show the repair or replacement work being carried out."],
    ["Completed repair","Show the completed fencing or railing repair."]
  ],
  ground_repair:[
    ["External defect","Show the groundwork, surface or landscaping defect before work begins."],
    ["Repair in progress","Show the repair process and materials being used."],
    ["Completed & safe","Show the completed repair and how the area has been left safe."]
  ]
};

function contextFor(id=route.oppId){return dataIndex.get(String(id||""))||null}
function makePrompts(ctx,stage){
  const q=String(ctx?.opp?.question||"").trim();
  const title=stage?.title||ctx?.opp?.title||"this stage";
  const specific=stage?.prompt||stage?.instruction||ctx?.opp?.instruction||"";
  return[
    `Show ${title.toLowerCase()} clearly and explain what we are looking at.`,
    q||`Explain what you are doing at this stage, the method or materials you are using, and why.`,
    specific?`Explain how you completed or checked this stage: ${specific}`:`Explain what you checked and how you know this stage is correct.`
  ]
}
function stagesFor(ctx){
  if(!ctx?.opp)return[];
  const raw=STAGE_OVERRIDES[ctx.opp.id];
  if(raw)return raw.map((x,i)=>({id:`${ctx.opp.id}-stage-${i+1}`,title:x[0],instruction:x[1]}));
  if(Array.isArray(ctx.opp.stages)&&ctx.opp.stages.length)return ctx.opp.stages.map((s,i)=>({id:s.id||`${ctx.opp.id}-stage-${i+1}`,title:s.title||`Stage ${i+1}`,instruction:s.instruction||ctx.opp.instruction,prompts:s.prompts}));
  return[{id:`${ctx.opp.id}-stage-1`,title:ctx.opp.title,instruction:ctx.opp.instruction||"Collect one clear piece of evidence for this stage."}]
}
function savedStageIndexes(oppId){
  const xs=read(STORE,[]);const set=new Set();
  if(Array.isArray(xs))xs.forEach(e=>{if(e?.opportunityId===oppId&&Number.isInteger(e?.stageIndex))set.add(e.stageIndex)});
  return set
}
function firstUnfinishedStage(ctx){const ss=stagesFor(ctx),done=savedStageIndexes(ctx?.opp?.id);for(let i=0;i<ss.length;i++)if(!done.has(i))return i;return Math.max(0,ss.length-1)}
function activeStage(){const ctx=contextFor(),ss=stagesFor(ctx);return ss[Math.max(0,Math.min(stageIndex,ss.length-1))]||null}
function updateGlobalContext(){
  const ctx=contextFor(),stage=activeStage();
  window.EviaGuidedEvidenceContext={
    version:VERSION,
    courseId:String(currentCourse().courseId||""),
    categoryId:ctx?.cat?.id||route.catId,
    jobId:ctx?.job?.id||route.jobId,
    opportunityId:ctx?.opp?.id||route.oppId,
    title:stage?.title||ctx?.opp?.title||document.querySelector(".self-title")?.textContent||"Evidence video",
    instruction:stage?.instruction||ctx?.opp?.instruction||"",
    question:ctx?.opp?.question||"",
    prompts:Array.isArray(stage?.prompts)&&stage.prompts.length?stage.prompts:makePrompts(ctx,stage),
    stageIndex,
    stageCount:stagesFor(ctx).length
  }
}

async function loadIndex(){
  try{
    const active=window.EviaCoursePacks?.active?.();
    let data=active?.pathway?.siteData||active?.pack?.siteData||[];
    if(!Array.isArray(data)||!data.length){
      const c=currentCourse(),prefix=c.dataPrefix||"evia-site-data";
      const parts=await Promise.all([1,2,3].map(async n=>{
        const t=await fetch(`./app/${prefix}-${n}.ts?v=${VERSION}`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(String(r.status));return r.text()});
        const m=t.match(/export const SITE_DATA_\d+:SiteCategory\[\]=(.*);\s*$/s);return m?JSON.parse(m[1]):[]
      }));data=parts.flat()
    }
    dataIndex=new Map();
    data.forEach(cat=>cat?.jobs?.forEach(job=>job?.opps?.forEach(opp=>dataIndex.set(String(opp.id),{cat,job,opp}))));
  }catch(e){console.debug("Evia staged evidence index",e)}
}

function openDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DB);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(DBS))q.result.createObjectStore(DBS,{keyPath:"id"})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function putDraftFile(id,file){const db=await openDb();try{await new Promise((res,rej)=>{const tx=db.transaction(DBS,"readwrite");tx.objectStore(DBS).put({id,blob:file,name:file.name||id,type:file.type||"application/octet-stream",createdAt:Date.now()});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}finally{db.close()}}
async function getDraftFile(id){const db=await openDb();try{return await new Promise((res,rej)=>{const q=db.transaction(DBS,"readonly").objectStore(DBS).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}finally{db.close()}}
async function deleteDraftFile(id){if(!id)return;const db=await openDb();try{await new Promise((res,rej)=>{const tx=db.transaction(DBS,"readwrite");tx.objectStore(DBS).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}finally{db.close()}}
function draftKey(){return `${currentCourse().courseId||"course"}::${route.oppId||"opp"}::${stageIndex}`}
async function rememberDraft(file){
  if(!file||!route.oppId)return;
  const kind=file.type?.startsWith("video/")?"video":"photo",id=`draft-v127-${draftKey()}`;
  await putDraftFile(id,file);
  const all=read(DRAFTS,{});all[draftKey()]={id,kind,route:{...route},stageIndex,videoMeta:kind==="video"?(window.EviaVideoCapture?.getLastMeta?.()||lastVideoMeta||null):null,updatedAt:Date.now()};write(DRAFTS,all);write(ROUTE,{...route,stageIndex});
}
async function clearDraft(){
  const all=read(DRAFTS,{}),k=draftKey(),d=all[k];if(d?.id)await deleteDraftFile(d.id).catch(()=>{});delete all[k];write(DRAFTS,all);
  const remaining=Object.values(all).some(x=>x?.route?.oppId===route.oppId);if(!remaining)localStorage.removeItem(ROUTE)
}
function deliverToBase(file,isRestore=false){
  const input=$("#selfPhoto");if(!input||!file)return false;
  if(!isRestore)setTimeout(()=>rememberDraft(file),0);
  restoring=true;
  try{
    if(typeof input.onchange==="function"){input.onchange({target:{files:[file],value:""}});return true}
    const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event("change",{bubbles:true}));return true
  }catch{return false}finally{setTimeout(()=>{restoring=false},50)}
}
async function restoreDraft(){
  const d=read(DRAFTS,{})[draftKey()];if(!d)return false;
  try{const rec=await getDraftFile(d.id);if(!rec?.blob)return false;captureKind=d.kind||(/video/.test(rec.type)?"video":"photo");lastVideoMeta=d.videoMeta||null;const f=new File([rec.blob],rec.name||`evidence.${captureKind==="video"?"webm":"jpg"}`,{type:rec.type||rec.blob.type||"application/octet-stream",lastModified:Date.now()});return deliverToBase(f,true)}catch{return false}
}

function closePhotoLayer(){
  try{photoStream?.getTracks?.().forEach(t=>t.stop())}catch{}photoStream=null;
  if(photoObjectUrl){try{URL.revokeObjectURL(photoObjectUrl)}catch{}photoObjectUrl=""}
  photoLayer?.remove();photoLayer=null
}
function nativePhotoFallback(input){closePhotoLayer();try{input.value=""}catch{}input.setAttribute("type","file");input.setAttribute("capture","environment");input.setAttribute("accept","image/*");input.click()}
async function openPhoto(input){
  captureKind="photo";updateGlobalContext();
  if(!navigator.mediaDevices?.getUserMedia){nativePhotoFallback(input);return}
  closePhotoLayer();
  const layer=document.createElement("div");photoLayer=layer;layer.className="evia-photo-layer";
  layer.innerHTML=`<div class="evia-photo-body"><div class="evia-photo-top"><button type="button" data-photo-cancel>‹ Back</button><b>Take photo</b><span></span></div><div class="evia-photo-loading">Opening camera…</div></div>`;document.body.appendChild(layer);
  layer.querySelector("[data-photo-cancel]").onclick=closePhotoLayer;
  let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:1280},aspectRatio:{ideal:1}},audio:false})}catch{nativePhotoFallback(input);return}
  if(!photoLayer||photoLayer!==layer){stream.getTracks().forEach(t=>t.stop());return}photoStream=stream;
  const body=layer.querySelector(".evia-photo-body");body.innerHTML=`<div class="evia-photo-top"><button type="button" data-photo-cancel>‹ Back</button><b>Take photo</b><span></span></div><div class="evia-photo-square"><video autoplay muted playsinline aria-label="Photo camera preview"></video></div><div class="evia-photo-help">Keep the useful detail inside the square.</div><div class="evia-photo-controls"><button type="button" class="evia-photo-shutter" data-photo-shutter>Take photo</button></div>`;
  const video=body.querySelector("video");video.srcObject=stream;try{await video.play()}catch{}
  body.querySelector("[data-photo-cancel]").onclick=closePhotoLayer;
  body.querySelector("[data-photo-shutter]").onclick=()=>capturePhotoFrame(input,video)
}
function capturePhotoFrame(input,video){
  const vw=video.videoWidth||1080,vh=video.videoHeight||1080,side=Math.min(vw,vh),sx=Math.max(0,(vw-side)/2),sy=Math.max(0,(vh-side)/2),size=Math.min(1440,Math.max(720,side));
  const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;canvas.getContext("2d")?.drawImage(video,sx,sy,side,side,0,0,size,size);
  canvas.toBlob(blob=>{if(!blob)return;const file=new File([blob],`evia-photo-${Date.now()}.jpg`,{type:"image/jpeg",lastModified:Date.now()});showPhotoReview(input,file)},"image/jpeg",.9)
}
function showPhotoReview(input,file){
  if(!photoLayer)return;try{photoStream?.getTracks?.().forEach(t=>t.stop())}catch{}photoStream=null;
  photoObjectUrl=URL.createObjectURL(file);const body=photoLayer.querySelector(".evia-photo-body");body.innerHTML=`<div class="evia-photo-top"><button type="button" data-photo-cancel>‹ Back</button><b>Use this photo?</b><span></span></div><div class="evia-photo-square"><img src="${photoObjectUrl}" alt="Captured evidence preview"></div><div class="evia-photo-controls two"><button type="button" data-photo-retake>Retake</button><button type="button" class="primary" data-photo-use>Use photo</button></div>`;
  body.querySelector("[data-photo-cancel]").onclick=closePhotoLayer;body.querySelector("[data-photo-retake]").onclick=()=>openPhoto(input);body.querySelector("[data-photo-use]").onclick=()=>{const ok=deliverToBase(file);closePhotoLayer();if(!ok)nativePhotoFallback(input)}
}

function stageDecorate(){
  const panel=$(".self-panel");if(!panel||!route.oppId)return;
  const ctx=contextFor(),stages=stagesFor(ctx),stage=stages[stageIndex];if(!stage)return;
  const captureCard=panel.querySelector(".self-card.photo");
  if(captureCard){
    const h=panel.querySelector(".self-title"),p=panel.querySelector(".self-copy");if(h)h.textContent=stage.title;if(p)p.textContent=stage.instruction;
    if(stages.length>1&&!panel.querySelector(".evia-stage-kicker-v127")){const k=document.createElement("div");k.className="evia-stage-kicker-v127";k.textContent=`Stage ${stageIndex+1} of ${stages.length}`;h?.parentNode?.insertBefore(k,h)}
    const label=captureCard.querySelector(":scope > span");if(label)label.textContent="One clear photo or video";
    const preview=captureCard.querySelector("img,video");if(preview)preview.classList.add("evia-square-evidence-preview-v127");
    if(!captureCard.dataset.eviaDraftChecked){captureCard.dataset.eviaDraftChecked="1";if(!preview&&!restoring)setTimeout(()=>restoreDraft(),30)}
  }
  const ta=panel.querySelector("#selfText");
  if(ta&&captureKind==="photo"){
    const h=panel.querySelector(".self-title"),p=panel.querySelector(".self-copy");if(h)h.textContent="Tell Evia about it";if(p)p.textContent=`${stage.title}: explain what the photo shows, what you did and why.`;ta.placeholder="What does this photo show? What did you do? Why did you do it this way?";
  }
}
function videoMetaText(meta,extra=""){
  if(!meta)return extra.trim()||"Guided video explanation recorded with audio.";
  const start=new Date(meta.startedAt||Date.now()).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"medium"});
  const lines=["Guided video explanation","Recording started: "+start,...(meta.markers||[]).map(m=>`${clock(Number(m.seconds)||0)} — ${m.prompt}`)];
  if(extra.trim())lines.push("","Additional learner note:",extra.trim());return lines.join("\n")
}
function showVideoOptional(nextButton){
  const panel=$(".self-panel"),ctx=contextFor(),stage=activeStage(),meta=window.EviaVideoCapture?.getLastMeta?.()||lastVideoMeta||null;if(!panel||!nextButton)return;
  lastVideoMeta=meta;const originalNext=nextButton.onclick;
  panel.innerHTML=`<button class="self-back" type="button" data-v127-video-back>‹ Back</button><div class="evia-stage-kicker-v127">Video complete</div><h2 class="self-title">Add anything else?</h2><p class="self-copy">If your spoken explanation covered everything, skip the extra text.</p><div class="self-card evia-video-summary-v127"><strong>${esc(stage?.title||ctx?.opp?.title||"Video evidence")}</strong><small>${meta?.startedAt?`Started ${esc(new Date(meta.startedAt).toLocaleString("en-GB"))}`:"Video recorded with audio"}</small><div>${(meta?.markers||[]).map(m=>`<p><b>${clock(Number(m.seconds)||0)}</b><span>${esc(m.prompt)}</span></p>`).join("")}</div></div><textarea id="eviaVideoExtraV127" placeholder="Optional extra explanation..."></textarea><div class="self-actions"><button class="self-button" type="button" data-v127-skip>Skip text</button><button class="self-button primary" type="button" data-v127-save>Save with text</button></div>`;
  panel.querySelector("[data-v127-video-back]").onclick=()=>{window.EviaVideoCapture?.open?.($("#selfPhoto"))};
  const complete=extra=>saveThroughBase(originalNext,videoMetaText(meta,extra),"video",meta);
  panel.querySelector("[data-v127-skip]").onclick=()=>complete("");panel.querySelector("[data-v127-save]").onclick=()=>complete(panel.querySelector("#eviaVideoExtraV127")?.value||"")
}
function saveThroughBase(originalNext,text,kind,meta){
  if(typeof originalNext!=="function")return;
  captureKind=kind;lastVideoMeta=meta||lastVideoMeta;originalNext();
  requestAnimationFrame(()=>{
    const typeBtn=$("[data-mode='type']");if(!typeBtn||typeof typeBtn.onclick!=="function")return;typeBtn.onclick();
    requestAnimationFrame(()=>{
      const ta=$("#selfText"),save=$("[data-action='save']");if(!ta||!save||typeof save.onclick!=="function")return;ta.value=text;ta.dispatchEvent(new Event("input",{bubbles:true}));save.onclick();afterSave(kind,meta)
    })
  })
}
function afterSave(kind,meta){
  const oppId=route.oppId,stage=activeStage(),wantedStage=stageIndex,before=read(STORE,[]).length;let tries=0;
  const t=setInterval(async()=>{
    tries++;const xs=read(STORE,[]);const e=Array.isArray(xs)?xs.find(x=>x?.opportunityId===oppId&&x?.stageIndex===undefined):null;
    if(e&&xs.length>before){
      e.stageIndex=wantedStage;e.stageTitle=stage?.title||"";e.mediaKind=kind;
      if(stage?.title)e.title=stage.title;
      if(kind==="video"&&meta){e.videoStartedAt=meta.startedAt||null;e.videoPromptMarkers=meta.markers||[];e.videoDurationSeconds=meta.durationSeconds||null}
      write(STORE,xs);await clearDraft();clearInterval(t);
      const ctx=contextFor(oppId),ss=stagesFor(ctx),done=savedStageIndexes(oppId);let next=-1;for(let i=0;i<ss.length;i++)if(!done.has(i)){next=i;break}
      if(next>=0){stageIndex=next;write(ROUTE,{...route,stageIndex});setTimeout(()=>{const b=document.querySelector(`[data-opp="${CSS.escape(oppId)}"]`);if(b)b.click()},180)}else localStorage.removeItem(ROUTE)
      return
    }
    if(tries>30)clearInterval(t)
  },100)
}

function interceptClick(e){
  const target=e.target?.closest?.("button,[data-cat],[data-job],[data-opp]");if(!target)return;
  if(target.matches("[data-cat]")){route.catId=target.dataset.cat||route.catId;return}
  if(target.matches("[data-job]")){route.jobId=target.dataset.job||route.jobId;return}
  if(target.matches("[data-opp]")){
    route.oppId=target.dataset.opp||"";const ctx=contextFor();if(ctx){route.catId=ctx.cat.id;route.jobId=ctx.job.id}stageIndex=firstUnfinishedStage(ctx);captureKind="";lastVideoMeta=null;updateGlobalContext();setTimeout(stageDecorate,0);return
  }
  if(target.matches("[data-evia-native-photo]")){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();captureKind="photo";updateGlobalContext();openPhoto($("#selfPhoto"));return
  }
  if(target.matches("[data-evia-native-video]")){captureKind="video";updateGlobalContext();return}
  if(target.matches("[data-evia-native-gallery]")){captureKind="photo";updateGlobalContext();return}
  if(target.matches("[data-action='next']")){
    if(captureKind==="video"||document.querySelector(".self-card.photo video")){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showVideoOptional(target);return}
    if(captureKind==="photo"||document.querySelector(".self-card.photo img")){
      const original=target.onclick;if(typeof original==="function"){
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();captureKind="photo";original();requestAnimationFrame(()=>{const b=$("[data-mode='type']");if(b&&typeof b.onclick==="function")b.onclick();requestAnimationFrame(stageDecorate)});return
      }
    }
  }
  if(target.matches("[data-action='save']"))setTimeout(()=>afterSave(captureKind||"photo",lastVideoMeta),0)
}
function interceptChange(e){
  if(e.target?.id!=="selfPhoto")return;const file=e.target.files?.[0];if(!file)return;
  captureKind=file.type?.startsWith("video/")?"video":"photo";if(captureKind==="video")lastVideoMeta=window.EviaVideoCapture?.getLastMeta?.()||lastVideoMeta;updateGlobalContext();if(!restoring)setTimeout(()=>rememberDraft(file),0);setTimeout(stageDecorate,0)
}
function observe(){const root=$("#root")||document.body;new MutationObserver(()=>requestAnimationFrame(stageDecorate)).observe(root,{childList:true,subtree:true})}
async function resume(){
  if(resumeAttempted)return;resumeAttempted=true;const r=read(ROUTE,null);if(!r?.oppId)return;route={catId:r.catId||"",jobId:r.jobId||"",oppId:r.oppId||""};stageIndex=Number.isInteger(r.stageIndex)?r.stageIndex:0;updateGlobalContext();
  let tries=0;const timer=setInterval(()=>{
    tries++;const app=$(".evia-app"),avatar=$("[data-evia]");if(!app||!avatar){if(tries>30)clearInterval(timer);return}
    if(!app.classList.contains("is-open")){avatar.click();return}
    const catBtn=document.querySelector(`[data-cat="${CSS.escape(route.catId)}"]`);if(catBtn){catBtn.click();return}
    const jobBtn=document.querySelector(`[data-job="${CSS.escape(route.jobId)}"]`);if(jobBtn){jobBtn.click();return}
    const oppBtn=document.querySelector(`[data-opp="${CSS.escape(route.oppId)}"]`);if(oppBtn){oppBtn.click();clearInterval(timer);setTimeout(()=>restoreDraft(),100);return}
    if(tries>30)clearInterval(timer)
  },180)
}
async function start(){
  await loadIndex();document.addEventListener("click",interceptClick,true);document.addEventListener("change",interceptChange,true);window.addEventListener("evia-guided-video-delivered",e=>{const file=e.detail?.file;if(file){captureKind="video";lastVideoMeta=window.EviaVideoCapture?.getLastMeta?.()||lastVideoMeta;setTimeout(()=>rememberDraft(file),0);setTimeout(stageDecorate,0)}});observe();stageDecorate();setTimeout(resume,500);
  window.EviaStagedEvidence=Object.freeze({version:VERSION,context:()=>window.EviaGuidedEvidenceContext||null,stagesForCurrent:()=>stagesFor(contextFor()),openPhoto})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
