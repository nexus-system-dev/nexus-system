// Task #176 — Define feature success schema
// Unified schema for measuring feature success: activation, repeat usage, completion quality,
// override rate and drop-off points.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeRate(value) {
  const n = normalizeFiniteNumber(value);
  return Math.min(1, Math.max(0, n));
}

function buildDropOffEntry(event) {
  const e = normalizeObject(event);
  return {
    stepId: normalizeString(e.stepId) ?? "unknown-step",
    dropOffRate: normalizeRate(e.dropOffRate),
    absoluteCount: normalizeFiniteNumber(e.absoluteCount),
  };
}

export function defineFeatureSuccessSchema({
  featureId = null,
  featureUsageEvents = null,
  analyticsSummary = null,
} = {}) {
  const events = normalizeArray(featureUsageEvents);
  const summary = normalizeObject(analyticsSummary);

  const schemaId = `feature-success-schema:${featureId ?? Date.now()}`;

  const activationCount = events.filter((e) => normalizeObject(e).eventType === "activation").length;
  const repeatUsageCount = events.filter((e) => normalizeObject(e).eventType === "repeat-usage").length;
  const completionCount = events.filter((e) => normalizeObject(e).eventType === "completion").length;
  const overrideCount = events.filter((e) => normalizeObject(e).eventType === "override").length;
  const totalEvents = events.length;

  const activationRate = totalEvents > 0 ? activationCount / totalEvents : 0;
  const repeatUsageRate = totalEvents > 0 ? repeatUsageCount / totalEvents : 0;
  const completionRate = totalEvents > 0 ? completionCount / totalEvents : 0;
  const overrideRate = totalEvents > 0 ? overrideCount / totalEvents : 0;

  const dropOffPoints = events
    .filter((e) => normalizeObject(e).eventType === "drop-off")
    .map(buildDropOffEntry);

  return {
    featureSuccessMetric: {
      schemaId,
      featureId: normalizeString(featureId) ?? "unknown-feature",
      activationRate,
      repeatUsageRate,
      completionRate,
      overrideRate,
      dropOffPoints,
      eventCount: totalEvents,
      meta: {
        hasUsageEvents: totalEvents > 0,
        hasDropOffData: dropOffPoints.length > 0,
        hasAnalyticsSummary: Object.keys(summary).length > 0,
        schemaVersion: "1.0",
      },
    },
  };
}
