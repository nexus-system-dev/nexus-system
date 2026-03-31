import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createSecurityAuditLogStore } from "../src/core/security-audit-log-store.js";

test("security audit log store appends records and writes to security-audit.ndjson", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-security-audit-store-"));
  const filePath = path.join(rootDir, "security-audit.ndjson");
  const securityAuditLogStore = createSecurityAuditLogStore({ filePath });

  securityAuditLogStore.append({
    securityAuditId: "security-audit-1",
    eventType: "policy_violation",
    severity: "critical",
    actor: {
      actorId: "user-1",
    },
  });

  assert.equal(securityAuditLogStore.readAll().length, 1);
  assert.equal(securityAuditLogStore.query({ eventType: "policy_violation" })[0].securityAuditId, "security-audit-1");
  assert.equal(fs.readFileSync(filePath, "utf8").includes("\"securityAuditId\":\"security-audit-1\""), true);
});
