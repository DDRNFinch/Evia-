(()=>{
"use strict";
// Free Evia: the paid course-code catalogue stays available internally,
// but Time must not expose a learner-facing entry button.
const STYLE_ID="evia-time-course-button-v237-style";
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent='[data-course-qr-codes]{display:none!important}';
  document.head.appendChild(style);
}
function removeExisting(){document.querySelectorAll('[data-course-qr-codes]').forEach(button=>button.remove())}
installStyle();
removeExisting();
window.addEventListener("pageshow",removeExisting);
window.EviaTimeCourseButton=Object.freeze({version:237});
})();
