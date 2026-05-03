import test from "node:test";
import assert from "node:assert/strict";

import { createCanonicalBacklogRegenerationBridge } from "../src/core/canonical-backlog-regeneration-bridge.js";

function createInventory(total) {
  return Array.from({ length: total }, (_, index) => ({
    execution_order: String(index + 1).padStart(3, "0"),
    taskName: `Task ${String(index + 1).padStart(3, "0")}`,
    state: "trueGreen",
  }));
}

function createReadyInputs(overrides = {}) {
  return {
    projectId: "wave3-project",
    canonicalTaskInventory: createInventory(103),
    importAndContinueRoadmap: {
      roadmapId: "import-roadmap-1",
      status: "ready",
      roadmapItems: [
        {
          taskId: "import-1",
          title: "Wire CRM export into activation tracking",
          detail: "Normalize imported CSV fields before activation analytics.",
          priority: "high",
          sourceType: "analytics",
          evidence: ["ga4.csv", "crm-export.csv"],
          dependencyIds: [],
        },
        {
          taskId: "import-2",
          title: "Harden billing import path",
          detail: "Resolve missing billing sync for imported users.",
          priority: "medium",
          sourceType: "repository",
          evidence: ["billing.ts", "README.md"],
          dependencyIds: ["import-1"],
        },
      ],
    },
    postExecutionEvaluation: {
      status: "healthy",
    },
    postExecutionReport: {
      postExecutionReportId: "report-1",
      status: "ready",
    },
    crossLayerFeedbackState: {
      status: "coordinated",
      feedbackActions: ["improve-quality", "review-onboarding"],
    },
    adaptiveExecutionDecision: {
      adaptiveExecutionDecisionId: "adaptive-1",
      status: "ready",
      nextAction: "continue-execution",
    },
    systemOptimizationPlan: {
      systemOptimizationPlanId: "optimization-1",
      status: "ready",
      optimizationTargets: ["increase-throughput"],
    },
    productIterationInsights: {
      recommendations: [
        {
          recommendationId: "rec-1",
          area: "activation",
          insight: "Imported users drop before first value.",
          priority: "high",
          actionType: "improve-quality",
        },
      ],
    },
    ...overrides,
  };
}

test("canonical backlog regeneration bridge promotes supported roadmap items into canonical task proposals", () => {
  const { canonicalBacklogRegeneration } = createCanonicalBacklogRegenerationBridge(createReadyInputs());

  assert.equal(canonicalBacklogRegeneration.status, "ready");
  assert.equal(canonicalBacklogRegeneration.insertionPlan.nextExecutionOrderStart, "104");
  assert.equal(canonicalBacklogRegeneration.proposedCanonicalTasks.length, 2);
  assert.equal(canonicalBacklogRegeneration.proposedCanonicalTasks[0].execution_order, "104");
  assert.equal(canonicalBacklogRegeneration.proposedCanonicalTasks[1].execution_order, "105");
  assert.equal(
    canonicalBacklogRegeneration.proposedCanonicalTasks[0].taskName,
    "Continue imported analytics: Wire CRM export into activation tracking",
  );
  assert.deepEqual(
    canonicalBacklogRegeneration.proposedCanonicalTasks[1].dependencies.upstreamExecutionOrders,
    ["104"],
  );
});

test("canonical backlog regeneration bridge rejects weak insights from creating canonical tasks", () => {
  const { canonicalBacklogRegeneration } = createCanonicalBacklogRegenerationBridge(
    createReadyInputs({
      crossLayerFeedbackState: {
        status: "coordinated",
        feedbackActions: [],
      },
      systemOptimizationPlan: {
        status: "ready",
        optimizationTargets: [],
      },
      productIterationInsights: {
        recommendations: [
          {
            recommendationId: "rec-weak",
            area: "activation",
            insight: "",
            priority: "low",
            actionType: null,
          },
        ],
      },
    }),
  );

  assert.equal(canonicalBacklogRegeneration.status, "insufficient-evidence");
  assert.equal(canonicalBacklogRegeneration.proposedCanonicalTasks.length, 0);
  assert.equal(canonicalBacklogRegeneration.rejectionReasons.includes("no-supported-insights"), true);
  assert.equal(canonicalBacklogRegeneration.rejectionReasons.includes("no-feedback-actions"), true);
  assert.equal(canonicalBacklogRegeneration.rejectionReasons.includes("no-optimization-targets"), true);
});
