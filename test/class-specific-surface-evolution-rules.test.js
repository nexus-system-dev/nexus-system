import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwareGenerationContract } from "../src/core/class-aware-generation-contract.js";
import { createClassSpecificSurfaceEvolutionRules } from "../src/core/class-specific-surface-evolution-rules.js";

test("surface evolution rules differentiate landing-page evolution from internal-tool workspace evolution", () => {
  const landingPageRules = createClassSpecificSurfaceEvolutionRules({
    productClass: "landing-page",
    classAwareGenerationContract: createClassAwareGenerationContract({
      productClass: "landing-page",
      artifactExpectation: {
        projectType: "landing-page",
        title: "Launch page",
      },
    }),
  });
  const internalToolRules = createClassSpecificSurfaceEvolutionRules({
    productClass: "internal-tool",
    classAwareGenerationContract: createClassAwareGenerationContract({
      productClass: "internal-tool",
      artifactExpectation: {
        projectType: "internal-tool",
        title: "Ops workspace",
      },
    }),
  });

  assert.equal(landingPageRules.evolutionFamily, "section-evolution");
  assert.equal(landingPageRules.frontendSurfaceType, "marketing-page");
  assert.equal(landingPageRules.sceneType, "section-sequence");
  assert.equal(internalToolRules.evolutionFamily, "workspace-evolution");
  assert.equal(internalToolRules.frontendSurfaceType, "operations-workspace");
  assert.equal(internalToolRules.sceneType, "queue-workspace");
  assert.notEqual(landingPageRules.visibleEvolutionRule, internalToolRules.visibleEvolutionRule);
});

test("surface evolution rules preserve preview, build surface, and release families from upstream contracts", () => {
  const rules = createClassSpecificSurfaceEvolutionRules({
    productClass: "saas",
    runtimeDirection: {
      previewFamily: "saas-preview",
      buildSurfaceFamily: "saas-surface",
      releasePathFamily: "saas-release",
    },
    splitWorkspaceLiveBuildSurfaceModel: {
      previewFrameFamily: "workspace-preview-frame",
      buildSurfaceFamily: "workspace-product-surface",
    },
    classAwareGenerationContract: createClassAwareGenerationContract({
      productClass: "saas",
      artifactExpectation: {
        projectType: "saas",
        title: "SaaS workspace",
      },
    }),
  });

  assert.equal(rules.previewFamily, "workspace-preview-frame");
  assert.equal(rules.buildSurfaceFamily, "workspace-product-surface");
  assert.equal(rules.releasePathFamily, "saas-release");
  assert.equal(rules.backendCoupling.includes("product shell must reflect workflow progress"), true);
});
