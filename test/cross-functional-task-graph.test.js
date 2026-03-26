import test from "node:test";
import assert from "node:assert/strict";

import { buildCrossFunctionalTaskGraph } from "../src/core/cross-functional-task-graph.js";

test("cross-functional task graph combines technical product growth and ops tasks", () => {
  const graph = buildCrossFunctionalTaskGraph({
    roadmap: [
      {
        id: "saas-auth",
        summary: "Build auth",
        lane: "build",
        status: "ready",
        requiredCapabilities: ["backend", "security"],
        dependencies: [],
      },
      {
        id: "saas-onboarding",
        summary: "Build onboarding",
        lane: "growth",
        status: "blocked",
        requiredCapabilities: ["frontend", "product"],
        dependencies: ["saas-auth"],
      },
      {
        id: "ops-reporting",
        summary: "Set up reporting",
        lane: "maintenance",
        status: "ready",
        requiredCapabilities: ["operations"],
        dependencies: ["saas-onboarding"],
      },
    ],
    businessContext: {
      gtmStage: "build",
    },
    businessBottleneck: {
      title: "Acquisition funnel is not defined",
    },
  });

  assert.equal(graph.nodes.length, 3);
  assert.equal(graph.edges.length, 2);
  assert.equal(graph.summary.hasTechnical, true);
  assert.equal(graph.summary.hasProduct, true);
  assert.equal(graph.summary.hasOps, true);
  assert.equal(graph.summary.businessBottleneck, "Acquisition funnel is not defined");
  assert.equal(graph.summary.gtmStage, "build");
});
