import test from "node:test";
import assert from "node:assert/strict";

import { createDailyWorkspaceSurfaceModel } from "../src/core/daily-workspace-surface-model.js";
import { createGuidedTaskExecutionSurface } from "../src/core/guided-task-execution-surface.js";
import { createTaskStepFlowAndProgressBinder } from "../src/core/task-step-flow-progress-binder.js";
import { createTaskApprovalHandoffPanel } from "../src/core/task-approval-handoff-panel.js";
import { createSettingsAndProfileSurfaceModel } from "../src/core/settings-profile-surface-model.js";

test("daily workspace surface binds authenticated shell, navigation, and workspaces into one execution surface", () => {
  const { dailyWorkspaceSurface } = createDailyWorkspaceSurfaceModel({
    authenticatedAppShell: {
      status: "ready",
      summary: { canEnterWorkspace: true },
      workspaceContext: { projectId: "giftwallet" },
    },
    navigationRouteSurface: {
      handoffContext: { currentWorkspace: "developer" },
    },
    developerWorkspace: { workspaceId: "developer-workspace", title: "Developer" },
    projectBrainWorkspace: { workspaceId: "project-brain-workspace", title: "Project Brain" },
    releaseWorkspace: { workspaceId: "release-workspace", title: "Release" },
    growthWorkspace: { workspaceId: "growth-workspace", title: "Growth" },
    capabilityDecision: { decision: "supported" },
  });

  assert.equal(dailyWorkspaceSurface.status, "ready");
  assert.equal(dailyWorkspaceSurface.activeWorkspaceKey, "developer");
  assert.equal(dailyWorkspaceSurface.summary.supportsWorkspaceExecution, true);
});

test("guided task flow and approval handoff expose a focused task execution path", () => {
  const { guidedTaskExecutionSurface } = createGuidedTaskExecutionSurface({
    dailyWorkspaceSurface: {
      status: "ready",
      activeWorkspaceKey: "developer",
    },
    nextTaskPresentation: {
      taskId: "task-1",
      headline: "Implement billing guardrail",
    },
    selectedTask: {
      id: "task-1",
      summary: "Implement billing guardrail",
    },
    progressState: {
      progressPercent: 25,
    },
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
  });

  const { taskStepFlowProgress } = createTaskStepFlowAndProgressBinder({
    guidedTaskExecutionSurface,
    taskExecutionMetric: {
      entries: [{ stepId: "approval", status: "blocked" }],
    },
    progressState: {
      progressPercent: 25,
      progressStatus: "in-progress",
    },
    realityProgress: {
      progressPercent: 30,
    },
  });

  const { taskApprovalHandoffPanel } = createTaskApprovalHandoffPanel({
    guidedTaskExecutionSurface,
    taskStepFlowProgress,
    nextTaskApprovalPanel: {
      requiresApproval: true,
      approvalStatus: "pending",
      safeAlternatives: ["open-safe-path"],
    },
    sharedApprovalState: {
      requiresApproval: true,
      status: "pending",
    },
  });

  assert.equal(guidedTaskExecutionSurface.status, "ready");
  assert.equal(guidedTaskExecutionSurface.summary.canRunFocusedTask, true);
  assert.equal(taskStepFlowProgress.status, "ready");
  assert.equal(taskStepFlowProgress.summary.hasBlockedEntries, true);
  assert.equal(taskApprovalHandoffPanel.status, "ready");
  assert.equal(taskApprovalHandoffPanel.requiresApproval, true);
  assert.equal(taskApprovalHandoffPanel.progressBlocked, true);
});

test("settings and profile surface exposes actor, billing, notifications, and security context", () => {
  const { settingsProfileSurface } = createSettingsAndProfileSurfaceModel({
    authenticatedAppShell: {
      status: "ready",
      actor: { userId: "user-1" },
      workspaceContext: { projectId: "giftwallet" },
    },
    navigationRouteSurface: {
      routeBindings: [{ routeKey: "settings" }],
    },
    userIdentity: {
      userId: "user-1",
      displayName: "Yogev",
      email: "yogev@example.com",
    },
    workspaceSettings: {
      timezone: "Asia/Jerusalem",
    },
    notificationPreferences: {
      email: true,
    },
    billingSettingsModel: {
      currentPlan: "pro",
      availableActions: ["change-plan"],
    },
    ownerMfaDecision: {
      decision: "required",
    },
  });

  assert.equal(settingsProfileSurface.status, "ready");
  assert.equal(settingsProfileSurface.actorProfile.userId, "user-1");
  assert.equal(settingsProfileSurface.billingSnapshot.currentPlan, "pro");
  assert.equal(settingsProfileSurface.securitySettings.mfaDecision, "required");
  assert.equal(settingsProfileSurface.summary.hasSettingsRoute, true);
});
