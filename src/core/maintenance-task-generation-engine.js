function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function inferSeverity(liveProjectMonitoring, ownerIncident) {
  const monitoring = normalizeObject(liveProjectMonitoring);
  const incident = normalizeObject(ownerIncident);
  const healthStatus = normalizeString(monitoring?.healthStatus);
  const incidentState = normalizeString(incident?.incidentState);

  if (healthStatus === "degraded" || incidentState === "active") {
    return "high";
  }

  return "medium";
}

function hasMaintenanceTrigger({ liveProjectMonitoring, ownerIncident }) {
  const monitoring = normalizeObject(liveProjectMonitoring);
  const incident = normalizeObject(ownerIncident);
  const alerts = normalizeArray(monitoring?.alerts).filter((value) => normalizeString(value));
  return normalizeString(monitoring?.healthStatus) === "degraded"
    || normalizeString(incident?.incidentState) === "active"
    || alerts.length > 0;
}

function uniqueStrings(values) {
  return [...new Set(normalizeArray(values).map((value) => normalizeString(value)).filter(Boolean))];
}

function buildMaintenanceItems({ liveProjectMonitoring, incidentTimeline, rootCauseSummary, ownerIncident }) {
  const monitoring = normalizeObject(liveProjectMonitoring);
  const timeline = normalizeObject(incidentTimeline);
  const rootCause = normalizeObject(rootCauseSummary);
  const incident = normalizeObject(ownerIncident);
  const severity = inferSeverity(monitoring, incident);
  const backlogId = `maintenance-backlog:${slugify(monitoring?.liveProjectMonitoringId ?? timeline?.incidentTimelineId)}`;
  const summaryRoot = normalizeString(rootCause?.suspectedCause) ?? "operational-follow-up";

  return [
    {
      maintenanceTaskId: `${backlogId}:stabilize`,
      taskType: "ops",
      lane: "maintenance",
      summary: "Stabilize live incident and clear degraded project monitoring signals",
      priority: severity === "high" ? 100 : 90,
      requiredCapabilities: ["devops"],
      successCriteria: [
        "Owner incident is acknowledged",
        "Live monitoring no longer reports degraded state",
        "Immediate mitigation steps are recorded",
      ],
      lockKey: `maintenance-stabilize:${slugify(monitoring?.liveProjectMonitoringId)}`,
      severity,
      dependencies: [],
      sourceSignals: uniqueStrings([
        normalizeString(monitoring?.liveProjectMonitoringId),
        normalizeString(timeline?.incidentTimelineId),
      ]),
    },
    {
      maintenanceTaskId: `${backlogId}:root-cause`,
      taskType: "analysis",
      lane: "maintenance",
      summary: `Investigate root cause and corrective actions for ${summaryRoot}`,
      priority: severity === "high" ? 80 : 70,
      requiredCapabilities: ["devops"],
      successCriteria: [
        "Root cause summary is reviewed",
        "Corrective actions are converted to implementation steps",
      ],
      lockKey: `maintenance-root-cause:${slugify(rootCause?.rootCauseSummaryId)}`,
      severity: severity === "high" ? "medium" : severity,
      dependencies: [`${backlogId}:stabilize`],
      sourceSignals: uniqueStrings([
        normalizeString(rootCause?.rootCauseSummaryId),
        normalizeString(timeline?.incidentTimelineId),
      ]),
    },
  ];
}

export function createMaintenanceTaskGenerationEngine({
  liveProjectMonitoring = null,
  incidentTimeline = null,
  rootCauseSummary = null,
  ownerIncident = null,
} = {}) {
  const monitoring = normalizeObject(liveProjectMonitoring);
  const timeline = normalizeObject(incidentTimeline);
  const rootCause = normalizeObject(rootCauseSummary);
  const incident = normalizeObject(ownerIncident);
  const hasIncidentSignals =
    normalizeString(monitoring?.status) === "ready"
    && normalizeString(timeline?.status) === "ready"
    && normalizeString(incident?.status) === "ready";
  const hasActiveMaintenanceTrigger = hasMaintenanceTrigger({
    liveProjectMonitoring: monitoring,
    ownerIncident: incident,
  });

  const maintenanceBacklogId = `maintenance-backlog:${slugify(monitoring?.liveProjectMonitoringId ?? timeline?.incidentTimelineId)}`;

  if (!hasIncidentSignals || !hasActiveMaintenanceTrigger) {
    return {
      maintenanceBacklog: {
        maintenanceBacklogId,
        status: "not-required",
        missingInputs: hasIncidentSignals
          ? []
          : ["liveProjectMonitoring", "incidentTimeline", "ownerIncident"].filter((key) => {
            if (key === "liveProjectMonitoring") return normalizeString(monitoring?.status) !== "ready";
            if (key === "incidentTimeline") return normalizeString(timeline?.status) !== "ready";
            return normalizeString(incident?.status) !== "ready";
          }),
        triggerState: hasIncidentSignals ? "inactive" : "missing-inputs",
        items: [],
      },
    };
  }

  const items = buildMaintenanceItems({
    liveProjectMonitoring: monitoring,
    incidentTimeline: timeline,
    rootCauseSummary: rootCause,
    ownerIncident: incident,
  });

  return {
    maintenanceBacklog: {
      maintenanceBacklogId,
      status: "ready",
      missingInputs: [],
      triggerState: "active",
      items,
      summary: {
        totalItems: items.length,
        highestSeverity: items[0]?.severity ?? "medium",
      },
    },
  };
}
