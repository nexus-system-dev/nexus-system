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
          (event) =>
            event.payload.projectId === projectSnapshot.projectId &&
            ((event.payload.taskId && event.payload.taskId === task.id) ||
              (event.payload.task && event.payload.task.id === task.id) ||
              event.payload.agentId === agent.id ||
              (event.payload.task && event.payload.task.lane === task.lane)),
        )
        .map((event) => ({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          taskId: event.payload.taskId ?? event.payload.task?.id ?? null,
          agentId: event.payload.agentId ?? null,
        })),
    };

    this.memories.set(`${projectSnapshot.projectId}:${agent.id}:${task.id}`, memory);
    return memory;
  }
}
