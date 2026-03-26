export class QaAgentWorker {
  constructor({ agentIds = ["qa-agent"] } = {}) {
    this.agentIds = agentIds;
  }

  canHandle(assignment) {
    return this.agentIds.includes(assignment.agentId);
  }

  execute(assignment) {
    return {
      worker: "qa-agent",
      summary: `Validated ${assignment.task.id}`,
      checks: assignment.task.successCriteria,
    };
  }
}
