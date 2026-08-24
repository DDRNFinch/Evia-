(()=>{
"use strict";
const VERSION=187;
const meta=document.querySelector('meta[name="evia-app-version"]');if(meta)meta.setAttribute("content",String(VERSION));window.EviaAppVersion=VERSION;
let queued=false,observer=null;
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
function openLearnerProfile(event){event?.preventDefault?.();event?.stopPropagation?.();const open=window.EviaLearnerProfile?.open;if(typeof open==="function"){open();return}setTimeout(()=>window.EviaLearnerProfile?.open?.(),60)}
function ensureHeaderGuardStyle(){if(document.getElementById("evia-header-guard-v183-style"))return;const s=document.createElement("style");s.id="evia-header-guard-v183-style";s.textContent=`.evia-app.selfobs .self-top>small{font-size:0!important}.evia-app.selfobs .self-top>small>.evia-course-name-v113{display:block!important;font-size:.55rem!important;line-height:1.08!important}.evia-app.selfobs .self-top>small>.evia-course-code-v113{display:block!important;font-size:.49rem!important;line-height:1.08!important}.evia-app.selfobs .self-top>small>.evia-learner-name-v113,.evia-app.selfobs .self-top>small>.evia-learner-name-v114{font-size:.51rem!important}`;document.head.appendChild(s)}
function identity(){
  const c=window.EviaCourseContext?.current?.()||{},t=read("evia-course-timeline",{}),id=String(c.courseId||t.courseId||"").toLowerCase(),path=String(c.pathway||t.pathway||"").toLowerCase();
  if(id==="6570-05")return{name:"Trowel",code:"6570-05"};
  if(id==="st0095-v1-2")return{name:"Bricklayer",code:"ST0095"};
  if(id==="st0264-v1-4")return{name:path==="architectural-joiner"?"Joinery":"Carpentry",code:"ST0264"};
  const raw=String(c.shortTitle||c.courseTitle||c.title||t.courseTitle||"Course").trim(),source=String(c.standardId||c.standard||c.courseId||raw),m=source.match(/\b(ST\d+|\d{4}-\d{2})\b/i),code=(m?.[1]||"").toUpperCase(),name=raw.replace(/\bNVQ\b/gi,"").replace(/\bLevel\s*\d+\b/gi,"").replace(/\bST\d+\b/gi,"").replace(/\b\d{4}-\d{2}\b/g,"").replace(/[—–-]+\s*$/g,"").replace(/\s{2,}/g," ").trim()||"Course";
  return{name,code}
}
function cleanCourseHeader(){
  ensureHeaderGuardStyle();
  const top=document.querySelector(".evia-app.selfobs .self-top");if(!top)return;
  let preferred=top.querySelector(":scope > small.evia-course-identity-v113")||top.querySelector(":scope > small");
  top.querySelectorAll(":scope > small").forEach(el=>{if(el!==preferred)el.remove()});
  [...top.children].forEach(el=>{if(el===preferred||el.matches("b,.evia-target-mini"))return;el.remove()});
  if(!preferred){preferred=document.createElement("small");preferred.className="evia-course-identity-v113";top.appendChild(preferred)}
  preferred.classList.add("evia-course-identity-v113");
  const x=identity(),person=String(localStorage.getItem("evia-full-name")||"").trim()||"Learner profile";
  let name=preferred.querySelector(":scope > .evia-course-name-v113"),code=preferred.querySelector(":scope > .evia-course-code-v113"),learner=preferred.querySelector(":scope > .evia-learner-name-v113,:scope > .evia-learner-name-v114");
  const unexpected=[...preferred.childNodes].some(node=>node.nodeType===3&&String(node.textContent||"").trim())||[...preferred.children].some(el=>!el.matches(".evia-course-name-v113,.evia-course-code-v113,.evia-learner-name-v113,.evia-learner-name-v114"));
  if(!name||!code||!learner||unexpected){
    preferred.replaceChildren();
    name=document.createElement("span");name.className="evia-course-name-v113";
    code=document.createElement("span");code.className="evia-course-code-v113";
    learner=document.createElement("button");learner.type="button";learner.className="evia-learner-name-v113";
    preferred.append(name,code,learner)
  }
  if(name.textContent!==x.name)name.textContent=x.name;if(code.textContent!==x.code)code.textContent=x.code;if(learner.textContent!==person)learner.textContent=person;
  learner.onclick=openLearnerProfile;learner.setAttribute("aria-label",`Open learner profile for ${person}`);
  [...preferred.childNodes].forEach(node=>{if(node.nodeType===3&&String(node.textContent||"").trim())node.remove()});
}
const LABELS=Object.freeze({TOC:"Time",KSB:"Course",AC:"Course",OTJ:"Learn",GLH:"Learn",EPA:"Test",ARP:"Test",Units:"Test","Q&A":"Test"});
function cleanArchLabels(){document.querySelectorAll(".progress-arch[data-arch]").forEach(button=>{const wanted=LABELS[button.dataset.arch];if(!wanted)return;const label=button.querySelector(".arch-label");if(label&&label.textContent!==wanted)label.textContent=wanted;const aria=button.getAttribute("aria-label");if(aria){const next=aria.replace(/\bARP\b/g,"Test").replace(/\bEPA\b/g,"Test").replace(/\bUnits\b/g,"Test").replace(/\bGLH\b/g,"Learn").replace(/\bOTJ\b/g,"Learn").replace(/\bKSBs?\b/g,"Course").replace(/\bACs?\b/g,"Course").replace(/\bTOC\b/g,"Time");if(next!==aria)button.setAttribute("aria-label",next)}})}
function patch(){queued=false;try{cleanCourseHeader();cleanArchLabels()}catch(e){console.debug("Evia identity cleanup",e)}}
function queue(){if(queued)return;queued=true;queueMicrotask(patch)}
function start(){ensureHeaderGuardStyle();queue();const root=document.getElementById("root")||document.body;if(root&&!observer){observer=new MutationObserver(records=>{if(records.some(r=>{const t=r.target?.nodeType===1?r.target:r.target?.parentElement;if(t?.closest?.(".self-top,.progress-arch"))return true;return[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(".self-top,.progress-arch")||n.querySelector?.(".self-top,.progress-arch")))}))queue()});observer.observe(root,{subtree:true,childList:true,characterData:true})}setTimeout(queue,250);setTimeout(queue,900)}
ensureHeaderGuardStyle();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();window.addEventListener("pageshow",queue);window.addEventListener("focus",queue);window.addEventListener("storage",queue);
})();