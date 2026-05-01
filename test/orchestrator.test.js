import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { NexusOrchestrator } from "../src/core/orchestrator.js";
import { EventBus } from "../src/core/event-bus.js";
import { FileEventLog } from "../src/core/file-event-log.js";
import { AgentRuntime } from "../src/core/agent-runtime.js";
import { DevAgentWorker } from "../src/agents/dev-agent/worker.js";
import { MarketingAgentWorker } from "../src/agents/marketing-agent/worker.js";

function createTestEventBus() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-events-"));
  return new EventBus({
    eventLog: new FileEventLog({
      filePath: path.join(directory, "events.ndjson"),
    }),
  });
}

test("planner generates initial roadmap from obvious project gaps", () => {
  const orchestrator = new NexusOrchestrator({ eventBus: createTestEventBus() });

  const result = orchestrator.runCycle({
    projectId: "project-alpha",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: false,
        hasPaymentIntegration: false,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    agents: [],
  });

  assert.deepEqual(
    result.roadmap.map((task) => task.id),
    ["build-auth", "setup-staging", "landing-page", "payment-integration", "campaign-plan"],
  );
  assert.equal(result.project.projectId, "project-alpha");
  assert.equal(result.project.roadmap.length, 5);
  assert.deepEqual(result.executionGraph.edges, [
    { from: "setup-staging", to: "landing-page" },
    { from: "build-auth", to: "payment-integration" },
    { from: "setup-staging", to: "payment-integration" },
    { from: "landing-page", to: "campaign-plan" },
    { from: "payment-integration", to: "campaign-plan" },
  ]);
});

test("dispatcher assigns only tasks whose dependencies are satisfied", () => {
  const orchestrator = new NexusOrchestrator({ eventBus: createTestEventBus() });

  const result = orchestrator.runCycle({
    projectId: "project-beta",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: false,
        hasPaymentIntegration: false,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    agents: [
      { id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] },
      { id: "frontend-1", capabilities: ["frontend", "copywriting"] },
      { id: "backend-1", capabilities: ["backend", "security", "payments"] },
      { id: "growth-1", capabilities: ["marketing", "analytics"] },
    ],
  });

  assert.deepEqual(
    result.assignments.map(({ taskId, agentId, lockKey }) => ({ taskId, agentId, lockKey })),
    [
      { taskId: "build-auth", agentId: "dev-agent", lockKey: "auth" },
      { taskId: "setup-staging", agentId: "dev-agent", lockKey: "staging" },
    ],
  );
  assert.equal(result.assignments[0].memory.projectId, "project-beta");
  assert.equal(result.assignments[0].memory.task.id, "build-auth");
  assert.equal(result.assignments[0].memory.task.taskType, "backend");
});

test("dispatcher respects active locks", () => {
  const orchestrator = new NexusOrchestrator({ eventBus: createTestEventBus() });

  const result = orchestrator.runCycle({
    projectId: "project-gamma",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: true,
        hasLandingPage: false,
        hasPaymentIntegration: false,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    activeLocks: new Set(["landing-page"]),
    agents: [
      { id: "frontend-1", capabilities: ["frontend", "copywriting"] },
      { id: "backend-1", capabilities: ["backend", "security", "payments"] },
      { id: "growth-1", capabilities: ["marketing", "analytics"] },
    ],
  });

  assert.deepEqual(
    result.assignments.map(({ taskId, agentId, lockKey }) => ({ taskId, agentId, lockKey })),
    [{ taskId: "build-auth", agentId: "backend-1", lockKey: "auth" }],
  );
});

test("orchestrator emits the core event stream", () => {
  const eventBus = createTestEventBus();
  const orchestrator = new NexusOrchestrator({ eventBus });

  const result = orchestrator.runCycle({
    projectId: "project-events",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: true,
        hasLandingPage: false,
        hasPaymentIntegration: true,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    agents: [
      { id: "backend-1", capabilities: ["backend", "security"] },
      { id: "marketing-agent", capabilities: ["frontend", "copywriting"] },
    ],
  });

  assert.deepEqual(
    result.events.map((event) => event.type),
    ["state.updated", "roadmap.generated", "task.assigned", "task.assigned"],
  );
  assert.equal(eventBus.getEvents().length, 4);
  assert.equal(eventBus.getEvents().filter((event) => event.type === "task.assigned").every((event) => typeof event.payload.task.taskType === "string"), true);
});

test("agent runtime consumes assignments and emits completions", () => {
  const eventBus = createTestEventBus();
  const orchestrator = new NexusOrchestrator({ eventBus });
  const runtime = new AgentRuntime({
    eventBus,
    workers: [new DevAgentWorker(), new MarketingAgentWorker()],
  });

  orchestrator.runCycle({
    projectId: "project-runtime",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: true,
        hasPaymentIntegration: true,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    agents: [{ id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] }],
  });

  const results = runtime.processPendingAssignments({ projectId: "project-runtime" });

  assert.equal(results.length, 2);
  assert.deepEqual(
    eventBus.getEvents().slice(-2).map((event) => event.type),
    ["task.completed", "task.completed"],
  );
});

test("agent runtime emits task.retried before the final outcome when the same task reruns after a failure", () => {
  const eventBus = createTestEventBus();
  let attempts = 0;
  const runtime = new AgentRuntime({
    eventBus,
    workers: [{
      canHandle: () => true,
      execute: () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error("first-attempt-failed");
        }

        return { summary: "second-attempt-succeeded" };
      },
    }],
  });

  eventBus.emit("task.assigned", {
    projectId: "project-runtime",
    agentId: "dev-agent",
    task: { id: "task-1", taskType: "backend" },
  });

  const firstResults = runtime.processPendingAssignments({ projectId: "project-runtime" });

  assert.deepEqual(firstResults.map((event) => event.type), ["task.failed"]);

  eventBus.emit("task.assigned", {
    projectId: "project-runtime",
    agentId: "dev-agent",
    task: { id: "task-1", taskType: "backend" },
  });

  const secondResults = runtime.processPendingAssignments({ projectId: "project-runtime" });

  assert.deepEqual(secondResults.map((event) => event.type), ["task.retried", "task.completed"]);
  assert.deepEqual(secondResults.map((event) => event.payload.taskType), ["backend", "backend"]);
  assert.equal(secondResults[0].payload.taskId, "task-1");
  assert.equal(secondResults[0].payload.assignmentEventId != null, true);
});

test("orchestrator prioritizes maintenance tasks ahead of planner tasks when incident backlog is active", () => {
  const orchestrator = new NexusOrchestrator({ eventBus: createTestEventBus() });

  const result = orchestrator.runCycle({
    projectId: "project-maintenance-priority",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: false,
        hasPaymentIntegration: false,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
      maintenanceBacklog: {
        maintenanceBacklogId: "maintenance-backlog:test",
        status: "ready",
        items: [
          {
            maintenanceTaskId: "maintenance-backlog:test:stabilize",
            taskType: "ops",
            lane: "maintenance",
            summary: "Stabilize incident",
            requiredCapabilities: ["devops"],
            priority: 100,
            successCriteria: ["stabilize"],
            dependencies: [],
            lockKey: "maintenance-stabilize:test",
          },
        ],
      },
    },
    agents: [
      { id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] },
    ],
  });

  assert.equal(result.assignments[0].taskId, "maintenance-backlog:test:stabilize");
});

test("orchestrator promotes pending maintenance follow-up to ready once dependency is completed", () => {
  const orchestrator = new NexusOrchestrator({ eventBus: createTestEventBus() });

  const result = orchestrator.runCycle({
    projectId: "project-maintenance-unblock",
    projectState: {
      businessGoal: "Stabilize runtime",
      maintenanceBacklog: {
        maintenanceBacklogId: "maintenance-backlog:test",
        status: "ready",
        items: [
          {
            maintenanceTaskId: "maintenance-backlog:test:stabilize",
            taskType: "ops",
            lane: "maintenance",
            summary: "Stabilize incident",
            requiredCapabilities: ["devops"],
            priority: 100,
            successCriteria: ["stabilize"],
            dependencies: [],
            lockKey: "maintenance-stabilize:test",
          },
          {
            maintenanceTaskId: "maintenance-backlog:test:root-cause",
            taskType: "analysis",
            lane: "maintenance",
            summary: "Investigate root cause",
            requiredCapabilities: ["devops"],
            priority: 80,
            successCriteria: ["analyze"],
            dependencies: ["maintenance-backlog:test:stabilize"],
            lockKey: "maintenance-root-cause:test",
          },
        ],
      },
    },
    completedTaskIds: new Set(["maintenance-backlog:test:stabilize"]),
    agents: [
      { id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] },
    ],
  });

  assert.equal(
    result.roadmap.some((task) => task.id === "maintenance-backlog:test:root-cause" && task.status === "assigned"),
    true,
  );
});

test("agent runtime stops execution when kill switch blocks agent runtime", () => {
  const eventBus = createTestEventBus();
  const orchestrator = new NexusOrchestrator({ eventBus });
  const runtime = new AgentRuntime({
    eventBus,
    workers: [new DevAgentWorker(), new MarketingAgentWorker()],
    killSwitchDecisionResolver: () => ({
      isActive: true,
      killedPaths: ["agent-runtime"],
      triggeredBy: "incident",
    }),
  });

  orchestrator.runCycle({
    projectId: "project-runtime",
    projectState: {
      businessGoal: "Grow paid users",
      product: {
        hasAuth: false,
        hasStagingEnvironment: false,
        hasLandingPage: true,
        hasPaymentIntegration: true,
      },
      analytics: {
        hasBaselineCampaign: false,
      },
    },
    agents: [{ id: "dev-agent", capabilities: ["devops", "backend", "security", "payments"] }],
  });

  const results = runtime.processPendingAssignments({ projectId: "project-runtime" });

  assert.equal(results.length, 1);
  assert.equal(eventBus.getEvents().at(-1).type, "task.failed");
  assert.equal(eventBus.getEvents().at(-1).payload.reason, "kill-switch-active");
});

test("event log persists events across bus instances", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-persist-"));
  const filePath = path.join(directory, "events.ndjson");
  const firstBus = new EventBus({
    eventLog: new FileEventLog({ filePath }),
  });

  firstBus.emit("state.updated", { projectId: "persisted", version: 1 });

  const secondBus = new EventBus({
    eventLog: new FileEventLog({ filePath }),
  });

  assert.equal(secondBus.getEvents().length, 1);
  assert.equal(secondBus.getEvents()[0].payload.projectId, "persisted");
});
