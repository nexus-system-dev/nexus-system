function normalizeMetadata(projectArtifacts = []) {
  if (Array.isArray(projectArtifacts)) {
    return projectArtifacts.filter(Boolean);
  }

  if (projectArtifacts && typeof projectArtifacts === "object") {
    return Object.entries(projectArtifacts).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.filter(Boolean);
      }

      return value ? [key] : [];
    });
  }

  return [];
}

export function createMetadataReadinessValidator({
  projectArtifacts = [],
  releaseRequirements = null,
} = {}) {
  const availableMetadata = normalizeMetadata(projectArtifacts);
  const requiredMetadata = Array.isArray(releaseRequirements?.requiredMetadata)
    ? releaseRequirements.requiredMetadata
    : [];
  const missingMetadata = requiredMetadata.filter((item) => !availableMetadata.includes(item));

  return {
    metadataValidation: {
      isReady: missingMetadata.length === 0,
      requiredMetadata,
      availableMetadata,
      missingMetadata,
    },
  };
}
