function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function classifyProviderSideEffects({
  providerOperations = [],
  allowedTools = [],
  circuitBreakerDecision = null,
  killSwitchDecision = null,
  sandboxDecision = null,
  escalationRules = null,
} = {}) {
  const normalizedProviderOperations = normalizeArray(providerOperations);
  const normalizedAllowedTools = normalizeArray(allowedTools);
  const checks = [];

  for (const operationType of normalizedProviderOperations) {
    let status = "pass";
    let reason = `Provider operation ${operationType} is permitted under current policy.`;
    let requiredAction = null;

    if (killSwitchDecision?.isActive === true && Array.isArray(killSwitchDecision.killedPaths) && killSwitchDecision.killedPaths.includes("provider-execution")) {
      status = "blocked";
      reason = "Provider execution is blocked by active kill switch.";
    } else if (circuitBreakerDecision?.decision === "fail-fast") {
      status = "blocked";
      reason = "Provider circuit breaker is open and provider side effects must fail fast.";
    } else if (circuitBreakerDecision?.decision === "allow-retry") {
      status = "requires-escalation";
      reason = "Provider circuit breaker is half-open, so side effects require escalation before retrying.";
      requiredAction = "request-approval";
    } else if (["deploy", "credentialed-api-mutation", "billing-affecting-operation"].includes(operationType)) {
      if (!normalizedAllowedTools.includes("deploy-artifact") && operationType === "deploy") {
        status = "blocked";
        reason = "Deploy side effects are not allowed by the current agent policy.";
      } else if (sandboxDecision?.decision !== "allowed") {
        status = "blocked";
        reason = "Execution boundary does not permit privileged provider side effects.";
      } else {
        status = escalationRules?.onPrivilegedAction === "block" ? "blocked" : "requires-escalation";
        reason =
          status === "blocked"
            ? `Provider side effect ${operationType} is blocked by privileged action policy.`
            : `Provider side effect ${operationType} requires approval under privileged action policy.`;
        requiredAction = status === "requires-escalation" ? "request-approval" : null;
      }
    } else if (operationType === "send-notification" || operationType === "external-write") {
      if (sandboxDecision?.decision === "blocked") {
        status = "blocked";
        reason = "Execution boundary blocks side-effecting provider operations.";
      } else if (sandboxDecision?.decision === "requires-escalation") {
        status = "requires-escalation";
        reason = "Execution boundary requires escalation before side-effecting provider operations.";
        requiredAction = "request-approval";
      }
    }

    checks.push({
      checkId: `provider-side-effect:${operationType}`,
      operationType,
      status,
      reason,
      requiredAction,
    });
  }

  return checks;
}
