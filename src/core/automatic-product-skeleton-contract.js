import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "../../web/shared/product-class-model.js";

const SKELETON_CONTRACTS = {
  "landing-page-skeleton": {
    artifactType: "landing-page",
    visibleSurfaceType: "marketing-page",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["hero-section", "trust-section", "cta-section"],
    initialFiles: ["index-route", "style-tokens", "content-brief"],
    visibleMilestones: ["hero-visible", "cta-visible", "proof-visible"],
  },
  "mobile-app-skeleton": {
    artifactType: "mobile-flow",
    visibleSurfaceType: "mobile-simulator",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["app-shell", "navigation-stack", "primary-screen"],
    initialFiles: ["app-entry", "navigation-config", "screen-contract"],
    visibleMilestones: ["app-shell-visible", "first-screen-visible", "primary-action-visible"],
  },
  "internal-tool-skeleton": {
    artifactType: "internal-ops-workspace",
    visibleSurfaceType: "workspace",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["workspace-shell", "queue-panel", "ownership-panel"],
    initialFiles: ["workspace-route", "queue-config", "ownership-model"],
    visibleMilestones: ["workspace-visible", "queue-visible", "ownership-visible"],
  },
  "commerce-ops-skeleton": {
    artifactType: "commerce-ops-workspace",
    visibleSurfaceType: "commerce-workspace",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["commerce-shell", "orders-panel", "catalog-panel"],
    initialFiles: ["commerce-route", "orders-config", "catalog-config"],
    visibleMilestones: ["commerce-shell-visible", "orders-visible", "catalog-visible"],
  },
  "saas-skeleton": {
    artifactType: "saas-workspace",
    visibleSurfaceType: "product-workspace",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["product-shell", "auth-flow", "primary-workflow"],
    initialFiles: ["app-route", "auth-config", "workflow-contract"],
    visibleMilestones: ["product-shell-visible", "auth-entry-visible", "workflow-visible"],
  },
  "game-skeleton": {
    artifactType: "game-preview",
    visibleSurfaceType: "playable-preview",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["game-shell", "scene-root", "hud"],
    initialFiles: ["game-entry", "scene-contract", "hud-contract"],
    visibleMilestones: ["scene-visible", "hud-visible", "interaction-visible"],
  },
  "book-outline-skeleton": {
    artifactType: "book-outline",
    visibleSurfaceType: "document-preview",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["outline", "chapter-index", "publishing-brief"],
    initialFiles: ["outline-doc", "chapter-structure", "publishing-notes"],
    visibleMilestones: ["outline-visible", "chapters-visible", "publishing-path-visible"],
  },
  "content-product-skeleton": {
    artifactType: "content-outline",
    visibleSurfaceType: "content-preview",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["content-shell", "module-index", "delivery-path"],
    initialFiles: ["content-brief", "module-structure", "delivery-contract"],
    visibleMilestones: ["content-shell-visible", "modules-visible", "delivery-visible"],
  },
  "generic-skeleton": {
    artifactType: "first-artifact",
    visibleSurfaceType: "generic-preview",
    autoStartPolicy: "automatic-after-class-resolution",
    initialStructure: ["project-root", "overview", "next-step"],
    initialFiles: ["readme", "initial-brief", "next-task"],
    visibleMilestones: ["overview-visible", "next-step-visible"],
  },
};

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function createAutomaticProductSkeletonContract({
  productClass = "unknown",
  runtimeDirection = null,
  domainProfile = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const skeletonFamily = classProfile.bootstrapFamily ?? "generic-skeleton";
  const baseContract = SKELETON_CONTRACTS[skeletonFamily] ?? SKELETON_CONTRACTS["generic-skeleton"];
  const bootstrapRules = unique(domainProfile?.bootstrapRules ?? []);

  return {
    contractId: `automatic-skeleton:${normalizedProductClass}`,
    productClass: normalizedProductClass,
    skeletonFamily,
    autoStartPolicy: baseContract.autoStartPolicy,
    artifactType: baseContract.artifactType,
    visibleSurfaceType: baseContract.visibleSurfaceType,
    buildSurfaceFamily: runtimeDirection?.buildSurfaceFamily ?? classProfile.buildSurfaceFamily,
    previewFamily: runtimeDirection?.previewFamily ?? classProfile.previewFamily,
    runtimeFamily: runtimeDirection?.runtimeFamily ?? classProfile.runtimeFamily,
    packagingFamily: runtimeDirection?.packagingFamily ?? classProfile.packagingFamily,
    releasePathFamily: runtimeDirection?.releasePathFamily ?? classProfile.releasePathFamily,
    targetPlatform: runtimeDirection?.targetPlatform ?? "generic",
    initialStructure: unique(baseContract.initialStructure),
    initialFiles: unique(baseContract.initialFiles),
    visibleMilestones: unique(baseContract.visibleMilestones),
    bootstrapRules,
    truthRequirements: [
      "automatic-start-after-class-resolution",
      "no-explicit-generate-click-required",
      "visible-product-structure-must-appear",
      "skeleton-must-survive-restore",
    ],
  };
}
