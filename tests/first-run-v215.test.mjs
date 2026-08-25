import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const first=fs.readFileSync("assets/evia-first-run-v215.js","utf8");
const demo=fs.readFileSync("assets/evia-demo-mode-v215.js","utf8");
const lock=fs.readFileSync("assets/evia-profile-course-lock-v215.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("v215 wires one fresh-install onboarding system into the current shell",()=>{
  assert.equal(version,"215");
  assert.match(index,/evia-first-run-v215\.js\?v=215/);
  assert.match(index,/evia-demo-mode-v215\.js\?v=215/);
  assert.match(index,/evia-profile-course-lock-v215\.js\?v=215/);
  assert.match(index,/evia-version-v215\.js\?v=215/);
  assert.match(index,/evia-updater\.js\?v=215/);
  assert.match(sw,/evia-shell-v215/);
  assert.match(sw,/evia-first-run-v215\.js/);
  assert.match(sw,/evia-demo-mode-v215\.js/);
  assert.match(sw,/evia-profile-course-lock-v215\.js/);
});

test("fresh launch offers setup, demo and walkthrough while existing learners are grandfathered",()=>{
  assert.match(first,/Set up my Evia/);
  assert.match(first,/Try Evia Demo/);
  assert.match(first,/Show me around/);
  assert.match(first,/WALKTHROUGH=\[/);
  assert.match(first,/function established\(\)/);
  assert.match(first,/RECEIPT_KEY/);
  assert.match(first,/localStorage\.setItem\(DONE_KEY,"1"\)/);
  assert.doesNotMatch(first,/MutationObserver/);
});

test("demo uses the real pack engine with one route and three evidence opportunities",()=>{
  assert.match(first,/id:DEMO_ID,familyId:"ST0095"/);
  assert.match(first,/compatStorageSuffix:"demo-v1"/);
  assert.match(first,/codes:\["K13","S8","S9"\]/);
  assert.equal((first.match(/id:"demo-[^"]+",title:/g)||[]).length,3);
  assert.match(first,/packs\.install\(DEMO_PACK\)/);
  assert.match(first,/packs\.activate\(pack\.id\)/);
  assert.match(demo,/evidenceCount\(\)<3/);
  assert.match(demo,/practicalCount\(\)<1/);
  assert.match(demo,/Demo evidence complete/);
  assert.match(demo,/Demo practical complete/);
  assert.doesNotMatch(demo,/MutationObserver/);
});

test("demo exposes Practical only in ARP and keeps activation available",()=>{
  assert.match(demo,/data-arp-option=\"multiple-choice\"/);
  assert.match(demo,/data-arp-option=\"discussion\"/);
  assert.match(demo,/data-fs194-subject=\"maths\"/);
  assert.match(demo,/data-fs194-subject=\"english\"/);
  assert.doesNotMatch(demo,/data-arp-option=\"practical\"\]\{display:none/);
  assert.match(demo,/Activate full Evia/);
  assert.match(demo,/activateFullFromDemo/);
});

test("full learner setup is QR-first with an optional portfolio link",()=>{
  assert.match(first,/evia-first-run-qr/);
  assert.match(first,/data-enrol-manual-toggle/);
  assert.match(first,/display:none!important/);
  assert.match(first,/activated by Course QR/);
  assert.match(first,/Online portfolio link · optional/);
  assert.match(first,/Leave this blank/);
  assert.match(first,/contractedWeeklyHours:weeklyHours/);
});

test("new QR-activated learners cannot accidentally switch course in their learner profile",()=>{
  assert.match(lock,/RECEIPT_KEY="evia-course-enrolment-v1"/);
  assert.match(lock,/pointerEvents="none"/);
  assert.match(lock,/Course is activated by the learner's Evia Course QR/);
  assert.doesNotMatch(lock,/MutationObserver/);
});
