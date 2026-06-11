import test from "node:test";
import assert from "node:assert/strict";

import { createBuildAgentLearningInstructions } from "../src/core/build-agent-learning-instructions.js";

test("BLD-AGT-001 — build agent learning instructions bind runtime learning before reply", () => {
  const instructions = createBuildAgentLearningInstructions({
    project: {
      id: "learning-build-project",
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-skeleton:learning-build-project:internal-tool",
        productPatternLearningDecision: {
          taskId: "LEARNING-PRODUCT-INTELLIGENCE-001",
          status: "live",
          strongestPattern: {
            patternId: "management-records",
            productClass: "internal-tool",
            skeletonFamily: "workspace-state-shell",
          },
          mayOverwriteProjectTruth: false,
          truthBoundary: "learning-product-intelligence-recommends-only-does-not-overwrite-project-truth",
        },
      },
      productDomainSkeleton: {
        productDomainSkeletonId: "product-domain:learning-build-project:internal-tool",
      },
      runtimeLearningEvents: [
        {
          eventType: "runtime_skeleton.created",
          runtimeSkeletonId: "runtime-skeleton:learning-build-project:internal-tool",
          productDomainSkeletonId: "product-domain:learning-build-project:internal-tool",
        },
        {
          eventType: "build_mutation_outcome.failed",
          runtimeSkeletonId: "runtime-skeleton:learning-build-project:internal-tool",
          productDomainSkeletonId: "product-domain:learning-build-project:internal-tool",
        },
      ],
    },
    message: "תוסיף שדה מקור ליד",
    currentSurface: "loop",
  });

  assert.equal(instructions.taskId, "BLD-AGT-001");
  assert.equal(instructions.sourceTaskId, "LEARNING-RUNTIME-001");
  assert.equal(instructions.mustUseBeforeReply, true);
  assert.equal(instructions.mayOverwriteProjectTruth, false);
  assert.equal(instructions.status, "live");
  assert.equal(instructions.signalCount, 2);
  assert.equal(instructions.runtimeSkeletonId, "runtime-skeleton:learning-build-project:internal-tool");
  assert.equal(instructions.productDomainSkeletonId, "product-domain:learning-build-project:internal-tool");
  assert.equal(instructions.productPatternLearningDecision.taskId, "LEARNING-PRODUCT-INTELLIGENCE-001");
  assert.equal(instructions.routingHints.includes("product-pattern-learning-before-reply"), true);
  assert.equal(instructions.routingHints.includes("mutation-required-before-success"), true);
  assert.equal(instructions.routingHints.includes("prior-failure-requires-retry-or-clarification"), true);
});

test("BLD-AGT-001 — provider, release, and payment requests become bounded learning instructions", () => {
  const instructions = createBuildAgentLearningInstructions({
    project: {
      id: "learning-build-provider-boundary",
      runtimeLearningEvents: [{ eventType: "runtime_skeleton.created" }],
    },
    message: "תחבר לי וואטסאפ אמיתי, תפרסם את זה ותחייב כרטיס",
    currentSurface: "loop",
  });

  assert.equal(instructions.routingHints.includes("provider-release-boundary"), true);
  assert.equal(
    instructions.instructions.some((instruction) => /publishing|payment|provider/u.test(instruction)),
    true,
  );
  assert.equal(instructions.mustUseBeforeReply, true);
  assert.equal(instructions.truthBoundary, "learning-instructions-only-do-not-overwrite-product-truth");
});
