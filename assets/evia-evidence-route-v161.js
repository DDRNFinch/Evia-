(()=>{
"use strict";
const VERSION=161,STORE="evia-selfobs-live-v3";
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
function siteData(){const a=window.EviaCoursePacks?.active?.(),data=a?.pathway?.siteData||a?.pack?.siteData;if(Array.isArray(data)&&data.length)return data;if(Array.isArray(window.EviaST0171Map)&&window.EviaST0171Map.length)return window.EviaST0171Map;return[]}
function oppFor(id){for(const c of siteData())for(const j of c.jobs||[])for(const o of j.opps||[])if(String(o.id)===String(id))return o;return null}
function stageCount(opp){const xs=Array.isArray(opp?.stages)?opp.stages.filter(Boolean):[];return xs.length||1}
function isComplete(oppId){const opp=oppFor(oppId);if(!opp)return false;const done=new Set();const entries=read(STORE,[]);if(Array.isArray(entries))for(const e of entries){if(String(e?.opportunityId)===String(oppId)&&Number.isInteger(e?.stageIndex))done.add(e.stageIndex)}return done.size>=stageCount(opp)}
function openFresh(oppId){const api=window.EviaStagedEvidence;if(!api?.openForOpp)return false;const original=read(STORE,[]);if(!Array.isArray(original))return false;const temporary=original.map(e=>String(e?.opportunityId)===String(oppId)&&Number.isInteger(e?.stageIndex)?{...e,stageIndex:null}:e);write(STORE,temporary);try{api.openForOpp(oppId)?.catch?.(error=>console.debug("Evia fresh evidence route",error));return true}finally{write(STORE,original)}}
window.addEventListener("click",event=>{const button=event.target?.closest?.(".self-panel [data-opp]");if(!button)return;const oppId=button.dataset.opp;if(!oppId||!isComplete(oppId))return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();openFresh(oppId)},true);
window.EviaEvidenceRouteV161=Object.freeze({version:VERSION});
})();
