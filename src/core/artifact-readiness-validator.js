function normalizeArtifacts(projectArtifacts = []) {
  if (Array.isArray(projectArtifacts)) {
    return projectArtifacts.filter(Boolean);
  }

  if (projectArtifacts && typeof projectArtifacts === "object") {
    return Object.values(projectArtifacts).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return [];
}

export function createArtifactReadinessValidator({
  projectArtifacts = [],
  releaseRequirements = null,
} = {}) {
  const availableArtifacts = normalizeArtifacts(projectArtifacts);
  const requiredArtifacts = Array.isArray(releaseRequirements?.requiredArtifacts)
    ? releaseRequirements.requiredArtifacts
    : [];
  const missingArtifacts = requiredArtifacts.filter((artifact) => !availableArtifacts.includes(artifact));

  return {
    artifactValidation: {
      isReady: missingArtifacts.length === 0,
      requiredArtifacts,
      availableArtifacts,
      missingArtifacts,
    },
  };
}
