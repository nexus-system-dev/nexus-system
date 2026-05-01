function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeNumber(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(reliabilitySlaModel, continuityPlan) {
  const missingInputs = [];
  if (!reliabilitySlaModel || normalizeString(reliabilitySlaModel.schemaStatus) !== "canonical") {
    missingInputs.push("reliabilitySlaModel");
  }
  if (!continuityPlan || normalizeString(continuityPlan.planningStatus) !== "ready") {
    missingInputs.push("continuityPlan");
  }
  return missingInputs;
}

function normalizeSeverity(value) {
  const severity = normalizeString(value) ?? "low";
  return ["critical", "high", "medium", "low"].includes(severity) ? severity : "low";
}

export function createServiceReliabilityDashboardModel({
  reliabilitySlaModel = null,
  continuityPlan = null,
  incidentAlert = null,
  systemBottleneckSummary = null,
  liveProjectMonitoring = null,
} = {}) {
  const reliability = normalizeObject(reliabilitySlaModel);
  const continuity = normalizeObject(continuityPlan);
  const incident = normalizeObject(incidentAlert);
  const bottleneck = normalizeObject(systemBottleneckSummary);
  const monitoring = normalizeObject(liveProjectMonitoring);
  const missingInputs = buildMissingInputs(reliability, continuity);

  if (missingInputs.length > 0) {
    return {
      serviceReliabilityDashboard: {
        serviceReliabilityDashboardId: `service-reliability:${slugify(reliability?.reliabilityModelId ?? continuity?.continuityPlanId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const incidentStatus = normalizeString(incident?.status) ?? "clear";
  const dashboardSeverity = normalizeSeverity(
    incident?.severity
    ?? bottleneck?.severity
    ?? (incidentStatus === "active" ? "high" : "low"),
  );
  const continuityMode = normalizeString(continuity?.recommendedMode) ?? "degraded";
  const queueLagMinutes = normalizeNumber(
    bottleneck?.queueObservability?.queueLagSeconds,
    0,
  ) / 60;

  return {
    serviceReliabilityDashboard: {
      serviceReliabilityDashboardId: `service-reliability:${slugify(reliability.reliabilityModelId)}`,
      status: "ready",
      missingInputs: [],
      serviceTier: normalizeString(reliability?.serviceTier) ?? "standard",
      uptimeTargetPercent: normalizeNumber(reliability?.uptimeTargets?.monthlyPercent),
      maxMonthlyDowntimeMinutes: normalizeNumber(reliability?.uptimeTargets?.maxMonthlyDowntimeMinutes),
      recoveryObjectives: {
        rtoMinutes: normalizeNumber(reliability?.recoveryObjectives?.rtoMinutes),
        rpoMinutes: normalizeNumber(reliability?.recoveryObjectives?.rpoMinutes),
      },
      continuityMode,
      continuityStatus: normalizeString(continuity?.planningStatus) ?? "ready",
      incidentStatus,
      incidentCount: normalizeNumber(incident?.incidentCount, 0),
      dashboardSeverity,
      bottleneckType: normalizeString(bottleneck?.bottleneckType) ?? "none",
      queueLagMinutes,
      workspacePressureStatus: normalizeString(monitoring?.healthStatus) ?? normalizeString(monitoring?.status) ?? "unknown",
      monitoringStatus: normalizeString(monitoring?.status) ?? "unknown",
      summaryCards: [
        {
          cardId: "uptime-target",
          label: "Uptime target",
          value: normalizeNumber(reliability?.uptimeTargets?.monthlyPercent),
          unit: "percent",
          status: "ready",
        },
        {
          cardId: "recovery-window",
          label: "Recovery window",
          value: normalizeNumber(reliability?.recoveryObjectives?.rtoMinutes),
          unit: "minutes",
          status: continuityMode,
        },
        {
          cardId: "incident-status",
          label: "Incident status",
          value: incidentStatus,
          unit: null,
          status: dashboardSeverity,
        },
        {
          cardId: "queue-lag",
          label: "Queue lag",
          value: queueLagMinutes,
          unit: "minutes",
          status: normalizeSeverity(bottleneck?.severity ?? "low"),
        },
      ],
      healthBreakdown: {
        reliabilitySchemaStatus: normalizeString(reliability?.schemaStatus) ?? "canonical",
        continuityCheckpoint: normalizeString(continuity?.recoveryDirection?.nextCheckpoint),
        affectedLayer: normalizeString(continuity?.affectedLayer) ?? "runtime",
        affectedComponents: Array.isArray(incident?.affectedComponents) ? incident.affectedComponents : [],
        activeSignals: Array.isArray(bottleneck?.signals) ? bottleneck.signals.length : 0,
      },
    },
  };
}
