function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(prioritizedOwnerAlerts, ownerRoutinePlan) {
  const missingInputs = [];
  if (!prioritizedOwnerAlerts || normalizeString(prioritizedOwnerAlerts.status) !== "ready") missingInputs.push("prioritizedOwnerAlerts");
  if (!ownerRoutinePlan || normalizeString(ownerRoutinePlan.status) !== "ready") missingInputs.push("ownerRoutinePlan");
  return missingInputs;
}

export function createNoiseSuppressionSystem({
  prioritizedOwnerAlerts = null,
  ownerRoutinePlan = null,
} = {}) {
  const alerts = normalizeObject(prioritizedOwnerAlerts);
  const routine = normalizeObject(ownerRoutinePlan);
  const missingInputs = buildMissingInputs(alerts, routine);

  if (missingInputs.length > 0) {
    return { ownerAlertFeed: { ownerAlertFeedId: `owner-alert-feed:${slugify(alerts?.prioritizedOwnerAlertsId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    ownerAlertFeed: {
      ownerAlertFeedId: `owner-alert-feed:${slugify(alerts.prioritizedOwnerAlertsId)}`,
      status: "ready",
      missingInputs: [],
      surfacedAlerts: (alerts.alerts ?? []).slice(0, 1),
      suppressionMode: Array.isArray(routine.checklist) ? "routine-aware" : "default",
    },
  };
}
