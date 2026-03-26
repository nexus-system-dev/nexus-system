import test from "node:test";
import assert from "node:assert/strict";

import { defineV1AcceptanceScenarioSchema } from "../src/core/v1-acceptance-scenario-schema.js";

test("v1 acceptance scenario schema returns canonical scenarios for core product flows", () => {
  const { acceptanceScenario } = defineV1AcceptanceScenarioSchema({
    productFlows: [
      {
        journeyId: "journey-onboarding",
        flowType: "onboarding",
        entryStepId: "capture-intake",
        intent: "Move from intake to first value",
      },
      {
        journeyId: "journey-execution",
        flowType: "execution",
        entryStepId: "review-state",
        intent: "Move execution forward safely",
      },
    ],
    expectedOutcomes: [
      {
        scenarioKey: "onboarding-first-value",
        expectedOutcome: "User gets a first visible result",
        successCriteria: ["firstValueOutput", "firstValueSummary"],
      },
    ],
  });

  assert.equal(acceptanceScenario.acceptanceScenarioId, "v1-acceptance-scenarios");
  assert.equal(acceptanceScenario.summary.totalScenarios >= 5, true);
  assert.equal(acceptanceScenario.scenarios[0].scenarioKey, "onboarding-first-value");
  assert.equal(Array.isArray(acceptanceScenario.summary.coveredFlowTypes), true);
});

test("v1 acceptance scenario schema falls back safely with partial inputs", () => {
  const { acceptanceScenario } = defineV1AcceptanceScenarioSchema();

  assert.equal(typeof acceptanceScenario.acceptanceScenarioId, "string");
  assert.equal(Array.isArray(acceptanceScenario.scenarios), true);
  assert.equal(acceptanceScenario.summary.totalScenarios >= 1, true);
});
