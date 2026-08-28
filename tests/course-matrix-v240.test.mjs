import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/evia-course-matrix-v240.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

test("v240 course arch opens the official unit matrix before the old A-E structure browser can intercept it", () => {
  const matrix = index.indexOf("evia-course-matrix-v240.js");
  const structure = index.indexOf("evia-nvq-structure-browser-v151.js");
  assert.ok(matrix >= 0 && structure > matrix);
  assert.match(source, /\[data-arch=\"Course\"\],\[data-arch=\"AC\"\],\[data-arch=\"KSB\"\]/);
  assert.match(source, /stopImmediatePropagation/);
  assert.match(source, /Course matrix/);
  assert.match(source, /Unit \$\{esc\(row\.unit\)\}/);
  assert.match(sw, /evia-course-matrix-v240\.js/);
});

test("v240 matrix keeps Milos observed ACs in the unit coverage", () => {
  const storage = new Map([
    ["evia-selfobs-live-v3", JSON.stringify([{ codes: ["235.3.1"] }])],
    ["evia-rpl-ksbs-v1", JSON.stringify([])],
    ["evia-mini-milos-observed-v1", JSON.stringify({ "6570-05-THIN": { "235.3.2": { status: "competent" } } })],
  ]);
  const window = {
    addEventListener() {},
    EviaCourseContext: { current: () => ({ courseType: "nvq", courseId: "6570-05", pathway: "thin", units: [235], codes: ["235.3.1", "235.3.2"] }) },
    EviaTrowelMeta: { unitCodes: { "235": ["235.3.1", "235.3.2"] }, unitTitles: { "235": "Erect masonry structures" } },
  };
  const sandbox = {
    window,
    localStorage: { getItem: key => storage.get(key) ?? null },
    document: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  const [row] = window.EviaCourseMatrixV240.unitStats();
  assert.equal(row.unit, "235");
  assert.equal(row.covered, 2);
  assert.equal(row.observed, 1);
  assert.equal(row.pct, 100);
});
