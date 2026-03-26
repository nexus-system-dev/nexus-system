function normalizeBuildArtifact(buildArtifact = null) {
  if (Array.isArray(buildArtifact)) {
    return buildArtifact.filter(Boolean);
  }

  if (buildArtifact && typeof buildArtifact === "object") {
    return Object.values(buildArtifact).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return buildArtifact ? [buildArtifact] : [];
}

export function defineDeploymentRequestSchema({
  buildArtifact = null,
  deploymentConfig = {},
} = {}) {
  const artifacts = normalizeBuildArtifact(buildArtifact);

  return {
    deploymentRequest: {
      requestId: `deployment-request-${deploymentConfig?.target ?? "unknown"}`,
      provider: deploymentConfig?.provider ?? "generic",
      target: deploymentConfig?.target ?? "private-deployment",
      environment: deploymentConfig?.environment ?? "staging",
      region: deploymentConfig?.region ?? null,
      buildArtifacts: artifacts,
      deploymentConfig: {
        strategy: deploymentConfig?.strategy ?? "standard",
        executionMode: deploymentConfig?.executionMode ?? "manual",
        capabilities: deploymentConfig?.capabilities ?? [],
      },
      deploymentMetadata: {
        artifactCount: artifacts.length,
        source: "deployment-request-schema",
      },
    },
  };
}
