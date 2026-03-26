function normalizeBuildArtifact(buildArtifact = null) {
  if (Array.isArray(buildArtifact)) {
    return buildArtifact.filter(Boolean);
  }

  if (buildArtifact && typeof buildArtifact === "object") {
    return Object.values(buildArtifact).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return buildArtifact ? [buildArtifact] : [];
}

function buildAssets(buildArtifacts = [], packageFormat) {
  return buildArtifacts.map((artifact) => ({
    name: artifact,
    role: packageFormat,
    path: `dist/${artifact}`,
  }));
}

export function createPackagingManifestBuilder({
  buildArtifact = null,
  packageFormat = "deployment-package",
} = {}) {
  const buildArtifacts = normalizeBuildArtifact(buildArtifact);

  return {
    packagingManifest: {
      packageFormat,
      files: buildArtifacts.map((artifact) => `dist/${artifact}`),
      metadata: {
        artifactCount: buildArtifacts.length,
        generatedBy: "packaging-manifest-builder",
      },
      assets: buildAssets(buildArtifacts, packageFormat),
    },
  };
}
