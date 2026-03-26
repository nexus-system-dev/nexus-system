function normalizeApprovals(projectState = null) {
  const directApprovals = Array.isArray(projectState?.approvals) ? projectState.approvals : [];
  const decisionApprovals = Array.isArray(projectState?.decisionIntelligence?.approvalRequired)
    ? projectState.decisionIntelligence.approvalRequired
        .map((item) => item?.reason)
        .filter((value) => typeof value === "string" && value.trim())
    : [];

  return [...new Set([...directApprovals, ...decisionApprovals])];
}

function matchesApproval(availableApprovals, requirement) {
  return availableApprovals.some((approval) => approval === requirement || approval.includes(requirement));
}

export function createApprovalReadinessValidator({
  releaseRequirements = null,
  projectState = null,
} = {}) {
  const requiredApprovals = Array.isArray(releaseRequirements?.requiredApprovals)
    ? releaseRequirements.requiredApprovals
    : [];
  const availableApprovals = normalizeApprovals(projectState);
  const missingApprovals = requiredApprovals.filter((approval) => !matchesApproval(availableApprovals, approval));

  return {
    approvalValidation: {
      isReady: missingApprovals.length === 0,
      requiredApprovals,
      availableApprovals,
      missingApprovals,
    },
  };
}
