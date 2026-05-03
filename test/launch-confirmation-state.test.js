import test from "node:test";
import assert from "node:assert/strict";

import { createLaunchConfirmationState } from "../src/core/launch-confirmation-state.js";

test("launch confirmation state confirms launch when health and workspace are ready", () => {
  const { launchConfirmationState } = createLaunchConfirmationState({
    productionHealthValidation: {
      launchEnvironment: "production",
      healthStatus: "stable",
      releaseStatus: "active",
      blockedReasons: [],
      summary: {
        canConfirmLaunch: true,
        failedChecks: 0,
      },
    },
    deploymentResultEnvelope: {
      requestId: "deployment-request-web",
      environment: "production",
      outcome: "accepted",
      summary: {
        isReadyForLaunchVerification: true,
      },
    },
    releaseWorkspace: {
      releaseTarget: "web-deployment",
      buildAndDeploy: {
        currentStatus: "published",
      },
      summary: {
        isBlocked: false,
      },
    },
  });

  assert.equal(launchConfirmationState.status, "ready");
  assert.equal(launchConfirmationState.decision, "confirmed");
  assert.equal(launchConfirmationState.summary.confirmed, true);
  assert.equal(launchConfirmationState.summary.nextAction, "proceed-to-readiness-evaluation");
});

test("launch confirmation state blocks launch when health gate or workspace is blocked", () => {
  const { launchConfirmationState } = createLaunchConfirmationState({
    productionHealthValidation: {
      blockedReasons: ["production-health-degraded"],
      summary: {
        canConfirmLaunch: false,
        failedChecks: 2,
      },
    },
    deploymentResultEnvelope: {
      summary: {
        isReadyForLaunchVerification: false,
      },
    },
    releaseWorkspace: {
      summary: {
        isBlocked: true,
      },
    },
  });

  assert.equal(launchConfirmationState.status, "blocked");
  assert.equal(launchConfirmationState.blockedReasons.includes("production-health-degraded"), true);
  assert.equal(launchConfirmationState.blockedReasons.includes("deployment-result-unready"), true);
  assert.equal(launchConfirmationState.blockedReasons.includes("release-workspace-blocked"), true);
});
