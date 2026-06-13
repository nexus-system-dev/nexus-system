import test from "node:test";
import assert from "node:assert/strict";

import { createDailyWorkspaceSurfaceModel } from "../src/core/daily-workspace-surface-model.js";
import { createGuidedTaskExecutionSurface } from "../src/core/guided-task-execution-surface.js";
import { createTaskStepFlowAndProgressBinder } from "../src/core/task-step-flow-progress-binder.js";
import { createTaskApprovalHandoffPanel } from "../src/core/task-approval-handoff-panel.js";
import { createSettingsAndProfileSurfaceModel } from "../src/core/settings-profile-surface-model.js";
import { buildSettingsViewModel } from "../web/nexus-ui/adapters/settings-adapter.js";
import { renderSettingsScreen } from "../web/nexus-ui/screens/SettingsScreen.js";

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

test("ACCT-001 settings screen renders account boundary without internal task labels", () => {
  const viewModel = buildSettingsViewModel({
    activePanel: "account",
    settingsProfileSurface: {
      actorProfile: {
        userId: "user-1",
        displayName: "Yogev",
        email: "yogev@example.com",
        role: "owner",
      },
      accountBoundary: {
        status: "ready",
        userIdentity: {
          verificationStatus: "verified",
        },
        activeSession: {
          status: "active",
        },
        accountSecurity: {
          authMethod: "password",
          availableActions: ["change-password", "logout-all", "request-account-deletion"],
        },
        linkedTruth: {
          privacy: { status: "linked-not-closed-here" },
          billing: { status: "not-enabled-for-first-account-boundary" },
          team: { role: "owner", status: "active" },
          providerIdentity: { status: "provider-actions-require-explicit-provider-gate" },
          externalIdentity: { status: "not-closed-by-account-settings" },
        },
        accountActivityHistory: [
          {
            summary: "Profile details were updated for the account.",
            status: "completed",
            occurredAt: "2026-06-10T00:00:00.000Z",
          },
        ],
      },
      supabasePersistenceDecision: {
        taskId: "SUPABASE-001",
        provider: "Supabase",
        decision: "defer-for-first-release",
        selectedPersistencePath: "project-service-workspace-store",
        adoptionRequirements: ["schema", "rls"],
        userFacing: {
          title: "ספק אחסון חיצוני",
          status: "לא מחובר עכשיו",
          summary: "נקסוס לא מחברת ספק חיצוני לפני מיפוי מלא.",
          nextStep: "החיבור ייפתח אחרי שמיפוי הרשאות, קבצים, פרטיות ושחזור יהיה מוכן.",
        },
      },
    },
  });

  const html = renderSettingsScreen(viewModel);

  assert.match(html, /גבול חשבון/);
  assert.match(html, /בקש מחיקת חשבון/);
  assert.match(html, /פעילות חשבון/);
  assert.match(html, /data-supabase-provider-task="SUPABASE-001"/);
  assert.match(html, /data-supabase-provider-decision="defer-for-first-release"/);
  assert.match(html, /לא מחובר עכשיו/);
  assert.doesNotMatch(html, /ACCT-001/);
  assert.doesNotMatch(html, /PRIVACY-001/);
  assert.doesNotMatch(html, /PROV-001/);
});
