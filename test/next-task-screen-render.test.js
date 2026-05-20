import test from "node:test";
import assert from "node:assert/strict";

import { renderNextTaskScreen } from "../web/nexus-ui/screens/NextTaskScreen.js";

test("next task screen renders post-release continuation card", () => {
  const html = renderNextTaskScreen({
    badge: "QA preview override",
    title: "מאיפה ממשיכים עכשיו",
    subtitle: "זאת המשימה הבאה שנפתחת מתוך התוצר שאושר עכשיו.",
    projectName: "Coach Mobile",
    artifactTruth: {
      title: "Coach Mobile mobile flow",
      subtitle: "זרימת מובייל מאושרת",
      artifact: {
        title: "Coach Mobile mobile flow",
        previewKind: "mobile flow",
        shell: { kind: "browser-window" },
      },
      openAction: { label: "פתח את התוצר", target: "proof-open", supported: true },
      summaryItems: ["יש כבר proof פעיל", "יש release path ברור"],
    },
    artifactAction: { label: "פתח את התוצר", target: "proof-open", supported: true },
    mission: {
      title: "לקדם את Coach Mobile mobile flow",
      description: "סבב 2 מחזק את המסך הראשון והפעולה הראשונה.",
      status: "בתהליך",
      icon: "→",
      metadata: [
        { label: "מסלול", value: "loop" },
        { label: "מתי לפתוח", value: "נפתח עכשיו" },
        { label: "מוכנות", value: "סבב ההמשך מוכן לפתיחה" },
      ],
    },
    whyNow: "זה הצעד הנכון עכשיו כי האישור האחרון צריך לפתוח סבב המשך אמיתי.",
    readyNowItems: ["יש כבר proof פעיל", "יש release handoff ברור"],
    upcomingItems: ["לחדד את המסך הראשון", "לקבע את הפעולה הראשונה"],
    stats: [
      { label: "התקדמות כללית", value: "72%" },
      { label: "משימות בתור", value: "3" },
      { label: "חסמים פתוחים", value: "0" },
    ],
    blockerItems: [],
    progressPercent: 72,
    postReleaseContinuation: {
      statusLabel: "סבב ההמשך כבר פתוח",
      originArtifactTitle: "Coach Mobile mobile flow",
      originReleaseTarget: "app-store",
      nextMoveTitle: "לקדם את Coach Mobile mobile flow",
      nextMoveDescription: "אחרי ה־release האחרון Nexus חייבת לפתוח סבב המשך אמיתי.",
      nextMoveFamily: "explicit-loop-move",
      visibleContinuationRule: "release is not a terminal end state; the next fixes, improvements, or growth moves must emerge visibly inside Nexus",
      continuationMoves: [
        "לחדד את המסך הראשון סביב מה שהמשתמש צריך להבין עכשיו",
        "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
      ],
      boundedGrowthRule: "continuation may surface only product-connected moves, not fake autonomous company behavior",
      continuityRule: "post-release continuation must survive revisit, route restore, and transition back into execution",
    },
    learningDecisionImpact: {
      statusLabel: "הלמידה כבר משנה את ההמשך לכיוון repair לפני expansion",
      strategy: "repair-before-expand",
      drivingSignals: ["outcome:attention-required", "adaptive:stabilize"],
      runtimeDecision: {
        label: "לייצב את runtime/package הנוכחי לפני הרחבה",
        currentEffect: "Nexus שומרת על runtime קיים עד שהסימנים הבעייתיים יירדו.",
      },
      releaseDecision: {
        label: "להחזיק את קידום ה־release עד שהלמידה תאשר יציבות",
        currentEffect: "ה־release הבא לא מקודם אוטומטית.",
      },
      continuityRule: "learning-driven decisions must survive revisit and route restore",
    },
    growthOpportunityBoundary: {
      statusLabel: "הצעות ההמשך נשארות bounded",
      visibleBoundaryRule: "Wave 4 may surface only meaningful next product moves, never fake autonomous company behavior or implied Wave 7 autonomy",
      allowedMoves: [
        "לחדד את המסך הראשון סביב מה שהמשתמש צריך להבין עכשיו",
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
    primaryAction: { label: "התחל משימה", target: "execution", actionKind: "execute" },
    secondaryAction: { label: "הצג פירוט", target: "timeline" },
  });

  assert.match(html, /Post-release continuation/);
  assert.match(html, /Learning decision impact/);
  assert.match(html, /Growth boundary/);
  assert.match(html, /סבב ההמשך כבר פתוח/);
  assert.match(html, /repair-before-expand/);
  assert.match(html, /הצעות ההמשך נשארות bounded/);
  assert.match(html, /app-store/);
  assert.match(html, /לקדם את Coach Mobile mobile flow/);
  assert.match(html, /fake autonomous company behavior/);
});
