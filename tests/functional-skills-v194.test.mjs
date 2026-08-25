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
const evidenceState=fs.readFileSync("assets/evia-evidence-state-v203.js","utf8");
const staged=fs.readFileSync("assets/evia-staged-evidence-v202.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

function bank(){
  const match=code.match(/const BANK=(\{.*\});\nlet layer=/s);
  assert.ok(match,"Functional Skills BANK must be embedded in the v194 asset");
  return JSON.parse(match[1]);
}

test("v203 runtime is wired without the failed marker and photo workaround layers",()=>{
  assert.equal(String(manifest.version),"203");
  assert.match(index,/evia-version-v203\.js\?v=203/);
  assert.match(index,/evia-staged-evidence-v202\.js\?v=202/);
  assert.match(index,/evia-evidence-state-v203\.js\?v=203/);
  assert.doesNotMatch(index,/evia-evidence-state-v202\.js/);
  assert.doesNotMatch(index,/evia-count-display-v94\.js/);
  assert.doesNotMatch(index,/evia-ksb-clean-v201\.js/);
  assert.doesNotMatch(index,/evia-single-completion-tick-v173\.js/);
  assert.doesNotMatch(index,/evia-photo-fast-v140\.js/);
  assert.match(sw,/evia-shell-v203/);
  assert.match(sw,/evia-version-v203\.js/);
  assert.match(sw,/evia-staged-evidence-v202\.js/);
  assert.match(sw,/evia-evidence-state-v203\.js/);
  assert.doesNotMatch(sw,/evia-evidence-state-v202\.js|evia-count-display-v94\.js|evia-ksb-clean-v201\.js|evia-single-completion-tick-v173\.js|evia-photo-fast-v140\.js/);
});

test("v203 removes every dark evidence marker and preserves one light completion tick",()=>{
  assert.match(evidenceState,/const DARK_SELECTORS=/);
  assert.match(evidenceState,/function removeDarkMarkers\(root=document\)/);
  assert.match(evidenceState,/root\.querySelectorAll\?\.\(DARK_SELECTORS\)\.forEach\(x=>x\.remove\(\)\)/);
  assert.match(evidenceState,/background:#f2db7d!important/);
  assert.match(evidenceState,/color:#6d5d1e!important/);
  assert.match(evidenceState,/setKsbLightTick\(btn,covered\.has\(code\)\)/);
  assert.match(evidenceState,/setOppLightTick\(btn,complete\)/);
  assert.doesNotMatch(evidenceState,/createElement\("i"\)/);
  assert.doesNotMatch(evidenceState,/className=`evia-opportunity-source/);
  assert.doesNotMatch(evidenceState,/MutationObserver/);
  assert.doesNotMatch(evidenceState,/setInterval\(/);
});

test("v202 photo review is still shown from the captured canvas before JPEG encoding finishes",()=>{
  assert.match(staged,/function canvasFile\(canvas\)/);
  assert.match(staged,/function renderPhotoCanvasReview\(canvas,filePromise\)/);
  assert.match(staged,/const filePromise=canvasFile\(canvas\);renderPhotoCanvasReview\(canvas,filePromise\)/);
  assert.match(staged,/host\.insertBefore\(canvas,prompt\)/);
  assert.match(staged,/const file=await filePromise/);
});

test("mock-only ARP flow keeps MCQ untouched and removes redundant learning choices",()=>{
  assert.match(mockOnly,/data-discussion-mode=\"learn\"/);
  assert.match(mockOnly,/data-discussion-mode=\"practice\"/);
  assert.match(mockOnly,/data-practical-mode=\"learn\"/);
  assert.match(mockOnly,/data-practical-mode=\"guided\"/);
  assert.doesNotMatch(mockOnly,/data-arp-option=\"multiple-choice\"/);
});

test("EPA targets still use the same live readiness shown by the Test arch",()=>{
  assert.match(targets,/EviaArpHomeScore\?\.progress\?\.\(\)/);
  assert.match(targets,/met:m\.epa\.pct>=t\.targetPct/);
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
    assert.ok(String(q.explain||"").length>20);
  }
  assert.match(code,/D · Teach me/);
  assert.match(code,/data-fs194-teach/);
});

test("Functional Skills rows still sit after ARP Practical",()=>{
  assert.match(code,/data-arp-option="practical"/);
  assert.match(code,/practical\.after\(m,e\)/);
  assert.match(code,/Maths Level 2/);
  assert.match(code,/English Level 2/);
  assert.match(placement,/30,80,160,320,650/);
  assert.doesNotMatch(placement,/MutationObserver/);
  assert.doesNotMatch(foreground,/MutationObserver/);
});
