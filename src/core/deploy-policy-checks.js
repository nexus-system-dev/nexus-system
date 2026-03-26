function normalizeDeploymentRequest(deploymentRequest) {
  return deploymentRequest && typeof deploymentRequest === "object" ? deploymentRequest : {};
}

function normalizeProjectState(projectState) {
  return projectState && typeof projectState === "object" ? projectState : {};
}

function createDecision({
  decision,
  reason,
  checks,
  target,
  environment,
} = {}) {
  return {
    deployPolicyDecision: {
      decision,
      isAllowed: decision === "allowed",
      requiresApproval: decision === "requires-approval",
      isBlocked: decision === "blocked",
      reason,
      target,
      environment,
      checks,
    },
  };
}

export function createDeployPolicyChecks({
  deploymentRequest,
  projectState,
} = {}) {
  const normalizedRequest = normalizeDeploymentRequest(deploymentRequest);
  const normalizedProjectState = normalizeProjectState(projectState);
  const target = normalizedRequest.target ?? null;
  const environment = normalizedRequest.environment ?? "staging";
  const buildArtifacts = Array.isArray(normalizedRequest.buildArtifacts)
    ? normalizedRequest.buildArtifacts.filter(Boolean)
    : [];
  const approvalStatus = normalizedProjectState.approvalStatus ?? null;
  const guardResult = normalizedProjectState.guardResult ?? null;
  const validationReport = normalizedProjectState.validationReport ?? null;
  const credentialPolicyDecision = normalizedProjectState.credentialPolicyDecision ?? null;
  const checks = [];

  if (!buildArtifacts.length) {
    checks.push("missing-build-artifacts");
  }

  if (validationReport?.isReady === false) {
    checks.push("release-validation-blocked");
  }

  if (guardResult?.isAllowed === false) {
    checks.push("ownership-guard-blocked");
  }

  if (credentialPolicyDecision?.isBlocked === true) {
    checks.push("credential-policy-blocked");
  }

  if (environment === "production" && approvalStatus?.status !== "approved") {
    checks.push("production-approval-required");
  }

  if (approvalStatus?.status === "rejected") {
    checks.push("approval-rejected");
  }

  if (checks.includes("approval-rejected") || checks.includes("ownership-guard-blocked") || checks.includes("credential-policy-blocked")) {
    return createDecision({
      decision: "blocked",
      reason:
        guardResult?.reason
        ?? credentialPolicyDecision?.reason
        ?? approvalStatus?.reason
        ?? "Deploy policy blocked this deployment",
      checks,
      target,
      environment,
    });
  }

  if (checks.includes("production-approval-required")) {
    return createDecision({
      decision: "requires-approval",
      reason: approvalStatus?.reason ?? "Production deploy requires a valid approval",
      checks,
      target,
      environment,
    });
  }

  if (checks.length > 0) {
    return createDecision({
      decision: "blocked",
      reason: validationReport?.summary ?? "Deploy policy detected unmet deployment conditions",
      checks,
      target,
      environment,
    });
  }

  return createDecision({
    decision: "allowed",
    reason: `Deployment to ${environment} for ${target ?? "unknown target"} passed policy checks`,
    checks,
    target,
    environment,
  });
}
