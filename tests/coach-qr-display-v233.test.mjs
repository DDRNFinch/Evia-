import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const display=readFileSync(new URL('../assets/evia-coach-qr-v233.js',import.meta.url),'utf8');
const loader=readFileSync(new URL('../assets/evia-version-v233.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const update=JSON.parse(readFileSync(new URL('../update.json',import.meta.url),'utf8'));

test('v233 always loads the QR generator before drawing a Coach Snapshot',()=>{
  assert.match(display,/await ensureQr\(\)/);
  assert.match(display,/if\(!ok\)throw Error\("QR generator could not load\."\)/);
  assert.match(display,/QRLIB="\.\/assets\/qrcode\.js\?v=233"/);
});

test('v233 renders small Coach Snapshots itself instead of falling back to v231',()=>{
  assert.match(display,/async function show\(raw,inputFrames\)/);
  assert.match(display,/let frames=inputFrames&&inputFrames\.length\?inputFrames:\[String\(raw\|\|""\)\]/);
  assert.doesNotMatch(display,/old\.openShare\(\)/);
  assert.doesNotMatch(display,/too large for this QR code\. Update Evia and Milos/);
});

test('v233 retains automatic multipart sharing and can force-split a failed single QR',()=>{
  assert.match(display,/MULTI_PREFIX="NISI:EVIA:PROGRESS:2:"/);
  assert.match(display,/CHUNK_SIZE=850/);
  assert.match(display,/frames=forceFrames\(raw\)/);
  assert.match(display,/setInterval\(paint,950\)/);
  assert.match(display,/Keep the screen still while Milos collects every part automatically/);
});

test('v233 patches the live EviaQrExchange openShare used by the assistant menu',()=>{
  assert.match(display,/const old=window\.EviaQrExchange/);
  assert.match(display,/window\.EviaQrExchange=Object\.freeze\(\{\.\.\.old,openShare,__coach233:true\}\)/);
  assert.match(display,/const raw=String\(old\.buildProgress\(\)\),frames=framesFor\(raw\)/);
});

test('v233 release marker and offline shell are wired',()=>{
  assert.equal(String(update.version),'233');
  assert.match(loader,/EviaAppVersion=233/);
  assert.match(index,/evia-app-version" content="233/);
  assert.match(index,/evia-version-v233\.js\?v=233/);
  assert.match(index,/evia-coach-qr-v233\.js\?v=233/);
  assert.match(sw,/evia-shell-v233/);
  assert.match(sw,/evia-version-v233\.js/);
  assert.match(sw,/evia-coach-qr-v233\.js/);
});
