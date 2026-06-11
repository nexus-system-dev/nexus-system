import test from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_SURFACE_IDS,
  createCanonicalSurfacePassContract,
  getCanonicalSurface,
} from "../src/core/canonical-surface-pass-contract.js";

test("SURF-001 defines every canonical main surface", () => {
  const contract = createCanonicalSurfacePassContract();

  assert.deepEqual(CANONICAL_SURFACE_IDS, [
    "home",
    "build",
    "release",
    "growth",
    "history",
    "share",
    "studio",
  ]);
  assert.equal(contract.contractId, "SURF-001");
  assert.equal(contract.surfaces.length, 7);
  assert.equal(contract.productTruthRule, "all-surfaces-are-views-over-one-product-graph");
});

test("SURF-001 locks Build as agent rail plus live build canvas", () => {
  const contract = createCanonicalSurfacePassContract();
  const buildSurface = getCanonicalSurface("build");

  assert.equal(contract.buildSurfaceLaw.statement, "Build surface = persistent agent conversation rail + live artifact/build canvas in the same workspace.");
  assert.equal(
    contract.buildSurfaceLaw.transitionMotion.statement,
    "Discovery chat does not disappear. It compresses into the persistent right-side agent rail while the live build canvas opens beside it.",
  );
  assert.equal(contract.buildSurfaceLaw.transitionMotion.motionLevel, "gentle-futuristic-respectful");
  assert.equal(contract.buildSurfaceLaw.transitionMotion.reducedMotionRequired, true);
  assert.deepEqual(contract.buildSurfaceLaw.requiredPairing, [
    "agent-conversation-rail",
    "live-artifact-build-canvas",
  ]);
  assert.ok(buildSurface.requiredRegions.includes("agent-conversation-rail"));
  assert.ok(buildSurface.requiredRegions.includes("live-artifact-build-canvas"));
  assert.ok(buildSurface.requiredRegions.includes("release-readiness-affordance"));
  assert.ok(buildSurface.forbiddenShapes.includes("only-chat"));
  assert.ok(buildSurface.forbiddenShapes.includes("only-artifact-preview"));
  assert.ok(buildSurface.forbiddenShapes.includes("internal-loop-screen"));
});
