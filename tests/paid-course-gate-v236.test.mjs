import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gate=readFileSync(new URL('../assets/evia-version-v236.js',import.meta.url),'utf8');
const toc=readFileSync(new URL('../assets/evia-toc.js',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Time hides the Course QR Codes button before the learner can see it',()=>{
  assert.match(gate,/\[data-course-qr-codes\]\{display:none!important\}/);
  assert.match(gate,/querySelectorAll\('\[data-course-qr-codes\]'\)/);
  assert.match(gate,/queueMicrotask\(removeTimeCourseCodesButton\)/);
  assert.doesNotMatch(gate,/MutationObserver/);
});

test('the paid course QR and enrolment machinery remains untouched underneath',()=>{
  assert.match(toc,/function openQrCodes\(/);
  assert.match(toc,/data-copy-course-code/);
  assert.match(toc,/function installedCourses\(\)/);
  assert.match(toc,/function openPackManager\(/);
  assert.match(toc,/Install a course pack/);
  assert.doesNotMatch(gate,/data-copy-course-code/);
  assert.doesNotMatch(gate,/evia-course-qr-card/);
  assert.doesNotMatch(gate,/stopImmediatePropagation/);
});

test('service worker refreshes the patched v236 loader for existing installs',()=>{
  assert.match(sw,/\.\/assets\/evia-version-v236\.js/);
  assert.match(sw,/evia-shell-v236/);
});
