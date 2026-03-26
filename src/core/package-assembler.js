function normalizeBuildArtifact(buildArtifact = null) {
  if (Array.isArray(buildArtifact)) {
    return buildArtifact.filter(Boolean);
  }

  if (buildArtifact && typeof buildArtifact === "object") {
    return Object.values(buildArtifact).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return buildArtifact ? [buildArtifact] : [];
}

export function createPackageAssembler({
  buildArtifact = null,
  packagingManifest = null,
} = {}) {
  const artifacts = normalizeBuildArtifact(buildArtifact);

  return {
    packagedArtifact: {
      packageFormat: packagingManifest?.packageFormat ?? "deployment-package",
      files: packagingManifest?.files ?? [],
      assets: packagingManifest?.assets ?? [],
      sourceArtifacts: artifacts,
      metadata: {
        ...(packagingManifest?.metadata ?? {}),
        sourceArtifactCount: artifacts.length,
        assembledBy: "package-assembler",
      },
    },
  };
}
