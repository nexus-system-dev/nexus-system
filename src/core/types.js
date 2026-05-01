export const TaskStatus = Object.freeze({
  PENDING: "pending",
  READY: "ready",
  ASSIGNED: "assigned",
  BLOCKED: "blocked",
  DONE: "done",
});

export function createTask({
  id,
  taskType,
  lane,
  summary,
  requiredCapabilities,
  successCriteria,
  context,
  dependencies = [],
  lockKey,
  assigneeType = "agent",
  status = TaskStatus.READY,
  priority = 0,
  statusReason = null,
}) {
  if (typeof taskType !== "string" || taskType.trim().length === 0) {
    throw new Error("createTask requires explicit taskType");
  }

  return {
    id,
    taskType: taskType.trim(),
    lane,
    summary,
    requiredCapabilities,
    successCriteria,
    context,
    dependencies,
    lockKey,
    assigneeType,
    status,
    priority,
    statusReason,
  };
}
