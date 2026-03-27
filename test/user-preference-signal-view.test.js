import test from "node:test";
import assert from "node:assert/strict";

import { createUserPreferenceSignalView } from "../src/core/user-preference-signal-view.js";

test("user preference signal view combines explicit preferences and approval feedback", () => {
  const { userPreferenceSignals } = createUserPreferenceSignalView({
    userPreferenceProfile: {
      profileId: "profile-1",
      preferences: [
        {
          preferenceId: "pref-1",
          label: "Prefers explicit approval steps",
          influence: "Recommendations should stay explicit when approvals are involved.",
          strength: "high",
        },
      ],
    },
    approvalFeedbackMemory: [
      {
        approvalRecordId: "approval-1",
        actionType: "deploy",
        status: "approved",
        summary: "The user usually approves staged deploy recommendations.",
      },
    ],
  });

  assert.equal(userPreferenceSignals.summary.totalSignals, 2);
  assert.equal(userPreferenceSignals.summary.profileSignals, 1);
  assert.equal(userPreferenceSignals.summary.approvalSignals, 1);
  assert.equal(userPreferenceSignals.summary.hasStablePreference, true);
  assert.equal(userPreferenceSignals.signals[1].source, "approval-feedback-memory");
});

test("user preference signal view falls back safely when preference inputs are missing", () => {
  const { userPreferenceSignals } = createUserPreferenceSignalView();

  assert.equal(Array.isArray(userPreferenceSignals.signals), true);
  assert.equal(userPreferenceSignals.summary.totalSignals, 0);
  assert.equal(userPreferenceSignals.summary.hasStablePreference, false);
});
