import test from "node:test";
import assert from "node:assert/strict";

import { createOwnershipPolicyModel } from "../src/core/ownership-policy-model.js";

test("ownership policy model returns canonical ownership policy", () => {
  const { ownershipPolicy } = createOwnershipPolicyModel({
    userId: "user_123",
    projectId: "giftwallet",
    linkedAccounts: [
      {
        accountRecord: {
          accountId: "acc_1",
          accountType: "hosting",
        },
      },
    ],
    releasePlan: {
      releaseTarget: "web-deployment",
    },
    artifactRecord: {
      artifactId: "artifact_1",
      artifacts: ["web-bundle"],
    },
  });

  assert.equal(ownershipPolicy.ownerUserId, "user_123");
  assert.equal(ownershipPolicy.projectId, "giftwallet");
  assert.equal(Array.isArray(ownershipPolicy.assets.assetIds), true);
  assert.equal(Array.isArray(ownershipPolicy.accounts.accountIds), true);
  assert.equal(Array.isArray(ownershipPolicy.distributionTargets.targets), true);
  assert.equal(ownershipPolicy.policyStatus, "owner-controlled");
});

test("ownership policy model falls back to project owner surrogate", () => {
  const { ownershipPolicy } = createOwnershipPolicyModel({
    projectId: "giftwallet",
  });

  assert.equal(ownershipPolicy.ownerUserId, "project-owner:giftwallet");
});
