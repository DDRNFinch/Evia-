import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const summary=fs.readFileSync("assets/evia-evidence-summary-v227.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

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

test("v227 loads and caches the evidence summary cleanup",()=>{
  assert.equal(String(manifest.version),"227");
  assert.match(index,/evia-app-version" content="227"/);
  assert.match(index,/evia-version-v227\.js\?v=227/);
  assert.match(index,/evia-evidence-summary-v227\.js\?v=227/);
  assert.match(index,/evia-updater\.js\?v=227/);
  assert.match(sw,/evia-shell-v227/);
  assert.match(sw,/evia-version-v227\.js/);
  assert.match(sw,/evia-evidence-summary-v227\.js/);
});
