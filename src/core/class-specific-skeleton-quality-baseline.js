import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "../../web/shared/product-class-model.js";

const QUALITY_BASELINES = {
  "landing-page": {
    baselineId: "skeleton-quality:landing-page",
    qualityBar: "minimum-believable-marketing-surface",
    visibleProofPoints: ["hero-value-prop", "trust-proof", "single-cta"],
    requiredSurfaceElements: ["headline", "supporting-copy", "cta", "trust-section"],
    coherenceChecks: ["promise-is-clear", "cta-is-singular", "section-order-feels-marketing-native"],
    failIfMissing: ["headline", "cta"],
    userPerceptionGoal: "feels like a real landing page instead of a generic placeholder",
  },
  "mobile-app": {
    baselineId: "skeleton-quality:mobile-app",
    qualityBar: "minimum-believable-mobile-entry-flow",
    visibleProofPoints: ["first-screen", "primary-action", "navigation-direction"],
    requiredSurfaceElements: ["app-frame", "first-screen", "primary-action", "navigation-shell"],
    coherenceChecks: ["screen-feels-mobile-native", "first-action-is-obvious", "navigation-is-not-placeholder-only"],
    failIfMissing: ["first-screen", "primary-action"],
    userPerceptionGoal: "feels like a real mobile flow instead of stacked text panels",
  },
  "internal-tool": {
    baselineId: "skeleton-quality:internal-tool",
    qualityBar: "minimum-believable-workspace",
    visibleProofPoints: ["queue-view", "ownership-view", "next-action-view"],
    requiredSurfaceElements: ["workspace-shell", "queue-panel", "ownership-panel", "action-panel"],
    coherenceChecks: ["queue-is-legible", "ownership-is-visible", "workspace-reads-like-a-tool-not-a-dashboard-only"],
    failIfMissing: ["queue-panel", "ownership-panel"],
    userPerceptionGoal: "feels like a tool a team could use immediately",
  },
  "commerce-ops": {
    baselineId: "skeleton-quality:commerce-ops",
    qualityBar: "minimum-believable-commerce-workspace",
    visibleProofPoints: ["orders-view", "catalog-view", "operations-action-view"],
    requiredSurfaceElements: ["commerce-shell", "orders-panel", "catalog-panel", "operations-panel"],
    coherenceChecks: ["orders-urgency-is-visible", "catalog-state-is-visible", "ops-actions-feel-commerce-native"],
    failIfMissing: ["orders-panel", "catalog-panel"],
    userPerceptionGoal: "feels like a commerce operations surface rather than a generic admin page",
  },
  saas: {
    baselineId: "skeleton-quality:saas",
    qualityBar: "minimum-believable-product-workspace",
    visibleProofPoints: ["product-shell", "first-workflow", "primary-action"],
    requiredSurfaceElements: ["product-shell", "workflow-panel", "primary-action", "state-panel"],
    coherenceChecks: ["workflow-is-legible", "first-action-is-productive", "surface-feels-like-an-app-not-a-marketing-page"],
    failIfMissing: ["product-shell", "workflow-panel"],
    userPerceptionGoal: "feels like a real product workspace with a usable first move",
  },
  game: {
    baselineId: "skeleton-quality:game",
    qualityBar: "minimum-believable-playable-preview",
    visibleProofPoints: ["scene-root", "hud", "interaction-anchor"],
    requiredSurfaceElements: ["game-shell", "scene-root", "hud", "interaction-anchor"],
    coherenceChecks: ["scene-reads-like-game-space", "hud-supports-play", "preview-is-not-static-only"],
    failIfMissing: ["scene-root", "hud"],
    userPerceptionGoal: "feels like the beginning of a game rather than a concept card",
  },
  book: {
    baselineId: "skeleton-quality:book",
    qualityBar: "minimum-believable-book-outline",
    visibleProofPoints: ["outline", "chapter-structure", "publishing-direction"],
    requiredSurfaceElements: ["outline", "chapter-index", "publishing-notes"],
    coherenceChecks: ["outline-has-shape", "chapters-feel-sequenced", "publishing-direction-is-clear"],
    failIfMissing: ["outline", "chapter-index"],
    userPerceptionGoal: "feels like a real book structure that can continue immediately",
  },
  "content-product": {
    baselineId: "skeleton-quality:content-product",
    qualityBar: "minimum-believable-content-system",
    visibleProofPoints: ["module-structure", "delivery-path", "content-shape"],
    requiredSurfaceElements: ["content-shell", "module-index", "delivery-path"],
    coherenceChecks: ["modules-feel-teachable", "delivery-path-is-clear", "content-surface-is-not-generic"],
    failIfMissing: ["module-index", "delivery-path"],
    userPerceptionGoal: "feels like a real content product skeleton that can be expanded",
  },
  generic: {
    baselineId: "skeleton-quality:generic",
    qualityBar: "minimum-believable-generic-skeleton",
    visibleProofPoints: ["overview", "next-step"],
    requiredSurfaceElements: ["project-root", "overview", "next-step"],
    coherenceChecks: ["surface-is-not-empty", "next-step-is-clear"],
    failIfMissing: ["overview"],
    userPerceptionGoal: "feels like a grounded starting point rather than an empty placeholder",
  },
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function createClassSpecificSkeletonQualityBaseline({
  productClass = "unknown",
  skeletonContract = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const baseline = QUALITY_BASELINES[normalizedProductClass] ?? QUALITY_BASELINES.generic;

  return {
    ...baseline,
    productClass: normalizedProductClass,
    label: classProfile.label,
    buildSurfaceFamily: skeletonContract?.buildSurfaceFamily ?? classProfile.buildSurfaceFamily,
    previewFamily: skeletonContract?.previewFamily ?? classProfile.previewFamily,
    visibleMilestones: unique([
      ...(baseline.visibleProofPoints ?? []),
      ...(skeletonContract?.visibleMilestones ?? []),
    ]),
    requiredSurfaceElements: unique([
      ...(baseline.requiredSurfaceElements ?? []),
      ...(skeletonContract?.initialStructure ?? []),
    ]),
    failIfMissing: unique([
      ...(baseline.failIfMissing ?? []),
    ]),
    restoreExpectation: "baseline-must-survive-restore",
  };
}
