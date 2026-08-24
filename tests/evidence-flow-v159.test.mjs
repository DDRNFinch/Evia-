import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const flow=fs.readFileSync("assets/evia-smooth-flow-v159.js","utf8");
const stageSave=fs.readFileSync("assets/evia-stage-save-v139.js","utf8");
const core=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const pdf=fs.readFileSync("assets/evia-compact-export.js","utf8");

test("v159 is wired into the page and offline shell",()=>{
  assert.equal(String(manifest.version),"159");
  assert.match(index,/evia-app-version" content="159"/);
  assert.match(index,/evia-version-v159\.js\?v=159/);
  assert.match(index,/evia-smooth-flow-v159\.js\?v=159/);
  assert.match(index,/evia-stage-save-v139\.js\?v=159/);
  assert.match(index,/evia-updater\.js\?v=159/);
  assert.match(sw,/evia-shell-v159/);
  assert.match(sw,/\.\/assets\/evia-smooth-flow-v159\.js/);
  assert.match(sw,/\.\/assets\/evia-version-v159\.js/);
});

test("v159 removes the global button click interceptor that caused double fades",()=>{
  assert.doesNotMatch(flow,/event\.target\?\.closest\?\.\("button"\)/);
  assert.doesNotMatch(flow,/stopImmediatePropagation/);
  assert.doesNotMatch(flow,/transitionHost\(button\)/);
  assert.doesNotMatch(flow,/button\.click\(\)/);
  assert.match(core,/MENU_FADE_VIEWS/);
  assert.match(core,/function render\(transition=false\)/);
});

test("staged evidence hands successful saves directly to one completion owner",()=>{
  assert.match(stageSave,/evia:evidence-saved/);
  assert.match(stageSave,/window\.EviaSmoothFlow\?\.start/);
  assert.match(stageSave,/localStorage\.removeItem\(ROUTE\)/);
});

test("post-evidence sequence remains saved screen, two seconds, reflection, home",()=>{
  assert.match(flow,/Evidence saved/);
  assert.match(flow,/await wait\(2000\)/);
  assert.match(flow,/What did you learn\?/);
  assert.match(flow,/learningReflection=text/);
  assert.match(flow,/await goHome\(host\)/);
  assert.match(flow,/evia:evidence-saved/);
});

test("standard evidence PDF still lists guided video prompt timestamps",()=>{
  assert.match(pdf,/videoPromptMarkers/);
  assert.match(pdf,/function videoMarkers\(e\)/);
  assert.match(pdf,/Video prompt timestamps/);
});
