function normalizeLogs(rawLogs = []) {
  return Array.isArray(rawLogs) ? rawLogs.filter(Boolean) : [];
}

function normalizeCommandOutputs(commandOutputs = []) {
  return Array.isArray(commandOutputs) ? commandOutputs.filter(Boolean) : [];
}

export function createExecutionLogFormatter({
  rawLogs = [],
  commandOutputs = [],
} = {}) {
  const normalizedLogs = normalizeLogs(rawLogs);
  const normalizedCommandOutputs = normalizeCommandOutputs(commandOutputs);

  const formattedLogs = [
    ...normalizedLogs.map((log, index) => ({
      id: `log-${index + 1}`,
      level: log.level ?? "info",
      message: log.message ?? String(log),
      timestamp: log.timestamp ?? null,
      source: log.source ?? "runtime",
      type: "log",
    })),
    ...normalizedCommandOutputs.map((output, index) => ({
      id: `command-${index + 1}`,
      level: output.exitCode && output.exitCode !== 0 ? "error" : "info",
      message: output.command
        ? `${output.command}${output.output ? ` -> ${output.output}` : ""}`
        : (output.output ?? String(output)),
      timestamp: output.timestamp ?? null,
      source: output.source ?? "execution",
      type: "command",
    })),
  ];

  const userFacingMessages = formattedLogs.map((entry) =>
    entry.type === "command"
      ? `פקודה: ${entry.message}`
      : `${entry.level === "error" ? "שגיאה" : "לוג"}: ${entry.message}`,
  );

  return {
    formattedLogs,
    userFacingMessages,
  };
}
