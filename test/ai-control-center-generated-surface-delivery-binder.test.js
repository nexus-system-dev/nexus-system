import test from "node:test";
import assert from "node:assert/strict";

import { createAiControlCenterAndGeneratedSurfaceDeliveryBinder } from "../src/core/ai-control-center-generated-surface-delivery-binder.js";

test("ai control center binder connects preview, proposal review, and live delivery state", () => {
  const result = createAiControlCenterAndGeneratedSurfaceDeliveryBinder({
    authenticatedAppShell: {
      status: "ready",
    },
    navigationRouteSurface: {
      activeRoute: { routeKey: "ai-control-center" },
      routeBindings: [{ routeKey: "ai-control-center", enabled: true }],
    },
    ownerControlCenter: {
      status: "ready",
      healthStatus: "stable",
      recommendedActionCount: 3,
      requiresMaintenanceReview: false,
    },
    cockpitRecommendationSurface: {
      headline: "Review generated release surface",
      approval: { requiresApproval: true },
    },
    editableProposal: {
      proposalId: "editable-proposal:release:1",
      proposalType: "release-surface",
      summary: { supportsPartialAcceptance: true },
      nextAction: { intent: "review" },
    },
    editedProposal: {
      proposalId: "editable-proposal:release:1",
      revisionId: "revision-2",
      proposalType: "release-surface",
      nextAction: { intent: "review" },
    },
    partialAcceptanceDecision: {
      status: "partially-accepted",
      followUpAction: "regenerate-rejected-scope",
    },
    remainingProposalScope: {
      componentsNeedingRegeneration: [{ componentId: "hero-panel" }],
      summary: { remainingComponentCount: 1 },
    },
    screenContracts: [
      {
        screenId: "release-screen",
        screenType: "detail",
        title: "Release Review",
        ctaDefinitions: [{ ctaId: "review", label: "Review proposal", anchor: "primary" }],
      },
    ],
    screenInventory: {
      screens: [{ screenId: "release-screen", screenType: "detail", flowId: "release-flow", orderInFlow: 1 }],
    },
    screenStates: {
      screens: [{ screenId: "release-screen", screenType: "detail", phase: "populated" }],
    },
    screenValidationChecklist: {
      screens: [{ screenId: "release-screen", signals: { density: "comfortable" } }],
    },
    screenFlowMap: {
      defaultFlowId: "release-flow",
      defaultScreenId: "release-screen",
    },
    templateVariants: {
      templates: [
        {
          templateType: "detail",
          templateId: "detail-template:release",
          variants: [{ stateKey: "populated", templateId: "detail-template:release" }],
        },
      ],
    },
    designTokens: {
      tokenSetId: "tokens-1",
      colors: { primary: "#0057FF", background: "#FFFFFF", text: "#101010" },
      typography: { fontFamily: "Inter", baseSize: 16 },
      spacing: { unit: 8, borderRadius: 8 },
    },
    layoutSystem: {
      regionDefaults: { maxHeight: 240, grows: true },
      minRegionHeight: 56,
      regionPadding: 20,
      defaultRhythm: "comfortable",
    },
    colorRules: {
      default: { background: "#F5F7FF", border: "#D6DEFF" },
      panel: { background: "#FFFFFF", border: "#C8D0E8" },
    },
    interactionStateSystem: {
      activeSignals: { density: "comfortable" },
    },
    componentContract: {
      regions: [{ regionId: "topbar", componentType: "header", slotKey: "topbar" }],
      allowedOverrides: {},
    },
    primitiveComponents: {
      intentMapping: { header: "header" },
    },
    detailPageTemplate: {
      templateId: "detail-template:release",
      templateType: "detail",
      sections: {
        topbar: { enabled: true, role: "Topbar" },
        primaryContent: { enabled: true, role: "Primary content" },
      },
    },
    projectState: {
      projectId: "giftwallet",
      currentScreenId: "release-screen",
      currentFlowId: "release-flow",
      phase: "active",
    },
  });

  assert.equal(result.aiControlCenterSurface.status, "ready");
  assert.equal(result.aiControlCenterSurface.summary.canOpenControlCenter, true);
  assert.equal(result.aiControlCenterSurface.summary.deliveryStatus, "ready-for-review");
  assert.equal(result.aiControlCenterSurface.generatedSurfacePreview.isPreviewable, true);
  assert.equal(result.aiControlCenterSurface.proposalState.reviewStatus, "partially-accepted");
  assert.equal(result.aiControlCenterSurface.liveRuntimeBinding.activeScreenId, "release-screen");
  assert.equal(result.previewScreenViewModel.meta.regionCount >= 1, true);
});
