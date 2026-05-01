function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(nexusPositioning) {
  const missingInputs = [];

  if (!nexusPositioning || normalizeString(nexusPositioning.status) !== "ready") {
    missingInputs.push("nexusPositioning");
  }

  return missingInputs;
}

function buildGoal(goalType, audience, meta = {}) {
  const suffix = audience ? `:${slugify(audience)}` : "";

  return {
    goalId: `activation-goal:${goalType}${suffix}`,
    goalType,
    entryTrigger: meta.entryTrigger,
    successEvent: meta.successEvent,
    priority: meta.priority,
    status: meta.status,
    rationale: meta.rationale,
  };
}

export function deriveActivationGoals({
  nexusPositioning = null,
  onboardingCompletionDecision = null,
  projectCreationSummary = null,
} = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const normalizedOnboarding = normalizeObject(onboardingCompletionDecision);
  const normalizedCreation = normalizeObject(projectCreationSummary);
  const missingInputs = buildMissingInputs(normalizedPositioning);
  const audience = normalizeString(normalizedPositioning?.audience);

  if (missingInputs.length > 0) {
    return {
      activationGoals: {
        activationGoalsId: `activation-goals:${slugify(normalizedPositioning?.nexusPositioningId)}`,
        status: "missing-inputs",
        missingInputs,
        goals: [],
      },
    };
  }

  const totalProjectsCreated = normalizeFiniteNumber(normalizedCreation?.totalProjectsCreated) ?? 0;
  const onboardingComplete = normalizedOnboarding?.isComplete === true;
  const onboardingBlocked = normalizedOnboarding?.requiresClarification === true;

  const goals = [];

  goals.push(buildGoal("request-access", audience, {
    entryTrigger: "visitor-arrives",
    successEvent: "account-created",
    priority: totalProjectsCreated > 0 ? 4 : 1,
    status: totalProjectsCreated > 0 ? "secondary" : "primary",
    rationale: "Access is the first controlled conversion step for Nexus.",
  }));

  goals.push(buildGoal("complete-onboarding", audience, {
    entryTrigger: totalProjectsCreated > 0 ? "project-created" : "access-approved",
    successEvent: "onboarding-complete",
    priority: onboardingComplete ? 3 : 1,
    status: onboardingComplete ? "achieved" : onboardingBlocked ? "active" : "active",
    rationale: onboardingComplete
      ? "Onboarding completion criteria are already satisfied."
      : "Onboarding state determines whether the user can reach first managed value.",
  }));

  goals.push(buildGoal("start-first-project", audience, {
    entryTrigger: onboardingComplete ? "onboarding-complete" : "project-created",
    successEvent: "first-project-created",
    priority: totalProjectsCreated > 0 ? 1 : 2,
    status: totalProjectsCreated > 0 ? "active" : onboardingComplete ? "active" : "queued",
    rationale: totalProjectsCreated > 0
      ? "Project creation has already happened, so the product can push straight into execution."
      : "First project creation is the activation hinge after onboarding.",
  }));

  goals.push(buildGoal("reach-first-value", audience, {
    entryTrigger: totalProjectsCreated > 0 ? "project-created" : "onboarding-complete",
    successEvent: "first-value-reached",
    priority: totalProjectsCreated > 0 ? 2 : 3,
    status: totalProjectsCreated > 0 ? "active" : "queued",
    rationale: "The CTA strategy should keep one path oriented toward immediate proof of value.",
  }));

  return {
    activationGoals: {
      activationGoalsId: `activation-goals:${slugify(normalizedPositioning?.nexusPositioningId)}`,
      status: "ready",
      missingInputs: [],
      goals,
    },
  };
}
