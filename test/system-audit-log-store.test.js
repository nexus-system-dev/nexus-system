import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createSystemAuditLogStore } from "../src/core/system-audit-log-store.js";

test("system audit log store appends and filters records", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-audit-store-"));
  const auditLogStore = createSystemAuditLogStore({
    filePath: path.join(rootDir, "system-audit.ndjson"),
  });

  auditLogStore.append({
    auditLogId: "audit-1",
    category: "auth",
    projectId: "giftwallet",
    workspaceId: "workspace-1",
    actorId: "user-1",
  });
  auditLogStore.append({
    auditLogId: "audit-2",
    category: "security",
    projectId: "royal-casino",
    workspaceId: "workspace-2",
    actorId: "system",
  });

  assert.equal(auditLogStore.readAll().length, 2);
  assert.equal(auditLogStore.query({ projectId: "giftwallet" }).length, 1);
  assert.equal(auditLogStore.query({ category: "security" })[0].auditLogId, "audit-2");
});
