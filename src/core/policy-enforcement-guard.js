function normalizeDecision(decision) {
  return decision && typeof decision === "object" ? decision : null;
}

function normalizeApprovalStatus(approvalStatus) {
  return approvalStatus && typeof approvalStatus === "object" ? approvalStatus : null;
}

export function createPolicyEnforcementGuard({
  policyDecision,
  approvalStatus,
  deployPolicyDecision = null,
  credentialPolicyDecision = null,
} = {}) {
  const normalizedPolicyDecision = normalizeDecision(policyDecision);
  const normalizedApprovalStatus = normalizeApprovalStatus(approvalStatus);
  const normalizedDeployPolicyDecision = normalizeDecision(deployPolicyDecision);
  const normalizedCredentialPolicyDecision = normalizeDecision(credentialPolicyDecision);
  const reasons = [
    normalizedPolicyDecision?.reason,
    normalizedApprovalStatus?.reason,
    normalizedDeployPolicyDecision?.reason,
    normalizedCredentialPolicyDecision?.reason,
  ].filter(Boolean);
  const blockingSources = [];

  if (normalizedPolicyDecision?.decision === "blocked") {
    blockingSources.push("policy");
  }

  if (normalizedApprovalStatus?.status === "rejected") {
    blockingSources.push("approval");
  }

  if (normalizedDeployPolicyDecision?.decision === "blocked") {
    blockingSources.push("deploy");
  }

  if (normalizedCredentialPolicyDecision?.decision === "blocked") {
    blockingSources.push("credential");
  }

  const approvalRequired =
    normalizedPolicyDecision?.decision === "requires-approval"
    || normalizedApprovalStatus?.status === "missing"
    || normalizedApprovalStatus?.status === "expired"
    || normalizedDeployPolicyDecision?.decision === "requires-approval"
    || normalizedCredentialPolicyDecision?.decision === "requires-approval";

  const blocked = blockingSources.length > 0;
  const decision = blocked
    ? "blocked"
    : approvalRequired
      ? "requires-approval"
      : "allowed";

  return {
    enforcementResult: {
      decision,
      isAllowed: decision === "allowed",
      isBlocked: decision === "blocked",
      requiresApproval: decision === "requires-approval",
      blockingSources,
      reason: reasons[0] ?? "Execution enforcement resolved without explicit reason",
    },
  };
}
