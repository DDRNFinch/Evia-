import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const first=fs.readFileSync("assets/evia-first-run-v215.js","utf8");
const demo=fs.readFileSync("assets/evia-demo-mode-v215.js","utf8");
const enhance=fs.readFileSync("assets/evia-demo-enhancements-v216.js","utf8");
const audio=fs.readFileSync("assets/evia-demo-guided-audio-v217.js","utf8");
const walkthrough=fs.readFileSync("assets/evia-interactive-walkthrough-v221.js","utf8");
const lock=fs.readFileSync("assets/evia-profile-course-lock-v215.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("v221 keeps first-run activation and wires only the current walkthrough runtime",()=>{
  assert.equal(version,"221");
  assert.match(index,/evia-first-run-v215\.js\?v=215/);
  assert.match(index,/evia-demo-mode-v215\.js\?v=215/);
  assert.match(index,/evia-demo-enhancements-v216\.js\?v=217/);
  assert.match(index,/evia-demo-guided-audio-v217\.js\?v=217/);
  assert.match(index,/evia-interactive-walkthrough-v221\.js\?v=221/);
  assert.doesNotMatch(index,/evia-interactive-walkthrough-v218\.js/);
  assert.doesNotMatch(index,/evia-interactive-walkthrough-v219\.js/);
  assert.match(index,/evia-profile-course-lock-v215\.js\?v=215/);
  assert.match(index,/evia-version-v220\.js\?v=220/);
  assert.match(index,/evia-version-v221\.js\?v=221/);
  assert.match(index,/evia-updater\.js\?v=221/);
  assert.match(sw,/evia-shell-v221/);
  assert.match(sw,/evia-demo-guided-audio-v217\.js/);
  assert.match(sw,/evia-interactive-walkthrough-v221\.js/);
  assert.doesNotMatch(sw,/evia-interactive-walkthrough-v218\.js/);
  assert.doesNotMatch(sw,/evia-interactive-walkthrough-v219\.js/);
  assert.doesNotThrow(()=>new Function(enhance));
  assert.doesNotThrow(()=>new Function(audio));
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

test("walkthrough uses Evia's real home component structure instead of a separate imitation",()=>{
  assert.match(walkthrough,/class=\"evia-app selfobs is-ready\"/);
  assert.match(walkthrough,/class=\"self-top\"/);
  assert.match(walkthrough,/class=\"evia-anchor\"/);
  assert.match(walkthrough,/class=\"menu-stage\"/);
  assert.match(walkthrough,/class=\"self-panel\"/);
  assert.match(walkthrough,/class=\"progress-dock\"/);
  assert.match(walkthrough,/class=\"progress-arch\"/);
  assert.match(walkthrough,/class=\"option-row\"/);
  assert.equal((walkthrough.match(/data-tour221-evia/g)||[]).length,2);
});

test("walkthrough follows real course routes and never invents Practical or Theory route pages",()=>{
  assert.match(walkthrough,/What are you doing on site today\?/);
  assert.match(walkthrough,/Tools & Equipment/);
  assert.match(walkthrough,/Select and use hand tools/);
  assert.match(walkthrough,/Use a hand tool/);
  assert.match(walkthrough,/Explain your tool choice/);
  assert.doesNotMatch(walkthrough,/Practical evidence/);
  assert.doesNotMatch(walkthrough,/Knowledge evidence/);
  assert.doesNotMatch(walkthrough,/Theory/);
});

test("walkthrough is autoplay and does not require learner presses",()=>{
  assert.match(walkthrough,/wait\(4800,arches\)/);
  assert.match(walkthrough,/wait\(5200,route\)/);
  assert.match(walkthrough,/wait\(4300,skillChoice\)/);
  assert.match(walkthrough,/wait\(6800,/);
  assert.match(walkthrough,/wait\(6200,qrScene\)/);
  assert.match(walkthrough,/wait\(6700,returnHome\)/);
  assert.doesNotMatch(walkthrough,/Press me/);
  assert.doesNotMatch(walkthrough,/Press here/);
  assert.doesNotMatch(walkthrough,/handleClick/);
  assert.match(walkthrough,/data-tour221-skip/);
});

test("walkthrough guidance stays in one fixed text position without speech bubbles",()=>{
  assert.match(walkthrough,/evia-tour221-caption/);
  assert.match(walkthrough,/bottom:calc\(6\.05rem \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(walkthrough,/height:3\.2rem/);
  assert.match(walkthrough,/function setCaption/);
  assert.doesNotMatch(walkthrough,/bubble/i);
});

test("walkthrough demonstrates Photo, Video, Written and guided Audio evidence",()=>{
  assert.match(walkthrough,/Take photo/);
  assert.match(walkthrough,/Record video/);
  assert.match(walkthrough,/Write about it/);
  assert.match(walkthrough,/Record audio/);
  assert.match(walkthrough,/Photo evidence uses the camera/);
  assert.match(walkthrough,/Video is one recording/);
  assert.match(walkthrough,/Written evidence is a focused answer/);
  assert.match(walkthrough,/Audio is one real recording/);
  assert.match(walkthrough,/data-tour221-photo-text/);
  assert.match(walkthrough,/data-tour221-video-prompt/);
  assert.match(walkthrough,/data-tour221-written-text/);
  assert.match(walkthrough,/data-tour221-audio-prompt/);
});

test("walkthrough demonstrates evidence sources, assessor exchange, Learn and Test",()=>{
  assert.match(walkthrough,/Learner evidence/);
  assert.match(walkthrough,/Recorded Prior Learning/);
  assert.match(walkthrough,/Assessor Observation/);
  assert.match(walkthrough,/Witness testimony/);
  assert.match(walkthrough,/background:#7b3fc6/);
  assert.match(walkthrough,/background:#367fd0/);
  assert.match(walkthrough,/background:#d88b45/);
  assert.match(walkthrough,/Share with assessor/);
  assert.match(walkthrough,/Receive assessor feedback/);
  assert.match(walkthrough,/Off-the-job learning/);
  assert.match(walkthrough,/Mock Practical/);
  assert.match(walkthrough,/Maths Level 2/);
  assert.match(walkthrough,/English Level 2/);
  assert.doesNotMatch(walkthrough,/MutationObserver/);
});

test("closing Evia reuses the real Evia face construction",()=>{
  assert.match(walkthrough,/evia-tour221-finish-avatar/);
  assert.match(walkthrough,/evia-face expression-idle/);
  assert.match(walkthrough,/evia-eyes/);
  assert.match(walkthrough,/evia-eye eye-left/);
  assert.match(walkthrough,/evia-eye eye-right/);
  assert.match(walkthrough,/width:78%;height:78%/);
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
