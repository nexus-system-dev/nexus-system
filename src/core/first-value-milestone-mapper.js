function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(activationFunnel) {
  const missingInputs = [];
  if (!activationFunnel || normalizeString(activationFunnel.status) !== "ready") {
    missingInputs.push("activationFunnel");
  }
  return missingInputs;
}

export function createFirstValueMilestoneMapper({
  activationFunnel = null,
  projectJourneys = null,
  firstValueSummary = null,
} = {}) {
  const normalizedFunnel = normalizeObject(activationFunnel);
  const normalizedJourneys = Array.isArray(projectJourneys?.flows) ? projectJourneys.flows : [];
  const normalizedSummary = normalizeObject(firstValueSummary);
  const missingInputs = buildMissingInputs(normalizedFunnel);

  if (missingInputs.length > 0) {
    return {
      activationMilestones: {
        activationMilestonesId: `activation-milestones:${slugify(normalizedFunnel?.activationFunnelId)}`,
        status: "missing-inputs",
        missingInputs,
        milestones: [],
      },
    };
  }

  const milestones = [
    "signup",
    "onboarding-complete",
    "first-project",
    "first-task",
    "first-execution",
    "first-visible-result",
  ].map((milestone, index) => ({
    milestoneId: `milestone:${milestone}`,
    milestone,
    order: index + 1,
    reached: milestone === "first-visible-result"
      ? normalizedSummary?.summary?.hasVisibleOutcome === true
      : true,
  }));

  return {
    activationMilestones: {
      activationMilestonesId: `activation-milestones:${slugify(normalizedFunnel.activationFunnelId)}`,
      status: "ready",
      missingInputs: [],
      milestones,
      supportingJourneys: normalizedJourneys.map((flow) => flow.flowId ?? flow.id ?? "unknown"),
    },
  };
}
