import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const first=fs.readFileSync("assets/evia-first-run-v215.js","utf8");
const demo=fs.readFileSync("assets/evia-demo-mode-v215.js","utf8");
const enhance=fs.readFileSync("assets/evia-demo-enhancements-v216.js","utf8");
const audio=fs.readFileSync("assets/evia-demo-guided-audio-v217.js","utf8");
const walkthroughBase=fs.readFileSync("assets/evia-interactive-walkthrough-v218.js","utf8");
const walkthrough=fs.readFileSync("assets/evia-interactive-walkthrough-v219.js","utf8");
const lock=fs.readFileSync("assets/evia-profile-course-lock-v215.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("v219 keeps the premium tour and slows it to a readable pace",()=>{
  assert.equal(version,"219");
  assert.match(index,/evia-first-run-v215\.js\?v=215/);
  assert.match(index,/evia-demo-mode-v215\.js\?v=215/);
  assert.match(index,/evia-demo-enhancements-v216\.js\?v=217/);
  assert.match(index,/evia-demo-guided-audio-v217\.js\?v=217/);
  assert.match(index,/evia-interactive-walkthrough-v218\.js\?v=218/);
  assert.match(index,/evia-interactive-walkthrough-v219\.js\?v=219/);
  assert.match(index,/evia-profile-course-lock-v215\.js\?v=215/);
  assert.match(index,/evia-version-v219\.js\?v=219/);
  assert.match(index,/evia-updater\.js\?v=219/);
  assert.match(sw,/evia-shell-v219/);
  assert.match(sw,/evia-demo-guided-audio-v217\.js/);
  assert.match(sw,/evia-interactive-walkthrough-v218\.js/);
  assert.match(sw,/evia-interactive-walkthrough-v219\.js/);
  assert.doesNotThrow(()=>new Function(enhance));
  assert.doesNotThrow(()=>new Function(audio));
  assert.doesNotThrow(()=>new Function(walkthroughBase));
  assert.doesNotThrow(()=>new Function(walkthrough));
});

test("fresh launch still offers setup, demo and walkthrough while existing learners are grandfathered",()=>{
  assert.match(first,/Set up my Evia/);
  assert.match(first,/Try Evia Demo/);
  assert.match(first,/Show me around/);
  assert.match(first,/function established\(\)/);
  assert.match(first,/RECEIPT_KEY/);
  assert.match(first,/localStorage\.setItem\(DONE_KEY,"1"\)/);
  assert.doesNotMatch(first,/MutationObserver/);
});

test("demo has two meaningful paths with Skills photos and Knowledge-only guided audio",()=>{
  assert.match(enhance,/version:"1\.2-demo"/);
  assert.match(enhance,/id:"demo-practical",title:"Practical evidence"/);
  assert.match(enhance,/id:"demo-knowledge",title:"Knowledge evidence"/);
  assert.match(enhance,/id:"demo-use-tool"[\s\S]*codes:\["S8"\]/);
  assert.match(enhance,/id:"demo-care-tool"[\s\S]*codes:\["S9"\]/);
  assert.match(enhance,/id:"demo-audio-reflection"[\s\S]*media:"audio"/);
  assert.match(enhance,/methods:\["audio"\]/);
  assert.match(enhance,/prompts:\[/);
  assert.match(enhance,/codes:\["K13"\]/);
  assert.equal((enhance.match(/bundle:"Demo practical evidence"/g)||[]).length,2);
  assert.equal((enhance.match(/bundle:"Demo knowledge evidence"/g)||[]).length,1);
  assert.doesNotMatch(enhance,/MutationObserver/);
});

test("demo audio is one real recording with step-by-step prompts like NVQ",()=>{
  assert.match(audio,/MediaRecorder/);
  assert.match(audio,/Start recording/);
  assert.match(audio,/Next prompt/);
  assert.match(audio,/Finish recording/);
  assert.match(audio,/markers\.push/);
  assert.match(audio,/saveExternalAudioEvidence/);
  assert.match(audio,/promptMarkers:meta\.markers/);
  assert.match(audio,/durationSeconds:meta\.durationSeconds/);
  assert.match(audio,/\^\[KB\]/);
  assert.doesNotMatch(audio,/Type instead/);
  assert.doesNotMatch(audio,/MutationObserver/);
});

test("walkthrough still uses the v218 full-screen Evia visual language",()=>{
  assert.match(walkthrough,/evia-tour218-layer/);
  assert.match(walkthrough,/class=\"evia-app is-ready evia-tour218\"/);
  assert.match(walkthrough,/class=\"evia-anchor evia-tour218-avatar\"/);
  assert.match(walkthrough,/evia-face expression-idle/);
  assert.match(walkthrough,/evia-tour218-dock/);
  assert.match(walkthrough,/arch\("Course",14,"course"\)/);
  assert.match(walkthrough,/data-tour219-team/);
  assert.match(walkthrough,/EviaInteractiveWalkthroughV218/);
  assert.doesNotMatch(walkthrough,/evia-walk217-phone/);
  assert.doesNotMatch(walkthrough,/Demo walkthrough/);
});

test("v219 slows Evia movement and leaves explanations on screen longer",()=>{
  assert.match(walkthrough,/duration=1150/);
  assert.match(walkthrough,/moveAvatar\(x,y,\.92,0,1100\)/);
  assert.match(walkthrough,/wait\(4500,sceneArches\)/);
  assert.match(walkthrough,/wait\(3600,next\)/);
  assert.match(walkthrough,/wait\(4300,/);
  assert.match(walkthrough,/wait\(4800,/);
  assert.match(walkthrough,/wait\(9000,/);
  assert.match(walkthrough,/wait\(13000,sceneCoursePrompt\)/);
  assert.match(walkthrough,/wait\(10000,sceneQr\)/);
  assert.match(walkthrough,/wait\(6000,sceneLearn\)/);
  assert.match(walkthrough,/wait\(6000,sceneTestPrompt\)/);
  assert.match(walkthrough,/wait\(7200,finish\)/);
});

test("closing Evia reuses the real face and eye construction instead of a small-eye icon",()=>{
  assert.match(walkthrough,/evia-tour219-finish-avatar/);
  assert.match(walkthrough,/--evia-stroke:2\.65px/);
  assert.match(walkthrough,/evia-face expression-smile/);
  assert.match(walkthrough,/evia-eyes/);
  assert.match(walkthrough,/evia-eye eye-left/);
  assert.match(walkthrough,/evia-eye eye-right/);
  assert.match(walkthrough,/width:78%;height:78%/);
  assert.match(walkthrough,/face\.className="evia-face expression-idle"/);
  assert.doesNotMatch(walkthrough,/evia-tour218-finish-eyes/);
});

test("walkthrough floats Evia between real-style areas and pauses for meaningful learner presses",()=>{
  assert.match(walkthrough,/function moveAvatar/);
  assert.match(walkthrough,/mx=\(from\.x\+x\)\/2-dy\/len\*arc/);
  assert.match(walkthrough,/cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(walkthrough,/expression-\$\{name\}/);
  assert.match(walkthrough,/evia-tour218-focus/);
  assert.match(walkthrough,/Hi, I’m Evia/);
  assert.match(walkthrough,/Press me/);
  assert.match(walkthrough,/data-tour219-collect/);
  assert.match(walkthrough,/data-tour219-knowledge/);
  assert.match(walkthrough,/data-tour219-startaudio/);
  assert.match(walkthrough,/data-tour219-nextprompt/);
  assert.match(walkthrough,/data-tour219-arch='course'/);
  assert.match(walkthrough,/data-tour219-arch='test'/);
  assert.match(walkthrough,/window\.addEventListener\("click",intercept,true\)/);
});

test("walkthrough demonstrates evidence sources, assessor exchange, OTJ and Test",()=>{
  assert.match(walkthrough,/Learner evidence/);
  assert.match(walkthrough,/Recorded Prior Learning/);
  assert.match(walkthrough,/Assessor Observation/);
  assert.match(walkthrough,/Witness testimony/);
  assert.match(walkthrough,/background:#7b3fc6/);
  assert.match(walkthrough,/background:#367fd0/);
  assert.match(walkthrough,/background:#d88b45/);
  assert.match(walkthrough,/Share QR code/);
  assert.match(walkthrough,/Receive QR code/);
  assert.match(walkthrough,/Off-the-job learning/);
  assert.match(walkthrough,/Mock Practical/);
  assert.match(walkthrough,/Maths Level 2/);
  assert.match(walkthrough,/English Level 2/);
  assert.doesNotMatch(walkthrough,/MutationObserver/);
});

test("demo still exposes Maths, English and one Practical while keeping other EPA practice limited",()=>{
  assert.match(demo,/data-arp-option=\"multiple-choice\"/);
  assert.match(demo,/data-arp-option=\"discussion\"/);
  assert.match(demo,/data-fs194-subject=\"maths\"/);
  assert.match(demo,/data-fs194-subject=\"english\"/);
  assert.match(demo,/data-arp-option=\"practical\"/);
  assert.match(enhance,/data-fs194-subject="maths"/);
  assert.match(enhance,/data-fs194-subject="english"/);
  assert.match(enhance,/display:flex!important/);
});

test("demo badge stays a small yellow circle and unavailable features explain themselves",()=>{
  assert.match(enhance,/\.evia-demo-badge-v215\{top:max\(3\.7rem/);
  assert.match(enhance,/width:2\.2rem!important/);
  assert.match(enhance,/border-radius:50%!important/);
  assert.match(enhance,/background:#efc33d!important/);
  assert.match(enhance,/Assessor QR sharing/);
  assert.match(enhance,/Receive assessor feedback/);
  assert.match(enhance,/Provider Course QR feature/);
  assert.match(enhance,/Licensed course packs/);
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
