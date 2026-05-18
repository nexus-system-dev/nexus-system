import test from "node:test";
import assert from "node:assert/strict";

import { createClassAwareGenerationContract } from "../src/core/class-aware-generation-contract.js";

test("class-aware generation contract differentiates landing-page generation truth", () => {
  const contract = createClassAwareGenerationContract({
    productClass: "landing-page",
    artifactExpectation: {
      title: "Coach launch page",
      projectType: "landing-page",
      proofFocus: ["headline promise", "trust proof"],
    },
    runtimeDirection: {
      buildSurfaceFamily: "web-marketing-surface",
      previewFamily: "web-preview",
      runtimeFamily: "web-static",
      packagingFamily: "web-build",
      releasePathFamily: "web-deployment",
    },
    qualityBaseline: {
      visibleProofPoints: ["single-cta"],
      requiredSurfaceElements: ["headline", "cta"],
    },
  });

  assert.equal(contract.generationMode, "conversion-surface");
  assert.equal(contract.surfaceMutationModel, "section-sequence");
  assert.equal(contract.generationIntent.primaryAction.actionIntent, "convert");
  assert.equal(contract.visibleMutationTargets.includes("single-cta"), true);
  assert.equal(contract.forbiddenGenericPatterns.includes("generic-dashboard-layout"), true);
});

test("class-aware generation contract differentiates internal-tool generation truth", () => {
  const contract = createClassAwareGenerationContract({
    productClass: "internal-tool",
    artifactExpectation: {
      title: "Ops queue workspace",
      projectType: "internal-tool",
      proofFocus: ["queue ownership", "service-level state"],
    },
    runtimeDirection: {
      buildSurfaceFamily: "workspace-surface",
      previewFamily: "workspace-preview",
      runtimeFamily: "web-app-runtime",
      packagingFamily: "workspace-package",
      releasePathFamily: "private-workspace-release",
    },
    qualityBaseline: {
      visibleProofPoints: ["next-action-view"],
      requiredSurfaceElements: ["queue-panel", "ownership-panel"],
    },
  });

  assert.equal(contract.generationMode, "workspace-operations");
  assert.equal(contract.surfaceMutationModel, "queue-workspace");
  assert.equal(contract.generationIntent.primaryAction.actionIntent, "operate");
  assert.equal(contract.visibleMutationTargets.includes("queue-panel"), true);
  assert.equal(contract.forbiddenGenericPatterns.includes("generic-marketing-shell"), true);
});
