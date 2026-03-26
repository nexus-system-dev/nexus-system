import test from "node:test";
import assert from "node:assert/strict";

import { createOwnershipAwareReleaseGuard } from "../src/core/ownership-aware-release-guard.js";

test("ownership-aware release guard allows owned release target", () => {
  const { guardResult } = createOwnershipAwareReleaseGuard({
    releasePlan: {
      releaseTarget: "web-deployment",
    },
    linkedAccounts: [
      {
        accountRecord: {
          accountId: "acc_1",
          accountType: "hosting",
        },
      },
    ],
    ownershipPolicy: {
      distributionTargets: {
        targets: ["web-deployment"],
      },
      accounts: {
        accountIds: ["acc_1"],
      },
      assets: {
        assetIds: ["artifact_1"],
      },
    },
  });

  assert.equal(guardResult.isAllowed, true);
  assert.equal(guardResult.status, "allowed");
});

test("ownership-aware release guard blocks unknown release target", () => {
  const { guardResult } = createOwnershipAwareReleaseGuard({
    releasePlan: {
      releaseTarget: "app-store",
    },
    linkedAccounts: [],
    ownershipPolicy: {
      distributionTargets: {
        targets: ["web-deployment"],
      },
      accounts: {
        accountIds: [],
      },
      assets: {
        assetIds: [],
      },
    },
  });

  assert.equal(guardResult.isAllowed, false);
  assert.equal(guardResult.status, "blocked");
});
