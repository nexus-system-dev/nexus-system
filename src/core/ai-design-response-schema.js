function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeGenerationIntent(aiDesignRequest) {
  return normalizeObject(aiDesignRequest?.generationIntent);
}

function resolveFocusAreas(aiDesignRequest) {
  return normalizeArray(normalizeGenerationIntent(aiDesignRequest).focusAreas)
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function resolveInteractionLabel(cta, generationIntent) {
  const currentLabel = normalizeString(cta?.label);
  if (!currentLabel || currentLabel === "Action") {
    return normalizeString(generationIntent.primaryAction?.label, "Action");
  }
  return currentLabel;
}

function resolveRegionCopyGoal(aiDesignRequest, index) {
  const focusAreas = resolveFocusAreas(aiDesignRequest);
  if (focusAreas.length) {
    return focusAreas[index % focusAreas.length];
  }
  return `Support ${normalizeString(aiDesignRequest?.selectedTask?.summary, "the selected task")}`;
}

function buildRegions(aiDesignRequest) {
  const generationIntent = normalizeGenerationIntent(aiDesignRequest);
  return normalizeArray(aiDesignRequest?.renderableContext?.regionSummary).map((region, index) => ({
    regionId: normalizeString(region?.regionId, `proposal-region-${index + 1}`),
    slot: normalizeString(region?.slot, "content"),
    componentIntent: normalizeString(region?.componentType, "panel"),
    label: normalizeString(region?.role, `Region ${index + 1}`),
    copyGoal: resolveRegionCopyGoal(aiDesignRequest, index),
    stateIntent: normalizeString(
      generationIntent.projectType,
      normalizeString(aiDesignRequest?.screen?.currentPhase, "populated"),
    ),
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
  const generationIntent = normalizeGenerationIntent(normalizedRequest);
  const focusAreas = resolveFocusAreas(normalizedRequest);

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
        proposedText: focusAreas[index]
          ? `${focusAreas[index]} · ${normalizeString(generationIntent.artifactTitle, normalizeString(normalizedRequest.screen?.title, "Generated screen"))}`
          : `${region.label} for ${normalizeString(normalizedRequest.screen?.title, "Generated screen")}`,
      })),
      interactions: normalizeArray(normalizedRequest.renderableContext?.ctaAnchors).map((cta) => ({
        ctaId: normalizeString(cta?.ctaId),
        label: resolveInteractionLabel(cta, generationIntent),
        actionIntent: normalizeString(cta?.actionIntent, generationIntent.primaryAction?.actionIntent ?? "review"),
        anchor: normalizeString(cta?.anchor, "primary"),
      })),
      reasoning: {
        summary: normalizeString(
          normalizedProviderPayload.summary,
          generationIntent.generationGoal
            ?? `Generated from canonical renderable context for ${normalizeString(normalizedRequest.screen?.title, "screen")}.`,
        ),
        source: normalizeString(normalizedProviderPayload.source, "canonical-local-provider"),
      },
    },
  };
}
