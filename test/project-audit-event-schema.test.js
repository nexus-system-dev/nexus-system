import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectAuditEventSchema } from "../src/core/project-audit-event-schema.js";

test("project audit event schema classifies approval activity as project approval audit", () => {
  const { projectAuditEvent } = defineProjectAuditEventSchema({
    projectAction: {
      actionType: "project.approval.review",
      status: "approved",
      projectId: "giftwallet",
      targetType: "approval",
      targetId: "approval-1",
      summary: "Approval granted for deployment",
      impactedAreas: ["approval", "governance"],
    },
    actorContext: {
      actorId: "user-1",
      actorType: "user",
      actorRole: "owner",
      workspaceId: "workspace-1",
    },
  });

  assert.equal(projectAuditEvent.category, "approval");
  assert.equal(projectAuditEvent.actor.actorId, "user-1");
  assert.equal(projectAuditEvent.resource.targetType, "approval");
  assert.equal(projectAuditEvent.summaryFlags.hasImpact, true);
});

test("project audit event schema classifies deployment actions", () => {
  const { projectAuditEvent } = defineProjectAuditEventSchema({
    projectAction: {
      actionType: "project.deploy.requested",
      status: "queued",
      projectId: "giftwallet",
      targetType: "deployment-request",
      targetId: "deploy-1",
      summary: "Deployment queued",
      impactedAreas: ["deploy", "release"],
      riskLevel: "high",
    },
  });

  assert.equal(projectAuditEvent.category, "deploy");
  assert.equal(projectAuditEvent.resource.targetId, "deploy-1");
  assert.equal(projectAuditEvent.summaryFlags.isHighRisk, true);
});
