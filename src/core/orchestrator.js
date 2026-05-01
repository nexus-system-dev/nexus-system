import { StrategicPlanner } from "./planner.js";
import { Dispatcher } from "./dispatcher.js";
import { CanonicalStateStore } from "./state-store.js";
import { AgentMemoryStore } from "./memory.js";
import { EventBus } from "./event-bus.js";
import { buildExecutionGraph, reconcileRoadmap } from "./project-graph.js";
import { mapMaintenanceBacklogToRoadmapTasks } from "./maintenance-task-intake-mapper.js";

function summarizeTask(task) {
  return {
    id: task.id,
    taskType: task.taskType,
    lane: task.lane,
    summary: task.summary,
    successCriteria: task.successCriteria,
    dependencies: task.dependencies,
    lockKey: task.lockKey,
    status: task.status,
  };
}

function summarizeMemory(memory) {
  return {
    agentId: memory.agentId,
    projectId: memory.projectId,
    projectVersion: memory.projectVersion,
    businessGoal: memory.businessGoal,
    task: memory.task,
    constraints: memory.constraints,
    recentEvents: memory.recentEvents,
  };
}

export class NexusOrchestrator {
  constructor({
    planner = new StrategicPlanner(),
    dispatcher = new Dispatcher(),
    stateStore = new CanonicalStateStore(),
    memoryStore = new AgentMemoryStore(),
    eventBus = new EventBus(),
  } = {}) {
    this.planner = planner;
    this.dispatcher = dispatcher;
    this.stateStore = stateStore;
    this.memoryStore = memoryStore;
    this.eventBus = eventBus;
  }

  runCycle({
    projectId = "default-project",
    projectState,
    agents,
    completedTaskIds = new Set(),
    activeLocks = new Set(),
  }) {
    const normalizedState = {
      ...projectState,
      activeLocks: [...activeLocks],
    };
    const initialSnapshot = this.stateStore.updateProject(projectId, normalizedState);
    this.eventBus.emit("state.updated", {
      projectId,
      version: initialSnapshot.version,
    });

    const plannedRoadmap = this.planner.generateInitialRoadmap(initialSnapshot.state);
    const { mergedTasks: roadmapWithMaintenance } = mapMaintenanceBacklogToRoadmapTasks({
      maintenanceBacklog: initialSnapshot.state?.maintenanceBacklog ?? null,
      existingTasks: plannedRoadmap,
    });
    const roadmap = reconcileRoadmap(roadmapWithMaintenance, {
      completedTaskIds,
    });
    const executionGraph = buildExecutionGraph(roadmap, {
      completedTaskIds,
    });
    const projectSnapshot = this.stateStore.updateProject(projectId, normalizedState, roadmap, executionGraph);
    this.eventBus.emit("roadmap.generated", {
      projectId,
      version: projectSnapshot.version,
      taskIds: roadmap.map((task) => task.id),
      executionGraph,
    });

    const rawAssignments = this.dispatcher.dispatch({
      tasks: roadmap,
      agents,
      completedTaskIds,
      activeLocks,
    });

    const recentEvents = this.eventBus.getRecentEvents(20);
    const assignments = rawAssignments.map((assignment) => {
      const task = roadmap.find((roadmapTask) => roadmapTask.id === assignment.taskId);
      const agent = agents.find((candidate) => candidate.id === assignment.agentId);
      const memory = this.memoryStore.buildMemory({
        projectSnapshot,
        agent,
        task,
        recentEvents,
      });

      this.eventBus.emit("task.assigned", {
        projectId,
        version: projectSnapshot.version,
        agentId: agent.id,
        lockKey: assignment.lockKey,
        task: summarizeTask(task),
        memory: summarizeMemory(memory),
      });

      return {
        ...assignment,
        memory: summarizeMemory(memory),
      };
    });

    const activeTaskIds = new Set(rawAssignments.map((assignment) => assignment.taskId));
    const normalizedRoadmap = reconcileRoadmap(roadmap, {
      completedTaskIds,
      activeTaskIds,
    });
    const normalizedGraph = buildExecutionGraph(normalizedRoadmap, {
      completedTaskIds,
      activeTaskIds,
    });

    return {
      project: projectSnapshot,
      roadmap: normalizedRoadmap,
      executionGraph: normalizedGraph,
      assignments,
      events: this.eventBus.getRecentEvents(20),
    };
  }
}
