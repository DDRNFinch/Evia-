import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src=readFileSync(new URL('../assets/evia-symi-attendance-v238.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Evia accepts Symi migration without learner identity',()=>{
  assert.match(src,/NISI:SYMI:MIGRATION:1/);
  assert.match(src,/evia-college-attendance-v1/);
  assert.doesNotMatch(src,/learnerName|evia-full-name|learnerRef/);
});

test('Symi attendance is added to Coach progress snapshot',()=>{
  assert.match(src,/payload\.co\.at=at/);
  assert.match(src,/bp:/);
  assert.match(src,/sp:/);
});

test('receiver loads after Coach and before QR display and Milos receiver',()=>{
  const coach=index.indexOf('evia-coach-v231.js');
  const attendance=index.indexOf('evia-symi-attendance-v238.js');
  const display=index.indexOf('evia-coach-qr-v233.js');
  const milos=index.indexOf('evia-milos-return-v234.js');
  assert.ok(coach>=0&&attendance>coach&&display>attendance&&milos>attendance);
  assert.match(sw,/evia-symi-attendance-v238\.js/);
});
