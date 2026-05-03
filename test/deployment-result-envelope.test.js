import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentResultEnvelope } from "../src/core/deployment-result-envelope.js";

test("deployment result envelope returns ready deployment result for collected evidence", () => {
  const { deploymentResultEnvelope } = createDeploymentResultEnvelope({
    deploymentInvocation: {
      status: "invoked",
      requestId: "deployment-request-web",
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      invocationReceipt: {
        receiptId: "deployment-receipt:deployment-request-web",
      },
      blockedReasons: [],
    },
    deploymentEvidence: {
      status: "collected",
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      receipt: {
        receiptId: "deployment-receipt:deployment-request-web",
      },
      artifacts: [{ name: "index.html" }, { name: "app.js" }],
      outputPaths: ["dist/index.html", "dist/app.js"],
      evidenceRefs: ["dispatch-receipt:req-1"],
      blockedReasons: [],
      summary: {
        artifactCount: 2,
        canAdvanceToDeploymentResult: true,
      },
    },
    canonicalExecutionResultEnvelope: {
      outcome: "accepted",
      evidenceRefs: ["command-console:test-project"],
      summary: {
        isReadyForDeploymentReality: true,
      },
    },
  });

  assert.equal(deploymentResultEnvelope.status, "ready");
  assert.equal(deploymentResultEnvelope.outcome, "accepted");
  assert.equal(deploymentResultEnvelope.summary.hasReceipt, true);
  assert.equal(deploymentResultEnvelope.summary.isReadyForLaunchVerification, true);
});

test("deployment result envelope blocks when deployment evidence is not ready", () => {
  const { deploymentResultEnvelope } = createDeploymentResultEnvelope({
    deploymentInvocation: {
      status: "blocked",
      blockedReasons: ["execution-result-unready"],
    },
    deploymentEvidence: {
      status: "blocked",
      blockedReasons: ["deployment-invocation-unready"],
      summary: {
        canAdvanceToDeploymentResult: false,
      },
    },
    canonicalExecutionResultEnvelope: {
      summary: {
        isReadyForDeploymentReality: false,
      },
    },
  });

  assert.equal(deploymentResultEnvelope.status, "blocked");
  assert.equal(deploymentResultEnvelope.blockedReasons.includes("deployment-evidence-unready"), true);
  assert.equal(deploymentResultEnvelope.blockedReasons.includes("execution-envelope-unready"), true);
});

test("deployment result envelope preserves artifact and evidence references", () => {
  const { deploymentResultEnvelope } = createDeploymentResultEnvelope({
    deploymentInvocation: {
      status: "invoked",
      requestId: "deployment-request-preview",
      blockedReasons: [],
    },
    deploymentEvidence: {
      artifacts: [{ name: "preview.html" }],
      outputPaths: ["dist/preview.html"],
      evidenceRefs: ["deployment-receipt:preview"],
      blockedReasons: [],
      summary: {
        canAdvanceToDeploymentResult: true,
      },
    },
    canonicalExecutionResultEnvelope: {
      evidenceRefs: ["dispatch-receipt:req-2"],
      summary: {
        isReadyForDeploymentReality: true,
      },
    },
  });

  assert.equal(deploymentResultEnvelope.artifacts.length, 1);
  assert.equal(deploymentResultEnvelope.evidenceRefs.includes("dispatch-receipt:req-2"), true);
  assert.equal(deploymentResultEnvelope.evidenceRefs.includes("deployment-receipt:preview"), true);
});
