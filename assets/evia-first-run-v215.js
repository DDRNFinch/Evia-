(()=>{
"use strict";
const VERSION=215;
const DONE_KEY="evia-first-run-complete-v1";
const STATE_KEY="evia-first-run-state-v1";
const DEMO_KEY="evia-demo-mode-v1";
const DEMO_BACKUP_KEY="evia-demo-backup-v1";
const DEMO_ID="evia-demo-st0095-v1";
const TIMELINE_KEY="evia-course-timeline";
const NAME_KEY="evia-full-name";
const PORTFOLIO_KEY="evia-online-portfolio-url";
const RECEIPT_KEY="evia-course-enrolment-v1";
const PRACTICAL_KEY="evia-arp-practical-v1";
const PRACTICAL_DRAFT_KEY="evia-arp-practical-draft-v1";
const STYLE_ID="evia-first-run-v215-style";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const cleanUrl=value=>{let s=String(value||"").trim();if(!s)return"";if(!/^https?:\/\//i.test(s))s=`https://${s}`;try{const u=new URL(s);return /^https?:$/.test(u.protocol)?u.href:""}catch{return""}};
const DEMO_PACK={
  nisiCoursePack:1,schemaVersion:1,id:DEMO_ID,familyId:"ST0095",version:"1.0-demo",title:"Evia Demo — Bricklayer",shortTitle:"Evia Demo",standard:"ST0095 Demo",standardId:"ST0095",courseType:"apprenticeship",coverageLabel:"KSB",learningLabel:"OTJ",fourthLabel:"EPA",otjMinimumHours:1,gatewayBufferMonths:3,epaConfigured:true,compatStorageSuffix:"demo-v1",
  codes:["K13","S8","S9"],
  codeDescriptions:{K13:"Hand tools: selection, use, maintenance and storage.",S8:"Select and use hand tools and equipment.",S9:"Maintain and store hand tools correctly."},
  siteData:[{id:"demo-tools",title:"Demo · Tools & equipment",jobs:[{id:"demo-hand-tools",title:"Use & look after hand tools",opps:[
    {id:"demo-use-tool",title:"Use a hand tool",instruction:"Take one clear photo showing a hand tool being used for the job.",question:"What tool are you using, what is it for, and how are you using it safely?",codes:["K13","S8"],bundle:"Demo evidence"},
    {id:"demo-care-tool",title:"Look after the tool",instruction:"Take one clear photo showing the tool being cleaned, checked or stored.",question:"What do you check or do to keep this tool in good condition?",codes:["K13","S9"],bundle:"Demo evidence"},
    {id:"demo-explain-tool",title:"Explain your tool choice",media:"talk",question:"Explain why the hand tool is suitable for the task and how you would look after it after use.",codes:["K13","S8","S9"],bundle:"Demo evidence"}
  ]}]}]
};
const WALKTHROUGH=[
  {kicker:"1 of 4 · Welcome",title:"Evia keeps the apprenticeship in one place",copy:"The four arches show time on programme, course coverage, learning hours and assessment readiness. They update as the learner uses Evia."},
  {kicker:"2 of 4 · Evidence",title:"Press Evia to collect evidence",copy:"Choose the job being done, follow a short evidence prompt, then save it. Evia maps the evidence back to the correct course criteria."},
  {kicker:"3 of 4 · Coverage",title:"Coverage shows where evidence came from",copy:"Yellow is learner evidence, purple is Recorded Prior Learning, blue is an assessor observation and orange is witness testimony. The same source markers follow linked evidence options."},
  {kicker:"4 of 4 · Readiness",title:"Download, learn and practise for assessment",copy:"Learners can download their evidence, record learning and use course-specific mock assessment practice. Data stays on the learner's device unless they choose to share it."}
];
function styles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
  .evia-first-run-v215{position:fixed;inset:0;z-index:90000;overflow:auto;background:linear-gradient(180deg,#fff 0%,#fffdf6 72%,#fff7cf 100%);color:#2d2c2f;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif}
  .evia-first-run-shell-v215{width:min(31rem,100%);min-height:100%;margin:0 auto;padding:max(1.25rem,env(safe-area-inset-top)) 1.15rem max(2rem,env(safe-area-inset-bottom));box-sizing:border-box;display:flex;flex-direction:column}
  .evia-first-run-brand-v215{display:flex;align-items:center;gap:.5rem;font-size:.92rem;font-weight:720;letter-spacing:-.025em}.evia-first-run-brand-v215 i{width:.36rem;height:.36rem;border-radius:50%;background:#efc33d;display:block}
  .evia-first-run-body-v215{width:100%;max-width:27rem;margin:auto;display:grid;gap:1rem;padding:2rem 0}
  .evia-first-run-face-v215{width:6.7rem;height:6.7rem;margin:0 auto .25rem;border:2px solid #efc33d;border-radius:50%;position:relative;box-shadow:0 0 0 1rem rgba(239,195,61,.08)}.evia-first-run-face-v215:before,.evia-first-run-face-v215:after{content:"";position:absolute;top:2.45rem;width:1rem;height:1rem;border:2px solid #efc33d;border-radius:50%}.evia-first-run-face-v215:before{left:1.55rem}.evia-first-run-face-v215:after{right:1.55rem}
  .evia-first-run-kicker-v215{margin:0;text-align:center;color:#aa8617;font-size:.61rem;font-weight:760;text-transform:uppercase;letter-spacing:.09em}.evia-first-run-v215 h1{margin:0;text-align:center;font-size:clamp(1.45rem,6vw,2rem);line-height:1.08;letter-spacing:-.045em}.evia-first-run-copy-v215{margin:0 auto;text-align:center;max-width:24rem;color:#77747a;font-size:.82rem;line-height:1.52}
  .evia-first-run-actions-v215{display:grid;gap:.65rem;margin-top:.45rem}.evia-first-run-actions-v215 button,.evia-first-run-primary-v215,.evia-first-run-secondary-v215{width:100%;min-height:3.2rem;border-radius:999px;padding:.8rem 1rem;font:650 .76rem/1.15 inherit;cursor:pointer}.evia-first-run-primary-v215{border:0;background:#efc33d;color:#4c3b0b}.evia-first-run-secondary-v215{border:1px solid rgba(0,0,0,.09);background:rgba(255,255,255,.78);color:#4b494e}.evia-first-run-link-v215{border:0!important;background:transparent!important;color:#827026!important;min-height:2.4rem!important}
  .evia-first-run-note-v215{padding:.85rem .95rem;border-radius:1rem;background:rgba(239,195,61,.1);color:#6d5d20;font-size:.66rem;line-height:1.45;text-align:center}.evia-first-run-walk-v215{display:grid;gap:.75rem}.evia-first-run-dots-v215{display:flex;justify-content:center;gap:.35rem}.evia-first-run-dots-v215 i{display:block;width:.42rem;height:.42rem;border-radius:50%;background:#dedbd1}.evia-first-run-dots-v215 i.on{background:#efc33d}.evia-first-run-nav-v215{display:grid;grid-template-columns:1fr 1.7fr;gap:.6rem}
  .evia-first-run-form-v215{display:grid;gap:.72rem}.evia-first-run-course-v215{padding:.88rem 1rem;border-radius:1rem;background:rgba(239,195,61,.1);display:grid;gap:.12rem}.evia-first-run-course-v215 b{font-size:.78rem}.evia-first-run-course-v215 span{font-size:.58rem;color:#8e7a30}.evia-first-run-field-v215 label{display:block;margin:0 0 .28rem .12rem;color:#777;font-size:.58rem}.evia-first-run-field-v215 input{width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.11);background:rgba(255,255,255,.86);border-radius:1rem;padding:.88rem .95rem;font:inherit;font-size:.74rem;outline:none}.evia-first-run-field-v215 input:focus{border-color:rgba(214,166,21,.55);box-shadow:0 0 0 3px rgba(239,195,61,.11)}.evia-first-run-two-v215{display:grid;grid-template-columns:1fr 1fr;gap:.58rem}.evia-first-run-hint-v215{display:block;margin:.28rem .12rem 0;color:#999;font-size:.51rem;line-height:1.35}.evia-first-run-status-v215{min-height:1rem;text-align:center;color:#8a6c0d;font-size:.58rem}
  html.evia-first-run-qr [data-enrol-manual-toggle],html.evia-first-run-qr [data-enrol-manual]{display:none!important}html.evia-first-run-qr .evia-enrol-actions{grid-template-columns:1fr!important}
  @media(max-width:390px){.evia-first-run-two-v215{grid-template-columns:1fr}.evia-first-run-body-v215{padding:1.4rem 0}.evia-first-run-face-v215{width:5.8rem;height:5.8rem}.evia-first-run-face-v215:before,.evia-first-run-face-v215:after{top:2.05rem}.evia-first-run-face-v215:before{left:1.3rem}.evia-first-run-face-v215:after{right:1.3rem}}
  `;document.head.appendChild(s)
}
function removeLayer(){document.querySelector(".evia-first-run-v215")?.remove()}
function layer(html){styles();removeLayer();const el=document.createElement("div");el.className="evia-first-run-v215";el.innerHTML=`<div class="evia-first-run-shell-v215"><div class="evia-first-run-brand-v215">Evia <i></i></div><main class="evia-first-run-body-v215">${html}</main></div>`;document.body.appendChild(el);return el}
function state(){return read(STATE_KEY,{phase:"welcome"})}
function setState(phase,extra={}){write(STATE_KEY,{phase,updatedAt:Date.now(),...extra})}
function current(){return window.EviaCourseContext?.current?.()||null}
function established(){
  if(localStorage.getItem(DONE_KEY)==="1")return true;
  if(localStorage.getItem(RECEIPT_KEY))return true;
  const t=read(TIMELINE_KEY,{}),id=String(t?.courseId||"");
  return !!id&&id!=="__no_course__"&&id!==DEMO_ID
}
function welcome(){
  const el=layer(`<div class="evia-first-run-face-v215" aria-hidden="true"></div><p class="evia-first-run-kicker-v215">Apprentice assistant</p><h1>Welcome to Evia</h1><p class="evia-first-run-copy-v215">See how Evia works, try a limited demo, or activate the learner version with your course QR.</p><div class="evia-first-run-actions-v215"><button class="evia-first-run-primary-v215" data-first-setup>Set up my Evia</button><button class="evia-first-run-secondary-v215" data-first-demo>Try Evia Demo</button><button class="evia-first-run-link-v215" data-first-walk>Show me around</button></div><div class="evia-first-run-note-v215">The full learner version starts with an Evia Course QR. The demo does not need learner details or a course QR.</div>`);
  el.querySelector("[data-first-setup]").onclick=beginSetup;el.querySelector("[data-first-demo]").onclick=activateDemo;el.querySelector("[data-first-walk]").onclick=()=>walkthrough(0)
}
function walkthrough(index){
  const item=WALKTHROUGH[Math.max(0,Math.min(WALKTHROUGH.length-1,index))],last=index===WALKTHROUGH.length-1;
  const dots=WALKTHROUGH.map((_,i)=>`<i class="${i===index?"on":""}"></i>`).join("");
  const actions=last?`<div class="evia-first-run-actions-v215"><button class="evia-first-run-primary-v215" data-walk-setup>Set up my Evia</button><button class="evia-first-run-secondary-v215" data-walk-demo>Try Evia Demo</button><button class="evia-first-run-link-v215" data-walk-home>Back to welcome</button></div>`:`<div class="evia-first-run-nav-v215"><button class="evia-first-run-secondary-v215" data-walk-back>${index?"Back":"Welcome"}</button><button class="evia-first-run-primary-v215" data-walk-next>Next</button></div>`;
  const el=layer(`<div class="evia-first-run-walk-v215"><p class="evia-first-run-kicker-v215">${esc(item.kicker)}</p><h1>${esc(item.title)}</h1><p class="evia-first-run-copy-v215">${esc(item.copy)}</p><div class="evia-first-run-dots-v215">${dots}</div>${actions}</div>`);
  el.querySelector("[data-walk-next]")?.addEventListener("click",()=>walkthrough(index+1));el.querySelector("[data-walk-back]")?.addEventListener("click",()=>index?walkthrough(index-1):welcome());el.querySelector("[data-walk-setup]")?.addEventListener("click",beginSetup);el.querySelector("[data-walk-demo]")?.addEventListener("click",activateDemo);el.querySelector("[data-walk-home]")?.addEventListener("click",welcome)
}
function beginSetup(){
  setState("profile");document.documentElement.classList.add("evia-first-run-qr");
  const api=window.EviaCourseEnrolment;if(!api?.openScanner){const n=document.querySelector(".evia-first-run-note-v215");if(n)n.textContent="The Course QR scanner is still loading. Try again in a moment.";return}
  if(!api.noCourse?.()){profileSetup();return}
  api.openScanner()
}
function backupDemoState(){
  const raw={};[TIMELINE_KEY,NAME_KEY,PORTFOLIO_KEY,PRACTICAL_KEY,PRACTICAL_DRAFT_KEY].forEach(k=>raw[k]=localStorage.getItem(k));write(DEMO_BACKUP_KEY,raw)
}
function demoDates(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth()-2,1),end=new Date(now.getFullYear(),now.getMonth()+10,1),iso=d=>d.toISOString().slice(0,10);return{startDate:iso(start),endDate:iso(end)}}
function activateDemo(){
  const packs=window.EviaCoursePacks;if(!packs?.install||!packs?.activate){const n=document.querySelector(".evia-first-run-note-v215");if(n)n.textContent="The demo is still loading. Try again in a moment.";return}
  try{
    backupDemoState();const pack=packs.install(DEMO_PACK);packs.activate(pack.id);const t=read(TIMELINE_KEY,{}),dates=demoDates();write(TIMELINE_KEY,{...t,courseId:pack.id,courseTitle:pack.title,pathway:"",pathwayTitle:"",...dates,weeklyHours:37,contractedWeeklyHours:37,workingDays:5,updatedAt:Date.now()});localStorage.setItem(NAME_KEY,"Demo learner");localStorage.setItem(DEMO_KEY,"1");setState("demo");location.reload()
  }catch(error){const n=document.querySelector(".evia-first-run-note-v215");if(n)n.textContent=error?.message||"The demo could not be started."}
}
function restoreValue(key,value){if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value)}
function clearDemoStorage(){
  ["evia-selfobs-live-v3::demo-v1","evia-selfobs-day-v3::demo-v1","evia-selfobs-recap-v3::demo-v1","evia-rpl-ksbs-v1::demo-v1","evia-epa-practice-v1::demo-v1","evia-epa-checks::demo-v1","evia-otj-entries::demo-v1","evia-otj-college-v1::demo-v1","evia-targets-v1::demo-v1"].forEach(k=>localStorage.removeItem(k))
}
function activateFullFromDemo(){
  const backup=read(DEMO_BACKUP_KEY,{});try{window.EviaCoursePacks?.remove?.(DEMO_ID)}catch{}
  clearDemoStorage();localStorage.removeItem(DEMO_KEY);localStorage.removeItem(DONE_KEY);[TIMELINE_KEY,NAME_KEY,PORTFOLIO_KEY,PRACTICAL_KEY,PRACTICAL_DRAFT_KEY].forEach(k=>restoreValue(k,backup[k]??null));localStorage.removeItem(DEMO_BACKUP_KEY);setState("welcome");location.reload()
}
function profileSetup(){
  const c=current();if(!c||c.noCourse){welcome();return}
  const t=read(TIMELINE_KEY,{}),name=String(localStorage.getItem(NAME_KEY)||"").trim(),portfolio=String(localStorage.getItem(PORTFOLIO_KEY)||"").trim(),weekly=Number(t.weeklyHours??t.contractedWeeklyHours??0)||"",days=Number(t.workingDays||0)||"";
  const label=String(c.pathwayTitle||c.courseTitle||"Your course"),code=String(c.packFamilyId||c.standardId||c.courseId||"").toUpperCase();
  const el=layer(`<p class="evia-first-run-kicker-v215">Learner setup</p><h1>Complete your profile</h1><p class="evia-first-run-copy-v215">Your course has been activated from the Evia QR. Add the learner details used for progress and learning calculations.</p><div class="evia-first-run-course-v215"><b>${esc(label)}</b><span>${esc(code)} · activated by Course QR</span></div><form class="evia-first-run-form-v215" data-first-profile><div class="evia-first-run-field-v215"><label for="firstLearnerName">Learner name</label><input id="firstLearnerName" type="text" autocomplete="name" value="${esc(name)}" placeholder="Your name" required></div><div class="evia-first-run-two-v215"><div class="evia-first-run-field-v215"><label for="firstStart">Start date</label><input id="firstStart" type="date" value="${esc(t.startDate||"")}" required></div><div class="evia-first-run-field-v215"><label for="firstEnd">Planned end date</label><input id="firstEnd" type="date" value="${esc(t.endDate||"")}" required></div></div><div class="evia-first-run-two-v215"><div class="evia-first-run-field-v215"><label for="firstHours">Contracted hours per week</label><input id="firstHours" type="number" min="0.5" max="80" step="0.5" inputmode="decimal" value="${esc(weekly)}" placeholder="e.g. 37" required></div><div class="evia-first-run-field-v215"><label for="firstDays">Working days per week</label><input id="firstDays" type="number" min="1" max="7" step="1" inputmode="numeric" value="${esc(days)}" placeholder="e.g. 5"></div></div><div class="evia-first-run-field-v215"><label for="firstPortfolio">Online portfolio link · optional</label><input id="firstPortfolio" type="url" inputmode="url" autocomplete="url" value="${esc(portfolio)}" placeholder="https://..."><small class="evia-first-run-hint-v215">Leave this blank if your college or training provider has not given you a portfolio link.</small></div><button class="evia-first-run-primary-v215" type="submit">Finish setup</button><div class="evia-first-run-status-v215" data-first-status aria-live="polite"></div></form>`);
  el.querySelector("[data-first-profile]").onsubmit=e=>{
    e.preventDefault();const status=el.querySelector("[data-first-status]"),nextName=String(el.querySelector("#firstLearnerName")?.value||"").trim(),start=String(el.querySelector("#firstStart")?.value||""),end=String(el.querySelector("#firstEnd")?.value||""),weeklyHours=Number(el.querySelector("#firstHours")?.value||0),workingDays=Number(el.querySelector("#firstDays")?.value||0),rawUrl=String(el.querySelector("#firstPortfolio")?.value||"").trim(),url=cleanUrl(rawUrl);
    if(!nextName){status.textContent="Add the learner name.";return}if(!start||!end){status.textContent="Add the start and planned end date.";return}if(Date.parse(end)<=Date.parse(start)){status.textContent="The planned end date must be after the start date.";return}if(!(weeklyHours>0&&weeklyHours<=80)){status.textContent="Add the contracted weekly hours.";return}if(workingDays&&(!Number.isInteger(workingDays)||workingDays<1||workingDays>7)){status.textContent="Working days must be between 1 and 7.";return}if(rawUrl&&!url){status.textContent="Enter a valid portfolio website address or leave it blank.";return}
    localStorage.setItem(NAME_KEY,nextName);if(url)localStorage.setItem(PORTFOLIO_KEY,url);else localStorage.removeItem(PORTFOLIO_KEY);write(TIMELINE_KEY,{...t,startDate:start,endDate:end,weeklyHours,contractedWeeklyHours:weeklyHours,workingDays:workingDays||0,updatedAt:Date.now()});localStorage.setItem(DONE_KEY,"1");setState("complete");document.documentElement.classList.remove("evia-first-run-qr");window.dispatchEvent(new CustomEvent("evia:profile-changed",{detail:{name:nextName,portfolioUrl:url,weeklyHours,workingDays}}));window.dispatchEvent(new CustomEvent("evia:portfolio-link-changed",{detail:{url}}));status.textContent="Setup complete. Opening Evia…";setTimeout(()=>location.reload(),350)
  }
}
function start(){
  styles();
  if(localStorage.getItem(DEMO_KEY)==="1"||current()?.courseId===DEMO_ID){document.documentElement.classList.add("evia-demo-mode-v215");return}
  if(localStorage.getItem(DONE_KEY)==="1")return;
  const s=state();if(s.phase==="profile"&&current()&&!current().noCourse){profileSetup();return}
  if(established()){localStorage.setItem(DONE_KEY,"1");setState("migrated");return}
  welcome()
}
window.EviaFirstRunV215=Object.freeze({version:VERSION,demoId:DEMO_ID,show:welcome,walkthrough:()=>walkthrough(0),beginSetup,activateDemo,activateFullFromDemo,profileSetup});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();