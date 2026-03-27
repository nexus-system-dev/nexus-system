function normalizeChannel(liveUpdateChannel) {
  return liveUpdateChannel && typeof liveUpdateChannel === "object" ? liveUpdateChannel : {};
}

function normalizeLogs(formattedLogs) {
  return Array.isArray(formattedLogs) ? formattedLogs : [];
}

function buildLogEntries(formattedLogs) {
  return formattedLogs.map((entry, index) => {
    const normalizedEntry = entry && typeof entry === "object" ? entry : {};
    const level = normalizedEntry.level ?? "info";
    const stream = level === "error" ? "stderr" : "stdout";

    return {
      logId: normalizedEntry.id ?? `live-log-${index + 1}`,
      stream,
      level,
      message: normalizedEntry.message ?? `Log line ${index + 1}`,
      source: normalizedEntry.source ?? "runtime",
      timestamp: normalizedEntry.timestamp ?? null,
      injectMode: normalizedEntry.type === "command" ? "command-output" : "append-line",
    };
  });
}

function buildCommandOutputs(entries) {
  return entries
    .filter((entry) => entry.injectMode === "command-output")
    .map((entry) => ({
      commandOutputId: `command-output:${entry.logId}`,
      stream: entry.stream,
      message: entry.message,
      timestamp: entry.timestamp,
    }));
}

export function createLiveLogStreamingModule({
  liveUpdateChannel = null,
  formattedLogs = [],
} = {}) {
  const normalizedChannel = normalizeChannel(liveUpdateChannel);
  const normalizedLogs = normalizeLogs(formattedLogs);
  const entries = buildLogEntries(normalizedLogs);
  const commandOutputs = buildCommandOutputs(entries);
  const transportMode = normalizedChannel.transportMode ?? "polling";

  return {
    liveLogStream: {
      streamId: `live-log-stream:${normalizedChannel.streamId ?? "project"}`,
      channelId: normalizedChannel.channelId ?? null,
      transportMode,
      status: entries.length > 0 ? "streaming" : "idle",
      injectionMode: transportMode === "polling" ? "batched-poll" : "incremental-push",
      streams: {
        stdout: entries.filter((entry) => entry.stream === "stdout"),
        stderr: entries.filter((entry) => entry.stream === "stderr"),
      },
      commandOutputs,
      summary: {
        totalEntries: entries.length,
        stdoutEntries: entries.filter((entry) => entry.stream === "stdout").length,
        stderrEntries: entries.filter((entry) => entry.stream === "stderr").length,
        commandOutputs: commandOutputs.length,
        isRealtime: transportMode !== "polling" || entries.length > 0,
      },
    },
  };
}
