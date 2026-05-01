import test from "node:test";
import assert from "node:assert/strict";

import { createActionSuccessScoringEngine } from "../src/core/action-success-scoring-engine.js";

test("action success scoring engine derives high success score from successful outcome evaluation", () => {
  const { actionSuccessScore } = createActionSuccessScoringEngine({
    projectId: "giftwallet",
    outcomeEvaluation: {
      outcomeEvaluationId: "outcome-evaluation:giftwallet",
      status: "successful",
      latestOutcome: {
        status: "completed",
      },
      summary: {
        totalTaskResults: 2,
        totalCompleted: 2,
        totalFailed: 0,
        totalRetried: 0,
        totalBlocked: 0,
        totalTimeSavedMs: 240000,
      },
    },
  });

  assert.deepEqual(actionSuccessScore, {
    actionSuccessScoreId: "action-success-score:giftwallet",
    projectId: "giftwallet",
    status: "successful",
    score: 1,
    band: "high",
    summary: {
      totalTaskResults: 2,
      totalCompleted: 2,
      totalFailed: 0,
      totalRetried: 0,
      totalBlocked: 0,
      totalTimeSavedMs: 240000,
    },
    sourceOutcomeEvaluationId: "outcome-evaluation:giftwallet",
    latestOutcomeStatus: "completed",
  });
});

test("action success scoring engine derives medium success score from mixed outcome evaluation", () => {
  const { actionSuccessScore } = createActionSuccessScoringEngine({
    projectId: "giftwallet",
    outcomeEvaluation: {
      outcomeEvaluationId: "outcome-evaluation:giftwallet",
      status: "mixed",
      latestOutcome: {
        status: "retried",
      },
      summary: {
        totalTaskResults: 1,
        totalCompleted: 0,
        totalFailed: 0,
        totalRetried: 1,
        totalBlocked: 1,
        totalTimeSavedMs: 1050000,
      },
    },
  });

  assert.equal(actionSuccessScore.score, 0.5);
  assert.equal(actionSuccessScore.band, "medium");
  assert.equal(actionSuccessScore.latestOutcomeStatus, "retried");
});

test("action success scoring engine derives low success score from failed outcome evaluation", () => {
  const { actionSuccessScore } = createActionSuccessScoringEngine({
    projectId: "giftwallet",
    outcomeEvaluation: {
      outcomeEvaluationId: "outcome-evaluation:giftwallet",
      status: "failed",
      latestOutcome: {
        status: "failed",
      },
      summary: {
        totalTaskResults: 1,
        totalCompleted: 0,
        totalFailed: 1,
        totalRetried: 0,
        totalBlocked: 0,
        totalTimeSavedMs: 0,
      },
    },
  });

  assert.equal(actionSuccessScore.score, 0);
  assert.equal(actionSuccessScore.band, "low");
  assert.equal(actionSuccessScore.status, "failed");
});
