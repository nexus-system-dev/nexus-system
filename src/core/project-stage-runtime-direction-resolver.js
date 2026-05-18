import {
  normalizeCanonicalProductClass,
  resolveCanonicalProductClassProfile,
} from "../../web/shared/product-class-model.js";

const RELEASE_TARGET_BY_FAMILY = {
  "web-deployment": "web-deployment",
  "app-distribution": "app-store",
  "private-workspace-release": "private-deployment",
  "web-product-release": "web-deployment",
  "commerce-web-release": "web-deployment",
  "document-publishing": "pdf-publishing",
  "content-release": "content-delivery",
  "game-release": "game-build",
  "private-deployment": "private-deployment",
};

const TARGET_PLATFORM_BY_RUNTIME_FAMILY = {
  "web-static": "web",
  "web-app-runtime": "web",
  "mobile-runtime": "mobile",
  "game-runtime": "game",
  "document-runtime": "document",
  "content-runtime": "content",
  "generic-runtime": "generic",
};

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function hasTruthyList(items) {
  return Array.isArray(items) && items.filter(Boolean).length > 0;
}

function inferProjectStage({
  projectState = {},
  lifecyclePhase = "",
  productClass = "unknown",
} = {}) {
  const phase = normalizeString(lifecyclePhase || projectState?.lifecycle?.phase || projectState?.lifecycle?.currentPhase);
  const hasBootstrapPlan = Boolean(projectState?.bootstrapPlan?.taskCount) || hasTruthyList(projectState?.bootstrapTasks);
  const hasBuildTargets = hasTruthyList(projectState?.buildTargets);
  const hasReleaseTarget = Boolean(projectState?.releasePlan?.releaseTarget || projectState?.packagingRequirements?.releaseTarget);
  const hasContinuationSignal = phase === "growth" || Boolean(projectState?.launchConfirmationState?.summary?.confirmed);

  if (!productClass || productClass === "unknown" || productClass === "generic") {
    return "class-resolution";
  }

  if (hasContinuationSignal) {
    return "continuation";
  }

  if (phase === "release" || hasReleaseTarget) {
    return "release-prep";
  }

  if (phase === "validation") {
    return "build-validation";
  }

  if (phase === "execution" || hasBuildTargets || hasBootstrapPlan) {
    return "build";
  }

  return "bootstrap";
}

export function resolveProjectStageAndRuntimeDirection({
  productClass = null,
  domainProfile = null,
  projectIntake = null,
  projectState = {},
  recommendedDefaults = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(
    productClass
      ?? domainProfile?.productClass
      ?? projectIntake?.projectType
      ?? projectState?.projectType,
    { fallback: "unknown" },
  );
  const classProfile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const projectStage = inferProjectStage({
    projectState,
    lifecyclePhase: projectState?.lifecycle?.phase ?? projectState?.lifecycle?.currentPhase ?? "",
    productClass: normalizedProductClass,
  });
  const preferredReleaseTarget =
    normalizeString(projectState?.releasePlan?.releaseTarget)
    || normalizeString(recommendedDefaults?.hosting?.target)
    || domainProfile?.releaseTargets?.[0]
    || RELEASE_TARGET_BY_FAMILY[classProfile.releasePathFamily]
    || "private-deployment";

  const runtimeDirection = {
    productClass: normalizedProductClass,
    projectStage,
    buildSurfaceFamily: classProfile.buildSurfaceFamily,
    previewFamily: classProfile.previewFamily,
    runtimeFamily: classProfile.runtimeFamily,
    packagingFamily: classProfile.packagingFamily,
    releasePathFamily: classProfile.releasePathFamily,
    bootstrapFamily: classProfile.bootstrapFamily,
    targetPlatform: TARGET_PLATFORM_BY_RUNTIME_FAMILY[classProfile.runtimeFamily] ?? "generic",
    preferredReleaseTarget,
    visibility: "must-be-visible-before-bootstrap",
  };

  return {
    projectStage,
    runtimeDirection,
  };
}
