(()=>{
"use strict";
const VERSION=215,RECEIPT_KEY="evia-course-enrolment-v1",DEMO_KEY="evia-demo-mode-v1",STYLE_ID="evia-profile-course-lock-v215-style";
function active(){return !!localStorage.getItem(RECEIPT_KEY)&&localStorage.getItem(DEMO_KEY)!=="1"}
function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.evia-profile-v113 .evia-profile-field-v113.evia-course-locked-v215 select{pointer-events:none!important;opacity:1!important;color:#555!important;background:#faf8ef!important;border-color:rgba(214,166,21,.18)!important;-webkit-text-fill-color:#555!important}.evia-course-lock-note-v215{display:block;margin:.28rem .15rem 0;color:#9a873d;font-size:.51rem;line-height:1.35}
`;document.head.appendChild(s)}
function lock(){if(!active())return;style();const layer=document.querySelector(".evia-profile-v113");if(!layer)return;const course=layer.querySelector("#eviaProfileCourse"),path=layer.querySelector("#eviaProfilePathway");[course,path].forEach(select=>{if(!select)return;select.setAttribute("aria-readonly","true");select.tabIndex=-1;select.style.pointerEvents="none";select.closest(".evia-profile-field-v113")?.classList.add("evia-course-locked-v215")});const field=course?.closest(".evia-profile-field-v113");if(field&&!field.querySelector(".evia-course-lock-note-v215")){const note=document.createElement("small");note.className="evia-course-lock-note-v215";note.textContent="Course is activated by the learner's Evia Course QR.";field.appendChild(note)}}
function start(){if(!active())return;style();document.addEventListener("click",e=>{if(e.target?.closest?.(".evia-learner-name-v113"))setTimeout(lock,0)},false);window.addEventListener("pageshow",()=>setTimeout(lock,0))}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaProfileCourseLockV215=Object.freeze({version:VERSION,refresh:lock});
})();