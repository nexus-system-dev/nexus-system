import test from "node:test";
import assert from "node:assert/strict";

import { createJourneyMap } from "../src/core/journey-map.js";

test("journey map returns canonical flows and transitions", () => {
  const { journeyMap } = createJourneyMap({
    userJourneys: {
      goals: ["להשיק מוצר"],
      journeys: [
        {
          journeyId: "journey-onboarding",
          name: "Project Onboarding",
          intent: "collect intake",
          steps: [
            { stepId: "capture-intake", label: "Capture intake" },
            { stepId: "confirm-project", label: "Confirm project" },
          ],
        },
        {
          journeyId: "journey-execution",
          name: "Execution Management",
          intent: "manage execution",
          steps: [
            { stepId: "review-state", label: "Review state" },
          ],
        },
      ],
    },
  });

  assert.equal(journeyMap.summary.totalJourneys, 2);
  assert.equal(journeyMap.summary.totalSteps, 3);
  assert.equal(journeyMap.flows[0].flowType, "onboarding");
  assert.equal(journeyMap.flows[0].transitions[0].toStepId, "confirm-project");
  assert.equal(journeyMap.flows[1].transitions[0].isTerminal, true);
});
