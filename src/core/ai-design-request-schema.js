import { createClassAwareGenerationContract } from "./class-aware-generation-contract.js";

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
  artifactExpectation = null,
  classAwareGenerationContract = null,
  classSpecificSurfaceEvolutionRules = null,
} = {}) {
  const normalizedScreenContract = normalizeObject(screenContract);
  const normalizedScreenModel = normalizeObject(renderableScreenModel);
  const normalizedComposition = normalizeObject(renderableScreenComposition);
  const normalizedSelectedTask = normalizeObject(selectedTask);
  const resolvedGenerationContract = normalizeObject(classAwareGenerationContract).contractId
    ? normalizeObject(classAwareGenerationContract)
    : createClassAwareGenerationContract({
        productClass: artifactExpectation?.projectType ?? artifactExpectation?.productClass ?? "unknown",
        artifactExpectation,
      });
  const generationIntent = normalizeObject(resolvedGenerationContract.generationIntent).intentId
    ? resolvedGenerationContract.generationIntent
    : null;

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
      classAwareGenerationContract: {
        contractId: normalizeString(resolvedGenerationContract.contractId),
        productClass: normalizeString(resolvedGenerationContract.productClass, "generic"),
        generationMode: normalizeString(resolvedGenerationContract.generationMode, "generic-surface"),
        surfaceMutationModel: normalizeString(resolvedGenerationContract.surfaceMutationModel, "overview-sequence"),
        visibleMutationTargets: normalizeArray(resolvedGenerationContract.visibleMutationTargets),
      },
      classSpecificSurfaceEvolutionRules: {
        contractId: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).contractId),
        evolutionFamily: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).evolutionFamily),
        frontendSurfaceType: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).frontendSurfaceType),
        backendStateType: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).backendStateType),
        sceneType: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).sceneType),
        visibleEvolutionRule: normalizeString(normalizeObject(classSpecificSurfaceEvolutionRules).visibleEvolutionRule),
        requiredVisibleChanges: normalizeArray(normalizeObject(classSpecificSurfaceEvolutionRules).requiredVisibleChanges),
      },
      generationIntent,
      designSystem: {
        tokenSetId: normalizeString(designTokens?.tokenSetId),
        componentContractId: normalizeString(componentContract?.contractId),
        allowedRegions: buildRegionSummary(normalizedScreenModel).map((region) => region.slot),
      },
      slimmedContextPayload: normalizeObject(slimmedContextPayload),
    },
  };
}
