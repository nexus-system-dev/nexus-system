import test from "node:test";
import assert from "node:assert/strict";

import { createMobileUsabilityValidator } from "../src/core/mobile-usability-validator.js";

test("createMobileUsabilityValidator validates management screen with responsive zone", () => {
  const { mobileValidation } = createMobileUsabilityValidator({
    screenId: "management-screen",
    screenTemplate: {
      templateType: "management",
      sections: {
        filterBar: { enabled: true },
        dataTable: { enabled: true },
      },
    },
    mobileChecklist: {
      screenType: "tracking",
      supportsMobile: true,
      checklistItems: [
        { key: "viewport-fit", required: true },
        { key: "touch-targets", required: true },
      ],
    },
  });

  assert.equal(mobileValidation.summary.supportsMobile, true);
  assert.equal(mobileValidation.summary.handlesDenseRegions, true);
  assert.equal(mobileValidation.summary.isUsable, true);
  assert.equal(mobileValidation.responsiveZone, "filterBar");
});

test("createMobileUsabilityValidator blocks screen without checklist or responsive zone", () => {
  const { mobileValidation } = createMobileUsabilityValidator({
    screenId: "broken-screen",
    screenTemplate: {
      templateType: "dashboard",
      sections: {},
    },
    mobileChecklist: {
      screenType: "dashboard",
      supportsMobile: true,
      checklistItems: [],
    },
  });

  assert.equal(mobileValidation.summary.isUsable, false);
  assert.deepEqual(mobileValidation.blockingIssues, [
    "missing-mobile-checklist",
    "missing-responsive-zone",
  ]);
});
