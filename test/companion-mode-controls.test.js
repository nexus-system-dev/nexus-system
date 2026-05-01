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

test("companion mode controls fall back to assistive mode when no stronger preference exists", () => {
  const { companionModeSettings } = createCompanionModeControls({
    userPreferenceProfile: {
      profileId: "profile-3",
      preferences: [],
    },
    companionPresence: {
      presenceId: "companion-presence:nexus",
      urgency: "low",
      visible: true,
      summary: {
        canInterrupt: false,
      },
    },
  });

  assert.equal(companionModeSettings.selectedMode, "assistive");
  assert.equal(companionModeSettings.visibilityOverride, "ambient");
  assert.equal(companionModeSettings.summary.prefersAmbientSupport, true);
});

test("companion mode controls normalizes malformed identifiers and preference strings", () => {
  const { companionModeSettings } = createCompanionModeControls({
    userPreferenceProfile: {
      profileId: "   ",
      companionMode: "   ",
      preferences: [{ label: "  QUIET-MODE " }],
    },
    companionPresence: {
      presenceId: "   ",
      urgency: " HIGH ",
      visible: true,
      summary: {
        canInterrupt: false,
      },
    },
  });

  assert.equal(companionModeSettings.settingsId, "companion-mode:project");
  assert.equal(companionModeSettings.selectedMode, "quiet");
  assert.equal(companionModeSettings.visibilityOverride, "suppress");
  assert.equal(companionModeSettings.summary.suppressesCompanion, true);
});
