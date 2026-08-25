import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const live=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const state=fs.readFileSync("assets/evia-evidence-state-v204.js","utf8");

test("v204 keeps only the original pale tick on evidence task rows",()=>{
  assert.match(index,/evia-app-version" content="204"/);
  assert.match(index,/evia-evidence-state-v204\.js\?v=204/);
  assert.doesNotMatch(index,/evia-evidence-state-v203\.js/);
  assert.match(live,/<b>\$\{dots\(n\)\}<\/b>/);
  assert.match(state,/function clearOpportunityExtras\(\)/);
  assert.match(state,/:scope > span/);
  assert.doesNotMatch(state,/addOppMark|evia-opportunity-source-v204/);
});

test("v204 preserves all four coloured KSB evidence-source ticks",()=>{
  for(const source of ["learner","rpl","milos","witness"]){
    assert.match(state,new RegExp(`evia-ksb-marker-v204\\.${source}`));
  }
  assert.match(state,/background:#efc33d/);
  assert.match(state,/background:#7b3fc6/);
  assert.match(state,/background:#367fd0/);
  assert.match(state,/background:#d88b45/);
  assert.doesNotMatch(state,/MutationObserver/);
});
