import test from "node:test";
import assert from "node:assert/strict";

import { createOwnerAuditLogViewer } from "../src/core/owner-audit-log-viewer.js";
import { createSystemWideActivityTracker } from "../src/core/system-wide-activity-tracker.js";
import { createCriticalChangeHistorySystem } from "../src/core/critical-change-history-system.js";

test("owner audit viewer combines audit record and payload entries", () => {
  const { ownerAuditView } = createOwnerAuditLogViewer({
    auditLogRecord: {
      auditLogId: "audit-1",
      category: "security",
      actionType: "owner.login",
      timestamp: "2026-01-01T00:00:00.000Z",
      projectId: "giftwallet",
    },
    projectAuditPayload: {
      projectId: "giftwallet",
      entries: [{ entryId: "entry-1", category: "project", headline: "Project action" }],
    },
  });

  assert.equal(ownerAuditView.entries.length, 2);
  assert.equal(ownerAuditView.summary.hasCriticalHistory, true);
});

test("system-wide activity tracker and critical history system derive audit-friendly entries", () => {
  const { systemActivityFeed } = createSystemWideActivityTracker({
    platformTrace: {
      traceId: "trace-1",
      runtimeEvents: {
        executionEvents: [{ type: "runtime.started", timestamp: "2026-01-01T00:00:00.000Z" }],
      },
    },
    projectAuditRecord: {
      projectAuditRecordId: "project-audit-1",
      auditTrail: [{ category: "policy.update", timestamp: "2026-01-01T00:01:00.000Z" }],
    },
  });
  const { criticalChangeHistory } = createCriticalChangeHistorySystem({
    systemActivityFeed,
    auditLogRecord: {
      auditLogId: "audit-1",
      category: "security",
      actionType: "owner.override",
      timestamp: "2026-01-01T00:02:00.000Z",
    },
  });

  assert.equal(systemActivityFeed.summary.totalEntries, 2);
  assert.equal(criticalChangeHistory.summary.totalEntries, 2);
});
