import test from "node:test";
import assert from "node:assert/strict";

import { createScreenValidationChecklist } from "../src/core/screen-validation-checklist.js";

test("screen validation checklist marks screen ready when mobile and states are covered", () => {
  const { screenValidationChecklist } = createScreenValidationChecklist({
    screenId: "project-dashboard",
    title: "Project Dashboard",
    screenContract: {
      screenType: "dashboard",
      interactionModel: {
        primaryActionRequired: true,
        supportsMobile: true,
      },
    },
    mobileChecklist: {
      checklistItems: [{ key: "viewport-fit" }],
    },
    screenStates: {
      states: {
        loading: { enabled: true },
        empty: { enabled: true },
        error: { enabled: true },
        success: { enabled: false },
      },
    },
  });

  assert.equal(screenValidationChecklist.screenType, "dashboard");
  assert.equal(screenValidationChecklist.summary.isReadyForImplementation, true);
  assert.equal(screenValidationChecklist.blockingIssues.length, 0);
});

test("screen validation checklist reports blocking issues when required layers are missing", () => {
  const { screenValidationChecklist } = createScreenValidationChecklist({
    screenContract: {
      screenType: "detail",
      interactionModel: {
        primaryActionRequired: false,
        supportsMobile: false,
      },
    },
    mobileChecklist: {},
    screenStates: {
      states: {
        loading: { enabled: false },
        error: { enabled: false },
        empty: { enabled: false },
        success: { enabled: false },
      },
    },
  });

  assert.equal(screenValidationChecklist.summary.isReadyForImplementation, false);
  assert.equal(screenValidationChecklist.blockingIssues.length > 0, true);
});
