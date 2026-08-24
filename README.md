# Evia

Evia is the learner-facing Apprentice Vocational Assistant. This repository's
root is the production progressive web app: GitHub Pages publishes it directly,
with [`index.html`](index.html) as the entry point and [`sw.js`](sw.js) providing
the offline shell.

## Data and privacy

Evia is local/offline-first. Learner profiles, enrolments, progress, learning
logs, evidence metadata and media remain in browser storage (localStorage and
IndexedDB). The app does not require an account or a remote learner database.
Existing storage keys and migration scripts are retained so installed learners
can continue upgrading safely.

## Production layout

- `index.html` — authoritative learner app entry point.
- `assets/` — production CSS, JavaScript, QR libraries and compatibility logic.
- `course-delivery/` — course registry, question/practical banks and labelled QR assets.
- `course-packs/` — installable `.nisi` course packs and their schema.
- `manifest.webmanifest`, `sw.js`, `update.json` and root icons — install, offline and update resources.
- `scripts/` — deterministic course/QR generation utilities.
- `tests/` — Node regression checks for courses and learner behaviour.
- `.github/workflows/` — root deployment and production verification.

The historical React/Next/Vite/Cloudflare prototype has been removed. It was a
separate application and was not used by the root GitHub Pages deployment,
production service worker, course generation, or learner regression suite.
There is intentionally no duplicated `public/` application tree; root files are
the single production source of truth.

## Local use

Serve the repository root with any static HTTP server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. A static server is required to exercise the
service worker; opening `index.html` via `file://` is not equivalent.

## Maintenance

Node.js 22 or newer is used for verification. The only npm dependency is
`sharp`, which decodes the generated labelled QR PNGs in the course integrity
tests.

```bash
npm ci
npm test
find assets course-delivery -type f -name '*.js' -print0 | xargs -0 -n1 node --check
node --check sw.js
```

Course artefacts can be regenerated with the scripts in `scripts/`. Generated
changes should always be reviewed and the full regression suite rerun; course
codes, mappings, QR payloads and learner storage formats are compatibility
contracts.
