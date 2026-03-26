function createHandledAssignmentSet(events) {
  return new Set(
    events
      .filter((event) => event.type === "task.completed" || event.type === "task.failed")
      .map((event) => event.payload.assignmentEventId)
      .filter(Boolean),
  );
}

export class AgentRuntime {
  constructor({ eventBus, workers = [] }) {
    this.eventBus = eventBus;
    this.workers = workers;
  }

  processPendingAssignments({ projectId } = {}) {
    const events = this.eventBus.getEvents();
    const handledAssignments = createHandledAssignmentSet(events);
    const assignmentEvents = events.filter(
      (event) =>
        event.type === "task.assigned" &&
        !handledAssignments.has(event.id) &&
        (!projectId || event.payload.projectId === projectId),
    );

    const results = [];

    for (const event of assignmentEvents) {
      const worker = this.workers.find((candidate) => candidate.canHandle(event.payload));
      if (!worker) {
        results.push(
          this.eventBus.emit("task.failed", {
            assignmentEventId: event.id,
            projectId: event.payload.projectId,
            taskId: event.payload.task.id,
            agentId: event.payload.agentId,
            reason: "No worker available for assignment",
          }),
        );
        continue;
      }

      try {
        const output = worker.execute(event.payload);
        results.push(
          this.eventBus.emit("task.completed", {
            assignmentEventId: event.id,
            projectId: event.payload.projectId,
            taskId: event.payload.task.id,
            agentId: event.payload.agentId,
            output,
          }),
        );
      } catch (error) {
        results.push(
          this.eventBus.emit("task.failed", {
            assignmentEventId: event.id,
            projectId: event.payload.projectId,
            taskId: event.payload.task.id,
            agentId: event.payload.agentId,
            reason: error.message,
          }),
        );
      }
    }

    return results;
  }
}
