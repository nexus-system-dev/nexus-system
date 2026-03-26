function normalizeArtifacts(task = {}) {
  const artifacts = task.expectedArtifacts;

  if (Array.isArray(artifacts)) {
    return artifacts;
  }

  if (artifacts && typeof artifacts === "object") {
    return Object.values(artifacts).flatMap((value) => (Array.isArray(value) ? value : [value])).filter(Boolean);
  }

  return [];
}

export function defineBootstrapExecutionRequestSchema({
  bootstrapAssignment = null,
} = {}) {
  const task = bootstrapAssignment?.task ?? {};

  return {
    requestId: `bootstrap-request-${bootstrapAssignment?.assignmentId ?? "unknown"}`,
    assignmentId: bootstrapAssignment?.assignmentId ?? null,
    taskId: bootstrapAssignment?.taskId ?? task.id ?? null,
    targetType: bootstrapAssignment?.targetType ?? "unresolved",
    targetId: bootstrapAssignment?.targetId ?? null,
    dispatchMode: bootstrapAssignment?.dispatchMode ?? null,
    commandType: "bootstrap",
    executionInput: {
      rule: task.rule ?? null,
      summary: task.summary ?? null,
      inputs: task.inputs ?? {},
      expectedArtifacts: normalizeArtifacts(task),
    },
    executionMetadata: {
      status: bootstrapAssignment?.status ?? "blocked",
      requiredCapabilities: bootstrapAssignment?.requiredCapabilities ?? [],
      source: "bootstrap-dispatcher",
    },
  };
}
