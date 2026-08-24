(()=>{
"use strict";
const VERSION=150,STORE="evia-selfobs-live-v3",DB="evia-self-observation-media",DBS="files";
let active=null,overlay=null,stream=null,recorder=null,chunks=[],timer=null,startedAt=0,markers=[],promptIndex=0,audioFile=null,saved=false;
const $=q=>document.querySelector(q);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const clock=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,"0")}:${String(Math.max(0,s)%60).padStart(2,"0")}`;
function course(){return window.EviaCourseContext?.current?.()||{}}
function isTrowel(){const c=course();return c?.courseId==="6570-05"&&c?.courseType==="nvq"}
function siteData(){const a=window.EviaCoursePacks?.active?.(),d=a?.pathway?.siteData||a?.pack?.siteData;return Array.isArray(d)?d:[]}
function contextFor(id){for(const cat of siteData())for(const job of cat.jobs||[])for(const opp of job.opps||[])if(String(opp.id)===String(id))return{cat,job,opp};return null}
function isAudioOpp(opp){const m=Array.isArray(opp?.methods)?opp.methods:[];return opp?.media==="audio"||(m.length===1&&m[0]==="audio")}
function prompts(){const xs=Array.isArray(active?.opp?.prompts)?active.opp.prompts.filter(Boolean):[];return xs.length?xs:[active?.opp?.question||"Explain this activity clearly."]}
function style(){
 if(document.getElementById("evia-nvq-audio-v150-style"))return;
 const s=document.createElement("style");s.id="evia-nvq-audio-v150-style";s.textContent=`
 .selfobs .evia-nvq-audio-overlay-v150{position:absolute;inset:0;z-index:70;background:linear-gradient(180deg,#fff 0%,#fff 62%,#fff9dd 100%);overflow:auto;padding:0 0 7rem}
 .selfobs .evia-nvq-audio-card-v150{margin:1rem 1.15rem;padding:1.25rem;border:1px solid #efe9d5;border-radius:1.4rem;background:#fff;box-shadow:0 .45rem 1.6rem rgba(118,98,26,.08);display:grid;gap:1rem;text-align:center}
 .selfobs .evia-nvq-audio-orb-v150{width:5.2rem;height:5.2rem;margin:.15rem auto;border-radius:50%;display:grid;place-items:center;background:#fff8d1;border:2px solid #f2c536;box-shadow:0 0 0 .55rem rgba(242,197,54,.12)}
 .selfobs .evia-nvq-audio-orb-v150:before{content:"";width:1.15rem;height:1.7rem;border:.15rem solid #b38d08;border-radius:.7rem .7rem .85rem .85rem}
 .selfobs .evia-nvq-audio-orb-v150.recording{animation:eviaAudioPulse150 1.35s ease-in-out infinite}
 .selfobs .evia-nvq-audio-time-v150{font-size:1.7rem;font-weight:750;letter-spacing:.04em;color:#39362c}
 .selfobs .evia-nvq-audio-state-v150{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#9a9277}
 .selfobs .evia-nvq-audio-prompt-v150{text-align:left;padding:1rem 1.05rem;border-radius:1rem;background:#fff8d8;border:1px solid #eedc86}
 .selfobs .evia-nvq-audio-prompt-v150 small{display:block;margin-bottom:.35rem;color:#9a8623;font-size:.64rem;text-transform:uppercase;letter-spacing:.08em}
 .selfobs .evia-nvq-audio-prompt-v150 strong{display:block;font-size:.86rem;line-height:1.45;color:#343124}
 .selfobs .evia-nvq-audio-prompt-v150 span{display:block;margin-top:.45rem;color:#9b9582;font-size:.62rem}
 .selfobs .evia-nvq-audio-summary-v150 p{display:grid;grid-template-columns:3.1rem 1fr;gap:.55rem;margin:.4rem 0;text-align:left;font-size:.7rem;line-height:1.4}
 .selfobs .evia-nvq-audio-summary-v150 p b{color:#9a8623}.selfobs .evia-nvq-audio-summary-v150 p span{color:#59564d}
 @keyframes eviaAudioPulse150{0%,100%{box-shadow:0 0 0 .55rem rgba(242,197,54,.12)}50%{box-shadow:0 0 0 1rem rgba(242,197,54,.04)}}
 @media(prefers-reduced-motion:reduce){.selfobs .evia-nvq-audio-orb-v150.recording{animation:none}}
 `;document.head.appendChild(s)
}
function cleanup(){clearInterval(timer);timer=null;try{if(recorder&&recorder.state!=="inactive"){recorder.onstop=null;recorder.stop()}}catch{}recorder=null;chunks=[];try{stream?.getTracks?.().forEach(t=>t.stop())}catch{}stream=null;startedAt=0}
function root(){
 const host=$(".menu-stage");if(!host)return null;style();
 if(!overlay){overlay=document.createElement("section");overlay.className="evia-stage-overlay-v132 evia-nvq-audio-overlay-v150";host.appendChild(overlay)}
 return overlay
}
function toast(msg){const t=$(".app-toast");if(!t)return;t.textContent=msg;t.classList.add("is-visible");setTimeout(()=>t.classList.remove("is-visible"),2600)}
function backUnderlying(){const b=$(".self-panel [data-action='back']");if(b)try{b.click()}catch{}}
function close(){
 cleanup();overlay?.remove();overlay=null;const wasSaved=saved;saved=false;active=null;audioFile=null;markers=[];promptIndex=0;
 if(!wasSaved)backUnderlying()
}
function head(title,copy){return `<button class="self-back" type="button" data-audio-back>‹ Back</button><div class="evia-stage-head-v132"><div class="evia-stage-kicker-v132">Audio evidence</div><h2 class="self-title">${esc(title)}</h2>${copy?`<p class="self-copy">${esc(copy)}</p>`:""}</div>`}
function bindBack(){overlay?.querySelector("[data-audio-back]")?.addEventListener("click",close)}
function methodChoice(){
 cleanup();const o=root();if(!o||!active)return;const a=active.opp;
 o.innerHTML=head(a.title,a.instruction)+`<div class="self-card evia-stage-method-card-v132"><span>Guided audio explanation</span><div class="evia-stage-methods-v132"><button type="button" class="self-button primary" data-open-audio>Record audio</button></div></div>`;
 bindBack();o.querySelector("[data-open-audio]").onclick=openAudio
}
async function openAudio(){
 cleanup();const o=root();if(!o||!active)return;const ps=prompts();promptIndex=0;markers=[];audioFile=null;
 o.innerHTML=head(active.opp.title,"Evia will give you one prompt at a time. Keep the recording running and press Next prompt when you are ready.")+`<div class="evia-nvq-audio-card-v150"><div class="evia-nvq-audio-orb-v150"></div><div class="evia-nvq-audio-time-v150" data-audio-time>00:00</div><div class="evia-nvq-audio-state-v150" data-audio-state>Opening microphone…</div><div class="evia-nvq-audio-prompt-v150"><small>What to talk about</small><strong data-audio-prompt>${esc(ps[0])}</strong><span data-audio-count>Prompt 1 of ${ps.length}</span></div></div><div class="self-actions" data-audio-actions><button type="button" class="self-button primary" data-start-audio disabled>Opening microphone…</button></div>`;
 bindBack();
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){audioError("Microphone access is unavailable.");return}
 try{
   stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true},video:false});
   const start=o.querySelector("[data-start-audio]");if(!start)return;
   start.disabled=false;start.textContent="Start recording";o.querySelector("[data-audio-state]").textContent="Ready";
   start.onclick=()=>startRecording(ps)
 }catch(err){console.error("Evia NVQ audio",err);audioError("Allow microphone access for Evia and try again.")}
}
function audioError(message){const o=root();if(!o)return;const state=o.querySelector("[data-audio-state]");if(state)state.textContent=message;const actions=o.querySelector("[data-audio-actions]");if(actions){actions.innerHTML='<button type="button" class="self-button primary" data-audio-retry>Try again</button>';actions.querySelector("[data-audio-retry]").onclick=openAudio}}
function preferredMime(){if(typeof MediaRecorder==="undefined")return"";const xs=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];return xs.find(x=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(x))||""}
function startRecording(ps){
 if(!stream)return;const mime=preferredMime(),opts={audioBitsPerSecond:64000};if(mime)opts.mimeType=mime;
 try{recorder=new MediaRecorder(stream,opts)}catch{try{recorder=new MediaRecorder(stream)}catch{return}}
 startedAt=Date.now();chunks=[];promptIndex=0;markers=[{seconds:0,prompt:ps[0]}];
 const o=root(),time=o.querySelector("[data-audio-time]"),state=o.querySelector("[data-audio-state]"),orb=o.querySelector(".evia-nvq-audio-orb-v150"),actions=o.querySelector("[data-audio-actions]");
 state.textContent="Recording";orb.classList.add("recording");
 const tick=()=>{if(time)time.textContent=clock(Math.floor((Date.now()-startedAt)/1000))};tick();timer=setInterval(tick,250);
 recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
 recorder.onstop=()=>{
   clearInterval(timer);timer=null;try{stream?.getTracks?.().forEach(t=>t.stop())}catch{}stream=null;
   const type=recorder?.mimeType||mime||chunks[0]?.type||"audio/webm",finished=Date.now(),blob=new Blob(chunks,{type}),meta={startedAt,durationSeconds:Math.max(1,Math.round((finished-startedAt)/1000)),markers:[...markers]};
   audioFile=new File([blob],`evia-audio-${startedAt}.${type.includes("mp4")?"m4a":type.includes("ogg")?"ogg":"webm"}`,{type,lastModified:finished});recorder=null;chunks=[];renderComplete(audioFile,meta,"")
 };
 recorder.start(250);
 function actionsForPrompt(){
   if(promptIndex<ps.length-1){
     actions.innerHTML='<button type="button" class="self-button" data-restart-audio>Restart</button><button type="button" class="self-button primary" data-next-audio>Next prompt</button>';
     actions.querySelector("[data-next-audio]").onclick=()=>{promptIndex++;markers.push({seconds:Math.floor((Date.now()-startedAt)/1000),prompt:ps[promptIndex]});o.querySelector("[data-audio-prompt]").textContent=ps[promptIndex];o.querySelector("[data-audio-count]").textContent=`Prompt ${promptIndex+1} of ${ps.length}`;actionsForPrompt()}
   }else{
     actions.innerHTML='<button type="button" class="self-button" data-restart-audio>Restart</button><button type="button" class="self-button primary" data-finish-audio>Finish recording</button>';
     actions.querySelector("[data-finish-audio]").onclick=()=>{if(recorder?.state!=="inactive")recorder.stop()}
   }
   actions.querySelector("[data-restart-audio]").onclick=()=>{cleanup();openAudio()}
 }
 actionsForPrompt()
}
function answer(meta,extra){const lines=["Guided audio explanation",`Recording started: ${new Date(meta.startedAt).toLocaleString("en-GB")}`,...(meta.markers||[]).map(m=>`${clock(Number(m.seconds)||0)} — ${m.prompt}`)];if(extra.trim())lines.push("","Additional learner note:",extra.trim());return lines.join("\n")}
function renderComplete(file,meta,text){
 cleanup();const o=root();if(!o||!active)return;
 o.innerHTML=head("Audio complete","If your spoken explanation covered everything, skip the extra text. Add more only if it helps the evidence.")+`<div class="self-card evia-stage-summary-v132 evia-nvq-audio-summary-v150"><strong>${esc(active.opp.title)}</strong><small>Prompt timestamps saved for the PDF</small><div>${(meta.markers||[]).map(m=>`<p><b>${clock(Number(m.seconds)||0)}</b><span>${esc(m.prompt)}</span></p>`).join("")}</div></div><textarea data-audio-extra maxlength="700" placeholder="Optional extra explanation...">${esc(text)}</textarea><div class="evia-stage-counter-v132"><span>${text.length}</span>/700</div><div class="self-actions evia-stage-three-v132"><button type="button" class="self-button" data-redo-audio>Record again</button><button type="button" class="self-button" data-skip-audio>Skip text</button><button type="button" class="self-button primary" data-save-audio>Save with text</button></div>`;
 bindBack();const ta=o.querySelector("[data-audio-extra]"),count=o.querySelector(".evia-stage-counter-v132 span");ta.oninput=()=>count.textContent=ta.value.length;
 o.querySelector("[data-redo-audio]").onclick=openAudio;o.querySelector("[data-skip-audio]").onclick=()=>saveViaCore(file,meta,"");o.querySelector("[data-save-audio]").onclick=()=>saveViaCore(file,meta,ta.value)
}
async function saveViaCore(file,meta,extra){
 if(!active||!file)return;const o=root(),buttons=o.querySelectorAll("button");buttons.forEach(b=>b.disabled=true);
 let status=document.createElement("div");status.className="evia-stage-saving-v132";status.textContent="Saving evidence…";o.appendChild(status);
 const before=new Set((read(STORE,[])||[]).map(e=>e?.id));
 try{
   const input=$("#selfPhoto");if(!input||typeof input.onchange!=="function")throw Error("evidence input unavailable");
   input.onchange({target:{files:[file],value:""}});await wait(0);
   const next=$(".self-panel [data-action='next']");if(!next||next.disabled)throw Error("next unavailable");next.click();await wait(0);
   const type=$(".self-panel [data-mode='type']");if(!type)throw Error("type unavailable");type.click();await wait(0);
   const ta=$("#selfText"),save=$(".self-panel [data-action='save']");if(!ta||!save)throw Error("save unavailable");
   const text=answer(meta,extra);ta.value=text;ta.dispatchEvent(new Event("input",{bubbles:true}));save.click();
   let entry=null,xs=null;for(let i=0;i<60;i++){await wait(80);xs=read(STORE,[]);entry=Array.isArray(xs)?xs.find(e=>!before.has(e?.id)&&e?.opportunityId===active.opp.id):null;if(entry)break}
   if(!entry)throw Error("evidence was not saved");
   entry.audioId=entry.photoId||entry.audioId||null;entry.photoId=null;entry.answerMode="talk";entry.answerText=text;entry.mediaKind="audio";
   entry.audioStartedAt=meta.startedAt||null;entry.audioPromptMarkers=meta.markers||[];entry.audioDurationSeconds=meta.durationSeconds??null;
   entry.activityCode=active.opp.activityCode||null;entry.groupId=active.opp.groupId||active.cat.id;entry.groupTitle=active.opp.groupTitle||active.cat.title;
   entry.subCategoryId=active.opp.subCategoryId||active.job.id;entry.subCategoryTitle=active.opp.subCategoryTitle||active.job.title;
   write(STORE,xs);saved=true;toast("Audio evidence saved.");window.EviaEvidenceMedia?.refresh?.();close()
 }catch(error){console.error("Evia NVQ audio save",error);status.textContent="That evidence could not be saved. Try again.";buttons.forEach(b=>b.disabled=false)}
}
function open(ctx){active=ctx;saved=false;methodChoice()}
function intercept(event){
 if(!isTrowel())return;const b=event.target?.closest?.("[data-opp]");if(!b)return;const ctx=contextFor(b.dataset.opp);if(!ctx||!isAudioOpp(ctx.opp))return;
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
 const core=b.onclick;if(typeof core==="function")try{core.call(b)}catch(error){console.debug("Evia NVQ audio context",error)}
 open(ctx)
}
function start(){document.addEventListener("click",intercept,true);window.EviaNvqAudio=Object.freeze({version:VERSION,open})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start()
})();
