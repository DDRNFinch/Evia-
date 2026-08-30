(()=>{
"use strict";
const VERSION=241,GLH_KEY="evia-glh-entries",RPL_KEY="evia-rpl-ksbs-v1",OBS_KEY="evia-mini-milos-observed-v1",WITNESS_KEY="evia-tinos-witnessed-v1",EVIDENCE_KEY="evia-selfobs-live-v3";
let patchQueued=false;
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"?c:null}
function meta(){return window.EviaTrowelMeta||null}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function entries(){const x=read(EVIDENCE_KEY,[]);return Array.isArray(x)?x:[]}
function glhEntries(){const x=read(GLH_KEY,[]);return Array.isArray(x)?x:[]}
function allowed(){return new Set((ctx()?.codes||[]).map(String))}
function rplSet(){const a=allowed(),x=read(RPL_KEY,[]);return new Set((Array.isArray(x)?x:[]).map(String).filter(code=>a.has(code)))}
function routeId(c=ctx()){
  if(!c||c.courseId!=="6570-05")return"";
  const p=String(c.pathway||"thin").toUpperCase();
  return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"
}
function routeSet(key){const c=ctx(),a=allowed(),route=routeId(c),map=read(key,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};return new Set(Object.keys(bucket||{}).map(String).filter(code=>a.has(code)))}
const observedSet=()=>routeSet(OBS_KEY),witnessSet=()=>routeSet(WITNESS_KEY);
function countMap(){const c=ctx(),out={};if(!c)return out;c.codes.map(String).forEach(x=>out[x]=0);entries().forEach(e=>(Array.isArray(e?.codes)?e.codes:[]).map(String).forEach(code=>{if(code in out)out[code]++}));return out}
function coveredSet(){const c=ctx(),x=countMap(),out=rplSet();if(!c)return out;observedSet().forEach(code=>out.add(code));witnessSet().forEach(code=>out.add(code));c.codes.map(String).forEach(code=>{if((x[code]||0)>0)out.add(code)});return out}
function acPercent(){const c=ctx();if(!c?.codes?.length)return 0;const covered=coveredSet(),codes=c.codes.map(String);return Math.round(codes.filter(code=>covered.has(code)).length/codes.length*100)}
function mins(x){return Math.max(0,Math.round(Number(x?.durationMinutes)||0))}
function glhMinutes(){return glhEntries().reduce((n,x)=>n+mins(x),0)}
function glhPercent(){const c=ctx();if(!c)return 0;return Math.round(Math.min(1,glhMinutes()/(Math.max(1,Number(c.glhTargetHours)||847)*60))*100)}
function unitStats(){
  const c=ctx(),m=meta(),covered=coveredSet(),rpl=rplSet(),observed=observedSet(),witness=witnessSet();if(!c||!m)return[];
  const allowedCodes=new Set(c.codes.map(String));
  return(c.units||[]).map(unit=>{
    const codes=(m.unitCodes?.[String(unit)]||[]).map(String).filter(code=>allowedCodes.has(code));
    const touched=codes.filter(code=>covered.has(code)).length,rplCount=codes.filter(code=>rpl.has(code)).length,observedCount=codes.filter(code=>observed.has(code)).length,witnessCount=codes.filter(code=>witness.has(code)).length;
    return{unit,title:m.unitTitles?.[String(unit)]||`Unit ${unit}`,codes,touched,rplCount,observedCount,witnessCount,pct:codes.length?Math.round(touched/codes.length*100):0}
  })
}
function unitsPercent(){const xs=unitStats();return xs.length?Math.round(xs.reduce((n,x)=>n+x.pct,0)/xs.length):0}
function setArch(button,label,pct,newKey){
  if(!button)return;if(newKey&&button.dataset.arch!==newKey)button.dataset.arch=newKey;
  const lab=button.querySelector(".arch-label"),num=button.querySelector(".arch-number"),path=button.querySelector(".arch-value");
  if(lab&&lab.textContent!==label)lab.textContent=label;if(num&&num.textContent!==`${pct}%`)num.textContent=`${pct}%`;
  if(path){const dash=`${pct} 100`;if(path.style.strokeDasharray!==dash)path.style.strokeDasharray=dash;if(path.getAttribute("stroke-dasharray")!==dash)path.setAttribute("stroke-dasharray",dash)}
}
function patchText(){document.querySelectorAll(".self-copy").forEach(el=>{const t=el.textContent||"",next=t.replace(/\bKSBs\b/g,"ACs").replace(/\bKSB\b/g,"AC");if(next!==t)el.textContent=next});document.querySelectorAll(".self-entry small").forEach(el=>{if(el.dataset.nvqCompact==="1")return;const parts=(el.textContent||"").split(" · "),date=parts[parts.length-1]||"";el.textContent=`AC evidence · ${date}`;el.dataset.nvqCompact="1"})}
function patchShell(){patchQueued=false;const c=ctx();if(!c)return;setArch(document.querySelector('[data-arch="KSB"],[data-arch="AC"]'),"AC",acPercent(),"AC");setArch(document.querySelector('[data-arch="OTJ"],[data-arch="GLH"]'),"GLH",glhPercent(),"GLH");setArch(document.querySelector('[data-arch="EPA"],[data-arch="Units"]'),"Units",unitsPercent(),"Units");patchText()}
function queuePatch(){if(patchQueued)return;patchQueued=true;requestAnimationFrame(patchShell)}
function hookCoverageStorage(){if(window.__eviaNvqCoverageStorageV241)return;window.__eviaNvqCoverageStorageV241=true;const native=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){const out=native.call(this,key,value);if(this===localStorage&&[RPL_KEY,OBS_KEY,WITNESS_KEY,EVIDENCE_KEY].includes(String(key))){queuePatch();window.dispatchEvent(new CustomEvent("evia:nvq-coverage-changed",{detail:{key:String(key)}}))}return out}}
function close(){document.querySelector(".evia-nvq-layer")?.remove()}
function layer(body,title,back=null){close();document.querySelector(".evia-tools-layer:not(.evia-nvq-layer)")?.remove();const el=document.createElement("div");el.className="evia-tools-layer evia-nvq-layer evia-nvq";el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-nvq-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;document.body.appendChild(el);el.querySelector("[data-nvq-back]").onclick=back||close;return el}
function pace(){const c=ctx();if(!c)return null;const t=read("evia-course-timeline",{}),s=Date.parse(`${t.startDate||""}T00:00:00`),e=Date.parse(`${t.endDate||""}T00:00:00`);if(!Number.isFinite(s)||!Number.isFinite(e)||e<=s)return null;const fraction=Math.max(0,Math.min(1,(Date.now()-s)/(e-s))),expected=Math.round((Number(c.glhTargetHours)||847)*60*fraction);return{fraction,expected}}
function fmt(total){const n=Math.max(0,Math.round(total||0)),h=Math.floor(n/60),m=n%60;return m?`${h}h ${m}m`:`${h}h`}
function dateText(v){if(!v)return"";const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?v:d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
function today(){const d=new Date(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return`${d.getFullYear()}-${m}-${day}`}
const GLH_TYPES=["College session","Assessor visit","Guided teaching","Supervisor session","Workplace training"];
function openGLH(){
  const c=ctx();if(!c)return;const xs=glhEntries(),known=glhMinutes(),p=pace(),target=Math.max(1,Number(c.glhTargetHours)||847);
  const el=layer(`<p class="evia-tools-kicker">Guided learning</p><div class="evia-nvq-overall"><strong>${fmt(known)}</strong><span>of ${target}h qualification GLH</span></div>${p?`<div class="evia-nvq-pace"><b>Expected by now</b><strong>${fmt(p.expected)}</strong><span>${Math.round(p.fraction*100)}% through planned course time</span></div>`:""}<button class="evia-tools-primary" data-glh-add>Add guided learning</button><div class="evia-nvq-log">${xs.length?xs.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(e=>`<div class="evia-nvq-entry"><span><b>${esc(e.subject||e.type||"Guided learning")}</b><small>${esc(e.type||"")} · ${esc(dateText(e.date))} · ${fmt(mins(e))}</small>${e.learning?`<em>${esc(e.learning)}</em>`:""}</span><button data-glh-delete="${esc(e.id)}" aria-label="Delete">×</button></div>`).join(""):'<div class="evia-nvq-empty">No guided learning recorded yet.</div>'}</div><p class="evia-nvq-note">GLH is learning under the direct supervision of a provider, tutor, assessor or other person providing guided teaching/training. This is separate from apprenticeship OTJ.</p>`,"GLH",close);
  el.querySelector("[data-glh-add]").onclick=openGLHForm;el.querySelectorAll("[data-glh-delete]").forEach(b=>b.onclick=()=>{write(GLH_KEY,glhEntries().filter(e=>e.id!==b.dataset.glhDelete));patchShell();openGLH()})
}
function openGLHForm(){
  const el=layer(`<p class="evia-tools-kicker">Guided learning</p><h2>Add learning</h2><p class="evia-tools-copy">Record the guided learning that actually happened. A short note about what was learned is enough.</p><div class="evia-nvq-form"><label>Activity<select data-glh-type>${GLH_TYPES.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label><label>Subject<input data-glh-subject type="text" placeholder="e.g. Setting out curves"></label><label>Date<input data-glh-date type="date" value="${today()}"></label><div class="evia-nvq-time"><label>Hours<input data-glh-hours type="number" min="0" max="24" inputmode="numeric" value="1"></label><label>Minutes<input data-glh-mins type="number" min="0" max="59" inputmode="numeric" value="0"></label></div><label>What did you do and learn?<textarea data-glh-learning placeholder="Keep it short."></textarea></label></div><div class="evia-toc-error" data-glh-error></div><button class="evia-tools-primary" data-glh-save>Save guided learning</button>`,"Add GLH",openGLH);
  el.querySelector("[data-glh-save]").onclick=()=>{const type=el.querySelector("[data-glh-type]").value,subject=el.querySelector("[data-glh-subject]").value.trim(),date=el.querySelector("[data-glh-date]").value,h=Math.max(0,Number(el.querySelector("[data-glh-hours]").value)||0),m=Math.max(0,Math.min(59,Number(el.querySelector("[data-glh-mins]").value)||0)),learning=el.querySelector("[data-glh-learning]").value.trim(),err=el.querySelector("[data-glh-error]");const durationMinutes=Math.round(h*60+m);if(!date||durationMinutes<=0){err.textContent="Add a date and the guided learning time.";return}const xs=glhEntries();xs.unshift({id:`glh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,type,subject:subject||type,date,durationMinutes,learning,createdAt:Date.now()});write(GLH_KEY,xs);patchShell();openGLH()}
}
function sourceMarks(x){return `${x.rplCount?' <i class="evia-nvq-rpl-mark" title="Recognised prior learning">o</i>':""}${x.observedCount?' <i class="evia-milos-arch-marker" title="Assessor observed">o</i>':""}${x.witnessCount?' <i class="evia-nvq-witness-mark" title="Tinos witness testimony">✓</i>':""}`}
function openUnits(){
  const xs=unitStats(),m=meta(),c=ctx();if(!c||!m)return;
  layer(`<p class="evia-tools-kicker">Unit portfolio coverage</p><div class="evia-nvq-overall"><strong>${unitsPercent()}%</strong><span>average AC coverage across ${xs.length} required units</span></div><p class="evia-tools-copy">Evia evidence, RPL, Milos observations and Tinos witness testimony all count towards unit AC coverage.</p>${xs.map(x=>`<div class="evia-tools-row evia-nvq-unit${x.rplCount?" has-rpl":""}"><span><b>Unit ${x.unit}${sourceMarks(x)}</b><small>${esc(x.title)} · ${x.touched}/${x.codes.length} ACs covered${x.rplCount?` · ${x.rplCount} RPL`:""}${x.observedCount?` · ${x.observedCount} Milos`:""}${x.witnessCount?` · ${x.witnessCount} Tinos`:""}</small></span><em>${x.pct}%</em></div>`).join("")}<p class="evia-nvq-note">Coverage shows all accepted evidence sources. It does not mark a unit as fully signed off.</p>`,"Units",close)
}
document.addEventListener("click",e=>{if(!ctx())return;const g=e.target.closest?.('[data-arch="GLH"],[data-arch="OTJ"]'),u=e.target.closest?.('[data-arch="Units"],[data-arch="EPA"]');if(g){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openGLH();return}if(u){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openUnits()}},true);
function relevantMutation(records){return records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('[data-arch],.self-copy,.self-entry')||node.querySelector?.('[data-arch],.self-copy,.self-entry'))))}
function ready(){if(!ctx())return;patchShell();const root=document.getElementById("root");if(root&&!root.__eviaNvqV241Observer){root.__eviaNvqV241Observer=true;new MutationObserver(records=>{if(relevantMutation(records))queuePatch()}).observe(root,{childList:true,subtree:true})}}
function refreshSource(){patchShell();if(document.querySelector(".evia-nvq-layer .evia-tools-head b")?.textContent==="Units")requestAnimationFrame(openUnits)}
window.addEventListener("load",ready);window.addEventListener("pageshow",ready);
["evia:rpl-changed","evia:milos-observed-changed","evia:witness-changed"].forEach(name=>window.addEventListener(name,refreshSource));
window.addEventListener("storage",e=>{if([RPL_KEY,OBS_KEY,WITNESS_KEY,EVIDENCE_KEY].includes(e.key))ready()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")ready()});
hookCoverageStorage();
const style=document.createElement("style");style.textContent='.evia-nvq-witness-mark{display:inline-grid!important;place-items:center!important;width:.92rem!important;height:.92rem!important;border-radius:50%!important;background:#d88b45!important;color:#fff!important;font:850 .62rem/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable","Segoe UI",sans-serif!important;font-style:normal!important;vertical-align:middle!important;margin-left:.28rem!important}';document.head.appendChild(style);
setTimeout(ready,80);
window.EviaNVQV94=Object.freeze({version:VERSION,acPercent,unitsPercent,coveredSet:()=>[...coveredSet()],rplSet:()=>[...rplSet()],observedSet:()=>[...observedSet()],witnessSet:()=>[...witnessSet()],refresh:patchShell});
})();
