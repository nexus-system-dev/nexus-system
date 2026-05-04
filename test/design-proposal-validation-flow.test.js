import test from "node:test";
import assert from "node:assert/strict";

import { createDesignProposalValidationFlow } from "../src/core/design-proposal-validation-flow.js";

test("design proposal validation flow stays valid when structural checks and supplemental validators are ready", () => {
  const { designProposalValidation } = createDesignProposalValidationFlow({
    renderableDesignProposal: {
      proposalId: "proposal-1",
      regions: [{ regionId: "hero" }, { regionId: "timeline" }],
    },
    screenTemplateSchema: {
      templateId: "detail-template:release",
    },
    screenValidationChecklist: {
      signals: { density: "comfortable" },
    },
    screenContract: {
      regions: [{ regionId: "hero" }, { regionId: "timeline" }],
    },
    generatedAccessibilityValidationEngine: {
      validationEngineId: "generated-accessibility:proposal-1",
      status: "ready",
    },
    generatedSurfacePerformanceBudgetValidator: {
      performanceBudgetValidatorId: "generated-surface-performance:proposal-1",
      status: "ready",
    },
    generatedBrandConsistencyValidator: {
      brandConsistencyValidatorId: "generated-brand-consistency:proposal-1",
      status: "ready",
    },
  });

  assert.equal(designProposalValidation.status, "valid");
  assert.deepEqual(designProposalValidation.issues, []);
  assert.equal(designProposalValidation.summary.accessibilityStatus, "ready");
  assert.equal(designProposalValidation.summary.performanceStatus, "ready");
  assert.equal(designProposalValidation.summary.brandStatus, "ready");
});

test("design proposal validation flow becomes invalid when supplemental validators fail", () => {
  const { designProposalValidation } = createDesignProposalValidationFlow({
    renderableDesignProposal: {
      proposalId: "proposal-2",
      regions: [{ regionId: "hero" }],
    },
    screenTemplateSchema: {
      templateId: "detail-template:release",
    },
    screenValidationChecklist: {
      signals: { density: "comfortable" },
    },
    screenContract: {
      regions: [{ regionId: "hero" }],
    },
    generatedAccessibilityValidationEngine: {
      validationEngineId: "generated-accessibility:proposal-2",
      status: "needs-attention",
    },
    generatedSurfacePerformanceBudgetValidator: {
      performanceBudgetValidatorId: "generated-surface-performance:proposal-2",
      status: "ready",
    },
    generatedBrandConsistencyValidator: {
      brandConsistencyValidatorId: "generated-brand-consistency:proposal-2",
      status: "needs-attention",
    },
  });

  assert.equal(designProposalValidation.status, "invalid");
  assert.equal(designProposalValidation.issues.includes("accessibility-failed"), true);
  assert.equal(designProposalValidation.issues.includes("brand-consistency-failed"), true);
});
