import test from "node:test";
import assert from "node:assert/strict";

import { createProjectAuditEventCollector } from "../src/core/project-audit-event-collector.js";

test("project audit event collector stores a canonical project audit record", () => {
  const { projectAuditRecord } = createProjectAuditEventCollector({
    projectAuditEvent: {
      projectAuditEventId: "project-audit:giftwallet:1",
      projectId: "giftwallet",
      workspaceId: "workspace-1",
      actionType: "project.deploy.requested",
      category: "deploy",
      status: "queued",
      actor: {
        actorId: "user-1",
        actorType: "user",
      },
      resource: {
        targetType: "deployment-request",
        targetId: "deploy-1",
      },
      summary: "Deployment queued",
      impactedAreas: ["deploy", "release"],
      attachments: [{ kind: "deployment-request", id: "deploy-1" }],
      metadata: {
        provider: "vercel",
      },
      traceId: "trace-1",
    },
  });

  assert.equal(projectAuditRecord.projectAuditEventId, "project-audit:giftwallet:1");
  assert.equal(projectAuditRecord.category, "deploy");
  assert.equal(projectAuditRecord.actor.actorId, "user-1");
  assert.equal(Array.isArray(projectAuditRecord.auditTrail), true);
  assert.equal(projectAuditRecord.summaryFlags.isStored, true);
});

test("project audit event collector falls back safely without event payload", () => {
  const { projectAuditRecord } = createProjectAuditEventCollector();

  assert.equal(projectAuditRecord.actionType, "project.observed");
  assert.equal(projectAuditRecord.category, "project");
  assert.equal(Array.isArray(projectAuditRecord.auditTrail), true);
});
