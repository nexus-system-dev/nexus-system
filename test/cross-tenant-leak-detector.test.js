import test from "node:test";
import assert from "node:assert/strict";

import { createCrossTenantLeakDetector } from "../src/core/cross-tenant-leak-detector.js";

test("createCrossTenantLeakDetector raises critical alert for blocked tenant-boundary evidence", () => {
  const { leakageAlert } = createCrossTenantLeakDetector({
    tenantBoundaryEvidence: {
      tenantBoundaryEvidenceId: "tenant-boundary-evidence:alpha",
      workspaceId: "workspace-alpha",
      resourceType: "linked-accounts",
      evidenceStatus: "blocked",
      evidenceChecks: [
        "workspace:resource-workspace-mismatch",
        "authorization:role-capability-missing",
      ],
    },
  });

  assert.equal(leakageAlert.severity, "critical");
  assert.equal(leakageAlert.isActive, true);
  assert.equal(leakageAlert.leakSignals.includes("workspace:resource-workspace-mismatch"), true);
});

test("createCrossTenantLeakDetector raises warning for approval-required tenant-boundary evidence", () => {
  const { leakageAlert } = createCrossTenantLeakDetector({
    tenantBoundaryEvidence: {
      tenantBoundaryEvidenceId: "tenant-boundary-evidence:alpha",
      workspaceId: "workspace-alpha",
      resourceType: "project-state",
      evidenceStatus: "requires-approval",
      evidenceChecks: ["authorization:policy-requires-approval"],
    },
  });

  assert.equal(leakageAlert.severity, "warning");
  assert.equal(leakageAlert.isActive, true);
  assert.equal(leakageAlert.checks.includes("authorization:policy-requires-approval"), true);
});

test("createCrossTenantLeakDetector stays clear when tenant-boundary evidence is allowed", () => {
  const { leakageAlert } = createCrossTenantLeakDetector({
    tenantBoundaryEvidence: {
      tenantBoundaryEvidenceId: "tenant-boundary-evidence:alpha",
      workspaceId: "workspace-alpha",
      resourceType: "project-state",
      evidenceStatus: "allowed",
      evidenceChecks: ["workspace:tenant-schema-loaded"],
    },
  });

  assert.equal(leakageAlert.severity, "clear");
  assert.equal(leakageAlert.isActive, false);
  assert.equal(leakageAlert.checks.includes("no-cross-tenant-leak-detected"), true);
});
