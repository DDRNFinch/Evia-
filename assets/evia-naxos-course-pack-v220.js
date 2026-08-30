(()=>{
"use strict";
const VERSION=242,base=window.EviaCoursePacks;
if(!base)return;
const nativeInstall=base.install.bind(base),nativeNormalize=base.normalize.bind(base);
const KSB_QR_TYPES=new Set(["evia-mapping-pack-url-v1"]),NVQ_QR_TYPES=new Set(["evia-mapping-pack-url","evia-mapping-pack-url-v1"]);
const uniq=xs=>[...new Set((xs||[]).map(String).filter(Boolean))];
const clone=v=>{try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v))}};
const slug=s=>String(s||"course").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"course";
const numeric=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
function dataFor(pack,p){return Array.isArray(p?.siteData)?p.siteData:Array.isArray(pack?.siteData)?pack.siteData:[]}
function sourceFor(pack,p){const xs=Array.isArray(p?.codes)?p.codes:Array.isArray(pack?.codes)?pack.codes:[];return uniq(xs)}
function mapped(data){const s=new Set();for(const cat of data||[])for(const job of cat?.jobs||[])for(const opp of job?.opps||[])for(const code of opp?.codes||[])s.add(String(code));return s}
function adaptedPart(pack,p){const source=sourceFor(pack,p),used=mapped(dataFor(pack,p)),active=source.filter(c=>used.has(c)),unused=source.filter(c=>!used.has(c));return{source,active,unused}}
function adaptLegacy(raw){
  const wrapped=raw?.coursePack&&typeof raw.coursePack==="object",original=wrapped?raw.coursePack:raw;
  if(!original||typeof original!=="object"||Array.isArray(original))return raw;
  const pack=clone(original),allow=pack.allowUnmappedCodes===true;
  if(Array.isArray(pack.pathways)&&pack.pathways.length){
    pack.pathways=pack.pathways.map(p=>{const enabled=p?.allowUnmappedCodes===true||allow;if(!enabled)return p;const x=adaptedPart(pack,p),out={...p,sourceCodes:x.source,codes:x.active,allowUnmappedCodes:true};out.coverageAudit={...(p.coverageAudit||{}),used:x.active.length,total:x.source.length,usedCodes:x.active,unused:x.unused};return out})
  }else if(allow){const x=adaptedPart(pack,null);pack.sourceCodes=x.source;pack.codes=x.active;pack.coverageAudit={...(pack.coverageAudit||{}),used:x.active.length,total:x.source.length,usedCodes:x.active,unused:x.unused}}
  pack.naxosCoursePackCompatibility=VERSION;
  return wrapped?{...raw,coursePack:pack}:pack
}
function isNaxosPack(raw){return !!(raw&&typeof raw==="object"&&!Array.isArray(raw)&&Number(raw.eviaMappingPack)===1&&Number(raw.schemaVersion)>=2)}
function parsePayload(value){
  let payload=value;
  if(typeof value==="string"){try{payload=JSON.parse(value.trim())}catch{return null}}
  if(!payload||typeof payload!=="object"||Array.isArray(payload)||Number(payload.version)!==1)return null;
  const type=String(payload.type||"");if(!KSB_QR_TYPES.has(type)&&!NVQ_QR_TYPES.has(type))return null;
  if(!payload.packUrl)return null;
  try{const url=new URL(String(payload.packUrl),document.baseURI);if(!/^https?:$/.test(url.protocol))return null;return{...payload,packUrl:url.href}}catch{return null}
}
async function fetchJson(url){const response=await fetch(url,{cache:"no-store"});if(!response.ok)throw Error(`Naxos course download failed (${response.status}).`);try{return await response.json()}catch{throw Error("The Naxos course file is not valid JSON.")}}
function packType(raw){if(String(raw?.courseType||"").toLowerCase()==="ksb")return"ksb";if(String(raw?.qualification?.courseType||"").toLowerCase()==="nvq")return"nvq";return""}
function routeId(c){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="st0171-v1-1")return"ST0171";
  if(c.courseType==="nvq"){const id=String(c.courseId||c.packFamilyId||c.standardId||"").toUpperCase(),path=String(c.pathway||"").toUpperCase();return id&&path?`${id}-${path}`:id}
  return String(c.packFamilyId||c.standardId||c.courseId||"").trim().toUpperCase().slice(0,60)
}
function refUrl(packUrl,ref,type){const dir=new URL("./",packUrl),baseUrl=type==="ksb"?new URL("../",dir):dir;return new URL(String(ref||""),baseUrl).href}
function auditStructure(categories,label){
  if(!Array.isArray(categories)||!categories.length)throw Error(`${label} has no Naxos learner categories.`);
  if(categories.length>5)throw Error(`${label} exceeds the Naxos 5×5×5 category limit.`);
  const ids=new Set();
  for(const cat of categories){if(!cat?.id||!cat?.title||!Array.isArray(cat.subcategories))throw Error(`${label} has an incomplete Naxos category.`);if(cat.subcategories.length>5)throw Error(`${cat.title} exceeds the Naxos five-subcategory limit.`);for(const sub of cat.subcategories){if(!sub?.id||!sub?.title||!Array.isArray(sub.tasks))throw Error(`${cat.title} has an incomplete Naxos subcategory.`);if(sub.tasks.length>5)throw Error(`${sub.title} exceeds the Naxos five-task limit.`);for(const task of sub.tasks){if(!task?.id||!task?.title)throw Error(`${sub.title} has an incomplete Naxos task.`);const id=String(task.id);if(ids.has(id))throw Error(`Naxos task ${id} is duplicated.`);ids.add(id)}}}
}
function taskList(categories){return (categories||[]).flatMap(c=>c.subcategories||[]).flatMap(s=>s.tasks||[])}
function findTask(categories,id){return taskList(categories).find(t=>String(t?.id)===String(id))||null}
function evidenceKind(profile){const type=String(profile?.preferred?.[0]?.type||"").toLowerCase();if(type==="photos")return"photo";if(type==="witness")return"audio";return["photo","video","audio"].includes(type)?type:"photo"}
function preferredInstruction(profile,task){return String(task?.conditionalPrompt||profile?.preferred?.[0]?.instruction||"Show or explain what you did and how you checked it.")}
function toOpp(task,codes,evidenceRules){
  const profile=evidenceRules?.profiles?.[String(task.evidenceProfile||"")]||null,type=evidenceKind(profile),prompt=preferredInstruction(profile,task);
  const opp={id:String(task.id),title:String(task.title),question:prompt,instruction:prompt,codes:uniq(codes),bundle:String(task.bundle||""),groupId:String(task.groupId||""),subCategoryId:String(task.subCategoryId||""),evidenceProfile:String(task.evidenceProfile||""),naxosEvidenceRequirements:uniq(task.evidenceRequirements||[]),naxosTask:true};
  if(type==="audio")opp.media="talk";
  else{opp.evidenceType=type;opp.stages=[{id:`${task.id}-evidence`,title:String(task.title),instruction:String(profile?.preferred?.[0]?.instruction||prompt),prompts:[prompt]}]}
  return opp
}
function knownKsbMeta(standardId,version){
  const id=String(standardId||"").toUpperCase(),v=String(version||"");
  if(id==="ST0095")return{packId:"st0095-v1-2",shortTitle:"Bricklayer",otjMinimumHours:578,epaConfigured:true,compatStorageSuffix:""};
  if(id==="ST0264")return{packId:"st0264-v1-4",shortTitle:"Carpentry & Joinery",otjMinimumHours:557,epaConfigured:true};
  if(id==="ST0171")return{packId:"st0171-v1-1",shortTitle:"Property Maintenance",otjMinimumHours:418,epaConfigured:false,compatStorageSuffix:"st0171"};
  return{packId:`${slug(id)}-v${slug(v||"1")}`,shortTitle:id||"Course",epaConfigured:true}
}
function pathwayMeta(q){const id=String(q?.id||"").toUpperCase();if(id==="ST0264-SITE")return{id:"site-carpenter",title:String(q.pathway||"Site Carpenter"),compatStorageSuffix:"st0264-site"};if(id==="ST0264-AJ")return{id:"architectural-joiner",title:String(q.pathway||"Architectural Joiner"),compatStorageSuffix:"st0264-aj"};if(q?.pathway)return{id:slug(q.pathway),title:String(q.pathway),compatStorageSuffix:undefined};return null}
function buildKsbCriteria(codes,facets,categories){
  const tasks=taskList(categories),criterionToOpps=new Map();
  for(const task of tasks){const req=uniq(task.evidenceRequirements||[]);for(const criterion of req){const xs=criterionToOpps.get(criterion)||[];xs.push(String(task.id));criterionToOpps.set(criterion,uniq(xs))}}
  const out={};
  for(const code of codes){
    const parts=Array.isArray(facets?.[code])&&facets[code].length?facets[code].map(x=>`${code}.${String(x?.[0]||"").trim()}`).filter(x=>!x.endsWith(".")):[code];
    out[code]=parts.map((criterionId,index)=>{
      let opportunityIds=criterionToOpps.get(criterionId)||[];
      if(!opportunityIds.length&&criterionId===code)opportunityIds=tasks.filter(t=>(t.ksbTargets||[]).map(String).includes(code)).map(t=>String(t.id));
      if(!opportunityIds.length)throw Error(`${code} criterion ${criterionId} is not mapped to a Naxos task.`);
      return{criterionId,parentCode:code,index:index+1,total:parts.length,opportunityId:opportunityIds[0],opportunityIds}
    })
  }
  return out
}
async function convertKsb(raw,packUrl){
  const q=raw.qualification||{};
  const standardId=String(q.standardId||q.id||"").split("-")[0]||String(q.id||"");
  const meta=knownKsbMeta(q.standardId||standardId,q.version);
  const registry=raw.ksbRegistry?await fetchJson(refUrl(packUrl,raw.ksbRegistry,"ksb")):null;
  const facets=raw.facetRegistry?await fetchJson(refUrl(packUrl,raw.facetRegistry,"ksb")):null;
  const evidenceRules=raw.evidenceRules?await fetchJson(refUrl(packUrl,raw.evidenceRules,"ksb")):null;
  const categories=await Promise.all((raw.categoryFiles||[]).map(ref=>fetchJson(refUrl(packUrl,ref,"ksb"))));
  auditStructure(categories,q.title||q.id||"Naxos course");
  const registryItems=registry?.items&&typeof registry.items==="object"?registry.items:{};
  const codes=Object.keys(registryItems);
  if(!codes.length)throw Error("The Naxos KSB registry is empty.");
  const allowed=new Set(codes);
  const siteData=categories.map(cat=>{
    const jobs=(cat.subcategories||[]).map(sub=>{
      const opps=(sub.tasks||[]).map(task=>{
        const taskCodes=uniq(task.ksbTargets||[]);
        if(!taskCodes.length)throw Error(`${task.title} has no Naxos KSB targets.`);
        const unknown=taskCodes.filter(c=>!allowed.has(c));
        if(unknown.length)throw Error(`${task.title} maps unknown KSB ${unknown[0]}.`);
        return toOpp({...task,bundle:cat.title,groupId:cat.id,subCategoryId:sub.id},taskCodes,evidenceRules)
      });
      return{id:String(sub.id),title:String(sub.title),opps}
    });
    return{id:String(cat.id),title:String(cat.title),jobs}
  });
  const evidenceCriteria=buildKsbCriteria(codes,facets?.items||{},categories);
  const path=pathwayMeta(q);
  const common={codes,codeDescriptions:registryItems,siteData,evidenceCriteria,naxosMappingPack:1,naxosSchemaVersion:Number(raw.schemaVersion)||3,naxosSourceUrl:packUrl,naxosQualificationId:String(q.id||""),naxosStructure:{maxCategories:5,maxSubcategoriesPerCategory:5,maxTasksPerSubcategory:5}};
  const pack={nisiCoursePack:1,schemaVersion:1,id:meta.packId,title:String(q.title||`${q.id||standardId} v${q.version||""}`).trim(),shortTitle:meta.shortTitle,version:String(q.version||"1"),familyId:String(q.standardId||standardId||q.id),standardId:String(q.standardId||standardId||q.id),courseType:"apprenticeship",coverageLabel:"KSB",learningLabel:"OTJ",fourthLabel:"EPA",otjMinimumHours:meta.otjMinimumHours,epaConfigured:meta.epaConfigured,gatewayBufferMonths:3,naxosMappingPack:1,naxosSchemaVersion:Number(raw.schemaVersion)||3,naxosSourceUrl:packUrl,naxosQualificationId:String(q.id||"")};
  if(path){pack.choiceLabel="Pathway";pack.pathways=[{...path,...common}]}
  else Object.assign(pack,common,{compatStorageSuffix:meta.compatStorageSuffix});
  return pack
}
function parentAc(target){const parts=String(target||"").split(".");return parts.length>=4&&/^[a-z]+$/i.test(parts.at(-1))?parts.slice(0,-1).join("."):String(target||"")}
function activeTarget(target,active){return active.has(String(target||"").split(".")[0])}
function rawTargets(categories,active){return uniq(taskList(categories).flatMap(t=>[...(t.directLo7Targets||[]),...(t.mappedAtomicTargets||[])])).filter(id=>activeTarget(id,active))}
async function fetchNvqCategories(pack,packUrl){const dir=new URL("./",packUrl);return Promise.all((pack.categoryFiles||[]).map(ref=>fetchJson(new URL(ref,dir).href)))}
async function loadRequiredTargets(raw,packUrl,active){
  const dir=new URL("./",packUrl),sourceIds=[];
  for(const sourcePath of raw.coverageSourcePacks||[]){const sourceUrl=new URL(sourcePath,dir).href,sourcePack=await fetchJson(sourceUrl),sourceDir=new URL("./",sourceUrl),categories=await Promise.all((sourcePack.categoryFiles||[]).map(ref=>fetchJson(new URL(ref,sourceDir).href)));if(sourcePack.routeMappings){const mappings=await fetchJson(new URL(sourcePack.routeMappings,sourceDir).href);for(const [taskId,ids] of Object.entries(mappings.taskMappings||{})){const task=findTask(categories,taskId);if(task)task.mappedAtomicTargets=uniq([...(task.mappedAtomicTargets||[]),...ids])}}sourceIds.push(...rawTargets(categories,active))}
  const sourceCategories=(raw.coverageSourceFiles||[]).length?await Promise.all(raw.coverageSourceFiles.map(ref=>fetchJson(new URL(ref,dir).href))):[],targetFiles=(raw.requiredTargetFiles||[]).length?await Promise.all(raw.requiredTargetFiles.map(ref=>fetchJson(new URL(ref,dir).href))):[];
  const all=uniq([...sourceIds,...rawTargets(sourceCategories,active),...targetFiles.flatMap(f=>f.targets||[]),...(raw.requiredAtomicTargets||[])]).filter(id=>activeTarget(id,active));
  return all.length?all:null
}
async function prepareNvqCategories(raw,packUrl){
  const rawCategories=await fetchNvqCategories(raw,packUrl);auditStructure(rawCategories,raw.qualification?.title||raw.qualification?.id||"Naxos NVQ");
  const categories=clone(rawCategories),active=new Set((raw.route?.activeUnits||[]).map(String)),optionalUnit=String(raw.route?.optionalUnit||""),required=await loadRequiredTargets(raw,packUrl,active),dir=new URL("./",packUrl),routeMappings=raw.routeMappings?await fetchJson(new URL(raw.routeMappings,dir).href):null;
  if(!active.size)throw Error("The Naxos NVQ route has no active units.");
  for(const task of taskList(categories)){
    if(task.primaryUnit==="OPTIONAL")task.primaryUnit=optionalUnit;
    task.directLo7Targets=uniq(task.directLo7Targets||[]).filter(id=>activeTarget(id,active));task.mappedAtomicTargets=uniq(task.mappedAtomicTargets||[]).filter(id=>activeTarget(id,active));
    if(required&&(task.targetPrefixes||[]).length){const prefixes=task.targetPrefixes.map(p=>String(p).replaceAll("$OPTIONAL",optionalUnit)),matched=required.filter(id=>prefixes.some(prefix=>id===prefix||id.startsWith(`${prefix}.`)));task.mappedAtomicTargets=uniq([...task.mappedAtomicTargets,...matched]).filter(id=>activeTarget(id,active))}
  }
  for(const [taskId,ids] of Object.entries(routeMappings?.taskMappings||{})){const task=findTask(categories,taskId);if(!task)throw Error(`Naxos route mapping points to missing task ${taskId}.`);task.mappedAtomicTargets=uniq([...(task.mappedAtomicTargets||[]),...(ids||[]).filter(id=>activeTarget(id,active))])}
  const mappedSet=new Set(rawTargets(categories,active));
  if(required){const req=new Set(required),missing=[...req].filter(id=>!mappedSet.has(id)),extras=[...mappedSet].filter(id=>!req.has(id));if(missing.length||extras.length)throw Error(`Naxos NVQ mapping audit failed (${missing.length} missing, ${extras.length} unexpected criteria).`)}else if(Number(raw.route?.atomicTargetCount||0)&&mappedSet.size!==Number(raw.route.atomicTargetCount))throw Error(`Naxos NVQ mapping audit expected ${raw.route.atomicTargetCount} atomic criteria but found ${mappedSet.size}.`);
  return{categories,active,required:required||[...mappedSet]}
}
function buildNvqMeta(raw,codes){
  const q=raw.qualification||{},route=raw.route||{},units=uniq(route.activeUnits||[]),old=String(q.id)==="6570-05"?window.EviaTrowelMeta||{}:{},optionalTitles=Object.fromEntries((q.optionalUnits||[]).map(x=>[String(x.id),String(x.title||`Unit ${x.id}`)])),unitTitles={},unitCodes={},codeUnit={};
  for(const unit of units){unitTitles[unit]=String(old.unitTitles?.[unit]||optionalTitles[unit]||`Unit ${unit}`);unitCodes[unit]=codes.filter(code=>String(code).split(".")[0]===unit).sort(numeric)}
  for(const code of codes)codeUnit[code]=Number(String(code).split(".")[0])||String(code).split(".")[0];
  const routeId=String(route.id||"route"),routeTitle=String(route.title||optionalTitles[String(route.optionalUnit||"")]||routeId);
  return{courseId:String(q.id||""),title:String(q.title||q.id||"NVQ"),shortTitle:String(q.id||"NVQ"),glhTargetHours:Number(q.glh)||Number(old.glhTargetHours)||undefined,tqtHours:Number(q.tqt)||Number(old.tqtHours)||undefined,themeNames:old.themeNames||{},codeTheme:old.codeTheme||{},codeUnit,unitTitles,unitCodes,routeUnits:{[routeId]:units},optionTitles:{[routeId]:routeTitle},optionUnit:{[routeId]:String(route.optionalUnit||"")},codeDescriptions:{}}
}
function buildNvqCriteria(categories,required){
  const criterionToOpps=new Map();
  for(const task of taskList(categories)){const targets=uniq([...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])]);for(const target of targets){const xs=criterionToOpps.get(target)||[];xs.push(String(task.id));criterionToOpps.set(target,uniq(xs))}}
  const grouped={};for(const criterionId of required){const parent=parentAc(criterionId);(grouped[parent]||(grouped[parent]=[])).push(String(criterionId))}
  const out={};for(const [parent,criteria] of Object.entries(grouped)){const exact=uniq(criteria).sort(numeric);out[parent]=exact.map((criterionId,index)=>{const opportunityIds=criterionToOpps.get(criterionId)||[];if(!opportunityIds.length)throw Error(`${criterionId} is not linked to a Naxos learner task.`);return{criterionId,parentCode:parent,index:index+1,total:exact.length,opportunityId:opportunityIds[0],opportunityIds}})}return out
}
async function convertNvq(raw,packUrl){
  const q=raw.qualification||{},route=raw.route||{};
  const prepared=await prepareNvqCategories(raw,packUrl),categories=prepared.categories,required=prepared.required;
  const evidenceRules=raw.evidenceRules?await fetchJson(refUrl(packUrl,raw.evidenceRules,"nvq")):await fetchJson(new URL("../evidence-rules.json",new URL("./",packUrl)).href).catch(()=>null);
  const codes=uniq(required.map(parentAc)).sort(numeric),allowed=new Set(codes),evidenceCriteria=buildNvqCriteria(categories,required);
  const siteData=categories.map(cat=>{
    const jobs=(cat.subcategories||[]).map(sub=>{
      const opps=(sub.tasks||[]).map(task=>{
        const targets=uniq([...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])]).filter(id=>activeTarget(id,prepared.active));
        const parents=uniq(targets.map(parentAc)).filter(code=>allowed.has(code));
        if(!parents.length)throw Error(`${task.title} has no active Naxos assessment criteria.`);
        return toOpp({...task,bundle:cat.title,groupId:cat.id,subCategoryId:sub.id,evidenceRequirements:targets},parents,evidenceRules)
      });
      return{id:String(sub.id),title:String(sub.title),opps}
    });
    return{id:String(cat.id),title:String(cat.title),jobs}
  });
  const nvqMeta=buildNvqMeta(raw,codes),courseId=String(q.id||"NVQ"),pathId=String(route.id||"route"),pathTitle=String(route.title||pathId),compatStorageSuffix=`${courseId}-${pathId}`.toLowerCase();
  const path={id:pathId,title:pathTitle,compatStorageSuffix,codes,siteData,evidenceCriteria,units:uniq(route.activeUnits||[]),glhTargetHours:Number(q.glh)||Number(nvqMeta.glhTargetHours)||undefined,tqtHours:Number(q.tqt)||Number(nvqMeta.tqtHours)||undefined,epaConfigured:false,nvqMeta,naxosMappingPack:1,naxosSchemaVersion:Number(raw.schemaVersion)||3,naxosSourceUrl:packUrl,naxosQualificationId:courseId,naxosRouteId:pathId,naxosStructure:{maxCategories:5,maxSubcategoriesPerCategory:5,maxTasksPerSubcategory:5}};
  return{nisiCoursePack:1,schemaVersion:1,id:courseId,title:String(q.title||courseId),shortTitle:String(q.title||courseId),version:String(raw.version||q.version||"1"),familyId:courseId,standardId:courseId,courseType:"nvq",coverageLabel:"AC",learningLabel:"GLH",fourthLabel:"Units",glhTargetHours:path.glhTargetHours,tqtHours:path.tqtHours,epaConfigured:false,choiceLabel:"Optional unit",pathways:[path],nvqMeta,naxosMappingPack:1,naxosSchemaVersion:Number(raw.schemaVersion)||3,naxosSourceUrl:packUrl,naxosQualificationId:courseId,naxosRouteId:pathId}
}
async function convertFromUrl(packUrl){
  const url=new URL(String(packUrl),document.baseURI).href,raw=await fetchJson(url);if(!isNaxosPack(raw))throw Error("That QR does not point to a Naxos mapping pack.");
  const type=packType(raw);if(type==="ksb")return convertKsb(raw,url);if(type==="nvq")return convertNvq(raw,url);throw Error("This Naxos course type is not supported by Evia.")
}
async function installFromPayload(value){
  const payload=parsePayload(value);if(!payload)throw Error("That is not a valid Naxos course QR.");
  const pack=await convertFromUrl(payload.packUrl),installed=nativeInstall(pack),ps=Array.isArray(installed.pathways)?installed.pathways:[];
  let pathwayId="";if(ps.length){const wanted=String(payload.route||"");pathwayId=ps.find(p=>String(p.id)===wanted)?.id||ps[0].id}
  base.activate(installed.id,pathwayId);
  return{pack:installed,pathwayId,enrolmentId:String(payload.courseId||payload.qualificationId||installed.standardId||installed.id),source:"naxos",payload}
}
function install(raw){if(isNaxosPack(raw))throw Error("Install Naxos courses using the Naxos course QR so Evia can load the complete 5×5×5 mapping.");return nativeInstall(adaptLegacy(raw))}
function normalize(raw){if(isNaxosPack(raw))throw Error("Naxos mapping packs need their linked category files. Scan the Naxos course QR instead.");return nativeNormalize(adaptLegacy(raw))}
window.EviaCoursePacks={...base,install,normalize,naxosCompatibilityVersion:VERSION};
window.EviaNaxosCoursePacks=Object.freeze({version:VERSION,parsePayload,isNaxosPack,convertFromUrl,installFromPayload,routeId});
if(!document.querySelector('script[data-evia-naxos-criteria-v223]')){const s=document.createElement('script');s.src='./assets/evia-naxos-evidence-criteria-v223.js?v=242';s.defer=true;s.dataset.eviaNaxosCriteriaV223='1';document.head.appendChild(s)}
})();
