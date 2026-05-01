function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(messagingFramework, activationGoals) {
  const missingInputs = [];

  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }

  if (!activationGoals || normalizeString(activationGoals.status) !== "ready") {
    missingInputs.push("activationGoals");
  }

  return missingInputs;
}

function buildCta({ ctaId, label, targetGoalId, priority, reason, audienceLabel }) {
  return {
    ctaId,
    label,
    targetGoalId,
    priority,
    audienceLabel,
    reason,
  };
}

function pickPrimaryGoal(goals) {
  return [...goals].sort((left, right) => (left.priority ?? 99) - (right.priority ?? 99))[0] ?? null;
}

function buildPrimaryCta(goal, audience, messagingFramework) {
  const proofReason = messagingFramework?.ctaAngles?.[0]?.reason ?? messagingFramework?.headline ?? null;

  if (!goal) {
    return null;
  }

  if (goal.goalType === "request-access") {
    return buildCta({
      ctaId: "cta:request-access",
      label: "Request access",
      targetGoalId: goal.goalId,
      priority: 1,
      audienceLabel: audience,
      reason: "Controlled access is the cleanest entry step for a governed multi-agent product.",
    });
  }

  if (goal.goalType === "complete-onboarding") {
    return buildCta({
      ctaId: "cta:join-waitlist",
      label: "Join waitlist",
      targetGoalId: goal.goalId,
      priority: 1,
      audienceLabel: audience,
      reason: "Waitlist capture is the lowest-friction bridge into onboarding completion.",
    });
  }

  return buildCta({
    ctaId: "cta:start-project",
    label: "Start project",
    targetGoalId: goal.goalId,
    priority: 1,
    audienceLabel: audience,
    reason: proofReason,
  });
}

function buildSecondaryCtas(goals, audience, analyticsSummary) {
  const hasProjectMomentum = (analyticsSummary?.totalProjectsCreated ?? 0) > 0;
  const secondary = [];

  if (goals.some((goal) => goal.goalType === "request-access")) {
    secondary.push(buildCta({
      ctaId: "cta:join-waitlist",
      label: "Join waitlist",
      targetGoalId: goals.find((goal) => goal.goalType === "request-access")?.goalId ?? null,
      priority: 2,
      audienceLabel: audience,
      reason: "Waitlist is the fallback path when full access is not immediate.",
    }));
  }

  secondary.push(buildCta({
    ctaId: "cta:book-demo",
    label: "Book demo",
    targetGoalId: goals.find((goal) => goal.goalType === "reach-first-value")?.goalId ?? null,
    priority: hasProjectMomentum ? 3 : 4,
    audienceLabel: audience,
    reason: hasProjectMomentum
      ? "Existing activation evidence supports a proof-oriented demo CTA."
      : "Demo remains the lowest-risk proof CTA for high-intent visitors.",
  }));

  return secondary;
}

export function createProductCtaStrategy({
  messagingFramework = null,
  activationGoals = null,
  analyticsSummary = null,
} = {}) {
  const normalizedMessagingFramework = normalizeObject(messagingFramework);
  const normalizedActivationGoals = normalizeObject(activationGoals);
  const normalizedAnalyticsSummary = normalizeObject(analyticsSummary);
  const missingInputs = buildMissingInputs(normalizedMessagingFramework, normalizedActivationGoals);

  if (missingInputs.length > 0) {
    return {
      productCtaStrategy: {
        productCtaStrategyId: `product-cta-strategy:${slugify(normalizedMessagingFramework?.messagingFrameworkId)}`,
        status: "missing-inputs",
        missingInputs,
        primaryCta: null,
        secondaryCtas: [],
        activationGoalOrder: [],
      },
    };
  }

  const audience = normalizeString(normalizedMessagingFramework.audience);
  const goals = Array.isArray(normalizedActivationGoals.goals) ? normalizedActivationGoals.goals : [];
  const primaryGoal = pickPrimaryGoal(goals);

  return {
    productCtaStrategy: {
      productCtaStrategyId: `product-cta-strategy:${slugify(normalizedMessagingFramework.messagingFrameworkId)}`,
      status: "ready",
      missingInputs: [],
      primaryCta: buildPrimaryCta(primaryGoal, audience, normalizedMessagingFramework),
      secondaryCtas: buildSecondaryCtas(goals, audience, normalizedAnalyticsSummary),
      activationGoalOrder: goals
        .slice()
        .sort((left, right) => (left.priority ?? 99) - (right.priority ?? 99))
        .map((goal) => goal.goalId),
    },
  };
}
