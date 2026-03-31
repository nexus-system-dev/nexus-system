import test from "node:test";
import assert from "node:assert/strict";

import { defineAgentGovernancePolicySchema } from "../src/core/agent-governance-policy-schema.js";
import { createAgentSandboxPolicyResolver } from "../src/core/agent-sandbox-policy-resolver.js";

function createExecutionTopology(modes) {
  return {
    projectId: "giftwallet",
    defaultMode: modes[0] ?? "agent",
    topologies: modes.map((mode) => ({
      mode,
      readiness: "ready",
    })),
  };
}

test("dev agent backend task prefers temp-branch under controlled-write policy", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "backend",
    executionTopology: createExecutionTopology(["sandbox", "temp-branch", "agent"]),
  });

  assert.equal(sandboxDecision.decision, "allowed");
  assert.equal(sandboxDecision.selectedSurface, "temp-branch");
  assert.equal(sandboxDecision.selectedBoundary, "branch-boundary");
  assert.equal(sandboxDecision.alternatives.includes("sandbox"), true);
});

test("qa agent release work requires escalation instead of silent privilege widening", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "qa-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "release",
    executionTopology: createExecutionTopology(["sandbox", "ci-runner"]),
  });

  assert.equal(sandboxDecision.decision, "requires-escalation");
  assert.equal(sandboxDecision.allowed, false);
  assert.equal(sandboxDecision.requiresEscalation, true);
  assert.equal(sandboxDecision.selectedSurface, null);
});

test("marketing agent content work stays within restricted compatible surfaces", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "marketing-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "content",
    executionTopology: createExecutionTopology(["agent", "sandbox", "local-terminal"]),
  });

  assert.equal(sandboxDecision.decision, "allowed");
  assert.equal(["agent", "sandbox"].includes(sandboxDecision.selectedSurface), true);
  assert.equal(sandboxDecision.alternatives.includes("local-terminal"), false);
});

test("unknown agent falls back safely to read-only agent execution", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: null });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "generic",
    executionTopology: createExecutionTopology(["agent", "sandbox"]),
  });

  assert.equal(agentGovernancePolicy.agentType, "unknown-agent");
  assert.equal(sandboxDecision.selectedSurface, "agent");
  assert.equal(sandboxDecision.decision, "allowed");
});

test("ios task without xcode is blocked instead of silently downgrading", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy: {
      ...agentGovernancePolicy,
      sandboxLevel: "privileged",
      allowedTools: [...agentGovernancePolicy.allowedTools, "build-apple-artifact"],
    },
    taskType: "ios",
    executionTopology: createExecutionTopology(["sandbox", "temp-branch"]),
  });

  assert.equal(sandboxDecision.decision, "blocked");
  assert.equal(sandboxDecision.selectedSurface, null);
  assert.equal(sandboxDecision.alternatives.length, 0);
});

test("controlled-write agent falls back to sandbox when temp-branch is unavailable but capability remains sufficient", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "backend",
    executionTopology: createExecutionTopology(["sandbox", "agent"]),
  });

  assert.equal(sandboxDecision.decision, "allowed");
  assert.equal(sandboxDecision.selectedSurface, "sandbox");
});

test("alternatives include only relevant compatible surfaces", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({ agentType: "dev-agent" });
  const { sandboxDecision } = createAgentSandboxPolicyResolver({
    agentGovernancePolicy,
    taskType: "backend",
    executionTopology: createExecutionTopology(["temp-branch", "sandbox", "container", "local-terminal"]),
  });

  assert.deepEqual(sandboxDecision.alternatives, ["sandbox"]);
});
