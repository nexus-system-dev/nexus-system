import { createFeatureDefinitionsRegistry } from "./feature-definitions-registry.js";

function normalizeEnvironmentName(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["production", "prod", "live"].includes(normalized)) {
    return "production";
  }
  if (["staging", "stage", "preview", "preprod"].includes(normalized)) {
    return "staging";
  }
  if (["development", "dev", "local", "ci", "test"].includes(normalized)) {
    return "development";
  }
  return "unknown";
}

function normalizeEnvironmentTargets(value) {
  const targets = Array.isArray(value) ? value : value ? [value] : [];
  const normalized = [...new Set(targets.map(normalizeEnvironmentName))];
  return normalized.length > 0 ? normalized : ["unknown"];
}

function normalizeTargets(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (typeof entry === "string" && entry.trim() ? entry.trim() : null))
    .filter(Boolean);
}

function normalizeEnvironmentConfig(environmentConfig = null) {
  const config = environmentConfig && typeof environmentConfig === "object" ? environmentConfig : {};
  const sourceEnvironment = config.environment
    ?? config.targetEnvironment
    ?? config.defaultEnvironment
    ?? config.providerEnvironment
    ?? config.target
    ?? config.runtimeSource
    ?? null;

  return {
    projectId: config.projectId ?? null,
    environment: normalizeEnvironmentName(sourceEnvironment),
    executionModes: Array.isArray(config.executionModes) ? config.executionModes : [],
    defaultMode: config.defaultMode ?? null,
    provider: config.provider ?? null,
    target: config.target ?? null,
    runtimeSource: config.runtimeSource ?? null,
  };
}

function normalizeRolloutScope(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["global", "workspace", "environment", "percentage"].includes(normalized)) {
    return normalized;
  }
  return "global";
}

function normalizePercentage(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

export function defineFeatureFlagSchema({
  featureDefinitions = null,
  environmentConfig = null,
} = {}) {
  const { featureDefinitionsRegistry } = createFeatureDefinitionsRegistry({
    featureDefinitions,
  });
  const normalizedEnvironmentConfig = normalizeEnvironmentConfig(environmentConfig);

  const flags = featureDefinitionsRegistry.map((definition) => {
    const isKillSwitch = definition.isKillSwitch === true;
    const enabled = isKillSwitch ? false : definition.enabled === true;
    return {
      flagId: definition.flagId,
      description: definition.description ?? "Feature flag",
      enabled,
      rolloutScope: normalizeRolloutScope(definition.rolloutScope),
      rolloutPercentage: normalizePercentage(definition.rolloutPercentage),
      environmentTargets: normalizeEnvironmentTargets(definition.environmentTargets),
      workspaceTargets: normalizeTargets(definition.workspaceTargets),
      userTargets: normalizeTargets(definition.userTargets),
      riskSensitive: definition.riskSensitive === true,
      isKillSwitch,
      defaultFallback: definition.defaultFallback ?? "disabled",
    };
  });

  const environmentsTargeted = [...new Set(flags.flatMap((flag) => flag.environmentTargets))];

  return {
    featureFlagSchema: {
      featureFlagSchemaId: `feature-flag-schema:${normalizedEnvironmentConfig.projectId ?? "nexus"}`,
      version: "1.0.0",
      environmentConfig: normalizedEnvironmentConfig,
      flags,
      summary: {
        totalFlags: flags.length,
        enabledFlags: flags.filter((flag) => flag.enabled).length,
        killSwitchesActive: flags.filter((flag) => flag.isKillSwitch && flag.enabled === false).length,
        environmentsTargeted,
      },
    },
  };
}
