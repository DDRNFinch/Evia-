import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const live=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const state=fs.readFileSync("assets/evia-evidence-state-v204.js","utf8");

test("v209 keeps the original pale tick on evidence task rows and no generated dark duplicates",()=>{
  assert.match(index,/evia-app-version" content="209"/);
  assert.match(index,/evia-evidence-state-v204\.js\?v=209/);
  assert.equal(fs.existsSync("assets/evia-evidence-state-v203.js"),false);
  assert.match(live,/<b>\$\{dots\(n\)\}<\/b>/);
  assert.match(state,/function clearOpportunityExtras\(\)/);
  assert.match(state,/:scope > span,:scope > b\[class\]/);
  assert.doesNotMatch(state,/addOppMark|evia-opportunity-source-v204/);
});

test("v209 core KSB grid creates no blank status circles",()=>{
  assert.doesNotMatch(live,/<button data-code=\"\$\{c\}\"><b>\$\{c\}<\/b><span>/);
  assert.match(live,/<button data-code=\"\$\{c\}\"><b>\$\{c\}<\/b><\/button>/);
});

test("v209 preserves all four coloured KSB evidence-source ticks",()=>{
  assert.match(state,/\[\["learner",learner/);
  assert.match(state,/\["rpl",rpl/);
  assert.match(state,/\["milos",milos/);
  assert.match(state,/\["witness",witness/);
  assert.match(state,/background:#efc33d/);
  assert.match(state,/background:#7b3fc6/);
  assert.match(state,/background:#367fd0/);
  assert.match(state,/background:#d88b45/);
  assert.doesNotMatch(state,/MutationObserver/);
});
