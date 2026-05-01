function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(postLoginDestination, activationFunnel) {
  const missingInputs = [];

  if (!postLoginDestination || normalizeString(postLoginDestination.status) !== "ready") {
    missingInputs.push("postLoginDestination");
  }

  if (!activationFunnel || normalizeString(activationFunnel.status) !== "ready") {
    missingInputs.push("activationFunnel");
  }

  return missingInputs;
}

export function createFirstProjectKickoffFlow({
  postLoginDestination = null,
  activationFunnel = null,
  onboardingSession = null,
} = {}) {
  const normalizedDestination = normalizeObject(postLoginDestination);
  const normalizedActivationFunnel = normalizeObject(activationFunnel);
  const normalizedOnboardingSession = normalizeObject(onboardingSession);
  const missingInputs = buildMissingInputs(normalizedDestination, normalizedActivationFunnel);

  if (missingInputs.length > 0) {
    return {
      firstProjectKickoff: {
        firstProjectKickoffId: `first-project-kickoff:${slugify(normalizedDestination?.postLoginDestinationId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  if (normalizeString(normalizedDestination.destination) !== "first-project-kickoff") {
    return {
      firstProjectKickoff: {
        firstProjectKickoffId: `first-project-kickoff:${slugify(normalizedDestination.postLoginDestinationId)}`,
        status: "not-required",
        missingInputs: [],
        kickoffStage: "not-applicable",
        destinationRoute: null,
        nextActionLabel: null,
      },
    };
  }

  const onboardingStep = normalizeString(normalizedOnboardingSession?.currentStep) ?? "capture-vision";
  const kickoffStage = normalizeString(normalizedOnboardingSession?.status) === "in-progress" ? "resume" : "start";

  return {
    firstProjectKickoff: {
      firstProjectKickoffId: `first-project-kickoff:${slugify(normalizedDestination.postLoginDestinationId)}`,
      status: "ready",
      missingInputs: [],
      kickoffStage,
      onboardingSessionId: normalizeString(normalizedOnboardingSession?.sessionId),
      onboardingStep,
      destinationRoute: "/app/new-project",
      nextActionLabel: kickoffStage === "resume" ? "Resume onboarding" : "Create first project",
      milestoneTarget: normalizeString(normalizedActivationFunnel?.stages?.[1]?.stageId) ?? "activation-stage:first-project",
    },
  };
}
