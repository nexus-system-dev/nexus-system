import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineViewModel } from "../web/nexus-ui/adapters/timeline-adapter.js";
import { renderTimelineHistoryScreen } from "../web/nexus-ui/screens/TimelineHistoryScreen.js";

test("timeline route renders the canonical product history workspace", () => {
  const html = renderTimelineHistoryScreen(buildTimelineViewModel({
    project: {
      name: "Landing QA",
      goal: "דף נחיתה לרכישת משתמשים",
      status: "working",
      proofArtifact: {
        artifactId: "artifact-1",
        title: "Landing page",
        status: "ready",
        previewKind: "landing-page",
        previewPayload: {
          title: "Landing page",
          subtitle: "תצוגת מוצר פעילה",
        },
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
        status: "pending-approval",
        currentSummary: "נוסף שדה מקור ליד ויש שינוי כיוון שממתין לאישור.",
        productHistory: [
          {
            eventId: "history-continuity-1",
            eventType: "pending-approval",
            requiresCheckpoint: true,
            changeSummary: {
              after: "שינוי כיוון להזמנות ממתין לאישור.",
              unchanged: "השיחה והפרויקט נשארים מחוברים.",
            },
            userReply: "שמרתי נקודת חזרה לפני שינוי משמעותי.",
            createdAt: "עכשיו",
          },
        ],
        checkpoints: [
          {
            checkpointId: "hist-checkpoint-1",
            title: "נקודת חזרה לפני שינוי משמעותי",
            body: "אפשר לבדוק מה יחזור לפני שחזור.",
            restoreAvailability: "possible-with-impact",
            restoreImpact: {
              willRestore: ["ניהול לידים"],
              willRemove: ["שינוי להזמנות אם יאושר"],
              willKeep: ["השיחה"],
              releaseImpact: "אין השפעת שחרור.",
            },
          },
        ],
        restoreDecision: {
          status: "impact-ready",
          userReply: "עדיין לא בוצע שחזור.",
          restoreImpact: {
            willRestore: ["ניהול לידים"],
            willRemove: ["שינוי להזמנות אם יאושר"],
            willKeep: ["השיחה"],
            releaseImpact: "אין השפעת שחרור.",
          },
        },
      },
    },
  }));

  assert.match(html, /data-history-surface-contract="SURF-006"/);
  assert.match(html, /data-history-continuity-agent="HIST-AGT-001"/);
  assert.match(html, /data-history-continuity-agent-task="HIST-AGT-001"/);
  assert.match(html, /data-history-restore-decision-status="impact-ready"/);
  assert.match(html, /data-history-workspace-shell="canonical-right-rail"/);
  assert.match(html, /data-nexus-workspace-rail="canonical-right-rail"/);
  assert.match(html, /data-nexus-rail-active-route="timeline"/);
  assert.match(html, /data-history-region="history-current-state-anchor"/);
  assert.match(html, /data-history-region="history-change-log"/);
  assert.match(html, /data-history-region="history-restore-checkpoints"/);
  assert.match(html, /data-history-region="history-continuity-thread"/);
  assert.match(html, /data-history-region="history-version-snapshots"/);
  assert.match(html, /data-history-versioning-task="EXP-003"/);
  assert.match(html, /data-history-version-card="hist-checkpoint-1"/);
  assert.match(html, /data-history-version-checkpoint-id="hist-checkpoint-1"/);
  assert.match(html, /data-history-region="history-return-to-build"/);
  assert.match(html, /מה נשמר כגרסת מוצר שאפשר להבין ולחזור ממנה/);
  assert.match(html, /מה יחזור: ניהול לידים/);
  assert.match(html, /מה יוסר: שינוי להזמנות אם יאושר/);
  assert.match(html, /מה נשמר מהדרך עד עכשיו/);
  assert.match(html, /שינוי כיוון להזמנות ממתין לאישור/);
  assert.match(html, /בדוק חזרה לנקודה הזו/);
  assert.match(html, /עדיין לא בוצע שחזור/);
  assert.match(html, /חזור לבנייה/);
  assert.doesNotMatch(html, />history-continuity-agent</);
  assert.doesNotMatch(html, /MUT-001/);
  assert.doesNotMatch(html, /Wave 4 live verification matrix/);
  assert.doesNotMatch(html, /Deep learning decision impact/);
  assert.doesNotMatch(html, /Canonical learning system/);
  assert.doesNotMatch(html, /Cross-surface continuity/);
  assert.doesNotMatch(html, /understanding · Product understanding and class resolution/);
  assert.doesNotMatch(html, /execution:build -&gt; proof:artifact|execution:build -> proof:artifact/);
  assert.doesNotMatch(html, /nexus-ui-sidebar/);
  assert.doesNotMatch(html, /nexus-qa-nav/);
  assert.doesNotMatch(html, /nexus-stepper/);
});
