import { normalizeAgentTaskType } from "./task-boundary-requirements.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function normalizeProviderOperation(value) {
  const raw = normalizeString(value, null)?.toLowerCase() ?? null;
  if (!raw) {
    return null;
  }

  if (raw === "deploy" || raw.includes("deploy") || raw.includes("publish")) {
    return "deploy";
  }
  if (raw === "send-notification" || raw.includes("notification") || raw.includes("email") || raw.includes("webhook")) {
    return "send-notification";
  }
  if (raw === "external-write" || raw.includes("external-write") || raw.includes("sync") || raw.includes("write")) {
    return "external-write";
  }
  if (raw === "credentialed-api-mutation" || raw.includes("credential") || raw.includes("token") || raw.includes("secret") || raw.includes("submit") || raw.includes("revoke")) {
    return "credentialed-api-mutation";
  }
  if (raw === "billing-affecting-operation" || raw.includes("billing") || raw.includes("invoice") || raw.includes("payment")) {
    return "billing-affecting-operation";
  }

  return null;
}

export function normalizeAgentTaskContext({
  taskContext = null,
  providerOperations = [],
  selectedTask = null,
  codeDiff = null,
  bootstrapAssignments = [],
  bootstrapTasks = [],
  projectId = null,
} = {}) {
  const normalizedTaskContext = normalizeObject(taskContext);
  const normalizedSelectedTask = normalizeObject(selectedTask);
  const normalizedCodeDiff = normalizeObject(codeDiff);

  const writeTargets = uniqueStrings([
    ...normalizeArray(normalizedTaskContext.writeTargets),
    ...normalizeArray(normalizedCodeDiff.files).map((file) => normalizeString(file?.path, null)),
  ]);

  const canonicalProviderOperations = uniqueStrings([
    ...normalizeArray(normalizedTaskContext.providerOperations).map(normalizeProviderOperation),
    ...normalizeArray(providerOperations).map((operation) => normalizeProviderOperation(operation?.operationType)),
  ]);

  return {
    taskType: normalizeAgentTaskType(
      normalizedTaskContext.taskType
      ?? normalizedSelectedTask.taskType
      ?? null,
    ),
    plannedActions:
      Number.isFinite(normalizedTaskContext.plannedActions)
        ? Math.max(0, normalizedTaskContext.plannedActions)
        : Math.max(normalizeArray(bootstrapTasks).length, 1),
    concurrentActions:
      Number.isFinite(normalizedTaskContext.concurrentActions)
        ? Math.max(0, normalizedTaskContext.concurrentActions)
        : Math.max(normalizeArray(bootstrapAssignments).length, 1),
    writeTargets,
    providerOperations: canonicalProviderOperations,
    estimatedCost:
      typeof normalizedTaskContext.estimatedCost === "number" && Number.isFinite(normalizedTaskContext.estimatedCost)
        ? normalizedTaskContext.estimatedCost
        : null,
    scopeType: normalizeString(normalizedTaskContext.scopeType, normalizedSelectedTask.scopeType ?? "project"),
    scopeId: normalizeString(normalizedTaskContext.scopeId, normalizedSelectedTask.scopeId ?? projectId ?? null),
  };
}
