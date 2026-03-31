import crypto from "node:crypto";

function normalizeUserId(userId) {
  return typeof userId === "string" && userId.trim() ? userId.trim() : null;
}

export function createRolloutHashUtility({
  userId = null,
  flagId = null,
} = {}) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedFlagId = typeof flagId === "string" && flagId.trim() ? flagId.trim() : "feature-flag";
  if (!normalizedUserId) {
    return {
      hashBucket: null,
      isDeterministic: false,
    };
  }

  const digest = crypto.createHash("sha256").update(`${normalizedFlagId}:${normalizedUserId}`).digest("hex");
  const bucket = Number.parseInt(digest.slice(0, 8), 16) % 100;

  return {
    hashBucket: bucket,
    isDeterministic: true,
  };
}
