function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function scoreSeverity(severity) {
  if (severity === "high") {
    return 40;
  }

  if (severity === "medium") {
    return 25;
  }

  return 10;
}

function scoreFlowImpact(affectedFlow) {
  if (["release", "approval", "policy"].includes(affectedFlow)) {
    return 20;
  }

  if (["execution", "runtime", "credentials"].includes(affectedFlow)) {
    return 15;
  }

  return 5;
}

function scoreCriticalPath(criticalPath, activeBottleneck) {
  const normalizedCriticalPath = normalizeObject(criticalPath);
  const blockers = normalizeArray(normalizedCriticalPath.blockers);

  if (normalizedCriticalPath.isBlocked === true) {
    return 20;
  }

  if (blockers.includes(activeBottleneck.bottleneckId) || blockers.includes(activeBottleneck.blockerType)) {
    return 15;
  }

  return 5;
}

function inferUserValueImpact(activeBottleneck) {
  if (["approval-blocker", "release-blocker"].includes(activeBottleneck.blockerType)) {
    return "high";
  }

  if (["failed-task", "policy-blocker", "credential-blocker"].includes(activeBottleneck.blockerType)) {
    return "medium";
  }

  return "low";
}

function inferTimeLoss(activeBottleneck) {
  if (["approval-blocker", "release-blocker"].includes(activeBottleneck.blockerType)) {
    return "high";
  }

  if (["graph-blocker", "failed-task"].includes(activeBottleneck.blockerType)) {
    return "medium";
  }

  return "low";
}

export function createBottleneckPriorityScorer({
  activeBottleneck = null,
  criticalPath = null,
} = {}) {
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);
  const normalizedCriticalPath = normalizeObject(criticalPath);

  const progressImpactScore = scoreSeverity(normalizedActiveBottleneck.severity);
  const deliveryRiskScore = scoreFlowImpact(normalizedActiveBottleneck.affectedFlow);
  const criticalPathScore = scoreCriticalPath(normalizedCriticalPath, normalizedActiveBottleneck);
  const totalScore = progressImpactScore + deliveryRiskScore + criticalPathScore;

  return {
    scoredBottleneck: {
      scoredBottleneckId: `scored-bottleneck:${normalizedActiveBottleneck.bottleneckId ?? "unknown"}`,
      bottleneckId: normalizedActiveBottleneck.bottleneckId ?? null,
      blockerType: normalizedActiveBottleneck.blockerType ?? "none",
      priorityScore: totalScore,
      scoreBreakdown: {
        progressImpact: progressImpactScore,
        deliveryRisk: deliveryRiskScore,
        criticalPathImpact: criticalPathScore,
      },
      userValueImpact: inferUserValueImpact(normalizedActiveBottleneck),
      timeLoss: inferTimeLoss(normalizedActiveBottleneck),
      summary: {
        priorityBand: totalScore >= 70 ? "critical" : totalScore >= 45 ? "high" : totalScore >= 25 ? "medium" : "low",
        onCriticalPath: normalizedCriticalPath.isBlocked === true || criticalPathScore >= 15,
      },
    },
  };
}
