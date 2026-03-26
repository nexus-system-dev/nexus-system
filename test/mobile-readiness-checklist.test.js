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
