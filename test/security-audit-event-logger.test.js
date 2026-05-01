import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createPlatformObservabilityTransport } from "../src/core/platform-observability-transport.js";
import { createSecurityAuditEventLogger } from "../src/core/security-audit-event-logger.js";
import { createSecurityAuditLogStore } from "../src/core/security-audit-log-store.js";

test("security audit event logger maps failed_login severity and stores record", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-security-audit-"));
  const securityAuditLogStore = createSecurityAuditLogStore({
    filePath: path.join(rootDir, "security-audit.ndjson"),
  });
  const observabilityTransport = createPlatformObservabilityTransport();

  const { securityAuditRecord } = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: "failed_login",
      summary: "Failed login attempt",
      projectId: "giftwallet",
    },
    actorContext: {
      actorId: "user-1",
      actorType: "user",
      sessionId: "session-1",
      ipAddress: "127.0.0.1",
    },
    securityAuditLogStore,
    observabilityTransport,
  });

  assert.equal(securityAuditRecord.eventType, "failed_login");
  assert.equal(securityAuditRecord.severity, "medium");
  assert.equal(securityAuditRecord.requiresAlert, false);
  assert.equal(securityAuditLogStore.readAll().length, 1);
  assert.equal(observabilityTransport.getSnapshot().platformLogs.at(-1).level, "warn");
});

test("security audit event logger maps high and critical events with correct alerting levels", () => {
  const observabilityTransport = createPlatformObservabilityTransport();
  const privilege = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: "privilege_change",
      summary: "Privilege changed",
    },
    actorContext: {
      actorId: "user-2",
    },
    observabilityTransport,
  }).securityAuditRecord;
  const secret = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: "secret_access",
      summary: "Secret accessed",
    },
    actorContext: {
      actorId: "user-3",
    },
    observabilityTransport,
  }).securityAuditRecord;
  const policy = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: "policy_violation",
      summary: "Policy violated",
    },
    actorContext: {
      actorId: "user-4",
    },
    observabilityTransport,
  }).securityAuditRecord;

  const snapshot = observabilityTransport.getSnapshot();
  const lastThreeLevels = snapshot.platformLogs.slice(-3).map((entry) => entry.level);

  assert.equal(privilege.severity, "high");
  assert.equal(privilege.requiresAlert, true);
  assert.equal(secret.severity, "high");
  assert.equal(secret.requiresAlert, false);
  assert.equal(policy.severity, "critical");
  assert.equal(policy.requiresAlert, true);
  assert.deepEqual(lastThreeLevels, ["error", "error", "error"]);
});

test("security audit event logger normalizes unknown event types", () => {
  const { securityAuditRecord } = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: "odd_event",
      summary: "Unexpected event",
    },
  });

  assert.equal(securityAuditRecord.eventType, "unknown-security-event");
});

test("security audit event logger returns null when no security event is provided", () => {
  const { securityAuditRecord } = createSecurityAuditEventLogger();

  assert.equal(securityAuditRecord, null);
});

test("security audit event logger normalizes malformed event metadata fields", () => {
  const { securityAuditRecord } = createSecurityAuditEventLogger({
    securityEvent: {
      eventType: " policy_violation ",
      summary: " Policy violated ",
      projectId: " giftwallet ",
      workspaceId: " workspace-1 ",
      source: " security-runtime ",
      traceId: " trace-1 ",
      timestamp: " 2026-04-21T10:00:00.000Z ",
    },
    actorContext: {
      actorId: "user-1",
    },
  });

  assert.equal(securityAuditRecord.eventType, "policy_violation");
  assert.equal(securityAuditRecord.projectId, "giftwallet");
  assert.equal(securityAuditRecord.workspaceId, "workspace-1");
  assert.equal(securityAuditRecord.source, "security-runtime");
  assert.equal(securityAuditRecord.traceId, "trace-1");
  assert.equal(securityAuditRecord.timestamp, "2026-04-21T10:00:00.000Z");
});
