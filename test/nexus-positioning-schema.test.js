import test from "node:test";
import assert from "node:assert/strict";

import { defineNexusPositioningSchema } from "../src/core/nexus-positioning-schema.js";

test("nexus positioning schema returns a ready positioning model from explicit competitive context", () => {
  const { nexusPositioning } = defineNexusPositioningSchema({
    productVision: {
      statement: "Help teams launch production-ready Nexus workspaces faster",
      problem: "Teams struggle to move from prompt to execution with clear ownership",
      promise: "Nexus turns scoped intent into governed multi-agent execution",
      proofPoints: ["governed execution", "project-state updates"],
    },
    targetAudience: "product teams",
    competitiveContext: {
      competitors: ["Linear", "Jira"],
      alternatives: ["manual PM workflow"],
      differentiation: ["execution-native orchestration", "stateful project context"],
      strengths: ["faster iteration", "single execution state"],
      weaknesses: ["new product learning curve"],
    },
  });

  assert.deepEqual(nexusPositioning, {
    nexusPositioningId: "nexus-positioning-product-teams-help-teams-launch-production-ready-nexus-workspaces-faster",
    status: "ready",
    missingInputs: [],
    audience: "product teams",
    problem: "Teams struggle to move from prompt to execution with clear ownership",
    promise: "Nexus turns scoped intent into governed multi-agent execution",
    differentiation: ["execution-native orchestration", "stateful project context"],
    proofPoints: ["governed execution", "project-state updates"],
    competitiveContext: {
      competitors: ["Linear", "Jira"],
      alternatives: ["manual PM workflow"],
      differentiation: ["execution-native orchestration", "stateful project context"],
      strengths: ["faster iteration", "single execution state"],
      weaknesses: ["new product learning curve"],
    },
  });
});

test("nexus positioning schema exposes missing-inputs state when competitive context is absent", () => {
  const { nexusPositioning } = defineNexusPositioningSchema({
    productVision: {
      statement: "Help teams launch production-ready Nexus workspaces faster",
      problem: "Teams struggle to move from prompt to execution with clear ownership",
      promise: "Nexus turns scoped intent into governed multi-agent execution",
    },
    targetAudience: "product teams",
    competitiveContext: null,
  });

  assert.equal(nexusPositioning.status, "missing-inputs");
  assert.deepEqual(nexusPositioning.missingInputs, ["competitiveContext"]);
  assert.equal(nexusPositioning.competitiveContext, null);
  assert.deepEqual(nexusPositioning.differentiation, []);
});
