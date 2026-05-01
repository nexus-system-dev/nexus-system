import test from "node:test";
import assert from "node:assert/strict";

import { createBuildDeployCostTracker } from "../src/core/build-deploy-cost-tracker.js";

test("build deploy cost tracker derives build-minute usage from artifacts, release activity, and execution mode", () => {
  const { buildDeployCostMetric } = createBuildDeployCostTracker({
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    buildArtifact: ["web.bundle.js", "manifest.json"],
    deploymentResult: {
      release: {
        status: "validated",
        updatedAt: "2026-01-01T00:10:00.000Z",
      },
    },
    executionModeDecision: {
      selectedMode: "ci-runner",
      selectedSource: "ci-runner",
    },
    pricingMetadata: {
      buildDeployUnitPrice: 0.25,
      currency: "USD",
    },
  });

  assert.equal(buildDeployCostMetric.quantity, 6);
  assert.equal(buildDeployCostMetric.unit, "build-minute");
  assert.equal(buildDeployCostMetric.totalCost, 1.5);
  assert.equal(buildDeployCostMetric.executionMode, "ci-runner");
  assert.equal(buildDeployCostMetric.source, "ci-runner");
});
