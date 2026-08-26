import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/evia-pulse-faces-v229.css', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../assets/evia-version-v229.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../update.json', import.meta.url), 'utf8'));
const version=String(manifest.version);

test('Pulse wellbeing faces use eyes only with no mouth mark', () => {
  assert.match(css, /\.evia-pulse-face::after\{content:none!important;display:none!important\}/);
  assert.match(css, /\.evia-pulse-face-1 \.evia-pulse-eye/);
  assert.match(css, /border-bottom:var\(--face-stroke\) solid #efc33d!important/);
  assert.doesNotMatch(css, /\.evia-pulse-face-1::after/);
});

test('v229 eyes-only Pulse face fix remains loaded and cached', () => {
  assert.ok(Number(version)>=229);
  assert.match(loader, /const VERSION=229/);
  assert.match(loader, /evia-pulse-faces-v229\.css\?v=229/);
  assert.match(index, /evia-version-v229\.js\?v=229/);
  assert.match(sw, new RegExp(`evia-shell-v${version}`));
  assert.match(sw, /assets\/evia-pulse-faces-v229\.css/);
});
