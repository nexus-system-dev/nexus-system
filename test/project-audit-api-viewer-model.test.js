import test from "node:test";
import assert from "node:assert/strict";

import { createProjectAuditApiAndViewerModel } from "../src/core/project-audit-api-viewer-model.js";

test("project audit api and viewer model builds filtered viewer payload", () => {
  const { projectAuditPayload } = createProjectAuditApiAndViewerModel({
    actorActionTrace: {
      actorActionTraceId: "actor-action-trace:1",
      projectId: "giftwallet",
      actor: {
        actorId: "user-1",
        actorType: "user",
      },
      action: {
        actionType: "project.deploy.requested",
        category: "deploy",
        summary: "Deployment queued",
        riskLevel: "high",
      },
      outcome: {
        status: "invoked",
      },
      providerSideEffects: [{ effectId: "effect-1" }],
      affectedArtifacts: [{ artifactId: "artifact-1" }],
      traceLinks: {
        traceId: "trace-1",
        resource: {
          targetType: "deployment-request",
          targetId: "deploy-1",
        },
      },
    },
    filters: {
      actorId: "user-1",
      sensitivity: "high",
    },
  });

  assert.equal(projectAuditPayload.projectId, "giftwallet");
  assert.equal(projectAuditPayload.entries.length, 1);
  assert.equal(projectAuditPayload.entries[0].entryId, "actor-action-trace:1");
  assert.equal(projectAuditPayload.entries[0].sensitivity, "high");
  assert.equal(projectAuditPayload.viewerModel.supportsFiltering, true);
});

test("project audit api and viewer model returns empty viewer when filters do not match", () => {
  const { projectAuditPayload } = createProjectAuditApiAndViewerModel({
    actorActionTrace: {
      actorActionTraceId: "actor-action-trace:2",
      projectId: "giftwallet",
      actor: {
        actorId: "user-1",
      },
      action: {
        actionType: "project.deploy.requested",
      },
    },
    filters: {
      actorId: "user-2",
    },
  });

  assert.equal(projectAuditPayload.entries.length, 0);
  assert.equal(projectAuditPayload.viewerModel.emptyState, "No matching audit activity found");
  assert.equal(projectAuditPayload.summary.filtered, true);
});

test("project audit api and viewer model normalizes malformed filters and entry fields", () => {
  const { projectAuditPayload } = createProjectAuditApiAndViewerModel({
    actorActionTrace: {
      actorActionTraceId: " actor-action-trace:1 ",
      projectId: " giftwallet ",
      actor: {
        actorId: " user-1 ",
        actorType: " user ",
      },
      action: {
        actionType: " project.deploy.requested ",
        category: " deploy ",
        summary: " Deployment queued ",
        riskLevel: " high ",
      },
      outcome: {
        status: " invoked ",
      },
      traceLinks: {
        traceId: " trace-1 ",
      },
    },
    filters: {
      actorId: " user-1 ",
      actionType: " project.deploy.requested ",
      sensitivity: " high ",
    },
  });

  assert.equal(projectAuditPayload.projectId, "giftwallet");
  assert.equal(projectAuditPayload.entries.length, 1);
  assert.equal(projectAuditPayload.entries[0].entryId, "actor-action-trace:1");
  assert.equal(projectAuditPayload.entries[0].actorId, "user-1");
  assert.equal(projectAuditPayload.entries[0].actionType, "project.deploy.requested");
  assert.equal(projectAuditPayload.summary.filtered, true);
});
