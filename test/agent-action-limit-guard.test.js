import test from "node:test";
import assert from "node:assert/strict";

import { defineAgentGovernancePolicySchema } from "../src/core/agent-governance-policy-schema.js";
import { createAgentActionLimitGuard } from "../src/core/agent-action-limit-guard.js";

function createAllowedSandboxDecision(selectedSurface = "sandbox") {
  return {
    sandboxDecisionId: "sandbox-1",
    decision: "allowed",
    allowed: true,
    requiresEscalation: false,
    selectedSurface,
    alternatives: selectedSurface === "temp-branch" ? ["sandbox"] : [],
    summary: `Allowed on ${selectedSurface}.`,
  };
}

test("guard blocks when maxActionsPerRun is exceeded", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("temp-branch"),
    agentGovernancePolicy,
    taskContext: {
      taskType: "backend",
      plannedActions: 12,
      concurrentActions: 1,
      writeTargets: ["a.js"],
      providerOperations: [],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.limitChecks.some((check) => check.checkType === "max-actions-per-run" && check.status === "blocked"), true);
});

test("guard blocks when maxConcurrentActions is exceeded", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "marketing-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("sandbox"),
    agentGovernancePolicy,
    taskContext: {
      taskType: "content",
      plannedActions: 1,
      concurrentActions: 3,
      writeTargets: ["copy.md"],
      providerOperations: [],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.limitChecks.some((check) => check.checkType === "max-concurrent-actions" && check.status === "blocked"), true);
});

test("guard requires escalation when maxWriteTargets is exceeded", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "qa-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("sandbox"),
    agentGovernancePolicy,
    taskContext: {
      taskType: "backend",
      plannedActions: 2,
      concurrentActions: 1,
      writeTargets: ["a.js", "b.js"],
      providerOperations: [],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "requires-escalation");
  assert.equal(agentLimitDecision.escalationHint.requiredAction, "reduce-write-targets");
});

test("guard blocks when budget is exceeded", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "marketing-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("sandbox"),
    agentGovernancePolicy,
    budgetDecision: {
      decision: "blocked",
      allowed: false,
      perActionLimit: 2,
      perSessionLimit: 5,
      perDayLimit: 10,
      remainingBudget: 1,
      currency: "usd",
    },
    taskContext: {
      taskType: "content",
      plannedActions: 1,
      concurrentActions: 1,
      writeTargets: [],
      providerOperations: [],
      estimatedCost: 3,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.costChecks.some((check) => check.status === "blocked"), true);
});

test("guard blocks provider side effect when kill switch is active", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("temp-branch"),
    agentGovernancePolicy,
    killSwitchDecision: {
      isActive: true,
      killedPaths: ["provider-execution"],
    },
    taskContext: {
      taskType: "backend",
      plannedActions: 1,
      concurrentActions: 1,
      writeTargets: [],
      providerOperations: ["deploy"],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.providerSideEffectChecks.some((check) => check.status === "blocked"), true);
});

test("guard requires escalation for privileged provider side effects", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: createAllowedSandboxDecision("temp-branch"),
    agentGovernancePolicy,
    taskContext: {
      taskType: "backend",
      plannedActions: 1,
      concurrentActions: 1,
      writeTargets: [],
      providerOperations: ["deploy"],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "requires-escalation");
  assert.equal(agentLimitDecision.escalationHint.requiredAction, "request-approval");
});

test("kill switch hard block wins over all other checks", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: {
      ...createAllowedSandboxDecision("temp-branch"),
      decision: "requires-escalation",
      allowed: false,
      requiresEscalation: true,
    },
    agentGovernancePolicy,
    killSwitchDecision: {
      isActive: true,
      killedPaths: ["agent-runtime"],
    },
    taskContext: {
      taskType: "backend",
      plannedActions: 50,
      concurrentActions: 10,
      writeTargets: ["a", "b", "c"],
      providerOperations: ["deploy"],
      estimatedCost: 20,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.reason.includes("Kill switch"), true);
});

test("sandbox decision blocked wins before budget and limit checks", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "qa-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: {
      sandboxDecisionId: "sandbox-2",
      decision: "blocked",
      allowed: false,
      requiresEscalation: false,
      selectedSurface: null,
      alternatives: [],
      summary: "Sandbox decision blocked execution.",
    },
    agentGovernancePolicy,
    taskContext: {
      taskType: "release",
      plannedActions: 1,
      concurrentActions: 1,
      writeTargets: [],
      providerOperations: [],
      estimatedCost: 1,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(agentLimitDecision.decision, "blocked");
  assert.equal(agentLimitDecision.reason, "Sandbox decision blocked execution.");
});

test("alternatives and escalation hints are populated when relevant", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { agentLimitDecision } = createAgentActionLimitGuard({
    sandboxDecision: {
      ...createAllowedSandboxDecision("temp-branch"),
      alternatives: ["sandbox"],
    },
    agentGovernancePolicy,
    taskContext: {
      taskType: "backend",
      plannedActions: 1,
      concurrentActions: 1,
      writeTargets: ["a", "b", "c", "d", "e", "f", "g"],
      providerOperations: ["deploy"],
      estimatedCost: 7,
      scopeType: "project",
      scopeId: "giftwallet",
    },
  });

  assert.equal(Array.isArray(agentLimitDecision.alternatives), true);
  assert.equal(agentLimitDecision.alternatives.includes("request-approval"), true);
  assert.equal(agentLimitDecision.alternatives.includes("reduce-write-targets"), true);
  assert.equal(typeof agentLimitDecision.escalationHint?.reason, "string");
});
