export const TaskStatus = Object.freeze({
  PENDING: "pending",
  READY: "ready",
  ASSIGNED: "assigned",
  BLOCKED: "blocked",
  DONE: "done",
});

export function createTask({
  id,
  lane,
  summary,
  requiredCapabilities,
  successCriteria,
  context,
  dependencies = [],
  lockKey,
  assigneeType = "agent",
  status = TaskStatus.READY,
}) {
  return {
    id,
    lane,
    summary,
    requiredCapabilities,
    successCriteria,
    context,
    dependencies,
    lockKey,
    assigneeType,
    status,
  };
}
