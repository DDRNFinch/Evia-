import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const snapshots=readFileSync(new URL('../assets/evia-review-snapshots-v236.js',import.meta.url),'utf8');
const broken235=readFileSync(new URL('../assets/evia-review-snapshots-v235.js',import.meta.url),'utf8');
const hook=readFileSync(new URL('../assets/evia-review-snapshot-hook-v235.js',import.meta.url),'utf8');
const coach=readFileSync(new URL('../assets/evia-coach-v231.js',import.meta.url),'utf8');
const receiver=readFileSync(new URL('../assets/evia-milos-return-v234.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/evia-version-v236.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const update=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('review snapshot capture still happens before the completed review write closes the Coach period',()=>{
  const captureAt=hook.indexOf('captureFrom(value)');
  const writeAt=hook.indexOf('previous.call(this,key,value)');
  assert.ok(captureAt>=0&&writeAt>captureAt,'snapshot must be captured before the review write');
  assert.match(hook,/KEY="evia-mini-milos-visits-v2"/);
  assert.match(hook,/EviaReviewSnapshots\?\.capture\?\.\(review\)/);
  assert.match(coach,/evia:milos-review-targets-replaced/);
  assert.match(coach,/closePeriod\(e\.detail\?\.reviewId/);
  assert.match(receiver,/write\(VISITS_KEY,items\.slice\(-100\)\)/);
});

test('v236 preserves Review Snapshot data and bounded history',()=>{
  assert.match(snapshots,/KEY="evia-pulse-review-snapshots-v1"/);
  assert.match(snapshots,/window\.EviaCoachSnapshot\?\.current\?\.\(\)/);
  assert.match(snapshots,/reviewId:/);
  assert.match(snapshots,/reviewDate:/);
  assert.match(snapshots,/nextReviewDate:/);
  assert.match(snapshots,/targets:reviewTargets\(payload\)/);
  assert.match(snapshots,/position:\{course:/);
  assert.match(snapshots,/learning:learn/);
  assert.match(snapshots,/confidence:conf/);
  assert.match(snapshots,/wellbeing:wellbeingPosition\(coach\)/);
  assert.match(snapshots,/period:coach/);
  assert.match(snapshots,/slice\(-24\)/);
});

test('v236 removes the v235 self-triggering MutationObserver that froze Pulse',()=>{
  assert.match(broken235,/new MutationObserver\(\(\)=>patchPulse\(\)\)/);
  assert.match(broken235,/button\.innerHTML=/);
  assert.doesNotMatch(snapshots,/new MutationObserver/);
  assert.match(snapshots,/document\.addEventListener\("click",schedulePatch,true\)/);
  assert.match(snapshots,/if\(small&&small\.textContent!==label\)small\.textContent=label/);
  assert.match(snapshots,/if\(!b\)\{/);
});

test('v236 keeps permanent Review history inside Evia Pulse without continuous DOM rewrites',()=>{
  assert.match(snapshots,/dataset\.pulseReviewHistory="1"/);
  assert.match(snapshots,/Review history/);
  assert.match(snapshots,/Review snapshot/);
  assert.match(snapshots,/Review summary/);
  assert.match(snapshots,/Evia activity/);
  assert.match(snapshots,/EPA practice/);
  assert.match(snapshots,/Confidence/);
  assert.match(snapshots,/Wellbeing/);
});

test('v236 snapshot layer does not add learner identity, contact details, media or signatures',()=>{
  const combined=snapshots+'\n'+hook;
  assert.doesNotMatch(combined,/learnerName|fullName|evia-full-name|emailAddress|phoneNumber|postalAddress|signature|mediaBlob|videoBlob|audioBlob/i);
});

test('v236 release and offline shell use only the non-looping snapshot renderer',()=>{
  assert.equal(String(update.version),'236');
  assert.match(loader,/EviaAppVersion=VERSION/);
  assert.match(loader,/VERSION=236/);
  assert.match(index,/evia-app-version" content="236/);
  assert.match(index,/evia-version-v236\.js\?v=236/);
  assert.match(index,/evia-review-snapshots-v236\.js\?v=236/);
  assert.doesNotMatch(index,/evia-review-snapshots-v235\.js/);
  assert.match(index,/evia-review-snapshot-hook-v235\.js\?v=235/);
  assert.match(index,/evia-milos-return-v234\.js\?v=234/);
  assert.ok(index.indexOf('evia-review-snapshots-v236.js')<index.indexOf('evia-milos-return-v234.js'));
  assert.match(sw,/evia-shell-v236/);
  assert.match(sw,/evia-version-v236\.js/);
  assert.match(sw,/evia-review-snapshots-v236\.js/);
  assert.doesNotMatch(sw,/evia-review-snapshots-v235\.js/);
});
