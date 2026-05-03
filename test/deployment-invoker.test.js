import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentInvoker } from "../src/core/deployment-invoker.js";

test("deployment invoker returns invoked deployment state for ready execution result", () => {
  const { deploymentInvocation } = createDeploymentInvoker({
    canonicalExecutionResultEnvelope: {
      summary: {
        isReadyForDeploymentReality: true,
      },
      blockedReasons: [],
    },
    deploymentRequest: {
      requestId: "deployment-request-web",
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      buildArtifacts: ["index.html", "app.js"],
      deploymentConfig: {
        executionMode: "api",
        strategy: "rolling",
      },
    },
    providerAdapter: {
      provider: "vercel",
      target: "web-deployment",
      capabilities: ["preview-deployments", "production-deployments"],
      executionModes: ["api"],
    },
  });

  assert.equal(deploymentInvocation.status, "invoked");
  assert.equal(deploymentInvocation.provider, "vercel");
  assert.equal(deploymentInvocation.invocationReceipt?.artifactCount, 2);
  assert.equal(deploymentInvocation.invocationSummary.canCollectEvidenceNext, true);
});

test("deployment invoker blocks when execution result is not ready", () => {
  const { deploymentInvocation } = createDeploymentInvoker({
    canonicalExecutionResultEnvelope: {
      summary: {
        isReadyForDeploymentReality: false,
      },
      blockedReasons: [],
    },
    deploymentRequest: {
      requestId: "deployment-request-preview",
      buildArtifacts: ["preview.html"],
    },
    providerAdapter: {
      provider: "generic",
    },
  });

  assert.equal(deploymentInvocation.status, "blocked");
  assert.equal(deploymentInvocation.blockedReasons.includes("execution-result-unready"), true);
});

test("deployment invoker blocks when deployment artifacts are missing", () => {
  const { deploymentInvocation } = createDeploymentInvoker({
    canonicalExecutionResultEnvelope: {
      summary: {
        isReadyForDeploymentReality: true,
      },
      blockedReasons: [],
    },
    deploymentRequest: {
      requestId: "deployment-request-empty",
      buildArtifacts: [],
    },
    providerAdapter: {
      provider: "vercel",
    },
  });

  assert.equal(deploymentInvocation.status, "blocked");
  assert.equal(deploymentInvocation.blockedReasons.includes("deployment-artifacts-missing"), true);
});
