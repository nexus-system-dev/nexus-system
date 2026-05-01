import { createTask, TaskStatus } from "./types.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizePriority(value) {
  return Number.isFinite(value) ? value : 0;
}

function stableTaskOrder(left, right) {
  const priorityDelta = (right.priority ?? 0) - (left.priority ?? 0);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return left.index - right.index;
}

export function mapMaintenanceBacklogToRoadmapTasks({
  maintenanceBacklog = null,
  existingTasks = [],
} = {}) {
  const backlog = normalizeObject(maintenanceBacklog);
  if (!backlog || normalizeString(backlog.status) !== "ready") {
    return {
      maintenanceTasks: [],
      mergedTasks: existingTasks,
    };
  }

  const existingTaskIds = new Set(normalizeArray(existingTasks).map((task) => task?.id).filter(Boolean));
  const seenMaintenanceTaskIds = new Set();
  const maintenanceTasks = normalizeArray(backlog.items)
    .filter((item) => normalizeString(item.maintenanceTaskId))
    .filter((item) => {
      const taskId = normalizeString(item.maintenanceTaskId);
      if (!taskId || seenMaintenanceTaskIds.has(taskId) || existingTaskIds.has(taskId)) {
        return false;
      }

      seenMaintenanceTaskIds.add(taskId);
      return true;
    })
    .map((item, index) =>
      createTask({
        id: item.maintenanceTaskId,
        taskType: normalizeString(item.taskType) ?? "ops",
        lane: normalizeString(item.lane) ?? "maintenance",
        summary: normalizeString(item.summary) ?? "Generated maintenance task",
        requiredCapabilities: normalizeArray(item.requiredCapabilities).filter(Boolean).length > 0
          ? normalizeArray(item.requiredCapabilities).filter(Boolean)
          : ["devops"],
        successCriteria: normalizeArray(item.successCriteria),
        dependencies: normalizeArray(item.dependencies),
        context: {
          source: "maintenance-backlog",
          maintenanceBacklogId: backlog.maintenanceBacklogId,
          severity: normalizeString(item.severity) ?? "medium",
          sourceSignals: normalizeArray(item.sourceSignals),
        },
        lockKey: normalizeString(item.lockKey) ?? item.maintenanceTaskId,
        status: normalizeArray(item.dependencies).length > 0 ? TaskStatus.PENDING : TaskStatus.READY,
        priority: normalizePriority(item.priority),
        statusReason: normalizeArray(item.dependencies).length > 0 ? "dependency" : null,
      }),
    )
    .map((task, index) => ({ ...task, index }))
    .sort(stableTaskOrder)
    .map(({ index, ...task }) => task);

  const mergedTasks = [...normalizeArray(existingTasks), ...maintenanceTasks]
    .map((task, index) => ({ ...task, index }))
    .sort(stableTaskOrder)
    .map(({ index, ...task }) => task);

  return {
    maintenanceTasks,
    mergedTasks,
  };
}
