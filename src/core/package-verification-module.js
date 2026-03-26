export function createPackageVerificationModule({
  packagedArtifact = null,
  packagingRequirements = null,
} = {}) {
  const requiredPackageArtifacts = Array.isArray(packagingRequirements?.requiredPackageArtifacts)
    ? packagingRequirements.requiredPackageArtifacts
    : [];
  const packageFormat = packagedArtifact?.packageFormat ?? null;
  const verifiedFiles = Array.isArray(packagedArtifact?.files) ? packagedArtifact.files : [];
  const matchesRequiredFormat =
    requiredPackageArtifacts.length === 0 || requiredPackageArtifacts.includes(packageFormat);

  return {
    packageVerification: {
      isValid: matchesRequiredFormat,
      packageFormat,
      requiredPackageArtifacts,
      missingPackageArtifacts:
        matchesRequiredFormat || !packageFormat ? [] : requiredPackageArtifacts,
      verifiedFiles,
    },
  };
}
