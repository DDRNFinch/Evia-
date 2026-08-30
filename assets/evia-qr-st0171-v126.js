(()=>{
"use strict";
const VERSION=126;
const original=window.EviaQrExchange;
if(!original)return;
const REF_KEY="evia-mini-milos-learner-ref-v1",BASELINE_KEY="evia-mini-milos-share-baseline-v1",WITNESS_KEY="evia-tinos-witnessed-v1";
const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const ctx=()=>window.EviaCourseContext?.current?.()||null;
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  const nr=window.EviaNaxosCoursePacks?.routeId?.(c);if(nr)return nr;
  if(c.courseId==="st0171-v1-1")return"ST0171";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}
  const family=String(c.packFamilyId||"").trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9.-]{2,30}$/.test(family)?family:"";
}
function uid(){try{return crypto.randomUUID().replace(/-/g,"").slice(0,32)}catch{return`${Date.now().toString(36)}${Math.random().toString(36).slice(2,18)}`}}
function learnerRef(){let value=String(localStorage.getItem(REF_KEY)||"").trim();if(!value){value=uid();localStorage.setItem(REF_KEY,value)}return value.slice(0,48)}
function b64(value){const bytes=new TextEncoder().encode(JSON.stringify(value));let text="";for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
function timeline(){const value=read("evia-course-timeline",{});return value&&typeof value==="object"?value:{}}
function evidenceEntries(){const value=read("evia-selfobs-live-v3",[]);return Array.isArray(value)?value:[]}
function rpl(){const value=read("evia-rpl-ksbs-v1",[]);return Array.isArray(value)?value:[]}
function routeCodes(key,route){const map=read(key,{}),bucket=map&&typeof map[route]==="object"?map[route]:{};return Object.keys(bucket||{})}
function learnerCodes(c){const allowed=new Set(c?.codes||[]),out=new Set();evidenceEntries().forEach(entry=>(Array.isArray(entry?.codes)?entry.codes:[]).forEach(code=>{if(allowed.has(code))out.add(code)}));return[...out]}
function learning(c){
  const mins=entry=>Number.isFinite(Number(entry?.durationMinutes))?Math.max(0,Number(entry.durationMinutes)):Number.isFinite(Number(entry?.hours))?Math.max(0,Number(entry.hours)*60):0;
  if(c?.courseType==="nvq"){const entries=read("evia-glh-entries",[]),minutes=(Array.isArray(entries)?entries:[]).reduce((n,e)=>n+mins(e),0);return{hours:Math.round(minutes/6)/10,target:Number(c.glhTargetHours)||847}}
  const entries=read("evia-otj-entries",[]),college=read("evia-otj-college-v1",{}),minutes=(Array.isArray(entries)?entries:[]).reduce((n,e)=>n+mins(e),0)+Math.max(0,Number(college?.hours)||0)*60+Math.max(0,Math.min(59,Number(college?.minutes)||0));
  return{hours:Math.round(minutes/6)/10,target:Number(c?.otjMinimumHours)||0}
}
function targetList(){const state=read("evia-targets-v1",{}),items=Array.isArray(state?.targets)?state.targets:[];return items.filter(item=>!item.completedAt).slice(0,6).map(item=>({title:String(item.title||"").replace(/\s+/g," ").trim().slice(0,96),code:String(item.code||"").slice(0,32),dueDate:String(item.dueDate||state.dueDate||"").slice(0,10)})).filter(item=>item.title)}
function buildST0171(){
  const c=ctx(),route=routeId(c);if(route!=="ST0171")return original.buildProgress();
  const allowed=new Set(c?.codes||[]),learner=learnerCodes(c),prior=rpl().filter(code=>allowed.has(code)),assessor=routeCodes("evia-mini-milos-observed-v1",route).filter(code=>allowed.has(code)),witness=routeCodes(WITNESS_KEY,route).filter(code=>allowed.has(code));
  const covered=[...new Set([...learner,...prior,...assessor,...witness])],baseline=read(BASELINE_KEY,{}),previousList=Array.isArray(baseline[route])?baseline[route]:[],previous=new Set(previousList),changed=previousList.length?covered.filter(code=>!previous.has(code)):[],t=timeline(),l=learning(c);
  const payload={v:2,t:"progress",r:learnerRef(),c:route,s:String(t.startDate||"").slice(0,10),e:String(t.endDate||"").slice(0,10),l:l.hours,lt:l.target,z:covered,d:changed,zs:{learner,prior,assessor,witness},tg:targetList(),lr:String(read("evia-mini-milos-last-review-date","")||"").slice(0,10),ec:evidenceEntries().length,u:Date.now()};
  baseline[route]=covered;write(BASELINE_KEY,baseline);return`NISI:EVIA:PROGRESS:1:${b64(payload)}`
}
function ensureStyle(){if(document.getElementById("evia-qr-st0171-v126-style"))return;const style=document.createElement("style");style.id="evia-qr-st0171-v126-style";style.textContent=`.evia-qrx-layer{position:fixed;inset:0;z-index:10080;background:rgba(251,250,247,.97);backdrop-filter:blur(22px);overflow:auto;color:#242428;font-family:inherit}.evia-qrx-screen{min-height:100%;max-width:650px;margin:0 auto;padding:max(1rem,env(safe-area-inset-top)) 1rem max(2rem,env(safe-area-inset-bottom));box-sizing:border-box}.evia-qrx-head{display:grid;grid-template-columns:4rem 1fr 4rem;align-items:center;margin:.3rem 0 1.35rem}.evia-qrx-head b{text-align:center;font-size:1rem}.evia-qrx-head button{border:0;background:transparent;color:#777;font:inherit;text-align:left;padding:.7rem 0}.evia-qrx-screen h2{text-align:center;font-size:1.28rem;font-weight:520;margin:3.2rem 0 .65rem}.evia-qrx-qr{background:#fff;border-radius:1.5rem;padding:1rem;margin:1rem auto;max-width:330px;box-shadow:0 12px 36px rgba(50,50,50,.07)}.evia-qrx-status{text-align:center;color:#737277;font-size:.74rem;line-height:1.4;min-height:1.2rem}.evia-qrx-status.error{color:#9c2f2f}`;document.head.appendChild(style)}
function ensureQr(){if(typeof window.qrcode==="function")return Promise.resolve(true);return new Promise(resolve=>{const script=document.createElement("script");script.src="./assets/qrcode.js?v=126";script.async=true;script.onload=()=>resolve(typeof window.qrcode==="function");script.onerror=()=>resolve(false);document.head.appendChild(script)})}
function renderQr(element,text){let qr;try{qr=window.qrcode(0,"M");qr.addData(text,"Byte");qr.make()}catch{qr=window.qrcode(0,"L");qr.addData(text,"Byte");qr.make()}element.innerHTML=qr.createSvgTag({cellSize:5,margin:16,scalable:true,alt:"Evia Property Maintenance progress QR code"});const svg=element.querySelector("svg");if(svg){svg.style.width="100%";svg.style.maxWidth="310px";svg.style.height="auto";svg.style.display="block";svg.style.margin="0 auto"}}
async function openShare(){
  if(routeId()!=="ST0171")return original.openShare();
  ensureStyle();document.querySelector(".evia-qrx-layer")?.remove();
  const layer=document.createElement("div");layer.className="evia-qrx-layer";layer.innerHTML=`<section class="evia-qrx-screen"><div class="evia-qrx-head"><button type="button" data-st0171-qr-back>‹ Back</button><b>Share QR code</b><span></span></div><h2>Creating QR code…</h2><div class="evia-qrx-qr" data-st0171-qr></div><p class="evia-qrx-status" data-st0171-status></p></section>`;document.body.appendChild(layer);
  layer.querySelector("[data-st0171-qr-back]").onclick=()=>layer.remove();
  const status=layer.querySelector("[data-st0171-status]");
  try{const text=buildST0171(),ok=await ensureQr();if(!ok)throw Error("QR generator could not load.");renderQr(layer.querySelector("[data-st0171-qr]"),text);layer.querySelector("h2").textContent="Show this QR code";status.textContent="Milos, Symi and Tinos can receive this anonymous Property Maintenance course and progress information."}
  catch(error){status.textContent=error?.message||"The QR code could not be created.";status.classList.add("error")}
}
window.EviaQrExchange=Object.freeze({...original,version:VERSION,openShare,buildProgress:buildST0171,routeId});
})();