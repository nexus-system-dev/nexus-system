import crypto from "node:crypto";

import { createKillSwitchPathRegistry } from "./kill-switch-path-registry.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildId() {
  return `kill-switch:${Date.now()}:${crypto.randomBytes(4).toString("hex")}`;
}

function dedupe(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function deriveIncidentPaths(incidentAlert, registry) {
  if (incidentAlert.status !== "active" || incidentAlert.severity !== "critical") {
    return [];
  }
  const incidentTypePaths = registry.incidentPathRegistry[incidentAlert.incidentType] ?? [];
  const componentPaths = registry.mapAffectedComponents(incidentAlert.affectedComponents ?? []);
  return dedupe([...incidentTypePaths, ...componentPaths]);
}

function deriveFlagPaths(featureFlagDecision, registry) {
  const flagResults = normalizeArray(featureFlagDecision.flagResults);
  const triggeredFlags = flagResults.filter((flag) => flag.reason === "kill-switch");
  const paths = triggeredFlags.flatMap((flag) => registry.featureFlagKillSwitchRegistry[flag.flagId] ?? []);
  return {
    triggeredFlags,
    paths: dedupe(paths),
  };
}

export function createEmergencyKillSwitchGuard({
  featureFlagDecision = null,
  incidentAlert = null,
} = {}) {
  const normalizedFeatureFlagDecision = normalizeObject(featureFlagDecision);
  const normalizedIncidentAlert = normalizeObject(incidentAlert);
  const registry = createKillSwitchPathRegistry();
  const incidentPaths = deriveIncidentPaths(normalizedIncidentAlert, registry);
  const { triggeredFlags, paths: flagPaths } = deriveFlagPaths(normalizedFeatureFlagDecision, registry);
  const killedPaths = dedupe([...incidentPaths, ...flagPaths]);
  const hasIncidentTrigger = incidentPaths.length > 0;
  const hasFlagTrigger = flagPaths.length > 0;
  const isActive = killedPaths.length > 0;
  const globalKill = flagPaths.length > 0 && flagPaths.includes("agent-runtime") && flagPaths.includes("provider-execution") && flagPaths.includes("risky-capabilities");
  const triggeredBy = hasIncidentTrigger && hasFlagTrigger
    ? "both"
    : hasIncidentTrigger
      ? "incident"
      : hasFlagTrigger
        ? "flag"
        : "none";

  return {
    killSwitchDecision: {
      killSwitchDecisionId: buildId(),
      isActive,
      globalKill,
      killedPaths,
      triggeredBy,
      triggerSources: {
        incidentType: hasIncidentTrigger ? normalizedIncidentAlert.incidentType ?? null : null,
        incidentSeverity: hasIncidentTrigger ? normalizedIncidentAlert.severity ?? null : null,
        featureFlags: triggeredFlags.map((flag) => flag.flagId),
      },
      cooldownMs: hasIncidentTrigger ? 300000 : hasFlagTrigger ? 600000 : 0,
      activatedAt: isActive ? new Date().toISOString() : null,
      reason: !isActive
        ? "No active incident or kill switch flag requires blocking"
        : hasIncidentTrigger && hasFlagTrigger
          ? "Critical incident and kill switch flag both require blocking"
          : hasIncidentTrigger
            ? `Critical incident ${normalizedIncidentAlert.incidentType ?? "incident"} requires blocking`
            : `Feature flag kill switch ${triggeredFlags[0]?.flagId ?? "unknown-flag"} requires blocking`,
      summary: {
        totalKilledPaths: killedPaths.length,
        incidentDriven: hasIncidentTrigger,
        flagDriven: hasFlagTrigger,
        hasCooldown: (hasIncidentTrigger ? 300000 : hasFlagTrigger ? 600000 : 0) > 0,
      },
    },
  };
}
