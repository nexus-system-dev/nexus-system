import { createBlockedTaskOutcomeCanonicalizer } from "./blocked-task-outcome-canonicalizer.js";

const SUPPORTED_EVENT_STATUSES = {
  "task.completed": "completed",
  "task.failed": "failed",
  "task.retried": "retried",
};

function normalizeRuntimeResults(runtimeResults = []) {
  return Array.isArray(runtimeResults) ? runtimeResults.filter((event) => event && typeof event === "object") : [];
}

function normalizeTaskType(payload = {}) {
  const taskType = payload.taskType ?? payload.task?.taskType ?? null;
  return typeof taskType === "string" && taskType.length > 0 ? taskType : null;
}

function normalizeTaskResultEvent(event) {
  const status = SUPPORTED_EVENT_STATUSES[event?.type];
  if (!status) {
    return null;
  }

  const payload = event.payload ?? {};
  const taskId = payload.taskId ?? payload.task?.id ?? null;
  if (typeof taskId !== "string" || taskId.length === 0) {
    return null;
  }

  const projectId = payload.projectId ?? null;
  if (typeof projectId !== "string" || projectId.length === 0) {
    return null;
  }

  return {
    id: typeof event.id === "string" && event.id.length > 0 ? event.id : `${event.type}:${projectId}:${taskId}`,
    type: event.type,
    projectId,
    taskId,
    taskType: normalizeTaskType(payload),
    agentId: payload.agentId ?? null,
    assignmentEventId: payload.assignmentEventId ?? null,
    status,
    output: payload.output ?? null,
    reason: payload.reason ?? null,
    blockedBy: Array.isArray(payload.blockedBy) ? payload.blockedBy.filter(Boolean) : [],
    timestamp: typeof event.timestamp === "string" ? event.timestamp : null,
  };
}

function compareTaskResults(left, right) {
  const leftTimestamp = left.timestamp ?? "";
  const rightTimestamp = right.timestamp ?? "";
  if (leftTimestamp !== rightTimestamp) {
    return leftTimestamp.localeCompare(rightTimestamp);
  }
  return left.id.localeCompare(right.id);
}

export function ingestTaskResults({ runtimeResults = [] } = {}) {
  const normalizedResults = normalizeRuntimeResults(runtimeResults);
  const runtimeTaskResults = normalizedResults.map(normalizeTaskResultEvent).filter(Boolean);
  const projectId = runtimeTaskResults.find((result) => result.projectId)?.projectId ?? null;
  const { blockedTaskOutcomes } = createBlockedTaskOutcomeCanonicalizer({
    projectId,
    runtimeResults: normalizedResults,
  });
  const taskResults = [...runtimeTaskResults, ...blockedTaskOutcomes].sort(compareTaskResults);

  return {
    taskResults,
    blockedTaskOutcomes,
    transitionEvents: taskResults.map((result) => ({
      eventId: result.id,
      type: result.type,
      status: result.status,
      projectId: result.projectId,
      taskId: result.taskId,
      taskType: result.taskType,
      agentId: result.agentId,
      assignmentEventId: result.assignmentEventId,
      blockedBy: Array.isArray(result.blockedBy) ? result.blockedBy : [],
      timestamp: result.timestamp,
    })),
  };
}
