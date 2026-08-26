(()=>{
"use strict";
const VERSION=234,KEY="evia-mini-milos-visits-v2";
function route(){const c=window.EviaCourseContext?.current?.();if(!c||c.noCourse)return"";if(c.courseId==="st0171-v1-1")return"ST0171";if(c.courseId==="st0095-v1-2")return"ST0095";if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}return String(c.packFamilyId||c.standardId||c.courseId||"").slice(0,60)}
function captureFrom(value){try{const xs=JSON.parse(String(value||"[]"));if(!Array.isArray(xs))return;const r=route(),review=xs.filter(x=>x&&String(x.t||"").toLowerCase()==="review"&&(!r||String(x.c||"")===r)).sort((a,b)=>Number(b.u||0)-Number(a.u||0))[0];if(review)window.EviaReviewSnapshots?.capture?.(review)}catch{}}
const previous=Storage.prototype.setItem;
if(!previous.__eviaReviewSnapshotHookV234){const wrapped=function(key,value){if(this===localStorage&&String(key)===KEY)captureFrom(value);return previous.call(this,key,value)};wrapped.__eviaReviewSnapshotHookV234=true;wrapped.__eviaReviewSnapshotPrevious=previous;Storage.prototype.setItem=wrapped}
window.EviaReviewSnapshotHook=Object.freeze({version:VERSION,storageKey:KEY,captureFrom});
})();
