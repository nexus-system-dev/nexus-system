function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

const DEPLOYMENT_RULES = {
  "landing-page": {
    providerType: "vercel",
    pathFamily: "web-deployment-path",
    environmentPath: "preview -> production",
    nextGate: "connect-domain-and-promote-preview",
    boundedTargets: ["web-deployment", "private-deployment"],
    visibleReleaseRule: "landing-page delivery must stay visible as one bounded web deployment path",
  },
  saas: {
    providerType: "render",
    pathFamily: "product-web-release-path",
    environmentPath: "staging -> production",
    nextGate: "verify-runtime-and-promote-service",
    boundedTargets: ["web-deployment", "private-deployment"],
    visibleReleaseRule: "SaaS delivery must stay visible as one bounded product release path",
  },
  "internal-tool": {
    providerType: "railway",
    pathFamily: "private-workspace-release-path",
    environmentPath: "staging -> production",
    nextGate: "verify-authenticated-workspace-and-promote",
    boundedTargets: ["private-deployment", "web-deployment"],
    visibleReleaseRule: "internal-tool delivery must stay visible as a bounded private workspace release path",
  },
  "commerce-ops": {
    providerType: "railway",
    pathFamily: "commerce-workspace-release-path",
    environmentPath: "staging -> production",
    nextGate: "verify-ops-workspace-and-promote",
    boundedTargets: ["private-deployment", "web-deployment"],
    visibleReleaseRule: "commerce-ops delivery must stay visible as a bounded operations release path",
  },
  "mobile-app": {
    providerType: "app-store-connect",
    pathFamily: "mobile-store-release-path",
    environmentPath: "simulator -> archive -> store-review",
    nextGate: "prepare-archive-and-submit-store-build",
    boundedTargets: ["app-store", "play-store", "internal-distribution"],
    visibleReleaseRule: "mobile delivery must stay visible as archive-to-store distribution rather than generic web deployment",
  },
  game: {
    providerType: "game-build-pipeline",
    pathFamily: "playable-build-release-path",
    environmentPath: "playable-preview -> packaged-build",
    nextGate: "produce-playable-build-artifact",
    boundedTargets: ["game-build", "playable-preview"],
    visibleReleaseRule: "game delivery must stay visible as a playable build path",
  },
  book: {
    providerType: "publishing-export",
    pathFamily: "publishing-release-path",
    environmentPath: "draft-export -> publishing-export",
    nextGate: "finalize-publishable-export",
    boundedTargets: ["pdf-publishing", "epub-publishing"],
    visibleReleaseRule: "book delivery must stay visible as a bounded publishing export path",
  },
  "content-product": {
    providerType: "content-delivery-pipeline",
    pathFamily: "content-delivery-release-path",
    environmentPath: "preview-delivery -> published-delivery",
    nextGate: "finalize-content-delivery-bundle",
    boundedTargets: ["content-delivery", "private-distribution"],
    visibleReleaseRule: "content-product delivery must stay visible as a bounded content distribution path",
  },
  generic: {
    providerType: "generic",
    pathFamily: "generic-release-path",
    environmentPath: "staging -> production",
    nextGate: "resolve-deployment-target",
    boundedTargets: ["private-deployment"],
    visibleReleaseRule: "release path must stay visible and bounded before deployment claims advance",
  },
};

export function createClassAwareDeploymentReleasePath({
  productClass = null,
  classAwareRuntimeResolver = null,
  classAwarePackagingPreviewContract = null,
  releaseableProductStateContract = null,
} = {}) {
  const normalizedProductClass = normalizeString(productClass, "generic");
  const runtimeResolver = normalizeObject(classAwareRuntimeResolver);
  const packagingPreview = normalizeObject(classAwarePackagingPreviewContract);
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const rule = DEPLOYMENT_RULES[normalizedProductClass] ?? DEPLOYMENT_RULES.generic;
  const primaryTarget = normalizeString(
    releaseableState.releaseTarget,
    normalizeString(runtimeResolver.preferredReleaseTarget, rule.boundedTargets[0]),
  );
  const previewPath = normalizeString(packagingPreview.summary?.previewPath ?? packagingPreview.previewPath, "generic-preview -> generic-preview");
  const packagePath = normalizeString(packagingPreview.summary?.packagePath ?? packagingPreview.packagePath, "generic-package -> private-deployment");
  const releaseStatus = normalizeString(releaseableState.status, "not-ready");

  return {
    classAwareDeploymentReleasePath: {
      modelId: `deployment-release-path:${normalizedProductClass}`,
      pathFamily: rule.pathFamily,
      providerType: rule.providerType,
      releaseStatus,
      primaryTarget,
      boundedTargets: normalizeArray(rule.boundedTargets),
      environmentPath: rule.environmentPath,
      previewPath,
      packagePath,
      operationalPath: `${previewPath} -> ${packagePath} -> ${primaryTarget}`,
      deploymentArtifactType: normalizeString(packagingPreview.packageArtifactType, "generic-delivery-bundle"),
      nextGate: rule.nextGate,
      visibleReleaseRule: rule.visibleReleaseRule,
      continuityRule: "deployment/release path status must survive reopen, route restore, and handoff into deployment feedback",
    },
  };
}
