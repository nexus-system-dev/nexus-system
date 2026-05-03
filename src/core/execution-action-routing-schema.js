function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function slugify(value) {
  return normalizeString(value, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveRouteType(actionType, requestedOperation) {
  const action = normalizeString(actionType, "project-execution");
  const operation = normalizeString(requestedOperation, "validate");

  if (action.includes("design") || operation === "import-design") {
    return "design-tool-import";
  }
  if (action.includes("repo") || action.includes("source-control")) {
    return "source-control";
  }
  if (operation === "deploy" || action.includes("deploy")) {
    return "provider-runtime";
  }

  return "sandbox-validation";
}

function buildRouteCandidates({
  routeType,
  providerType,
  targetSurface,
  operationTypes,
  sourceControlIntegration,
  designToolImportAdapter,
}) {
  const candidates = [];

  if (routeType === "design-tool-import") {
    candidates.push({
      routeId: `route:${slugify(providerType)}:design-tool-import`,
      providerType,
      routeType,
      targetSurface,
      readinessStatus: normalizeString(designToolImportAdapter.status, "missing-inputs"),
      requestedOperation: "import-design",
    });
  } else if (routeType === "source-control") {
    candidates.push({
      routeId: `route:${slugify(providerType)}:source-control`,
      providerType,
      routeType,
      targetSurface,
      readinessStatus: normalizeString(sourceControlIntegration.status, "missing-inputs"),
      requestedOperation: "sync-repository",
    });
  } else {
    candidates.push({
      routeId: `route:${slugify(providerType)}:${slugify(routeType)}`,
      providerType,
      routeType,
      targetSurface,
      readinessStatus: "ready",
      requestedOperation: operationTypes[0] ?? "validate",
    });
  }

  return candidates;
}

function buildBlockedReasons({
  routeType,
  sourceControlIntegration,
  designToolImportAdapter,
  connectorCredentialBinding,
  externalProviderHealthAndFailover,
}) {
  const blockedReasons = [];

  if (routeType === "design-tool-import" && normalizeString(designToolImportAdapter.status) === "blocked") {
    blockedReasons.push("design-tool-import-blocked");
  }

  if (routeType === "source-control" && normalizeString(sourceControlIntegration.status) !== "ready") {
    blockedReasons.push("source-control-unavailable");
  }

  if (routeType === "provider-runtime" && connectorCredentialBinding.summary?.safeForRuntimeUse !== true) {
    blockedReasons.push("connector-binding-unsafe");
  }

  if (routeType === "provider-runtime" && normalizeString(externalProviderHealthAndFailover.integrationStatus) === "blocked") {
    blockedReasons.push("provider-health-blocked");
  }

  return blockedReasons;
}

export function defineExecutionActionRoutingSchema({
  executionRequest = null,
  sourceControlIntegration = null,
  designToolImportAdapter = null,
  connectorCredentialBinding = null,
  externalProviderHealthAndFailover = null,
  providerSession = null,
  providerAdapter = null,
  providerOperations = [],
  executionModeDecision = null,
  sandboxDecision = null,
} = {}) {
  const request = normalizeObject(executionRequest);
  const sourceControl = normalizeObject(sourceControlIntegration);
  const designImport = normalizeObject(designToolImportAdapter);
  const binding = normalizeObject(connectorCredentialBinding);
  const providerHealth = normalizeObject(externalProviderHealthAndFailover);
  const session = normalizeObject(providerSession);
  const adapter = normalizeObject(providerAdapter);
  const modeDecision = normalizeObject(executionModeDecision);
  const sandbox = normalizeObject(sandboxDecision);
  const actionType = normalizeString(request.actionType, "project-execution");
  const requestedOperation = normalizeString(request.operationType, normalizeString(request.requestedOperation, "validate"));
  const routeType = resolveRouteType(actionType, requestedOperation);
  const providerType = normalizeString(adapter.provider, normalizeString(session.providerType, "generic"));
  const targetSurface = normalizeString(sandbox.selectedSurface, normalizeString(modeDecision.selectedMode, "manual"));
  const operationTypes = normalizeArray(providerOperations).map((operation) =>
    normalizeString(operation?.operationType, null),
  ).filter(Boolean);
  const routeCandidates = buildRouteCandidates({
    routeType,
    providerType,
    targetSurface,
    operationTypes,
    sourceControlIntegration: sourceControl,
    designToolImportAdapter: designImport,
  });
  const blockedReasons = buildBlockedReasons({
    routeType,
    sourceControlIntegration: sourceControl,
    designToolImportAdapter: designImport,
    connectorCredentialBinding: binding,
    externalProviderHealthAndFailover: providerHealth,
  });
  const resolvedOperation = routeType === "design-tool-import"
    ? "import-design"
    : routeType === "source-control"
      ? "sync-repository"
      : requestedOperation;

  return {
    executionActionRouting: {
      executionActionRoutingId: `execution-action-routing:${slugify(request.executionRequestId ?? actionType)}`,
      status: blockedReasons.length === 0 ? "ready" : "blocked",
      actionType,
      workflow: normalizeString(request.workflow, actionType),
      requestedOperation: resolvedOperation,
      routeType,
      routeCandidates,
      resolvedRoute: {
        providerType,
        targetSurface,
        executionMode: normalizeString(modeDecision.selectedMode, "manual"),
        requestedOperation: resolvedOperation,
        routeType,
      },
      blockedReasons,
      summary: {
        isRoutable: blockedReasons.length === 0,
        routeCandidateCount: routeCandidates.length,
        requiresProviderRuntime: routeType === "provider-runtime",
        usesDesignToolImport: routeType === "design-tool-import",
      },
    },
  };
}
