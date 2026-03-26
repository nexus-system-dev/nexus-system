function normalizeExpectedArtifacts(expectedArtifacts = []) {
  if (Array.isArray(expectedArtifacts)) {
    return expectedArtifacts.filter(Boolean);
  }

  if (expectedArtifacts && typeof expectedArtifacts === "object") {
    return Object.values(expectedArtifacts).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return [];
}

function normalizeProducedArtifacts(bootstrapResult = {}) {
  if (Array.isArray(bootstrapResult.artifacts)) {
    return bootstrapResult.artifacts.filter(Boolean);
  }

  if (bootstrapResult.artifacts && typeof bootstrapResult.artifacts === "object") {
    return Object.values(bootstrapResult.artifacts)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean);
  }

  return [];
}

function buildValidationEvidence({ bootstrapResult, scan, taskResults, producedArtifacts }) {
  return {
    executionStatus: bootstrapResult?.status ?? "unknown",
    producedArtifacts,
    scannedProject: Boolean(scan?.exists ?? scan),
    completedTaskIds: (taskResults ?? [])
      .filter((result) => result.status === "completed")
      .map((result) => result.taskId)
      .filter(Boolean),
  };
}

export function createBootstrapValidationModule({
  bootstrapResult = null,
  expectedArtifacts = [],
  scan = null,
  taskResults = [],
} = {}) {
  const normalizedExpectedArtifacts = normalizeExpectedArtifacts(expectedArtifacts);
  const producedArtifacts = normalizeProducedArtifacts(bootstrapResult ?? {});
  const missingArtifacts = normalizedExpectedArtifacts.filter((artifact) => !producedArtifacts.includes(artifact));
  const validationEvidence = buildValidationEvidence({
    bootstrapResult,
    scan,
    taskResults,
    producedArtifacts,
  });
  const validationStatus = missingArtifacts.length === 0
    && validationEvidence.executionStatus !== "failed"
    ? "valid"
    : "invalid";

  return {
    validationResult: {
      status: validationStatus,
      isValid: validationStatus === "valid",
      expectedArtifacts: normalizedExpectedArtifacts,
      producedArtifacts,
      missingArtifacts,
      validationEvidence,
    },
  };
}
