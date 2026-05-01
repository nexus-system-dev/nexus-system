// Task #177 — Create feature success tracker
// Computes adoption, stickiness, success rate and friction indicators per feature.

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

function classifyAdoption(activationRate) {
  if (activationRate >= 0.7) return "high";
  if (activationRate >= 0.4) return "medium";
  return "low";
}

function classifyStickiness(repeatUsageRate) {
  if (repeatUsageRate >= 0.6) return "sticky";
  if (repeatUsageRate >= 0.3) return "moderate";
  return "low-stickiness";
}

function detectFrictionIndicators(metric) {
  const indicators = [];
  if (metric.overrideRate > 0.3) indicators.push("high-override-rate");
  if (metric.dropOffPoints.length > 2) indicators.push("multiple-drop-off-points");
  if (metric.completionRate < 0.5) indicators.push("low-completion-rate");
  return indicators;
}

export function createFeatureSuccessTracker({
  featureSuccessMetric = null,
  userActivityEvent = null,
} = {}) {
  const metricRaw = normalizeObject(featureSuccessMetric);
  const metric = normalizeObject(metricRaw.featureSuccessMetric ?? metricRaw);
  const activity = normalizeObject(userActivityEvent);

  const trackerId = `feature-success-tracker:${Date.now()}`;

  const activationRate = normalizeFiniteNumber(metric.activationRate);
  const repeatUsageRate = normalizeFiniteNumber(metric.repeatUsageRate);
  const completionRate = normalizeFiniteNumber(metric.completionRate);
  const overrideRate = normalizeFiniteNumber(metric.overrideRate);
  const dropOffPoints = normalizeArray(metric.dropOffPoints);

  const adoptionLevel = classifyAdoption(activationRate);
  const stickinessLevel = classifyStickiness(repeatUsageRate);
  const successRate = (activationRate + completionRate) / 2;

  const frictionIndicators = detectFrictionIndicators({
    overrideRate,
    dropOffPoints,
    completionRate,
  });

  return {
    featureSuccessSummary: {
      trackerId,
      featureId: normalizeString(metric.featureId) ?? "unknown-feature",
      adoptionLevel,
      stickinessLevel,
      successRate,
      frictionIndicators,
      rawMetrics: {
        activationRate,
        repeatUsageRate,
        completionRate,
        overrideRate,
      },
      meta: {
        hasFriction: frictionIndicators.length > 0,
        hasActivityData: Object.keys(activity).length > 0,
        isHighAdoption: adoptionLevel === "high",
        isSticky: stickinessLevel === "sticky",
      },
    },
  };
}
