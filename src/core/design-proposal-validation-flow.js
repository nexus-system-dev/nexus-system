function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDesignProposalValidationFlow({
  renderableDesignProposal = null,
  screenTemplateSchema = null,
  screenValidationChecklist = null,
  screenContract = null,
} = {}) {
  const normalizedProposal = normalizeObject(renderableDesignProposal);
  const normalizedContract = normalizeObject(screenContract);
  const normalizedChecklist = normalizeObject(screenValidationChecklist);
  const proposalRegions = normalizeArray(normalizedProposal.regions);
  const allowedRegionCount = normalizeArray(normalizedContract.regions).length;
  const issues = [];

  if (!normalizedProposal.proposalId) {
    issues.push("missing-proposal-id");
  }
  if (proposalRegions.length === 0) {
    issues.push("missing-regions");
  }
  if (allowedRegionCount > 0 && proposalRegions.length > allowedRegionCount) {
    issues.push("region-overflow");
  }

  return {
    designProposalValidation: {
      validationId: `design-proposal-validation:${normalizedProposal.proposalId ?? "unknown"}`,
      proposalId: normalizedProposal.proposalId ?? null,
      status: issues.length === 0 ? "valid" : "invalid",
      issues,
      summary: {
        isValid: issues.length === 0,
        regionCount: proposalRegions.length,
        checklistSignalCount: Object.keys(normalizedChecklist.signals ?? {}).length,
        hasTemplateSchema: Boolean(normalizeObject(screenTemplateSchema).templateId),
      },
    },
  };
}
