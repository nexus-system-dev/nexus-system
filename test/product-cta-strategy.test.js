import test from "node:test";
import assert from "node:assert/strict";

import { createProductCtaStrategy } from "../src/core/product-cta-strategy.js";

test("product CTA strategy prioritizes project start when activation is already in motion", () => {
  const { productCtaStrategy } = createProductCtaStrategy({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
      audience: "product operators",
      headline: "Nexus executes scoped work with governed multi-agent flows",
      ctaAngles: [
        {
          ctaAngleId: "cta-angle:start-execution",
          reason: "Execution starts from a scoped project.",
        },
      ],
    },
    activationGoals: {
      status: "ready",
      goals: [
        { goalId: "activation-goal:request-access", goalType: "request-access", priority: 4 },
        { goalId: "activation-goal:complete-onboarding", goalType: "complete-onboarding", priority: 3 },
        { goalId: "activation-goal:start-first-project", goalType: "start-first-project", priority: 1 },
        { goalId: "activation-goal:reach-first-value", goalType: "reach-first-value", priority: 2 },
      ],
    },
    analyticsSummary: {
      totalProjectsCreated: 3,
    },
  });

  assert.equal(productCtaStrategy.status, "ready");
  assert.equal(productCtaStrategy.primaryCta.label, "Start project");
  assert.deepEqual(productCtaStrategy.activationGoalOrder, [
    "activation-goal:start-first-project",
    "activation-goal:reach-first-value",
    "activation-goal:complete-onboarding",
    "activation-goal:request-access",
  ]);
  assert.equal(productCtaStrategy.secondaryCtas[1].label, "Book demo");
});

test("product CTA strategy exposes missing-inputs when activation goals are absent", () => {
  const { productCtaStrategy } = createProductCtaStrategy({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
    },
  });

  assert.equal(productCtaStrategy.status, "missing-inputs");
  assert.deepEqual(productCtaStrategy.missingInputs, ["activationGoals"]);
  assert.equal(productCtaStrategy.primaryCta, null);
});
