// Task #171 — Create retention and re-engagement planner
// Builds a retention lifecycle plan from retention summary and activation drop-offs.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildCohortSegment(retentionSummary) {
  const summary = normalizeObject(retentionSummary);
  const total = normalizeFiniteNumber(summary.totalReturningUsers) + normalizeFiniteNumber(summary.totalNonReturningUsers);
  const returning = normalizeFiniteNumber(summary.totalReturningUsers);
  const retentionRate = total > 0 ? Math.round((returning / total) * 100) : 0;

  return {
    totalUsers: total,
    returningUsers: returning,
    nonReturningUsers: normalizeFiniteNumber(summary.totalNonReturningUsers),
    retentionRate,
    repeatUsageCount: normalizeFiniteNumber(summary.repeatUsageCount),
  };
}

function buildReactivationTactics(dropOffs) {
  const tactics = [];
  for (const dropOff of dropOffs) {
    const d = normalizeObject(dropOff);
    const milestone = normalizeString(d.milestone) ?? "unknown-milestone";
    const dropRate = normalizeFiniteNumber(d.dropRate);
    if (dropRate > 0.5) {
      tactics.push({ milestone, priority: "high", action: "targeted-reactivation-campaign" });
    } else if (dropRate > 0.2) {
      tactics.push({ milestone, priority: "medium", action: "nudge-reminder" });
    } else {
      tactics.push({ milestone, priority: "low", action: "passive-monitoring" });
    }
  }
  return tactics;
}

export function createRetentionAndReengagementPlanner({
  retentionSummary = null,
  activationDropOffs = null,
} = {}) {
  const summary = normalizeObject(retentionSummary);
  const dropOffs = normalizeArray(activationDropOffs);

  const cohortSegment = buildCohortSegment(summary);
  const reactivationTactics = buildReactivationTactics(dropOffs);

  const planId = `retention-plan:${Date.now()}`;
  const planStatus = cohortSegment.retentionRate >= 50 ? "healthy" : "needs-intervention";

  return {
    retentionLifecyclePlan: {
      planId,
      planStatus,
      cohortSegment,
      reactivationTactics,
      milestoneCount: dropOffs.length,
      meta: {
        hasDropOffData: dropOffs.length > 0,
        hasRetentionSummary: Object.keys(summary).length > 0,
        highPriorityTacticCount: reactivationTactics.filter((t) => t.priority === "high").length,
      },
    },
  };
}
