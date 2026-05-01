function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildRegions(aiDesignRequest) {
  return normalizeArray(aiDesignRequest?.renderableContext?.regionSummary).map((region, index) => ({
    regionId: normalizeString(region?.regionId, `proposal-region-${index + 1}`),
    slot: normalizeString(region?.slot, "content"),
    componentIntent: normalizeString(region?.componentType, "panel"),
    label: normalizeString(region?.role, `Region ${index + 1}`),
    copyGoal: `Support ${normalizeString(aiDesignRequest?.selectedTask?.summary, "the selected task")}`,
    stateIntent: normalizeString(aiDesignRequest?.screen?.currentPhase, "populated"),
    constraints: normalizeObject(region?.constraints),
  }));
}

export function defineAiDesignResponseSchema({
  aiDesignRequest = null,
  providerPayload = null,
} = {}) {
  const normalizedRequest = normalizeObject(aiDesignRequest);
  const normalizedProviderPayload = normalizeObject(providerPayload);
  const screenId = normalizeString(normalizedRequest.screen?.screenId, "unknown-screen");
  const proposalId = `ai-design-proposal:${screenId}`;
  const regions = buildRegions(normalizedRequest);

  return {
    aiDesignProposal: {
      proposalId,
      requestId: normalizeString(normalizedRequest.requestId),
      screenId,
      screenType: normalizeString(normalizedRequest.screen?.screenType, "detail"),
      regions,
      copy: regions.map((region, index) => ({
        copyId: `proposal-copy-${index + 1}`,
        regionId: region.regionId,
        field: "body",
        proposedText: `${region.label} for ${normalizeString(normalizedRequest.screen?.title, "Generated screen")}`,
      })),
      interactions: normalizeArray(normalizedRequest.renderableContext?.ctaAnchors).map((cta) => ({
        ctaId: normalizeString(cta?.ctaId),
        label: normalizeString(cta?.label, "Action"),
        actionIntent: normalizeString(cta?.actionIntent, "review"),
        anchor: normalizeString(cta?.anchor, "primary"),
      })),
      reasoning: {
        summary: normalizeString(
          normalizedProviderPayload.summary,
          `Generated from canonical renderable context for ${normalizeString(normalizedRequest.screen?.title, "screen")}.`,
        ),
        source: normalizeString(normalizedProviderPayload.source, "canonical-local-provider"),
      },
    },
  };
}
