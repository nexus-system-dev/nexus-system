import test from "node:test";
import assert from "node:assert/strict";

import {
  buildHistoryContinuityAgentEnvelope,
  executeHistoryRestoreDecision,
  createHistoryRestoreDecision,
} from "../src/core/history-continuity-agent.js";

test("HIST-AGT-001 — small changes receive product-readable history without heavy checkpoint", () => {
  const agent = buildHistoryContinuityAgentEnvelope({
    project: {
      id: "hist-small",
      name: "ניהול לידים",
      mutationChangeHistory: [
        {
          historyRecordId: "mutation-history:small",
          changeType: "small",
          status: "applied",
          requiresApproval: false,
          requiresCheckpoint: false,
          historyRecord: {
            after: "נוסף שדה מקור ליד.",
          },
        },
      ],
      buildMutationHistory: [{ historyRecordId: "build-history:small" }],
      buildMutationTruth: { status: "applied" },
    },
  });

  assert.equal(agent.taskId, "HIST-AGT-001");
  assert.equal(agent.agentId, "history-continuity-agent");
  assert.equal(agent.responseSource, "agent-envelope");
  assert.equal(agent.productHistory[0].eventType, "small-change");
  assert.equal(agent.productHistory[0].requiresCheckpoint, false);
  assert.equal(agent.productHistory[0].status, "recorded");
  assert.match(agent.productHistory[0].changeSummary.after, /מקור ליד/u);
  assert.equal(agent.buildMutationHistoryCount, 1);
});

test("HIST-AGT-001 — meaningful product-direction changes create checkpoint and restore impact", () => {
  const project = {
    id: "hist-direction",
    name: "ניהול לידים",
    mutationChangeHistory: [
      {
        historyRecordId: "mutation-history:direction",
        changeType: "product-truth",
        status: "pending-approval",
        requiresApproval: true,
        requiresCheckpoint: true,
        historyRecord: {
          after: "לא בוצע שינוי עד אישור המשתמש.",
        },
        productSnapshot: {
          projectName: "ניהול לידים",
          goal: "כלי פנימי לניהול לידים",
          runtimeSkeletonTruth: { title: "ניהול לידים" },
          productDomainSkeleton: { models: [{ name: "ליד" }], state: { records: [{ id: "lead-1" }] } },
        },
      },
    ],
    mutationChangeDecision: {
      taskId: "MUT-001",
      changeType: "product-truth",
      status: "pending-approval",
      requiresApproval: true,
      requiresCheckpoint: true,
      historyRecord: {
        after: "לא בוצע שינוי עד אישור המשתמש.",
      },
    },
  };
  const agent = buildHistoryContinuityAgentEnvelope({ project });
  const restore = createHistoryRestoreDecision({
    project: {
      ...project,
      historyContinuityAgent: agent,
    },
    checkpointId: agent.checkpoints[0].checkpointId,
  });

  assert.equal(agent.status, "pending-approval");
  assert.equal(agent.productHistory[0].eventType, "pending-approval");
  assert.equal(agent.productHistory[0].requiresCheckpoint, true);
  assert.equal(agent.checkpoints.length, 1);
  assert.equal(agent.checkpoints[0].restoreAvailability, "possible-with-impact");
  assert.equal(restore.restoreDecision.status, "impact-ready");
  assert.equal(restore.restoreDecision.requiresApproval, true);
  assert.equal(restore.restoreDecision.currentTruthUnchanged, true);
  assert.equal(restore.restoreDecision.productSnapshot.productDomainSkeleton.models[0].name, "ליד");
  assert.match(restore.restoreDecision.userReply, /עדיין לא בוצע שחזור/u);
  assert.deepEqual(restore.restoreDecision.restoreImpact.willKeep.includes("השיחה"), true);

  const executed = executeHistoryRestoreDecision({
    project: {
      ...project,
      name: "ניהול הזמנות",
      goal: "כלי פנימי לניהול הזמנות",
      historyContinuityAgent: restore,
    },
    checkpointId: agent.checkpoints[0].checkpointId,
  });
  assert.equal(executed.status, "restored");
  assert.equal(executed.restoreDecision.status, "restored");
  assert.equal(executed.restoreDecision.currentTruthUnchanged, false);
  assert.equal(executed.restoreExecution.executed, true);
  assert.equal(executed.restoreExecution.restoredDomainModel, "ליד");
});
