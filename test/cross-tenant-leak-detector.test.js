import test from "node:test";
import assert from "node:assert/strict";

import { createCrossTenantLeakDetector } from "../src/core/cross-tenant-leak-detector.js";

test("createCrossTenantLeakDetector raises critical alert when isolation boundary is blocked", () => {
  const { leakageAlert } = createCrossTenantLeakDetector({
    workspaceIsolationDecision: {
      workspaceIsolationDecisionId: "workspace-isolation:alpha:read",
      workspaceId: "workspace-alpha",
      requestWorkspaceId: "workspace-alpha",
      resourceType: "linked-accounts",
      decision: "blocked",
      isBlocked: true,
      triggeredLeakSignals: ["workspace-id-mismatch", "resource-owner-mismatch"],
    },
    learningEvent: {
      sourceWorkspaceId: "workspace-beta",
      mixedResources: ["learning-records"],
    },
  });

  assert.equal(leakageAlert.severity, "critical");
  assert.equal(leakageAlert.isActive, true);
  assert.equal(leakageAlert.leakSignals.includes("workspace-id-mismatch"), true);
  assert.equal(leakageAlert.leakSignals.includes("learning-workspace-mismatch"), true);
});

test("createCrossTenantLeakDetector stays clear when learning and isolation stay scoped", () => {
  const { leakageAlert } = createCrossTenantLeakDetector({
    workspaceIsolationDecision: {
      workspaceIsolationDecisionId: "workspace-isolation:alpha:view",
      workspaceId: "workspace-alpha",
      requestWorkspaceId: "workspace-alpha",
      resourceType: "project-state",
      decision: "allowed",
      isBlocked: false,
      triggeredLeakSignals: [],
    },
    learningEvent: {
      sourceWorkspaceId: "workspace-alpha",
      mixedResources: [],
    },
  });

  assert.equal(leakageAlert.severity, "clear");
  assert.equal(leakageAlert.isActive, false);
  assert.equal(leakageAlert.checks.includes("no-cross-tenant-leak-detected"), true);
});
