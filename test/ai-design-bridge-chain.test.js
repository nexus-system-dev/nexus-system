import test from "node:test";
import assert from "node:assert/strict";

import { createAiDesignService } from "../src/core/ai-design-service.js";
import { createAiDesignExecutionHook } from "../src/core/ai-design-execution-hook.js";
import { createRenderableDesignProposalNormalizer } from "../src/core/renderable-design-proposal-normalizer.js";
import { createDesignProposalValidationFlow } from "../src/core/design-proposal-validation-flow.js";
import { createDesignProposalPreviewPipeline } from "../src/core/design-proposal-preview-pipeline.js";
import { createScreenProposalDiffModel } from "../src/core/screen-proposal-diff-model.js";
import { createDesignProposalReviewHandoff } from "../src/core/design-proposal-review-handoff.js";
import { createDesignProposalEditApplyBinder } from "../src/core/design-proposal-edit-apply-binder.js";
import { createDesignProposalStateIntegration } from "../src/core/design-proposal-state-integration.js";

test("ai design bridge chain produces canonical request-through-state integration outputs", () => {
  const { aiDesignServiceResult } = createAiDesignService({
    projectId: "giftwallet",
    projectState: {
      projectId: "giftwallet",
    },
    selectedTask: {
      id: "task-release-review",
      summary: "Generate a release review surface",
      lane: "release",
      taskType: "design",
    },
    screenContract: {
      screenId: "release-screen",
      screenType: "detail",
      title: "Release Review",
      regions: [
        { regionId: "hero", slot: "hero", componentType: "panel" },
        { regionId: "timeline", slot: "timeline", componentType: "list" },
      ],
    },
    renderableScreenModel: {
      modelId: "renderable-screen-model:release",
      screenId: "release-screen",
      screenType: "detail",
      title: "Release Review",
      regions: [
        { regionId: "hero", slot: "hero", componentType: "panel", constraints: { emphasis: "high" } },
        { regionId: "timeline", slot: "timeline", componentType: "list", constraints: { emphasis: "medium" } },
      ],
    },
    renderableScreenComposition: {
      compositionId: "composition:release",
      screenId: "release-screen",
      currentPhase: "populated",
      regions: [
        { regionId: "hero", slot: "hero", component: "panel", order: 1, isVisible: true },
        { regionId: "timeline", slot: "timeline", component: "list", order: 2, isVisible: true },
      ],
      ctaAnchors: [{ ctaId: "cta-1", label: "Review proposal", anchor: "primary", actionIntent: "review" }],
    },
    screenFlowMap: {
      defaultFlowId: "release-flow",
    },
    screenStates: {
      screens: [{ screenId: "release-screen", phase: "populated" }],
    },
    designTokens: {
      tokenSetId: "tokens-release",
      colors: { primary: "#0057FF", background: "#FFFFFF", text: "#111827" },
      typography: { fontFamily: "Inter", baseSize: 16 },
      spacing: { unit: 8, borderRadius: 8 },
    },
    componentContract: {
      contractId: "component-contract:release",
    },
  });

  const { aiDesignExecutionState } = createAiDesignExecutionHook({
    selectedTask: { id: "task-release-review", summary: "Generate a release review surface" },
    aiDesignServiceResult,
  });
  const { renderableDesignProposal } = createRenderableDesignProposalNormalizer({
    aiDesignProposal: aiDesignServiceResult.aiDesignProviderResult.aiDesignProposal,
    renderableScreenModel: {
      screenId: "release-screen",
      layoutType: "single-column",
      sectionRhythm: "comfortable",
      activeVariantKey: "default",
    },
    screenComponentMapping: {
      regions: [
        { slot: "hero", componentType: "panel" },
        { slot: "timeline", componentType: "list" },
      ],
    },
  });
  const { designProposalValidation } = createDesignProposalValidationFlow({
    renderableDesignProposal,
    screenTemplateSchema: { templateId: "detail-template:release" },
    screenValidationChecklist: { signals: { density: "comfortable" } },
    screenContract: {
      regions: [{ regionId: "hero" }, { regionId: "timeline" }],
    },
  });
  const { designProposalPreviewState } = createDesignProposalPreviewPipeline({
    renderableDesignProposal,
    designProposalValidation,
    designTokens: {
      colors: { primary: "#0057FF", background: "#FFFFFF", text: "#111827" },
      typography: { fontFamily: "Inter", baseSize: 16 },
      spacing: { unit: 8, borderRadius: 8 },
    },
    layoutSystem: {
      minRegionHeight: 56,
      regionPadding: 20,
    },
    colorRules: {
      default: { background: "#F5F7FF", border: "#D6DEFF" },
      panel: { background: "#FFFFFF", border: "#C8D0E8" },
      list: { background: "#FFFFFF", border: "#E5E7EB" },
    },
  });
  const { screenProposalDiff } = createScreenProposalDiffModel({
    renderableScreenComposition: {
      compositionId: "composition:release",
      regions: [
        { slot: "hero", component: "panel", order: 1 },
        { slot: "timeline", component: "table", order: 2 },
      ],
    },
    designProposalPreviewState,
  });
  const { designProposalReviewState } = createDesignProposalReviewHandoff({
    renderableDesignProposal,
    designProposalValidation,
    screenProposalDiff,
  });
  const { approvedScreenDelta, proposalApplyDecision } = createDesignProposalEditApplyBinder({
    designProposalReviewState,
    editableProposal: {
      proposalId: "editable-proposal:release:1",
      nextAction: { intent: "review" },
    },
    editedProposal: {
      proposalId: "editable-proposal:release:1",
      revisionId: "revision-2",
      nextAction: { intent: "review" },
    },
    partialAcceptanceDecision: {
      decisionId: "partial-acceptance:release",
      summary: { approvedCount: 1, remainingCount: 1 },
      followUpAction: "regenerate-rejected-scope",
    },
    screenProposalDiff,
  });
  const { acceptedScreenState, integratedDesignProposalState } = createDesignProposalStateIntegration({
    proposalApplyDecision,
    approvedScreenDelta,
    renderableDesignProposal,
    designProposalReviewState,
  });

  assert.equal(typeof aiDesignServiceResult.aiDesignRequest.requestId, "string");
  assert.equal(aiDesignServiceResult.aiDesignProviderResult.status, "ready");
  assert.equal(aiDesignExecutionState.status, "generated");
  assert.equal(renderableDesignProposal.meta.isRenderable, true);
  assert.equal(designProposalValidation.status, "valid");
  assert.equal(designProposalPreviewState.summary.isPreviewable, true);
  assert.equal(screenProposalDiff.summary.changedRegionCount, 1);
  assert.equal(designProposalReviewState.status, "ready-for-review");
  assert.equal(proposalApplyDecision.status, "ready-for-state-integration");
  assert.equal(acceptedScreenState.status, "accepted");
  assert.equal(integratedDesignProposalState.status, "integrated");
});
