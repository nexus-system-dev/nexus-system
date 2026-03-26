import test from "node:test";
import assert from "node:assert/strict";

import { createProjectBrainWorkspace } from "../src/core/project-brain-workspace.js";

test("project brain workspace returns state, blockers, reasoning and next action", () => {
  const { projectBrainWorkspace } = createProjectBrainWorkspace({
    projectState: {
      projectId: "nexus-app",
      domain: "saas",
      lifecycle: { phase: "build" },
      bottleneck: { title: "Database Schema", reason: "Missing schema" },
      businessBottleneck: { title: "Acquisition funnel is not defined" },
      decisionIntelligence: { summary: { requiresApproval: true } },
      failureSummary: { categories: ["tests"], bottleneck: "Database Schema" },
      recommendedActions: [{ title: "Define database schema" }],
    },
    policyTrace: {
      requiresApproval: true,
      reason: "Production deploy requires approval",
      blockingSources: ["deploy"],
    },
    learningInsights: {
      summary: "No reusable pattern yet",
      items: [{ id: "insight-1", title: "Auth flow rejected before deploy" }],
    },
  });

  assert.equal(projectBrainWorkspace.workspaceId, "project-brain:nexus-app");
  assert.equal(projectBrainWorkspace.overview.nextAction, "Define database schema");
  assert.equal(projectBrainWorkspace.systemUnderstanding.bottleneck.title, "Database Schema");
  assert.equal(projectBrainWorkspace.blockers.length, 3);
  assert.equal(projectBrainWorkspace.reasoning.policyTrace.reason, "Production deploy requires approval");
  assert.equal(projectBrainWorkspace.summary.requiresApproval, true);
});

test("project brain workspace falls back to canonical defaults", () => {
  const { projectBrainWorkspace } = createProjectBrainWorkspace();

  assert.equal(projectBrainWorkspace.workspaceId, "project-brain:unknown-project");
  assert.equal(Array.isArray(projectBrainWorkspace.blockers), true);
  assert.equal(Array.isArray(projectBrainWorkspace.reasoning.recommendedActions), true);
  assert.equal(Array.isArray(projectBrainWorkspace.learningInsights.items), true);
});
