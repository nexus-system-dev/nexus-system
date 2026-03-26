function normalizeResolvedSurface(resolvedSurface) {
  if (resolvedSurface?.resolvedSurface) {
    return resolvedSurface.resolvedSurface;
  }

  return resolvedSurface ?? null;
}

function normalizePlannedCommands(plannedCommands) {
  if (Array.isArray(plannedCommands?.plannedCommands)) {
    return plannedCommands.plannedCommands;
  }

  return Array.isArray(plannedCommands) ? plannedCommands : [];
}

function createCommandResult({ command, surface, index }) {
  const readiness = surface?.readiness ?? "unknown";
  const status = readiness === "ready" ? "invoked" : "staged";

  return {
    commandId: command?.id ?? `bootstrap-command-${index + 1}`,
    order: command?.order ?? index + 1,
    command: command?.command ?? null,
    args: Array.isArray(command?.args) ? command.args : [],
    surfaceId: surface?.surfaceId ?? null,
    surfaceType: surface?.surfaceType ?? null,
    status,
    exitCode: status === "invoked" ? 0 : null,
    output:
      status === "invoked"
        ? `Invoked ${command?.command ?? "command"} on ${surface?.surfaceId ?? "unknown-surface"}`
        : `Staged ${command?.command ?? "command"} for ${surface?.surfaceId ?? "unknown-surface"}`,
    producedArtifacts: Array.isArray(command?.produces) ? command.produces : [],
  };
}

export function createBootstrapExecutionInvoker({ resolvedSurface = null, plannedCommands = [] } = {}) {
  const normalizedSurface = normalizeResolvedSurface(resolvedSurface);
  const normalizedCommands = normalizePlannedCommands(plannedCommands);
  const requestId = resolvedSurface?.requestId ?? plannedCommands?.requestId ?? null;
  const taskId = resolvedSurface?.taskId ?? plannedCommands?.taskId ?? null;
  const commandResults = normalizedCommands.map((command, index) =>
    createCommandResult({
      command,
      surface: normalizedSurface,
      index,
    }),
  );
  const rawExecutionResult = {
    requestId,
    taskId,
    surfaceId: normalizedSurface?.surfaceId ?? null,
    surfaceType: normalizedSurface?.surfaceType ?? null,
    readiness: normalizedSurface?.readiness ?? "unknown",
    status: commandResults.every((result) => result.status === "invoked") ? "invoked" : "staged",
    commandResults,
  };

  return {
    requestId,
    taskId,
    rawExecutionResult,
  };
}
