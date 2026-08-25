import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const code=fs.readFileSync("assets/evia-functional-skills-v194.js","utf8");
const placement=fs.readFileSync("assets/evia-functional-skills-v195.js","utf8");
const foreground=fs.readFileSync("assets/evia-functional-skills-v196.js","utf8");
const mockOnly=fs.readFileSync("assets/evia-arp-mock-only-v197.js","utf8");
const recovery=fs.readFileSync("assets/evia-recovery-v207.js","utf8");
const targets=fs.readFileSync("assets/evia-targets.js","utf8");
const evidenceState=fs.readFileSync("assets/evia-evidence-state-v204.js","utf8");
const exportStatus=fs.readFileSync("assets/evia-export-status.js","utf8");
const staged=fs.readFileSync("assets/evia-staged-evidence-v202.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

function bank(){
  const match=code.match(/const BANK=(\{.*\});\nlet layer=/s);
  assert.ok(match,"Functional Skills BANK must be embedded in the v194 asset");
  return JSON.parse(match[1]);
}

test("v208 runtime keeps the corrected v204 evidence-state layer",()=>{
  assert.equal(String(manifest.version),"208");
  assert.match(index,/evia-version-v208\.js\?v=208/);
  assert.match(index,/evia-recovery-v207\.js\?v=208/);
  assert.match(index,/evia-staged-evidence-v202\.js\?v=202/);
  assert.match(index,/evia-evidence-state-v204\.js\?v=204/);
  assert.doesNotMatch(index,/evia-recovery-v206\.js/);
  assert.doesNotMatch(index,/evia-evidence-state-v203\.js/);
  assert.doesNotMatch(index,/evia-evidence-state-v202\.js/);
  assert.doesNotMatch(index,/evia-count-display-v94\.js/);
  assert.doesNotMatch(index,/evia-ksb-clean-v201\.js/);
  assert.doesNotMatch(index,/evia-single-completion-tick-v173\.js/);
  assert.doesNotMatch(index,/evia-photo-fast-v140\.js/);
  assert.match(sw,/evia-shell-v208/);
  assert.match(sw,/evia-version-v208\.js/);
  assert.match(sw,/evia-recovery-v207\.js/);
  assert.match(sw,/evia-staged-evidence-v202\.js/);
  assert.match(sw,/evia-evidence-state-v204\.js/);
  assert.doesNotMatch(sw,/evia-recovery-v206\.js|evia-evidence-state-v203\.js|evia-evidence-state-v202\.js|evia-count-display-v94\.js|evia-ksb-clean-v201\.js|evia-single-completion-tick-v173\.js|evia-photo-fast-v140\.js/);
});

test("v204 keeps the original pale task tick and preserves coloured KSB source ticks",()=>{
  assert.match(evidenceState,/function clearOpportunityExtras\(\)/);
  assert.match(evidenceState,/:scope > span/);
  assert.doesNotMatch(evidenceState,/addOppMark|evia-opportunity-source-v204/);
  assert.match(evidenceState,/function setKsbMarkers\(btn,learner,rpl,milos,witness\)/);
  assert.match(evidenceState,/createElement\("i"\)/);
  for(const source of ["learner","rpl","milos","witness"]){
    assert.match(evidenceState,new RegExp(`evia-ksb-marker-v204\\.${source}`));
  }
  assert.match(evidenceState,/background:#efc33d/);
  assert.match(evidenceState,/background:#7b3fc6/);
  assert.match(evidenceState,/background:#367fd0/);
  assert.match(evidenceState,/background:#d88b45/);
  assert.doesNotMatch(evidenceState,/MutationObserver/);
});

test("v205 spinning Sign and download circle remains intact",()=>{
  assert.match(index,/evia-export-status\.js\?v=205/);
  assert.match(exportStatus,/\[data-sign-download\]/);
  assert.match(exportStatus,/function showProgress\(\)/);
  assert.match(exportStatus,/evia-export-progress-ring-v205/);
  assert.match(exportStatus,/@keyframes eviaExportSpin205/);
  assert.match(exportStatus,/Evia-New-Evidence-/);
});

test("v202 photo review is still shown from the captured canvas before JPEG encoding finishes",()=>{
  assert.match(staged,/function canvasFile\(canvas\)/);
  assert.match(staged,/function renderPhotoCanvasReview\(canvas,filePromise\)/);
  assert.match(staged,/const filePromise=canvasFile\(canvas\);renderPhotoCanvasReview\(canvas,filePromise\)/);
  assert.match(staged,/host\.insertBefore\(canvas,prompt\)/);
  assert.match(staged,/const file=await filePromise/);
});

test("v208 mock-only enforcement cannot continuously observe the app",()=>{
  assert.match(mockOnly,/data-discussion-mode=\"learn\"/);
  assert.match(mockOnly,/data-discussion-mode=\"practice\"/);
  assert.match(mockOnly,/data-practical-mode=\"learn\"/);
  assert.match(mockOnly,/data-practical-mode=\"guided\"/);
  assert.doesNotMatch(mockOnly,/data-arp-option=\"multiple-choice\"/);
  assert.match(recovery,/const FORBIDDEN=/);
  assert.doesNotMatch(recovery,/MutationObserver/);
  assert.match(recovery,/function retry\(\)/);
  assert.match(recovery,/\[0,40,100,200,400,700\]/);
  assert.match(recovery,/stopImmediatePropagation/);
  assert.match(recovery,/enforceMockOnly/);
});

test("v208 restores Maths and English after ARP renders",()=>{
  assert.match(recovery,/function restoreFunctionalSkills\(\)/);
  assert.match(recovery,/EviaFunctionalSkills\?\.refresh\?\.\(\)/);
  assert.match(recovery,/restoreFunctionalSkills\(\)/);
  assert.match(code,/Maths Level 2/);
  assert.match(code,/English Level 2/);
  assert.match(code,/practical\.after\(m,e\)/);
});

test("v207 mock practical has explicit Camera and Gallery controls",()=>{
  assert.match(recovery,/data-evidence-file/);
  assert.match(recovery,/textContent="Camera"/);
  assert.match(recovery,/textContent="Gallery"/);
  assert.match(recovery,/setAttribute\("capture","environment"\)/);
  assert.match(recovery,/removeAttribute\("capture"\)/);
});

test("v207 course-map failure has a recovery path without a global observer",()=>{
  assert.match(recovery,/\.self-load-error/);
  assert.match(recovery,/Choose course/);
  assert.match(recovery,/Return to previous course/);
  assert.match(recovery,/evia-course-timeline-backup-v206/);
  assert.match(recovery,/EviaCoursePacks/);
  assert.doesNotMatch(recovery,/MutationObserver/);
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
