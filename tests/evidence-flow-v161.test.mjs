import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const flow=fs.readFileSync("assets/evia-smooth-flow-v161.js","utf8");
const title=fs.readFileSync("assets/evia-course-title-v161.js","utf8");
const route=fs.readFileSync("assets/evia-evidence-route-v161.js","utf8");
const media=fs.readFileSync("assets/evia-evidence-media-v122.js","utf8");
const progress=fs.readFileSync("assets/evia-download-progress-v160.js","utf8");

test("v161 is wired into page and offline shell",()=>{
  assert.equal(String(manifest.version),"161");
  assert.match(index,/evia-app-version" content="161"/);
  assert.match(index,/evia-version-v161\.js\?v=161/);
  assert.match(index,/evia-course-title-v161\.js\?v=161/);
  assert.match(index,/evia-smooth-flow-v161\.js\?v=161/);
  assert.match(index,/evia-evidence-route-v161\.js\?v=161/);
  assert.match(sw,/evia-shell-v161/);
  assert.match(sw,/evia-smooth-flow-v161\.js/);
  assert.match(sw,/evia-evidence-route-v161\.js/);
});

test("course title cannot flash its unpatched long form",()=>{
  assert.match(index,/small:not\(\.evia-course-identity-v113\)\{visibility:hidden!important\}/);
  assert.match(title,/name:"Trowel",code:"6570-05"/);
  assert.match(title,/queueMicrotask\(patch\)/);
});

test("post-evidence markup is rendered, not stringified function source",()=>{
  assert.match(flow,/swap\(host,savedMarkup\(\)\)/);
  assert.match(flow,/swap\(host,learningMarkup\(\),h=>/);
  assert.doesNotMatch(flow,/swap\(host,savedMarkup\);/);
  assert.doesNotMatch(flow,/swap\(host,learningMarkup,h=>/);
  assert.match(flow,/data-post-save-hours/);
  assert.match(flow,/data-post-save-minutes/);
});

test("completed evidence opportunities reopen for additional evidence",()=>{
  assert.match(route,/window\.addEventListener\("click"/);
  assert.match(route,/\.self-panel \[data-opp\]/);
  assert.match(route,/isComplete\(oppId\)/);
  assert.match(route,/stageIndex:null/);
  assert.match(route,/EviaStagedEvidence/);
  assert.match(route,/openForOpp\(oppId\)/);
  assert.match(route,/stopImmediatePropagation/);
});

test("v160 thumbnail and measured download improvements remain",()=>{
  assert.match(media,/self-audio-tile-v160/);
  assert.match(media,/tile\.textContent="Audio"/);
  assert.match(progress,/IDBObjectStore\.prototype\.get/);
  assert.match(progress,/HTMLCanvasElement\.prototype\.toBlob/);
  assert.doesNotMatch(progress,/setInterval\(/);
});
