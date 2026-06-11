import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  ADVANCED_ROUTES,
  PRIMARY_LOOP_ROUTES,
  SUPPORT_ROUTES,
} from "../web/nexus-ui/routes/index.js";
import {
  LEGACY_DECOMPOSITION_ACTIONS,
  LEGACY_FRONTEND_DECOMPOSITION_MAP,
  LEGACY_INDEX_SECTIONS,
  listLegacyFrontendDecompositionEntries,
} from "../web/nexus-ui/routes/legacy-decomposition.js";

function extractIndexSections() {
  const html = fs.readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
  return [...html.matchAll(/id="screen-([^"]+)"/g)].map((match) => match[1]);
}

test("legacy frontend decomposition map covers every route and index section", () => {
  const routeKeys = new Set([
    ...PRIMARY_LOOP_ROUTES,
    ...SUPPORT_ROUTES,
    ...ADVANCED_ROUTES,
    ...LEGACY_INDEX_SECTIONS,
    ...extractIndexSections(),
  ]);
  const entries = listLegacyFrontendDecompositionEntries();
  const mappedKeys = new Set(entries.map((entry) => entry.routeKey));

  for (const routeKey of routeKeys) {
    assert.equal(
      mappedKeys.has(routeKey),
      true,
      `missing legacy decomposition entry for ${routeKey}`,
    );
  }

  for (const entry of entries) {
    assert.equal(
      LEGACY_DECOMPOSITION_ACTIONS.includes(entry.action),
      true,
      `invalid decomposition action for ${entry.routeKey}`,
    );
    assert.equal(typeof entry.canonicalSurface, "string");
    assert.equal(typeof entry.enginePreserved, "string");
    assert.equal(typeof entry.visibleRemoval, "string");
    assert.equal(typeof entry.nextTask, "string");
  }

  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.onboarding.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.understanding.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.loop.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.proof.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.timeline.action, "remove visible");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.execution.action, "migrate");
  assert.equal(LEGACY_FRONTEND_DECOMPOSITION_MAP.qa.action, "preserve hidden");
});
