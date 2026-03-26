function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function classifyFailure(item) {
  const text = String(item ?? "").toLowerCase();

  if (text.includes("approval") || text.includes("consent")) {
    return "approval";
  }

  if (text.includes("metadata") || text.includes("listing")) {
    return "metadata";
  }

  if (text.includes("build") || text.includes("artifact") || text.includes("bundle")) {
    return "artifact";
  }

  if (text.includes("policy") || text.includes("reject")) {
    return "policy";
  }

  return "generic";
}

function humanizeBlockerType(blockerType) {
  switch (blockerType) {
    case "approval-blocker":
      return "Approval";
    case "release-blocker":
      return "Release";
    case "policy-blocker":
      return "Policy";
    case "credential-blocker":
      return "Credential";
    case "failed-task":
      return "Execution";
    default:
      return "Generic";
  }
}

function buildFollowUpTask(reason, index, bottleneckTitle) {
  const category = classifyFailure(reason);
  return {
    id: `release-follow-up-${category}-${index + 1}`,
    summary: `Resolve ${category} release blocker`,
    details: reason,
    lane: category === "approval" ? "product" : "dev",
    blockedBy: bottleneckTitle ? [bottleneckTitle] : [],
  };
}

export function createRejectionAndFailureMapper({
  providerErrors = [],
  reviewFeedback = [],
  bottleneck = null,
  activeBottleneck = null,
  unblockPlan = null,
  taskResults = [],
} = {}) {
  const normalizedBottleneck = normalizeObject(bottleneck);
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);
  const normalizedUnblockPlan = normalizeObject(unblockPlan);
  const providerItems = toArray(providerErrors);
  const reviewItems = toArray(reviewFeedback);
  const failedTaskReasons = toArray(taskResults)
    .filter((result) => result?.status === "failed")
    .map((result) => result?.reason ?? result?.output ?? "task failure");
  const issues = [...providerItems, ...reviewItems, ...failedTaskReasons];
  const activeBottleneckTitle = normalizedActiveBottleneck.blockerType
    ? humanizeBlockerType(normalizedActiveBottleneck.blockerType)
    : null;
  const bottleneckTitle = activeBottleneckTitle
    ?? normalizedBottleneck.title
    ?? null;
  const unblockActions = toArray(normalizedUnblockPlan.nextActions);
  const blockerAlignedFollowUpTasks = unblockActions.map((action, index) => ({
    id: `blocker-follow-up-${index + 1}`,
    summary: action.label ?? `Resolve ${humanizeBlockerType(normalizedActiveBottleneck.blockerType).toLowerCase()} blocker`,
    details: action.actionType ?? normalizedActiveBottleneck.reason ?? "follow-up required",
    lane: action.actionType === "approval" ? "product" : "dev",
    blockedBy: bottleneckTitle ? [bottleneckTitle] : [],
  }));
  const followUpTasks = blockerAlignedFollowUpTasks.length > 0
    ? blockerAlignedFollowUpTasks
    : issues.map((issue, index) => buildFollowUpTask(issue, index, bottleneckTitle));
  const categories = [
    ...new Set([
      ...(normalizedActiveBottleneck.blockerType ? [classifyFailure(normalizedActiveBottleneck.blockerType)] : []),
      ...issues.map((issue) => classifyFailure(issue)),
    ]),
  ];

  return {
    failureSummary: {
      status: issues.length > 0 || normalizedActiveBottleneck.summary?.isBlocking === true ? "blocked" : "clear",
      issueCount: issues.length,
      categories,
      primaryReason: normalizedActiveBottleneck.reason ?? issues[0] ?? null,
      bottleneck: bottleneckTitle,
    },
    followUpTasks,
  };
}
