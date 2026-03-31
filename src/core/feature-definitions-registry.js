const DEFAULT_FEATURE_DEFINITIONS = [
  {
    flagId: "live-updates",
    description: "Controls real-time workspace updates and event streaming surfaces",
    enabled: true,
    rolloutScope: "global",
    rolloutPercentage: 100,
    environmentTargets: ["production", "staging", "development"],
    isKillSwitch: false,
    defaultFallback: "disable-live-updates",
  },
  {
    flagId: "ai-design-proposals",
    description: "Controls AI-assisted design proposal generation flows",
    enabled: false,
    rolloutScope: "workspace",
    rolloutPercentage: 0,
    environmentTargets: ["staging", "development"],
    isKillSwitch: false,
    defaultFallback: "manual-design-review",
  },
  {
    flagId: "provider-runtime-execution",
    description: "Controls outbound provider execution across runtime and connector surfaces",
    enabled: true,
    rolloutScope: "percentage",
    rolloutPercentage: 50,
    environmentTargets: ["production", "staging"],
    isKillSwitch: false,
    defaultFallback: "queue-and-review",
  },
  {
    flagId: "emergency-execution-stop",
    description: "Global kill switch for risky execution and provider mutations",
    enabled: true,
    rolloutScope: "global",
    rolloutPercentage: 100,
    environmentTargets: ["production", "staging", "development"],
    isKillSwitch: true,
    defaultFallback: "block-execution",
  },
];

function normalizeDefinition(definition) {
  return definition && typeof definition === "object" ? definition : null;
}

export function createFeatureDefinitionsRegistry({
  featureDefinitions = null,
} = {}) {
  const overrides = Array.isArray(featureDefinitions)
    ? featureDefinitions.map(normalizeDefinition).filter(Boolean)
    : featureDefinitions && typeof featureDefinitions === "object"
      ? [featureDefinitions]
      : [];
  const overrideMap = new Map(overrides.map((definition) => [definition.flagId, definition]));

  const featureDefinitionsRegistry = DEFAULT_FEATURE_DEFINITIONS.map((definition) => ({
    ...definition,
    ...(overrideMap.get(definition.flagId) ?? {}),
  }));

  for (const override of overrides) {
    if (!override.flagId || featureDefinitionsRegistry.some((definition) => definition.flagId === override.flagId)) {
      continue;
    }
    featureDefinitionsRegistry.push({
      description: "Custom feature flag override",
      enabled: false,
      rolloutScope: "global",
      rolloutPercentage: 100,
      environmentTargets: ["unknown"],
      isKillSwitch: false,
      defaultFallback: "disabled",
      ...override,
    });
  }

  return {
    featureDefinitionsRegistry,
  };
}
