function normalizeJobDefinition(jobDefinition) {
  return jobDefinition && typeof jobDefinition === "object" ? jobDefinition : {};
}

function normalizeRuntimeConfig(runtimeConfig) {
  return runtimeConfig && typeof runtimeConfig === "object" ? runtimeConfig : {};
}

export function createBackgroundWorkerRuntime({
  jobDefinition = null,
  runtimeConfig = null,
} = {}) {
  const normalizedJobDefinition = normalizeJobDefinition(jobDefinition);
  const normalizedRuntimeConfig = normalizeRuntimeConfig(runtimeConfig);
  const workerId = `worker-runtime-${Date.now()}`;
  const jobId = normalizedJobDefinition.jobId ?? `job-${Date.now()}`;
  const jobType = normalizedJobDefinition.jobType ?? "generic-async-task";
  const queueName = normalizedRuntimeConfig.queueName ?? "nexus-default";
  const schedule = normalizedJobDefinition.schedule ?? "on-demand";
  const status = normalizedJobDefinition.enabled === false ? "idle" : "ready";

  return {
    workerRuntime: {
      workerId,
      status,
      queueName,
      concurrency: normalizedRuntimeConfig.concurrency ?? 1,
      supportedJobTypes: normalizedRuntimeConfig.supportedJobTypes ?? [
        "polling",
        "notification",
        "async-task",
      ],
      heartbeatIntervalMs: normalizedRuntimeConfig.heartbeatIntervalMs ?? 30000,
    },
    jobState: {
      jobId,
      jobType,
      status: status === "ready" ? "queued" : "idle",
      schedule,
      attempts: normalizedJobDefinition.attempts ?? 0,
      nextRunAt: normalizedJobDefinition.nextRunAt ?? null,
      payload: normalizedJobDefinition.payload ?? {},
    },
  };
}
