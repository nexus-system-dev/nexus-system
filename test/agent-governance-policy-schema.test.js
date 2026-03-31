import test from "node:test";
import assert from "node:assert/strict";

import { defineAgentGovernancePolicySchema } from "../src/core/agent-governance-policy-schema.js";

test("agent governance policy normalizes known agent types", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType: "Developer Worker",
  });

  assert.equal(agentGovernancePolicy.agentType, "dev-agent");
});

test("agent governance policy falls back to generic agent for unknown strings", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType: "analytics-bot",
  });

  assert.equal(agentGovernancePolicy.agentType, "generic-agent");
});

test("agent governance policy falls back to unknown agent when input is missing", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema();

  assert.equal(agentGovernancePolicy.agentType, "unknown-agent");
  assert.equal(agentGovernancePolicy.sandboxLevel, "read-only");
});

test("agent governance policy returns canonical tools and enums", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType: "qa-agent",
    policySchema: {
      execution: {
        allowedActions: ["sandbox", "deploy"],
      },
      approvals: {
        approvalTypes: ["deployment-approval"],
      },
      deploy: {
        guardedTargets: ["web-deployment"],
      },
    },
  });

  assert.equal(Array.isArray(agentGovernancePolicy.allowedTools), true);
  assert.equal(agentGovernancePolicy.allowedTools.includes("run-sandbox-execution"), true);
  assert.equal(agentGovernancePolicy.allowedTools.includes("deploy-artifact"), true);
  assert.equal(agentGovernancePolicy.allowedTools.includes("request-approval"), true);
  assert.equal(
    ["no-execution", "read-only", "sandbox", "controlled-write", "privileged"].includes(agentGovernancePolicy.sandboxLevel),
    true,
  );
});

test("agent governance policy includes full spend thresholds and limits", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType: "marketing-agent",
  });

  assert.equal(Object.hasOwn(agentGovernancePolicy.spendThresholds, "perAction"), true);
  assert.equal(Object.hasOwn(agentGovernancePolicy.spendThresholds, "perSession"), true);
  assert.equal(Object.hasOwn(agentGovernancePolicy.spendThresholds, "perDay"), true);
  assert.equal(agentGovernancePolicy.spendThresholds.currency, "usd");
  assert.equal(Object.hasOwn(agentGovernancePolicy.agentLimits, "maxActionsPerRun"), true);
  assert.equal(Object.hasOwn(agentGovernancePolicy.agentLimits, "maxConcurrentActions"), true);
  assert.equal(Object.hasOwn(agentGovernancePolicy.agentLimits, "maxWriteTargets"), true);
  assert.equal(Object.hasOwn(agentGovernancePolicy.agentLimits, "escalationRequiredAbove"), true);
});

test("agent governance policy uses canonical escalation rules only", () => {
  const { agentGovernancePolicy } = defineAgentGovernancePolicySchema({
    agentType: "dev-agent",
  });

  const values = Object.values(agentGovernancePolicy.escalationRules);
  assert.equal(values.length, 5);
  assert.equal(values.every((value) => ["block", "require-approval", "allow-with-audit", "escalate"].includes(value)), true);
});
