(()=>{
"use strict";
const VERSION=123,KEY="evia-targets-v1",STYLE_ID="evia-targets-milos-only-v123-style";
let observer=null,queued=false;
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null");return x&&typeof x==="object"?x:null}catch{return null}}
function ukDate(value){const m=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(value||"Not set")}
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.evia-target-layer .evia-target-date.evia-target-date-v123{display:grid!important;gap:.18rem!important;padding:.72rem .82rem!important;border:1px solid rgba(0,0,0,.06)!important;border-radius:1rem!important;background:rgba(255,255,255,.66)!important}
.evia-target-layer .evia-target-date.evia-target-date-v123 span{font-size:.55rem!important;color:#858289!important}
.evia-target-layer .evia-target-date.evia-target-date-v123 strong{font-size:.72rem!important;font-weight:600!important;color:#343338!important}
.evia-target-layer .evia-target-milos-note-v123{margin:.55rem 0 0!important;padding:.68rem .78rem!important;border-radius:.9rem!important;background:rgba(239,195,61,.12)!important;color:#7b6a2a!important;font-size:.56rem!important;line-height:1.4!important}
`;document.head.appendChild(s)}
function patch(){
  queued=false;ensureStyle();const layer=document.querySelector(".evia-target-layer");if(!layer)return;
  layer.querySelector("[data-target-refresh]")?.remove();
  layer.querySelectorAll(".evia-target-note").forEach(note=>{if(/refresh target|until you refresh|date changed/i.test(note.textContent||""))note.remove()});
  const foot=layer.querySelector(".evia-target-foot");
  if(foot)foot.textContent="Targets are updated when your assessor sends a completed Milos review to Evia.";
  const label=layer.querySelector(".evia-target-date");
  if(label&&!label.classList.contains("evia-target-date-v123")){
    const state=read(),due=state?.calculatedForDate||state?.dueDate||"";
    label.classList.add("evia-target-date-v123");label.innerHTML=`<span>Next review date</span><strong>${ukDate(due)}</strong>`
  }
  const body=layer.querySelector(".evia-tools-body");
  if(body&&!body.querySelector(".evia-target-milos-note-v123")&&layer.querySelector(".evia-target-list")){
    const note=document.createElement("div");note.className="evia-target-milos-note-v123";note.textContent="Your assessor updates this target board through Milos after each progress review.";
    const list=layer.querySelector(".evia-target-list");list?.insertAdjacentElement("beforebegin",note)
  }
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
function start(){ensureStyle();queue();observer=new MutationObserver(queue);observer.observe(document.body,{subtree:true,childList:true});document.addEventListener("evia:milos-review-targets-replaced",()=>{const open=!!document.querySelector(".evia-target-layer");if(open){document.querySelector(".evia-target-layer")?.remove();setTimeout(()=>document.querySelector(".evia-target-mini")?.click(),0)}else queue()});window.addEventListener("pageshow",queue)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaTargetsMilosOnly=Object.freeze({version:VERSION,refresh:queue});
})();
