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

function buildWorkflowAreas(productBoundaryModel, agentGovernancePolicy) {
  const supported = Array.isArray(productBoundaryModel?.supportedWorkflows)
    ? productBoundaryModel.supportedWorkflows
    : [];
  const allowedTools = Array.isArray(agentGovernancePolicy?.allowedTools)
    ? agentGovernancePolicy.allowedTools
    : [];

  return unique([
    "analysis",
    "planning",
    supported.some((item) => item.includes("deploy")) ? "delivery" : null,
    allowedTools.includes("run-local-command") ? "execution" : null,
    allowedTools.includes("request-approval") ? "approval" : null,
  ]);
}

function buildPromises(productBoundaryModel, agentGovernancePolicy) {
  const sandboxLevel = normalizeString(agentGovernancePolicy?.sandboxLevel) ?? "read-only";
  const automationClass = normalizeString(productBoundaryModel?.automationClass) ?? "governed-automation";

  return unique([
    "Nexus explains what it can and cannot execute.",
    "Nexus keeps execution inside explicit governance boundaries.",
    automationClass === "autonomous-execution" ? "Nexus can auto-execute low-risk workflows." : null,
    sandboxLevel === "controlled-write" || sandboxLevel === "privileged"
      ? "Nexus can modify project state within the allowed execution surface."
      : "Nexus stays read-only unless a higher execution surface is granted.",
  ]);
}

function buildLimits(productBoundaryModel, agentGovernancePolicy) {
  const unsupported = Array.isArray(productBoundaryModel?.unsupportedOperations)
    ? productBoundaryModel.unsupportedOperations
    : [];
  const sandboxLevel = normalizeString(agentGovernancePolicy?.sandboxLevel) ?? "read-only";
  return unique([
    ...unsupported,
    `sandbox:${sandboxLevel}`,
    productBoundaryModel?.automationPolicy?.requiresApproval === true ? "approval-required" : null,
  ]);
}

export function createCapabilityPromiseAndLimitMap({
  productBoundaryModel = null,
  agentGovernancePolicy = null,
} = {}) {
  const normalizedBoundary = normalizeObject(productBoundaryModel);
  const normalizedGovernance = normalizeObject(agentGovernancePolicy);
  const missingInputs = [];

  if (!normalizeString(normalizedBoundary?.productBoundaryModelId)) {
    missingInputs.push("productBoundaryModel");
  }
  if (!normalizeString(normalizedGovernance?.agentGovernancePolicyId)) {
    missingInputs.push("agentGovernancePolicy");
  }

  const workflowAreas = buildWorkflowAreas(normalizedBoundary, normalizedGovernance);
  const promises = buildPromises(normalizedBoundary, normalizedGovernance);
  const limits = buildLimits(normalizedBoundary, normalizedGovernance);

  return {
    capabilityLimitMap: {
      capabilityLimitMapId: `capability-limit-map:${slugify(
        normalizedBoundary?.productBoundaryModelId ?? normalizedGovernance?.agentGovernancePolicyId,
      )}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      workflowAreas,
      promises,
      limits,
      disclaimers: unique([
        "Final product and business accountability remains with the user.",
        normalizedBoundary?.automationPolicy?.requiresApproval === true
          ? "High-risk actions may require explicit approval before execution."
          : null,
      ]),
      nonGoals: unique([
        "Nexus does not replace final business judgment.",
        "Nexus does not bypass policy, approval, or sandbox constraints.",
      ]),
    },
  };
}
