import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const receiver=readFileSync(new URL('../assets/evia-milos-return-v234.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/evia-version-v234.js',import.meta.url),'utf8');
const sync=readFileSync(new URL('../assets/evia-milos-review-sync-v97.js',import.meta.url),'utf8');
const next=readFileSync(new URL('../assets/evia-next-visit-v95.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const update=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v234 accepts the exact Milos VISIT:2 review QR produced by Milos',()=>{
  assert.match(receiver,/NISI:MILOS:VISIT:2:/);
  assert.match(receiver,/\^NISI:MILOS:VISIT:2:/);
  assert.match(receiver,/Number\(value\.v\)!==2/);
  assert.match(receiver,/String\(value\.t\|\|""\)\.toLowerCase\(\)!=="review"/);
});

test('v234 validates the anonymous learner reference and active course before importing',()=>{
  assert.match(receiver,/evia-mini-milos-learner-ref-v1/);
  assert.match(receiver,/This Milos QR code belongs to a different learner/);
  assert.match(receiver,/This Milos QR code is for a different course/);
  assert.match(receiver,/st0171-v1-1/);
  assert.match(receiver,/packFamilyId/);
});

test('v234 stores reviews where existing next-review and target sync already listens',()=>{
  assert.match(receiver,/VISITS_KEY="evia-mini-milos-visits-v2"/);
  assert.match(receiver,/write\(VISITS_KEY,items\.slice\(-100\)\)/);
  assert.match(receiver,/EviaMilosReviewSync\?\.sync\?\.\(\)/);
  assert.match(receiver,/EviaNextVisit\?\.sync\?\.\(\)/);
  assert.match(sync,/VISITS_KEY="evia-mini-milos-visits-v2"/);
  assert.match(sync,/data\.nextReviewDate/);
  assert.match(sync,/data\.targets/);
  assert.match(next,/VISITS_KEY="evia-mini-milos-visits-v2"/);
  assert.match(next,/data\.nextReviewDate/);
});

test('v234 preserves Milos privacy by storing only the compact anonymous review update',()=>{
  assert.doesNotMatch(receiver,/learnerName|fullName|emailAddress|phoneNumber|postalAddress|signature|mediaBlob|videoBlob|audioBlob/i);
  assert.match(receiver,/overallProgress/);
  assert.match(receiver,/nextReviewDate/);
  assert.match(receiver,/targets/);
});

test('v234 also understands the current Milos OBS:1 return protocol',()=>{
  assert.match(receiver,/NISI:MILOS:OBS:1:/);
  assert.match(receiver,/OBS_KEY="evia-mini-milos-observed-v1"/);
  assert.match(receiver,/evia:milos-observed-changed/);
});

test('v234 replaces the Receive QR path so image and camera scans use the new decoder',()=>{
  assert.match(receiver,/window\.EviaQrExchange=Object\.freeze\(\{\.\.\.old,version:VERSION,openReceive,accept,__milosReturn234:true\}\)/);
  assert.match(receiver,/data-v234-file/);
  assert.match(receiver,/data-v234-video/);
  assert.match(receiver,/await accept\(raw\)/);
});

test('v234 release marker and offline wiring are current',()=>{
  assert.equal(String(update.version),'234');
  assert.match(loader,/EviaAppVersion=234/);
  assert.match(index,/evia-app-version" content="234/);
  assert.match(index,/evia-version-v234\.js\?v=234/);
  assert.match(index,/evia-milos-return-v234\.js\?v=234/);
  assert.match(sw,/evia-shell-v234/);
  assert.match(sw,/evia-version-v234\.js/);
  assert.match(sw,/evia-milos-return-v234\.js/);
});
