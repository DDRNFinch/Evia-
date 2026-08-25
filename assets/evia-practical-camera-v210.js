(()=>{
"use strict";
const SELECTOR=".evia-practical-evidence .evia-practical-upload";
function cameraLabel(node){
  const label=node?.closest?.(SELECTOR);if(!label)return null;
  const text=(label.querySelector("span")?.textContent||"").trim().toLowerCase();
  return text==="camera"?label:null
}
function prepare(input){
  if(!input)return;
  input.setAttribute("accept","image/*");
  input.setAttribute("capture","environment")
}
function openCamera(input){
  if(!input)return;
  prepare(input);
  input.dataset.eviaCameraDirect="1";
  input.click()
}
function intercept(event){
  const label=cameraLabel(event.target);if(!label)return;
  const input=label.querySelector('input[type="file"]');if(!input)return;
  prepare(input);
  if(event.target===input&&input.dataset.eviaCameraDirect==="1"){delete input.dataset.eviaCameraDirect;return}
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();openCamera(input)
}
document.addEventListener("pointerdown",event=>{const label=cameraLabel(event.target);if(label)prepare(label.querySelector('input[type="file"]'))},true);
document.addEventListener("click",intercept,true);
window.EviaPracticalCameraV210=Object.freeze({version:210,prepare});
})();
