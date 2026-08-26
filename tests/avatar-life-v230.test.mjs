import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const motion=readFileSync(new URL('../assets/evia-avatar-life-v230.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v230 adds subtle eye directions and curious head tilts only',()=>{
  assert.match(motion,/evia-v230-look-left/);
  assert.match(motion,/evia-v230-look-right/);
  assert.match(motion,/evia-v230-look-up/);
  assert.match(motion,/evia-v230-look-down/);
  assert.match(motion,/evia-v230-curious-left/);
  assert.match(motion,/evia-v230-curious-right/);
  assert.match(motion,/translate:-3\.1px 0!important/);
  assert.match(motion,/rotate:-2\.2deg!important/);
  assert.doesNotMatch(motion,/mouth|border-bottom.*evia-face::after|evia-face::after/i);
});

test('v230 reacts to learner interaction without changing app data',()=>{
  assert.match(motion,/lookTowardPoint/);
  assert.match(motion,/pointerdown/);
  assert.match(motion,/button,\.option-row,\.self-panel/);
  assert.match(motion,/prefers-reduced-motion: reduce/);
  assert.doesNotMatch(motion,/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest/);
});

test('v230 motion loads after the existing Evia life layer and is cached offline',()=>{
  assert.equal(String(manifest.version),'230');
  const base=index.indexOf('evia-avatar-life-v108.js?v=188');
  const extra=index.indexOf('evia-avatar-life-v230.js?v=230');
  assert.ok(base>=0&&extra>base);
  assert.match(index,/evia-version-v230\.js\?v=230/);
  assert.match(index,/evia-updater\.js\?v=230/);
  assert.match(sw,/evia-shell-v230/);
  assert.match(sw,/assets\/evia-avatar-life-v230\.js/);
  assert.match(sw,/assets\/evia-version-v230\.js/);
});
