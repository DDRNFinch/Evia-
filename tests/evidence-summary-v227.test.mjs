import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const summary=fs.readFileSync("assets/evia-evidence-summary-v227.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("evidence preview keeps only the learner explanation detail",()=>{
  assert.match(summary,/label!=="Learner explanation"/);
  assert.match(summary,/detail\.remove\(\)/);
  assert.match(summary,/\[data-preview-details\]/);
});

test("PDF evidence summaries remove duplicated prompt metadata",()=>{
  assert.match(summary,/\(Evidence prompt\) Tj/);
  assert.match(summary,/\(Prompt timestamps\) Tj/);
  assert.match(summary,/\(Evidence stage:/);
  assert.match(summary,/\(Learner text\) Tj/);
  assert.match(summary,/\(Learner explanation\) Tj/);
  assert.match(summary,/simplifyPdfText/);
});

test("evidence summary cleanup remains loaded and cached in the current release",()=>{
  assert.match(index,new RegExp(`evia-app-version\\" content=\\"${version}\\"`));
  assert.match(index,new RegExp(`evia-version-v${version}\\.js\\?v=${version}`));
  assert.match(index,/evia-evidence-summary-v227\.js\?v=227/);
  assert.match(index,new RegExp(`evia-updater\\.js\\?v=${version}`));
  assert.match(sw,new RegExp(`evia-shell-v${version}`));
  assert.match(sw,/evia-evidence-summary-v227\.js/);
});
