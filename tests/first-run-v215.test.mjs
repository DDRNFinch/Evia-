import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const first=fs.readFileSync("assets/evia-first-run-v215.js","utf8");
const demo=fs.readFileSync("assets/evia-demo-mode-v215.js","utf8");
const enhance=fs.readFileSync("assets/evia-demo-enhancements-v216.js","utf8");
const lock=fs.readFileSync("assets/evia-profile-course-lock-v215.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("v216 keeps the v215 first-run system and adds the richer demo layer",()=>{
  assert.equal(version,"216");
  assert.match(index,/evia-first-run-v215\.js\?v=215/);
  assert.match(index,/evia-demo-mode-v215\.js\?v=215/);
  assert.match(index,/evia-demo-enhancements-v216\.js\?v=216/);
  assert.match(index,/evia-profile-course-lock-v215\.js\?v=215/);
  assert.match(index,/evia-version-v216\.js\?v=216/);
  assert.match(index,/evia-updater\.js\?v=216/);
  assert.match(sw,/evia-shell-v216/);
  assert.match(sw,/evia-first-run-v215\.js/);
  assert.match(sw,/evia-demo-mode-v215\.js/);
  assert.match(sw,/evia-demo-enhancements-v216\.js/);
  assert.match(sw,/evia-profile-course-lock-v215\.js/);
  assert.doesNotThrow(()=>new Function(enhance));
});

test("fresh launch still offers setup, demo and walkthrough while existing learners are grandfathered",()=>{
  assert.match(first,/Set up my Evia/);
  assert.match(first,/Try Evia Demo/);
  assert.match(first,/Show me around/);
  assert.match(first,/WALKTHROUGH=\[/);
  assert.match(first,/function established\(\)/);
  assert.match(first,/RECEIPT_KEY/);
  assert.match(first,/localStorage\.setItem\(DONE_KEY,"1"\)/);
  assert.doesNotMatch(first,/MutationObserver/);
});

test("demo has two paths and three evidence opportunities including audio reflection",()=>{
  assert.match(enhance,/id:DEMO_ID,familyId:"ST0095"/);
  assert.match(enhance,/version:"1\.1-demo"/);
  assert.match(enhance,/compatStorageSuffix:"demo-v1"/);
  assert.match(enhance,/codes:\["K13","S8","S9"\]/);
  assert.equal((enhance.match(/bundle:"Demo evidence"/g)||[]).length,3);
  assert.match(enhance,/id:"demo-tools",title:"Tools & equipment"/);
  assert.match(enhance,/id:"demo-reflection",title:"Talk about your work"/);
  assert.match(enhance,/id:"demo-use-tool"/);
  assert.match(enhance,/id:"demo-care-tool"/);
  assert.match(enhance,/id:"demo-audio-reflection"/);
  assert.match(enhance,/media:"talk"/);
  assert.match(enhance,/packs\.install\(DEMO_PACK\)/);
  assert.match(enhance,/packs\.activate\(pack\.id\)/);
  assert.match(demo,/evidenceCount\(\)<3/);
  assert.match(demo,/practicalCount\(\)<1/);
  assert.match(demo,/Demo evidence complete/);
  assert.match(demo,/Demo practical complete/);
  assert.doesNotMatch(enhance,/MutationObserver/);
});

test("demo exposes Maths, English and one Practical while keeping other EPA practice limited",()=>{
  assert.match(demo,/data-arp-option=\"multiple-choice\"/);
  assert.match(demo,/data-arp-option=\"discussion\"/);
  assert.match(demo,/data-fs194-subject=\"maths\"/);
  assert.match(demo,/data-fs194-subject=\"english\"/);
  assert.match(demo,/data-arp-option=\"practical\"/);
  assert.match(enhance,/data-fs194-subject="maths"/);
  assert.match(enhance,/data-fs194-subject="english"/);
  assert.match(enhance,/display:flex!important/);
  assert.match(demo,/Activate full Evia/);
  assert.match(demo,/activateFullFromDemo/);
});

test("demo badge is a small yellow circle below Targets",()=>{
  assert.match(enhance,/\.evia-demo-badge-v215\{top:max\(3\.7rem/);
  assert.match(enhance,/right:1rem!important/);
  assert.match(enhance,/width:2\.2rem!important/);
  assert.match(enhance,/height:2\.2rem!important/);
  assert.match(enhance,/border-radius:50%!important/);
  assert.match(enhance,/background:#efc33d!important/);
  assert.match(enhance,/\.evia-demo-badge-v215 span\{display:none!important\}/);
});

test("unavailable demo features explain the full-version behaviour",()=>{
  assert.match(enhance,/data-evia-share-qr/);
  assert.match(enhance,/data-evia-receive-qr/);
  assert.match(enhance,/data-course-qr-codes/);
  assert.match(enhance,/data-qr-manage-packs/);
  assert.match(enhance,/Assessor QR sharing/);
  assert.match(enhance,/Receive assessor feedback/);
  assert.match(enhance,/Provider Course QR feature/);
  assert.match(enhance,/Licensed course packs/);
  assert.match(enhance,/Demo explanation/);
});

test("full learner setup remains QR-first with an optional portfolio link",()=>{
  assert.match(first,/evia-first-run-qr/);
  assert.match(first,/data-enrol-manual-toggle/);
  assert.match(first,/display:none!important/);
  assert.match(first,/activated by Course QR/);
  assert.match(first,/Online portfolio link · optional/);
  assert.match(first,/Leave this blank/);
  assert.match(first,/contractedWeeklyHours:weeklyHours/);
});

test("new QR-activated learners still cannot accidentally switch course in their learner profile",()=>{
  assert.match(lock,/RECEIPT_KEY="evia-course-enrolment-v1"/);
  assert.match(lock,/pointerEvents="none"/);
  assert.match(lock,/Course is activated by the learner's Evia Course QR/);
  assert.doesNotMatch(lock,/MutationObserver/);
});
