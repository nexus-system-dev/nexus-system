function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function createActiveBottleneck({
  bottleneckId,
  blockerType,
  severity,
  affectedFlow,
  owner,
  reason,
  source,
  unblockConditions = [],
}) {
  return {
    bottleneckId,
    blockerType,
    severity,
    affectedFlow,
    owner,
    reason,
    source,
    unblockConditions,
    summary: {
      isBlocking: blockerType !== "none",
      needsUserAction: owner === "user" || owner === "workspace-owner",
    },
  };
}

export function createActiveBottleneckResolver({
  bottleneckState = null,
  approvalStatus = null,
  policyDecision = null,
  credentialPolicyDecision = null,
  releaseStatus = null,
} = {}) {
  const normalizedBottleneckState = normalizeObject(bottleneckState);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedPolicyDecision = normalizeObject(policyDecision);
  const normalizedCredentialPolicyDecision = normalizeObject(credentialPolicyDecision);
  const normalizedReleaseStatus = normalizeObject(releaseStatus);

  if (normalizedApprovalStatus.status === "rejected" || normalizedApprovalStatus.status === "missing") {
    return {
      activeBottleneck: createActiveBottleneck({
        bottleneckId: `active-bottleneck:approval:${normalizedApprovalStatus.approvalRecordId ?? "pending"}`,
        blockerType: "approval-blocker",
        severity: "high",
        affectedFlow: "approval",
        owner: "user",
        reason: normalizedApprovalStatus.reason ?? "Required approval is missing or rejected",
        source: "approval-status",
        unblockConditions: ["approve-request", "replace-blocked-action"],
      }),
    };
  }

  if (normalizedPolicyDecision.isBlocked === true || normalizedPolicyDecision.decision === "blocked") {
    return {
      activeBottleneck: createActiveBottleneck({
        bottleneckId: `active-bottleneck:policy:${normalizedPolicyDecision.policyId ?? "blocked"}`,
        blockerType: "policy-blocker",
        severity: "high",
        affectedFlow: "policy",
        owner: "workspace-owner",
        reason: normalizedPolicyDecision.reason ?? "Current execution path is blocked by policy",
        source: "policy-decision",
        unblockConditions: ["change-execution-path", "update-policy"],
      }),
    };
  }

  if (normalizedCredentialPolicyDecision.decision === "blocked") {
    return {
      activeBottleneck: createActiveBottleneck({
        bottleneckId: `active-bottleneck:credential:${normalizedCredentialPolicyDecision.policyId ?? "blocked"}`,
        blockerType: "credential-blocker",
        severity: "high",
        affectedFlow: "credentials",
        owner: "workspace-owner",
        reason: normalizedCredentialPolicyDecision.reason ?? "Credential usage is blocked",
        source: "credential-policy",
        unblockConditions: ["fix-credential-policy", "provide-approved-credential"],
      }),
    };
  }

  if (normalizedReleaseStatus.status === "blocked" || normalizedReleaseStatus.status === "failed") {
    return {
      activeBottleneck: createActiveBottleneck({
        bottleneckId: `active-bottleneck:release:${normalizedReleaseStatus.releaseRunId ?? "blocked"}`,
        blockerType: "release-blocker",
        severity: "high",
        affectedFlow: "release",
        owner: "ops",
        reason: normalizedReleaseStatus.summary ?? normalizedReleaseStatus.status ?? "Release is blocked",
        source: "release-status",
        unblockConditions: ["fix-release-validation", "resolve-release-blockers"],
      }),
    };
  }

  return {
    activeBottleneck: createActiveBottleneck({
      bottleneckId: normalizedBottleneckState.bottleneckId ?? "active-bottleneck:none",
      blockerType: normalizedBottleneckState.blockerType ?? "none",
      severity: normalizedBottleneckState.severity ?? "low",
      affectedFlow: normalizedBottleneckState.affectedFlow ?? "execution",
      owner: normalizedBottleneckState.owner ?? "system",
      reason: normalizedBottleneckState.reason ?? "No active bottleneck detected",
      source: "bottleneck-state",
      unblockConditions: normalizedBottleneckState.unblockConditions ?? [],
    }),
  };
}
