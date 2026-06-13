import test from "node:test";
import assert from "node:assert/strict";

import {
  DATA_OWNERSHIP_BOUNDARY_TASK_ID,
  buildProductShellDataOwnershipBoundary,
} from "../src/core/product-shell-data-ownership-boundary.js";
import { ProjectService } from "../src/core/project-service.js";

test("DATA-001 builds a source-of-truth matrix for first-release project entities", () => {
  const boundary = buildProductShellDataOwnershipBoundary({
    id: "data-project",
    userId: "owner-1",
    runtimeSkeletonTruth: { runtimeSkeletonId: "runtime-1" },
    productDomainSkeleton: { productDomainSkeletonId: "domain-1" },
    fileStorageRecord: {
      retentionPolicy: "project-lifecycle-local-first-release",
      attachments: [{ name: "brief.md" }],
    },
    buildMutationHistory: [{ mutationId: "mutation-1" }],
    buildMutationIntents: [{ mutationIntentId: "intent-1" }],
    historyContinuityAgent: { taskId: "HIST-AGT-001" },
  });

  assert.equal(boundary.taskId, DATA_OWNERSHIP_BOUNDARY_TASK_ID);
  assert.equal(boundary.status, "ready");
  assert.equal(boundary.entities.length >= 10, true);
  assert.equal(boundary.entities.find((entity) => entity.entityId === "project").sourceOfTruth, "ProjectService project record");
  assert.equal(boundary.entities.find((entity) => entity.entityId === "files").sourceOfTruth, "FILE-001 fileStorageRecord");
  assert.equal(boundary.entities.find((entity) => entity.entityId === "mutation").sourceOfTruth, "BUILD-MUTATION-TRUTH-001 history");
  assert.equal(boundary.persistenceProviderDecision.provider, "Supabase");
  assert.equal(boundary.persistenceProviderDecision.decision, "defer-for-first-release");
  assert.equal(boundary.temporaryOrDemoEntities.some((entry) => entry.key === "qaState" && entry.status === "excluded-from-production-truth"), true);
});

test("DATA-001 is serialized by ProjectService as project truth, not client QA state", () => {
  const service = new ProjectService({ eventLogPath: "/private/tmp/nexus-data-001-events.ndjson" });
  service.createProject({
    id: "data-service-project",
    name: "Data Service Project",
    goal: "להוכיח אמת נתונים בפרויקט.",
    userId: "owner-1",
  });

  const project = service.getProject("data-service-project");

  assert.equal(project.dataOwnershipBoundary.taskId, DATA_OWNERSHIP_BOUNDARY_TASK_ID);
  assert.equal(project.dataOwnershipBoundary.restorePolicy.projectRestore, "backend-projectId-restore");
  assert.equal(project.dataOwnershipBoundary.temporaryOrDemoEntities.find((entry) => entry.key === "localStorage").status, "session/bootstrap-helper-not-product-truth");
  assert.equal(project.dataOwnershipBoundary.persistenceProviderDecision.decision, "defer-for-first-release");
});
