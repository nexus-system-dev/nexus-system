import test from "node:test";
import assert from "node:assert/strict";

import { createWebsiteExperimentAndCtaTestLayer } from "../src/core/website-experiment-cta-test-layer.js";

test("website experiment layer builds a CTA experiment plan from copy and strategy", () => {
  const { websiteExperimentPlan } = createWebsiteExperimentAndCtaTestLayer({
    websiteCopyPack: {
      websiteCopyPackId: "website-copy-pack:operators",
      status: "ready",
    },
    productCtaStrategy: {
      status: "ready",
      primaryCta: { label: "Request access" },
    },
    analyticsSummary: {
      totalProjectsCreated: 2,
    },
  });

  assert.equal(websiteExperimentPlan.status, "ready");
  assert.equal(websiteExperimentPlan.experiments.length, 1);
  assert.equal(websiteExperimentPlan.experiments[0].measurement, "activation-rate");
});
