function createHandledAssignmentSet(events) {
  return new Set(
    events
      .filter((event) => event.type === "task.completed" || event.type === "task.failed")
      .map((event) => event.payload.assignmentEventId)
      .filter(Boolean),
  );
}

export class AgentRuntime {
  constructor({ eventBus, workers = [], killSwitchDecisionResolver = null }) {
    this.eventBus = eventBus;
    this.workers = workers;
    this.killSwitchDecisionResolver = typeof killSwitchDecisionResolver === "function" ? killSwitchDecisionResolver : null;
  }

  processPendingAssignments({ projectId } = {}) {
    const killSwitchDecision = this.killSwitchDecisionResolver?.({ projectId }) ?? null;
    if (killSwitchDecision?.isActive === true && Array.isArray(killSwitchDecision.killedPaths) && killSwitchDecision.killedPaths.includes("agent-runtime")) {
      return [
        this.eventBus.emit("task.failed", {
          assignmentEventId: null,
          projectId: projectId ?? null,
          taskId: null,
          agentId: null,
          reason: "kill-switch-active",
          killedPaths: killSwitchDecision.killedPaths,
          triggeredBy: killSwitchDecision.triggeredBy,
        }),
      ];
    }

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
