function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildRegionSummary(renderableScreenModel) {
  return normalizeArray(renderableScreenModel?.regions).map((region, index) => {
    const normalizedRegion = normalizeObject(region);
    return {
      regionId: normalizeString(normalizedRegion.regionId, `region-${index + 1}`),
      slot: normalizeString(normalizedRegion.slot, normalizedRegion.slotKey ?? "content"),
      componentType: normalizeString(normalizedRegion.componentType, "panel"),
      role: normalizeString(normalizedRegion.role, normalizedRegion.slot ?? "content"),
      constraints: normalizeObject(normalizedRegion.constraints),
    };
  });
}

export function defineAiDesignRequestSchema({
  projectId = null,
  selectedTask = null,
  screenContract = null,
  renderableScreenModel = null,
  renderableScreenComposition = null,
  screenFlowMap = null,
  screenStates = null,
  designTokens = null,
  componentContract = null,
  slimmedContextPayload = null,
} = {}) {
  const normalizedScreenContract = normalizeObject(screenContract);
  const normalizedScreenModel = normalizeObject(renderableScreenModel);
  const normalizedComposition = normalizeObject(renderableScreenComposition);
  const normalizedSelectedTask = normalizeObject(selectedTask);

  const screenId = normalizeString(
    normalizedScreenContract.screenId,
    normalizeString(normalizedScreenModel.screenId, normalizedComposition.screenId ?? "unknown-screen"),
  );

  return {
    aiDesignRequest: {
      requestId: `ai-design-request:${normalizeString(projectId, "unknown-project")}:${screenId}`,
      projectId: normalizeString(projectId),
      selectedTask: {
        taskId: normalizeString(normalizedSelectedTask.id),
        summary: normalizeString(normalizedSelectedTask.summary),
        lane: normalizeString(normalizedSelectedTask.lane),
        taskType: normalizeString(normalizedSelectedTask.taskType),
      },
      screen: {
        screenId,
        screenType: normalizeString(normalizedScreenContract.screenType, normalizedScreenModel.screenType ?? "detail"),
        title: normalizeString(normalizedScreenContract.title, normalizedScreenModel.title ?? "Generated screen"),
        flowId: normalizeString(screenFlowMap?.defaultFlowId, normalizedComposition.flowId),
        currentPhase: normalizeString(normalizedComposition.currentPhase, "populated"),
      },
      renderableContext: {
        modelId: normalizeString(normalizedScreenModel.modelId),
        compositionId: normalizeString(normalizedComposition.compositionId),
        regionSummary: buildRegionSummary(normalizedScreenModel),
        ctaAnchors: normalizeArray(normalizedComposition.ctaAnchors).map((cta, index) => ({
          ctaId: normalizeString(cta?.ctaId, `cta-${index + 1}`),
          label: normalizeString(cta?.label, "Action"),
          anchor: normalizeString(cta?.anchor, "primary"),
          actionIntent: normalizeString(cta?.actionIntent),
        })),
      },
      screenState: {
        summary: normalizeObject(screenStates).summary ?? null,
        screens: normalizeArray(screenStates?.screens),
      },
      designSystem: {
        tokenSetId: normalizeString(designTokens?.tokenSetId),
        componentContractId: normalizeString(componentContract?.contractId),
        allowedRegions: buildRegionSummary(normalizedScreenModel).map((region) => region.slot),
      },
      slimmedContextPayload: normalizeObject(slimmedContextPayload),
    },
  };
}
