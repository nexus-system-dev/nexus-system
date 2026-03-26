import { buildExecutionGraph } from "./project-graph.js";

function toBootstrapGraphTasks(bootstrapTasks = [], validationResult = {}) {
  const isValid = validationResult?.isValid === true;

  return bootstrapTasks.map((task) => ({
    id: task.id,
    lane: "bootstrap",
    summary: task.summary,
    successCriteria: task.expectedArtifacts ?? [],
    dependencies: [],
    lockKey: task.id,
    status: isValid ? "done" : "blocked",
  }));
}

export function createBootstrapStateUpdater({
  validationResult = null,
  bootstrapTasks = [],
  projectState = {},
} = {}) {
  const completedTaskIds = new Set(
    validationResult?.isValid ? bootstrapTasks.map((task) => task.id) : [],
  );
  const updatedExecutionGraph = buildExecutionGraph(
    toBootstrapGraphTasks(bootstrapTasks, validationResult),
    { completedTaskIds },
  );

  const updatedProjectState = {
    ...projectState,
    bootstrap: {
      status: validationResult?.isValid ? "validated" : "blocked",
      validationResult,
      completedTaskIds: [...completedTaskIds],
      taskCount: bootstrapTasks.length,
    },
  };

  return {
    updatedProjectState,
    updatedExecutionGraph,
  };
}
