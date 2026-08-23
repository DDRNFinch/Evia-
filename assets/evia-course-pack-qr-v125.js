(()=>{
"use strict";
const VERSION=125,STYLE_ID="evia-course-pack-qr-v125-style";
let stream=null,timer=null,detector=null,canvas=null,observer=null;
function stopCamera(){if(timer){clearTimeout(timer);timer=null}if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}detector=null}
function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.nisi-pack-layer .evia-pack-add-help-v125{margin:.35rem .15rem .65rem;color:#8a888d;font-size:.62rem;line-height:1.4;text-align:center}
.nisi-pack-layer .evia-pack-import-v125{margin-top:.2rem!important}
.evia-pack-qr-v125 .evia-enrol-manual{display:block!important;margin-top:.9rem!important}
.evia-pack-qr-v125 .evia-enrol-manual input{text-transform:uppercase}
`;document.head.appendChild(s)}
function status(text,error=false){const n=document.querySelector(".evia-pack-qr-v125 [data-enrol-status]");if(!n)return;n.textContent=text;n.classList.toggle("is-error",error)}
function closeScanner(){stopCamera();document.querySelector(".evia-pack-qr-v125")?.remove()}
function scanner(){
  closeScanner();style();
  const el=document.createElement("div");el.className="evia-tools-layer evia-enrol-layer evia-pack-qr-v125";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-v125-back>‹ Back</button><b>Add course</b><span></span></div><div class="evia-tools-body"><p class="evia-tools-kicker">Course QR</p><h2>Scan your course</h2><p class="evia-tools-copy">Scan an Evia course QR, choose a saved QR image, or enter the course code underneath it.</p><div class="evia-enrol-camera"><video data-v125-video playsinline muted autoplay></video><span class="frame" aria-hidden="true"></span></div><div class="evia-enrol-status" data-enrol-status>Starting camera…</div><div class="evia-enrol-actions"><button type="button" class="evia-enrol-secondary" data-v125-image>Choose QR image</button><button type="button" class="evia-enrol-secondary" data-v125-camera>Restart camera</button></div><div class="evia-enrol-manual is-open"><label for="eviaCourseCodeV125">Course code</label><input id="eviaCourseCodeV125" data-v125-code inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="e.g. ST0171"><button type="button" class="evia-tools-primary" data-v125-install>Install course</button></div><input type="file" accept="image/*" data-v125-file hidden></div></section>`;
  document.body.appendChild(el);
  el.querySelector("[data-v125-back]").onclick=closeScanner;
  el.querySelector("[data-v125-camera]").onclick=()=>startCamera(el.querySelector("[data-v125-video]"));
  const file=el.querySelector("[data-v125-file]");el.querySelector("[data-v125-image]").onclick=()=>file.click();file.onchange=async()=>{const f=file.files?.[0];file.value="";if(f)await decodeFile(f)};
  const input=el.querySelector("[data-v125-code]");el.querySelector("[data-v125-install]").onclick=()=>install(input.value);input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();install(input.value)}});
  startCamera(el.querySelector("[data-v125-video]"));return el
}
async function install(raw){const value=String(raw||"").trim();if(!value){status("Enter or scan a course code.",true);return}stopCamera();status("Checking course…");try{if(!window.EviaCourseEnrolment?.installFromInput)throw Error("Course enrolment is not ready.");await window.EviaCourseEnrolment.installFromInput(value)}catch(e){status(e?.message||"That course could not be installed.",true)}}
function size(source){return{w:Number(source?.videoWidth||source?.naturalWidth||source?.width||0),h:Number(source?.videoHeight||source?.naturalHeight||source?.height||0)}}
function jsDecode(source){if(typeof window.jsQR!=="function")return null;const {w,h}=size(source);if(!w||!h)return null;const scale=Math.min(1,960/Math.max(w,h)),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));canvas=canvas||document.createElement("canvas");canvas.width=cw;canvas.height=ch;const c=canvas.getContext("2d",{willReadFrequently:true});if(!c)return null;c.drawImage(source,0,0,cw,ch);const p=c.getImageData(0,0,cw,ch);return window.jsQR(p.data,cw,ch,{inversionAttempts:"attemptBoth"})?.data||null}
async function decode(source){if(typeof window.BarcodeDetector==="function"){try{detector=detector||new BarcodeDetector({formats:["qr_code"]});const found=await detector.detect(source);if(found?.[0]?.rawValue)return found[0].rawValue}catch{}}return jsDecode(source)}
async function startCamera(video){stopCamera();if(!video||!navigator.mediaDevices?.getUserMedia){status("Camera is unavailable. Choose a saved QR image or enter the course code.",true);return}try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:1280}},audio:false});if(!document.body.contains(video)){stopCamera();return}video.srcObject=stream;await video.play();status("Ready — hold the course QR inside the square.");scan(video)}catch{status("Camera could not start. Choose a saved QR image or enter the course code.",true)}}
async function scan(video){if(!stream||!document.body.contains(video))return;try{if(video.readyState>=2){const raw=await decode(video);if(raw){await install(raw);return}}}catch{}timer=setTimeout(()=>scan(video),220)}
async function image(file){if(typeof createImageBitmap==="function"){const im=await createImageBitmap(file);return{source:im,close:()=>im.close?.()}}const url=URL.createObjectURL(file),im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=url});return{source:im,close:()=>URL.revokeObjectURL(url)}}
async function decodeFile(file){let loaded;try{stopCamera();status("Reading QR image…");loaded=await image(file);const raw=await decode(loaded.source);if(!raw)throw Error("No course QR was found in that image.");await install(raw)}catch(e){status(e?.message||"That QR image could not be read.",true)}finally{loaded?.close?.()}}
function patchManager(){style();const layer=document.querySelector(".nisi-pack-layer"),add=layer?.querySelector("[data-pack-add]"),input=layer?.querySelector("[data-pack-file]");if(!layer||!add||!input)return;
  if(!add.dataset.qrFirstV125){add.dataset.qrFirstV125="1";add.textContent="Scan course QR";add.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();scanner()},true)}
  if(!layer.querySelector("[data-pack-import-v125]")){const help=document.createElement("p");help.className="evia-pack-add-help-v125";help.textContent="Use the camera or choose a saved QR image. Course files are only for .nisi or .json packs.";const importButton=document.createElement("button");importButton.type="button";importButton.className="evia-tools-secondary evia-pack-import-v125";importButton.dataset.packImportV125="1";importButton.textContent="Import course file";importButton.onclick=()=>input.click();add.insertAdjacentElement("afterend",help);help.insertAdjacentElement("afterend",importButton)}
}
function isImage(file){return /^image\//i.test(String(file?.type||""))||/\.(png|jpe?g|webp|gif|bmp)$/i.test(String(file?.name||""))}
document.addEventListener("change",e=>{const input=e.target instanceof Element?e.target.closest("[data-pack-file]"):null;if(!input)return;const file=input.files?.[0];if(!file||!isImage(file))return;e.preventDefault();e.stopImmediatePropagation();input.value="";scanner();setTimeout(()=>decodeFile(file),30)},true);
function start(){patchManager();observer=new MutationObserver(patchManager);observer.observe(document.body,{subtree:true,childList:true});window.addEventListener("pagehide",stopCamera)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaCoursePackQr=Object.freeze({version:VERSION,open:scanner,refresh:patchManager});
})();