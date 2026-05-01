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

test("goal and CTA module omits primary action when the screen contract marks it optional", () => {
  const result = createGoalAndCtaDefinitionModule({
    screenContract: {
      screenType: "detail",
      interactionModel: {
        primaryActionRequired: false,
        secondaryActionsSupported: true,
      },
    },
  });

  assert.equal(result.primaryAction, null);
  assert.equal(result.secondaryActions.some((action) => action.label === "ביטול"), true);
});

test("goal and CTA module normalizes unknown and drifted screen types before deriving CTAs", () => {
  const unknownType = createGoalAndCtaDefinitionModule({
    screenContract: {
      screenType: "modal",
      interactionModel: {
        primaryActionRequired: true,
        secondaryActionsSupported: true,
      },
    },
  });
  const normalizedWorkspace = createGoalAndCtaDefinitionModule({
    screenContract: {
      screenType: "  WORKSPACE  ",
      interactionModel: {
        primaryActionRequired: true,
        secondaryActionsSupported: true,
      },
    },
  });

  assert.equal(unknownType.primaryAction?.actionId, "confirm-screen-action");
  assert.equal(unknownType.screenGoal, "להציג מידע ברור ולאפשר המשך פעולה");
  assert.equal(normalizedWorkspace.primaryAction?.actionId, "apply-workspace-update");
  assert.equal(normalizedWorkspace.screenGoal, "לאפשר עבודה ממוקדת על תוכן, תכנון או ניתוח");
});
