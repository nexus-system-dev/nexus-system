import test from "node:test";
import assert from "node:assert/strict";

import { buildObservedProjectState } from "../src/core/project-state.js";
import {
  defineLifecycleState,
  generateLifecycleMilestones,
  resolveLifecyclePhase,
  resolveLifecycleTransition,
} from "../src/core/project-lifecycle.js";
import { ingestTaskResults } from "../src/core/task-result-ingestion.js";

test("observed project state is derived from real synced sources", () => {
  const state = buildObservedProjectState({
    goal: "להשלים את הקזינו",
    state: {
      product: {
        hasAuth: false,
      },
      analytics: {},
      knowledge: {
        knownGaps: ["גאפ ידני"],
      },
      stack: {
        frontend: "לא זוהה",
        backend: "לא זוהה",
        database: "לא זוהה",
      },
    },
    scan: {
      findings: {
        hasAuth: true,
        hasMigrations: false,
        hasTests: true,
      },
      stack: {
        frontend: ["Expo"],
        backend: ["Express"],
        database: ["Postgres"],
      },
      gaps: ["לא זוהו קבצי migrations או ניהול סכימה"],
      knowledge: {
        summary: "README",
        readme: { path: "README.md" },
        docs: [{ path: "docs/roadmap.md" }],
      },
    },
    externalSnapshot: {
      syncedAt: "2026-01-01T00:00:00.000Z",
      health: {
        status: "degraded",
        blockingIssues: ["db unknown"],
      },
      features: {
        hasAuth: true,
        hasPayments: false,
        hasWallet: true,
        hasAnalytics: false,
      },
      technical: {
        stack: {
          frontend: "Expo React Native",
          backend: "Node.js + Express",
          database: "PostgreSQL planned",
        },
        knownTechnicalGaps: ["no migrations"],
      },
      roadmapContext: {
        knownMissingParts: ["Wallet"],
      },
    },
    gitSnapshot: {
      provider: "github",
      syncedAt: "2026-01-01T00:00:00.000Z",
      repo: {
        fullName: "openai/nexus",
      },
      branches: [{ name: "main" }],
      commits: [{ sha: "abc" }],
      pullRequests: [{ id: 1 }],
    },
    runtimeSnapshot: {
      syncedAt: "2026-01-01T00:00:00.000Z",
      ci: [{ status: "failed" }],
      deployments: [{ status: "degraded" }],
      errorLogs: [{ count: 2 }],
      monitoring: [{ status: "alert" }],
      analytics: { activeUsers: 100 },
      productMetrics: { activationRate: 0.4 },
      testResults: [{ status: "passed" }],
    },
  });

  assert.equal(state.product.hasAuth, true);
  assert.equal(state.product.hasWallet, true);
  assert.equal(state.stack.backend, "Node.js + Express");
  assert.equal(state.knowledge.git.repo, "openai/nexus");
  assert.equal(state.knowledge.runtime.ciStatus, "failed");
  assert.equal(state.analytics.runtime.activeUsers, 100);
  assert.equal(state.observed.health.status, "blocked");
  assert.equal(state.observed.health.blockers.includes("CI אינו ירוק"), true);
});

test("lifecycle state model returns current phase and phase history", () => {
  const ingestedTaskResults = ingestTaskResults({
    runtimeResults: [
      {
        id: "evt-1",
        type: "task.completed",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "backend",
          agentId: "dev-agent",
          assignmentEventId: "assign-1",
        },
      },
    ],
  });
  const lifecycle = defineLifecycleState({
    domain: "saas",
    project: {
      goal: "להשיק MVP",
      state: {
        knowledge: {
          documents: {
            summary: "intake exists",
          },
        },
      },
      cycle: {
        executionGraph: {
          nodes: [
            { id: "task-1", status: "done" },
            { id: "task-2", status: "running" },
          ],
        },
      },
      taskResults: ingestedTaskResults.taskResults,
    },
    previousLifecycle: {
      phaseHistory: ["vision", "intake", "planning"],
    },
  });

  assert.equal(lifecycle.currentPhase, "execution");
  assert.equal(typeof lifecycle.phaseConfidence, "number");
  assert.deepEqual(lifecycle.phaseHistory, ["vision", "intake", "planning", "execution"]);
  assert.equal(lifecycle.domain, "saas");
  assert.equal(Array.isArray(lifecycle.milestones), true);
  assert.equal(Array.isArray(lifecycle.completionCriteria), true);
  assert.equal(lifecycle.milestones.includes("core-product-loop-in-progress"), true);
  assert.equal(lifecycle.transitionRecord.nextPhase, "execution");
  assert.deepEqual(lifecycle.transitionRecord.triggeringEvents, ["task.completed"]);
});

test("lifecycle milestone generator returns milestones and completion criteria by domain and phase", () => {
  const lifecycleMilestones = generateLifecycleMilestones({
    domain: "mobile-app",
    lifecyclePhase: "planning",
  });

  assert.deepEqual(lifecycleMilestones.milestones, [
    "core-context-built",
    "initial-plan-drafted",
    "app-shell-defined",
    "device-flow-defined",
  ]);
  assert.equal(lifecycleMilestones.completionCriteria.includes("שלד האפליקציה מוגדר"), true);
  assert.equal(lifecycleMilestones.completionCriteria.includes("יש תוכנית התחלתית להמשך"), true);
});

test("lifecycle phase resolver uses state graph and runtime signals", () => {
  const resolved = resolveLifecyclePhase({
    projectState: {
      businessGoal: "להשיק MVP",
      knowledge: {
        documents: {
          summary: "יש איפיון",
        },
      },
    },
    executionGraph: {
      nodes: [
        { id: "task-1", status: "ready" },
        { id: "task-2", status: "blocked" },
      ],
    },
    runtimeSignals: {
      ci: [],
      deployments: [],
      testResults: [],
      errorLogs: [],
    },
    domain: "saas",
  });

  assert.equal(resolved.resolvedPhase, "execution");
  assert.equal(typeof resolved.phaseConfidence, "number");
  assert.equal(resolved.phaseConfidence > 0.8, true);
});

test("lifecycle transition engine returns next phase and transition record", () => {
  const transition = resolveLifecycleTransition({
    currentPhase: "planning",
    nextPhase: "execution",
    transitionEvents: [
      { type: "task.assigned" },
      { type: "task.completed" },
    ],
  });

  assert.equal(transition.nextPhase, "execution");
  assert.equal(transition.transitionRecord.previousPhase, "planning");
  assert.equal(transition.transitionRecord.nextPhase, "execution");
  assert.equal(transition.transitionRecord.didTransition, true);
  assert.equal(transition.transitionRecord.isForwardTransition, true);
  assert.deepEqual(transition.transitionRecord.triggeringEvents, ["task.assigned", "task.completed"]);
});

test("task result ingestion returns canonical task results for lifecycle transitions", () => {
  const ingested = ingestTaskResults({
    runtimeResults: [
      {
        id: "evt-1",
        type: "task.completed",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "backend",
          agentId: "dev-agent",
          assignmentEventId: "assign-1",
          output: { summary: "done" },
        },
      },
      {
        id: "evt-2",
        type: "task.failed",
        timestamp: "2026-01-01T00:01:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-2",
          taskType: "frontend",
          agentId: "qa-agent",
          assignmentEventId: "assign-2",
          reason: "failure",
        },
      },
    ],
  });

  assert.equal(ingested.taskResults.length, 2);
  assert.equal(ingested.taskResults[0].status, "completed");
  assert.equal(ingested.taskResults[0].taskType, "backend");
  assert.equal(ingested.taskResults[1].status, "failed");
  assert.equal(ingested.taskResults[1].taskType, "frontend");
  assert.deepEqual(ingested.transitionEvents.map((event) => event.type), ["task.completed", "task.failed"]);
});

test("task result ingestion maps task.retried to canonical retried status", () => {
  const ingested = ingestTaskResults({
    runtimeResults: [
      {
        id: "evt-retry-1",
        type: "task.retried",
        timestamp: "2026-01-01T00:02:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-1",
          taskType: "backend",
          agentId: "dev-agent",
          assignmentEventId: "assign-3",
        },
      },
    ],
  });

  assert.equal(ingested.taskResults.length, 1);
  assert.equal(ingested.taskResults[0].status, "retried");
  assert.equal(ingested.taskResults[0].taskType, "backend");
  assert.deepEqual(ingested.transitionEvents.map((event) => event.type), ["task.retried"]);
});
