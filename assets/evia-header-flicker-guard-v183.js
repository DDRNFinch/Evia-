(()=>{
"use strict";
const VERSION=183;
let cleaning=false,observer=null;
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
function identity(){
  const c=window.EviaCourseContext?.current?.()||{},t=read("evia-course-timeline",{}),id=String(c.courseId||t.courseId||"").toLowerCase(),path=String(c.pathway||t.pathway||"").toLowerCase();
  if(id==="6570-05")return{name:"Trowel",code:"6570-05"};
  if(id==="st0095-v1-2")return{name:"Bricklayer",code:"ST0095"};
  if(id==="st0264-v1-4")return{name:path==="architectural-joiner"?"Joinery":"Carpentry",code:"ST0264"};
  const raw=String(c.shortTitle||c.courseTitle||c.title||t.courseTitle||"Course").trim(),source=String(c.standardId||c.standard||c.courseId||raw),m=source.match(/\b(ST\d+|\d{4}-\d{2})\b/i);
  return{name:raw.replace(/\bNVQ\b/gi,"").replace(/\bLevel\s*\d+\b/gi,"").replace(/\bST\d+\b/gi,"").replace(/\b\d{4}-\d{2}\b/g,"").replace(/[—–-]+\s*$/g,"").replace(/\s{2,}/g," ").trim()||"Course",code:(m?.[1]||"").toUpperCase()}
}
function ensureStyle(){
  if(document.getElementById("evia-header-flicker-guard-v183-style"))return;
  const s=document.createElement("style");s.id="evia-header-flicker-guard-v183-style";
  s.textContent=`.evia-app.selfobs .self-top>small{font-size:0!important}.evia-app.selfobs .self-top>small>.evia-course-name-v113{display:block!important;font-size:.55rem!important;line-height:1.08!important;color:#777!important}.evia-app.selfobs .self-top>small>.evia-course-code-v113{display:block!important;font-size:.49rem!important;line-height:1.08!important;color:#9a989d!important}.evia-app.selfobs .self-top>small>.evia-learner-name-v113,.evia-app.selfobs .self-top>small>.evia-learner-name-v114{font-size:.51rem!important}`;
  document.head.appendChild(s)
}
function clean(){
  if(cleaning)return;cleaning=true;
  try{
    ensureStyle();
    const top=document.querySelector(".evia-app.selfobs .self-top");if(!top)return;
    let small=top.querySelector(":scope > small.evia-course-identity-v113")||top.querySelector(":scope > small");
    top.querySelectorAll(":scope > small").forEach(el=>{if(el!==small)el.remove()});
    [...top.children].forEach(el=>{if(el===small||el.matches("b,.evia-target-mini"))return;el.remove()});
    if(!small){small=document.createElement("small");top.appendChild(small)}
    const x=identity(),person=String(localStorage.getItem("evia-full-name")||"").trim()||"Learner profile";
    const name=small.querySelector(":scope > .evia-course-name-v113"),code=small.querySelector(":scope > .evia-course-code-v113"),learner=small.querySelector(":scope > .evia-learner-name-v113,:scope > .evia-learner-name-v114");
    const unexpected=[...small.childNodes].some(n=>n.nodeType===3&&String(n.textContent||"").trim())||[...small.children].some(el=>!el.matches(".evia-course-name-v113,.evia-course-code-v113,.evia-learner-name-v113,.evia-learner-name-v114"));
    if(!name||!code||!learner||unexpected){
      small.className="evia-course-identity-v113";
      small.replaceChildren();
      const n=document.createElement("span");n.className="evia-course-name-v113";n.textContent=x.name;
      const c=document.createElement("span");c.className="evia-course-code-v113";c.textContent=x.code;
      const b=document.createElement("button");b.type="button";b.className="evia-learner-name-v113";b.textContent=person;
      small.append(n,c,b)
    }else{
      if(name.textContent!==x.name)name.textContent=x.name;
      if(code.textContent!==x.code)code.textContent=x.code;
      if(learner.textContent!==person)learner.textContent=person
    }
  }finally{cleaning=false}
}
function start(){
  clean();
  const root=document.getElementById("root")||document.body;
  observer=new MutationObserver(records=>{for(const r of records){const t=r.target?.nodeType===1?r.target:r.target?.parentElement;if(t?.closest?.(".self-top")||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(".self-top")||n.querySelector?.(".self-top")))){clean();break}}});
  observer.observe(root,{subtree:true,childList:true,characterData:true});
  window.addEventListener("pageshow",clean);window.addEventListener("focus",clean);window.addEventListener("storage",clean)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaHeaderFlickerGuard=Object.freeze({version:VERSION,refresh:clean});
})();
