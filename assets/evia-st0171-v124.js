(()=>{
'use strict';
const VERSION=134,QR_FILE='./course-delivery/qr/ST0171.svg',PACK_KEY='nisi-installed-course-packs-v1';
const nativeFetch=window.fetch.bind(window);

const STAGES={
  drainage_fault:[
    {title:'Drainage problem',instruction:'Capture one clear photo or video showing the drainage problem itself.'},
    {title:'Access point',instruction:'Capture one clear photo or video showing the access point used for the drainage work.'},
    {title:'Completed repair',instruction:'Capture one clear photo or video showing the drainage repair or clearance once complete.'}
  ],
  door_window:[
    {title:'Before repair',instruction:'Capture one clear photo or video showing the affected door, window, frame, glazing unit or fitting before the repair.'},
    {title:'After repair',instruction:'Capture one clear photo or video showing the same area after the repair or adjustment is complete.'}
  ],
  plaster_repair:[
    {title:'Plaster defect',instruction:'Capture one clear photo or video showing the plaster defect before work begins.'},
    {title:'Preparation',instruction:'Capture one clear photo or video showing the plaster repair area after preparation.'},
    {title:'Finished repair',instruction:'Capture one clear photo or video showing the finished plaster repair.'}
  ],
  paint_repair:[
    {title:'Surface preparation',instruction:'Capture one clear photo or video showing the surface preparation before decoration.'},
    {title:'Coating',instruction:'Capture one clear photo or video showing the coating work being carried out.'},
    {title:'Sealing',instruction:'Capture one clear photo or video showing the sealing work.'}
  ],
  tile_repair:[
    {title:'Tiling repair',instruction:'Capture one clear photo or video showing the tiling repair itself.'},
    {title:'Setting out',instruction:'Capture one clear photo or video showing how the repair area or replacement tiles have been set out.'},
    {title:'Preparation',instruction:'Capture one clear photo or video showing the area prepared and ready for the tiling repair.'},
    {title:'Cutting',instruction:'Capture one clear photo or video showing the tile being measured or cut, or the cut tile ready to fit.'}
  ],
  floor_repair:[
    {title:'Flooring defect',instruction:'Capture one clear photo or video showing the flooring defect before work begins.'},
    {title:'Preparation',instruction:'Capture one clear photo or video showing the floor or sub-surface prepared for the repair.'},
    {title:'Setting out',instruction:'Capture one clear photo or video showing how the replacement flooring has been set out.'},
    {title:'Finished repair',instruction:'Capture one clear photo or video showing the finished flooring repair.'}
  ],
  masonry_repair:[
    {title:'Masonry or damp defect',instruction:'Capture one clear photo or video showing the masonry or damp defect.'},
    {title:'Repair in progress',instruction:'Capture one clear photo or video showing the masonry or damp-proofing repair being carried out.'}
  ],
  roof_repair:[
    {title:'Roof defect',instruction:'From a safe position, capture one clear photo or video showing the roof defect. Do not record while exposed to a fall risk.'},
    {title:'Roof repair',instruction:'From a safe position, capture one clear photo or video showing the roof repair. Do not record while exposed to a fall risk.'}
  ],
  fence_repair:[
    {title:'Fencing or railing defect',instruction:'Capture one clear photo or video showing the fencing or railing defect.'},
    {title:'Repair in progress',instruction:'Capture one clear photo or video showing the fencing or railing repair while it is being carried out.'},
    {title:'Completed repair',instruction:'Capture one clear photo or video showing the completed fencing or railing repair.'}
  ],
  ground_repair:[
    {title:'Groundwork or landscaping defect',instruction:'Capture one clear photo or video showing the groundwork or landscaping defect.'},
    {title:'Repair',instruction:'Capture one clear photo or video showing the groundwork or landscaping repair.'}
  ]
};
function patchMap(){const data=window.EviaST0171Map;if(!Array.isArray(data))return false;for(const cat of data)for(const job of cat.jobs||[])for(const opp of job.opps||[]){delete opp.stages;const stages=STAGES[opp.id];if(stages)opp.stages=stages.map((s,i)=>({...s,id:`${opp.id}-stage-${i+1}`}))}return true}
function patchInstalled(){try{const all=JSON.parse(localStorage.getItem(PACK_KEY)||'{}'),pack=all?.['st0171-v1-1'];if(!pack||!Array.isArray(window.EviaST0171Map))return;pack.siteData=window.EviaST0171Map;pack.updatedAt=Date.now();pack.evidenceStagesVersion=VERSION;all['st0171-v1-1']=pack;localStorage.setItem(PACK_KEY,JSON.stringify(all))}catch(error){console.debug('Evia ST0171 staged pack refresh',error)}}
patchMap();patchInstalled();
window.fetch=async function(input,init){const url=typeof input==='string'?input:input?.url||'';if(String(url).toUpperCase().startsWith('INLINE:ST0171')){patchMap();const pack=window.EviaST0171Pack?.build?.();if(!pack)return new Response(JSON.stringify({error:'ST0171 pack unavailable'}),{status:503,headers:{'Content-Type':'application/json'}});return new Response(JSON.stringify(pack),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}return nativeFetch(input,init)};
function copyCode(status){const code='ST0171',done=()=>{if(status)status.textContent='ST0171 copied.'};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(done).catch(()=>{if(status)status.textContent='Course code: ST0171'});else{const t=document.createElement('textarea');t.value=code;t.readOnly=true;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch{if(status)status.textContent='Course code: ST0171'}t.remove()}}
function patchQr(){const grid=document.querySelector('.evia-course-qr-grid');if(!grid||grid.querySelector('[data-st0171-course-qr]'))return;const card=document.createElement('article');card.className='evia-course-qr-card';card.dataset.st0171CourseQr='1';card.innerHTML=`<a class="evia-course-qr-image" href="${QR_FILE}" download="ST0171.svg" aria-label="Download Property Maintenance QR code"><img src="${QR_FILE}" alt="Property Maintenance course QR code" loading="lazy" decoding="async" draggable="false"></a><div class="evia-course-qr-copy"><b>Property Maintenance</b><code>ST0171</code></div><div class="evia-course-qr-actions"><a href="${QR_FILE}" download="ST0171.svg">Download</a><button type="button" data-st0171-copy>Copy code</button></div>`;grid.appendChild(card);card.querySelector('[data-st0171-copy]')?.addEventListener('click',()=>copyCode(document.querySelector('[data-course-qr-status]')))}
function start(){patchMap();patchInstalled();try{window.EviaCoursePacks?.normalize?.(window.EviaST0171Pack?.build?.())}catch(error){console.error('Evia ST0171 pack validation failed',error)}patchQr();new MutationObserver(patchQr).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.EviaST0171=Object.freeze({version:VERSION,qrPayload:'EVIA1:ST0171',courseCode:'ST0171',build:()=>{patchMap();return window.EviaST0171Pack?.build?.()}})
})();