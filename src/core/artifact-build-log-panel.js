function normalizeArtifactRecord(artifactRecord = null) {
  return artifactRecord && typeof artifactRecord === "object" && !Array.isArray(artifactRecord)
    ? artifactRecord
    : {};
}

function normalizePackagedArtifact(packagedArtifact = null) {
  return packagedArtifact && typeof packagedArtifact === "object" && !Array.isArray(packagedArtifact)
    ? packagedArtifact
    : {};
}

function normalizePackageVerification(packageVerification = null) {
  return packageVerification && typeof packageVerification === "object" && !Array.isArray(packageVerification)
    ? packageVerification
    : {};
}

export function createArtifactAndBuildLogPanel({
  artifactRecord = null,
  packagedArtifact = null,
  packageVerification = null,
} = {}) {
  const normalizedArtifactRecord = normalizeArtifactRecord(artifactRecord);
  const normalizedPackagedArtifact = normalizePackagedArtifact(packagedArtifact);
  const normalizedPackageVerification = normalizePackageVerification(packageVerification);
  const buildArtifacts = Array.isArray(normalizedArtifactRecord.artifacts) ? normalizedArtifactRecord.artifacts : [];
  const outputPaths = Array.isArray(normalizedArtifactRecord.outputPaths) ? normalizedArtifactRecord.outputPaths : [];
  const packagedFiles = Array.isArray(normalizedPackagedArtifact.files) ? normalizedPackagedArtifact.files : [];

  return {
    artifactBuildPanel: {
      panelId: `artifact-build-panel:${normalizedArtifactRecord.buildTarget ?? "unknown-build"}`,
      build: {
        buildTarget: normalizedArtifactRecord.buildTarget ?? "unknown-build",
        version: normalizedArtifactRecord.version ?? null,
        status: normalizedArtifactRecord.status ?? "unknown",
        artifacts: buildArtifacts.map((artifact, index) => ({
          artifactId: `build-artifact-${index + 1}`,
          name: artifact,
          path: outputPaths[index] ?? `dist/${artifact}`,
        })),
      },
      package: {
        packageFormat: normalizedPackagedArtifact.packageFormat ?? null,
        files: packagedFiles.map((file, index) => ({
          packageFileId: `package-file-${index + 1}`,
          path: file,
        })),
        metadata: normalizedPackagedArtifact.metadata ?? {
          packageFormat: normalizedPackagedArtifact.packageFormat ?? null,
          fileCount: packagedFiles.length,
          assetCount: 0,
          verificationStatus: "pending",
        },
      },
      verification: {
        isValid: normalizedPackageVerification.isValid === true,
        packageFormat: normalizedPackageVerification.packageFormat ?? null,
        requiredPackageArtifacts: Array.isArray(normalizedPackageVerification.requiredPackageArtifacts)
          ? normalizedPackageVerification.requiredPackageArtifacts
          : [],
        missingPackageArtifacts: Array.isArray(normalizedPackageVerification.missingPackageArtifacts)
          ? normalizedPackageVerification.missingPackageArtifacts
          : [],
      },
      summary: {
        artifactCount: buildArtifacts.length,
        packageFileCount: packagedFiles.length,
        verificationStatus: normalizedPackagedArtifact.metadata?.verificationStatus
          ?? (normalizedPackageVerification.isValid === true ? "verified" : "pending"),
      },
    },
  };
}
