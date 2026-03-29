function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function countConsecutiveFailures(providerSession, incidentAlert) {
  const providerStatus = providerSession.status ?? "connected";
  const incidents = normalizeArray(incidentAlert.incidents);
  const providerIncidents = incidents.filter((incident) =>
    normalizeArray(incident.affectedComponents).some((component) =>
      String(component).includes(providerSession.providerType ?? "generic"),
    ),
  );

  let failures = providerIncidents.length;
  if (["degraded", "failed", "disconnected", "timeout"].includes(providerStatus)) {
    failures += 1;
  }

  return failures;
}

function resolveHealth(providerSession, incidentAlert, failureCount) {
  if (incidentAlert.status === "active" && failureCount >= 3) {
    return "outage";
  }

  if (failureCount >= 2 || providerSession.status === "degraded") {
    return "degraded";
  }

  if (providerSession.status === "connected" || providerSession.status === "verified") {
    return "healthy";
  }

  return "unknown";
}

function resolveCooldownWindowMs(health, consecutiveFailures) {
  if (health === "outage") {
    return 300000;
  }

  if (health === "degraded" || consecutiveFailures >= 2) {
    return 60000;
  }

  return 0;
}

function resolveProbeState(health, cooldownWindowMs) {
  if (health === "outage") {
    return "cooldown";
  }

  if (health === "degraded" && cooldownWindowMs > 0) {
    return "probe-required";
  }

  return "open";
}

export function defineProviderDegradationSchema({
  providerSession = null,
  incidentAlert = null,
} = {}) {
  const normalizedProviderSession = normalizeObject(providerSession);
  const normalizedIncidentAlert = normalizeObject(incidentAlert);
  const consecutiveFailures = countConsecutiveFailures(normalizedProviderSession, normalizedIncidentAlert);
  const health = resolveHealth(normalizedProviderSession, normalizedIncidentAlert, consecutiveFailures);
  const cooldownWindowMs = resolveCooldownWindowMs(health, consecutiveFailures);
  const probeState = resolveProbeState(health, cooldownWindowMs);
  const degradedServiceFlags = [
    health !== "healthy" ? "provider-health-degraded" : null,
    normalizedIncidentAlert.status === "active" ? "incident-active" : null,
    cooldownWindowMs > 0 ? "cooldown-active" : null,
  ].filter(Boolean);

  return {
    providerDegradationState: {
      degradationStateId: `provider-degradation:${normalizedProviderSession.providerType ?? "generic"}`,
      providerType: normalizedProviderSession.providerType ?? "generic",
      health,
      consecutiveFailures,
      cooldownWindowMs,
      probeState,
      degradedServiceFlags,
      summary: {
        isDegraded: health === "degraded" || health === "outage",
        requiresCircuitBreaker: consecutiveFailures >= 2 || health === "outage",
        hasIncidentSignal: normalizedIncidentAlert.status === "active",
      },
    },
  };
}
