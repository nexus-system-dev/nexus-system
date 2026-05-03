import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseReadinessEvaluator } from "../src/core/release-readiness-evaluator.js";

test("release readiness evaluator returns ready when launch, health, deployment, and workspace are clear", () => {
  const { releaseReadinessEvaluation } = createReleaseReadinessEvaluator({
    launchConfirmationState: {
      launchEnvironment: "production",
      releaseTarget: "web-deployment",
      summary: {
        confirmed: true,
      },
    },
    productionHealthValidation: {
      summary: {
        canConfirmLaunch: true,
      },
    },
    deploymentResultEnvelope: {
      requestId: "deployment-request-web",
      environment: "production",
      summary: {
        isReadyForLaunchVerification: true,
      },
    },
    releaseWorkspace: {
      releaseTarget: "web-deployment",
      summary: {
        isBlocked: false,
      },
    },
  });

  assert.equal(releaseReadinessEvaluation.status, "ready");
  assert.equal(releaseReadinessEvaluation.readinessDecision, "launch-ready");
  assert.equal(releaseReadinessEvaluation.summary.readinessScore, 100);
  assert.equal(releaseReadinessEvaluation.summary.nextAction, "launch-approved");
});

test("release readiness evaluator blocks when any launch prerequisite remains unresolved", () => {
  const { releaseReadinessEvaluation } = createReleaseReadinessEvaluator({
    launchConfirmationState: {
      summary: {
        confirmed: false,
      },
    },
    productionHealthValidation: {
      summary: {
        canConfirmLaunch: false,
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

  assert.equal(releaseReadinessEvaluation.status, "blocked");
  assert.equal(releaseReadinessEvaluation.blockedReasons.includes("launch-unconfirmed"), true);
  assert.equal(releaseReadinessEvaluation.blockedReasons.includes("production-health-unready"), true);
  assert.equal(releaseReadinessEvaluation.blockedReasons.includes("deployment-result-unready"), true);
  assert.equal(releaseReadinessEvaluation.blockedReasons.includes("release-workspace-blocked"), true);
});
