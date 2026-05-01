import { defineNotificationEventSchema } from "./notification-event-schema.js";
import { createEmailNotificationDeliveryModule } from "./email-notification-delivery-module.js";
import { createWebhookExternalNotificationAdapter } from "./webhook-external-notification-adapter.js";

function normalizePlatformTrace(platformTrace) {
  return platformTrace && typeof platformTrace === "object" ? platformTrace : {};
}

function normalizeHealthStatus(healthStatus) {
  return healthStatus && typeof healthStatus === "object" ? healthStatus : {};
}

function normalizeLogs(platformTrace) {
  return Array.isArray(platformTrace.logs) ? platformTrace.logs : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function buildInAppDispatch(notificationEvent) {
  if (!notificationEvent?.notificationEventId) {
    return {
      deliveryChannel: "in-app",
      deliveryStatus: "skipped",
      target: null,
      queuedAt: null,
      reason: "No incident notification event available",
    };
  }

  return {
    deliveryChannel: "in-app",
    deliveryStatus: "queued",
    target: notificationEvent.userId ?? notificationEvent.actorId ?? null,
    queuedAt: new Date().toISOString(),
    reason: null,
  };
}

function buildIncidentNotificationEvent({
  primaryIncident,
  incidentAlert,
  recommendedHooks,
  projectId,
  actorId,
}) {
  if (!primaryIncident) {
    return null;
  }

  const eventType = primaryIncident.severity === "critical" ? "security" : "failure";
  return defineNotificationEventSchema({
    eventType,
    eventPayload: {
      status: "queued",
      title: `Incident: ${primaryIncident.type}`,
      message: primaryIncident.reason,
      channels: recommendedHooks,
      actorId,
      userId: actorId,
      projectId,
      metadata: {
        incidentAlertId: incidentAlert.incidentAlertId,
        incidentType: incidentAlert.incidentType,
        severity: incidentAlert.severity,
        incidentCount: incidentAlert.incidentCount,
        affectedComponents: incidentAlert.affectedComponents,
        traceId: incidentAlert.traceId,
      },
    },
  }).notificationEvent;
}

function recordIncidentTrace({
  observabilityTransport,
  platformTrace,
  incidentAlert,
  hookDispatches,
}) {
  if (!observabilityTransport || typeof observabilityTransport.recordTraceEnvelope !== "function" || incidentAlert.status !== "active") {
    return;
  }

  observabilityTransport.recordTraceEnvelope({
    platformTrace: {
      traceId: `${platformTrace.traceId ?? "platform-trace"}:incident-alert`,
      route: platformTrace.route ?? "/runtime/incidents",
      method: platformTrace.method ?? "SYSTEM",
      actorId: platformTrace.actorId ?? null,
      workspaceId: platformTrace.workspaceId ?? null,
      service: "alerting-incident-hooks",
      runId: platformTrace.runId ?? null,
      status: "alerted",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      steps: [
        {
          stepId: "incident-detected",
          source: "alerting-incident-hooks",
          status: "alerted",
          timestamp: new Date().toISOString(),
          message: incidentAlert.summary,
        },
        ...hookDispatches.map((dispatch, index) => ({
          stepId: `incident-hook-${index + 1}`,
          source: dispatch.deliveryChannel,
          status: dispatch.deliveryStatus,
          timestamp: dispatch.queuedAt ?? new Date().toISOString(),
          message: dispatch.reason ?? `Incident hook ${dispatch.deliveryChannel} ${dispatch.deliveryStatus}`,
        })),
      ],
    },
    platformLogs: [
      {
        level: incidentAlert.severity === "critical" ? "error" : "warn",
        source: "alerting-incident-hooks",
        message: incidentAlert.summary,
        timestamp: new Date().toISOString(),
        metadata: {
          incidentAlertId: incidentAlert.incidentAlertId,
          incidentType: incidentAlert.incidentType,
          incidentCount: incidentAlert.incidentCount,
          affectedComponents: incidentAlert.affectedComponents,
        },
      },
      ...hookDispatches.map((dispatch) => ({
        level: dispatch.deliveryStatus === "queued" ? "info" : "warn",
        source: dispatch.deliveryChannel,
        message: `Incident hook ${dispatch.deliveryChannel} ${dispatch.deliveryStatus}`,
        timestamp: dispatch.queuedAt ?? new Date().toISOString(),
        metadata: {
          target: dispatch.target ?? null,
          reason: dispatch.reason ?? null,
        },
      })),
    ],
  });
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

  if (healthStatus.status === "not-ready" || healthStatus.status === "blocked" || healthStatus.isReady === false) {
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

function scoreSeverity(severity) {
  switch (severity) {
    case "critical":
      return 3;
    case "high":
      return 2;
    case "medium":
      return 1;
    default:
      return 0;
  }
}

function matchesRecommendedHook(dispatch, recommendedHooks = []) {
  if (!dispatch?.deliveryChannel) {
    return false;
  }

  if (recommendedHooks.includes(dispatch.deliveryChannel)) {
    return true;
  }

  if (
    recommendedHooks.includes("webhook")
    && dispatch.deliveryChannel !== "in-app"
    && dispatch.deliveryChannel !== "email"
  ) {
    return true;
  }

  return false;
}

export function createAlertingAndIncidentHooks({
  platformTrace = null,
  healthStatus = null,
  projectId = null,
  actorId = null,
  userEmail = null,
  deliveryPreferences = null,
  channelConfig = null,
  observabilityTransport = null,
} = {}) {
  const normalizedPlatformTrace = normalizePlatformTrace(platformTrace);
  const normalizedHealthStatus = normalizeHealthStatus(healthStatus);
  const dedupedIncidents = dedupeIncidents(collectSignals({
    platformTrace: normalizedPlatformTrace,
    healthStatus: normalizedHealthStatus,
  }));
  const primaryIncident = dedupedIncidents
    .slice()
    .sort((left, right) => scoreSeverity(right.severity) - scoreSeverity(left.severity))[0] ?? null;

  const response = {
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
  const notificationEvent = buildIncidentNotificationEvent({
    primaryIncident,
    incidentAlert: response.incidentAlert,
    recommendedHooks: response.incidentAlert.recommendedHooks,
    projectId,
    actorId,
  });
  const normalizedDeliveryPreferences = normalizeObject(deliveryPreferences);
  const normalizedChannelConfig = normalizeObject(channelConfig);
  const inAppDispatch = buildInAppDispatch(notificationEvent);
  const { emailDeliveryResult } = createEmailNotificationDeliveryModule({
    notificationEvent: notificationEvent
      ? {
          ...notificationEvent,
          userEmail,
        }
      : null,
    deliveryPreferences: {
      ...normalizedDeliveryPreferences,
      email: normalizedDeliveryPreferences.email ?? userEmail ?? null,
    },
  });
  const { externalDeliveryResult } = createWebhookExternalNotificationAdapter({
    notificationEvent,
    channelConfig: normalizedChannelConfig,
  });
  const hookDispatches = response.incidentAlert.status === "active"
    ? [
        inAppDispatch,
        emailDeliveryResult,
        externalDeliveryResult,
      ].filter((dispatch) => matchesRecommendedHook(dispatch, response.incidentAlert.recommendedHooks))
    : [];

  response.incidentAlert.notificationEventId = notificationEvent?.notificationEventId ?? null;
  response.incidentAlert.hookDispatches = hookDispatches;

  recordIncidentTrace({
    observabilityTransport,
    platformTrace: normalizedPlatformTrace,
    incidentAlert: response.incidentAlert,
    hookDispatches,
  });

  return {
    ...response,
    incidentNotificationEvent: notificationEvent,
    incidentEmailDeliveryResult: emailDeliveryResult,
    incidentExternalDeliveryResult: externalDeliveryResult,
  };
}
