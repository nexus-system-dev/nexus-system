import test from "node:test";
import assert from "node:assert/strict";

import { createPrimaryActionValidator } from "../src/core/primary-action-validator.js";

test("createPrimaryActionValidator validates workflow primary action against footer actions", () => {
  const { primaryActionValidation } = createPrimaryActionValidator({
    screenId: "wizard-screen",
    screenContract: {
      screenType: "wizard",
      primaryAction: {
        actionId: "continue-flow",
        label: "המשך",
        intent: "progress",
      },
    },
    screenTemplate: {
      templateType: "workflow",
      sections: {
        footerActions: { enabled: true },
      },
    },
  });

  assert.equal(primaryActionValidation.summary.hasPrimaryAction, true);
  assert.equal(primaryActionValidation.summary.hasActionZone, true);
  assert.equal(primaryActionValidation.summary.isValid, true);
  assert.equal(primaryActionValidation.actionZone, "footerActions");
});

test("createPrimaryActionValidator reports missing action when screen contract is incomplete", () => {
  const { primaryActionValidation } = createPrimaryActionValidator({
    screenId: "detail-screen",
    screenContract: {
      screenType: "detail",
    },
    screenTemplate: {
      templateType: "detail",
      sections: {
        topbar: { enabled: true },
      },
    },
  });

  assert.equal(primaryActionValidation.summary.hasPrimaryAction, false);
  assert.equal(primaryActionValidation.summary.isValid, false);
  assert.deepEqual(primaryActionValidation.blockingIssues, ["missing-primary-action"]);
});
