function normalizeBuildArtifact(buildArtifact = null) {
  if (Array.isArray(buildArtifact)) {
    return buildArtifact.filter(Boolean);
  }

  if (buildArtifact && typeof buildArtifact === "object") {
    return Object.values(buildArtifact).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return buildArtifact ? [buildArtifact] : [];
}

function inferPackageArtifacts(releaseTarget) {
  if (releaseTarget === "web-deployment") {
    return ["static-bundle"];
  }

  if (releaseTarget === "app-store" || releaseTarget === "play-store") {
    return ["store-package"];
  }

  if (releaseTarget?.includes("publishing")) {
    return ["publication-package"];
  }

  return ["deployment-package"];
}

export function definePackagingRequirementsSchema({
  buildArtifact = null,
  releaseTarget = "private-deployment",
} = {}) {
  const buildArtifacts = normalizeBuildArtifact(buildArtifact);

  return {
    packagingRequirements: {
      releaseTarget,
      buildArtifacts,
      requiredPackageArtifacts: inferPackageArtifacts(releaseTarget),
      packageFormatHint: inferPackageArtifacts(releaseTarget)[0],
      artifactCount: buildArtifacts.length,
    },
  };
}
