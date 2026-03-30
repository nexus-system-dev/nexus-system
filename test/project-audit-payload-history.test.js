import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-audit-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("project audit payload merges trace entries with system audit history", () => {
  const service = createService();
  service.seedDemoProject();

  const project = service.projects.get("giftwallet");
  project.context = {
    ...(project.context ?? {}),
    actorActionTrace: {
      actorActionTraceId: "actor-action-trace:giftwallet:1",
      projectId: "giftwallet",
      actor: {
        actorId: "owner-1",
        actorType: "user",
      },
      action: {
        actionType: "project.approval",
        category: "approval",
        summary: "Approval submitted",
        riskLevel: "high",
      },
      outcome: {
        status: "invoked",
      },
      timestamp: "2026-03-30T09:00:00.000Z",
    },
  };

  service.systemAuditLogStore.append({
    auditLogId: "audit-log:giftwallet:1",
    actionType: "security.override",
    category: "security",
    status: "recorded",
    projectId: "giftwallet",
    actorId: "owner-1",
    actorType: "user",
    riskLevel: "high",
    summary: "Owner performed override",
    timestamp: "2026-03-30T10:00:00.000Z",
  });

  const payload = service.getProjectAuditPayload("giftwallet", {
    actorId: "owner-1",
    sensitivity: "high",
  });

  assert.equal(payload.projectId, "giftwallet");
  assert.equal(payload.summary.filtered, true);
  assert.equal(payload.entries.length >= 2, true);
  assert.equal(payload.entries.some((entry) => entry.entryId === "actor-action-trace:giftwallet:1"), true);
  assert.equal(payload.entries.some((entry) => entry.entryId === "audit-log:giftwallet:1"), true);
});
