import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync("assets/evia-target-calibration-v217.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");

test("v217 target calibration is wired into the release",()=>{
  assert.equal(String(manifest.version),"217");
  assert.match(index,/evia-target-calibration-v217\.js\?v=217/);
  assert.match(sw,/evia-target-calibration-v217\.js/);
  assert.match(source,/weekly>0\?weekly\*\.2\*windowWeeks/);
  assert.match(source,/Math\.pow\(stageAtDue,1\.6\)/);
  assert.match(source,/oldLearn>newLearn\*1\.35/);
  assert.match(source,/completionDate:iso\(d\.finish\)/);
  assert.doesNotMatch(source,/MutationObserver/);
});

test("a new two-year Bricklayer learner gets achievable first 10-week targets",()=>{
  const storage=new Map();
  storage.set("evia-course-timeline",JSON.stringify({courseId:"st0095-v1-2",courseTitle:"Bricklayer",pathway:"",startDate:"2026-08-26",endDate:"2028-08-26",contractedWeeklyHours:37,weeklyHours:37}));
  storage.set("evia-targets-v1",JSON.stringify({version:1,courseId:"st0095-v1-2",pathway:"",createdAt:1,dueDate:"2026-11-04",calculatedForDate:"2026-11-04",completionDate:"2028-05-26",targets:[
    {type:"coverage",targetPct:39,targetCount:23},{type:"evidence",addCount:16,baselineCount:0,targetCount:16},{type:"breadth",areaCount:4},{type:"learning",addHours:210,baselineHours:0,targetHours:210},{type:"epa",targetPct:38}
  ],history:[]}));
  class FakeDate extends Date{
    constructor(...args){super(...(args.length?args:["2026-08-26T12:00:00Z"]))}
    static now(){return Date.parse("2026-08-26T12:00:00Z")}
  }
  const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  const document={readyState:"complete",addEventListener(){},querySelector(){return null}};
  const window={document,localStorage,addEventListener(){},EviaCourseContext:{current:()=>({courseId:"st0095-v1-2",pathway:"",courseType:"apprenticeship",codes:[...Array.from({length:31},(_,i)=>`K${i+1}`),...Array.from({length:22},(_,i)=>`S${i+1}`),...Array.from({length:6},(_,i)=>`B${i+1}`)],otjMinimumHours:578,epaConfigured:true})}};
  window.window=window;
  const context=vm.createContext({window,document,localStorage,Date:FakeDate,Math,JSON,Number,Object,Array,String,Set,console,setTimeout(){}});
  vm.runInContext(source,context,{filename:"assets/evia-target-calibration-v217.js"});
  const state=JSON.parse(storage.get("evia-targets-v1"));
  const by=type=>state.targets.find(t=>t.type===type);
  assert.equal(state.calibrationVersion,217);
  assert.equal(state.dueDate,"2026-11-04");
  assert.equal(state.completionDate,"2028-05-26");
  assert.equal(by("coverage").targetPct,12);
  assert.equal(by("coverage").targetCount,7);
  assert.equal(by("evidence").addCount,5);
  assert.equal(by("breadth").areaCount,2);
  assert.equal(by("learning").addHours,74);
  assert.equal(by("epa").targetPct,5);
});
