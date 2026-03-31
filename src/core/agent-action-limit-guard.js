import { normalizeAgentBudgetDecision } from "./agent-budget-threshold-checker.js";
import { normalizeAgentTaskContext } from "./agent-task-context-normalizer.js";
import { classifyProviderSideEffects } from "./provider-side-effect-classifier.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildCheck({ checkId, checkType, status, reason, observedValue = null, limitValue = null, action = null }) {
  return {
    checkId,
    checkType,
    status,
    reason,
    observedValue,
    limitValue,
    action,
  };
}

function statusPriority(status) {
  return {
    pass: 0,
    "requires-escalation": 1,
    blocked: 2,
  }[status] ?? 0;
}

function finalDecisionFromChecks(statuses = []) {
  if (statuses.some((status) => status === "blocked")) {
    return "blocked";
  }
  if (statuses.some((status) => status === "requires-escalation")) {
    return "requires-escalation";
  }
  return "allowed";
}

function buildLimitChecks(agentGovernancePolicy, taskContext) {
  const limits = normalizeObject(agentGovernancePolicy?.agentLimits);
  const checks = [];

  if (limits.maxActionsPerRun !== null) {
    checks.push(buildCheck({
      checkId: "limit:max-actions-per-run",
      checkType: "max-actions-per-run",
      status: taskContext.plannedActions > limits.maxActionsPerRun ? "blocked" : "pass",
      reason:
        taskContext.plannedActions > limits.maxActionsPerRun
          ? "Planned actions exceed maxActionsPerRun."
          : "Planned actions stay within maxActionsPerRun.",
      observedValue: taskContext.plannedActions,
      limitValue: limits.maxActionsPerRun,
      action: "split-run",
    }));
  }

  if (limits.maxConcurrentActions !== null) {
    checks.push(buildCheck({
      checkId: "limit:max-concurrent-actions",
      checkType: "max-concurrent-actions",
      status: taskContext.concurrentActions > limits.maxConcurrentActions ? "blocked" : "pass",
      reason:
        taskContext.concurrentActions > limits.maxConcurrentActions
          ? "Concurrent actions exceed maxConcurrentActions."
          : "Concurrent actions stay within maxConcurrentActions.",
      observedValue: taskContext.concurrentActions,
      limitValue: limits.maxConcurrentActions,
      action: "split-run",
    }));
  }

  if (limits.maxWriteTargets !== null) {
    checks.push(buildCheck({
      checkId: "limit:max-write-targets",
      checkType: "max-write-targets",
      status: taskContext.writeTargets.length > limits.maxWriteTargets ? "requires-escalation" : "pass",
      reason:
        taskContext.writeTargets.length > limits.maxWriteTargets
          ? "Write targets exceed maxWriteTargets."
          : "Write targets stay within maxWriteTargets.",
      observedValue: taskContext.writeTargets.length,
      limitValue: limits.maxWriteTargets,
      action: "reduce-write-targets",
    }));
  }

  return checks;
}

function buildCostChecks(agentGovernancePolicy, budgetDecision, taskContext) {
  const checks = [];

  if (budgetDecision.perActionLimit !== null) {
    checks.push(buildCheck({
      checkId: "cost:per-action-limit",
      checkType: "per-action-limit",
      status:
        taskContext.estimatedCost !== null && taskContext.estimatedCost > budgetDecision.perActionLimit
          ? agentGovernancePolicy?.escalationRules?.onSpendThresholdExceeded === "block" ? "blocked" : "requires-escalation"
          : "pass",
      reason:
        taskContext.estimatedCost !== null && taskContext.estimatedCost > budgetDecision.perActionLimit
          ? "Estimated cost exceeds perActionLimit."
          : "Estimated cost stays within perActionLimit.",
      observedValue: taskContext.estimatedCost,
      limitValue: budgetDecision.perActionLimit,
      action: "request-approval",
    }));
  }

  if (budgetDecision.remainingBudget !== null) {
    checks.push(buildCheck({
      checkId: "cost:remaining-budget",
      checkType: "remaining-budget",
      status:
        taskContext.estimatedCost !== null && taskContext.estimatedCost > budgetDecision.remainingBudget
          ? "blocked"
          : "pass",
      reason:
        taskContext.estimatedCost !== null && taskContext.estimatedCost > budgetDecision.remainingBudget
          ? "Estimated cost exceeds remaining budget."
          : "Estimated cost fits within remaining budget.",
      observedValue: taskContext.estimatedCost,
      limitValue: budgetDecision.remainingBudget,
      action: "manual-execution",
    }));
  }

  if (budgetDecision.perSessionLimit !== null) {
    checks.push(buildCheck({
      checkId: "cost:per-session-limit",
      checkType: "per-session-limit",
      status: budgetDecision.decision === "requires-escalation" && budgetDecision.source === "policy-fallback" ? "requires-escalation" : "pass",
      reason:
        budgetDecision.decision === "requires-escalation" && budgetDecision.source === "policy-fallback"
          ? "Budget fallback indicates session threshold pressure and requires escalation."
          : "Session threshold remains within available budget assumptions.",
      observedValue: taskContext.estimatedCost,
      limitValue: budgetDecision.perSessionLimit,
      action: "request-approval",
    }));
  }

  return checks;
}

export function createAgentActionLimitGuard({
  sandboxDecision = null,
  budgetDecision = null,
  taskContext = null,
  agentGovernancePolicy = null,
  killSwitchDecision = null,
  circuitBreakerDecision = null,
  providerOperations = [],
} = {}) {
  const normalizedSandboxDecision = normalizeObject(sandboxDecision);
  const normalizedAgentGovernancePolicy = normalizeObject(agentGovernancePolicy);
  const normalizedTaskContext = normalizeAgentTaskContext({
    taskContext,
    providerOperations,
    projectId: taskContext?.scopeId ?? null,
  });
  const normalizedBudgetDecision = normalizeAgentBudgetDecision({
    budgetDecision,
    agentGovernancePolicy: normalizedAgentGovernancePolicy,
    taskContext: normalizedTaskContext,
  });

  const hardBlockChecks = [];

  if (killSwitchDecision?.isActive === true) {
    hardBlockChecks.push(buildCheck({
      checkId: "hard-block:kill-switch",
      checkType: "kill-switch",
      status: "blocked",
      reason: `Kill switch is active and blocks execution via ${normalizeArray(killSwitchDecision.killedPaths).join(", ") || "unknown path"}.`,
      action: "manual-execution",
    }));
  }

  if (normalizedSandboxDecision.decision === "blocked") {
    hardBlockChecks.push(buildCheck({
      checkId: "hard-block:sandbox-decision",
      checkType: "sandbox-decision",
      status: "blocked",
      reason: normalizedSandboxDecision.summary ?? "Sandbox decision blocked execution.",
      action: "manual-execution",
    }));
  } else if (normalizedSandboxDecision.decision === "requires-escalation") {
    hardBlockChecks.push(buildCheck({
      checkId: "hard-block:sandbox-escalation",
      checkType: "sandbox-decision",
      status: "requires-escalation",
      reason: normalizedSandboxDecision.summary ?? "Sandbox decision requires escalation.",
      action: "request-approval",
    }));
  }

  const limitChecks = buildLimitChecks(normalizedAgentGovernancePolicy, normalizedTaskContext);
  const costChecks = buildCostChecks(normalizedAgentGovernancePolicy, normalizedBudgetDecision, normalizedTaskContext);
  const providerSideEffectChecks = classifyProviderSideEffects({
    providerOperations: normalizedTaskContext.providerOperations,
    allowedTools: normalizedAgentGovernancePolicy.allowedTools,
    circuitBreakerDecision,
    killSwitchDecision,
    sandboxDecision: normalizedSandboxDecision,
    escalationRules: normalizedAgentGovernancePolicy.escalationRules,
  });

  const allChecks = [...hardBlockChecks, ...providerSideEffectChecks, ...costChecks, ...limitChecks];
  const finalDecision = finalDecisionFromChecks(allChecks.map((check) => check.status));
  const sortedChecks = [...allChecks].sort((left, right) => statusPriority(right.status) - statusPriority(left.status));
  const primaryCheck = sortedChecks[0] ?? null;

  const blockedActions = uniqueActionsFromChecks(allChecks.filter((check) => check.status === "blocked"));
  const escalationActions = uniqueActionsFromChecks(allChecks.filter((check) => check.status === "requires-escalation"));
  const allowedActions = uniqueActionsFromChecks(allChecks.filter((check) => check.status === "pass"));
  const alternatives = uniqueAlternatives([
    ...normalizeArray(normalizedSandboxDecision.alternatives),
    ...blockedActions.includes("split-run") || escalationActions.includes("split-run") ? ["split-run"] : [],
    ...blockedActions.includes("reduce-write-targets") || escalationActions.includes("reduce-write-targets") ? ["reduce-write-targets"] : [],
    ...blockedActions.includes("manual-execution") ? ["manual-execution"] : [],
    ...escalationActions.includes("request-approval") ? ["request-approval"] : [],
    ...providerSideEffectChecks.some((check) => check.status !== "pass") ? ["lower-impact-operation"] : [],
  ]);

  return {
    agentLimitDecision: {
      agentLimitDecisionId: `agent-limit-decision:${normalizedAgentGovernancePolicy.agentType ?? "unknown-agent"}:${normalizedTaskContext.taskType}:${normalizedTaskContext.scopeId ?? "unknown-scope"}`,
      decision: finalDecision,
      allowed: finalDecision === "allowed",
      requiresEscalation: finalDecision === "requires-escalation",
      blockedActions,
      allowedActions,
      limitChecks,
      costChecks,
      providerSideEffectChecks,
      escalationHint:
        finalDecision === "allowed"
          ? null
          : {
              reason: primaryCheck?.reason ?? null,
              requiredAction:
                finalDecision === "requires-escalation"
                  ? primaryCheck?.action ?? "request-approval"
                  : blockedActions.includes("manual-execution")
                    ? "manual-execution"
                    : primaryCheck?.action ?? null,
            },
      alternatives,
      reason: primaryCheck?.reason ?? null,
      summary:
        finalDecision === "allowed"
          ? `Agent limits allow ${normalizedTaskContext.taskType} execution with ${allowedActions.length} passing checks.`
          : finalDecision === "requires-escalation"
            ? `Agent limits require escalation for ${normalizedTaskContext.taskType} because ${primaryCheck?.reason ?? "one or more checks require approval"}.`
            : `Agent limits block ${normalizedTaskContext.taskType} because ${primaryCheck?.reason ?? "a hard block was triggered"}.`,
    },
  };
}

function uniqueActionsFromChecks(checks = []) {
  return [...new Set(checks.map((check) => check.action).filter(Boolean))];
}

function uniqueAlternatives(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}
