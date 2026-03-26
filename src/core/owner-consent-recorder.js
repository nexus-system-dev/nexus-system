function normalizeConsentAction(consentAction, ownershipPolicy) {
  if (typeof consentAction === "string" && consentAction.trim()) {
    return {
      actionType: consentAction.trim(),
      target: consentAction.trim(),
      approved: true,
    };
  }

  const payload = consentAction && typeof consentAction === "object" ? consentAction : {};
  return {
    actionType: typeof payload.actionType === "string" && payload.actionType.trim()
      ? payload.actionType.trim()
      : "distribution-consent",
    target: typeof payload.target === "string" && payload.target.trim()
      ? payload.target.trim()
      : ownershipPolicy?.distributionTargets?.targets?.[0] ?? "project-distribution",
    approved: payload.approved !== false,
    reason: typeof payload.reason === "string" && payload.reason.trim() ? payload.reason.trim() : null,
  };
}

export function createOwnerConsentRecorder({
  projectId,
  consentAction,
  ownershipPolicy = null,
  existingApprovals = [],
} = {}) {
  const normalizedAction = normalizeConsentAction(consentAction, ownershipPolicy);
  const ownerUserId = ownershipPolicy?.ownerUserId ?? `project-owner:${projectId ?? "unknown-project"}`;
  const existing = Array.isArray(existingApprovals) ? existingApprovals : [];
  const approvalLabel = `${normalizedAction.actionType}:${normalizedAction.target}`;

  return {
    consentRecord: {
      consentId: `consent:${projectId ?? "unknown-project"}:${normalizedAction.actionType}:${normalizedAction.target}`,
      projectId: projectId ?? null,
      ownerUserId,
      actionType: normalizedAction.actionType,
      target: normalizedAction.target,
      approved: normalizedAction.approved,
      reason: normalizedAction.reason,
      status: normalizedAction.approved ? "recorded" : "rejected",
      approvals: [...new Set([...existing, approvalLabel])],
    },
  };
}
