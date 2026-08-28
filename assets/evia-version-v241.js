(()=>{
"use strict";
const VERSION=241;
const meta=document.querySelector('meta[name="evia-app-version"]');
if(meta)meta.setAttribute("content",String(VERSION));
window.EviaAppVersion=241;
const STYLE_ID="evia-time-course-button-v241-style";
function installStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID;style.textContent='[data-course-qr-codes]{display:none!important}';document.head.appendChild(style)}
function keepLearnerCourseCodesHidden(){document.querySelectorAll('[data-course-qr-codes]').forEach(button=>button.remove())}
installStyle();keepLearnerCourseCodesHidden();
window.addEventListener("click",event=>{const target=event.target;if(target instanceof Element&&target.closest('[data-arch="TOC"]'))queueMicrotask(keepLearnerCourseCodesHidden)},true);
window.addEventListener("pageshow",keepLearnerCourseCodesHidden);
window.addEventListener("load",keepLearnerCourseCodesHidden);
})();
