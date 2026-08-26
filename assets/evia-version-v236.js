(()=>{
"use strict";
const VERSION=236;
const meta=document.querySelector('meta[name="evia-app-version"]');
if(meta)meta.setAttribute("content","236");
window.EviaAppVersion=236;

// Free Evia must not expose the paid course-code/QR catalogue from Time.
// Keep enrolment/import internals intact so a paid entitlement can own them later.
function removeFreeCourseCodeAccess(){
  document.querySelectorAll('[data-course-qr-codes],[data-copy-course-code]').forEach(el=>el.remove());
  document.querySelectorAll('.evia-course-qr-card,.evia-course-qr-grid,.evia-course-qr-status').forEach(el=>el.remove());
  document.querySelectorAll('.evia-toc-layer').forEach(layer=>{
    const heading=layer.querySelector('.evia-tools-body h2');
    if(heading?.textContent?.trim()==='Course QR Codes')layer.remove();
  });
}

window.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  if(target.closest('[data-course-qr-codes],[data-copy-course-code],.evia-course-qr-card')){
    event.preventDefault();
    event.stopImmediatePropagation();
    removeFreeCourseCodeAccess();
    return;
  }
  if(target.closest('[data-arch="TOC"]'))queueMicrotask(removeFreeCourseCodeAccess);
},true);

window.addEventListener('pageshow',removeFreeCourseCodeAccess);
window.addEventListener('load',removeFreeCourseCodeAccess);
if(document.readyState!=='loading')removeFreeCourseCodeAccess();
})();
