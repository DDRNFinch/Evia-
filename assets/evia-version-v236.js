(()=>{
"use strict";
const VERSION=236;
const meta=document.querySelector('meta[name="evia-app-version"]');
if(meta)meta.setAttribute("content","236");
window.EviaAppVersion=236;

// Only remove the learner-facing Course QR Codes button from Time.
// Keep the underlying course enrolment and QR machinery untouched for the paid route.
const STYLE_ID="evia-time-course-button-v236-style";
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent='[data-course-qr-codes]{display:none!important}';
  document.head.appendChild(style);
}
function removeTimeCourseCodesButton(){
  document.querySelectorAll('[data-course-qr-codes]').forEach(button=>button.remove());
}
installStyle();
removeTimeCourseCodesButton();
window.addEventListener('click',event=>{
  const target=event.target;
  if(target instanceof Element&&target.closest('[data-arch="TOC"]'))queueMicrotask(removeTimeCourseCodesButton);
},true);
window.addEventListener('pageshow',removeTimeCourseCodesButton);
window.addEventListener('load',removeTimeCourseCodesButton);
})();
