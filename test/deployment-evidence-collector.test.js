import test from "node:test";
import assert from "node:assert/strict";

import { createDeploymentEvidenceCollector } from "../src/core/deployment-evidence-collector.js";

test("deployment evidence collector returns collected evidence for invoked deployment", () => {
  const { deploymentEvidence } = createDeploymentEvidenceCollector({
    deploymentInvocation: {
      status: "invoked",
      provider: "vercel",
      target: "web-deployment",
      environment: "production",
      requestId: "deployment-request-web",
      invocationReceipt: {
        receiptId: "deployment-receipt:deployment-request-web",
      },
      blockedReasons: [],
    },
    artifactCollectionPipeline: {
      collectedArtifacts: [
        { name: "index.html", outputPath: "dist/index.html" },
        { name: "app.js", outputPath: "dist/app.js" },
      ],
    },
    canonicalExecutionResultEnvelope: {
      evidenceRefs: ["dispatch-receipt:req-1"],
      summary: {
        hasArtifacts: true,
      },
    },
    providerAdapter: {
      executionModes: ["api"],
      capabilities: ["production-deployments"],
      environments: ["production", "preview"],
    },
  });

  assert.equal(deploymentEvidence.status, "collected");
  assert.equal(deploymentEvidence.summary.artifactCount, 2);
  assert.equal(deploymentEvidence.summary.hasReceipt, true);
  assert.equal(deploymentEvidence.summary.canAdvanceToDeploymentResult, true);
});

test("deployment evidence collector blocks when deployment invocation is not ready", () => {
  const { deploymentEvidence } = createDeploymentEvidenceCollector({
    deploymentInvocation: {
      status: "blocked",
      blockedReasons: ["execution-result-unready"],
    },
    artifactCollectionPipeline: {
      collectedArtifacts: [],
    },
    canonicalExecutionResultEnvelope: {
      summary: {
        hasArtifacts: false,
      },
    },
  });

  assert.equal(deploymentEvidence.status, "blocked");
  assert.equal(deploymentEvidence.blockedReasons.includes("deployment-invocation-unready"), true);
  assert.equal(deploymentEvidence.blockedReasons.includes("deployment-artifacts-missing"), true);
});

test("deployment evidence collector preserves result-envelope evidence refs", () => {
  const { deploymentEvidence } = createDeploymentEvidenceCollector({
    deploymentInvocation: {
      status: "invoked",
      requestId: "deployment-request-preview",
      invocationReceipt: {
        receiptId: "deployment-receipt:deployment-request-preview",
      },
      blockedReasons: [],
    },
    artifactCollectionPipeline: {
      collectedArtifacts: [{ name: "preview.html", outputPath: "dist/preview.html" }],
    },
    canonicalExecutionResultEnvelope: {
      evidenceRefs: ["dispatch-receipt:req-2", "command-console:test-project"],
      summary: {
        hasArtifacts: true,
      },
    },
  });

  assert.equal(deploymentEvidence.evidenceRefs.includes("dispatch-receipt:req-2"), true);
  assert.equal(deploymentEvidence.evidenceRefs.includes("deployment-receipt:deployment-request-preview"), true);
});
