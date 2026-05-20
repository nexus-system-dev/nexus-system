import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentStateFeedbackContract } from "../src/core/deployment-state-feedback-contract.js";

test("deployment state feedback contract makes deploy progress visible", () => {
  const { deploymentStateFeedbackContract } = createDeploymentStateFeedbackContract({
    classAwareDeploymentReleasePath: {
      modelId: "deployment-release-path:saas",
      providerType: "render",
      primaryTarget: "web-deployment",
      nextGate: "verify-runtime-and-promote-service",
    },
    deployPolicyDecision: {
      decision: "allowed",
      checks: [],
    },
    deploymentResultEnvelope: {
      status: "ready",
      outcome: "accepted",
      provider: "render",
      target: "web-deployment",
      environment: "staging",
      blockedReasons: [],
    },
    launchConfirmationState: {
      status: "blocked",
      decision: "blocked",
      launchEnvironment: "staging",
      blockedReasons: ["production-health-unconfirmed"],
    },
    statusEvents: [
      { status: "published" },
    ],
    pollingMetadata: {
      nextPollInSeconds: null,
    },
  });

  assert.equal(deploymentStateFeedbackContract.status, "blocked");
  assert.equal(deploymentStateFeedbackContract.providerType, "render");
  assert.equal(deploymentStateFeedbackContract.latestProviderStatus, "published");
  assert.equal(deploymentStateFeedbackContract.feedbackItems[0].label, "Policy decision");
});
