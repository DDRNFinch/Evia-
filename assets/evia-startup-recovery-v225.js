(()=>{
"use strict";
const VERSION=225,DEMO_KEY="evia-demo-mode-v1",DEMO_ID="evia-demo-st0095-v1",STATE_KEY="evia-first-run-state-v1",TIMELINE_KEY="evia-course-timeline",NAME_KEY="evia-full-name";
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const DEMO_PACK={
  nisiCoursePack:1,schemaVersion:1,id:DEMO_ID,familyId:"ST0095",version:"1.2-demo",title:"Evia Demo — Bricklayer",shortTitle:"Evia Demo",standard:"ST0095 Demo",standardId:"ST0095",courseType:"apprenticeship",coverageLabel:"KSB",learningLabel:"OTJ",fourthLabel:"EPA",otjMinimumHours:1,gatewayBufferMonths:3,epaConfigured:true,compatStorageSuffix:"demo-v1",
  codes:["K13","S8","S9"],
  codeDescriptions:{K13:"Hand tools: selection, use, maintenance and storage.",S8:"Select and use hand tools and equipment.",S9:"Maintain and store hand tools correctly."},
  siteData:[
    {id:"demo-practical",title:"Practical evidence",jobs:[{id:"demo-use-tools",title:"Using & caring for hand tools",opps:[
      {id:"demo-use-tool",title:"Use a hand tool",instruction:"Take one clear photo showing a hand tool being used for the job.",question:"What tool are you using and what are you doing with it?",codes:["S8"],bundle:"Demo practical evidence"},
      {id:"demo-care-tool",title:"Look after the tool",instruction:"Take one clear photo showing the tool being cleaned, checked or stored.",question:"What are you doing to keep the tool in good condition?",codes:["S9"],bundle:"Demo practical evidence"}
    ]}]},
    {id:"demo-knowledge",title:"Knowledge evidence",jobs:[{id:"demo-audio",title:"Explain hand tools",opps:[
      {id:"demo-audio-reflection",title:"Guided audio explanation",media:"audio",methods:["audio"],instruction:"Record one guided audio explanation. Keep recording while Evia gives you each prompt.",question:"Explain your knowledge of selecting, using and looking after hand tools.",prompts:["Name the hand tool and explain what type of work it is suited to.","Explain how the tool should be used safely and correctly.","Explain what checks, cleaning and storage are needed after use."],codes:["K13"],bundle:"Demo knowledge evidence"}
    ]}]}
  ]
};
const LEGACY_PACKS={
  "evia-site-data":{file:"Bricklayer_ST0095_v1.2.nisi",pathway:""},
  "evia-carpentry-site-data":{file:"Carpentry_Joinery_ST0264_v1.4.nisi",pathway:"site-carpenter"},
  "evia-carpentry-joiner-data":{file:"Carpentry_Joinery_ST0264_v1.4.nisi",pathway:"architectural-joiner"}
};
const packCache=new Map();
function demoIntent(){const t=read(TIMELINE_KEY,{}),s=read(STATE_KEY,{});return localStorage.getItem(DEMO_KEY)==="1"||String(t.courseId||"")===DEMO_ID||s?.phase==="demo"}
function demoDates(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth()-2,1),end=new Date(now.getFullYear(),now.getMonth()+10,1),iso=d=>d.toISOString().slice(0,10);return{startDate:iso(start),endDate:iso(end)}}
function repairDemo(){
  if(!demoIntent())return false;
  const packs=window.EviaCoursePacks;if(!packs?.install||!packs?.activate)return false;
  try{
    const pack=packs.install(DEMO_PACK);
    packs.activate(DEMO_ID);
    const t=read(TIMELINE_KEY,{}),dates=demoDates();
    write(TIMELINE_KEY,{...t,courseId:DEMO_ID,courseTitle:pack.title,pathway:"",pathwayTitle:"",startDate:t.startDate||dates.startDate,endDate:t.endDate||dates.endDate,weeklyHours:Number(t.weeklyHours)||37,contractedWeeklyHours:Number(t.contractedWeeklyHours)||Number(t.weeklyHours)||37,workingDays:Number(t.workingDays)||5,updatedAt:Date.now()});
    if(!(localStorage.getItem(NAME_KEY)||"").trim())localStorage.setItem(NAME_KEY,"Demo learner");
    localStorage.setItem(DEMO_KEY,"1");write(STATE_KEY,{phase:"demo",updatedAt:Date.now()});return true
  }catch(error){console.error("Evia v225 demo recovery",error);return false}
}
function siteChunk(data,part){const size=Math.ceil(data.length/3),start=(part-1)*size,end=part===3?data.length:Math.min(data.length,start+size);return data.slice(start,end)}
function siteResponse(data,part){const body=`import type { SiteCategory } from "./evia-data-types";\nexport const SITE_DATA_${part}:SiteCategory[]=${JSON.stringify(siteChunk(data,part))};\n`;return new Response(body,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}})}
function setupResponse(part){const data=part===1?[{id:"setup",title:"Set up Evia",jobs:[{id:"setup-course",title:"Choose your course",opps:[{id:"setup-course-qr",title:"Add course",instruction:"Use Evia setup to activate a course or try the demo.",question:"Choose setup or demo to continue.",codes:["SETUP"]}]}]}]:[];return siteResponse(data,1)}
function installCourseMapRecovery(){
  const previous=window.fetch.bind(window);
  async function publishedData(config){
    const key=config.file;if(!packCache.has(key))packCache.set(key,(async()=>{
      const response=await previous(`./course-packs/${config.file}?v=${VERSION}`,{cache:"no-store"});if(!response.ok)throw Error(`course pack ${response.status}`);
      const pack=await response.json();
      if(config.pathway){const p=Array.isArray(pack.pathways)?pack.pathways.find(x=>String(x?.id)===config.pathway):null;if(!Array.isArray(p?.siteData)||!p.siteData.length)throw Error(`missing ${config.pathway} map`);return p.siteData}
      if(!Array.isArray(pack.siteData)||!pack.siteData.length)throw Error("missing course map");return pack.siteData
    })());
    return packCache.get(key)
  }
  window.fetch=async function(input,init){
    const url=typeof input==="string"?input:input?.url||"";
    try{
      let m=String(url).match(/(?:^|\/)app\/(evia-site-data|evia-carpentry-site-data|evia-carpentry-joiner-data)-([123])\.ts(?:\?|$)/);
      if(m){const config=LEGACY_PACKS[m[1]],part=Number(m[2]),data=await publishedData(config);return siteResponse(data,part)}
      m=String(url).match(/(?:^|\/)app\/evia-no-course-data-([123])\.ts(?:\?|$)/);
      if(m){const part=Number(m[1]),data=part===1?[{id:"setup",title:"Set up Evia",jobs:[{id:"setup-course",title:"Choose your course",opps:[{id:"setup-course-qr",title:"Add course",instruction:"Use Evia setup to activate a course or try the demo.",question:"Choose setup or demo to continue.",codes:["SETUP"]}]}]}]:[];const body=`import type { SiteCategory } from "./evia-data-types";\nexport const SITE_DATA_${part}:SiteCategory[]=${JSON.stringify(data)};\n`;return new Response(body,{status:200,headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"}})}
    }catch(error){console.error("Evia v225 course-map recovery",error)}
    return previous(input,init)
  };
}
const repaired=repairDemo();installCourseMapRecovery();
window.EviaStartupRecoveryV225=Object.freeze({version:VERSION,repairedDemo:repaired,legacyPrefixes:Object.freeze(Object.keys(LEGACY_PACKS))});
})();
