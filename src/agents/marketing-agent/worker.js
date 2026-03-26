export class MarketingAgentWorker {
  constructor({ agentIds = ["marketing-agent", "growth-1", "frontend-1"] } = {}) {
    this.agentIds = agentIds;
  }

  canHandle(assignment) {
    return this.agentIds.includes(assignment.agentId);
  }

  execute(assignment) {
    return {
      worker: "marketing-agent",
      summary: `Prepared marketing deliverable for ${assignment.task.summary}`,
      businessGoal: assignment.memory.businessGoal,
      lane: assignment.task.lane,
    };
  }
}
