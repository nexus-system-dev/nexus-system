import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeLearningDecisionHints,
  createBuildMutationLearningEvents,
  createRuntimeCreationLearningEvents,
  mergeRuntimeLearningEvents,
} from "../src/core/runtime-learning-events.js";

test("LEARNING-RUNTIME-001 — runtime creation events carry stable project/runtime/domain ids", () => {
  const project = { id: "runtime-learning-project" };
  const runtimeSkeletonTruth = {
    runtimeSkeletonId: "runtime-skeleton:runtime-learning-project:internal-tool",
    artifactBuildId: "runtime-build:runtime-learning-project:first-skeleton",
    productType: "internal tool",
    shellType: "workspace-state-shell",
    productPattern: "management-records",
    productClass: "internal-tool",
    shellFamily: "workspace-state-shell",
  };
  const productDomainSkeleton = {
    productDomainSkeletonId: "product-domain:runtime-learning-project:internal-tool",
    domainKind: "workflow-record-local-state",
  };

  const events = createRuntimeCreationLearningEvents({
    project,
    runtimeSkeletonTruth,
    productDomainSkeleton,
    now: "2026-06-07T00:00:00.000Z",
  });

  assert.equal(events.length, 2);
  assert.deepEqual(events.map((event) => event.eventType), [
    "runtime_skeleton.created",
    "product_domain_skeleton.created",
  ]);
  for (const event of events) {
    assert.equal(event.taskId, "LEARNING-RUNTIME-001");
    assert.equal(event.projectId, "runtime-learning-project");
    assert.equal(event.runtimeSkeletonId, "runtime-skeleton:runtime-learning-project:internal-tool");
    assert.equal(event.productDomainSkeletonId, "product-domain:runtime-learning-project:internal-tool");
    assert.equal(event.learningSafe, true);
    assert.equal(event.privacyBoundary.mayOverwriteProjectTruth, false);
    assert.equal(event.truthBoundary, "learning-signal-only-does-not-overwrite-project-truth");
    assert.equal(event.signal.productPattern, "management-records");
    assert.equal(event.signal.skeletonFamily, "workspace-state-shell");
  }
  const hints = buildRuntimeLearningDecisionHints(events);
  assert.equal(hints.recommendedPatterns[0].patternId, "management-records");
  assert.equal(hints.recommendedPatterns[0].skeletonFamily, "workspace-state-shell");
  assert.equal(hints.mayOverwriteProjectTruth, false);
});

test("LEARNING-RUNTIME-001 — build mutation events include request, intent, outcome, and domain operation", () => {
  const mutationResult = {
    ok: true,
    intent: {
      mutationId: "build-mutation:runtime-learning-project:1",
      operationId: "record.updateStatus",
      status: "applied",
    },
    runtimeSkeletonTruth: {
      runtimeSkeletonId: "runtime-skeleton:runtime-learning-project:internal-tool",
      artifactBuildId: "runtime-build:runtime-learning-project:first-skeleton",
    },
    productDomainSkeleton: {
      productDomainSkeletonId: "product-domain:runtime-learning-project:internal-tool",
    },
    historyRecord: {
      historyRecordId: "history:build-mutation:runtime-learning-project:1",
      mutationId: "build-mutation:runtime-learning-project:1",
      operationId: "record.updateStatus",
      status: "applied",
    },
  };

  const events = createBuildMutationLearningEvents({
    project: { id: "runtime-learning-project" },
    mutationResult,
    now: "2026-06-07T00:00:00.000Z",
  });

  assert.deepEqual(events.map((event) => event.eventType), [
    "build_agent_request.received",
    "build_mutation_intent.created",
    "build_mutation_outcome.applied",
    "product_domain_operation.outcome_applied",
  ]);
  assert.equal(events.every((event) => event.mutationId === "build-mutation:runtime-learning-project:1"), true);
  assert.equal(events.every((event) => event.signal.operationId === "record.updateStatus"), true);

  const merged = mergeRuntimeLearningEvents(events, events);
  assert.equal(merged.length, 4);
  const hints = buildRuntimeLearningDecisionHints(merged);
  assert.equal(hints.taskId, "LEARNING-RUNTIME-001");
  assert.equal(hints.status, "live");
  assert.equal(hints.mayOverwriteProjectTruth, false);
  assert.equal(hints.eventTypes.includes("build_mutation_outcome.applied"), true);
  assert.equal(Array.isArray(hints.recommendedPatterns), true);
});
