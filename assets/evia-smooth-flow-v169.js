(()=>{
"use strict";
const VERSION=169,STORE="evia-selfobs-live-v3",OLD_PROMPT_KEY="evia-post-evidence-otj-last-v1";
let completionBusy=false;
const $=q=>document.querySelector(q);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const course=()=>window.EviaCourseContext?.current?.()||{};
const isNvq=()=>course()?.courseType==="nvq";
const todayISO=()=>{const d=new Date(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${d.getFullYear()}-${m}-${day}`};
function ensureStyle(){if(document.getElementById("evia-smooth-flow-v169-style"))return;document.getElementById("evia-smooth-flow-v161-style")?.remove();const s=document.createElement("style");s.id="evia-smooth-flow-v169-style";s.textContent=`
.evia-post-save-v161{min-height:min(31rem,68svh);display:grid;place-content:center;gap:1rem;text-align:center;padding:2rem 1.25rem;box-sizing:border-box}.evia-post-save-v161 .evia-post-save-mark{width:4.4rem;height:4.4rem;margin:0 auto;border-radius:50%;display:grid;place-items:center;background:#fff8cc;border:2px solid #efc33d;color:#7d6210;font-size:1.7rem;font-weight:800}.evia-post-save-v161 h2{margin:0;font-size:1.45rem;line-height:1.15;color:#35322a}.evia-post-save-v161 p{margin:0 auto;max-width:22rem;color:#777267;font-size:.76rem;line-height:1.5}.evia-post-save-v161 textarea{width:min(100%,22rem);min-height:8rem;margin:.15rem auto 0;box-sizing:border-box;border:1px solid #e4dfd1;border-radius:1.15rem;background:#fff;padding:1rem;font:500 .86rem/1.5 system-ui,-apple-system,sans-serif;color:#36332d;resize:none;outline:none}.evia-post-save-v161 textarea:focus,.evia-post-save-v161 input:focus{border-color:#e7bd30;box-shadow:0 0 0 3px rgba(239,195,61,.14)}.evia-post-save-v161 .evia-learning-time-v161{display:grid;grid-template-columns:1fr 1fr;gap:.65rem;width:min(100%,22rem);margin:0 auto}.evia-post-save-v161 .evia-learning-time-v161 label{display:grid;gap:.3rem;text-align:left;color:#777267;font-size:.62rem}.evia-post-save-v161 .evia-learning-time-v161 input{width:100%;box-sizing:border-box;border:1px solid #e4dfd1;border-radius:1rem;background:#fff;padding:.82rem .9rem;font:600 .82rem/1 system-ui,-apple-system,sans-serif;color:#36332d;outline:none}.evia-post-save-v161 .self-button{width:min(100%,22rem);margin:0 auto}.evia-post-save-v161 .evia-post-save-counter{font-size:.62rem;color:#9e998c}.evia-post-save-v161 .evia-post-save-status{min-height:1rem;color:#9a6f15;font-size:.58rem}.evia-post-save-v161 .evia-post-save-skip{background:transparent!important;border:0!important;box-shadow:none!important;color:#777267!important;text-decoration:underline;text-underline-offset:.2rem;min-height:2.25rem!important}.evia-completion-fading-v161{pointer-events:none!important}@media(prefers-reduced-motion:reduce){.evia-completion-fading-v161{opacity:1!important}}
`;document.head.appendChild(s)}
async function fadeOut(el,duration=120){if(!el)return;if(reduced()||typeof el.animate!=="function")return;el.classList.add("evia-completion-fading-v161");try{const a=el.animate([{opacity:1},{opacity:0}],{duration,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});try{await a.finished}catch{}try{a.cancel()}catch{}if(el.isConnected)el.style.opacity="0"}finally{if(!el.isConnected)return}}
async function fadeIn(el,duration=165){if(!el||!el.isConnected)return;if(reduced()||typeof el.animate!=="function"){el.style.removeProperty("opacity");el.classList.remove("evia-completion-fading-v161");return}el.style.opacity="0";try{const a=el.animate([{opacity:0},{opacity:1}],{duration,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"});try{await a.finished}catch{}try{a.cancel()}catch{}}finally{if(el.isConnected){el.style.removeProperty("opacity");el.classList.remove("evia-completion-fading-v161")}}}
async function swap(host,html,bind){if(!host||!host.isConnected)return false;await fadeOut(host);if(!host.isConnected)return false;host.innerHTML=html;bind?.(host);await fadeIn(host);return host.isConnected}
function currentIds(){const xs=read(STORE,[]);return new Set(Array.isArray(xs)?xs.map(e=>e?.id).filter(Boolean):[])}
async function waitForNew(before,timeout=7000){const until=Date.now()+timeout;while(Date.now()<until){const xs=read(STORE,[]);if(Array.isArray(xs)){const e=xs.find(x=>x?.id&&!before.has(x.id));if(e)return e}await wait(80)}return null}
function saveReflection(entryId,text){const xs=read(STORE,[]);if(!Array.isArray(xs))return false;const e=xs.find(x=>x?.id===entryId);if(!e)return false;e.learningReflection=text;e.learningReflectionAt=Date.now();return write(STORE,xs)}
function suppressLegacy(entry){document.querySelector(".evia-post-otj-v114")?.remove();try{sessionStorage.setItem(OLD_PROMPT_KEY,String(entry?.id||""))}catch{}}
function savedMarkup(){return `<div class="evia-post-save-v161" data-post-save-state="saved"><div class="evia-post-save-mark">✓</div><h2>Evidence saved</h2></div>`}
function learningMarkup(){const label=isNvq()?"GLH":"OTJ";return `<div class="evia-post-save-v161" data-post-save-state="learning"><h2>What did you learn?</h2><p>Add the new learning and the genuine time spent learning so Evia can record ${label} evidence.</p><textarea data-post-save-learning maxlength="700" spellcheck="true" placeholder="What did you learn?"></textarea><div class="evia-post-save-counter"><span>0</span>/700</div><div class="evia-learning-time-v161"><label>Hours<input type="number" min="0" max="12" step="1" inputmode="numeric" data-post-save-hours placeholder="0"></label><label>Minutes<input type="number" min="0" max="59" step="1" inputmode="numeric" data-post-save-minutes placeholder="0"></label></div><button type="button" class="self-button primary" data-post-save-submit disabled>Save ${label}</button><button type="button" class="self-button evia-post-save-skip" data-post-save-skip>Skip for now</button><div class="evia-post-save-status" data-post-save-status></div></div>`}
function resetHost(host){try{host?.getAnimations?.().forEach(animation=>animation.cancel())}catch{}if(host?.isConnected){host.classList.remove("evia-completion-fading-v161");host.style.removeProperty("opacity");host.style.removeProperty("pointer-events")}}
async function goHome(host){
  try{if(host?.isConnected)await fadeOut(host)}catch{}
  try{window.EviaNvqPracticalNav?.close?.()}catch(error){console.debug("Evia practical cleanup",error)}
  try{window.EviaStagedEvidence?.close?.()}catch(error){console.debug("Evia staged cleanup",error)}
  document.querySelectorAll(".evia-stage-overlay-v132,.evia-nvq-audio-overlay-v150,.evia-post-otj-v114,.evia-nvq-practical-list-v151").forEach(el=>el.remove());
  document.querySelector(".menu-stage")?.classList.remove("evia-stage-managed-v132");
  resetHost(host);resetHost(document.querySelector(".self-panel"));
  const app=$(".evia-app.selfobs"),stage=$(".menu-stage"),evia=$("[data-evia]");
  if(app?.classList.contains("is-open")&&evia){try{evia.click()}catch{}}
  if(app)app.classList.remove("is-open");
  stage?.setAttribute("aria-hidden","true");evia?.setAttribute("aria-expanded","false");
}
async function finishAndHome(host){try{await goHome(host)}finally{completionBusy=false;resetHost(document.querySelector(".self-panel"))}}
async function startCompletion(entry){if(completionBusy||!entry?.id)return false;completionBusy=true;suppressLegacy(entry);ensureStyle();const host=$(".evia-stage-overlay-v132")||$(".evia-nvq-audio-overlay-v150")||$(".self-panel");if(!host){completionBusy=false;return false}
  try{
    host.classList.remove("evia-capture-mode-v137","evia-photo-mode-v137","evia-video-mode-v137");
    if(!await swap(host,savedMarkup())){completionBusy=false;return false}
    await wait(2000);
    if(!await swap(host,learningMarkup(),h=>{
      const ta=h.querySelector("[data-post-save-learning]"),hours=h.querySelector("[data-post-save-hours]"),minutes=h.querySelector("[data-post-save-minutes]"),submit=h.querySelector("[data-post-save-submit]"),skip=h.querySelector("[data-post-save-skip]"),count=h.querySelector(".evia-post-save-counter span"),status=h.querySelector("[data-post-save-status]");
      const sync=()=>{const words=(ta.value.trim().match(/\S+/g)||[]).length,total=Math.max(0,Math.round((Number(hours.value)||0)*60+(Number(minutes.value)||0)));count.textContent=ta.value.length;submit.disabled=words<3||total<1};
      [ta,hours,minutes].forEach(el=>el.addEventListener("input",sync));
      skip.onclick=async()=>{submit.disabled=true;skip.disabled=true;window.dispatchEvent(new CustomEvent("evia:evidence-reflection-skipped",{detail:{entryId:entry.id,type:isNvq()?"GLH":"OTJ"}}));await finishAndHome(h)};
      submit.onclick=async()=>{const text=ta.value.trim(),total=Math.max(0,Math.round((Number(hours.value)||0)*60+(Number(minutes.value)||0)));if((text.match(/\S+/g)||[]).length<3||total<1)return;submit.disabled=true;skip.disabled=true;try{if(!saveReflection(entry.id,text)){status.textContent="That learning note could not be saved.";submit.disabled=false;skip.disabled=false;return}const saved=window.EviaPostEvidenceOTJ?.record?.({learned:text,durationMinutes:total,date:todayISO()});if(saved===false){status.textContent=`That ${isNvq()?"GLH":"OTJ"} entry could not be saved.`;submit.disabled=false;skip.disabled=false;return}window.dispatchEvent(new CustomEvent("evia:evidence-reflection-saved",{detail:{entryId:entry.id,text,durationMinutes:total,type:isNvq()?"GLH":"OTJ"}}));await finishAndHome(h)}catch(error){console.error("Evia learning save",error);status.textContent="That learning entry could not be completed. You can skip it for now.";submit.disabled=false;skip.disabled=false}};
      sync();requestAnimationFrame(()=>ta.focus({preventScroll:true}));
    })){completionBusy=false;return false}
    return true
  }catch(error){console.error("Evia evidence completion flow",error);try{await goHome(host)}catch{}completionBusy=false;return false}
}
window.addEventListener("evia:evidence-saved",event=>{startCompletion(event.detail?.entry).catch(error=>{console.debug("Evia evidence completion event",error);completionBusy=false})});
document.addEventListener("click",event=>{const button=event.target?.closest?.(".self-panel [data-action='save'],[data-save-audio],[data-skip-audio]");if(!button||button.disabled||completionBusy)return;const before=currentIds();(async()=>{const entry=await waitForNew(before);if(entry)await startCompletion(entry)})().catch(error=>{console.debug("Evia save completion",error);completionBusy=false})},true);
ensureStyle();
window.EviaSmoothFlow=Object.freeze({version:VERSION,start:startCompletion});
})();
