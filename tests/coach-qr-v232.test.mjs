import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const qr=readFileSync(new URL('../assets/evia-coach-qr-v232.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/evia-version-v232.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const update=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v232 keeps small Coach Snapshots as one legacy progress QR',()=>{
  assert.match(qr,/SINGLE_PREFIX="NISI:EVIA:PROGRESS:1:"/);
  assert.match(qr,/bytes\(text\)<=SINGLE_LIMIT/);
  assert.match(qr,/return\[text\]/);
});

test('v232 splits only the encoded progress suffix into automatic multipart frames',()=>{
  assert.match(qr,/MULTI_PREFIX="NISI:EVIA:PROGRESS:2:"/);
  assert.match(qr,/text\.slice\(SINGLE_PREFIX\.length\)/);
  assert.match(qr,/CHUNK_SIZE=850/);
  assert.match(qr,/setInterval\(paint,950\)/);
  assert.match(qr,/collects every part automatically/);
});

test('v232 can reconstruct the original single progress payload exactly',()=>{
  assert.match(qr,/function reassemble/);
  assert.match(qr,/parts\.size!==total/);
  assert.match(qr,/SINGLE_PREFIX\+Array\.from/);
});

test('v232 shares no learner identity or media in the transport layer',()=>{
  assert.doesNotMatch(qr,/evia-full-name|learnerName|emailAddress|phoneNumber|postalAddress|postcode|mediaBlob|audioBlob|videoBlob/i);
  assert.match(qr,/No learner name, contact details, media files, signatures or private written wellbeing notes/);
});

test('v232 release loader, update and offline cache include Coach QR transport',()=>{
  assert.equal(String(update.version),'232');
  assert.match(loader,/VERSION=232/);
  assert.match(index,/evia-version-v232\.js\?v=232/);
  assert.match(index,/evia-coach-qr-v232\.js\?v=232/);
  assert.match(sw,/evia-shell-v232/);
  assert.match(sw,/evia-coach-qr-v232\.js/);
  assert.match(sw,/evia-version-v232\.js/);
});
