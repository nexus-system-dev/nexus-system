import test from "node:test";
import assert from "node:assert/strict";

import { createArtifactCollectionPipeline } from "../src/core/artifact-collection-pipeline.js";

test("artifact collection pipeline returns ready collection contract for prepared artifacts", () => {
  const { artifactCollectionPipeline } = createArtifactCollectionPipeline({
    executionInvocationContract: {
      executionInvocationContractId: "execution-invocation:req-1",
      executionRequestId: "req-1",
      status: "ready",
      invocationTarget: {
        providerType: "hosting",
      },
      evidenceRefs: [{ reference: "dispatch-receipt:req-1" }],
      blockedReasons: [],
    },
    ideAgentResultNormalization: {
      ideAgentResultNormalizationId: "ide-agent-result:req-1",
      evidenceRefs: [{ reference: "command-console:test-project" }],
      blockedReasons: [],
    },
    preparedArtifact: {
      packageFormat: "static-bundle",
      environment: "staging",
      artifacts: ["index.html", "assets.js"],
    },
    externalExecutionResult: {
      externalExecutionResultId: "external-execution:req-1",
      providerType: "hosting",
    },
  });

  assert.equal(artifactCollectionPipeline.status, "ready");
  assert.equal(artifactCollectionPipeline.summary.artifactCount, 2);
  assert.equal(artifactCollectionPipeline.summary.hasEvidenceRefs, true);
  assert.equal(artifactCollectionPipeline.summary.canPromoteToResultEnvelope, true);
});

test("artifact collection pipeline switches to collecting when invocation is active", () => {
  const { artifactCollectionPipeline } = createArtifactCollectionPipeline({
    executionInvocationContract: {
      executionInvocationContractId: "execution-invocation:req-2",
      executionRequestId: "req-2",
      status: "invoked",
      invocationTarget: {
        providerType: "source-control",
      },
      evidenceRefs: [],
      blockedReasons: [],
    },
    ideAgentResultNormalization: {
      blockedReasons: [],
      evidenceRefs: [],
    },
    preparedArtifact: {
      packageFormat: "service-bundle",
      artifacts: ["bundle.tgz"],
    },
  });

  assert.equal(artifactCollectionPipeline.status, "collecting");
  assert.equal(artifactCollectionPipeline.collectionStage, "evidence-collecting");
});

test("artifact collection pipeline preserves blockers when artifacts are missing", () => {
  const { artifactCollectionPipeline } = createArtifactCollectionPipeline({
    executionInvocationContract: {
      executionRequestId: "req-3",
      status: "blocked",
      blockedReasons: ["approval-pending"],
      evidenceRefs: [],
    },
    ideAgentResultNormalization: {
      blockedReasons: ["workspace-path-missing"],
      evidenceRefs: [],
    },
    preparedArtifact: {
      artifacts: [],
    },
  });

  assert.equal(artifactCollectionPipeline.status, "blocked");
  assert.equal(artifactCollectionPipeline.blockedReasons.includes("approval-pending"), true);
  assert.equal(artifactCollectionPipeline.blockedReasons.includes("workspace-path-missing"), true);
  assert.equal(artifactCollectionPipeline.blockedReasons.includes("artifacts-missing"), true);
});
