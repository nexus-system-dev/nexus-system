import test from "node:test";
import assert from "node:assert/strict";

import { buildNextTaskViewModel } from "../web/nexus-ui/adapters/next-task-adapter.js";

test("next-task adapter keeps second-loop continuation truthful when no assigned task exists yet", () => {
  const viewModel = buildNextTaskViewModel({
    project: {
      name: "Family Flow",
      cycle: {
        roadmap: [],
      },
      artifactExpectation: {
        title: "Family Flow mobile flow",
        loopReadyMessage: "הסבב הבא כבר נפתח כדי לקדם את המסך הראשון לצעד המשך ברור יותר.",
        continuityLine: "ב-Proof נרצה לראות Family Flow mobile flow שממשיך ישירות מהאישור האחרון.",
      },
      developerWorkspace: {
        contextSummary: {},
      },
      postReleaseContinuationLoop: {
        statusLabel: "מוכן לפתוח סבב המשך",
        originArtifactTitle: "Family Flow mobile flow",
        originReleaseTarget: "app-store",
        nextMoveTitle: "לקדם את Family Flow mobile flow",
        nextMoveDescription: "הסבב הבא כבר נפתח כדי לקדם את המסך הראשון לצעד המשך ברור יותר.",
        nextMoveFamily: "derived-loop-move",
        visibleContinuationRule: "release is not a terminal end state; the next move must appear visibly inside Nexus",
        continuationMoves: [
          "לחדד את מסך הבית סביב מה שקורה היום",
          "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
        ],
        boundedGrowthRule: "continuation may surface only product-connected moves",
        continuityRule: "post-release continuation must survive revisit and route restore",
      },
      growthOpportunitySurfacingBoundary: {
        statusLabel: "הצעות ההמשך נשארות bounded",
        visibleBoundaryRule: "Wave 4 may surface only meaningful next product moves, never fake autonomous company behavior or implied Wave 7 autonomy",
        allowedMoves: [
          "לחדד את מסך הבית סביב מה שקורה היום",
          "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
        ],
        disallowedMoves: [
          "inventing company goals disconnected from the released product",
        ],
        deferredOpportunityFamilies: [
          "portfolio-optimization",
        ],
        credibilityRule: "every surfaced next move must stay directly attached to the last approved artifact, release target, and current product bottleneck",
        continuityRule: "opportunity state must survive revisit, route restore, and handoff back into execution without changing scope silently",
      },
    },
  });

  assert.equal(viewModel.mission.title, "לקדם את Family Flow mobile flow");
  assert.match(viewModel.mission.description, /הסבב הבא כבר נפתח/);
  assert.equal(viewModel.mission.metadata[2].value, "סבב ההמשך מוכן לפתיחה");
  assert.equal(viewModel.postReleaseContinuation.originReleaseTarget, "app-store");
  assert.equal(viewModel.postReleaseContinuation.continuationMoves[0], "לחדד את מסך הבית סביב מה שקורה היום");
  assert.equal(viewModel.growthOpportunityBoundary.statusLabel, "הצעות ההמשך נשארות bounded");
  assert.match(viewModel.growthOpportunityBoundary.disallowedMoves[0], /disconnected/);
});

test("next-task adapter prefers persisted repeated-loop continuation over empty roadmap fallback", () => {
  const viewModel = buildNextTaskViewModel({
    project: {
      name: "Family Flow",
      state: {
        repeatedLoopContinuation: {
          active: true,
          missionTitle: "לקדם את Family Flow mobile flow",
          missionDescription: "סבב 2 עובר עכשיו למסך הראשון, לפעולה הראשונה, ולמסך ההמשך.",
          upcomingItems: [
            "לחדד את מסך הבית סביב מה שקורה היום",
            "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
          ],
          proofIncrement: {
            reason: "האישור האחרון פתח סבב המשך שמחזק את השימושיות של הזרימה בלי להחליף את התוצר.",
          },
        },
      },
      cycle: {
        roadmap: [],
      },
      developerWorkspace: {
        contextSummary: {},
      },
    },
  });

  assert.equal(viewModel.mission.title, "לקדם את Family Flow mobile flow");
  assert.match(viewModel.mission.description, /סבב 2/);
  assert.deepEqual(viewModel.upcomingItems, [
    "לחדד את מסך הבית סביב מה שקורה היום",
    "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
  ]);
  assert.match(viewModel.readyNowItems[0], /האישור האחרון פתח סבב המשך/);
});

test("next-task adapter opens clarification path instead of execution when repeated-loop continuation is under-specified", () => {
  const viewModel = buildNextTaskViewModel({
    project: {
      name: "Family Flow",
      state: {
        repeatedLoopContinuation: {
          active: true,
          requiresClarification: true,
          missionTitle: "לפני סבב 2 של Family Flow mobile flow צריך עוד חומר תומך",
          missionDescription: "Nexus לא ממשיך עכשיו אוטומטית כדי לא למחזר את אותו artifact.",
          upcomingItems: [
            "לצרף מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה",
          ],
          clarification: {
            requestedMaterialLabel: "מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה",
            detail: "בלי החומר הזה הסבב הבא יהיה replay של אותו artifact.",
          },
          proofIncrement: {
            reason: "הסבב הבא מושהה truthfully עד שיצורף חומר תומך.",
          },
        },
      },
      artifactExpectation: {
        title: "Family Flow mobile flow",
        summary: "זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה והמשך רציף.",
      },
      cycle: {
        roadmap: [],
      },
      developerWorkspace: {
        contextSummary: {},
      },
    },
  });

  assert.equal(viewModel.mission.status, "דורש פתיחת חסם");
  assert.equal(viewModel.primaryAction.target, "onboarding");
  assert.equal(viewModel.primaryAction.actionKind, "navigate");
  assert.match(viewModel.whyNow, /replay/);
  assert.match(viewModel.blockerItems[0], /spec למובייל/);
});
