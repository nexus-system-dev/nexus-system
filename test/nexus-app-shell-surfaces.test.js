import test from "node:test";
import assert from "node:assert/strict";

import { defineNexusAppShellSchema } from "../src/core/nexus-app-shell-schema.js";
import { createAuthenticatedAppShellModel } from "../src/core/authenticated-app-shell-model.js";
import { createNexusNavigationAndRouteSurfaceBinder } from "../src/core/nexus-navigation-route-surface-binder.js";
import { createDashboardHomeSurfaceModel } from "../src/core/dashboard-home-surface-model.js";
import { createUnifiedHomeDashboardModel } from "../src/core/unified-home-dashboard-model.js";
import { createTodayPrioritiesAndNextActionFeed } from "../src/core/today-priorities-next-action-feed.js";
import { createOwnerVisibilityStripForHomeDashboard } from "../src/core/owner-visibility-strip.js";

test("nexus app shell schema defines authenticated home, onboarding resume, and settings routes", () => {
  const { nexusAppShellSchema } = defineNexusAppShellSchema({
    authenticationViewState: {
      activeScreen: "login",
      summary: { needsUserInput: false },
    },
    postAuthRedirect: { destination: "workbench" },
    projectCreationExperience: { validation: { canCreateDraft: true } },
    onboardingViewState: {
      activeScreen: "goal-selection",
      summary: { needsUserInput: true },
      status: "ready",
    },
    workspaceNavigationModel: {
      projectId: "giftwallet",
      availableWorkspaces: [
        { key: "developer", route: "/workspace/developer", isAvailable: true },
        { key: "project-brain", route: "/workspace/project-brain", isAvailable: true },
      ],
    },
    screenInventory: {
      screens: [{ screenId: "workspace-home" }, { screenId: "settings" }],
      summary: { screenTypes: ["workspace", "settings"] },
    },
    boundaryDisclosureModel: {
      disclosureCards: [{ cardId: "boundary-1" }],
    },
  });

  assert.equal(nexusAppShellSchema.status, "ready");
  assert.equal(nexusAppShellSchema.defaultAuthenticatedRoute, "workspace-home");
  assert.equal(nexusAppShellSchema.routeRegistry.some((route) => route.routeKey === "workspace-home" && route.enabled), true);
  assert.equal(nexusAppShellSchema.routeRegistry.some((route) => route.routeKey === "settings"), true);
  assert.equal(nexusAppShellSchema.summary.supportsOnboardingResume, true);
});

test("authenticated app shell and navigation surface bind the real workspace entry route", () => {
  const { authenticatedAppShell } = createAuthenticatedAppShellModel({
    nexusAppShellSchema: {
      routeRegistry: [
        { routeKey: "workspace-home", path: "/home", enabled: true },
        { routeKey: "settings", path: "/settings", enabled: true },
      ],
      defaultAuthenticatedRoute: "workspace-home",
    },
    authenticationState: { isAuthenticated: true },
    postAuthRedirect: { destination: "workbench" },
    projectCreationExperience: { postLoginDestination: "workspace" },
    onboardingViewState: { summary: { needsUserInput: false } },
    workspaceNavigationModel: {
      projectId: "giftwallet",
      currentWorkspace: { key: "developer", label: "Developer" },
      availableWorkspaces: [
        { key: "developer", label: "Developer", route: "/workspace/developer", workspaceId: "dev", isAvailable: true },
        { key: "project-brain", label: "Project Brain", route: "/workspace/project-brain", workspaceId: "brain", isAvailable: true },
      ],
    },
    userIdentity: { userId: "user-1", displayName: "Yogev" },
  });

  const { navigationRouteSurface } = createNexusNavigationAndRouteSurfaceBinder({
    nexusAppShellSchema: {
      routeRegistry: [
        { routeKey: "workspace-home", path: "/home", enabled: true },
        { routeKey: "settings", path: "/settings", enabled: true },
      ],
      defaultAuthenticatedRoute: "workspace-home",
    },
    authenticatedAppShell,
    workspaceNavigationModel: {
      projectId: "giftwallet",
      currentWorkspace: { key: "developer" },
      availableWorkspaces: [
        { key: "developer", label: "Developer", route: "/workspace/developer", workspaceId: "dev", isAvailable: true },
        { key: "project-brain", label: "Project Brain", route: "/workspace/project-brain", workspaceId: "brain", isAvailable: true },
      ],
      handoffContext: { projectId: "giftwallet", currentWorkspace: "developer" },
    },
    navigationComponents: {
      navigationComponentLibraryId: "nav-lib-1",
      components: [{ componentId: "nav-rail" }],
    },
  });

  assert.equal(authenticatedAppShell.status, "ready");
  assert.equal(authenticatedAppShell.shellStage, "workspace");
  assert.equal(navigationRouteSurface.status, "ready");
  assert.equal(navigationRouteSurface.activeRoute.routeKey, "workspace-home");
  assert.equal(navigationRouteSurface.workspaceTabs.length, 2);
});

test("dashboard home, unified home, priorities, and owner strip turn owner state into a real landing surface", () => {
  const { dashboardHomeSurface } = createDashboardHomeSurfaceModel({
    authenticatedAppShell: {
      status: "ready",
      workspaceContext: { projectId: "giftwallet" },
    },
    navigationRouteSurface: {
      activeRoute: { routeKey: "workspace-home" },
    },
    progressState: {
      progressPercent: 42,
      summary: { headline: "Progress is moving" },
    },
    ownerDecisionDashboard: {
      summary: { headline: "Focus on onboarding activation" },
      recommendedActionCount: 3,
    },
    ownerPriorityQueue: {
      items: [{ id: "p1" }, { id: "p2" }],
    },
  });

  const { unifiedHomeDashboard } = createUnifiedHomeDashboardModel({
    dashboardHomeSurface,
    navigationRouteSurface: {
      activeRoute: { routeKey: "workspace-home" },
      workspaceTabs: [{ tabId: "developer" }],
      handoffContext: { projectId: "giftwallet" },
    },
    ownerPriorityQueue: {
      items: [{ id: "p1" }, { id: "p2" }],
    },
    ownerActionRecommendations: {
      recommendations: [{ actionId: "a1" }, { actionId: "a2" }],
    },
    ownerDecisionDashboard: {
      summary: { headline: "Focus on onboarding activation" },
    },
  });

  const { todayPrioritiesFeed } = createTodayPrioritiesAndNextActionFeed({
    unifiedHomeDashboard,
    ownerPriorityQueue: { items: [{ id: "p1" }, { id: "p2" }] },
    ownerActionRecommendations: { recommendations: [{ actionId: "a1" }, { actionId: "a2" }] },
    nextTaskPresentation: { taskId: "task-1", headline: "Ship onboarding fix" },
  });

  const { ownerVisibilityStrip } = createOwnerVisibilityStripForHomeDashboard({
    unifiedHomeDashboard,
    ownerControlCenter: {
      maintenanceTaskCount: 1,
      requiresMaintenanceReview: true,
      maintenanceStatus: "review-required",
    },
    ownerDecisionDashboard: {
      recommendedActionCount: 3,
      summary: { headline: "Act now" },
    },
    dailyOwnerOverview: {
      openIssues: 2,
    },
  });

  assert.equal(dashboardHomeSurface.status, "ready");
  assert.equal(unifiedHomeDashboard.status, "ready");
  assert.equal(unifiedHomeDashboard.wowSignals.hasUnifiedProgressView, true);
  assert.equal(todayPrioritiesFeed.status, "ready");
  assert.equal(todayPrioritiesFeed.nextActions.some((action) => action.actionId === "task-1"), true);
  assert.equal(ownerVisibilityStrip.status, "ready");
  assert.equal(ownerVisibilityStrip.summary.requiresAttention, true);
});
