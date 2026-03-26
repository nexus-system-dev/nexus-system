export function createReleaseValidationAssembler({
  artifactValidation = null,
  metadataValidation = null,
  approvalValidation = null,
  blockingIssues = [],
  releaseRequirements = null,
} = {}) {
  const allReady = [
    artifactValidation?.isReady,
    metadataValidation?.isReady,
    approvalValidation?.isReady,
  ].every((value) => value !== false);

  return {
    validationReport: {
      status: allReady && blockingIssues.length === 0 ? "ready" : "blocked",
      isReady: allReady && blockingIssues.length === 0,
      releaseTarget: releaseRequirements?.releaseTarget ?? null,
      domain: releaseRequirements?.domain ?? null,
      artifactValidation,
      metadataValidation,
      approvalValidation,
      blockingIssueCount: blockingIssues.length,
    },
    blockingIssues,
  };
}
