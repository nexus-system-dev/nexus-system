import test from "node:test";
import assert from "node:assert/strict";

import { createProjectAccessControlModule } from "../src/core/project-access-control-module.js";

test("project access control module allows owner project actions", () => {
  const { accessDecision } = createProjectAccessControlModule({
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    membershipRecord: {
      role: "owner",
    },
    projectId: "project-1",
    actorType: "owner",
    policyDecision: {
      isBlocked: false,
      requiresApproval: false,
    },
  });

  assert.equal(accessDecision.decision, "allowed");
  assert.equal(accessDecision.canDeploy, true);
  assert.equal(accessDecision.canApprove, true);
});

test("project access control module restricts blocked editor access", () => {
  const { accessDecision } = createProjectAccessControlModule({
    workspaceModel: {
      workspaceId: "workspace-1",
    },
    membershipRecord: {
      role: "editor",
    },
    projectId: "project-1",
    actorType: "editor",
    policyDecision: {
      isBlocked: true,
      reason: "Policy blocked this action",
    },
  });

  assert.equal(accessDecision.decision, "blocked");
  assert.equal(accessDecision.canView, true);
  assert.equal(accessDecision.canEdit, false);
  assert.equal(accessDecision.allowedActions.includes("view"), true);
});
