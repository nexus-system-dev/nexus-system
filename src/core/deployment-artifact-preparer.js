function normalizeBuildArtifact(buildArtifact = null) {
  if (Array.isArray(buildArtifact)) {
    return buildArtifact.filter(Boolean);
  }

  if (buildArtifact && typeof buildArtifact === "object") {
    return Object.values(buildArtifact).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return buildArtifact ? [buildArtifact] : [];
}

function inferPackageFormat(target) {
  if (target === "web-deployment") {
    return "static-bundle";
  }

  if (target === "private-deployment") {
    return "service-bundle";
  }

  if (target === "content-delivery") {
    return "content-bundle";
  }

  return "generic-bundle";
}

export function createDeploymentArtifactPreparer({
  buildArtifact = null,
  deploymentConfig = {},
} = {}) {
  const artifacts = normalizeBuildArtifact(buildArtifact);
  const target = deploymentConfig?.target ?? "private-deployment";

  return {
    preparedArtifact: {
      target,
      provider: deploymentConfig?.provider ?? "generic",
      environment: deploymentConfig?.environment ?? "staging",
      packageFormat: inferPackageFormat(target),
      artifacts,
      preparationMetadata: {
        artifactCount: artifacts.length,
        executionMode: deploymentConfig?.executionMode ?? "manual",
        capabilities: deploymentConfig?.capabilities ?? [],
      },
    },
  };
}
