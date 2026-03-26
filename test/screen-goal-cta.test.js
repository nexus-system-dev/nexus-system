import test from "node:test";
import assert from "node:assert/strict";

import { createGoalAndCtaDefinitionModule } from "../src/core/screen-goal-cta.js";

test("goal and CTA module returns wizard goal and continue action", () => {
  const result = createGoalAndCtaDefinitionModule({
    screenContract: {
      screenType: "wizard",
    },
  });

  assert.equal(result.screenGoal, "להוביל את המשתמש להשלים צעד ברור בזרימה");
  assert.equal(result.primaryAction.label, "המשך");
  assert.equal(result.secondaryActions[0].label, "חזרה");
});

test("goal and CTA module returns dashboard action set", () => {
  const result = createGoalAndCtaDefinitionModule({
    screenContract: {
      screenType: "dashboard",
    },
  });

  assert.equal(result.primaryAction.label, "הצעד הבא");
  assert.equal(result.secondaryActions.some((action) => action.label === "רענון"), true);
});
