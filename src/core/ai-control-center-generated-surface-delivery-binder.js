import { defineRenderableScreenModel } from "./renderable-screen-model-schema.js";
import { createTemplateToLayoutEngine } from "./template-to-layout-engine.js";
import { createContractToComponentMapper } from "./contract-to-component-mapper.js";
import { createScreenStateVariantResolver } from "./screen-state-variant-resolver.js";
import { createScreenCompositionRuntime } from "./screen-composition-runtime.js";
import { createRuntimeScreenRegistryResolver } from "./runtime-screen-registry-resolver.js";
import { createProjectStateScreenRenderer } from "./project-state-screen-renderer.js";
import { createGeneratedScreenPreviewRenderer } from "./generated-screen-preview-renderer.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeEnabledSections(sections) {
  return Object.entries(normalizeObject(sections))
    .filter(([, section]) => normalizeObject(section).enabled !== false)
    .map(([sectionKey, section], index) => ({
      sectionId: sectionKey,
      label: normalizeObject(section).role ?? sectionKey,
      slot: sectionKey,
      order: index + 1,
      isOptional: normalizeObject(section).enabled === false,
    }));
}

function resolveTemplateFamily(screenType) {
  const normalizedType = typeof screenType === "string" ? screenType.trim().toLowerCase() : "detail";
  if (normalizedType === "dashboard" || normalizedType === "workspace") return "dashboard";
  if (normalizedType === "wizard") return "workflow";
  if (normalizedType === "tracking" || normalizedType === "management") return "management";
  return "detail";
}

function selectTemplate(screenType, templates) {
  const family = resolveTemplateFamily(screenType);
  const normalizedTemplates = normalizeObject(templates);
  return {
    family,
    template:
      family === "dashboard"
        ? normalizeObject(normalizedTemplates.dashboardTemplate)
        : family === "workflow"
          ? normalizeObject(normalizedTemplates.workflowTemplate)
          : family === "management"
            ? normalizeObject(normalizedTemplates.managementTemplate)
            : normalizeObject(normalizedTemplates.detailPageTemplate),
  };
}

function buildTemplateDescriptor(template, family) {
  const normalizedTemplate = normalizeObject(template);
  return {
    templateId: normalizedTemplate.templateId ?? `${family}-template:unknown`,
    layoutKey: normalizedTemplate.templateType ?? family,
    sections: normalizeEnabledSections(normalizedTemplate.sections),
  };
}

function buildVariantDefinitions(templateVariants, family) {
  const collection = normalizeObject(templateVariants);
  const entry = normalizeArray(collection.templates).find((template) => normalizeObject(template).templateType === family);
  const variants = normalizeArray(normalizeObject(entry).variants).map((variant) => {
    const normalizedVariant = normalizeObject(variant);
    return {
      variantKey: `${normalizedVariant.stateKey ?? "default"}-variant`,
      templateId: normalizedVariant.templateId ?? null,
      overrides: {},
      conditions: [{ phase: normalizedVariant.stateKey ?? "default" }],
    };
  });

  return [
    {
      variantKey: "default",
      templateId: normalizeObject(entry).templateId ?? null,
      overrides: {},
      conditions: [],
    },
    ...variants,
  ];
}

function selectPrimaryScreen({
  screenContracts,
  screenInventory,
  projectState,
} = {}) {
  const contracts = normalizeArray(screenContracts);
  const inventoryScreens = normalizeArray(normalizeObject(screenInventory).screens);
  const state = normalizeObject(projectState);
  const preferredScreenId = state.currentScreenId ?? null;

  if (preferredScreenId) {
    return contracts.find((screen) => normalizeObject(screen).screenId === preferredScreenId)
      ?? inventoryScreens.find((screen) => normalizeObject(screen).screenId === preferredScreenId)
      ?? contracts[0]
      ?? inventoryScreens[0]
      ?? null;
  }

  return contracts[0] ?? inventoryScreens[0] ?? null;
}

function selectScreenState(screen, screenStates) {
  const normalizedScreen = normalizeObject(screen);
  const screens = normalizeArray(normalizeObject(screenStates).screens);
  return screens.find((entry) => normalizeObject(entry).screenId === normalizedScreen.screenId)
    ?? screens.find((entry) => normalizeObject(entry).screenType === normalizedScreen.screenType)
    ?? null;
}

function selectValidationChecklist(screen, screenValidationChecklist) {
  const normalizedScreen = normalizeObject(screen);
  const screens = normalizeArray(normalizeObject(screenValidationChecklist).screens);
  return screens.find((entry) => normalizeObject(entry).screenId === normalizedScreen.screenId) ?? null;
}

function buildProposalState(editableProposal, editedProposal, partialAcceptanceDecision, remainingProposalScope) {
  const editable = normalizeObject(editableProposal);
  const edited = normalizeObject(editedProposal);
  const partial = normalizeObject(partialAcceptanceDecision);
  const remaining = normalizeObject(remainingProposalScope);
  const activeProposal = edited.revisionId ? edited : editable;

  return {
    proposalId: activeProposal.proposalId ?? editable.proposalId ?? null,
    revisionId: activeProposal.revisionId ?? null,
    proposalType: activeProposal.proposalType ?? editable.proposalType ?? "generic",
    reviewStatus: partial.status ?? "not-started",
    followUpAction: partial.followUpAction ?? activeProposal.nextAction?.intent ?? "review",
    remainingComponentCount:
      normalizeArray(remaining.componentsNeedingRegeneration).length + (remaining.summary?.remainingComponentCount ?? 0),
    canEditProposal: Boolean(editable.proposalId),
    canPartiallyAccept: editable.summary?.supportsPartialAcceptance === true,
  };
}

function buildDeliveryState({
  authenticatedAppShell,
  navigationRouteSurface,
  previewScreenViewModel,
  liveRuntimeScreenState,
  proposalState,
} = {}) {
  const shell = normalizeObject(authenticatedAppShell);
  const navigation = normalizeObject(navigationRouteSurface);
  const preview = normalizeObject(previewScreenViewModel);
  const live = normalizeObject(liveRuntimeScreenState);
  const route = normalizeArray(navigation.routeBindings).find((entry) => entry.routeKey === "ai-control-center");
  const routeEnabled = normalizeObject(route).enabled === true;
  const hasPreview = preview.meta?.isPreviewable === true;
  const hasProposal = Boolean(proposalState.proposalId);

  let status = "blocked";
  if (shell.status === "ready" && routeEnabled && hasPreview && hasProposal) {
    status = "ready-for-review";
  } else if (shell.status === "ready" && routeEnabled && hasProposal) {
    status = "review-only";
  } else if (shell.status === "ready" && routeEnabled && hasPreview) {
    status = "preview-only";
  }

  return {
    routeEnabled,
    routeKey: "ai-control-center",
    activeRouteKey: navigation.activeRoute?.routeKey ?? null,
    status,
    canDeliverToLiveSurface: hasPreview && live.meta?.isLive !== false,
    liveSurfaceBinding: {
      activeScreenId: live.activeScreenId ?? preview.screenId ?? null,
      activeCompositionId: live.activeCompositionId ?? preview.compositionId ?? null,
      sourceMode: live.meta?.sourceMode ?? "generated-preview",
    },
  };
}

export function createAiControlCenterAndGeneratedSurfaceDeliveryBinder({
  authenticatedAppShell = null,
  navigationRouteSurface = null,
  ownerControlCenter = null,
  cockpitRecommendationSurface = null,
  editableProposal = null,
  editedProposal = null,
  partialAcceptanceDecision = null,
  remainingProposalScope = null,
  screenContracts = null,
  screenInventory = null,
  screenStates = null,
  screenValidationChecklist = null,
  screenFlowMap = null,
  templateVariants = null,
  designTokens = null,
  layoutSystem = null,
  colorRules = null,
  interactionStateSystem = null,
  componentContract = null,
  primitiveComponents = null,
  layoutComponents = null,
  feedbackComponents = null,
  navigationComponents = null,
  dataDisplayComponents = null,
  dashboardTemplate = null,
  detailPageTemplate = null,
  workflowTemplate = null,
  managementTemplate = null,
  projectState = null,
} = {}) {
  const primaryScreen = normalizeObject(
    selectPrimaryScreen({
      screenContracts,
      screenInventory,
      projectState,
    }),
  );
  const screenType = primaryScreen.screenType ?? "detail";
  const { family, template } = selectTemplate(screenType, {
    dashboardTemplate,
    detailPageTemplate,
    workflowTemplate,
    managementTemplate,
  });
  const screenTemplateDescriptor = buildTemplateDescriptor(template, family);
  const variantDefinitions = buildVariantDefinitions(templateVariants, family);
  const primaryScreenState = selectScreenState(primaryScreen, screenStates);
  const primaryChecklist = selectValidationChecklist(primaryScreen, screenValidationChecklist);

  const { renderableScreenModel } = defineRenderableScreenModel({
    screenContract: primaryScreen,
    screenTemplateSchema: screenTemplateDescriptor,
    screenStates: primaryScreenState,
    templateVariants: variantDefinitions,
    designTokens,
    componentContract,
  });
  const { screenComponentMapping } = createContractToComponentMapper({
    renderableScreenModel,
    componentLibraries: [
      primitiveComponents,
      layoutComponents,
      feedbackComponents,
      navigationComponents,
      dataDisplayComponents,
    ],
    componentContract,
  });
  const { activeScreenVariantPlan } = createScreenStateVariantResolver({
    screenStates: primaryScreenState,
    templateVariants: variantDefinitions,
    screenValidationChecklist: primaryChecklist,
    interactionStateSystem,
  });
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({
    renderableScreenModel,
    screenTemplates: screenTemplateDescriptor,
    layoutSystem,
  });
  const { renderableScreenComposition } = createScreenCompositionRuntime({
    renderableScreenModel,
    layoutCompositionPlan,
    screenComponentMapping,
    activeScreenVariantPlan,
  });
  const { runtimeScreenRegistry, activeScreenResolver } = createRuntimeScreenRegistryResolver({
    screenInventory: normalizeObject(screenInventory).screens ?? null,
    screenFlowMap,
    renderableScreenComposition,
    projectState,
  });
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    runtimeScreenRegistry,
    activeScreenResolver,
    projectState,
  });
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    renderableScreenComposition,
    designTokens,
    layoutSystem,
    colorRules,
  });

  const proposalState = buildProposalState(
    editableProposal,
    editedProposal,
    partialAcceptanceDecision,
    remainingProposalScope,
  );
  const deliveryState = buildDeliveryState({
    authenticatedAppShell,
    navigationRouteSurface,
    previewScreenViewModel,
    liveRuntimeScreenState,
    proposalState,
  });
  const owner = normalizeObject(ownerControlCenter);
  const recommendation = normalizeObject(cockpitRecommendationSurface);

  return {
    aiControlCenterSurface: {
      aiControlCenterSurfaceId: `ai-control-center:${proposalState.proposalId ?? previewScreenViewModel.screenId ?? "none"}`,
      status:
        normalizeObject(authenticatedAppShell).status === "ready" && deliveryState.routeEnabled
          ? "ready"
          : "blocked",
      routeKey: deliveryState.routeKey,
      activeRouteKey: deliveryState.activeRouteKey,
      ownerSummary: {
        status: owner.status ?? "unknown",
        healthStatus: owner.healthStatus ?? "unknown",
        recommendedActionCount: owner.recommendedActionCount ?? 0,
        requiresMaintenanceReview: owner.requiresMaintenanceReview ?? false,
      },
      recommendationSummary: {
        headline: recommendation.headline ?? recommendation.summary?.headline ?? "No recommendation headline",
        approvalState: recommendation.approval?.requiresApproval === true ? "approval-required" : "clear",
      },
      generatedSurfacePreview: {
        viewModelId: previewScreenViewModel.viewModelId ?? null,
        screenId: previewScreenViewModel.screenId ?? null,
        compositionId: previewScreenViewModel.compositionId ?? null,
        currentPhase: previewScreenViewModel.currentPhase ?? "unknown",
        regionCount: previewScreenViewModel.meta?.regionCount ?? 0,
        hasCtaAnchors: previewScreenViewModel.meta?.hasCtaAnchors ?? false,
        isPreviewable: previewScreenViewModel.meta?.isPreviewable ?? false,
        isFullyApproved: previewScreenViewModel.meta?.isFullyApproved ?? false,
      },
      proposalState,
      deliveryState,
      liveRuntimeBinding: deliveryState.liveSurfaceBinding,
      summary: {
        hasGeneratedPreview: previewScreenViewModel.meta?.isPreviewable === true,
        hasReviewableProposal: proposalState.canEditProposal,
        canOpenControlCenter: deliveryState.routeEnabled,
        deliveryStatus: deliveryState.status,
      },
    },
    renderableScreenModel,
    screenComponentMapping,
    activeScreenVariantPlan,
    layoutCompositionPlan,
    renderableScreenComposition,
    runtimeScreenRegistry,
    activeScreenResolver,
    liveRuntimeScreenState,
    previewScreenViewModel,
  };
}
