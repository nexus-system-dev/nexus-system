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

function buildMissingInputs(productBoundaryModel) {
  const missingInputs = [];
  if (!normalizeString(productBoundaryModel?.productBoundaryModelId)) {
    missingInputs.push("productBoundaryModel");
  }
  return missingInputs;
}

function buildCapabilityEntries(productBoundaryModel, capabilityLimitMap, executionModes) {
  const supportedWorkflows = Array.isArray(productBoundaryModel?.supportedWorkflows)
    ? productBoundaryModel.supportedWorkflows
    : [];
  const unsupportedOperations = Array.isArray(productBoundaryModel?.unsupportedOperations)
    ? productBoundaryModel.unsupportedOperations
    : [];
  const limits = Array.isArray(capabilityLimitMap?.limits) ? capabilityLimitMap.limits : [];
  const modes = Array.isArray(executionModes) ? executionModes : [];

  return unique([
    ...supportedWorkflows.map((workflow) => ({
      capabilityId: `capability:${slugify(workflow)}`,
      workflow: workflow,
      executionClass: workflow.startsWith("action:") ? "action" : "workflow",
      supportLevel: unsupportedOperations.includes(workflow) ? "unsupported" : "supported",
      modes,
      limits: limits.filter((limit) => limit !== workflow),
    })),
  ]);
}

export function defineSystemCapabilityRegistrySchema({
  productBoundaryModel = null,
  capabilityLimitMap = null,
  executionModes = [],
} = {}) {
  const normalizedBoundary = normalizeObject(productBoundaryModel);
  const normalizedLimitMap = normalizeObject(capabilityLimitMap);
  const missingInputs = buildMissingInputs(normalizedBoundary);
  const capabilityEntries = buildCapabilityEntries(normalizedBoundary, normalizedLimitMap, executionModes);

  return {
    systemCapabilityRegistry: {
      systemCapabilityRegistryId: `system-capability-registry:${slugify(
        normalizedBoundary?.productBoundaryModelId ?? normalizedLimitMap?.capabilityLimitMapId,
      )}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      automationClass: normalizedBoundary?.automationClass ?? "governed-automation",
      supportedWorkflows: Array.isArray(normalizedBoundary?.supportedWorkflows) ? normalizedBoundary.supportedWorkflows : [],
      unsupportedOperations: Array.isArray(normalizedBoundary?.unsupportedOperations) ? normalizedBoundary.unsupportedOperations : [],
      globalLimits: Array.isArray(normalizedLimitMap?.limits) ? normalizedLimitMap.limits : [],
      executionModes: Array.isArray(executionModes) ? executionModes : [],
      capabilities: capabilityEntries,
      summary: {
        supportedCount: capabilityEntries.filter((entry) => entry.supportLevel === "supported").length,
        unsupportedCount: capabilityEntries.filter((entry) => entry.supportLevel === "unsupported").length,
      },
    },
  };
}
