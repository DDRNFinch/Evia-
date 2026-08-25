import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const sync=fs.readFileSync("assets/evia-option-source-sync-v214.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

test("v214 mirrors external KSB source status onto linked Evia options",()=>{
  assert.equal(String(manifest.version),"214");
  assert.match(index,/evia-app-version\" content=\"214/);
  assert.match(index,/evia-option-source-sync-v214\.js\?v=214/);
  assert.match(index,/evia-version-v214\.js\?v=214/);
  assert.match(index,/evia-updater\.js\?v=214/);
  assert.match(sw,/evia-shell-v214/);
  assert.match(sw,/evia-option-source-sync-v214\.js/);
  assert.match(sw,/evia-version-v214\.js/);
  assert.match(sync,/button\[data-opp\]/);
  assert.match(sync,/o\.codes/);
  assert.match(sync,/api\.rpl/);
  assert.match(sync,/api\.milos/);
  assert.match(sync,/api\.witness/);
  assert.match(sync,/Recorded Prior Learning/);
  assert.match(sync,/Assessor Observation/);
  assert.match(sync,/Witness testimony/);
  assert.match(sync,/background:#7b3fc6/);
  assert.match(sync,/background:#367fd0/);
  assert.match(sync,/background:#d88b45/);
  assert.doesNotMatch(sync,/background:#efc33d/);
});

test("option source sync uses the same course-map files as the Evia evidence flow",()=>{
  assert.match(sync,/const prefix=ctx\(\)\?\.dataPrefix\|\|\"evia-site-data\"/);
  assert.match(sync,/\[1,2,3\]\.map/);
  assert.match(sync,/SITE_DATA_/);
  assert.match(sync,/codeMap\.get\(String\(btn\.dataset\.opp/);
});
