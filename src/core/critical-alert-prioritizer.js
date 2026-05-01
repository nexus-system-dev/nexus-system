function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerOperationsSignals, ownerPriorityQueue) {
  const missingInputs = [];
  if (!ownerOperationsSignals || normalizeString(ownerOperationsSignals.status) !== "ready") missingInputs.push("ownerOperationsSignals");
  if (!ownerPriorityQueue || normalizeString(ownerPriorityQueue.status) !== "ready") missingInputs.push("ownerPriorityQueue");
  return missingInputs;
}

export function createCriticalAlertPrioritizer({
  ownerOperationsSignals = null,
  ownerPriorityQueue = null,
} = {}) {
  const signals = normalizeObject(ownerOperationsSignals);
  const queue = normalizeObject(ownerPriorityQueue);
  const missingInputs = buildMissingInputs(signals, queue);

  if (missingInputs.length > 0) {
    return { prioritizedOwnerAlerts: { prioritizedOwnerAlertsId: `owner-alerts:${slugify(signals?.ownerOperationsSignalsId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    prioritizedOwnerAlerts: {
      prioritizedOwnerAlertsId: `owner-alerts:${slugify(signals.ownerOperationsSignalsId)}`,
      status: "ready",
      missingInputs: [],
      alerts: [
        {
          alertId: "owner-alert:1",
          priority: normalizeString(queue.priorities?.[0]?.urgency) ?? "medium",
          area: normalizeString(queue.priorities?.[0]?.area) ?? "growth",
        },
      ],
    },
  };
}
