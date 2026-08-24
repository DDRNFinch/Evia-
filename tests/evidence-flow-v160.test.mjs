import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const flow=fs.readFileSync("assets/evia-smooth-flow-v160.js","utf8");
const title=fs.readFileSync("assets/evia-course-title-v160.js","utf8");
const media=fs.readFileSync("assets/evia-evidence-media-v122.js","utf8");
const progress=fs.readFileSync("assets/evia-download-progress-v160.js","utf8");
const stageSave=fs.readFileSync("assets/evia-stage-save-v139.js","utf8");
const pdf=fs.readFileSync("assets/evia-compact-export.js","utf8");

test("v160 is wired into the page and offline shell",()=>{
  assert.equal(String(manifest.version),"160");
  assert.match(index,/evia-app-version" content="160"/);
  assert.match(index,/evia-version-v160\.js\?v=160/);
  assert.match(index,/evia-course-title-v160\.js\?v=160/);
  assert.match(index,/evia-smooth-flow-v160\.js\?v=160/);
  assert.match(index,/evia-download-progress-v160\.js\?v=160/);
  assert.match(index,/evia-evidence-media-v122\.js\?v=160/);
  assert.match(sw,/evia-shell-v160/);
  assert.match(sw,/evia-smooth-flow-v160\.js/);
  assert.match(sw,/evia-course-title-v160\.js/);
  assert.match(sw,/evia-download-progress-v160\.js/);
});

test("course identity stays concise and two-line",()=>{
  assert.match(title,/name:"Trowel",code:"6570-05"/);
  assert.match(title,/evia-course-name-v113/);
  assert.match(title,/evia-course-code-v113/);
  assert.match(title,/MutationObserver\(schedule\)/);
});

test("post-evidence flow has one OTJ or GLH learning form with time",()=>{
  assert.match(flow,/What did you learn\?/);
  assert.match(flow,/data-post-save-hours/);
  assert.match(flow,/data-post-save-minutes/);
  assert.match(flow,/window\.EviaPostEvidenceOTJ\?\.record/);
  assert.match(flow,/course\(\)\?\.courseType==="nvq"/);
  assert.match(flow,/evia-post-evidence-otj-last-v1/);
  assert.match(flow,/evia-post-otj-v114/);
  assert.doesNotMatch(flow,/Did you learn anything new during this task/);
  assert.match(flow,/await wait\(2000\)/);
});

test("staged evidence still hands successful saves to the single completion owner",()=>{
  assert.match(stageSave,/evia:evidence-saved/);
  assert.match(stageSave,/window\.EviaSmoothFlow\?\.start/);
});

test("evidence page restores visual thumbnails and an Audio square",()=>{
  assert.match(media,/self-entry-thumb-v122/);
  assert.match(media,/self-audio-tile-v160/);
  assert.match(media,/tile\.textContent="Audio"/);
  assert.match(media,/MutationObserver\(refresh\)/);
});

test("NVQ pack progress is measured from real preparation operations",()=>{
  assert.match(progress,/IDBObjectStore\.prototype\.get/);
  assert.match(progress,/HTMLCanvasElement\.prototype\.toBlob/);
  assert.match(progress,/Blob\.prototype\.arrayBuffer/);
  assert.match(progress,/data-nvq-pack-download/);
  assert.match(progress,/Evia-NVQ-Evidence-Packs-/);
  assert.doesNotMatch(progress,/setInterval\(/);
});

test("video prompt timestamp list remains in the evidence PDF",()=>{
  assert.match(pdf,/videoPromptMarkers/);
  assert.match(pdf,/function videoMarkers\(e\)/);
  assert.match(pdf,/Video prompt timestamps/);
});
