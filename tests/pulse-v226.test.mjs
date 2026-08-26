import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pulse = readFileSync(new URL('../assets/evia-pulse-v226.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/evia-pulse-v226.css', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../assets/evia-version-v226.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../update.json', import.meta.url), 'utf8'));

test('Pulse stores wellbeing and confidence locally', () => {
  assert.match(pulse, /evia-pulse-wellbeing-v1/);
  assert.match(pulse, /evia-pulse-confidence-v1/);
});

test('weekly wellbeing check uses neutral Evia expressions only', () => {
  assert.match(pulse, /How are you this week\?/);
  assert.match(pulse, /data-wellbeing="3"/);
  assert.match(pulse, /data-wellbeing="2"/);
  assert.match(pulse, /data-wellbeing="1"/);
  assert.doesNotMatch(pulse, /\bhappy\b|\bsad\b|\banxious\b/i);
  assert.match(css, /\.evia-pulse-wellbeing-choices\{display:grid/);
});

test('confidence is 1 to 5 and editable with history', () => {
  for (const n of [1,2,3,4,5]) assert.match(pulse, new RegExp(`${n}:\\{title:`));
  assert.match(pulse, /history/);
  assert.match(pulse, /data-confidence=/);
  assert.match(pulse, /saveConfidence/);
});

test('confidence completion is based on every child evidence opportunity', () => {
  assert.match(pulse, /job\.opps\|\|\[\]/);
  assert.match(pulse, /every\(/);
  assert.match(pulse, /opportunityId/);
  assert.match(pulse, /categoryId/);
});

test('Pulse replaces the bullseye with a heart and pulse mark', () => {
  assert.match(css, /evia-target-symbol::before/);
  assert.match(css, /background-image:url\("data:image\/svg\+xml/);
  assert.match(css, /M16 27\.1S5\.2 20\.5/);
});

test('Pulse loader remains present in the current offline shell', () => {
  assert.match(loader, /const VERSION=226/);
  assert.match(loader, /evia-pulse-v226\.js/);
  assert.match(loader, /evia-pulse-v226\.css/);
  assert.match(sw, new RegExp(`evia-shell-v${manifest.version}`));
  assert.match(sw, /assets\/evia-pulse-v226\.js/);
  assert.match(sw, /assets\/evia-pulse-v226\.css/);
});
