function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDeviceTrustSystem({
  ownerAuthState = null,
  requestContext = null,
} = {}) {
  const deviceId = normalizeString(requestContext?.deviceId, "unknown-device");
  const trustedDeviceIds = normalizeArray(requestContext?.trustedDeviceIds);
  const deviceRiskLevel = normalizeString(requestContext?.deviceRiskLevel, "low");
  const sessionPosture = normalizeString(requestContext?.sessionPosture, "standard");
  const isTrustedDevice = trustedDeviceIds.includes(deviceId);
  const isOwnerScope = ownerAuthState?.isOwner === true;
  const risky = deviceRiskLevel === "high" || sessionPosture === "degraded";

  let decision = "not-required";
  let reason = "Device trust is only evaluated for owner scope";

  if (isOwnerScope && !isTrustedDevice) {
    decision = risky ? "blocked" : "review";
    reason = risky
      ? "Untrusted device posture is too risky for owner mode"
      : "Device must be trusted before owner mode can continue";
  } else if (isOwnerScope) {
    decision = risky ? "review" : "trusted";
    reason = risky ? "Trusted device requires additional review" : "Trusted device posture passed";
  }

  return {
    deviceTrustDecision: {
      deviceTrustDecisionId: `device-trust:${ownerAuthState?.userId ?? "anonymous"}:${deviceId}`,
      decision,
      deviceId,
      isTrustedDevice,
      deviceRiskLevel,
      sessionPosture,
      isOwnerScope,
      checks: [
        isOwnerScope ? "owner-scope" : "non-owner",
        isTrustedDevice ? "trusted-device" : "untrusted-device",
        `risk:${deviceRiskLevel}`,
        `session:${sessionPosture}`,
      ],
      reason,
    },
  };
}
