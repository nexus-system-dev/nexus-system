function normalizeRequestedBy(requestedBy) {
  if (typeof requestedBy === "string" && requestedBy.trim()) {
    return requestedBy.trim();
  }
  if (requestedBy && typeof requestedBy === "object") {
    return requestedBy.userId ?? requestedBy.actorId ?? requestedBy.email ?? null;
  }
  return null;
}

export function createRotationRequestSchema(rotationRequest = null) {
  const input = rotationRequest && typeof rotationRequest === "object" ? rotationRequest : {};
  const nextCredentialValue = input.newValue ?? input.credentialValue ?? input.payload ?? null;
  const hasNextValue = typeof nextCredentialValue === "string"
    ? nextCredentialValue.trim().length > 0
    : nextCredentialValue !== null && nextCredentialValue !== undefined;

  const normalizedRotationRequest = {
    requestedBy: normalizeRequestedBy(input.requestedBy),
    reason: typeof input.reason === "string" && input.reason.trim()
      ? input.reason.trim()
      : "credential-rotation-requested",
    mode: typeof input.mode === "string" && input.mode.trim()
      ? input.mode.trim()
      : "manual",
    nextCredentialValue: hasNextValue ? nextCredentialValue : null,
  };

  if (!hasNextValue) {
    return {
      rotationRequest: normalizedRotationRequest,
      validationError: {
        code: "missing-next-secret-payload",
        message: "Rotation request requires a new credential value or payload",
        failedAt: "re-encryption",
      },
    };
  }

  return {
    rotationRequest: normalizedRotationRequest,
    validationError: null,
  };
}
