import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const snapshots=readFileSync(new URL('../assets/evia-review-snapshots-v235.js',import.meta.url),'utf8');
const hook=readFileSync(new URL('../assets/evia-review-snapshot-hook-v235.js',import.meta.url),'utf8');
const coach=readFileSync(new URL('../assets/evia-coach-v231.js',import.meta.url),'utf8');
const receiver=readFileSync(new URL('../assets/evia-milos-return-v234.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/evia-version-v235.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const update=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v235 captures the old Coach period before the completed review storage write triggers closure',()=>{
  const captureAt=hook.indexOf('captureFrom(value)');
  const writeAt=hook.indexOf('previous.call(this,key,value)');
  assert.ok(captureAt>=0&&writeAt>captureAt,'snapshot must be captured before the review write');
  assert.match(hook,/KEY="evia-mini-milos-visits-v2"/);
  assert.match(hook,/EviaReviewSnapshots\?\.capture\?\.\(review\)/);
  assert.match(coach,/evia:milos-review-targets-replaced/);
  assert.match(coach,/closePeriod\(e\.detail\?\.reviewId/);
  assert.match(receiver,/write\(VISITS_KEY,items\.slice\(-100\)\)/);
});

test('v235 snapshot stores review metadata and the learner position known locally to Evia',()=>{
  assert.match(snapshots,/SNAPSHOT_KEY="evia-pulse-review-snapshots-v1"/);
  assert.match(snapshots,/window\.EviaCoachSnapshot\?\.current\?\.\(\)/);
  assert.match(snapshots,/reviewId:/);
  assert.match(snapshots,/reviewDate:/);
  assert.match(snapshots,/summary:/);
  assert.match(snapshots,/nextReviewDate:/);
  assert.match(snapshots,/targets:reviewTargets\(payload\)/);
  assert.match(snapshots,/position:\{course:/);
  assert.match(snapshots,/learning:learn/);
  assert.match(snapshots,/evidence:\{\.\.\.ev,witness:/);
  assert.match(snapshots,/confidence:conf/);
  assert.match(snapshots,/wellbeing:wellbeingPosition\(coach\)/);
  assert.match(snapshots,/period:coach/);
  assert.match(snapshots,/slice\(-24\)/);
});

test('v235 exposes permanent Review history inside Evia Pulse',()=>{
  assert.match(snapshots,/dataset\.pulseReviewHistory="1"/);
  assert.match(snapshots,/Review history/);
  assert.match(snapshots,/Review snapshot/);
  assert.match(snapshots,/Review summary/);
  assert.match(snapshots,/Evia activity/);
  assert.match(snapshots,/EPA practice/);
  assert.match(snapshots,/Confidence/);
  assert.match(snapshots,/Wellbeing/);
});

test('v235 snapshot layer does not add learner identity, contact details, media or signatures',()=>{
  const combined=snapshots+'\n'+hook;
  assert.doesNotMatch(combined,/learnerName|fullName|evia-full-name|emailAddress|phoneNumber|postalAddress|signature|mediaBlob|videoBlob|audioBlob/i);
});

test('v235 release and offline shell load the snapshot layer after the existing v234 return receiver',()=>{
  assert.equal(String(update.version),'235');
  assert.match(loader,/EviaAppVersion=235/);
  assert.match(index,/evia-app-version" content="235/);
  assert.match(index,/evia-version-v235\.js\?v=235/);
  assert.match(index,/evia-review-snapshots-v235\.js\?v=235/);
  assert.match(index,/evia-review-snapshot-hook-v235\.js\?v=235/);
  assert.match(index,/evia-milos-return-v234\.js\?v=234/);
  assert.ok(index.indexOf('evia-review-snapshots-v235.js')<index.indexOf('evia-milos-return-v234.js'));
  assert.ok(index.indexOf('evia-review-snapshot-hook-v235.js')<index.indexOf('evia-milos-return-v234.js'));
  assert.match(sw,/evia-shell-v235/);
  assert.match(sw,/evia-version-v235\.js/);
  assert.match(sw,/evia-review-snapshots-v235\.js/);
  assert.match(sw,/evia-review-snapshot-hook-v235\.js/);
});
