import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "../../web/shared/product-class-model.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(values.map((value) => normalizeString(value)).filter(Boolean))];
}

const CLASS_GENERATION_RULES = {
  "landing-page": {
    generationMode: "conversion-surface",
    weakClass: true,
    surfaceMutationModel: "section-sequence",
    visibleMutationTargets: ["headline", "supporting-copy", "trust-proof", "single-cta"],
    backendCouplingRules: ["copy-proof-surface-must-change-with-logic", "cta-surface-cannot-stay-placeholder-only"],
    forbiddenGenericPatterns: ["generic-dashboard-layout", "multi-panel-admin-shell", "multiple-primary-ctas"],
    defaultProofArtifactType: "generated-marketing-surface",
    defaultActionIntent: "convert",
    defaultActionLabel: "Open primary CTA",
    generationGoalTemplate: (title) => `${title} should make the promise, trust proof, and one clear CTA visible before Proof.`,
    fallbackFocusAreas: ["headline promise", "trust proof", "single CTA"],
  },
  "mobile-app": {
    generationMode: "mobile-flow",
    weakClass: true,
    surfaceMutationModel: "screen-sequence",
    visibleMutationTargets: ["first-screen", "primary-action", "navigation-direction", "next-step continuity"],
    backendCouplingRules: ["first-action-state-must-change-visible-screen", "navigation-shell-cannot-stay-static"],
    forbiddenGenericPatterns: ["stacked-desktop-panels", "marketing-hero-as-main-screen", "no-mobile-frame"],
    defaultProofArtifactType: "generated-mobile-surface",
    defaultActionIntent: "start-flow",
    defaultActionLabel: "Start the first mobile action",
    generationGoalTemplate: (title) => `${title} should make the first screen, first action, and next-step continuity visible before Proof.`,
    fallbackFocusAreas: ["first screen", "primary action", "next-step continuity"],
  },
  "internal-tool": {
    generationMode: "workspace-operations",
    weakClass: false,
    surfaceMutationModel: "queue-workspace",
    visibleMutationTargets: ["queue-panel", "ownership-panel", "next-action panel", "service-level state"],
    backendCouplingRules: ["ownership-state-must-change-visible-workspace", "queue-and-action-surface-must-evolve-together"],
    forbiddenGenericPatterns: ["generic-marketing-shell", "single-kpi-dashboard-only", "no-actionable-queue"],
    defaultProofArtifactType: "generated-workspace-surface",
    defaultActionIntent: "operate",
    defaultActionLabel: "Run the next operational action",
    generationGoalTemplate: (title) => `${title} should make queue ownership, SLA, and the next operational move visible before Proof.`,
    fallbackFocusAreas: ["queue ownership", "service-level state", "next operational move"],
  },
  "commerce-ops": {
    generationMode: "commerce-operations",
    weakClass: false,
    surfaceMutationModel: "operations-workspace",
    visibleMutationTargets: ["orders-panel", "catalog-state", "operations actions", "commerce urgency"],
    backendCouplingRules: ["orders-state-must-change-visible-ops-surface", "catalog-state-cannot-live-only-in-internal-data"],
    forbiddenGenericPatterns: ["generic-admin-layout", "static-catalog-copy", "no-order-urgency-signal"],
    defaultProofArtifactType: "generated-commerce-surface",
    defaultActionIntent: "operate-commerce",
    defaultActionLabel: "Open the next commerce action",
    generationGoalTemplate: (title) => `${title} should make active order pressure, catalog state, and the next commerce action visible before Proof.`,
    fallbackFocusAreas: ["active order pressure", "catalog state", "next commerce action"],
  },
  saas: {
    generationMode: "product-workflow",
    weakClass: false,
    surfaceMutationModel: "workflow-sequence",
    visibleMutationTargets: ["app-shell", "workflow-panel", "primary action", "state feedback"],
    backendCouplingRules: ["workflow-state-must-change-visible-app-surface", "app-shell-cannot-stay-generic-after-task-execution"],
    forbiddenGenericPatterns: ["marketing-page-instead-of-product", "generic-admin-panels", "no-first-workflow"],
    defaultProofArtifactType: "generated-product-surface",
    defaultActionIntent: "advance-workflow",
    defaultActionLabel: "Advance the primary workflow",
    generationGoalTemplate: (title) => `${title} should make the first workflow, the main action, and state feedback visible before Proof.`,
    fallbackFocusAreas: ["first workflow", "main action", "state feedback"],
  },
  game: {
    generationMode: "playable-scene",
    weakClass: false,
    surfaceMutationModel: "scene-state",
    visibleMutationTargets: ["scene-root", "hud", "interaction anchor", "play-state feedback"],
    backendCouplingRules: ["scene-state-must-affect-playable-preview", "hud-cannot-stay-static-only"],
    forbiddenGenericPatterns: ["dashboard-layout", "text-only-proof", "non-playable-scene"],
    defaultProofArtifactType: "generated-game-surface",
    defaultActionIntent: "play",
    defaultActionLabel: "Start the first interaction",
    generationGoalTemplate: (title) => `${title} should make the scene, HUD, and first interaction feel playable before Proof.`,
    fallbackFocusAreas: ["scene root", "hud", "first interaction"],
  },
  book: {
    generationMode: "narrative-outline",
    weakClass: false,
    surfaceMutationModel: "outline-sequence",
    visibleMutationTargets: ["outline", "chapter structure", "publishing direction", "reader progression"],
    backendCouplingRules: ["chapter-state-must-change-visible-outline", "publishing-direction-cannot-stay-implicit"],
    forbiddenGenericPatterns: ["dashboard-layout", "single-card-summary", "no-chapter-shape"],
    defaultProofArtifactType: "generated-book-outline",
    defaultActionIntent: "shape-manuscript",
    defaultActionLabel: "Open the next chapter move",
    generationGoalTemplate: (title) => `${title} should make the outline, chapter sequence, and publishing direction visible before Proof.`,
    fallbackFocusAreas: ["outline", "chapter sequence", "publishing direction"],
  },
  "content-product": {
    generationMode: "content-system",
    weakClass: false,
    surfaceMutationModel: "module-sequence",
    visibleMutationTargets: ["module index", "delivery path", "teaching sequence", "content shape"],
    backendCouplingRules: ["module-state-must-change-visible-delivery-surface", "delivery-path-cannot-stay-generic"],
    forbiddenGenericPatterns: ["generic-dashboard-layout", "single-article-surface", "no-delivery-path"],
    defaultProofArtifactType: "generated-content-surface",
    defaultActionIntent: "advance-module",
    defaultActionLabel: "Open the next module move",
    generationGoalTemplate: (title) => `${title} should make the modules, delivery path, and learning sequence visible before Proof.`,
    fallbackFocusAreas: ["module index", "delivery path", "learning sequence"],
  },
  generic: {
    generationMode: "generic-surface",
    weakClass: false,
    surfaceMutationModel: "overview-sequence",
    visibleMutationTargets: ["overview", "next step", "working structure"],
    backendCouplingRules: ["next-step-state-must-change-visible-overview"],
    forbiddenGenericPatterns: ["empty-placeholder-surface"],
    defaultProofArtifactType: "generated-surface",
    defaultActionIntent: "review",
    defaultActionLabel: "Review artifact",
    generationGoalTemplate: (title) => `${title} should make the next visible structure and next actionable step clear before Proof.`,
    fallbackFocusAreas: ["working structure", "next step"],
  },
};

export function createClassAwareGenerationContract({
  productClass = "unknown",
  artifactExpectation = null,
  runtimeDirection = null,
  skeletonContract = null,
  qualityBaseline = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(
    productClass ?? artifactExpectation?.projectType,
    { fallback: "generic" },
  );
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const expectation = normalizeObject(artifactExpectation);
  const rules = CLASS_GENERATION_RULES[normalizedProductClass] ?? CLASS_GENERATION_RULES.generic;
  const artifactTitle = normalizeString(expectation.title, classProfile.label ?? "Artifact");
  const artifactSummary = normalizeString(expectation.summary);
  const framingLine = normalizeString(expectation.continuityLine, expectation.understandingLine);
  const focusAreas = unique([
    ...normalizeArray(expectation.proofFocus),
    ...normalizeArray(rules.fallbackFocusAreas),
  ]);
  const generationGoal = normalizeString(artifactSummary, rules.generationGoalTemplate(artifactTitle));

  return {
    contractId: `class-aware-generation:${normalizedProductClass}`,
    productClass: normalizedProductClass,
    label: classProfile.label,
    generationMode: rules.generationMode,
    surfaceMutationModel: rules.surfaceMutationModel,
    weakClass: rules.weakClass === true,
    artifactTitle,
    artifactSummary,
    framingLine,
    generationGoal,
    focusAreas,
    buildSurfaceFamily: runtimeDirection?.buildSurfaceFamily ?? skeletonContract?.buildSurfaceFamily ?? classProfile.buildSurfaceFamily,
    previewFamily: runtimeDirection?.previewFamily ?? skeletonContract?.previewFamily ?? classProfile.previewFamily,
    runtimeFamily: runtimeDirection?.runtimeFamily ?? classProfile.runtimeFamily,
    packagingFamily: runtimeDirection?.packagingFamily ?? classProfile.packagingFamily,
    releasePathFamily: runtimeDirection?.releasePathFamily ?? classProfile.releasePathFamily,
    visibleMutationTargets: unique([
      ...rules.visibleMutationTargets,
      ...(qualityBaseline?.visibleProofPoints ?? []),
      ...(qualityBaseline?.requiredSurfaceElements ?? []),
    ]),
    backendCouplingRules: unique(rules.backendCouplingRules),
    forbiddenGenericPatterns: unique(rules.forbiddenGenericPatterns),
    continuityRules: [
      "generated-surface-must-survive-restore",
      "generation-state-must-remain-class-aligned-after-return",
      "visible-generation-cannot-reset-to-generic-placeholder",
    ],
    generationIntent: {
      intentId: `generation-intent:${normalizedProductClass}:${artifactTitle.toLowerCase().replace(/\s+/g, "-")}`,
      source: "class-aware-generation-contract",
      status: "ready",
      projectType: normalizedProductClass,
      projectTypeLabel: classProfile.label ?? "Project",
      artifactTitle,
      artifactSummary,
      proofArtifactType: normalizeString(expectation.proofArtifactType, rules.defaultProofArtifactType),
      framingLine,
      generationGoal,
      focusAreas,
      primaryAction: {
        label: rules.defaultActionLabel,
        actionIntent: rules.defaultActionIntent,
      },
      weakClass: rules.weakClass === true,
      generationMode: rules.generationMode,
      surfaceMutationModel: rules.surfaceMutationModel,
    },
  };
}
