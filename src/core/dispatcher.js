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

    for (const task of tasks) {
      if (task.status !== TaskStatus.READY) {
        continue;
      }

      if (!dependenciesSatisfied(task, completedTaskIds)) {
        task.status = TaskStatus.BLOCKED;
        continue;
      }

      if (reservedLocks.has(task.lockKey)) {
        task.status = TaskStatus.BLOCKED;
        continue;
      }

      const agent = findMatchingAgent(task, agents);
      if (!agent) {
        task.status = TaskStatus.BLOCKED;
        continue;
      }

      reservedLocks.add(task.lockKey);
      task.status = TaskStatus.ASSIGNED;
      assignments.push({
        taskId: task.id,
        agentId: agent.id,
        lockKey: task.lockKey,
      });
    }

    return assignments;
  }
}
