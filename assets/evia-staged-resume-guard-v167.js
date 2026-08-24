(()=>{
"use strict";
const ROUTE="evia-stage-route-v133",DRAFTS="evia-stage-drafts-v133";
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
const route=read(ROUTE,null);
if(!route?.oppId)return;
const drafts=read(DRAFTS,{});
const suffix=`::${route.oppId}::${Math.max(0,Number(route.stageIndex)||0)}`;
const hasRecoverableDraft=Object.entries(drafts||{}).some(([key,draft])=>key.endsWith(suffix)&&draft?.id);
if(!hasRecoverableDraft)localStorage.removeItem(ROUTE);
})();