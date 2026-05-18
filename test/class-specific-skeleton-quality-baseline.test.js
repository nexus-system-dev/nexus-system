import test from "node:test";
import assert from "node:assert/strict";

import { createClassSpecificSkeletonQualityBaseline } from "../src/core/class-specific-skeleton-quality-baseline.js";

test("class-specific baseline defines believable quality floor for landing page", () => {
  const baseline = createClassSpecificSkeletonQualityBaseline({
    productClass: "landing-page",
    skeletonContract: {
      buildSurfaceFamily: "web-marketing-surface",
      previewFamily: "web-preview",
      visibleMilestones: ["hero-visible", "cta-visible"],
      initialStructure: ["hero-section", "trust-section", "cta-section"],
    },
  });

  assert.equal(baseline.qualityBar, "minimum-believable-marketing-surface");
  assert.equal(baseline.requiredSurfaceElements.includes("headline"), true);
  assert.equal(baseline.visibleMilestones.includes("hero-visible"), true);
  assert.equal(baseline.failIfMissing.includes("cta"), true);
});

test("class-specific baseline prevents generic workspace quality for commerce ops", () => {
  const baseline = createClassSpecificSkeletonQualityBaseline({
    productClass: "commerce-ops",
    skeletonContract: {
      initialStructure: ["commerce-shell", "orders-panel", "catalog-panel"],
    },
  });

  assert.equal(baseline.qualityBar, "minimum-believable-commerce-workspace");
  assert.equal(baseline.requiredSurfaceElements.includes("orders-panel"), true);
  assert.equal(baseline.userPerceptionGoal.includes("commerce"), true);
});
