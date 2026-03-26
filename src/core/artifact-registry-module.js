function normalizeBuildResult(buildResult = null) {
  if (!buildResult || typeof buildResult !== "object" || Array.isArray(buildResult)) {
    return {
      buildTarget: "unknown-build",
      artifacts: [],
      outputPaths: [],
      version: null,
      status: "unknown",
    };
  }

  return {
    buildTarget: typeof buildResult.buildTarget === "string" ? buildResult.buildTarget : "unknown-build",
    artifacts: Array.isArray(buildResult.artifacts) ? buildResult.artifacts.filter(Boolean) : [],
    outputPaths: Array.isArray(buildResult.outputPaths) ? buildResult.outputPaths.filter(Boolean) : [],
    version: typeof buildResult.version === "string" ? buildResult.version : null,
    status: typeof buildResult.status === "string" ? buildResult.status : "unknown",
  };
}

export function createArtifactRegistryModule({
  buildResult = null,
} = {}) {
  const normalized = normalizeBuildResult(buildResult);

  return {
    artifactRecord: {
      buildTarget: normalized.buildTarget,
      version: normalized.version,
      status: normalized.status,
      artifactCount: normalized.artifacts.length,
      artifacts: normalized.artifacts,
      outputPaths: normalized.outputPaths,
      registeredAt: new Date().toISOString(),
    },
  };
}
