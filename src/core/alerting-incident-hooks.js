function normalizePlatformTrace(platformTrace) {
  return platformTrace && typeof platformTrace === "object" ? platformTrace : {};
}

function normalizeHealthStatus(healthStatus) {
  return healthStatus && typeof healthStatus === "object" ? healthStatus : {};
}

function normalizeLogs(platformTrace) {
  return Array.isArray(platformTrace.logs) ? platformTrace.logs : [];
}

function collectSignals({ platformTrace, healthStatus }) {
  const incidents = [];
  const dependencies = Array.isArray(healthStatus.dependencyStatus) ? healthStatus.dependencyStatus : [];
  const traceSteps = Array.isArray(platformTrace.steps) ? platformTrace.steps : [];
  const logs = normalizeLogs(platformTrace);

  if (healthStatus.status === "degraded") {
    incidents.push({
      type: "runtime-incident",
      severity: "high",
      reason: "Runtime health is degraded",
      affectedComponents: dependencies
        .filter((dependency) => ["degraded", "down", "failed", "blocked"].includes(dependency.status))
        .map((dependency) => dependency.name),
    });
  }

  if (healthStatus.status === "not-ready" || healthStatus.isReady === false) {
    incidents.push({
      type: "readiness-blocker",
      severity: "high",
      reason: "Runtime is not ready",
      affectedComponents: healthStatus.blockers ?? [],
    });
  }

  const queueStallLog = logs.find((entry) => {
    const message = `${entry?.message ?? ""}`.toLowerCase();
    return message.includes("queue") && (message.includes("stall") || message.includes("stuck") || message.includes("blocked"));
  });
  if (queueStallLog) {
    incidents.push({
      type: "queue-stall",
      severity: "critical",
      reason: queueStallLog.message,
      affectedComponents: ["background-worker"],
    });
  }

  const connectorFailureStep = traceSteps.find((step) => {
    const source = `${step?.source ?? ""}`.toLowerCase();
    return source.includes("connector") && ["failed", "blocked"].includes(step?.status);
  });
  if (connectorFailureStep) {
    incidents.push({
      type: "connector-outage",
      severity: "critical",
      reason: connectorFailureStep.message ?? "Connector outage detected",
      affectedComponents: [connectorFailureStep.source],
    });
  }

  const runtimeFailureStep = traceSteps.find((step) => ["failed", "blocked"].includes(step?.status));
  if (runtimeFailureStep) {
    incidents.push({
      type: "execution-failure",
      severity: incidents.length > 0 ? "high" : "medium",
      reason: runtimeFailureStep.message ?? "Execution incident detected",
      affectedComponents: [runtimeFailureStep.source ?? "runtime"],
    });
  }

  return incidents;
}

function dedupeIncidents(incidents) {
  const seen = new Set();
  return incidents.filter((incident) => {
    const key = `${incident.type}:${incident.reason}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function createAlertingAndIncidentHooks({
  platformTrace = null,
  healthStatus = null,
} = {}) {
  const normalizedPlatformTrace = normalizePlatformTrace(platformTrace);
  const normalizedHealthStatus = normalizeHealthStatus(healthStatus);
  const dedupedIncidents = dedupeIncidents(collectSignals({
    platformTrace: normalizedPlatformTrace,
    healthStatus: normalizedHealthStatus,
  }));
  const primaryIncident = dedupedIncidents[0] ?? null;

  return {
    incidentAlert: {
      incidentAlertId: `incident-alert-${Date.now()}`,
      status: primaryIncident ? "active" : "clear",
      severity: primaryIncident?.severity ?? "none",
      incidentType: primaryIncident?.type ?? "none",
      summary: primaryIncident?.reason ?? "No active incidents detected",
      incidentCount: dedupedIncidents.length,
      incidents: dedupedIncidents,
      affectedComponents: [...new Set(dedupedIncidents.flatMap((incident) => incident.affectedComponents ?? []))],
      recommendedHooks: primaryIncident
        ? ["in-app", primaryIncident.severity === "critical" ? "email" : null, primaryIncident.severity === "critical" ? "webhook" : null]
          .filter(Boolean)
        : [],
      traceId: normalizedPlatformTrace.traceId ?? null,
      checkedAt: new Date().toISOString(),
    },
  };
}
