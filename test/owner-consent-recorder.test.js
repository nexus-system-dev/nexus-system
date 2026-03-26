import test from "node:test";
import assert from "node:assert/strict";

import { createOwnerConsentRecorder } from "../src/core/owner-consent-recorder.js";

test("owner consent recorder returns canonical consent record", () => {
  const { consentRecord } = createOwnerConsentRecorder({
    projectId: "giftwallet",
    consentAction: {
      actionType: "release-distribution",
      target: "web-deployment",
      approved: true,
    },
    ownershipPolicy: {
      ownerUserId: "demo-user",
      distributionTargets: {
        targets: ["web-deployment"],
      },
    },
    existingApprovals: ["stack-approval"],
  });

  assert.equal(consentRecord.projectId, "giftwallet");
  assert.equal(consentRecord.ownerUserId, "demo-user");
  assert.equal(consentRecord.actionType, "release-distribution");
  assert.equal(consentRecord.target, "web-deployment");
  assert.equal(consentRecord.status, "recorded");
  assert.equal(Array.isArray(consentRecord.approvals), true);
});

test("owner consent recorder falls back to ownership target", () => {
  const { consentRecord } = createOwnerConsentRecorder({
    projectId: "giftwallet",
    ownershipPolicy: {
      ownerUserId: "demo-user",
      distributionTargets: {
        targets: ["private-distribution"],
      },
    },
  });

  assert.equal(consentRecord.target, "private-distribution");
  assert.equal(consentRecord.actionType, "distribution-consent");
});
