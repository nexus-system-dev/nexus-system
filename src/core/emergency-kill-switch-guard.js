import crypto from "node:crypto";

import { createKillSwitchPathRegistry } from "./kill-switch-path-registry.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function buildId() {
  return `kill-switch:${Date.now()}:${crypto.randomBytes(4).toString("hex")}`;
}

function dedupe(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function deriveIncidentPaths(incidentAlert, registry) {
  const status = normalizeString(incidentAlert.status, null)?.toLowerCase();
  const severity = normalizeString(incidentAlert.severity, null)?.toLowerCase();
  if (status !== "active" || severity !== "critical") {
    return [];
  }
  const incidentType = normalizeString(incidentAlert.incidentType, null);
  const incidentTypePaths = registry.incidentPathRegistry[incidentType] ?? [];
  const componentPaths = registry.mapAffectedComponents(
    normalizeArray(incidentAlert.affectedComponents).map((component) => normalizeString(component, null)),
  );
  return dedupe([...incidentTypePaths, ...componentPaths]);
}

function deriveFlagPaths(featureFlagDecision, registry) {
  const flagResults = normalizeArray(featureFlagDecision.flagResults);
  const triggeredFlags = flagResults
    .map((flag) => ({
      ...normalizeObject(flag),
      flagId: normalizeString(flag?.flagId, "unknown-flag"),
      reason: normalizeString(flag?.reason, null)?.toLowerCase(),
    }))
    .filter((flag) => flag.reason === "kill-switch");
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
        incidentType: hasIncidentTrigger ? normalizeString(normalizedIncidentAlert.incidentType, null) : null,
        incidentSeverity: hasIncidentTrigger ? normalizeString(normalizedIncidentAlert.severity, null)?.toLowerCase() ?? null : null,
        featureFlags: triggeredFlags.map((flag) => flag.flagId),
      },
      cooldownMs: hasIncidentTrigger ? 300000 : hasFlagTrigger ? 600000 : 0,
      activatedAt: isActive ? new Date().toISOString() : null,
      reason: !isActive
        ? "No active incident or kill switch flag requires blocking"
        : hasIncidentTrigger && hasFlagTrigger
          ? "Critical incident and kill switch flag both require blocking"
          : hasIncidentTrigger
            ? `Critical incident ${normalizeString(normalizedIncidentAlert.incidentType, "incident")} requires blocking`
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
