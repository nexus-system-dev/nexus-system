import { TaskStatus } from "./types.js";

function dependenciesSatisfied(task, completedTaskIds) {
  return task.dependencies.every((dependency) => completedTaskIds.has(dependency));
}

function mapTaskStatus(task, { completedTaskIds, activeTaskIds, failedTaskIds }) {
  if (completedTaskIds.has(task.id)) {
    return TaskStatus.DONE;
  }

  if (activeTaskIds.has(task.id)) {
    return TaskStatus.ASSIGNED;
  }

  if (failedTaskIds.has(task.id)) {
    return TaskStatus.BLOCKED;
  }

  if (dependenciesSatisfied(task, completedTaskIds)) {
    return task.status === TaskStatus.BLOCKED ? TaskStatus.BLOCKED : TaskStatus.READY;
  }

  return TaskStatus.BLOCKED;
}

export function reconcileRoadmap(tasks, options = {}) {
  const completedTaskIds = options.completedTaskIds ?? new Set();
  const activeTaskIds = options.activeTaskIds ?? new Set();
  const failedTaskIds = options.failedTaskIds ?? new Set();

  return tasks.map((task) => ({
    ...task,
    status: mapTaskStatus(task, {
      completedTaskIds,
      activeTaskIds,
      failedTaskIds,
    }),
  }));
}

export function buildExecutionGraph(tasks, options = {}) {
  const completedTaskIds = options.completedTaskIds ?? new Set();
  const activeTaskIds = options.activeTaskIds ?? new Set();
  const failedTaskIds = options.failedTaskIds ?? new Set();
  const normalizedTasks = reconcileRoadmap(tasks, {
    completedTaskIds,
    activeTaskIds,
    failedTaskIds,
  });

  const nodes = normalizedTasks.map((task) => ({
    id: task.id,
    lane: task.lane,
    status:
      task.status === TaskStatus.ASSIGNED
        ? "running"
        : task.status === TaskStatus.DONE
          ? "done"
          : task.status === TaskStatus.READY
            ? "ready"
            : "blocked",
    taskStatus: task.status,
    lockKey: task.lockKey,
    blockedBy: task.dependencies.filter((dependency) => !completedTaskIds.has(dependency)),
  }));

  const edges = normalizedTasks.flatMap((task) =>
    task.dependencies.map((dependency) => ({
      from: dependency,
      to: task.id,
    })),
  );

  return {
    nodes,
    edges,
  };
}
