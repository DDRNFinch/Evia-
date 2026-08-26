(()=>{
"use strict";
const VERSION=223,base=window.EviaCoursePacks;
if(!base)return;
function clone(v){try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v))}}
function dataFor(pack,p){return Array.isArray(p?.siteData)?p.siteData:Array.isArray(pack?.siteData)?pack.siteData:[]}
function sourceFor(pack,p){const xs=Array.isArray(p?.codes)?p.codes:Array.isArray(pack?.codes)?pack.codes:[];return [...new Set(xs.map(String).filter(Boolean))]}
function mapped(data){const s=new Set();for(const cat of data||[])for(const job of cat?.jobs||[])for(const opp of job?.opps||[])for(const code of opp?.codes||[])s.add(String(code));return s}
function adaptedPart(pack,p){const source=sourceFor(pack,p),used=mapped(dataFor(pack,p)),active=source.filter(c=>used.has(c)),unused=source.filter(c=>!used.has(c));return{source,active,unused}}
function adapt(raw){
  const wrapped=raw?.coursePack&&typeof raw.coursePack==="object";
  const original=wrapped?raw.coursePack:raw;
  if(!original||typeof original!=="object"||Array.isArray(original))return raw;
  const pack=clone(original);
  const allow=pack.allowUnmappedCodes===true;
  if(Array.isArray(pack.pathways)&&pack.pathways.length){
    pack.pathways=pack.pathways.map(p=>{
      const enabled=p?.allowUnmappedCodes===true||allow;if(!enabled)return p;
      const x=adaptedPart(pack,p),out={...p,sourceCodes:x.source,codes:x.active,allowUnmappedCodes:true};
      out.coverageAudit={...(p.coverageAudit||{}),used:x.active.length,total:x.source.length,usedCodes:x.active,unused:x.unused};return out
    })
  }else if(allow){
    const x=adaptedPart(pack,null);pack.sourceCodes=x.source;pack.codes=x.active;pack.coverageAudit={...(pack.coverageAudit||{}),used:x.active.length,total:x.source.length,usedCodes:x.active,unused:x.unused}
  }
  pack.naxosCoursePackCompatibility=VERSION;
  return wrapped?{...raw,coursePack:pack}:pack
}
function install(raw){return base.install(adapt(raw))}
function normalize(raw){return base.normalize(adapt(raw))}
window.EviaCoursePacks={...base,install,normalize,naxosCompatibilityVersion:VERSION};
if(!document.querySelector('script[data-evia-naxos-criteria-v223]')){const s=document.createElement('script');s.src='./assets/evia-naxos-evidence-criteria-v223.js?v=223';s.defer=true;s.dataset.eviaNaxosCriteriaV223='1';document.head.appendChild(s)}
})();
