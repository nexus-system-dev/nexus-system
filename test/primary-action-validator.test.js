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

test("createPrimaryActionValidator normalizes malformed identifiers and action payloads", () => {
  const { primaryActionValidation } = createPrimaryActionValidator({
    screenId: { bad: true },
    screenContract: {
      screenType: " detail ",
      primaryAction: {
        actionId: " save-detail ",
        label: " שמור ",
        intent: 42,
      },
    },
    screenTemplate: {
      templateType: " detail ",
      sections: {
        footerActions: { enabled: true },
      },
    },
  });

  assert.equal(primaryActionValidation.validationId, "primary-action-validation:detail");
  assert.equal(primaryActionValidation.screenId, null);
  assert.equal(primaryActionValidation.screenType, "detail");
  assert.equal(primaryActionValidation.templateType, "detail");
  assert.deepEqual(primaryActionValidation.primaryAction, {
    actionId: "save-detail",
    label: "שמור",
    intent: "primary",
  });
  assert.equal(primaryActionValidation.actionZone, "footerActions");
  assert.equal(primaryActionValidation.summary.isValid, true);
});
