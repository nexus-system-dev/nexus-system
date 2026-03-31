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
