import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gate=readFileSync(new URL('../assets/evia-version-v236.js',import.meta.url),'utf8');
const toc=readFileSync(new URL('../assets/evia-toc.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('free Time view removes learner access to the course QR and manual-code catalogue',()=>{
  assert.match(gate,/data-course-qr-codes/);
  assert.match(gate,/data-copy-course-code/);
  assert.match(gate,/Course QR Codes/);
  assert.match(gate,/stopImmediatePropagation/);
  assert.match(gate,/queueMicrotask\(removeFreeCourseCodeAccess\)/);
  assert.doesNotMatch(gate,/MutationObserver/);
});

test('paid gate leaves course enrolment and installed-pack internals available for a later entitlement layer',()=>{
  assert.match(toc,/function installedCourses\(\)/);
  assert.match(toc,/function openPackManager\(/);
  assert.match(toc,/Install a course pack/);
  assert.match(toc,/data-toc-course/);
});

test('service worker refreshes the patched v236 gate for existing installs',()=>{
  assert.match(sw,/remove free learner access to paid course codes/);
  assert.match(sw,/\.\/assets\/evia-version-v236\.js/);
  assert.match(sw,/evia-shell-v236/);
});
