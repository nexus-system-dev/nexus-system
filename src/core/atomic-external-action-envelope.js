function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function slugify(value) {
  return normalizeString(value, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeExecutionRequest(executionRequest = null) {
  const normalized = normalizeObject(executionRequest);
  const actionType = normalizeString(normalized.actionType)
    ?? normalizeString(normalized.workflow)
    ?? normalizeString(normalized.requestType)
    ?? "project-execution";
  const requestedOperation = normalizeString(normalized.operationType)
    ?? (actionType.includes("deploy") ? "deploy" : "validate");

  return {
    executionRequestId: normalizeString(normalized.executionRequestId)
      ?? `execution-request:${slugify(normalized.projectId)}:${slugify(actionType)}`,
    projectId: normalizeString(normalized.projectId),
    workspaceId: normalizeString(normalized.workspaceId),
    actionType,
    workflow: normalizeString(normalized.workflow, actionType),
    requestedOperation,
    requestPayload: normalizeObject(normalized.requestPayload),
    requestContext: normalizeObject(normalized.requestContext),
    targetSurface: normalizeString(normalized.targetSurface),
    buildTarget: normalizeString(normalized.buildTarget),
  };
}

function normalizeResolvedActionProvider(resolvedActionProvider = null) {
  const normalized = normalizeObject(resolvedActionProvider);
  return {
    providerType: normalizeString(normalized.providerType) ?? normalizeString(normalized.provider) ?? "generic",
    providerStatus: normalizeString(normalized.providerStatus) ?? normalizeString(normalized.status) ?? "unknown",
    executionMode: normalizeString(normalized.executionMode) ?? "manual",
    targetSurface: normalizeString(normalized.targetSurface) ?? normalizeString(normalized.surface) ?? null,
    buildTarget: normalizeString(normalized.buildTarget),
    capabilities: unique(normalized.capabilities),
    operationTypes: unique(normalized.operationTypes),
    credentialReference: normalizeString(normalized.credentialReference),
  };
}

function normalizeExecutionPolicy(executionPolicy = null) {
  const normalized = normalizeObject(executionPolicy);
  return {
    policyDecision: normalizeObject(normalized.policyDecision),
    approvalStatus: normalizeObject(normalized.approvalStatus),
    projectAuthorizationDecision: normalizeObject(normalized.projectAuthorizationDecision),
    credentialPolicyDecision: normalizeObject(normalized.credentialPolicyDecision),
    deployPolicyDecision: normalizeObject(normalized.deployPolicyDecision),
    sandboxDecision: normalizeObject(normalized.sandboxDecision),
    executionModeDecision: normalizeObject(normalized.executionModeDecision),
  };
}

function buildBlockedReasons({ provider, policy }) {
  const reasons = [];

  if (!provider.providerType || provider.providerStatus === "missing") {
    reasons.push("provider-missing");
  }
  if (provider.providerStatus === "degraded" || provider.providerStatus === "disconnected") {
    reasons.push("provider-unavailable");
  }
  if (policy.policyDecision.isBlocked === true || policy.policyDecision.decision === "blocked") {
    reasons.push("policy-blocked");
  }
  if (policy.approvalStatus.status === "rejected") {
    reasons.push("approval-rejected");
  }
  if (policy.approvalStatus.status === "pending") {
    reasons.push("approval-pending");
  }
  if (policy.projectAuthorizationDecision.isBlocked === true || policy.projectAuthorizationDecision.decision === "blocked") {
    reasons.push("authorization-blocked");
  }
  if (policy.credentialPolicyDecision.isBlocked === true || policy.credentialPolicyDecision.decision === "blocked") {
    reasons.push("credential-blocked");
  }
  if (policy.deployPolicyDecision.isBlocked === true || policy.deployPolicyDecision.decision === "blocked") {
    reasons.push("deploy-policy-blocked");
  }
  if (policy.sandboxDecision.allowed === false || policy.sandboxDecision.decision === "blocked") {
    reasons.push("sandbox-blocked");
  }

  return unique(reasons);
}

export function createAtomicExternalActionEnvelope({
  executionRequest = null,
  resolvedActionProvider = null,
  executionPolicy = null,
} = {}) {
  const request = normalizeExecutionRequest(executionRequest);
  const provider = normalizeResolvedActionProvider(resolvedActionProvider);
  const policy = normalizeExecutionPolicy(executionPolicy);
  const blockedReasons = buildBlockedReasons({ provider, policy });
  const canDispatch = blockedReasons.length === 0;
  const idempotencyKey = `external-action:${slugify(request.projectId)}:${slugify(request.workspaceId)}:${slugify(request.actionType)}:${slugify(request.requestedOperation)}`;
  const consistencyKey = `consistency:${slugify(provider.providerType)}:${slugify(request.actionType)}:${slugify(request.executionRequestId)}`;

  return {
    atomicExecutionEnvelope: {
      atomicExecutionEnvelopeId: `atomic-envelope:${slugify(request.executionRequestId)}`,
      executionRequestId: request.executionRequestId,
      projectId: request.projectId,
      workspaceId: request.workspaceId,
      status: canDispatch ? "ready" : "blocked",
      lifecycleStages: ["prepare", "dispatch", "commit", "reconcile", "abort"],
      action: {
        actionType: request.actionType,
        workflow: request.workflow,
        requestedOperation: request.requestedOperation,
        requestPayload: request.requestPayload,
        requestContext: request.requestContext,
      },
      target: {
        providerType: provider.providerType,
        providerStatus: provider.providerStatus,
        targetSurface: provider.targetSurface ?? request.targetSurface ?? null,
        buildTarget: provider.buildTarget ?? request.buildTarget ?? null,
        executionMode: provider.executionMode,
      },
      providerCapabilities: {
        capabilities: provider.capabilities,
        operationTypes: provider.operationTypes,
      },
      policyPosture: {
        policyDecision: policy.policyDecision.decision ?? "unknown",
        approvalStatus: policy.approvalStatus.status ?? "missing",
        authorizationDecision: policy.projectAuthorizationDecision.decision ?? "unknown",
        credentialDecision: policy.credentialPolicyDecision.decision ?? "unknown",
        deployDecision: policy.deployPolicyDecision.decision ?? "unknown",
        sandboxDecision: policy.sandboxDecision.decision ?? "unknown",
        executionMode: policy.executionModeDecision.selectedMode ?? provider.executionMode,
      },
      atomicityContract: {
        idempotencyKey,
        consistencyKey,
        credentialReference: provider.credentialReference ?? null,
        prepareRequired: true,
        reconcileRequired: true,
        abortOnFailure: true,
      },
      blockedReasons,
      canDispatch,
      summary: {
        isAtomicReady: canDispatch,
        targetProvider: provider.providerType,
        targetSurface: provider.targetSurface ?? request.targetSurface ?? null,
        requestedOperation: request.requestedOperation,
      },
    },
  };
}
