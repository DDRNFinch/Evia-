import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const core=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const flow=fs.readFileSync("assets/evia-smooth-flow-v161.js","utf8");
const route=fs.readFileSync("assets/evia-evidence-route-v161.js","utf8");
const media=fs.readFileSync("assets/evia-evidence-media-v122.js","utf8");
const progress=fs.readFileSync("assets/evia-download-progress-v160.js","utf8");

test("v162 is wired into page and offline shell",()=>{
  assert.equal(String(manifest.version),"162");
  assert.match(index,/evia-app-version" content="162"/);
  assert.match(index,/evia-version-v162\.js\?v=162/);
  assert.match(index,/evia-selfobs-live\.js\?v=162/);
  assert.match(index,/evia-updater\.js\?v=162/);
  assert.match(sw,/evia-shell-v162/);
  assert.match(sw,/evia-version-v162\.js/);
});

test("homepage course identity is rendered by the core, not a watcher patch",()=>{
  assert.match(core,/function courseIdentity\(\)/);
  assert.match(core,/return\{name:"Trowel",code:"6570-05"\}/);
  assert.match(core,/class="evia-course-identity-v113"/);
  assert.match(core,/class="evia-course-name-v113"/);
  assert.match(core,/class="evia-course-code-v113"/);
  assert.doesNotMatch(index,/evia-course-title-v\d+\.js/);
  assert.doesNotMatch(sw,/evia-course-title-v\d+\.js/);
  assert.equal(fs.existsSync("assets/evia-course-title-v161.js"),false);
});

test("final arch labels are rendered directly by the core",()=>{
  assert.match(core,/ARCH_LABELS=\{TOC:"Time",KSB:"Course",AC:"Course",OTJ:"Learn",GLH:"Learn",EPA:"Test",ARP:"Test",Units:"Test"\}/);
  assert.match(core,/const shown=ARCH_LABELS\[label\]\|\|label/);
  assert.match(core,/class="arch-label">\$\{shown\}/);
  assert.doesNotMatch(index,/evia-arch-labels-v\d+\.js/);
  assert.doesNotMatch(sw,/evia-arch-labels-v\d+\.js/);
  assert.equal(fs.existsSync("assets/evia-arch-labels-v154.js"),false);
});

test("post-evidence flow still renders its intended UI",()=>{
  assert.match(flow,/swap\(host,savedMarkup\(\)\)/);
  assert.match(flow,/swap\(host,learningMarkup\(\),h=>/);
  assert.doesNotMatch(flow,/swap\(host,savedMarkup\);/);
  assert.doesNotMatch(flow,/swap\(host,learningMarkup,h=>/);
  assert.match(flow,/data-post-save-hours/);
  assert.match(flow,/data-post-save-minutes/);
});

test("completed evidence opportunities remain reopenable",()=>{
  assert.match(route,/window\.addEventListener\("click"/);
  assert.match(route,/\.self-panel \[data-opp\]/);
  assert.match(route,/isComplete\(oppId\)/);
  assert.match(route,/stageIndex:null/);
  assert.match(route,/EviaStagedEvidence/);
  assert.match(route,/openForOpp\(oppId\)/);
});

test("thumbnail and measured download improvements remain",()=>{
  assert.match(media,/self-audio-tile-v160/);
  assert.match(media,/tile\.textContent="Audio"/);
  assert.match(progress,/IDBObjectStore\.prototype\.get/);
  assert.match(progress,/HTMLCanvasElement\.prototype\.toBlob/);
  assert.doesNotMatch(progress,/setInterval\(/);
});
