import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineUserPreferenceProfileAssembler } from "../src/core/baseline-user-preference-profile-assembler.js";

test("baseline user preference profile assembler derives deterministic profile from notification and approval state", () => {
  const { userPreferenceProfile } = createBaselineUserPreferenceProfileAssembler({
    userIdentity: {
      userId: "user-1",
    },
    notificationPreferences: {
      frequency: "digest",
      channels: ["in-app", "email"],
    },
    approvalRecords: [
      {
        approvalRecordId: "approval-1",
        status: "pending",
      },
    ],
    approvalStatus: {
      status: "pending",
      requiresApproval: true,
      reason: "Approval is still required before continuing.",
    },
  });

  assert.equal(userPreferenceProfile.profileId, "baseline-user-preferences:user-1");
  assert.equal(userPreferenceProfile.companionMode, "active");
  assert.equal(userPreferenceProfile.summary.totalPreferences, 2);
  assert.equal(userPreferenceProfile.summary.hasApprovalAwarePreference, true);
  assert.equal(userPreferenceProfile.summary.notificationFrequency, "digest");
});

test("baseline user preference profile assembler falls back to a canonical assistive profile", () => {
  const { userPreferenceProfile } = createBaselineUserPreferenceProfileAssembler();

  assert.equal(userPreferenceProfile.profileId, "baseline-user-preferences:anonymous");
  assert.equal(userPreferenceProfile.companionMode, "assistive");
  assert.equal(Array.isArray(userPreferenceProfile.preferences), true);
  assert.equal(userPreferenceProfile.summary.totalPreferences, 0);
  assert.equal(userPreferenceProfile.summary.notificationFrequency, "realtime");
});
