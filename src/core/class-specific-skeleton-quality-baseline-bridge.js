import { createClassSpecificSkeletonQualityBaseline } from "./class-specific-skeleton-quality-baseline.js";

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function bridgeSkeletonQualityBaselineToArtifactExpectation({
  artifactExpectation = null,
  skeletonContract = null,
} = {}) {
  const productClass = artifactExpectation?.projectType ?? skeletonContract?.productClass ?? "generic";
  const baseline = createClassSpecificSkeletonQualityBaseline({
    productClass,
    skeletonContract,
  });

  return {
    ...baseline,
    artifactExpectationId: artifactExpectation?.expectationId ?? null,
    artifactType: artifactExpectation?.artifactType ?? skeletonContract?.artifactType ?? null,
    proofFocus: normalizeArray(artifactExpectation?.proofFocus),
    combinedVisibleQualityFocus: [
      ...new Set([
        ...normalizeArray(baseline.visibleProofPoints),
        ...normalizeArray(artifactExpectation?.proofFocus),
      ]),
    ],
  };
}
