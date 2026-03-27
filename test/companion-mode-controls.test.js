import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionModeControls } from "../src/core/companion-mode-controls.js";

test("companion mode controls select active mode when presence can interrupt", () => {
  const { companionModeSettings } = createCompanionModeControls({
    userPreferenceProfile: {
      profileId: "profile-1",
      preferences: [],
    },
    companionPresence: {
      presenceId: "companion-presence:nexus",
      urgency: "high",
      visible: true,
      summary: {
        canInterrupt: true,
      },
    },
  });

  assert.equal(companionModeSettings.selectedMode, "active");
  assert.equal(companionModeSettings.summary.allowsInterruptions, true);
});

test("companion mode controls respect explicit quiet preference", () => {
  const { companionModeSettings } = createCompanionModeControls({
    userPreferenceProfile: {
      profileId: "profile-2",
      companionMode: "quiet",
    },
    companionPresence: {
      presenceId: "companion-presence:nexus",
      visible: true,
    },
  });

  assert.equal(companionModeSettings.selectedMode, "quiet");
  assert.equal(companionModeSettings.visibilityOverride, "suppress");
});
