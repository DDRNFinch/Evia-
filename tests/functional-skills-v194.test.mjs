import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const code=fs.readFileSync("assets/evia-functional-skills-v194.js","utf8");
const placement=fs.readFileSync("assets/evia-functional-skills-v195.js","utf8");
const foreground=fs.readFileSync("assets/evia-functional-skills-v196.js","utf8");
const mockOnly=fs.readFileSync("assets/evia-arp-mock-only-v197.js","utf8");
const targets=fs.readFileSync("assets/evia-targets.js","utf8");
const ksbState=fs.readFileSync("assets/evia-count-display-v94.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

function bank(){
  const match=code.match(/const BANK=(\{.*\});\nlet layer=/s);
  assert.ok(match,"Functional Skills BANK must be embedded in the v194 asset");
  return JSON.parse(match[1]);
}

test("v194 Functional Skills engine remains wired through the v200 release",()=>{
  assert.equal(String(manifest.version),"200");
  assert.match(index,/evia-functional-skills-v194\.js\?v=195/);
  assert.match(index,/evia-functional-skills-v195\.js\?v=195/);
  assert.match(index,/evia-functional-skills-v196\.js\?v=196/);
  assert.match(index,/evia-version-v200\.js\?v=200/);
  assert.match(index,/evia-arp-mock-only-v197\.js\?v=198/);
  assert.match(index,/evia-targets\.js\?v=199/);
  assert.match(index,/evia-count-display-v94\.js\?v=200/);
  assert.doesNotMatch(index,/evia-functional-skills-v192/);
  assert.doesNotMatch(index,/functional-skills\/maths-level-2-v1|functional-skills\/english-level-2-v1/);
  assert.match(sw,/evia-shell-v200/);
  assert.match(sw,/evia-version-v200\.js/);
  assert.match(sw,/evia-functional-skills-v194\.js/);
  assert.match(sw,/evia-functional-skills-v195\.js/);
  assert.match(sw,/evia-functional-skills-v196\.js/);
  assert.match(sw,/evia-arp-mock-only-v197\.js/);
  assert.match(sw,/evia-targets\.js/);
  assert.match(sw,/evia-count-display-v94\.js/);
  assert.doesNotMatch(sw,/evia-functional-skills-v192/);
});

test("v198 removes only the redundant Discussion and Practical learning choices",()=>{
  assert.match(mockOnly,/const VERSION=198/);
  assert.match(mockOnly,/data-discussion-mode=\\?"learn\\?"/);
  assert.match(mockOnly,/data-discussion-mode=\\?"practice\\?"/);
  assert.match(mockOnly,/data-practical-mode=\\?"learn\\?"/);
  assert.match(mockOnly,/data-practical-mode=\\?"guided\\?"/);
  assert.doesNotMatch(mockOnly,/data-arp-option=\\?"multiple-choice\\?"/);
  assert.match(mockOnly,/24 course-specific scenarios · mock discussion/);
  assert.match(mockOnly,/12 course-specific tasks · mock practical/);
  assert.match(mockOnly,/small&&small\.textContent!==copy/);
});

test("v199 EPA targets use the same live readiness shown by the Test arch",()=>{
  assert.match(targets,/EviaArpHomeScore\?\.progress\?\.\(\)/);
  assert.match(targets,/live&&live\.id/);
  assert.match(targets,/Number\(live\.percent\)/);
  assert.match(targets,/met:m\.epa\.pct>=t\.targetPct/);
});

test("v200 removes blank KSB circles but preserves all four source ticks",()=>{
  assert.match(ksbState,/const VERSION=200/);
  assert.match(ksbState,/span:not\(\.evia-ksb-marker-rail-v107\)\{display:none!important;visibility:hidden!important/);
  assert.match(ksbState,/\.evia-ksb-slot-v107\{[^}]*visibility:hidden!important;opacity:0!important;background:transparent!important;color:transparent!important/s);
  assert.match(ksbState,/\.evia-ksb-slot-v107\.on\{visibility:visible!important;opacity:1!important\}/);
  assert.match(ksbState,/\.evia-ksb-slot-v107\.learner\.on\{background:#efc33d!important;color:#4c3b0b!important\}/);
  assert.match(ksbState,/\.evia-ksb-slot-v107\.rpl\.on\{background:#7b3fc6!important;color:#fff!important\}/);
  assert.match(ksbState,/\.evia-ksb-slot-v107\.milos\.on\{background:#367fd0!important;color:#fff!important\}/);
  assert.match(ksbState,/\.evia-ksb-slot-v107\.witness\.on\{background:#d88b45!important;color:#fff!important\}/);
  assert.match(ksbState,/\[\["learner",learner,"Learner evidence"\],\["rpl",rpl,"Recorded Prior Learning"\],\["milos",milos,"Assessor Observation"\],\["witness",witness,"Witness testimony"\]\]/);
});

test("Maths and English each have five equal five-question parts",()=>{
  const data=bank();
  for(const subject of ["maths","english"]){
    assert.equal(data[subject].length,5,`${subject} must have five parts`);
    assert.equal(data[subject].flatMap(x=>x.questions).length,25,`${subject} must have 25 questions`);
    for(const part of data[subject])assert.equal(part.questions.length,5,`${subject} parts must be equal`);
  }
});

test("every practice question has three answers plus D Teach me support",()=>{
  const data=bank();
  for(const q of Object.values(data).flatMap(parts=>parts.flatMap(x=>x.questions))){
    assert.equal(q.options.length,3);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=2);
    assert.ok(String(q.explain||"").length>20,"each question needs a teaching explanation");
  }
  assert.match(code,/D · Teach me/);
  assert.match(code,/data-fs194-teach/);
  assert.match(code,/Not quite · The answer is/);
  assert.match(code,/Teach me · The answer is/);
});

test("Functional Skills rows are inserted directly after ARP Practical",()=>{
  assert.match(code,/data-arp-option="practical"/);
  assert.match(code,/practical\.after\(m,e\)/);
  assert.match(code,/Maths Level 2/);
  assert.match(code,/English Level 2/);
  assert.match(code,/Multiple choice · 5 parts · 5 questions each/);
});

test("v195 waits for actual ARP contents before refreshing rows",()=>{
  assert.match(placement,/\.evia-arp-layer/);
  assert.match(placement,/data-arp-option=\\?"practical\\?"/);
  assert.match(placement,/EviaFunctionalSkills\?\.refresh\?\./);
  assert.match(placement,/MutationObserver/);
  assert.match(placement,/subtree:true/);
  assert.match(placement,/setTimeout/);
  assert.match(placement,/30,80,160,320,650/);
});

test("v196 keeps Functional Skills above the ARP tools layer",()=>{
  const arpCss=fs.readFileSync("assets/evia-tools.css","utf8");
  const arpZ=Number(arpCss.match(/\.evia-tools-layer\{[^}]*z-index:(\d+)/)?.[1]||0);
  const fsZ=Number(foreground.match(/const VERSION=196,Z=(\d+)/)?.[1]||0);
  assert.equal(arpZ,100000,"ARP tools layer should remain at its established stack level");
  assert.ok(fsZ>arpZ,`Functional Skills ${fsZ} must be above ARP ${arpZ}`);
  assert.match(foreground,/z-index:\$\{Z\}!important/);
  assert.match(foreground,/setProperty\("z-index",String\(Z\),"important"\)/);
  assert.match(foreground,/MutationObserver/);
});

test("v194 practice remains self-contained and does not fetch question packs",()=>{
  assert.doesNotMatch(code,/fetch\(/);
  assert.doesNotMatch(code,/EviaFunctionalSkillsMathsL2|EviaFunctionalSkillsEnglishL2/);
  assert.match(code,/localStorage\.setItem/);
});
