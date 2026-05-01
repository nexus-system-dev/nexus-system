import { TaskStatus } from "./types.js";

function dependenciesSatisfied(task, completedTaskIds) {
  return task.dependencies.every((dependency) => completedTaskIds.has(dependency));
}

function mapTaskState(task, { completedTaskIds, activeTaskIds, failedTaskIds }) {
  if (completedTaskIds.has(task.id)) {
    return { status: TaskStatus.DONE, statusReason: null };
  }

  if (activeTaskIds.has(task.id)) {
    return { status: TaskStatus.ASSIGNED, statusReason: null };
  }

  if (failedTaskIds.has(task.id)) {
    return { status: TaskStatus.BLOCKED, statusReason: "runtime-failed" };
  }

  if (!dependenciesSatisfied(task, completedTaskIds)) {
    return { status: TaskStatus.BLOCKED, statusReason: "dependency" };
  }

  if (task.status === TaskStatus.BLOCKED && task.statusReason && task.statusReason !== "dependency") {
    return { status: TaskStatus.BLOCKED, statusReason: task.statusReason };
  }

  return { status: TaskStatus.READY, statusReason: null };
}

export function reconcileRoadmap(tasks, options = {}) {
  const completedTaskIds = options.completedTaskIds ?? new Set();
  const activeTaskIds = options.activeTaskIds ?? new Set();
  const failedTaskIds = options.failedTaskIds ?? new Set();

  return tasks.map((task) => {
    const nextState = mapTaskState(task, {
      completedTaskIds,
      activeTaskIds,
      failedTaskIds,
    });

    return {
      ...task,
      status: nextState.status,
      statusReason: nextState.statusReason,
    };
  });
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
