import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineViewModel } from "../web/nexus-ui/adapters/timeline-adapter.js";

test("timeline adapter exposes preserved continuity data and SURF-006 history model", () => {
  const viewModel = buildTimelineViewModel({
    project: {
      name: "Landing QA",
      proofArtifact: {
        artifactId: "artifact-1",
        title: "Landing page",
        status: "ready",
        previewKind: "landing-page",
        previewPayload: {
          title: "Landing page",
          subtitle: "תצוגת מוצר פעילה",
          kind: "landing-page",
          proofMeta: {
            previewable: true,
            regionCount: 3,
          },
        },
        actions: {
          open: { supported: true, routeKey: "artifact" },
          download: { supported: true },
        },
      },
      crossSurfaceContinuityContract: {
        statusLabel: "הרצף בין המסכים נשאר מחובר",
        visibleContinuityRule: "build, proof, release, deployment feedback, timeline, and continuation must read like one connected product loop inside Nexus",
        explainablePath: "execution:build -> proof:artifact -> next-task:continuation -> timeline:timeline",
        continuityChecks: [
          "same-project-identity-across-surfaces",
          "route-restore-survives-refresh",
        ],
        continuitySteps: [
          {
            title: "Build / execution",
            routeKey: "execution",
            visibleAnchor: "surface-evolving",
            continuityRule: "build progression survives route restore",
          },
          {
            title: "Timeline continuity",
            routeKey: "timeline",
            visibleAnchor: "timeline-keeps-the-loop-connected",
            continuityRule: "timeline preserves the loop story",
          },
        ],
        restoreRule: "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution",
      },
      wave4LiveVerificationMatrix: {
        statusLabel: "ל־Wave 4 יש מטריצת אימות חיה אחת",
        matrixRule: "every major Wave 4 capability must declare one visible route, one visible anchor, pass/fail truth, and restore/continuity checks before later live reruns can close the wave truthfully",
        strongerPreviewRule: "use the stronger preview path when available",
        restoreRule: "the live verification matrix must include refresh, route restore, revisit, and transition checks wherever the capability changes user-facing product truth",
        summary: {
          totalLanes: 10,
          executionRoutes: 4,
          proofRoutes: 2,
          restoreChecks: 20,
        },
        verificationLanes: [
          {
            laneId: "product-understanding-and-class-resolution",
            title: "Product understanding and class resolution",
            routeKey: "understanding",
            visibleAnchor: "landing-page · bootstrap",
            verificationFocus: ["class is explicit"],
            passCriteria: ["pass if class and stage are visible before execution"],
            restoreChecks: ["class identity survives route restore"],
            strongerPreviewPath: "understanding-summary-route",
          },
        ],
      },
      canonicalLearningSystemContract: {
        statusLabel: "מערכת הלמידה מוגדרת עכשיו כחוזה קנוני אחד",
        contractRule: "Nexus must separate project memory, user preference memory, and system learning, and only call it learning where stored signals change later decisions truthfully.",
        summary: {
          memoryLayers: 3,
          liveInputs: 5,
          partialInputs: 6,
          liveImpacts: 1,
          partialImpacts: 2,
          crossProjectPatterns: 2,
        },
        memoryLayers: [
          {
            layerId: "project-memory",
            title: "Project memory",
            status: "live",
            scope: "Stores project-specific outcomes.",
            storedInputs: ["execution history"],
            decisionImpact: ["next-task framing"],
            continuityRule: "Project memory stays attached to the same project identity.",
          },
        ],
        decisionImpacts: [
          {
            impactId: "next-task-selection",
            label: "next-task selection",
            status: "live",
            currentEffect: "Adaptive execution uses feedback to steer next work.",
            nextRequirement: "Later selection should expose stronger class-specific effects visibly.",
          },
        ],
        continuityRules: [
          "learning state may not silently reset across restore",
        ],
        generationIntegrationRules: [
          "generation must later consume learned class signals",
        ],
        explicitProhibitions: [
          "no hidden AI intuition without canonical trace",
        ],
        visibleProductExpectations: [
          "smarter generation direction",
        ],
      },
      learningDecisionImpact: {
        statusLabel: "הלמידה כבר משנה את ההמשך לכיוון repair לפני expansion",
        strategy: "repair-before-expand",
        drivingSignals: [
          "outcome:attention-required",
          "adaptive:stabilize",
        ],
        runtimeDecision: {
          label: "לייצב את runtime/package הנוכחי לפני הרחבה",
          currentEffect: "Nexus שומרת על runtime קיים עד שהסימנים הבעייתיים יירדו.",
        },
        releaseDecision: {
          label: "להחזיק את קידום ה־release עד שהלמידה תאשר יציבות",
          currentEffect: "ה־release הבא לא מקודם אוטומטית.",
        },
        continuationDecision: {
          title: "לייצב את Landing page לפני הרחבה נוספת",
          description: "הסבב הבא משתנה עכשיו בגלל friction שנצבר.",
          moves: [
            "לחזק את הוכחת הערך",
            "לאסוף עוד proof חי",
          ],
        },
        nextTaskDecision: {
          title: "לייצב את Landing page לפני הרחבה נוספת",
          whyNow: "זה הצעד הנכון עכשיו כי outcome feedback כבר מראה שצריך repair.",
        },
        continuityRule: "learning-driven decisions must survive revisit and route restore",
      },
      events: [
        {
          type: "task.completed",
          timestamp: "10:42",
          payload: {
            task: {
              summary: "המסך הראשון עודכן",
            },
          },
        },
      ],
      historyContinuityAgent: {
        taskId: "HIST-AGT-001",
        agentId: "history-continuity-agent",
        responseSource: "agent-envelope",
        status: "recorded",
        currentSummary: "השינוי האחרון נשמר כהיסטוריית מוצר.",
        productHistory: [
          {
            eventId: "history-continuity-small",
            eventType: "small-change",
            requiresCheckpoint: false,
            changeSummary: {
              after: "נוסף שדה מקור ליד.",
              unchanged: "הקשר הפרויקט נשמר.",
            },
            userReply: "נרשם שינוי מוצרי.",
            createdAt: "עכשיו",
          },
        ],
        checkpoints: [
          {
            checkpointId: "hist-checkpoint-small",
            title: "נקודת חזרה לשינוי קטן",
            body: "אפשר להבין את השינוי בלי לבצע שחזור שקט.",
            restoreAvailability: "safe",
            restoreImpact: {
              willRestore: ["שדה מקור ליד"],
              willRemove: [],
              willKeep: ["השיחה"],
              releaseImpact: "אין השפעת שחרור.",
            },
          },
        ],
        restoreDecision: {
          status: "not-requested",
          userReply: "אפשר לבדוק נקודת חזרה.",
        },
      },
    },
  });

  assert.equal(viewModel.crossSurfaceContinuity.statusLabel, "הרצף בין המסכים נשאר מחובר");
  assert.equal(viewModel.contract.contractId, "SURF-006");
  assert.equal(viewModel.contract.purpose, "product-continuity-and-change-memory-workspace");
  assert.equal(viewModel.history.currentState.projectName, "Landing QA");
  assert.equal(viewModel.history.changeLog[0].title, "נוסף שדה מקור ליד.");
  assert.equal(viewModel.historyContinuityAgent.taskId, "HIST-AGT-001");
  assert.equal(viewModel.history.restoreCheckpoints[0].id, "hist-checkpoint-small");
  assert.equal(viewModel.history.versionSnapshots[0].taskId, "EXP-003");
  assert.equal(viewModel.history.versionSnapshots[0].restoreCheckpointId, "hist-checkpoint-small");
  assert.equal(viewModel.history.versionSnapshots[0].rollbackBoundary, "אין השפעת שחרור.");
  assert.equal(viewModel.history.returnToBuild.target, "loop");
  assert.equal(viewModel.crossSurfaceContinuity.continuitySteps[0].routeKey, "execution");
  assert.match(viewModel.crossSurfaceContinuity.explainablePath, /proof:artifact/);
  assert.equal(viewModel.crossSurfaceContinuity.continuityChecks.includes("route-restore-survives-refresh"), true);
  assert.equal(viewModel.wave4LiveVerificationMatrix.statusLabel, "ל־Wave 4 יש מטריצת אימות חיה אחת");
  assert.equal(viewModel.wave4LiveVerificationMatrix.verificationLanes[0].routeKey, "understanding");
  assert.equal(viewModel.wave4LiveVerificationMatrix.summary.totalLanes, "10");
  assert.equal(viewModel.canonicalLearningSystemContract.statusLabel, "מערכת הלמידה מוגדרת עכשיו כחוזה קנוני אחד");
  assert.equal(viewModel.canonicalLearningSystemContract.memoryLayers[0].title, "Project memory");
  assert.equal(viewModel.canonicalLearningSystemContract.decisionImpacts[0].label, "next-task selection");
  assert.equal(viewModel.learningDecisionImpact.strategy, "repair-before-expand");
  assert.match(viewModel.learningDecisionImpact.runtimeDecision.label, /runtime\/package/);
});
