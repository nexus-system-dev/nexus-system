function normalizeDecision(decision) {
  return decision && typeof decision === "object" ? decision : {};
}

function normalizeApprovalStatus(approvalStatus) {
  return approvalStatus && typeof approvalStatus === "object" ? approvalStatus : {};
}

function isPrivilegedCapability(requiredCapability) {
  return ["deploy", "approve", "connectAccounts", "manageCredentials"].includes(requiredCapability);
}

function isBillingAction(projectAction) {
  return typeof projectAction === "string" && projectAction.includes("billing");
}

function buildChecks({
  projectAuthorizationDecision,
  approvalStatus,
  deployPolicyDecision,
  credentialPolicyDecision,
} = {}) {
  const checks = [];

  if (projectAuthorizationDecision.isBlocked === true) {
    checks.push("authorization-blocked");
  }

  if (projectAuthorizationDecision.requiresApproval === true) {
    checks.push("authorization-requires-approval");
  }

  if (deployPolicyDecision.isBlocked === true) {
    checks.push("deploy-policy-blocked");
  } else if (deployPolicyDecision.requiresApproval === true) {
    checks.push("deploy-policy-requires-approval");
  }

  if (credentialPolicyDecision.isBlocked === true) {
    checks.push("credential-policy-blocked");
  } else if (credentialPolicyDecision.requiresApproval === true) {
    checks.push("credential-policy-requires-approval");
  }

  if (approvalStatus.status === "rejected") {
    checks.push("approval-rejected");
  } else if (approvalStatus.status === "pending" || approvalStatus.status === "missing") {
    checks.push("approval-not-resolved");
  }

  return checks;
}

export function createPrivilegedActionAuthorityResolver({
  projectAuthorizationDecision = null,
  approvalStatus = null,
  deployPolicyDecision = null,
  credentialPolicyDecision = null,
} = {}) {
  const normalizedProjectAuthorizationDecision = normalizeDecision(projectAuthorizationDecision);
  const normalizedApprovalStatus = normalizeApprovalStatus(approvalStatus);
  const normalizedDeployPolicyDecision = normalizeDecision(deployPolicyDecision);
  const normalizedCredentialPolicyDecision = normalizeDecision(credentialPolicyDecision);
  const projectAction = normalizedProjectAuthorizationDecision.projectAction ?? "view";
  const requiredCapability = normalizedProjectAuthorizationDecision.requiredCapability ?? "view";
  const privilegedAction =
    isPrivilegedCapability(requiredCapability)
    || projectAction === "approval-override"
    || isBillingAction(projectAction);

  const checks = buildChecks({
    projectAuthorizationDecision: normalizedProjectAuthorizationDecision,
    approvalStatus: normalizedApprovalStatus,
    deployPolicyDecision: normalizedDeployPolicyDecision,
    credentialPolicyDecision: normalizedCredentialPolicyDecision,
  });

  let decision = privilegedAction ? "allowed" : "not-required";

  if (normalizedProjectAuthorizationDecision.isBlocked === true) {
    decision = "blocked";
  } else if (
    checks.includes("approval-rejected")
    || checks.includes("deploy-policy-blocked")
    || checks.includes("credential-policy-blocked")
  ) {
    decision = "blocked";
  } else if (
    normalizedProjectAuthorizationDecision.requiresApproval === true
    || checks.includes("deploy-policy-requires-approval")
    || checks.includes("credential-policy-requires-approval")
  ) {
    decision = normalizedApprovalStatus.status === "approved" ? "allowed" : "requires-approval";
  } else if (
    privilegedAction
    && normalizedApprovalStatus.status === "approved"
  ) {
    decision = "allowed";
  } else if (privilegedAction && normalizedApprovalStatus.status === "pending") {
    decision = "requires-approval";
  }

  return {
    privilegedAuthorityDecision: {
      privilegedAuthorityDecisionId: `privileged-authority:${projectAction}`,
      projectAction,
      requiredCapability,
      decision,
      isPrivilegedAction: privilegedAction,
      isAllowed: decision === "allowed" || decision === "not-required",
      requiresApproval: decision === "requires-approval",
      isBlocked: decision === "blocked",
      checks,
      reason:
        decision === "blocked"
          ? normalizedDeployPolicyDecision.reason
            ?? normalizedCredentialPolicyDecision.reason
            ?? normalizedProjectAuthorizationDecision.reason
            ?? normalizedApprovalStatus.reason
            ?? `Privileged action ${projectAction} is blocked`
          : decision === "requires-approval"
            ? normalizedDeployPolicyDecision.reason
              ?? normalizedCredentialPolicyDecision.reason
              ?? normalizedProjectAuthorizationDecision.reason
              ?? "Privileged action requires approval"
            : decision === "not-required"
              ? `Action ${projectAction} does not require privileged authority`
              : `Privileged action ${projectAction} is authorized`,
    },
  };
}
