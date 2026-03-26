function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

const TASK_TYPE_POLICIES = {
  mobile: { maxAttempts: 1, baseDelayMs: 30000, strategy: "manual-review" },
  release: { maxAttempts: 1, baseDelayMs: 30000, strategy: "manual-review" },
  frontend: { maxAttempts: 2, baseDelayMs: 5000, strategy: "exponential-backoff" },
  backend: { maxAttempts: 2, baseDelayMs: 5000, strategy: "exponential-backoff" },
  growth: { maxAttempts: 1, baseDelayMs: 10000, strategy: "linear-backoff" },
  generic: { maxAttempts: 1, baseDelayMs: 10000, strategy: "linear-backoff" },
};

function resolveTaskPolicy(taskType) {
  return TASK_TYPE_POLICIES[taskType] ?? TASK_TYPE_POLICIES.generic;
}

function buildRetryWindow(strategy, baseDelayMs, maxAttempts) {
  const delays = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (strategy === "exponential-backoff") {
      delays.push(baseDelayMs * (2 ** (attempt - 1)));
      continue;
    }

    delays.push(baseDelayMs * attempt);
  }

  return delays;
}

export function createRetryPolicyResolver({
  failureRecoveryModel = null,
  taskType = "generic",
} = {}) {
  const normalizedFailureRecoveryModel = normalizeObject(failureRecoveryModel);
  const normalizedTaskType = typeof taskType === "string" ? taskType : "generic";
  const taskPolicy = resolveTaskPolicy(normalizedTaskType);

  const canRetry = normalizedFailureRecoveryModel.retryability === "retryable";
  const strategy = canRetry ? taskPolicy.strategy : "no-retry";
  const maxAttempts = canRetry ? taskPolicy.maxAttempts : 0;
  const retryDelaysMs = canRetry
    ? buildRetryWindow(strategy, taskPolicy.baseDelayMs, maxAttempts)
    : [];

  return {
    retryPolicy: {
      retryPolicyId: `retry-policy:${normalizedFailureRecoveryModel.recoveryId ?? "unknown"}`,
      taskType: normalizedTaskType,
      shouldRetry: canRetry,
      maxAttempts,
      strategy,
      retryDelaysMs,
      escalationMode:
        normalizedFailureRecoveryModel.retryability === "manual-only"
          ? "user-decision"
          : canRetry
            ? "after-retries-exhausted"
            : "none",
      schedulerHint: {
        queue: canRetry ? "retry-queue" : null,
        priority: normalizedTaskType === "release" || normalizedTaskType === "mobile" ? "high" : "normal",
        backoffStrategy: strategy,
      },
      summary: {
        totalRetryWindowMs: retryDelaysMs.reduce((sum, delay) => sum + delay, 0),
        requiresScheduler: canRetry,
        requiresUserDecision: normalizedFailureRecoveryModel.retryability === "manual-only",
      },
    },
  };
}
