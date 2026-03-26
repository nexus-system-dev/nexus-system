export class DevAgentWorker {
  constructor({ agentIds = ["dev-agent", "backend-1", "devops-1"] } = {}) {
    this.agentIds = agentIds;
  }

  canHandle(assignment) {
    return this.agentIds.includes(assignment.agentId);
  }

  execute(assignment) {
    return {
      worker: "dev-agent",
      summary: `Executed ${assignment.task.summary}`,
      deliveredArtifacts: [
        `lock:${assignment.lockKey}`,
        `lane:${assignment.task.lane}`,
      ],
      successCriteria: assignment.task.successCriteria,
    };
  }
}
