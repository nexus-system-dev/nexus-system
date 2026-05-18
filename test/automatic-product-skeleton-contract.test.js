import test from "node:test";
import assert from "node:assert/strict";

import { createAutomaticProductSkeletonContract } from "../src/core/automatic-product-skeleton-contract.js";

test("automatic skeleton contract resolves landing-page automatic bootstrap truth", () => {
  const contract = createAutomaticProductSkeletonContract({
    productClass: "landing-page",
    runtimeDirection: {
      productClass: "landing-page",
      buildSurfaceFamily: "web-marketing-surface",
      previewFamily: "web-preview",
      runtimeFamily: "web-static",
      packagingFamily: "web-build",
      releasePathFamily: "web-deployment",
      targetPlatform: "web",
    },
    domainProfile: {
      bootstrapRules: ["initialize-landing-shell", "initialize-conversion-structure"],
    },
  });

  assert.equal(contract.autoStartPolicy, "automatic-after-class-resolution");
  assert.equal(contract.visibleSurfaceType, "marketing-page");
  assert.equal(contract.initialStructure.includes("hero-section"), true);
  assert.equal(contract.bootstrapRules.includes("initialize-landing-shell"), true);
});

test("automatic skeleton contract resolves internal-tool workspace skeleton truth", () => {
  const contract = createAutomaticProductSkeletonContract({
    productClass: "internal-tool",
    runtimeDirection: {
      productClass: "internal-tool",
      buildSurfaceFamily: "workspace-surface",
      previewFamily: "workspace-preview",
      runtimeFamily: "web-app-runtime",
      packagingFamily: "workspace-package",
      releasePathFamily: "private-workspace-release",
      targetPlatform: "web",
    },
  });

  assert.equal(contract.visibleSurfaceType, "workspace");
  assert.equal(contract.initialStructure.includes("queue-panel"), true);
  assert.equal(contract.truthRequirements.includes("no-explicit-generate-click-required"), true);
});
