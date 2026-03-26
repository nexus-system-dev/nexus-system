import test from "node:test";
import assert from "node:assert/strict";

import { defineScreenInventory } from "../src/core/screen-inventory.js";

test("screen inventory derives screens from journey map", () => {
  const { screenInventory } = defineScreenInventory({
    journeyMap: {
      goals: ["להשיק מוצר"],
      flows: [
        {
          journeyId: "journey-onboarding",
          flowType: "onboarding",
          steps: [
            { stepId: "capture-intake", label: "Capture intake" },
            { stepId: "confirm-project", label: "Confirm project" },
          ],
        },
        {
          journeyId: "journey-execution",
          flowType: "execution",
          steps: [
            { stepId: "track-progress", label: "Track progress" },
          ],
        },
      ],
    },
  });

  assert.equal(screenInventory.summary.totalScreens, 3);
  assert.equal(screenInventory.screens[0].screenType, "wizard");
  assert.equal(screenInventory.screens[2].screenType, "dashboard");
  assert.equal(screenInventory.summary.flowsCovered.includes("execution"), true);
});
