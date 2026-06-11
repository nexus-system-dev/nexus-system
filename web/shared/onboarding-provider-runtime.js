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
    runtimeLabel: "OpenAI",
    voiceLabel: "structured-operator",
    modelFamily: "provider-backed",
    availableModelFamilies: [
      {
        modelFamilyId: "fast",
        modelLabel: "מהיר",
        runtimeModelId: "gpt-5-mini",
        tradeoffLabel: "תגובה מהירה יותר, פחות עומק בכל סבב",
      },
      {
        modelFamilyId: "balanced",
        modelLabel: "מאוזן",
        runtimeModelId: "gpt-5",
        tradeoffLabel: "ברירת מחדל מאוזנת",
      },
      {
        modelFamilyId: "deep",
        modelLabel: "עמוק",
        runtimeModelId: "gpt-5.5",
        tradeoffLabel: "יותר עומק ודיוק על חשבון מהירות",
      },
    ],
  },
  {
    providerId: "anthropic",
    companyLabel: "Anthropic",
    runtimeLabel: "Anthropic",
    voiceLabel: "careful-analyst",
    modelFamily: "provider-backed",
    availableModelFamilies: [
      {
        modelFamilyId: "fast",
        modelLabel: "מהיר",
        runtimeModelId: "claude-3-5-haiku-latest",
        tradeoffLabel: "מהיר וקליל יותר לסבבים קצרים",
      },
      {
        modelFamilyId: "balanced",
        modelLabel: "מאוזן",
        runtimeModelId: "claude-3-5-sonnet-latest",
        tradeoffLabel: "ברירת מחדל מאוזנת",
      },
      {
        modelFamilyId: "deep",
        modelLabel: "עמוק",
        runtimeModelId: "claude-3-7-sonnet-latest",
        tradeoffLabel: "יותר עומק ודיוק על חשבון מהירות",
      },
    ],
  },
];

const intelligenceDefinitions = [
  {
    intelligenceLevelId: "low",
    intelligenceLabel: "נמוכה",
    tradeoffLabel: "פחות חפירה, יותר ישיר",
  },
  {
    intelligenceLevelId: "medium",
    intelligenceLabel: "בינונית",
    tradeoffLabel: "איזון בין מהירות לעומק",
  },
  {
    intelligenceLevelId: "high",
    intelligenceLabel: "גבוהה",
    tradeoffLabel: "יותר חידוד ויותר בדיקת כיוונים",
  },
];

export function listOnboardingAgentProviders() {
  return providerDefinitions.map((provider) => ({
    providerId: provider.providerId,
    companyLabel: provider.companyLabel,
    runtimeLabel: provider.runtimeLabel,
    voiceLabel: provider.voiceLabel,
    modelFamily: provider.modelFamily,
    availableModelFamilies: normalizeArray(provider.availableModelFamilies),
  }));
}

export function resolveOnboardingAgentProvider(providerId = "") {
  const normalizedProviderId = normalizeString(providerId, "openai").toLowerCase();
  return listOnboardingAgentProviders().find((provider) => provider.providerId === normalizedProviderId)
    ?? listOnboardingAgentProviders()[0];
}

export function listOnboardingModelFamilies(providerId = "openai") {
  const provider = resolveOnboardingAgentProvider(providerId);
  return normalizeArray(provider.availableModelFamilies).map((family) => ({
    modelFamilyId: family.modelFamilyId,
    modelLabel: family.modelLabel,
    runtimeModelId: family.runtimeModelId,
    tradeoffLabel: family.tradeoffLabel,
  }));
}

export function resolveOnboardingModelFamily(providerId = "openai", modelFamilyId = "fast") {
  const normalizedModelFamilyId = normalizeString(modelFamilyId, "fast").toLowerCase();
  return listOnboardingModelFamilies(providerId).find((family) => family.modelFamilyId === normalizedModelFamilyId)
    ?? listOnboardingModelFamilies(providerId)[0]
    ?? listOnboardingModelFamilies(providerId)[0];
}

export function listOnboardingIntelligenceLevels() {
  return intelligenceDefinitions.map((level) => ({
    intelligenceLevelId: level.intelligenceLevelId,
    intelligenceLabel: level.intelligenceLabel,
    tradeoffLabel: level.tradeoffLabel,
  }));
}

export function resolveOnboardingIntelligenceLevel(intelligenceLevelId = "low") {
  const normalizedIntelligenceLevelId = normalizeString(intelligenceLevelId, "low").toLowerCase();
  return listOnboardingIntelligenceLevels().find((level) => level.intelligenceLevelId === normalizedIntelligenceLevelId)
    ?? listOnboardingIntelligenceLevels()[0]
    ?? listOnboardingIntelligenceLevels()[0];
}

export function createOnboardingProviderRuntime({
  selectedProviderId = "openai",
  selectedModelFamilyId = "fast",
  selectedIntelligenceLevel = "low",
  sessionId = null,
  currentQuestionPath = [],
  learningStatus = "partial",
  availableProviders = null,
  availableModelFamilies = null,
  availableIntelligenceLevels = null,
  runtimeMode = "provider-backed-shell",
  deliveryMode = "shell",
  availabilityStatus = "unknown",
  availabilityReason = null,
  lastModelUsed = null,
  usageTotals = null,
  summaryLine = null,
  enforcementLine = null,
  accountingLine = null,
  availabilityLine = null,
  operatorTruthLine = null,
  tradeoffLine = null,
  healthStatus = "standby",
} = {}) {
  const selectedProvider = resolveOnboardingAgentProvider(selectedProviderId);
  const selectedModelFamily = resolveOnboardingModelFamily(selectedProvider.providerId, selectedModelFamilyId);
  const selectedIntelligence = resolveOnboardingIntelligenceLevel(selectedIntelligenceLevel);
  const resolvedProviders = Array.isArray(availableProviders) && availableProviders.length > 0
    ? availableProviders
    : listOnboardingAgentProviders();
  const resolvedModelFamilies = Array.isArray(availableModelFamilies) && availableModelFamilies.length > 0
    ? availableModelFamilies
    : listOnboardingModelFamilies(selectedProvider.providerId);
  const resolvedIntelligenceLevels = Array.isArray(availableIntelligenceLevels) && availableIntelligenceLevels.length > 0
    ? availableIntelligenceLevels
    : listOnboardingIntelligenceLevels();
  return {
    runtimeId: `onboarding-provider-runtime:${selectedProvider.providerId}`,
    runtimeMode,
    canonicalRuleLayer: "nexus-onboarding-rules-v1",
    selectedProviderId: selectedProvider.providerId,
    selectedProviderLabel: selectedProvider.companyLabel,
    selectedRuntimeLabel: selectedProvider.runtimeLabel,
    selectedVoiceLabel: selectedProvider.voiceLabel,
    selectedModelFamilyId: selectedModelFamily.modelFamilyId,
    selectedModelLabel: selectedModelFamily.modelLabel,
    selectedRuntimeModelId: selectedModelFamily.runtimeModelId,
    selectedIntelligenceLevel: selectedIntelligence.intelligenceLevelId,
    selectedIntelligenceLabel: selectedIntelligence.intelligenceLabel,
    availableProviders: resolvedProviders,
    availableModelFamilies: resolvedModelFamilies,
    availableIntelligenceLevels: resolvedIntelligenceLevels,
    sessionId: normalizeString(sessionId, null),
    learningStatus: normalizeString(learningStatus, "partial"),
    currentQuestionPath: normalizeArray(currentQuestionPath),
    deliveryMode,
    availabilityStatus,
    availabilityReason,
    lastModelUsed: normalizeString(lastModelUsed, null),
    usageTotals: usageTotals && typeof usageTotals === "object" ? usageTotals : null,
    healthStatus: normalizeString(healthStatus, "standby"),
    summaryLine: normalizeString(
      summaryLine,
      `כרגע אני עובד איתך דרך ${selectedProvider.companyLabel}.`,
    ),
    enforcementLine: normalizeString(
      enforcementLine,
      "גם אם משנים מודל, אני לא מתקדם לפני שהתמונה באמת ברורה.",
    ),
    accountingLine: normalizeString(accountingLine, ""),
    availabilityLine: normalizeString(availabilityLine, ""),
    operatorTruthLine: normalizeString(operatorTruthLine, ""),
    tradeoffLine: normalizeString(
      tradeoffLine,
      `מודל ${selectedModelFamily.modelLabel} · עומק ${selectedIntelligence.intelligenceLabel} · ${selectedModelFamily.tradeoffLabel}. ${selectedIntelligence.tradeoffLabel}.`,
    ),
  };
}

export function decorateProviderBackedAiEntry(entry = {}, providerRuntime = null) {
  const provider = providerRuntime ?? createOnboardingProviderRuntime();
  return {
    ...entry,
    providerId: provider.selectedProviderId,
    providerLabel: provider.selectedProviderLabel,
    runtimeLabel: provider.selectedRuntimeLabel,
    responseSource: normalizeString(entry.responseSource, "policy-draft"),
  };
}
