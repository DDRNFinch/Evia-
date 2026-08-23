(()=>{
"use strict";

const VERSION=118;
const MC_KEY="evia-arp-mocks-v1";
const DISCUSSION_KEY="evia-arp-discussion-v1";
const PRACTICAL_KEY="evia-arp-practical-v1";
const MOCK_ONLY_KEY="evia-arp-mock-only-v118";
let queued=false,observer=null,bankPromise=null;

const BRICK_OVERRIDES={
"ST0095-Q001":[
"The delivery schedule, material quantities and storage plan",
"Current drawings, RAMS and any task-specific instructions",
"The previous gang's progress notes and labour allocation",
"The programme, weather forecast and merchant delivery times"
],
"ST0095-Q002":[
"Use a lower-speed cutter and rotate the operator more often",
"Use specified suppression or extraction plus face-fit-tested RPE",
"Use RPE only and cut dry where the dust can disperse",
"Dampen the area afterwards and keep others clear while cutting"
],
"ST0095-Q003":[
"Release the trigger and leave the supply connected while changing it",
"Isolate the supply and follow the manufacturer's disc-change procedure",
"Remove the guard first so the spindle and fixing are easier to reach",
"Lock the trigger off and ask another operative to hold the machine"
],
"ST0095-Q004":[
"Dilute the washout and discharge it through a surface-water drain",
"Contain washout and dispose of it using the approved site method",
"Let the washout settle, then pour the clearer water near the kerb",
"Wash tools over compacted ground away from the immediate workface"
],
"ST0095-Q005":[
"Improve compressive strength at the base of the wall",
"Resist moisture passing through the masonry construction",
"Control shrinkage cracking between long lengths of brickwork",
"Tie the inner and outer leaves together at low level"
],
"ST0095-Q006":[
"Provide ventilation to the cavity above the opening",
"Drain moisture collected by the cavity tray to the outside",
"Relieve structural pressure from the lintel and outer leaf",
"Allow mortar droppings to escape from the base of the cavity"
],
"ST0095-Q007":[
"Install them at regular spacing chosen on site and bend around insulation",
"Use the specified spacing and orientation with the drip correctly positioned",
"Keep ties level and allow mortar to build around the drip for support",
"Place ties mainly beside openings where cracking risk is greatest"
],
"ST0095-Q008":[
"Keep perp joints aligned so the courses are quicker to set out",
"Break vertical joints and maintain the specified bond and lap",
"Reduce the number of closers needed at corners and openings",
"Allow bed joints to vary while keeping the overall wall height correct"
],
"ST0095-Q009":[
"Check wall plumb and transfer datum levels across the building",
"Set and check course heights and repeated vertical features",
"Measure cavity width and wall-tie embedment as the work rises",
"Check mortar consistency and bed-joint compaction between courses"
],
"ST0095-Q010":[
"Compare the width at top and bottom and check both jambs plumb",
"Compare the two diagonal measurements across the opening",
"Check the sill and head are level and both reveals are equal depth",
"Count equal brick courses in each jamb from the same datum"
],
"ST0095-Q011":[
"Use the mortar class normally used for the same brick type",
"Check the current specification or approved mix information",
"Match the colour and consistency of the previous batch",
"Adjust cement content until the mix gives the required workability"
],
"ST0095-Q012":[
"Increase cement content and continue while covering the wall later",
"Follow the cold-weather method and protect or postpone as required",
"Use warm mixing water and continue if units have no visible frost",
"Build shorter lifts and retool the joints before temperatures fall"
],
"ST0095-Q013":[
"Separate different mortar mixes and prevent staining at junctions",
"Accommodate planned movement and limit uncontrolled cracking",
"Provide a continuous fixing zone for wall ties and insulation retainers",
"Increase local stiffness where long wall lengths meet openings"
],
"ST0095-Q014":[
"Help hold insulation tighter against the outer leaf",
"Prevent moisture bridging and obstruction of trays, ties or drainage",
"Reduce the cavity width and therefore improve thermal resistance",
"Support the bottom of insulation boards between wall ties"
],
"ST0095-Q015":[
"Lay them flat as stretchers with the long face visible",
"Set them upright on end with the narrow face showing",
"Lay them flat across the wall thickness as full headers",
"Set them on edge with the bed face visible along the course"
],
"ST0095-Q016":[
"Transfer the angle from the previous cut and adjust each unit by eye",
"Set the rake from the drawing and use a consistent template or line",
"Keep bed joints level and vary only the perp joints to form the rake",
"Increase bed-joint thickness gradually until the top meets the rake"
],
"ST0095-Q017":[
"Match the replacement appearance first and decide repair depth later",
"Establish the cause, approved repair method and compatible replacement",
"Remove surrounding mortar first so the extent of damage becomes clearer",
"Use a stronger mortar and denser brick so the defect cannot recur"
],
"ST0095-Q018":[
"Add a standard percentage used on every project regardless of detail",
"Add the specified allowance for cuts, damage and waste",
"Add enough material to cover one additional complete elevation",
"Order only the exact net quantity because damaged units can be returned"
],
"ST0095-Q019":[
"Use the figured dimension but adjust locally to suit the scaled size",
"Stop and seek clarification through the project procedure",
"Use the average if the difference is within normal site tolerance",
"Choose the dimension that best matches built work and note it afterwards"
],
"ST0095-Q020":[
"Finish at a consistent stage when mortar is firm enough for the specified profile",
"Finish immediately after laying while the mortar is still fully plastic",
"Wait until the mortar has hardened, then cut the profile back with a tool",
"Finish each area at the end of the shift so timing remains consistent"
],
"ST0095-Q021":[
"Allow the delivery to arrive, then ask the other trade to move temporarily",
"Coordinate the timing and access with the relevant people before delivery",
"Move the obstructing materials to create access and tell the trade afterwards",
"Ask the supplier to wait off site until your own workface is completely clear"
],
"ST0095-Q022":[
"Use informal banter equally with everyone so nobody is singled out",
"Listen respectfully and challenge inappropriate behaviour through the correct route",
"Keep concerns within your own gang unless they directly affect production",
"Avoid involving new starters in difficult conversations until they settle in"
],
"ST0095-Q023":[
"Reduce their workload yourself and keep the reason within the gang",
"Listen, encourage suitable support and follow the site's safety arrangements",
"Treat it as private unless they specifically ask you to report the problem",
"Give practical advice based on what helped someone else in the past"
],
"ST0095-Q024":[
"Use it only for light work until a replacement becomes available",
"Remove it from use and repair or replace it through the correct procedure",
"Make a temporary repair if the defect does not affect the working edge",
"Mark the defect and leave it available for experienced operatives"
]
};

function read(key,fallback={}){
  try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}
}
function write(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}
function clamp(value){return Math.max(0,Math.min(100,Math.round(Number(value)||0)))}
function currentId(){
  const c=window.EviaCourseContext?.current?.();
  if(!c||c.noCourse)return"";
  const family=String(c.packFamilyId||c.standardId||"").toUpperCase(),courseId=String(c.courseId||"").toLowerCase(),pathway=String(c.pathway||"").toLowerCase();
  if(family==="ST0095"||courseId==="st0095-v1-2")return"ST0095";
  if(family==="ST0264"||courseId==="st0264-v1-4")return pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(family==="6570-05"||courseId==="6570-05")return`6570-05-${({thin:"THIN",repair:"REPAIR",specialist:"SPECIALIST",drainage:"DRAINAGE"}[pathway]||"THIN")}`;
  return""
}
function secureShuffle(items){
  const out=[...items];
  for(let i=out.length-1;i>0;i--){
    let r;
    if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]/4294967296}else r=Math.random();
    const j=Math.floor(r*(i+1));
    [out[i],out[j]]=[out[j],out[i]]
  }
  return out
}
async function bank(){
  if(bankPromise)return bankPromise;
  bankPromise=Promise.resolve(window.EviaArp?.currentBank?.()).finally(()=>setTimeout(()=>{bankPromise=null},0));
  return bankPromise
}
function seedKnownDiscussionMock(){
  const id=currentId();if(!id)return;
  const d=read(DISCUSSION_KEY,{}),item=d?.[id],m=read(MOCK_ONLY_KEY,{});
  if(item?.lastMode==="mock"&&Number(item.lastPercent)>=0){
    const current=m[id]||{discussion:{attempts:0,bestPercent:0}};
    if(!current.discussion?.attempts){
      current.discussion={attempts:1,bestPercent:clamp(item.lastPercent),lastPercent:clamp(item.lastPercent),updatedAt:Number(item.updatedAt)||Date.now()};
      m[id]=current;write(MOCK_ONLY_KEY,m)
    }
  }
}
function captureDiscussionMock(value){
  try{
    const all=JSON.parse(value||"{}"),m=read(MOCK_ONLY_KEY,{});
    let changed=false;
    Object.entries(all||{}).forEach(([id,item])=>{
      if(item?.lastMode!=="mock")return;
      const stamp=Number(item.updatedAt)||0,current=m[id]||{},before=current.discussion||{};
      if(Number(before.updatedAt||0)===stamp)return;
      const pct=clamp(item.lastPercent);
      current.discussion={attempts:Number(before.attempts||0)+1,bestPercent:Math.max(clamp(before.bestPercent),pct),lastPercent:pct,updatedAt:stamp||Date.now()};
      m[id]=current;changed=true
    });
    if(changed)write(MOCK_ONLY_KEY,m)
  }catch{}
}
function installStorageHook(){
  if(window.__eviaArpMockOnlyStorageV118)return;
  window.__eviaArpMockOnlyStorageV118=true;
  const previous=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const out=previous.call(this,key,value);
    if(this===localStorage&&String(key)===DISCUSSION_KEY){
      captureDiscussionMock(value);
      setTimeout(queue,0)
    }
    if(this===localStorage&&[MC_KEY,PRACTICAL_KEY].includes(String(key)))setTimeout(queue,0);
    return out
  }
}
function mcScore(id){
  const item=read(MC_KEY,{})?.[id];
  return item&&Number(item.attempts)>0?{attempts:Number(item.attempts)||0,bestPercent:clamp(item.bestPercent)}:{attempts:0,bestPercent:0}
}
function discussionScore(id){
  const item=read(MOCK_ONLY_KEY,{})?.[id]?.discussion;
  return item&&Number(item.attempts)>0?{attempts:Number(item.attempts)||0,bestPercent:clamp(item.bestPercent)}:{attempts:0,bestPercent:0}
}
function practicalScore(id){
  const item=read(PRACTICAL_KEY,{})?.[id],attempts=Array.isArray(item?.attempts)?item.attempts.filter(x=>x?.mode==="mock"):[];
  return attempts.length?{attempts:attempts.length,bestPercent:Math.max(...attempts.map(x=>clamp(x?.percent??x?.score)))}:{attempts:0,bestPercent:0}
}
function progress(){
  const id=currentId();if(!id)return{id:"",attempts:0,percent:0,multipleChoice:0,discussion:0,practical:0};
  const mc=mcScore(id),discussion=discussionScore(id),practical=practicalScore(id);
  return{
    id,
    attempts:mc.attempts+discussion.attempts+practical.attempts,
    percent:Math.round((mc.bestPercent+discussion.bestPercent+practical.bestPercent)/3),
    multipleChoice:mc.bestPercent,
    discussion:discussion.bestPercent,
    practical:practical.bestPercent,
    counts:{multipleChoice:mc.attempts,discussion:discussion.attempts,practical:practical.attempts}
  }
}
function patchArch(){
  const target=document.querySelector('.progress-arch[data-arch="ARP"],.progress-arch[data-arch="EPA"],.progress-arch[data-arch="Q&A"],.progress-arch[data-arch="Units"]');
  if(!target)return;
  const state=progress(),value=clamp(state.percent);
  target.dataset.arch="ARP";target.dataset.arpAttempts=String(state.attempts);target.dataset.arpProgress=String(value);
  const label=target.querySelector(".arch-label"),number=target.querySelector(".arch-number"),path=target.querySelector(".arch-value");
  if(label)label.textContent="ARP";
  if(number)number.textContent=`${value}%`;
  if(path){path.style.strokeDasharray=`${value} 100`;path.setAttribute("stroke-dasharray",`${value} 100`)}
  target.setAttribute("aria-label",`ARP — Mock readiness ${value}%. Only completed mock assessments count. Open assessment practice`)
}
async function patchMcq(){
  const options=document.querySelector(".evia-arp-layer .evia-arp-options");
  const buttons=options?[...options.querySelectorAll(":scope > [data-arp-answer]")]:[];
  const prompt=document.querySelector(".evia-arp-layer .evia-arp-question")?.textContent?.trim();
  if(!options||buttons.length!==4||!prompt||options.dataset.integrity==="118")return;
  options.dataset.integrity="118";
  try{
    const b=await bank(),question=b?.questions?.find(q=>String(q.prompt).trim()===prompt);
    if(question&&String(b.enrolmentId)==="ST0095"&&BRICK_OVERRIDES[question.id]){
      const override=BRICK_OVERRIDES[question.id];
      buttons.forEach(button=>{
        const originalIndex=Number(button.dataset.arpAnswer);
        if(Number.isInteger(originalIndex)&&override[originalIndex])button.textContent=override[originalIndex]
      })
    }
  }catch{}
  secureShuffle(buttons).forEach(button=>options.appendChild(button));
  [...options.children].forEach((button,index)=>button.setAttribute("aria-label",`Option ${String.fromCharCode(65+index)}. ${button.textContent.trim()}`))
}
async function patchModeLabels(){
  const root=document.querySelector(".evia-arp-layer");if(!root)return;
  const mc=root.querySelector('[data-arp-option="multiple-choice"]');
  if(mc){
    const title=mc.querySelector("b"),small=mc.querySelector("small");
    if(title)title.textContent="MCQ Mock Test";
    if(small&&!/mock/i.test(small.textContent||""))small.textContent="10-question mock test"
  }
  const guided=root.querySelector('[data-practical-mode="guided"] b');
  if(guided)guided.textContent="Practice";
  const id=currentId();if(!id)return;
  const discussionHome=root.querySelector('[data-discussion-mode="mock"]')?.closest(".evia-tools-body");
  if(discussionHome){
    const score=discussionScore(id),summary=discussionHome.querySelector(".evia-arp-summary span");
    if(summary){
      const base=(await bank().catch(()=>null))?.questions?.length||24;
      summary.textContent=score.attempts?`${base} mapped scenarios · ${score.attempts} mock${score.attempts===1?"":"s"} completed · mock best ${score.bestPercent}%`:`${base} mapped scenarios · mock not attempted yet`
    }
  }
  const practicalHome=root.querySelector('[data-practical-mode="mock"]')?.closest(".evia-tools-body");
  if(practicalHome){
    const score=practicalScore(id),summary=practicalHome.querySelector(".evia-arp-summary span");
    if(summary)summary.textContent=score.attempts?`12 course-specific tasks · ${score.attempts} mock${score.attempts===1?"":"s"} completed · mock best ${score.bestPercent}%`:"12 course-specific tasks · mock not attempted yet"
  }
}
async function patch(){
  queued=false;
  patchArch();
  await patchMcq();
  await patchModeLabels()
}
function queue(){
  if(queued)return;queued=true;requestAnimationFrame(()=>patch().catch(()=>{queued=false}))
}
function start(){
  installStorageHook();
  seedKnownDiscussionMock();
  queue();
  const root=document.getElementById("root")||document.body;
  if(!observer){observer=new MutationObserver(queue);observer.observe(root,{subtree:true,childList:true,characterData:true})}
  document.addEventListener("click",()=>{setTimeout(queue,0);setTimeout(queue,80)},true);
  window.addEventListener("pageshow",queue);
  window.addEventListener("focus",queue);
  window.addEventListener("storage",e=>{if([MC_KEY,DISCUSSION_KEY,PRACTICAL_KEY,MOCK_ONLY_KEY].includes(e.key))queue()})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArpIntegrity=Object.freeze({version:VERSION,progress,refresh:queue});
})();