function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export class AgentMemoryStore {
  constructor() {
    this.memories = new Map();
  }

  buildMemory({ projectSnapshot, agent, task, recentEvents }) {
    const memory = {
      agentId: agent.id,
      projectId: projectSnapshot.projectId,
      projectVersion: projectSnapshot.version,
      businessGoal: projectSnapshot.state.businessGoal,
      task: {
        id: task.id,
        taskType: task.taskType,
        lane: task.lane,
        summary: task.summary,
        successCriteria: task.successCriteria,
        dependencies: task.dependencies,
      },
      constraints: {
        activeLocks: projectSnapshot.state.activeLocks ?? [],
      },
      recentEvents: recentEvents
        .filter(
          (event) => {
            const payload = normalizeObject(event?.payload);
            return payload.projectId === projectSnapshot.projectId &&
              ((payload.taskId && payload.taskId === task.id) ||
                (payload.task && payload.task.id === task.id) ||
                payload.agentId === agent.id ||
                (payload.task && payload.task.lane === task.lane));
          },
        )
        .map((event) => {
          const payload = normalizeObject(event?.payload);
          return {
            id: event.id,
            type: event.type,
            timestamp: event.timestamp,
            taskId: payload.taskId ?? payload.task?.id ?? null,
            agentId: payload.agentId ?? null,
          };
        }),
    };

    this.memories.set(`${projectSnapshot.projectId}:${agent.id}:${task.id}`, memory);
    return memory;
  }
}
