function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

const providerDefinitions = [
  {
    providerId: "openai",
    companyLabel: "OpenAI",
    runtimeLabel: "OpenAI onboarding runtime",
    voiceLabel: "structured-operator",
    modelFamily: "provider-backed",
  },
  {
    providerId: "anthropic",
    companyLabel: "Anthropic",
    runtimeLabel: "Anthropic onboarding runtime",
    voiceLabel: "careful-analyst",
    modelFamily: "provider-backed",
  },
];

export function listOnboardingAgentProviders() {
  return providerDefinitions.map((provider) => ({
    providerId: provider.providerId,
    companyLabel: provider.companyLabel,
    runtimeLabel: provider.runtimeLabel,
    voiceLabel: provider.voiceLabel,
    modelFamily: provider.modelFamily,
  }));
}

export function resolveOnboardingAgentProvider(providerId = "") {
  const normalizedProviderId = normalizeString(providerId, "openai").toLowerCase();
  return listOnboardingAgentProviders().find((provider) => provider.providerId === normalizedProviderId)
    ?? listOnboardingAgentProviders()[0];
}

export function createOnboardingProviderRuntime({
  selectedProviderId = "openai",
  sessionId = null,
  currentQuestionPath = [],
  learningStatus = "partial",
} = {}) {
  const selectedProvider = resolveOnboardingAgentProvider(selectedProviderId);
  const availableProviders = listOnboardingAgentProviders();
  return {
    runtimeId: `onboarding-provider-runtime:${selectedProvider.providerId}`,
    runtimeMode: "provider-backed",
    canonicalRuleLayer: "nexus-onboarding-rules-v1",
    selectedProviderId: selectedProvider.providerId,
    selectedProviderLabel: selectedProvider.companyLabel,
    selectedRuntimeLabel: selectedProvider.runtimeLabel,
    selectedVoiceLabel: selectedProvider.voiceLabel,
    availableProviders,
    sessionId: normalizeString(sessionId, null),
    learningStatus: normalizeString(learningStatus, "partial"),
    currentQuestionPath: normalizeArray(currentQuestionPath),
    summaryLine: `${selectedProvider.companyLabel} פעיל עכשיו, אבל עדיין כפוף לכללי ה־intake הקנוניים של Nexus.`,
    enforcementLine: "בחירת provider לא מבטלת class gates, clarification pressure, readiness gates או bounded handoff.",
  };
}

export function decorateProviderBackedAiEntry(entry = {}, providerRuntime = null) {
  const provider = providerRuntime ?? createOnboardingProviderRuntime();
  return {
    ...entry,
    providerId: provider.selectedProviderId,
    providerLabel: provider.selectedProviderLabel,
    runtimeLabel: provider.selectedRuntimeLabel,
  };
}
