import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const symi=readFileSync(new URL('../assets/evia-symi-otj-v237.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Evia accepts anonymous Symi college OTJ receipts',()=>{
  assert.match(symi,/NISI:SYMI:COLLEGEOTJ:1/);
  assert.match(symi,/evia-otj-college-v1/);
  assert.match(symi,/source:\"symi\"/);
  assert.match(symi,/receiptId/);
  assert.doesNotMatch(symi,/learnerRef|evia-full-name|learnerName/);
});

test('Symi receipt is added to college totals without double counting the same receipt',()=>{
  assert.match(symi,/current\.hours\*60\+current\.minutes/);
  assert.match(symi,/existing=current\.updates\.find/);
  assert.match(symi,/total=oldMinutes\+item\.m/);
  assert.match(symi,/Already added/);
});

test('QR receiver load order keeps the existing Evia scanner and Milos receiver',()=>{
  const base=index.indexOf('evia-qr-exchange-v107.js');
  const sym=index.indexOf('evia-symi-otj-v237.js');
  const milos=index.indexOf('evia-milos-return-v234.js');
  assert.ok(base>=0&&sym>base&&milos>sym);
  assert.match(sw,/evia-symi-otj-v237\.js/);
});
