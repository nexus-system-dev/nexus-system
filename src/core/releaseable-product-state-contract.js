function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveReleaseableStatus({ projectStage, releaseReadinessEvaluation }) {
  const evaluation = normalizeObject(releaseReadinessEvaluation);

  if (evaluation.status === "ready") {
    return "ready";
  }

  if (projectStage === "release-prep") {
    return "active";
  }

  if (projectStage === "build-validation" || projectStage === "build") {
    return "preparing";
  }

  return "not-ready";
}

function buildVisibleChecks({ releaseReadinessEvaluation }) {
  const evaluation = normalizeObject(releaseReadinessEvaluation);
  return normalizeArray(evaluation.checks).map((check) => ({
    checkId: normalizeString(check.checkId, "unknown-check"),
    status: normalizeString(check.status, "failed"),
    reason: normalizeString(check.reason),
  }));
}

export function createReleaseableProductStateContract({
  productClass = null,
  projectStage = null,
  releasePlan = null,
  classAwareRuntimeResolver = null,
  classAwarePackagingPreviewContract = null,
  launchConfirmationState = null,
  releaseReadinessEvaluation = null,
} = {}) {
  const normalizedReleasePlan = normalizeObject(releasePlan);
  const normalizedRuntimeResolver = normalizeObject(classAwareRuntimeResolver);
  const normalizedPackagingPreviewContract = normalizeObject(classAwarePackagingPreviewContract);
  const normalizedLaunchConfirmationState = normalizeObject(launchConfirmationState);
  const normalizedReleaseReadinessEvaluation = normalizeObject(releaseReadinessEvaluation);

  const status = resolveReleaseableStatus({
    projectStage: normalizeString(projectStage, "bootstrap"),
    releaseReadinessEvaluation: normalizedReleaseReadinessEvaluation,
  });

  const releaseTarget = normalizeString(
    normalizedReleasePlan.releaseTarget,
    normalizeString(normalizedReleaseReadinessEvaluation.releaseTarget, "private-deployment"),
  );

  const nextAction = normalizedReleaseReadinessEvaluation.status === "ready"
    ? "launch-approved"
    : normalizeString(normalizedReleaseReadinessEvaluation.summary?.nextAction, "resolve-release-readiness-gaps");

  return {
    releaseableProductStateContract: {
      contractId: `releaseable-product-state:${normalizeString(productClass, "generic")}`,
      productClass: normalizeString(productClass, "generic"),
      projectStage: normalizeString(projectStage, "bootstrap"),
      stateFamily: "releaseable-product-state",
      status,
      readinessDecision: normalizeString(normalizedReleaseReadinessEvaluation.readinessDecision, "not-ready"),
      releaseTarget,
      runtimeFamily: normalizeString(normalizedRuntimeResolver.runtimeFamily, "generic-runtime"),
      packageArtifactType: normalizeString(normalizedPackagingPreviewContract.packageArtifactType, "generic-delivery-bundle"),
      packagePath: normalizeString(normalizedPackagingPreviewContract.packagePath, "generic-package -> private-deployment"),
      previewPath: normalizeString(normalizedPackagingPreviewContract.previewPath, "generic-preview -> generic-preview"),
      packagingExpectation: normalizeString(
        normalizedPackagingPreviewContract.packagingExpectation,
        "release path must stay visible as product-facing truth",
      ),
      continuityRule: "releaseable state must survive reopen, route restore, and the next continuation loop",
      visibleStateRule: "releaseable state is not proof text alone; it must reflect runtime, package, checks, and release target visibly",
      visibleChecks: buildVisibleChecks({
        releaseReadinessEvaluation: normalizedReleaseReadinessEvaluation,
      }),
      blockedReasons: normalizeArray(normalizedReleaseReadinessEvaluation.blockedReasons),
      launchConfirmed: normalizedLaunchConfirmationState.summary?.confirmed === true,
      summary: {
        label:
          status === "ready"
            ? "Ready for release"
            : status === "active"
              ? "Release prep active"
              : status === "preparing"
                ? "Preparing releaseable state"
                : "Not releaseable yet",
        nextAction,
        readinessScore: normalizedReleaseReadinessEvaluation.summary?.readinessScore ?? 0,
      },
    },
  };
}
