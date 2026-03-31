import { createRolloutHashUtility } from "./rollout-hash-utility.js";
import { createFeatureFlagRouteRegistry } from "./feature-flag-route-registry.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeEnvironment(value, schemaEnvironment = "unknown") {
  const normalized = normalizeString(value, schemaEnvironment)?.toLowerCase();
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

function normalizeRiskLevel(requestContext = {}) {
  const explicit = normalizeString(requestContext.riskLevel, null)?.toLowerCase();
  if (["low", "medium", "high", "critical"].includes(explicit)) {
    return explicit;
  }
  const riskFlags = Array.isArray(requestContext.riskFlags) ? requestContext.riskFlags : [];
  if (riskFlags.some((flag) => /critical/i.test(flag))) {
    return "critical";
  }
  if (riskFlags.some((flag) => /high|deployment-impact|migration-impact|infra-impact/i.test(flag))) {
    return "high";
  }
  if (riskFlags.length > 0) {
    return "medium";
  }
  return "low";
}

function matchesTarget(targets = [], value = null) {
  if (!Array.isArray(targets) || targets.length === 0) {
    return true;
  }
  return value ? targets.includes(value) : false;
}

function evaluateFlag(flag, requestContext, registryEntry) {
  const evaluatedAt = new Date().toISOString();
  const shared = {
    routes: registryEntry?.routes ?? [],
    capabilities: registryEntry?.capabilities ?? [],
  };
  if (flag.isKillSwitch === true && flag.requestedEnabled === true) {
    return {
      flagId: flag.flagId,
      enabled: false,
      reason: "kill-switch",
      rolloutScope: flag.rolloutScope,
      evaluatedAt,
      ...shared,
    };
  }

  const environment = normalizeEnvironment(requestContext.environment);
  if (!flag.environmentTargets.includes(environment)) {
    return {
      flagId: flag.flagId,
      enabled: false,
      reason: "env-mismatch",
      rolloutScope: flag.rolloutScope,
      evaluatedAt,
      ...shared,
    };
  }

  const workspaceId = normalizeString(requestContext.workspaceId, null);
  const userId = normalizeString(requestContext.userId ?? requestContext.actorId, null);
  if (flag.rolloutScope === "workspace" && !matchesTarget(flag.workspaceTargets, workspaceId)) {
    return {
      flagId: flag.flagId,
      enabled: false,
      reason: "scope-excluded",
      rolloutScope: flag.rolloutScope,
      evaluatedAt,
      ...shared,
    };
  }

  if (flag.userTargets.length > 0 && !matchesTarget(flag.userTargets, userId)) {
    return {
      flagId: flag.flagId,
      enabled: false,
      reason: "scope-excluded",
      rolloutScope: flag.rolloutScope,
      evaluatedAt,
      ...shared,
    };
  }

  const riskLevel = normalizeRiskLevel(requestContext);
  if (flag.riskSensitive === true && ["high", "critical"].includes(riskLevel)) {
    return {
      flagId: flag.flagId,
      enabled: false,
      reason: "risk-blocked",
      rolloutScope: flag.rolloutScope,
      evaluatedAt,
      ...shared,
    };
  }

  if (flag.rolloutScope === "percentage") {
    const { hashBucket, isDeterministic } = createRolloutHashUtility({
      userId,
      flagId: flag.flagId,
    });
    if (!isDeterministic) {
      return {
        flagId: flag.flagId,
        enabled: false,
        reason: "percentage-excluded",
        rolloutScope: flag.rolloutScope,
        evaluatedAt,
        ...shared,
      };
    }
    if (hashBucket >= flag.rolloutPercentage) {
      return {
        flagId: flag.flagId,
        enabled: false,
        reason: "percentage-excluded",
        rolloutScope: flag.rolloutScope,
        evaluatedAt,
        ...shared,
      };
    }
  }

  return {
    flagId: flag.flagId,
    enabled: flag.enabled === true,
    reason: flag.enabled === true ? "enabled" : "scope-excluded",
    rolloutScope: flag.rolloutScope,
    evaluatedAt,
    ...shared,
  };
}

export function createFeatureFlagResolver({
  featureFlagSchema = null,
  requestContext = null,
} = {}) {
  const schema = normalizeObject(featureFlagSchema);
  const flags = Array.isArray(schema.flags) ? schema.flags : [];
  const normalizedRequestContext = normalizeObject(requestContext);
  const { featureFlagRouteRegistry } = createFeatureFlagRouteRegistry();
  const environment = normalizeEnvironment(
    normalizedRequestContext.environment,
    schema.environmentConfig?.environment ?? "unknown",
  );
  const workspaceId = normalizeString(normalizedRequestContext.workspaceId, null);
  const userId = normalizeString(normalizedRequestContext.userId ?? normalizedRequestContext.actorId, null);

  const flagResults = flags.map((flag) => evaluateFlag(flag, {
    ...normalizedRequestContext,
    environment,
    workspaceId,
    userId,
  }, featureFlagRouteRegistry[flag.flagId] ?? null));

  const enabledCapabilities = [...new Set(flagResults
    .filter((flag) => flag.enabled)
    .flatMap((flag) => flag.capabilities ?? []))];
  const blockedRoutes = [...new Set(flagResults
    .filter((flag) => !flag.enabled)
    .flatMap((flag) => (flag.routes ?? []).map((route) => ({
      route,
      flagId: flag.flagId,
    }))))
  ];

  return {
    featureFlagDecision: {
      resolvedAt: new Date().toISOString(),
      environment,
      workspaceId,
      userId,
      flagResults,
      enabledCapabilities,
      blockedRoutes,
      summary: {
        totalFlags: flagResults.length,
        enabledFlags: flagResults.filter((flag) => flag.enabled).length,
        blockedFlags: flagResults.filter((flag) => !flag.enabled).length,
        riskLevel: normalizeRiskLevel(normalizedRequestContext),
      },
    },
  };
}
