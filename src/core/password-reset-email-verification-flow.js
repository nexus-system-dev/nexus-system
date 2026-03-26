function createFlowId(flowType, userId) {
  return `${flowType}-${userId ?? "anonymous"}-${Date.now()}`;
}

function resolveFlowType(verificationRequest) {
  if (typeof verificationRequest?.flowType === "string" && verificationRequest.flowType) {
    return verificationRequest.flowType;
  }

  if (verificationRequest?.type === "password-reset") {
    return "password-reset";
  }

  return "email-verification";
}

function resolveIssuedAt(verificationRequest) {
  if (typeof verificationRequest?.requestedAt === "string") {
    return verificationRequest.requestedAt;
  }

  return new Date().toISOString();
}

function resolveExpiresAt(issuedAt, verificationRequest) {
  if (typeof verificationRequest?.expiresAt === "string") {
    return verificationRequest.expiresAt;
  }

  const ttlMs = Number.isFinite(verificationRequest?.expiresInMs)
    ? verificationRequest.expiresInMs
    : 30 * 60 * 1000;

  return new Date(new Date(issuedAt).getTime() + ttlMs).toISOString();
}

export function createPasswordResetAndEmailVerificationFlow({
  userIdentity = null,
  verificationRequest = null,
} = {}) {
  const flowType = resolveFlowType(verificationRequest);
  const email = userIdentity?.email ?? verificationRequest?.email ?? null;
  const issuedAt = resolveIssuedAt(verificationRequest);
  const expiresAt = resolveExpiresAt(issuedAt, verificationRequest);
  const isExpired = new Date(expiresAt).getTime() <= Date.now();
  const isCompleted = verificationRequest?.completed === true;
  const isVerified = userIdentity?.verificationStatus === "verified";
  const canDeliver = typeof email === "string" && email.length > 0;

  let status = "pending";
  if (!canDeliver) {
    status = "unavailable";
  } else if (flowType === "email-verification" && isVerified && !verificationRequest) {
    status = "verified";
  } else if (isCompleted && flowType === "email-verification") {
    status = "verified";
  } else if (isCompleted) {
    status = "completed";
  } else if (isExpired) {
    status = "expired";
  }

  const requestToken = status === "pending"
    ? `${flowType}-token-${userIdentity?.userId ?? "anonymous"}`
    : null;

  const nextActions = [];
  if (status === "pending") {
    nextActions.push(flowType === "password-reset" ? "complete-password-reset" : "confirm-email-verification");
  }
  if (status === "expired") {
    nextActions.push("request-new-verification-link");
  }
  if (status === "unavailable") {
    nextActions.push("add-email-address");
  }

  return {
    verificationFlowState: {
      flowId: createFlowId(flowType, userIdentity?.userId),
      flowType,
      status,
      email,
      requestToken,
      issuedAt: canDeliver ? issuedAt : null,
      expiresAt: canDeliver ? expiresAt : null,
      isExpired: canDeliver ? isExpired : false,
      deliveryChannel: canDeliver ? "email" : null,
      notificationState: canDeliver && status === "pending" ? "queued" : "idle",
      requiresAction: status === "pending" || status === "expired" || status === "unavailable",
      nextActions,
      userId: userIdentity?.userId ?? null,
    },
  };
}
