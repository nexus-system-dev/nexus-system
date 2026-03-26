import test from "node:test";
import assert from "node:assert/strict";

import { createOnboardingToFirstValueAcceptanceTest } from "../src/core/onboarding-to-first-value-acceptance-test.js";

test("onboarding to first value acceptance test passes when scenario and visible output exist", () => {
  const { acceptanceResult } = createOnboardingToFirstValueAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "onboarding-first-value",
          expectedOutcome: "User gets a first visible result",
          requiredOutputs: ["firstValueOutput", "firstValueSummary"],
        },
      ],
    },
    firstValueOutput: {
      outputId: "first-value:giftwallet",
      preview: {
        headline: "First project artifacts are ready",
      },
      summary: {
        feelsReal: true,
      },
    },
  });

  assert.equal(acceptanceResult.status, "passed");
  assert.equal(acceptanceResult.summary.passed, true);
  assert.equal(acceptanceResult.checks.hasVisibleOutcome, true);
});

test("onboarding to first value acceptance test fails safely when first value is missing", () => {
  const { acceptanceResult } = createOnboardingToFirstValueAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "onboarding-first-value",
        },
      ],
    },
  });

  assert.equal(acceptanceResult.status, "failed");
  assert.equal(acceptanceResult.summary.passed, false);
  assert.equal(acceptanceResult.checks.hasVisibleOutcome, false);
});
