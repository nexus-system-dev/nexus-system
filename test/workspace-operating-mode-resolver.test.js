import test from "node:test";
import assert from "node:assert/strict";

import { createWorkspaceOperatingModeResolver } from "../src/core/workspace-operating-mode-resolver.js";

const EXPECTED_WORKSPACE_MODE_DEFINITIONS = {
  "user-only": {
    actor: "user",
    aiUsageLevel: "none",
    expectedCostProfile: "low",
    enforcementLevel: "lenient",
  },
  hybrid: {
    actor: "user+system",
    aiUsageLevel: "medium",
    expectedCostProfile: "medium",
    enforcementLevel: "balanced",
  },
  autonomous: {
    actor: "system",
    aiUsageLevel: "high",
    expectedCostProfile: "high",
    enforcementLevel: "strict",
  },
};

test("workspace operating mode resolver returns user-only for valid stored user-only mode", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "user-only",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "user-only" });
  assert.deepEqual(result.workspaceModeDefinitions, EXPECTED_WORKSPACE_MODE_DEFINITIONS);
});

test("workspace operating mode resolver returns hybrid for valid stored hybrid mode", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "hybrid",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "hybrid" });
});

test("workspace operating mode resolver returns autonomous for valid stored autonomous mode", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "autonomous",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "autonomous" });
});

test("workspace operating mode resolver falls back to user-only when mode is missing", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {},
  });

  assert.deepEqual(result.workspaceMode, { type: "user-only" });
});

test("workspace operating mode resolver falls back to user-only when mode is invalid", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "expert-mode",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "user-only" });
});

test("defaultExecutionMode does not affect workspaceMode", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      defaultExecutionMode: "autonomous",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "user-only" });
});

test("changing execution mode does not change operating mode", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "hybrid",
      defaultExecutionMode: "guided",
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "hybrid" });
});

test("resolver does not depend on usage billing cost or runtime behavior", () => {
  const result = createWorkspaceOperatingModeResolver({
    workspaceSettings: {
      workspaceOperatingMode: "invalid-mode",
      costSummary: { totalEstimatedCost: 50 },
      billingPlanSchema: { plans: [{ planId: "pro" }] },
      usageSummary: { aiTokens: 99999 },
      runtimeBehavior: { executionMode: "autonomous" },
    },
  });

  assert.deepEqual(result.workspaceMode, { type: "user-only" });
});
