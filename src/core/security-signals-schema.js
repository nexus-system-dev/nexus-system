function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function createSecuritySignals({
  rateLimitSignals = null,
  authSignals = null,
  anomalySignals = null,
} = {}) {
  const normalizedRateLimitSignals = normalizeObject(rateLimitSignals);
  const normalizedAuthSignals = normalizeObject(authSignals);
  const normalizedAnomalySignals = normalizeObject(anomalySignals);
  const authFailures = normalizeNumber(
    normalizedAuthSignals.authFailures ?? normalizedRateLimitSignals.authFailures,
    0,
  );
  const burstDetected = normalizeBoolean(normalizedRateLimitSignals.burstDetected, false);
  const routeScanningDetected = normalizeBoolean(normalizedRateLimitSignals.routeScanningDetected, false);
  const suspiciousActivity = normalizeBoolean(
    normalizedAnomalySignals.suspiciousActivity,
    false,
  ) || burstDetected
    || routeScanningDetected
    || authFailures >= 3;

  return {
    securitySignals: {
      suspiciousActivity,
      authFailures,
      burstDetected,
      routeScanningDetected,
    },
  };
}
