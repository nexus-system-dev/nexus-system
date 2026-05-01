import test from "node:test";
import assert from "node:assert/strict";

import { createWorkspaceIsolationGuard } from "../src/core/workspace-isolation-guard.js";

test("createWorkspaceIsolationGuard allows requests inside the workspace boundary", () => {
  const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
    tenantIsolationSchema: {
      workspaceId: "workspace-alpha",
      isolatedResources: [
        {
          resourceId: "resource:artifacts",
          resourceType: "artifacts",
          workspaceId: "workspace-alpha",
          tenantBoundary: "workspace",
          crossTenantAccessAllowed: false,
        },
      ],
      leakSignals: ["workspace-id-mismatch", "resource-owner-mismatch"],
    },
    requestContext: {
      workspaceId: "workspace-alpha",
      resourceType: "artifacts",
      actionType: "read",
    },
  });

  assert.equal(workspaceIsolationDecision.decision, "allowed");
  assert.equal(workspaceIsolationDecision.isAllowed, true);
  assert.equal(workspaceIsolationDecision.triggeredLeakSignals.length, 0);
});

test("createWorkspaceIsolationGuard blocks cross-workspace access by default", () => {
  const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
    tenantIsolationSchema: {
      workspaceId: "workspace-alpha",
      isolatedResources: [
        {
          resourceId: "resource:linked-accounts",
          resourceType: "linked-accounts",
          workspaceId: "workspace-beta",
          tenantBoundary: "workspace",
          crossTenantAccessAllowed: false,
        },
      ],
      leakSignals: ["workspace-id-mismatch", "resource-owner-mismatch", "cross-tenant-learning-signal"],
    },
    requestContext: {
      workspaceId: "workspace-alpha",
      resourceType: "linked-accounts",
      actionType: "read",
    },
  });

  assert.equal(workspaceIsolationDecision.decision, "blocked");
  assert.equal(workspaceIsolationDecision.isBlocked, true);
  assert.equal(workspaceIsolationDecision.triggeredLeakSignals.includes("workspace-id-mismatch"), true);
  assert.equal(workspaceIsolationDecision.checks.includes("resource-workspace-mismatch"), true);
});

test("createWorkspaceIsolationGuard normalizes malformed request and resource identifiers", () => {
  const { workspaceIsolationDecision } = createWorkspaceIsolationGuard({
    tenantIsolationSchema: {
      workspaceId: "workspace-alpha",
      isolatedResources: [
        {
          resourceId: " resource:artifacts ",
          resourceType: " artifacts ",
          workspaceId: " workspace-alpha ",
          tenantBoundary: "workspace",
          crossTenantAccessAllowed: false,
        },
      ],
      leakSignals: ["workspace-id-mismatch", "resource-owner-mismatch"],
    },
    requestContext: {
      workspaceId: " workspace-alpha ",
      resourceType: " artifacts ",
      actionType: " read ",
    },
  });

  assert.equal(workspaceIsolationDecision.workspaceIsolationDecisionId, "workspace-isolation:workspace-alpha:read");
  assert.equal(workspaceIsolationDecision.resourceId, "resource:artifacts");
  assert.equal(workspaceIsolationDecision.resourceType, "artifacts");
  assert.equal(workspaceIsolationDecision.actionType, "read");
  assert.equal(workspaceIsolationDecision.decision, "allowed");
});
