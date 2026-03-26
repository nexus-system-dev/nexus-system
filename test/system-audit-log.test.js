import test from "node:test";
import assert from "node:assert/strict";

import { createAuditLogForSystemActions } from "../src/core/system-audit-log.js";

test("system audit log returns canonical auth audit record", () => {
  const { auditLogRecord } = createAuditLogForSystemActions({
    systemAction: {
      actionType: "auth.login",
      status: "completed",
      projectId: "giftwallet",
      summary: "User logged in",
      source: "auth-service",
      traceId: "trace-1",
    },
    actorContext: {
      actorId: "user-1",
      actorType: "user",
      actorRole: "owner",
      workspaceId: "workspace-1",
    },
  });

  assert.equal(auditLogRecord.category, "auth");
  assert.equal(auditLogRecord.actorId, "user-1");
  assert.equal(auditLogRecord.workspaceId, "workspace-1");
  assert.equal(auditLogRecord.summary, "User logged in");
});

test("system audit log classifies incident alerts as security records", () => {
  const { auditLogRecord } = createAuditLogForSystemActions({
    systemAction: {
      actionType: "security.connector-outage",
      summary: "Connector outage detected",
      riskLevel: "high",
    },
  });

  assert.equal(auditLogRecord.category, "security");
  assert.equal(auditLogRecord.riskLevel, "high");
  assert.equal(auditLogRecord.actorType, "system");
});
