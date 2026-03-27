import test from "node:test";
import assert from "node:assert/strict";

import { createScreenReviewAssembler } from "../src/core/screen-review-assembler.js";

test("createScreenReviewAssembler returns ready screen when all validators pass", () => {
  const { screenReviewReport } = createScreenReviewAssembler({
    primaryActionValidation: {
      screens: [{ screenId: "screen-1", screenType: "dashboard", summary: { isValid: true }, blockingIssues: [] }],
    },
    mobileValidation: {
      screens: [{ screenId: "screen-1", screenType: "dashboard", summary: { isUsable: true }, blockingIssues: [] }],
    },
    stateCoverageValidation: {
      screens: [{ screenId: "screen-1", screenType: "dashboard", summary: { isValid: true }, blockingIssues: [] }],
    },
    consistencyValidation: {
      screens: [{ screenId: "screen-1", templateType: "dashboard", summary: { isConsistent: true }, blockingIssues: [] }],
    },
  });

  assert.equal(screenReviewReport.summary.readyScreens, 1);
  assert.equal(screenReviewReport.screens[0].summary.isReady, true);
});

test("createScreenReviewAssembler aggregates blocking issues when validators fail", () => {
  const { screenReviewReport } = createScreenReviewAssembler({
    primaryActionValidation: {
      screens: [{ screenId: "screen-1", screenType: "detail", summary: { isValid: false }, blockingIssues: ["missing-primary-action"] }],
    },
    mobileValidation: {
      screens: [{ screenId: "screen-1", screenType: "detail", summary: { isUsable: false }, blockingIssues: ["missing-responsive-zone"] }],
    },
    stateCoverageValidation: {
      screens: [{ screenId: "screen-1", screenType: "detail", summary: { isValid: true }, blockingIssues: [] }],
    },
    consistencyValidation: {
      screens: [{ screenId: "screen-1", templateType: "detail", summary: { isConsistent: false }, blockingIssues: ["missing-component:badge"] }],
    },
  });

  assert.equal(screenReviewReport.summary.blockedScreens, 1);
  assert.deepEqual(screenReviewReport.screens[0].summary.blockingIssues, [
    "missing-primary-action",
    "missing-responsive-zone",
    "missing-component:badge",
  ]);
});
