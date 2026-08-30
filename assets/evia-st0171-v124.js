(()=>{
'use strict';
const VERSION=135,QR_FILE='./course-delivery/qr/ST0171.svg',PACK_KEY='nisi-installed-course-packs-v1',EVIDENCE_KEY='evia-selfobs-live-v3';
const nativeFetch=window.fetch.bind(window);

const SPLITS={
  drainage_fault:[
    {id:'drainage_fault',title:'Drainage problem',instruction:'Get one clear photo or video showing the drainage problem itself.'},
    {id:'drainage_access',title:'Access point',instruction:'Get one clear photo or video showing the access point used for the drainage work.'},
    {id:'drainage_complete',title:'Completed repair',instruction:'Get one clear photo or video showing the completed drainage repair or clearance.'}
  ],
  door_window:[
    {id:'door_window',title:'Before repair',instruction:'Get one clear photo or video showing the affected door, window, frame, glazing unit or fitting before the repair.'},
    {id:'door_window_after',title:'After repair',instruction:'Get one clear photo or video showing the same area after the repair or adjustment is complete.'}
  ],
  plaster_repair:[
    {id:'plaster_repair',title:'Plaster defect',instruction:'Get one clear photo or video showing the plaster defect before work begins.'},
    {id:'plaster_preparation',title:'Preparation',instruction:'Get one clear photo or video showing the plaster repair area after preparation.'},
    {id:'plaster_finished',title:'Finished repair',instruction:'Get one clear photo or video showing the finished plaster repair.'}
  ],
  paint_repair:[
    {id:'paint_repair',title:'Surface preparation',instruction:'Get one clear photo or video showing the surface preparation before decoration.'},
    {id:'paint_coating',title:'Coating',instruction:'Get one clear photo or video showing the coating work being carried out.'},
    {id:'paint_sealing',title:'Sealing',instruction:'Get one clear photo or video showing the sealing work.'}
  ],
  tile_repair:[
    {id:'tile_repair',title:'Tiling repair',instruction:'Get one clear photo or video showing the tiling repair itself.'},
    {id:'tile_setting_out',title:'Setting out',instruction:'Get one clear photo or video showing how the repair area or replacement tiles have been set out.'},
    {id:'tile_preparation',title:'Preparation',instruction:'Get one clear photo or video showing the area prepared and ready for the tiling repair.'},
    {id:'tile_cutting',title:'Cutting tiles',instruction:'Get one clear photo or video showing a tile being measured or cut, or the cut tile ready to fit.'}
  ],
  floor_repair:[
    {id:'floor_repair',title:'Flooring defect',instruction:'Get one clear photo or video showing the flooring defect before work begins.'},
    {id:'floor_preparation',title:'Preparation',instruction:'Get one clear photo or video showing the floor or sub-surface prepared for the repair.'},
    {id:'floor_setting_out',title:'Setting out',instruction:'Get one clear photo or video showing how the replacement flooring has been set out.'},
    {id:'floor_finished',title:'Finished repair',instruction:'Get one clear photo or video showing the finished flooring repair.'}
  ],
  masonry_repair:[
    {id:'masonry_repair',title:'Masonry or damp defect',instruction:'Get one clear photo or video showing the masonry or damp defect.'},
    {id:'masonry_repair_work',title:'Repair in progress',instruction:'Get one clear photo or video showing the masonry or damp-proofing repair being carried out.'}
  ],
  roof_repair:[
    {id:'roof_repair',title:'Roof defect',instruction:'From a safe position, get one clear photo or video showing the roof defect. Do not record while exposed to a fall risk.'},
    {id:'roof_repair_work',title:'Roof repair',instruction:'From a safe position, get one clear photo or video showing the roof repair. Do not record while exposed to a fall risk.'}
  ],
  fence_repair:[
    {id:'fence_repair',title:'Fencing or railing defect',instruction:'Get one clear photo or video showing the fencing or railing defect.'},
    {id:'fence_repair_progress',title:'Repair in progress',instruction:'Get one clear photo or video showing the fencing or railing repair while it is being carried out.'},
    {id:'fence_repair_complete',title:'Completed repair',instruction:'Get one clear photo or video showing the completed fencing or railing repair.'}
  ],
  ground_repair:[
    {id:'ground_repair',title:'Groundwork or landscaping defect',instruction:'Get one clear photo or video showing the groundwork or landscaping defect.'},
    {id:'ground_repair_work',title:'Repair',instruction:'Get one clear photo or video showing the groundwork or landscaping repair.'}
  ]
};

const CHILD_IDS=new Set(Object.values(SPLITS).flat().map(x=>x.id));
const ROOT_IDS=new Set(Object.keys(SPLITS));

function makeStage(part){
  return [{id:`${part.id}-stage-1`,title:part.title,instruction:part.instruction}]
}
function splitOpportunity(opp){
  const parts=SPLITS[opp.id];
  if(!parts)return [opp];
  return parts.map(part=>({
    ...opp,
    id:part.id,
    title:part.title,
    instruction:part.instruction,
    stages:makeStage(part)
  }))
}
function patchMap(){
  const data=window.EviaST0171Map;if(!Array.isArray(data))return false;
  for(const cat of data)for(const job of cat.jobs||[]){
    const base=[];
    for(const opp of job.opps||[]){
      if(CHILD_IDS.has(opp.id)&&!ROOT_IDS.has(opp.id))continue;
      if(ROOT_IDS.has(opp.id))base.push(...splitOpportunity({...opp,stages:undefined}));
      else{delete opp.stages;base.push(opp)}
    }
    job.opps=base
  }
  return true
}

function migrateEvidence(){
  const indexMap={
    drainage_fault:['drainage_fault','drainage_access','drainage_complete'],
    door_window:['door_window','door_window_after'],
    plaster_repair:['plaster_repair','plaster_preparation','plaster_finished'],
    paint_repair:['paint_repair','paint_coating','paint_sealing'],
    tile_repair:['tile_repair','tile_setting_out','tile_preparation','tile_cutting'],
    floor_repair:['floor_repair','floor_preparation','floor_setting_out','floor_finished'],
    masonry_repair:['masonry_repair','masonry_repair_work'],
    roof_repair:['roof_repair','roof_repair_work'],
    fence_repair:['fence_repair','fence_repair_progress','fence_repair_complete'],
    ground_repair:['ground_repair','ground_repair_work']
  };
  try{
    const entries=JSON.parse(localStorage.getItem(EVIDENCE_KEY)||'[]');if(!Array.isArray(entries))return;
    let changed=false;
    for(const entry of entries){
      const ids=indexMap[entry?.opportunityId];
      if(!ids||!Number.isInteger(entry?.stageIndex))continue;
      const target=ids[entry.stageIndex];if(!target)continue;
      const part=Object.values(SPLITS).flat().find(x=>x.id===target);if(!part)continue;
      entry.opportunityId=target;
      entry.title=part.title;
      entry.stageIndex=0;
      entry.stageTitle=part.title;
      entry.stageInstruction=part.instruction;
      changed=true
    }
    if(changed)localStorage.setItem(EVIDENCE_KEY,JSON.stringify(entries))
  }catch(error){console.debug('Evia ST0171 evidence tile migration',error)}
}

function patchInstalled(){
  try{
    const all=JSON.parse(localStorage.getItem(PACK_KEY)||'{}'),pack=all?.['st0171-v1-1'];
    if(!pack||pack.naxosMappingPack===1||!Array.isArray(window.EviaST0171Map))return;
    pack.siteData=window.EviaST0171Map;pack.updatedAt=Date.now();pack.evidenceTilesVersion=VERSION;
    all['st0171-v1-1']=pack;localStorage.setItem(PACK_KEY,JSON.stringify(all))
  }catch(error){console.debug('Evia ST0171 tile refresh',error)}
}

patchMap();migrateEvidence();patchInstalled();
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  if(String(url).toUpperCase().startsWith('INLINE:ST0171')){
    patchMap();const pack=window.EviaST0171Pack?.build?.();
    if(!pack)return new Response(JSON.stringify({error:'ST0171 pack unavailable'}),{status:503,headers:{'Content-Type':'application/json'}});
    return new Response(JSON.stringify(pack),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})
  }
  return nativeFetch(input,init)
};
function copyCode(status){
  const code='ST0171',done=()=>{if(status)status.textContent='ST0171 copied.'};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(done).catch(()=>{if(status)status.textContent='Course code: ST0171'});
  else{const t=document.createElement('textarea');t.value=code;t.readOnly=true;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch{if(status)status.textContent='Course code: ST0171'}t.remove()}
}
function patchQr(){
  const grid=document.querySelector('.evia-course-qr-grid');if(!grid||grid.querySelector('[data-st0171-course-qr]'))return;
  const card=document.createElement('article');card.className='evia-course-qr-card';card.dataset.st0171CourseQr='1';
  card.innerHTML=`<a class="evia-course-qr-image" href="${QR_FILE}" download="ST0171.svg" aria-label="Download Property Maintenance QR code"><img src="${QR_FILE}" alt="Property Maintenance course QR code" loading="lazy" decoding="async" draggable="false"></a><div class="evia-course-qr-copy"><b>Property Maintenance</b><code>ST0171</code></div><div class="evia-course-qr-actions"><a href="${QR_FILE}" download="ST0171.svg">Download</a><button type="button" data-st0171-copy>Copy code</button></div>`;
  grid.appendChild(card);card.querySelector('[data-st0171-copy]')?.addEventListener('click',()=>copyCode(document.querySelector('[data-course-qr-status]')))
}
function start(){
  patchMap();migrateEvidence();patchInstalled();
  try{window.EviaCoursePacks?.normalize?.(window.EviaST0171Pack?.build?.())}catch(error){console.error('Evia ST0171 pack validation failed',error)}
  patchQr();new MutationObserver(patchQr).observe(document.body,{childList:true,subtree:true})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.EviaST0171=Object.freeze({version:VERSION,qrPayload:'EVIA1:ST0171',courseCode:'ST0171',build:()=>{patchMap();return window.EviaST0171Pack?.build?.()}})
})();