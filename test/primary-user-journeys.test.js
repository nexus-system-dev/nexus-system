import test from "node:test";
import assert from "node:assert/strict";

import { definePrimaryUserJourneys } from "../src/core/primary-user-journeys.js";

test("primary user journeys returns canonical journeys for onboarding execution release and growth", () => {
  const { userJourneys, journeySteps } = definePrimaryUserJourneys({
    productGoals: ["להשיק את Nexus"],
    coreCapabilities: [{ label: "auth" }, { label: "release" }, { label: "growth" }],
    businessContext: {
      targetAudience: "product teams",
      gtmStage: "build",
    },
    growthMarketingPlan: [{ id: "growth-onboarding-flow" }],
  });

  assert.equal(userJourneys.goals[0], "להשיק את Nexus");
  assert.equal(userJourneys.capabilities.includes("auth"), true);
  assert.equal(userJourneys.targetAudience, "product teams");
  assert.equal(userJourneys.journeys.some((journey) => journey.journeyId === "journey-onboarding"), true);
  assert.equal(userJourneys.journeys.some((journey) => journey.journeyId === "journey-growth"), true);
  assert.equal(Array.isArray(journeySteps), true);
  assert.equal(journeySteps.some((step) => step.journeyId === "journey-execution"), true);
});
