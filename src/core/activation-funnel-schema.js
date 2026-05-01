function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(websiteConversionFlow, onboardingFlow) {
  const missingInputs = [];
  if (!websiteConversionFlow || normalizeString(websiteConversionFlow.status) !== "ready") {
    missingInputs.push("websiteConversionFlow");
  }
  if (!onboardingFlow || normalizeString(onboardingFlow.status) === null) {
    missingInputs.push("onboardingFlow");
  }
  return missingInputs;
}

export function defineActivationFunnelSchema({
  websiteConversionFlow = null,
  onboardingFlow = null,
} = {}) {
  const normalizedFlow = normalizeObject(websiteConversionFlow);
  const normalizedOnboarding = normalizeObject(onboardingFlow);
  const missingInputs = buildMissingInputs(normalizedFlow, normalizedOnboarding);

  if (missingInputs.length > 0) {
    return {
      activationFunnel: {
        activationFunnelId: `activation-funnel:${slugify(normalizedFlow?.websiteConversionFlowId)}`,
        status: "missing-inputs",
        missingInputs,
        stages: [],
      },
    };
  }

  const stages = [
    { stageId: "signup", entryTrigger: normalizedFlow.entryRoute ?? "signup", successEvent: "user-authenticated" },
    { stageId: "onboarding", entryTrigger: normalizedOnboarding.activeScreen ?? "onboarding", successEvent: "onboarding-complete" },
    { stageId: "first-project", entryTrigger: "create-first-project", successEvent: "project-created" },
    { stageId: "first-value", entryTrigger: "complete-first-execution", successEvent: "first-visible-result" },
  ];

  return {
    activationFunnel: {
      activationFunnelId: `activation-funnel:${slugify(normalizedFlow.websiteConversionFlowId)}`,
      status: "ready",
      missingInputs: [],
      stages,
      currentStage: stages[1].stageId,
    },
  };
}
