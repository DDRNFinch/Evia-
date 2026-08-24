(()=>{
"use strict";
const VERSION=151;
const base=window.EviaTrowelFramework;
if(!base?.build)return;
const clone=x=>JSON.parse(JSON.stringify(x));
function expand(route){
  const data=clone(base.build(route));
  const practical=data.find(g=>g.id==="E");
  if(!practical)return data;
  for(const job of practical.jobs||[]){
    const parents=[...(job.opps||[])];
    const expanded=[];
    for(const parent of parents){
      const stages=Array.isArray(parent.stages)?parent.stages.filter(Boolean):[];
      if(!stages.length){expanded.push(parent);continue}
      parent.nvqPracticalParent=true;
      parent.childIds=[];
      delete parent.stages;
      expanded.push(parent);
      stages.forEach((stage,index)=>{
        const number=index+1;
        const childCode=`${parent.activityCode}.${number}`;
        const childId=String(stage.id||`${parent.id}_${number}`);
        const prompts=Array.isArray(stage.prompts)&&stage.prompts.length?[...stage.prompts]:[stage.instruction||parent.question||"Show this evidence clearly."];
        const methods=Array.isArray(stage.methods)&&stage.methods.length?[...stage.methods]:["photo","video"];
        parent.childIds.push(childId);
        expanded.push({
          id:childId,
          activityCode:childCode,
          title:`${childCode} — ${stage.title}`,
          plainTitle:stage.title,
          instruction:stage.instruction||parent.instruction,
          question:prompts[0],
          prompts,
          methods,
          codes:[...(parent.codes||[])],
          bundle:parent.bundle,
          groupId:parent.groupId,
          groupTitle:parent.groupTitle,
          subCategoryId:parent.subCategoryId,
          subCategoryTitle:parent.subCategoryTitle,
          parentActivityId:parent.id,
          parentActivityCode:parent.activityCode,
          parentActivityTitle:parent.title,
          nvqPracticalChild:true,
          stages:[{
            id:`${childId}-evidence`,
            title:`${childCode} — ${stage.title}`,
            instruction:stage.instruction||parent.instruction,
            prompts,
            methods
          }]
        })
      })
    }
    job.opps=expanded
  }
  return data
}
function build(route="thin"){return expand(route)}
const api=Object.freeze({
  version:VERSION,
  courseId:base.courseId,
  groups:base.groups,
  build,
  structure:build,
  audit:base.audit,
  activity:base.activity,
  activityForCode:base.activityForCode,
  allCodes:base.allCodes
});
window.EviaTrowelData=api;
window.EviaTrowelDataReady=Promise.resolve(api);
window.EviaTrowelPractical=api;
})();
