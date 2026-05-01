function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(activationFunnel, messagingFramework) {
  const missingInputs = [];
  if (!activationFunnel || normalizeString(activationFunnel.status) !== "ready") {
    missingInputs.push("activationFunnel");
  }
  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }
  return missingInputs;
}

export function createOnboardingMarketingCopyFlow({
  activationFunnel = null,
  messagingFramework = null,
} = {}) {
  const normalizedFunnel = normalizeObject(activationFunnel);
  const normalizedFramework = normalizeObject(messagingFramework);
  const missingInputs = buildMissingInputs(normalizedFunnel, normalizedFramework);

  if (missingInputs.length > 0) {
    return {
      onboardingMarketingFlow: {
        onboardingMarketingFlowId: `onboarding-marketing:${slugify(normalizedFunnel?.activationFunnelId)}`,
        status: "missing-inputs",
        missingInputs,
        touchpoints: [],
      },
    };
  }

  return {
    onboardingMarketingFlow: {
      onboardingMarketingFlowId: `onboarding-marketing:${slugify(normalizedFunnel.activationFunnelId)}`,
      status: "ready",
      missingInputs: [],
      touchpoints: [
        { touchpointId: "signup-confirmation", channel: "in-app", message: normalizedFramework.headline },
        { touchpointId: "welcome", channel: "email", message: normalizedFramework.subheadline },
        { touchpointId: "activation-prompt", channel: "in-app", message: normalizedFramework.valueProps?.[0]?.label ?? normalizedFramework.headline },
      ],
    },
  };
}
