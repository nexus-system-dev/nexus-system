import test from "node:test";
import assert from "node:assert/strict";

import { createActorActionTraceAssembler } from "../src/core/actor-action-trace-assembler.js";

test("actor action trace assembler links actor action outcome provider side effects and artifacts", () => {
  const { actorActionTrace } = createActorActionTraceAssembler({
    projectAuditRecord: {
      projectAuditRecordId: "project-audit-record:1",
      projectId: "giftwallet",
      actionType: "project.deploy.requested",
      category: "deploy",
      summary: "Deployment queued",
      actor: {
        actorId: "user-1",
        actorType: "user",
      },
      resource: {
        targetType: "deployment-request",
        targetId: "deploy-1",
      },
      traceId: "trace-1",
      status: "queued",
    },
    executionResult: {
      status: "invoked",
      artifacts: ["app-shell", { artifactId: "artifact-2", path: "dist/app.zip" }],
      metadata: {
        totalRuns: 1,
        totalCommands: 2,
        surfaces: ["hosting-provider"],
      },
    },
  });

  assert.equal(actorActionTrace.projectAuditRecordId, "project-audit-record:1");
  assert.equal(actorActionTrace.actor.actorId, "user-1");
  assert.equal(actorActionTrace.outcome.status, "invoked");
  assert.equal(actorActionTrace.providerSideEffects.length, 1);
  assert.equal(actorActionTrace.affectedArtifacts.length, 2);
});

test("actor action trace assembler falls back safely without explicit execution result", () => {
  const { actorActionTrace } = createActorActionTraceAssembler({
    projectAuditRecord: {
      projectAuditRecordId: "project-audit-record:2",
      actionType: "project.observed",
      category: "project",
      actor: {
        actorId: "system",
      },
    },
  });

  assert.equal(actorActionTrace.action.actionType, "project.observed");
  assert.equal(actorActionTrace.outcome.status, "recorded");
  assert.equal(Array.isArray(actorActionTrace.providerSideEffects), true);
  assert.equal(Array.isArray(actorActionTrace.affectedArtifacts), true);
});

test("actor action trace assembler normalizes malformed trace and artifact fields", () => {
  const { actorActionTrace } = createActorActionTraceAssembler({
    projectAuditRecord: {
      projectAuditRecordId: " project-audit-record:1 ",
      projectId: " giftwallet ",
      actionType: " project.deploy.requested ",
      category: " deploy ",
      summary: " Deployment queued ",
      traceId: " trace-1 ",
    },
    executionResult: {
      status: " invoked ",
      reason: " queued ",
      artifacts: [" app-shell ", { artifactId: " artifact-2 ", path: " dist/app.zip ", status: " produced " }],
      metadata: {
        surfaces: [" hosting-provider "],
      },
    },
  });

  assert.equal(actorActionTrace.actorActionTraceId, "actor-action-trace:project-audit-record:1");
  assert.equal(actorActionTrace.projectId, "giftwallet");
  assert.equal(actorActionTrace.outcome.status, "invoked");
  assert.equal(actorActionTrace.providerSideEffects[0].provider, "hosting-provider");
  assert.equal(actorActionTrace.affectedArtifacts[0].artifactId, "app-shell");
  assert.equal(actorActionTrace.affectedArtifacts[1].path, "dist/app.zip");
});
