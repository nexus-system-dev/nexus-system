function normalizeExecutionStatusPayload(executionStatusPayload = null) {
  return executionStatusPayload && typeof executionStatusPayload === "object" && !Array.isArray(executionStatusPayload)
    ? executionStatusPayload
    : {};
}

function normalizeFormattedLogs(formattedLogs = []) {
  return Array.isArray(formattedLogs) ? formattedLogs : [];
}

function buildCommandEntries(executionStatusPayload, formattedLogs) {
  const plannedCommands = Array.isArray(executionStatusPayload.bootstrapPlannedCommands)
    ? executionStatusPayload.bootstrapPlannedCommands.flatMap((entry) => entry.commands ?? [])
    : [];

  const commandLogs = formattedLogs.filter((entry) => entry?.type === "command");

  return plannedCommands.map((command, index) => {
    const renderedCommand = [command.command, ...(Array.isArray(command.args) ? command.args : [])]
      .filter(Boolean)
      .join(" ");
    const commandLog = commandLogs[index] ?? null;

    return {
      commandId: `console-command-${index + 1}`,
      command: renderedCommand,
      executionMode: command.executionMode ?? null,
      source: command.source ?? "execution-surface",
      status: commandLog?.level === "error" ? "failed" : executionStatusPayload.progressState?.status ?? "pending",
      stdout: commandLog?.level !== "error" ? commandLog?.message ?? null : null,
      stderr: commandLog?.level === "error" ? commandLog?.message ?? null : null,
      timestamp: commandLog?.timestamp ?? null,
    };
  });
}

function buildLogStreams(formattedLogs) {
  return {
    stdout: formattedLogs
      .filter((entry) => entry?.level !== "error")
      .map((entry) => ({
        id: entry.id,
        message: entry.message,
        source: entry.source ?? "runtime",
        timestamp: entry.timestamp ?? null,
      })),
    stderr: formattedLogs
      .filter((entry) => entry?.level === "error")
      .map((entry) => ({
        id: entry.id,
        message: entry.message,
        source: entry.source ?? "runtime",
        timestamp: entry.timestamp ?? null,
      })),
  };
}

function buildAgentCommandActivity(executionStatusPayload) {
  const assignments = Array.isArray(executionStatusPayload.bootstrapAssignments)
    ? executionStatusPayload.bootstrapAssignments
    : [];

  return assignments.map((assignment) => ({
    assignmentId: assignment.assignmentId,
    taskId: assignment.taskId,
    targetId: assignment.targetId,
    dispatchMode: assignment.dispatchMode,
    status: assignment.status,
  }));
}

export function createTerminalAndCommandConsoleView({
  executionStatusPayload = null,
  formattedLogs = [],
} = {}) {
  const normalizedExecutionStatusPayload = normalizeExecutionStatusPayload(executionStatusPayload);
  const normalizedFormattedLogs = normalizeFormattedLogs(formattedLogs);
  const commands = buildCommandEntries(normalizedExecutionStatusPayload, normalizedFormattedLogs);
  const logStreams = buildLogStreams(normalizedFormattedLogs);

  return {
    commandConsoleView: {
      consoleId: `command-console:${normalizedExecutionStatusPayload.projectId ?? "unknown-project"}`,
      status: normalizedExecutionStatusPayload.progressState?.status ?? "idle",
      commands,
      logStreams,
      agentCommandActivity: buildAgentCommandActivity(normalizedExecutionStatusPayload),
      summary: {
        totalCommands: commands.length,
        stdoutLines: logStreams.stdout.length,
        stderrLines: logStreams.stderr.length,
        hasErrors: logStreams.stderr.length > 0,
      },
    },
  };
}
