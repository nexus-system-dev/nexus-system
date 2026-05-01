import test from "node:test";
import assert from "node:assert/strict";

import { createMobileReadinessChecklist } from "../src/core/mobile-readiness-checklist.js";

test("mobile readiness checklist builds required mobile rules for workspace screens", () => {
  const { mobileChecklist } = createMobileReadinessChecklist({
    screenId: "developer-workspace",
    title: "Developer Workspace",
    screenContract: {
      screenType: "workspace",
      layout: {
        layout: "workspace",
        supportsSidebar: true,
        supportsProgress: false,
      },
      stateSupport: {
        loading: true,
        error: true,
        success: true,
      },
      interactionModel: {
        primaryActionRequired: true,
        supportsMobile: true,
      },
    },
  });

  assert.equal(mobileChecklist.screenType, "workspace");
  assert.equal(mobileChecklist.supportsMobile, true);
  assert.equal(Array.isArray(mobileChecklist.checklistItems), true);
  assert.equal(mobileChecklist.checklistItems.some((item) => item.key === "navigation-collapse"), true);
  assert.equal(mobileChecklist.warnings.includes("Workspace צפוף דורש היררכיית panels ברורה ויכולת החלפה מהירה בין אזורים."), true);
  assert.equal(mobileChecklist.summary.requiredItems > 0, true);
});

test("mobile readiness checklist falls back safely for missing contract", () => {
  const { mobileChecklist } = createMobileReadinessChecklist({});

  assert.equal(mobileChecklist.screenType, "detail");
  assert.equal(mobileChecklist.supportsMobile, true);
  assert.equal(typeof mobileChecklist.checklistId, "string");
  assert.equal(Array.isArray(mobileChecklist.checklistItems), true);
});

test("mobile readiness checklist treats non-boolean mobile support flags as fallback-safe values", () => {
  const { mobileChecklist } = createMobileReadinessChecklist({
    screenContract: {
      screenType: "detail",
      interactionModel: {
        supportsMobile: "no",
      },
    },
  });

  assert.equal(mobileChecklist.supportsMobile, true);
  assert.equal(mobileChecklist.summary.mobileReadyByContract, true);
});

test("mobile readiness checklist keeps state coverage status consistent with required flag", () => {
  const { mobileChecklist } = createMobileReadinessChecklist({
    screenContract: {
      screenType: "detail",
      layout: {
        layout: "detail",
        supportsSidebar: false,
        supportsProgress: false,
      },
      stateSupport: {
        loading: false,
        error: false,
        success: false,
      },
      interactionModel: {
        primaryActionRequired: false,
        supportsMobile: true,
      },
    },
  });

  const stateCoverage = mobileChecklist.checklistItems.find((item) => item.key === "state-coverage");
  const primaryActionAccess = mobileChecklist.checklistItems.find((item) => item.key === "primary-action-access");

  assert.equal(stateCoverage?.required, false);
  assert.equal(stateCoverage?.status, "optional");
  assert.equal(primaryActionAccess?.required, false);
  assert.equal(primaryActionAccess?.status, "optional");
});
