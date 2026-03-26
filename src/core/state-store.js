export class CanonicalStateStore {
  constructor() {
    this.projects = new Map();
  }

  updateProject(projectId, incomingState, roadmap = [], executionGraph = { nodes: [], edges: [] }) {
    const previous = this.projects.get(projectId);
    const version = previous ? previous.version + 1 : 1;

    const snapshot = {
      projectId,
      version,
      state: {
        ...incomingState,
      },
      roadmap,
      executionGraph,
      updatedAt: new Date().toISOString(),
    };

    this.projects.set(projectId, snapshot);
    return snapshot;
  }

  getProject(projectId) {
    return this.projects.get(projectId) ?? null;
  }
}
