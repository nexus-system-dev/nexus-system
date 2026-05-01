function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function unique(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function normalizeRequestedAction(requestedAction) {
  if (typeof requestedAction === "string" && requestedAction.trim()) {
    return requestedAction.trim();
  }
  if (requestedAction && typeof requestedAction === "object") {
    return requestedAction.actionType ?? requestedAction.workflow ?? requestedAction.action ?? "view";
  }
  return "view";
}

export function createSystemCapabilityResolver({
  systemCapabilityRegistry = null,
  requestedAction = null,
  workspaceModel = null,
} = {}) {
  const normalizedRegistry = normalizeObject(systemCapabilityRegistry);
  const normalizedWorkspace = normalizeObject(workspaceModel);
  const normalizedAction = normalizeRequestedAction(requestedAction);
  const workflowKey = normalizedAction.startsWith("action:") ? normalizedAction : `action:${normalizedAction}`;
  const supportedWorkflows = Array.isArray(normalizedRegistry?.supportedWorkflows) ? normalizedRegistry.supportedWorkflows : [];
  const unsupportedOperations = Array.isArray(normalizedRegistry?.unsupportedOperations) ? normalizedRegistry.unsupportedOperations : [];
  const globalLimits = Array.isArray(normalizedRegistry?.globalLimits) ? normalizedRegistry.globalLimits : [];
  const entry = Array.isArray(normalizedRegistry?.capabilities)
    ? normalizedRegistry.capabilities.find((item) => item.workflow === workflowKey || item.workflow === normalizedAction)
    : null;
  const requestedWorkflow = entry?.workflow ?? (supportedWorkflows.includes(workflowKey) ? workflowKey : normalizedAction);
  const isUnsupported =
    unsupportedOperations.includes(normalizedAction)
    || unsupportedOperations.includes(workflowKey)
    || entry?.supportLevel === "unsupported";
  const requiresApproval = globalLimits.includes("approval-required")
    || globalLimits.includes(normalizedAction)
    || globalLimits.includes(workflowKey);
  const isSupported =
    Boolean(entry)
    || supportedWorkflows.includes(normalizedAction)
    || supportedWorkflows.includes(workflowKey);

  let decision = "unsupported";
  if (isUnsupported) {
    decision = "unsupported";
  } else if (isSupported && requiresApproval) {
    decision = "requires-approval";
  } else if (isSupported) {
    decision = "supported";
  }

  return {
    capabilityDecision: {
      capabilityDecisionId: `capability-decision:${slugify(normalizedRegistry?.systemCapabilityRegistryId)}:${slugify(requestedWorkflow)}`,
      status: normalizedRegistry?.status === "ready" ? "ready" : "missing-inputs",
      requestedAction: normalizedAction,
      requestedWorkflow,
      decision,
      isSupported: decision !== "unsupported",
      requiresApproval: decision === "requires-approval",
      workspaceId: normalizeString(normalizedWorkspace?.workspaceId) ?? null,
      executionModes: Array.isArray(entry?.modes) ? entry.modes : (normalizedRegistry?.executionModes ?? []),
      checks: unique([
        normalizedRegistry?.status !== "ready" ? "registry-missing" : null,
        isUnsupported ? "unsupported-operation" : null,
        requiresApproval ? "approval-required" : null,
        isSupported ? "registry-supported" : null,
      ]),
      reason:
        decision === "unsupported"
          ? `Workflow ${requestedWorkflow} is outside the current Nexus capability boundary.`
          : decision === "requires-approval"
            ? `Workflow ${requestedWorkflow} is supported but currently governed by an approval limit.`
            : `Workflow ${requestedWorkflow} is supported in the current Nexus execution surface.`,
    },
  };
}
