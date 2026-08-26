// Evia v220: Naxos course coverage and evidence-method support.
const CACHE_NAME = 'evia-shell-v220';
const CACHE_PREFIXES = ['evia-shell-', 'evia-beta-shell-'];
const CRITICAL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/index-D_kAPZ6L.css',
  './assets/evia-selfobs-live.css',
  './assets/evia-selfobs-fixes.css',
  './assets/evia-selfobs-live.js',
  './assets/evia-menu-response-v173.js',
  './assets/evia-v69-interaction-fixes.js',
  './assets/evia-avatar-life-v108.js',
  './assets/evia-qr-neutral-v122.js',
  './assets/evia-welcome-v120.js',
  './assets/evia-first-run-v215.js',
  './assets/evia-demo-mode-v215.js',
  './assets/evia-demo-enhancements-v216.js',
  './assets/evia-demo-guided-audio-v217.js',
  './assets/evia-interactive-walkthrough-v218.js',
  './assets/evia-interactive-walkthrough-v219.js',
  './assets/evia-profile-course-lock-v215.js',
  './assets/evia-evidence-media-v122.js',
  './assets/evia-media-stability-v168.js',
  './assets/evia-evidence-hub-v109.js',
  './assets/evia-home-header-v110.js',
  './assets/evia-home-brand-v114.js',
  './assets/evia-updater.js',
  './assets/evia-updater.css',
  './assets/evia-version-v162.js',
  './assets/evia-version-v194.js',
  './assets/evia-version-v195.js',
  './assets/evia-version-v196.js',
  './assets/evia-version-v197.js',
  './assets/evia-version-v198.js',
  './assets/evia-version-v199.js',
  './assets/evia-version-v200.js',
  './assets/evia-version-v201.js',
  './assets/evia-version-v202.js',
  './assets/evia-version-v203.js',
  './assets/evia-version-v204.js',
  './assets/evia-version-v205.js',
  './assets/evia-version-v206.js',
  './assets/evia-version-v207.js',
  './assets/evia-version-v208.js',
  './assets/evia-version-v209.js',
  './assets/evia-version-v210.js',
  './assets/evia-version-v211.js',
  './assets/evia-version-v212.js',
  './assets/evia-version-v213.js',
  './assets/evia-version-v214.js',
  './assets/evia-version-v215.js',
  './assets/evia-version-v216.js',
  './assets/evia-version-v217.js',
  './assets/evia-version-v218.js',
  './assets/evia-version-v219.js',
  './assets/evia-version-v220.js',
  './assets/evia-functional-skills-v194.js',
  './assets/evia-smooth-flow-v161.js',
  './assets/evia-evidence-route-v161.js',
  './assets/evia-download-progress-v160.js',
  './assets/evia-pdf-neutral-v172.js',
  './assets/evia-staged-resume-guard-v167.js',
  './assets/evia-staged-evidence-v202.js',
  './assets/evia-naxos-evidence-type-v220.js',
  './assets/evia-staged-evidence-v132.css',
  './assets/evia-stage-save-v139.js',
  './assets/evia-post-evidence-otj-v149.js',
  './assets/evia-otj-export.js',
  './assets/evia-nvq-audio-v150.js',
  './assets/evia-nvq-pack-export-v150.js',
  './assets/evia-signature-smooth-v155.js',
  './assets/evia-trowel-framework-v150.js',
  './assets/evia-trowel-practical-v151.js',
  './assets/evia-nvq-practical-nav-v151.js',
  './assets/evia-nvq-structure-browser-v151.js',
  './assets/evia-export-status.js',
  './assets/evia-qr-exchange-v107.js',
  './assets/evia-qr-st0171-v126.js',
  './assets/evia-assistant-network.js',
  './assets/evia-next-visit-v95.js',
  './assets/evia-milos-review-sync-v97.js',
  './assets/evia-targets.js',
  './assets/evia-target-calibration-v217.js',
  './assets/evia-targets-milos-only-v123.js',
  './assets/evia-evidence-state-v204.js',
  './assets/evia-option-source-sync-v214.js',
  './assets/evia-milos-observed-arch-v94.js',
  './assets/evia-rpl-evidence.js',
  './assets/evia-rpl-evidence.css',
  './assets/evia-rpl-course.js',
  './assets/evia-rpl-course.css',
  './assets/evia-arp-v80.js',
  './assets/evia-arp-discussion-v82.js',
  './assets/evia-arp-practical-v83.js',
  './assets/evia-practical-camera-v210.js',
  './assets/evia-arp-home-score-v94.js',
  './assets/evia-arp-integrity-v118.js',
  './assets/evia-arp-distractors-v123.js',
  './assets/evia-arp-integrity-watch-v119.js',
  './assets/evia-arp-marking-v121.js',
  './assets/evia-st0171-meta-v124.js',
  './assets/evia-st0171-map-v124.js',
  './assets/evia-st0171-v124.js',
  './assets/evia-course-packs.js',
  './assets/evia-naxos-course-pack-v220.js',
  './assets/evia-course-enrolment.js',
  './assets/evia-course-pack-qr-v125.js',
  './course-delivery/course-registry.js',
  './course-delivery/registry-v1.json',
  './course-delivery/qr/ST0171.svg',
  './assets/evia-rpl-unit-order-v88.js',
  './assets/evia-trowel-meta.js',
  './assets/evia-trowel-ac-text.js',
  './assets/evia-trowel-handbook-v89.js',
  './assets/evia-trowel-loader.js',
  './assets/evia-6570-pack-migration.js',
  './assets/evia-6570-v91-remap.js',
  './assets/evia-nvq-v94.js',
  './assets/evia-nvq-ac-browser-v90.js',
  './assets/evia-nvq-ac-browser-v90.css',
  './assets/qrcode.js',
  './assets/jsQR-1.4.0.js'
];

async function refreshCritical(cache) {
  await Promise.allSettled(CRITICAL.map(async path => {
    const response = await fetch(path, { cache: 'reload' });
    if (response.ok) await cache.put(path, response.clone());
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await refreshCritical(cache);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name !== CACHE_NAME && CACHE_PREFIXES.some(prefix => name.startsWith(prefix)))
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/update.json') || (url.pathname.endsWith('/index.html') && url.searchParams.has('version-check'))) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          await cache.put('./index.html', response.clone());
          await cache.put('./', response.clone());
        }
        return response;
      } catch {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});