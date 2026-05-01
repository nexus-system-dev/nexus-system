import { TaskStatus } from "./types.js";

function dependenciesSatisfied(task, completedTaskIds) {
  return task.dependencies.every((dependencyId) => completedTaskIds.has(dependencyId));
}

function findMatchingAgent(task, agents) {
  return agents.find((agent) =>
    task.requiredCapabilities.every((capability) => agent.capabilities.includes(capability)),
  );
}

export class Dispatcher {
  dispatch({ tasks, agents, completedTaskIds = new Set(), activeLocks = new Set() }) {
    const assignments = [];
    const reservedLocks = new Set(activeLocks);
    const prioritizedTasks = tasks
      .map((task, index) => ({ task, index }))
      .sort((left, right) => {
        const priorityDelta = (right.task.priority ?? 0) - (left.task.priority ?? 0);
        return priorityDelta !== 0 ? priorityDelta : left.index - right.index;
      })
      .map(({ task }) => task);

    for (const task of prioritizedTasks) {
      if (task.status !== TaskStatus.READY) {
        continue;
      }

      if (!dependenciesSatisfied(task, completedTaskIds)) {
        task.status = TaskStatus.BLOCKED;
        task.statusReason = "dependency";
        continue;
      }

      if (reservedLocks.has(task.lockKey)) {
        task.status = TaskStatus.BLOCKED;
        task.statusReason = "lock-conflict";
        continue;
      }

      const agent = findMatchingAgent(task, agents);
      if (!agent) {
        task.status = TaskStatus.BLOCKED;
        task.statusReason = "capability-unavailable";
        continue;
      }

      reservedLocks.add(task.lockKey);
      task.status = TaskStatus.ASSIGNED;
      task.statusReason = null;
      assignments.push({
        taskId: task.id,
        agentId: agent.id,
        lockKey: task.lockKey,
      });
    }

    return assignments;
  }
}
