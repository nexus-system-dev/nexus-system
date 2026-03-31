function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const SANDBOX_LEVELS = new Set([
  "no-execution",
  "read-only",
  "sandbox",
  "controlled-write",
  "privileged",
]);

const ESCALATION_ACTIONS = new Set([
  "block",
  "require-approval",
  "allow-with-audit",
  "escalate",
]);

function normalizeAgentType(agentType = null) {
  const raw = normalizeString(agentType, null)?.toLowerCase() ?? null;
  if (!raw) {
    return "unknown-agent";
  }

  if (raw === "dev-agent" || raw.includes("dev-agent") || raw.includes("developer")) {
    return "dev-agent";
  }
  if (raw === "qa-agent" || raw.includes("qa-agent") || raw.includes("quality")) {
    return "qa-agent";
  }
  if (raw === "marketing-agent" || raw.includes("marketing-agent") || raw.includes("marketing")) {
    return "marketing-agent";
  }
  if (raw === "generic-agent" || raw.includes("generic")) {
    return "generic-agent";
  }

  return "generic-agent";
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function mapPolicyActionToTool(action) {
  const normalized = normalizeString(action, null);
  const mapping = {
    sandbox: "run-sandbox-execution",
    "local-terminal": "run-local-command",
    "temp-branch": "update-project-state",
    xcode: "build-apple-artifact",
    deploy: "deploy-artifact",
    build: "run-build",
    execution: "run-execution",
    review: "request-approval",
  };
  return normalized ? mapping[normalized] ?? null : null;
}

function buildBasePolicy(agentType) {
  const genericEscalationRules = {
    onPrivilegedAction: "require-approval",
    onSpendThresholdExceeded: "block",
    onPolicyConflict: "escalate",
    onUnknownTool: "block",
    onSandboxViolation: "block",
  };

  if (agentType === "dev-agent") {
    return {
      allowedTools: [
        "read-project-state",
        "update-project-state",
        "run-tests",
        "run-build",
        "run-sandbox-execution",
        "deploy-artifact",
        "request-approval",
      ],
      sandboxLevel: "controlled-write",
      spendThresholds: {
        perAction: 5,
        perSession: 25,
        perDay: 100,
        currency: "usd",
      },
      agentLimits: {
        maxActionsPerRun: 8,
        maxConcurrentActions: 2,
        maxWriteTargets: 6,
        escalationRequiredAbove: "deploy-artifact",
      },
      escalationRules: {
        ...genericEscalationRules,
        onPrivilegedAction: "require-approval",
      },
    };
  }

  if (agentType === "qa-agent") {
    return {
      allowedTools: [
        "read-project-state",
        "run-tests",
        "request-approval",
      ],
      sandboxLevel: "sandbox",
      spendThresholds: {
        perAction: 3,
        perSession: 12,
        perDay: 40,
        currency: "usd",
      },
      agentLimits: {
        maxActionsPerRun: 10,
        maxConcurrentActions: 2,
        maxWriteTargets: 1,
        escalationRequiredAbove: "update-project-state",
      },
      escalationRules: {
        ...genericEscalationRules,
        onPrivilegedAction: "block",
      },
    };
  }

  if (agentType === "marketing-agent") {
    return {
      allowedTools: [
        "read-project-state",
        "update-project-state",
        "request-approval",
      ],
      sandboxLevel: "sandbox",
      spendThresholds: {
        perAction: 2,
        perSession: 10,
        perDay: 30,
        currency: "usd",
      },
      agentLimits: {
        maxActionsPerRun: 6,
        maxConcurrentActions: 1,
        maxWriteTargets: 3,
        escalationRequiredAbove: "deploy-artifact",
      },
      escalationRules: {
        ...genericEscalationRules,
        onPrivilegedAction: "block",
      },
    };
  }

  if (agentType === "unknown-agent") {
    return {
      allowedTools: ["read-project-state", "request-approval"],
      sandboxLevel: "read-only",
      spendThresholds: {
        perAction: null,
        perSession: null,
        perDay: null,
        currency: "usd",
      },
      agentLimits: {
        maxActionsPerRun: 1,
        maxConcurrentActions: 1,
        maxWriteTargets: 0,
        escalationRequiredAbove: "read-project-state",
      },
      escalationRules: {
        onPrivilegedAction: "block",
        onSpendThresholdExceeded: "block",
        onPolicyConflict: "block",
        onUnknownTool: "block",
        onSandboxViolation: "block",
      },
    };
  }

  return {
    allowedTools: [
      "read-project-state",
      "request-approval",
    ],
    sandboxLevel: "read-only",
    spendThresholds: {
      perAction: 1,
      perSession: 5,
      perDay: 10,
      currency: "usd",
    },
    agentLimits: {
      maxActionsPerRun: 3,
      maxConcurrentActions: 1,
      maxWriteTargets: 0,
      escalationRequiredAbove: "update-project-state",
    },
    escalationRules: {
      ...genericEscalationRules,
      onPrivilegedAction: "block",
    },
  };
}

function buildPolicyInfluence(policySchema = null) {
  const normalized = normalizeObject(policySchema);
  const execution = normalizeObject(normalized.execution);
  const approvals = normalizeObject(normalized.approvals);
  const deploy = normalizeObject(normalized.deploy);

  return uniqueStrings([
    ...((Array.isArray(execution.allowedActions) ? execution.allowedActions : []).map(mapPolicyActionToTool)),
    ...((Array.isArray(approvals.approvalTypes) ? approvals.approvalTypes : []).length > 0 ? ["request-approval"] : []),
    ...((Array.isArray(deploy.guardedTargets) ? deploy.guardedTargets : []).length > 0 ? ["deploy-artifact"] : []),
  ]);
}

export function defineAgentGovernancePolicySchema({
  agentType = null,
  policySchema = null,
} = {}) {
  const normalizedAgentType = normalizeAgentType(agentType);
  const basePolicy = buildBasePolicy(normalizedAgentType);
  const policyInfluenceTools = buildPolicyInfluence(policySchema);
  const allowedTools = uniqueStrings([
    ...basePolicy.allowedTools,
    ...policyInfluenceTools,
  ]);

  const sandboxLevel = SANDBOX_LEVELS.has(basePolicy.sandboxLevel)
    ? basePolicy.sandboxLevel
    : "read-only";
  const escalationRules = Object.fromEntries(
    Object.entries(basePolicy.escalationRules).map(([key, value]) => [
      key,
      ESCALATION_ACTIONS.has(value) ? value : "block",
    ]),
  );

  return {
    agentGovernancePolicy: {
      agentType: normalizedAgentType,
      allowedTools,
      sandboxLevel,
      spendThresholds: {
        perAction: basePolicy.spendThresholds.perAction,
        perSession: basePolicy.spendThresholds.perSession,
        perDay: basePolicy.spendThresholds.perDay,
        currency: "usd",
      },
      agentLimits: {
        maxActionsPerRun: basePolicy.agentLimits.maxActionsPerRun,
        maxConcurrentActions: basePolicy.agentLimits.maxConcurrentActions,
        maxWriteTargets: basePolicy.agentLimits.maxWriteTargets,
        escalationRequiredAbove: basePolicy.agentLimits.escalationRequiredAbove,
      },
      escalationRules,
      summary: `Governance policy for ${normalizedAgentType} allows ${allowedTools.length} canonical tools under ${sandboxLevel} sandbox level.`,
    },
  };
}
