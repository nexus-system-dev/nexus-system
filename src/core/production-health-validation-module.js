function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(normalizeArray(values))];
}

function buildChecks({ deploymentResult, validationReport, liveProjectMonitoring, observedHealth }) {
  return [
    {
      checkId: "deployment-result-ready",
      status: deploymentResult.summary?.isReadyForLaunchVerification === true ? "passed" : "failed",
      reason: deploymentResult.summary?.isReadyForLaunchVerification === true ? null : "deployment-result-unready",
    },
    {
      checkId: "release-validation-ready",
      status: validationReport.isReady === true ? "passed" : "failed",
      reason: validationReport.isReady === true ? null : "release-validation-blocked",
    },
    {
      checkId: "production-health-stable",
      status:
        normalizeString(liveProjectMonitoring.healthStatus, normalizeString(observedHealth.status, "stable")) === "stable"
          ? "passed"
          : "failed",
      reason:
        normalizeString(liveProjectMonitoring.healthStatus, normalizeString(observedHealth.status, "stable")) === "stable"
          ? null
          : "production-health-degraded",
    },
    {
      checkId: "blocking-alerts-clear",
      status: normalizeArray(liveProjectMonitoring.alerts).length === 0 ? "passed" : "failed",
      reason: normalizeArray(liveProjectMonitoring.alerts).length === 0 ? null : "active-production-alerts",
    },
  ];
}

export function createProductionHealthValidationModule({
  deploymentResultEnvelope = null,
  validationReport = null,
  liveProjectMonitoring = null,
  observedHealth = null,
} = {}) {
  const deploymentResult = normalizeObject(deploymentResultEnvelope);
  const report = normalizeObject(validationReport);
  const monitoring = normalizeObject(liveProjectMonitoring);
  const health = normalizeObject(observedHealth);
  const checks = buildChecks({
    deploymentResult,
    validationReport: report,
    liveProjectMonitoring: monitoring,
    observedHealth: health,
  });
  const blockedReasons = unique(checks.filter((check) => check.status === "failed").map((check) => check.reason));

  return {
    productionHealthValidation: {
      productionHealthValidationId: `production-health-validation:${normalizeString(deploymentResult.requestId, "unknown-deployment-request")}`,
      status: blockedReasons.length === 0 ? "ready" : "blocked",
      launchEnvironment: normalizeString(deploymentResult.environment, "staging"),
      healthStatus: normalizeString(monitoring.healthStatus, normalizeString(health.status, "unknown")),
      releaseStatus: normalizeString(monitoring.releaseStatus, "active"),
      checks,
      activeAlerts: normalizeArray(monitoring.alerts),
      blockedReasons,
      summary: {
        passedChecks: checks.filter((check) => check.status === "passed").length,
        failedChecks: checks.filter((check) => check.status === "failed").length,
        canConfirmLaunch: blockedReasons.length === 0,
      },
    },
  };
}
