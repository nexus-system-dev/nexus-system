import test from "node:test";
import assert from "node:assert/strict";

import { createPostAuthRedirectResolver } from "../src/core/post-auth-redirect-resolver.js";

test("post auth redirect resolver sends authenticated users without workspace to project creation", () => {
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision: {
      route: "workspace",
    },
    sessionState: {
      status: "active",
      userId: "user-1",
    },
    workspaceModel: {},
  });

  assert.equal(postAuthRedirect.destination, "project-creation");
  assert.equal(postAuthRedirect.summary.hasWorkspace, false);
});

test("post auth redirect resolver resumes onboarding when onboarding is in progress", () => {
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision: {
      route: "workspace",
    },
    sessionState: {
      status: "active",
      userId: "user-1",
      resumeOnboarding: true,
    },
    workspaceModel: {
      workspaceId: "workspace-user-1",
      onboardingStatus: "in-progress",
    },
  });

  assert.equal(postAuthRedirect.destination, "onboarding-resume");
  assert.equal(postAuthRedirect.summary.resumesOnboarding, true);
});

test("post auth redirect resolver routes pending approvals to approval inbox", () => {
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision: {
      route: "workspace",
    },
    sessionState: {
      status: "active",
      userId: "user-1",
      pendingApprovalCount: 2,
    },
    workspaceModel: {
      workspaceId: "workspace-user-1",
      status: "active",
    },
  });

  assert.equal(postAuthRedirect.destination, "approval-inbox");
  assert.equal(postAuthRedirect.summary.waitsForApproval, true);
});

test("post auth redirect resolver routes waitlist users to waitlist status", () => {
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision: {
      route: "workspace",
    },
    sessionState: {
      status: "active",
      userId: "user-1",
    },
    workspaceModel: {
      workspaceId: "workspace-user-1",
      status: "waitlist",
    },
  });

  assert.equal(postAuthRedirect.destination, "waitlist-status");
  assert.equal(postAuthRedirect.reason, "workspace-waitlist");
});

test("post auth redirect resolver sends ready users to workbench", () => {
  const { postAuthRedirect } = createPostAuthRedirectResolver({
    authenticationRouteDecision: {
      route: "workspace",
    },
    sessionState: {
      status: "active",
      userId: "user-1",
    },
    workspaceModel: {
      workspaceId: "workspace-user-1",
      status: "active",
    },
  });

  assert.equal(postAuthRedirect.destination, "workbench");
  assert.equal(postAuthRedirect.summary.entersWorkbench, true);
});
