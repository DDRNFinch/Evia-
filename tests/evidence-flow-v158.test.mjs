import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const flow=fs.readFileSync("assets/evia-smooth-flow-v158.js","utf8");
const pdf=fs.readFileSync("assets/evia-compact-export.js","utf8");

test("v158 is wired into the page and offline shell",()=>{
  assert.equal(String(manifest.version),"158");
  assert.match(index,/evia-app-version" content="158"/);
  assert.match(index,/evia-version-v158\.js\?v=158/);
  assert.match(index,/evia-smooth-flow-v158\.js\?v=158/);
  assert.match(index,/evia-compact-export\.js\?v=158/);
  assert.match(index,/evia-updater\.js\?v=158/);
  assert.match(sw,/evia-shell-v158/);
  assert.match(sw,/\.\/assets\/evia-smooth-flow-v158\.js/);
  assert.match(sw,/\.\/assets\/evia-version-v158\.js/);
});

test("post-evidence sequence is saved screen, two seconds, learning reflection, home",()=>{
  assert.match(flow,/Evidence saved/);
  assert.match(flow,/await wait\(2000\)/);
  assert.match(flow,/What did you learn\?/);
  assert.match(flow,/learningReflection=text/);
  assert.match(flow,/learningReflectionAt=Date\.now\(\)/);
  assert.match(flow,/await goHome\(host\)/);
  assert.match(flow,/fadeOut\(/);
  assert.match(flow,/fadeIn\(/);
});

test("navigation fades all page buttons while recording controls stay instant",()=>{
  assert.match(flow,/event\.target\?\.closest\?\.\("button"\)/);
  assert.match(flow,/transitionHost\(button\)/);
  assert.match(flow,/evia-tools-body/);
  assert.match(flow,/self-panel/);
  assert.match(flow,/data-start-video/);
  assert.match(flow,/data-next-prompt/);
  assert.match(flow,/data-start-audio/);
  assert.match(flow,/data-action='record'/);
});

test("standard evidence PDF lists guided video prompt timestamps",()=>{
  assert.match(pdf,/videoPromptMarkers/);
  assert.match(pdf,/function videoMarkers\(e\)/);
  assert.match(pdf,/Video prompt timestamps/);
  assert.match(pdf,/String\(Math\.floor\(\(Number\(m\.seconds\)\|\|0\)\/60\)\)\.padStart\(2,"0"\)/);
  assert.match(pdf,/function pdfAnswer\(e\)/);
});
