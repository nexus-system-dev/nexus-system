import test from "node:test";
import assert from "node:assert/strict";

import { createActionLevelProjectAuthorizationResolver } from "../src/core/action-level-project-authorization-resolver.js";

test("action-level project authorization resolver allows deploy for operator with capability", () => {
  const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
    actorType: "operator",
    projectAction: "deploy",
    roleCapabilityMatrix: {
      roles: [
        {
          role: "operator",
          capabilities: {
            view: true,
            edit: false,
            run: true,
            approve: false,
            deploy: true,
            connectAccounts: true,
            manageCredentials: false,
          },
          allowedActions: ["view", "run", "deploy", "connect-accounts"],
        },
        {
          role: "viewer",
          capabilities: {
            view: true,
            edit: false,
            run: false,
            approve: false,
            deploy: false,
            connectAccounts: false,
            manageCredentials: false,
          },
          allowedActions: ["view"],
        },
      ],
    },
  });

  assert.equal(projectAuthorizationDecision.decision, "allowed");
  assert.equal(projectAuthorizationDecision.requiredCapability, "deploy");
  assert.equal(projectAuthorizationDecision.isAllowed, true);
  assert.equal(projectAuthorizationDecision.allowedActions.includes("deploy"), true);
  assert.equal(projectAuthorizationDecision.checks.includes("privileged-deploy-action"), true);
});

test("action-level project authorization resolver requires approval when policy demands it", () => {
  const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
    actorType: "owner",
    projectAction: "deploy",
    roleCapabilityMatrix: {
      roles: [
        {
          role: "owner",
          capabilities: {
            view: true,
            edit: true,
            run: true,
            approve: true,
            deploy: true,
            connectAccounts: true,
            manageCredentials: true,
          },
          allowedActions: ["view", "edit", "run", "approve", "deploy", "connect-accounts", "manage-credentials"],
        },
      ],
    },
    policyDecision: {
      decision: "requires-approval",
      requiresApproval: true,
      reason: "Production deploy requires approval",
    },
  });

  assert.equal(projectAuthorizationDecision.decision, "requires-approval");
  assert.equal(projectAuthorizationDecision.requiresApproval, true);
  assert.equal(projectAuthorizationDecision.isBlocked, false);
  assert.equal(projectAuthorizationDecision.reason, "Production deploy requires approval");
});

test("action-level project authorization resolver blocks action when role capability is missing", () => {
  const { projectAuthorizationDecision } = createActionLevelProjectAuthorizationResolver({
    actorType: "reviewer",
    projectAction: "code-edit",
    roleCapabilityMatrix: {
      roles: [
        {
          role: "reviewer",
          capabilities: {
            view: true,
            edit: false,
            run: false,
            approve: true,
            deploy: false,
            connectAccounts: false,
            manageCredentials: false,
          },
          allowedActions: ["view", "approve"],
        },
        {
          role: "viewer",
          capabilities: {
            view: true,
            edit: false,
            run: false,
            approve: false,
            deploy: false,
            connectAccounts: false,
            manageCredentials: false,
          },
          allowedActions: ["view"],
        },
      ],
    },
  });

  assert.equal(projectAuthorizationDecision.decision, "blocked");
  assert.equal(projectAuthorizationDecision.requiredCapability, "edit");
  assert.equal(projectAuthorizationDecision.checks.includes("role-capability-missing"), true);
});
