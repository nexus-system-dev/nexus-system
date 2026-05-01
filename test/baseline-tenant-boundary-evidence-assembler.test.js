import test from "node:test";
import assert from "node:assert/strict";

import { createBaselineTenantBoundaryEvidenceAssembler } from "../src/core/baseline-tenant-boundary-evidence-assembler.js";

test("baseline tenant boundary evidence assembler derives allowed evidence deterministically", () => {
  const { tenantBoundaryEvidence } = createBaselineTenantBoundaryEvidenceAssembler({
    tenantIsolationSchema: {
      workspaceId: "workspace-1",
      isolationBoundary: "workspace",
      leakSignals: ["workspace-id-mismatch"],
    },
    workspaceIsolationDecision: {
      workspaceId: "workspace-1",
      decision: "allowed",
      resourceType: "project-state",
      checks: ["tenant-schema-loaded"],
    },
    projectAuthorizationDecision: {
      decision: "allowed",
      requiredCapability: "view",
      checks: [],
    },
  });

  assert.equal(tenantBoundaryEvidence.evidenceStatus, "allowed");
  assert.equal(tenantBoundaryEvidence.summary.isWithinBoundary, true);
});

test("baseline tenant boundary evidence assembler derives blocked evidence deterministically", () => {
  const { tenantBoundaryEvidence } = createBaselineTenantBoundaryEvidenceAssembler({
    tenantIsolationSchema: {
      workspaceId: "workspace-1",
      isolationBoundary: "workspace",
      leakSignals: ["resource-owner-mismatch"],
    },
    workspaceIsolationDecision: {
      workspaceId: "workspace-1",
      decision: "blocked",
      resourceType: "linked-accounts",
      checks: ["resource-workspace-mismatch"],
    },
    projectAuthorizationDecision: {
      decision: "blocked",
      requiredCapability: "connectAccounts",
      checks: ["role-capability-missing"],
    },
  });

  assert.equal(tenantBoundaryEvidence.evidenceStatus, "blocked");
  assert.equal(tenantBoundaryEvidence.summary.isBlocked, true);
});

test("baseline tenant boundary evidence assembler derives approval-required evidence deterministically", () => {
  const { tenantBoundaryEvidence } = createBaselineTenantBoundaryEvidenceAssembler({
    tenantIsolationSchema: {
      workspaceId: "workspace-1",
      isolationBoundary: "workspace",
      leakSignals: [],
    },
    workspaceIsolationDecision: {
      workspaceId: "workspace-1",
      decision: "allowed",
      resourceType: "project-state",
      checks: ["tenant-schema-loaded"],
    },
    projectAuthorizationDecision: {
      decision: "requires-approval",
      requiredCapability: "deploy",
      checks: ["policy-requires-approval"],
    },
  });

  assert.equal(tenantBoundaryEvidence.evidenceStatus, "requires-approval");
  assert.equal(tenantBoundaryEvidence.summary.requiresApproval, true);
});
