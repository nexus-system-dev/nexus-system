export function createPackagingResultEnvelope({
  packagedArtifact = null,
  packagingManifest = null,
  packageVerification = null,
} = {}) {
  const files = Array.isArray(packagedArtifact?.files) ? packagedArtifact.files : [];
  const assets = Array.isArray(packagingManifest?.assets) ? packagingManifest.assets : [];

  return {
    packagedArtifact: {
      ...(packagedArtifact ?? {}),
      packagingManifest: packagingManifest ?? null,
      packageVerification: packageVerification ?? null,
      metadata: {
        packageFormat: packagedArtifact?.packageFormat ?? null,
        fileCount: files.length,
        assetCount: assets.length,
        verificationStatus: packageVerification?.isValid === true ? "verified" : "pending",
      },
    },
  };
}
