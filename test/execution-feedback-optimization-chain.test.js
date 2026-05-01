import test from "node:test";
import assert from "node:assert/strict";

import { createOutcomeFeedbackLoop } from "../src/core/outcome-feedback-loop.js";
import { createGoalProgressEvaluator } from "../src/core/goal-progress-evaluator.js";
import { createMilestoneTrackingSystem } from "../src/core/milestone-tracking-system.js";
import { definePostExecutionEvaluationSchema } from "../src/core/post-execution-evaluation-schema.js";
import { createPostExecutionEvaluationPipeline } from "../src/core/post-execution-evaluation-pipeline.js";
import { createCrossLayerFeedbackOrchestrator } from "../src/core/cross-layer-feedback-orchestrator.js";
import { createAdaptiveExecutionLoop } from "../src/core/adaptive-execution-loop.js";
import { createSystemOptimizationCycle } from "../src/core/system-optimization-cycle.js";

test("execution feedback optimization chain produces canonical downstream states", () => {
  const { outcomeFeedbackState } = createOutcomeFeedbackLoop({
    projectId: "giftwallet",
    outcomeEvaluation: { status: "mixed" },
    actionSuccessScore: { score: 0.4 },
    taskThroughputSummary: {
      totalCompleted: 2,
      totalFailed: 1,
      totalRetried: 1,
      totalBlocked: 1,
    },
    productivitySummary: { totalTimeSavedMs: 0 },
  });
  const { goalProgressState } = createGoalProgressEvaluator({
    projectId: "giftwallet",
    goal: "Ship launch-ready workflow",
    outcomeFeedbackState,
    progressState: { status: "in-progress", progressPercent: 44 },
    actionSuccessScore: { score: 0.4 },
  });
  const { milestoneTracking } = createMilestoneTrackingSystem({
    projectId: "giftwallet",
    goalProgressState,
    activationMilestones: {
      milestones: [
        { milestone: "signup", reached: true },
        { milestone: "first-project", reached: false },
      ],
    },
    firstValueOutput: { summary: { hasVisibleOutcome: false } },
  });
  const { postExecutionEvaluation } = definePostExecutionEvaluationSchema({
    projectId: "giftwallet",
    executionConsistencyReport: { status: "consistent", summary: { isConsistent: true } },
    systemBottleneckSummary: { status: "blocked", summary: "Queue lag reached 60s", bottleneckType: "queue-lag" },
    outcomeFeedbackState,
    milestoneTracking,
  });
  const { postExecutionReport } = createPostExecutionEvaluationPipeline({
    projectId: "giftwallet",
    postExecutionEvaluation,
    executionConsistencyReport: { status: "consistent", summary: { requiresManualReview: false } },
    systemBottleneckSummary: { severity: "high", bottleneckType: "queue-lag" },
  });
  const { crossLayerFeedbackState } = createCrossLayerFeedbackOrchestrator({
    projectId: "giftwallet",
    postExecutionReport,
    productIterationInsights: {
      recommendations: [{ actionType: "improve-quality" }],
    },
    goalProgressState,
    milestoneTracking,
  });
  const { adaptiveExecutionDecision } = createAdaptiveExecutionLoop({
    projectId: "giftwallet",
    crossLayerFeedbackState,
    activeBottleneck: { summary: { isBlocking: true } },
    taskThroughputSummary: { totalBlocked: 1 },
    progressState: { status: "in-progress" },
  });
  const { systemOptimizationPlan } = createSystemOptimizationCycle({
    projectId: "giftwallet",
    adaptiveExecutionDecision,
    serviceReliabilityDashboard: { incidentStatus: "active" },
    systemBottleneckSummary: { bottleneckType: "queue-lag", signals: [{ type: "queue-lag" }] },
  });

  assert.equal(outcomeFeedbackState.status, "attention-required");
  assert.equal(goalProgressState.goalHealth, "at-risk");
  assert.equal(milestoneTracking.status, "tracking");
  assert.equal(postExecutionEvaluation.status, "review-required");
  assert.equal(postExecutionReport.status, "needs-review");
  assert.equal(crossLayerFeedbackState.status, "intervention");
  assert.equal(adaptiveExecutionDecision.loopMode, "stabilize");
  assert.equal(systemOptimizationPlan.status, "ready");
  assert.equal(systemOptimizationPlan.optimizationTargets.includes("reduce-queue-lag"), true);
});
