import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createAuditLogForSystemActions } from "../src/core/system-audit-log.js";
import { createSystemAuditLogStore } from "../src/core/system-audit-log-store.js";

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

test("system audit log stores records in the audit log store", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-audit-log-"));
  const auditLogStore = createSystemAuditLogStore({
    filePath: path.join(rootDir, "system-audit.ndjson"),
  });
  const { auditLogRecord } = createAuditLogForSystemActions({
    systemAction: {
      actionType: "workspace.role.updated",
      projectId: "giftwallet",
      summary: "Workspace role changed",
    },
    actorContext: {
      actorId: "user-1",
      workspaceId: "workspace-1",
    },
    auditLogStore,
  });

  const storedRecords = auditLogStore.query({ workspaceId: "workspace-1" });

  assert.equal(storedRecords.length, 1);
  assert.equal(storedRecords[0].auditLogId, auditLogRecord.auditLogId);
  assert.equal(storedRecords[0].category, "access");
});
