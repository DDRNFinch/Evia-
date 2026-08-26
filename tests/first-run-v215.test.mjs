import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const first=fs.readFileSync("assets/evia-first-run-v215.js","utf8");
const demo=fs.readFileSync("assets/evia-demo-mode-v215.js","utf8");
const enhance=fs.readFileSync("assets/evia-demo-enhancements-v216.js","utf8");
const audio=fs.readFileSync("assets/evia-demo-guided-audio-v217.js","utf8");
const walkthrough=fs.readFileSync("assets/evia-interactive-walkthrough-v222.js","utf8");
const recovery=fs.readFileSync("assets/evia-startup-recovery-v225.js","utf8");
const lock=fs.readFileSync("assets/evia-profile-course-lock-v215.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("current release keeps the v222 walkthrough and v225 legacy course-map recovery",()=>{
  assert.match(index,/evia-first-run-v215\.js\?v=215/);
  assert.match(index,/evia-demo-mode-v215\.js\?v=215/);
  assert.match(index,/evia-demo-enhancements-v216\.js\?v=217/);
  assert.match(index,/evia-demo-guided-audio-v217\.js\?v=217/);
  assert.match(index,/evia-interactive-walkthrough-v222\.js\?v=222/);
  assert.match(index,/evia-startup-recovery-v225\.js\?v=225/);
  assert.doesNotMatch(index,/evia-startup-recovery-v224\.js\?v=224/);
  assert.doesNotMatch(index,/evia-interactive-walkthrough-v218\.js/);
  assert.doesNotMatch(index,/evia-interactive-walkthrough-v219\.js/);
  assert.doesNotMatch(index,/evia-interactive-walkthrough-v221\.js/);
  assert.match(index,/evia-profile-course-lock-v215\.js\?v=215/);
  assert.match(index,/evia-version-v222\.js\?v=222/);
  assert.match(index,/evia-version-v224\.js\?v=224/);
  assert.match(index,/evia-version-v225\.js\?v=225/);
  assert.match(index,/evia-version-v226\.js\?v=226/);
  assert.match(index,/evia-version-v227\.js\?v=227/);
  assert.match(index,/evia-version-v228\.js\?v=228/);
  assert.match(index,new RegExp(`evia-version-v${version}\\.js\\?v=${version}`));
  assert.match(index,new RegExp(`evia-updater\\.js\\?v=${version}`));
  assert.match(sw,new RegExp(`evia-shell-v${version}`));
  assert.match(sw,/evia-demo-guided-audio-v217\.js/);
  assert.match(sw,/evia-interactive-walkthrough-v222\.js/);
  assert.match(sw,/evia-startup-recovery-v225\.js/);
  assert.doesNotMatch(sw,/evia-startup-recovery-v224\.js/);
  assert.match(sw,/evia-version-v225\.js/);
  assert.match(sw,/evia-version-v226\.js/);
  assert.match(sw,/evia-version-v227\.js/);
  assert.match(sw,/evia-version-v228\.js/);
  assert.match(sw,new RegExp(`evia-version-v${version}\\.js`));
  assert.match(sw,/course-packs\/Bricklayer_ST0095_v1\.2\.nisi/);
  assert.match(sw,/course-packs\/Carpentry_Joinery_ST0264_v1\.4\.nisi/);
  assert.doesNotMatch(sw,/evia-interactive-walkthrough-v218\.js/);
  assert.doesNotMatch(sw,/evia-interactive-walkthrough-v219\.js/);
  assert.doesNotMatch(sw,/evia-interactive-walkthrough-v221\.js/);
  assert.doesNotThrow(()=>new Function(enhance));
  assert.doesNotThrow(()=>new Function(audio));
  assert.doesNotThrow(()=>new Function(walkthrough));
  assert.doesNotThrow(()=>new Function(recovery));
});

test("startup recovery repairs Demo, no-course and legacy built-in course maps without clearing learner storage",()=>{
  assert.match(recovery,/function demoIntent\(\)/);
  assert.match(recovery,/function repairDemo\(\)/);
  assert.match(recovery,/packs\.install\(DEMO_PACK\)/);
  assert.match(recovery,/packs\.activate\(DEMO_ID\)/);
  assert.match(recovery,/function installCourseMapRecovery\(\)/);
  assert.match(recovery,/evia-no-course-data-/);
  assert.match(recovery,/evia-site-data/);
  assert.match(recovery,/evia-carpentry-site-data/);
  assert.match(recovery,/evia-carpentry-joiner-data/);
  assert.match(recovery,/Bricklayer_ST0095_v1\.2\.nisi/);
  assert.match(recovery,/Carpentry_Joinery_ST0264_v1\.4\.nisi/);
  assert.match(recovery,/pathway:"site-carpenter"/);
  assert.match(recovery,/pathway:"architectural-joiner"/);
  assert.match(recovery,/codes:\["SETUP"\]/);
  assert.doesNotMatch(recovery,/localStorage\.clear/);
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
  assert.equal((walkthrough.match(/data-tour222-evia/g)||[]).length,2);
});

test("walkthrough follows real course routes and never invents Practical or Theory route pages",()=>{
  assert.match(walkthrough,/What are you doing on site today\?/);
  assert.match(walkthrough,/Tools & Equipment/);
  assert.match(walkthrough,/Select and use hand tools/);
  assert.match(walkthrough,/Use a hand tool/);
  assert.match(walkthrough,/Explain your tool choice/);
  assert.doesNotMatch(walkthrough,/title\("Practical evidence"/);
  assert.doesNotMatch(walkthrough,/title\("Knowledge evidence"/);
  assert.doesNotMatch(walkthrough,/title\("Theory"/);
});

test("walkthrough uses a fixed speech bubble with a next arrow and fades between parts",()=>{
  assert.match(walkthrough,/evia-tour222-bubble/);
  assert.match(walkthrough,/evia-tour222-bubble:after/);
  assert.match(walkthrough,/data-tour222-next/);
  assert.match(walkthrough,/aria-label="Next">›/);
  assert.match(walkthrough,/function next\(\)/);
  assert.match(walkthrough,/function fadeSwap/);
  assert.match(walkthrough,/evia-tour222-fade/);
  assert.match(walkthrough,/bottom:calc\(7\.05rem \+ env\(safe-area-inset-bottom\)\)/);
  assert.doesNotMatch(walkthrough,/evia-tour221-caption/);
  assert.match(walkthrough,/data-tour222-skip/);
});

test("walkthrough restores the round yellow Evia QR button between the progress arches",()=>{
  assert.match(walkthrough,/class="evia-tour222-qr"/);
  assert.match(walkthrough,/background:#efc33d/);
  assert.match(walkthrough,/evia-tour222-qr-face/);
  assert.match(walkthrough,/evia-tour222-qr-eye/);
  assert.match(walkthrough,/data-tour222-qr/);
  assert.match(walkthrough,/yellow Evia QR button/);
  assert.match(walkthrough,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) 3\.55rem minmax\(0,1fr\) minmax\(0,1fr\)/);
});

test("walkthrough demonstrates Photo, Video, Written and guided Audio evidence",()=>{
  assert.match(walkthrough,/Take photo/);
  assert.match(walkthrough,/Record video/);
  assert.match(walkthrough,/Write about it/);
  assert.match(walkthrough,/Record audio/);
  assert.match(walkthrough,/Photo evidence shows the camera prompt/);
  assert.match(walkthrough,/Video is <b>one recording<\/b>/);
  assert.match(walkthrough,/Written evidence is a <b>focused answer<\/b>/);
  assert.match(walkthrough,/Audio is <b>one real recording<\/b>/);
  assert.match(walkthrough,/data-tour222-photo-text/);
  assert.match(walkthrough,/data-tour222-video-prompt/);
  assert.match(walkthrough,/data-tour222-written-text/);
  assert.match(walkthrough,/data-tour222-audio-prompt/);
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
  assert.match(walkthrough,/evia-tour222-finish-avatar/);
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
