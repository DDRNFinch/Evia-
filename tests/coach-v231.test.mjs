import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const coach=readFileSync(new URL('../assets/evia-coach-v231.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v231 records a local review-period coaching ledger',()=>{
  assert.match(coach,/evia-coach-ledger-v1/);
  assert.match(coach,/SESSION_GAP=30\*60\*1000/);
  assert.match(coach,/sessions/);
  assert.match(coach,/active|days|weeks/i);
  assert.match(coach,/evia:milos-review-targets-replaced/);
  assert.match(coach,/closePeriod/);
});

test('Coach Snapshot covers the review evidence Milos needs',()=>{
  for(const token of ['evia-selfobs-live-v3','evia-otj-entries','evia-glh-entries','evia-arp-mocks-v1','evia-arp-discussion-v1','evia-arp-practical-v1','evia-functional-skills-mcq-v194','evia-pulse-confidence-v1','evia-pulse-wellbeing-v1','evia-targets-v1']) assert.match(coach,new RegExp(token));
  assert.match(coach,/payload\.co=current\(\)/);
  assert.match(coach,/wi:externalSince/);
  assert.match(coach,/as:externalSince/);
});

test('Coach Snapshot does not export learner identity or evidence media',()=>{
  assert.doesNotMatch(coach,/evia-full-name/);
  assert.doesNotMatch(coach,/email|telephone|postcode|dateofbirth|nationalinsurance/i);
  assert.doesNotMatch(coach,/getBlob|indexedDB\.open/);
  assert.match(coach,/No learner name, contact details, media files or signatures/);
});

test('v231 is loaded and cached in the current Evia release',()=>{
  assert.equal(String(manifest.version),'231');
  assert.match(index,/evia-version-v231\.js\?v=231/);
  assert.match(index,/evia-coach-v231\.js\?v=231/);
  assert.match(index,/evia-updater\.js\?v=231/);
  assert.match(sw,/evia-shell-v231/);
  assert.match(sw,/assets\/evia-coach-v231\.js/);
  assert.match(sw,/assets\/evia-version-v231\.js/);
});
