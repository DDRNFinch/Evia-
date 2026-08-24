import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const live=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const motionCss=fs.readFileSync("assets/evia-selfobs-live.css","utf8");
const updater=fs.readFileSync("assets/evia-updater.js","utf8");
const assistantNetwork=fs.readFileSync("assets/evia-assistant-network.js","utf8");
const nvqAudio=fs.readFileSync("assets/evia-nvq-audio-v150.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const publicSw=fs.readFileSync("sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("Evia keeps one mounted interaction shell",()=>{
  assert.match(live,/function syncShell\(\)/);
  assert.match(live,/function refreshShellMeta\(\)/);
  assert.match(live,/\$\("\[data-evia\]"\)\.onclick=.*syncShell\(\)/);
  assert.doesNotMatch(live,/\$\("\[data-evia\]"\)\.onclick=.*mount\(\)/);
  assert.doesNotMatch(live,/panel\.innerHTML=""/);
});

test("Evia core motion is fast and compositor-only",()=>{
  assert.match(motionCss,/transition:translate \.38s var\(--ease-out\),scale \.38s var\(--ease-out\)/);
  assert.match(motionCss,/translate:-50% calc\(40\.5svh - 50%\)/);
  assert.match(motionCss,/scale:\.605/);
  assert.match(motionCss,/transform:translate3d\(0,14px,0\)/);
  assert.match(motionCss,/opacity \.18s ease \.03s/);
  assert.match(motionCss,/transform \.28s var\(--ease-out\) \.03s/);
  assert.match(motionCss,/will-change:translate,scale/);
  assert.doesNotMatch(motionCss,/transition:top/);
  assert.doesNotMatch(motionCss,/will-change:top,width,height/);
  assert.doesNotMatch(motionCss,/translate \.92s|transform \.58s|opacity \.36s/);
  assert.match(motionCss,/\.selfobs \.self-panel>\*\{animation:none!important\}/);
});

test("home identity and arch labels are core-owned instead of watcher patches",()=>{
  assert.match(live,/function courseIdentity\(\)/);
  assert.match(live,/ARCH_LABELS=\{TOC:"Time",KSB:"Course",AC:"Course",OTJ:"Learn",GLH:"Learn",EPA:"Test",ARP:"Test",Units:"Test"\}/);
  assert.equal(fs.existsSync("assets/evia-arch-labels-v154.js"),false);
  assert.equal(fs.existsSync("assets/evia-course-title-v161.js"),false);
  assert.doesNotMatch(index,/evia-arch-labels-v\d+\.js/);
  assert.doesNotMatch(index,/evia-course-title-v\d+\.js/);
  assert.match(assistantNetwork,/observer\?\.disconnect/);
  assert.doesNotMatch(assistantNetwork,/ensureExchange\(\)\.catch/);
});

test("NVQ audio saves directly instead of masquerading as photo evidence",()=>{
  assert.match(live,/saveExternalAudioEvidence/);
  assert.match(live,/window\.EviaEvidenceCore=Object\.freeze\(\{saveExternalAudioEvidence\}\)/);
  assert.match(nvqAudio,/EviaEvidenceCore/);
  assert.match(nvqAudio,/saveExternalAudioEvidence/);
  assert.doesNotMatch(nvqAudio,/input\.onchange\(\{target:\{files:\[file\]/);
  assert.doesNotMatch(nvqAudio,/entry\.audioId=entry\.photoId/);
});

test("Evia has one service-worker owner and one current cache",()=>{
  assert.doesNotMatch(live,/serviceWorker\.register/);
  assert.match(updater,/serviceWorker\.register/);
  assert.match(updater,new RegExp(`evia-shell-v\\$\\{version\\}`));
  assert.doesNotMatch(updater,/evia-beta-shell-v/);
  assert.doesNotMatch(sw,/LEGACY_READY_CACHE|migrateOldShell/);
});

test("duplicate motion and production audit layers stay removed",()=>{
  for(const name of ["evia-avatar-motion","evia-premium-motion","evia-avatar-life.js","evia-v73-page-handoff","evia-6570-smoke"]){
    assert.equal(index.includes(name),false,`${name} must not be loaded`);
  }
  assert.equal(fs.existsSync("assets/evia-6570-smoke.js"),false);
  assert.equal(fs.existsSync(".v42-transfer"),false);
});

test("runtime, manifest and offline cache agree",()=>{
  assert.match(index,new RegExp(`evia-app-version\\" content=\\"${version}`));
  assert.match(index,new RegExp(`evia-version-v${version}\\.js\\?v=${version}`));
  assert.match(index,new RegExp(`evia-updater\\.js\\?v=${version}`));
  assert.match(sw,new RegExp(`evia-shell-v${version}`));
  assert.match(sw,new RegExp(`evia-version-v${version}\\.js`));
  assert.equal(publicSw.trimEnd(),sw.trimEnd());
});
