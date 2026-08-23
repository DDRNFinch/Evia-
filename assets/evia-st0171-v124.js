(()=>{
'use strict';
const VERSION=124,QR_FILE='./course-delivery/qr/ST0171.svg';
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  if(String(url).toUpperCase().startsWith('INLINE:ST0171')){
    const pack=window.EviaST0171Pack?.build?.();
    if(!pack)return new Response(JSON.stringify({error:'ST0171 pack unavailable'}),{status:503,headers:{'Content-Type':'application/json'}});
    return new Response(JSON.stringify(pack),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})
  }
  return nativeFetch(input,init)
};
function copyCode(status){
  const code='ST0171';
  const done=()=>{if(status)status.textContent='ST0171 copied.'};
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
  try{window.EviaCoursePacks?.normalize?.(window.EviaST0171Pack?.build?.())}catch(error){console.error('Evia ST0171 pack validation failed',error)}
  patchQr();new MutationObserver(patchQr).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.EviaST0171=Object.freeze({version:VERSION,qrPayload:'EVIA1:ST0171',courseCode:'ST0171',build:()=>window.EviaST0171Pack?.build?.()});
})();