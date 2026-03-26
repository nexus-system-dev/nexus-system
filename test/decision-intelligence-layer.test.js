import test from "node:test";
import assert from "node:assert/strict";

import { buildDecisionIntelligenceLayer } from "../src/core/decision-intelligence-layer.js";

test("decision intelligence layer classifies approvals executable paths and uncertainty", () => {
  const decisionIntelligence = buildDecisionIntelligenceLayer({
    approvals: ["Confirm production domain"],
    requiredActions: ["Define acquisition funnel"],
    recommendedDefaults: {
      provisional: true,
    },
    businessContext: {
      funnel: {
        acquisition: "needs-definition",
        conversion: "blocked",
      },
      constraints: ["defaults-need-confirmation"],
    },
    executionModes: ["agent", "temp-branch"],
    stackRecommendation: {
      frontend: "nextjs",
      backend: "node",
    },
    domain: "saas",
    domainClassification: {
      domain: "saas",
      confidenceScores: {
        saas: 0.7,
      },
    },
  });

  assert.equal(decisionIntelligence.summary.requiresApproval, true);
  assert.equal(decisionIntelligence.summary.canAutoExecute, false);
  assert.equal(decisionIntelligence.summary.hasUncertainty, true);
  assert.equal(decisionIntelligence.approvalRequired.length >= 2, true);
  assert.equal(decisionIntelligence.autoExecutable.length >= 1, true);
  assert.equal(decisionIntelligence.uncertain.length >= 2, true);
  assert.equal(decisionIntelligence.decisionTypes.includes("approval-required"), true);
  assert.equal(decisionIntelligence.decisionTypes.includes("auto-executable"), true);
  assert.equal(decisionIntelligence.decisionTypes.includes("uncertain"), true);
});
