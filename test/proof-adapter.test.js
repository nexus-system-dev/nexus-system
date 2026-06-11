import test from "node:test";
import assert from "node:assert/strict";

import { buildProofResultViewModel } from "../web/nexus-ui/adapters/proof-adapter.js";

function buildWeakClassProject(artifactExpectation) {
  return {
    name: artifactExpectation.projectType === "mobile-app" ? "Coach Mobile" : "Clinic Landing",
    artifactExpectation,
    proofArtifact: {
      artifactId: `proof-artifact:${artifactExpectation.projectType}`,
      artifactType: "generated-surface",
      title: artifactExpectation.title,
      status: "ready",
      previewKind: "generated-surface",
      previewPayload: {
        kind: "generated-surface",
        title: artifactExpectation.title,
        subtitle: artifactExpectation.summary,
        statusLine: artifactExpectation.continuityLine,
        proofMeta: {
          previewable: true,
          regionCount: 4,
        },
      },
      provenance: {
        proofId: `proof:${artifactExpectation.projectType}`,
        screenId: `${artifactExpectation.projectType}-preview`,
      },
      actions: {
        open: { supported: true },
        download: { supported: false },
      },
      artifactExpectation,
    },
    aiControlCenterSurface: {
      generatedSurfacePreview: {
        screenId: `${artifactExpectation.projectType}-preview`,
        regionCount: 4,
      },
      liveRuntimeBinding: {
        activeScreenId: `${artifactExpectation.projectType}-live`,
      },
    },
    generatedSurfaceProofSchema: {
      proofId: `proof:${artifactExpectation.projectType}`,
      summary: {
        proofStatus: "ready",
        validationStatus: "passed",
      },
      evidence: {
        isPreviewable: true,
        regionCount: 4,
      },
    },
    growthWorkspace: {
      analytics: {
        summaryCards: [],
      },
    },
    releaseEvidenceHandoffModel: {
      handoffStatusLabel: "handoff בהכנה",
      explainableReleasePath: "live-browser-preview -> web-build -> web-deployment",
      builtSurfaceTitle: artifactExpectation.title,
      wrappedArtifactType: "deployable-web-bundle",
      packagePath: "web-build -> web-deployment",
      previewPath: "live-browser-preview -> live-browser-preview",
      releaseTarget: "web-deployment",
      nextAction: "complete-release-handoff",
      narrative: "ה־release path מוסבר מתוך התוצר, ה־package, והצעד הבא.",
      evidenceItems: [
        { label: "What was built", value: artifactExpectation.title },
        { label: "Release target", value: "web-deployment" },
      ],
      visibleChecks: [
        { checkId: "build-surface-visible", status: "passed", reason: "surface is visible" },
        { checkId: "release-handoff", status: "failed", reason: "handoff missing" },
      ],
      blockers: ["handoff missing"],
      handoffSteps: ["open the product surface", "package for release", "continue to confirmation"],
      persistenceRule: "release evidence must survive revisit and restore",
    },
  };
}

test("proof adapter uses landing artifact expectation to frame weak-class proof", () => {
  const viewModel = buildProofResultViewModel({
    project: buildWeakClassProject({
      expectationId: "artifact-expectation:landing-page:clinic-landing-page",
      projectType: "landing-page",
      projectTypeLabel: "דף נחיתה / שיווק",
      proofArtifactType: "generated-surface",
      title: "Clinic Landing landing page",
      summary: "דף נחיתה חד עם הבטחה ברורה, הוכחת אמון וקריאה אחת לפעולה.",
      continuityLine: "ב-Proof נרצה לראות דף נחיתה עם הבטחה ברורה, אמון ופעולה מיידית.",
      proofFocus: [
        "הבטחה ראשית מעל הקפל",
        "הוכחת אמון שתומכת בהחלטה",
        "CTA מרכזי אחד שקל להבין",
      ],
    }),
  });

  assert.deepEqual(
    viewModel.successCriteria.slice(1).map((item) => item.title),
    [
      "הבטחה ראשית מעל הקפל",
      "הוכחת אמון שתומכת בהחלטה",
      "CTA מרכזי אחד שקל להבין",
      "יש surface שאפשר לבדוק בפועל",
      "התצוגה כבר מחזיקה את הכיוון שסגרנו",
    ],
  );
  assert.equal(viewModel.artifacts[1].type, "מה המבקר צריך להבין מיד");
  assert.equal(viewModel.artifacts[2].type, "למה אפשר לסמוך על ההצעה");
  assert.equal(viewModel.artifacts[3].type, "לאיזו פעולה המסך מוביל");
  assert.equal(viewModel.releaseEvidenceHandoff.handoffStatusLabel, "handoff בהכנה");
  assert.equal(viewModel.releaseEvidenceHandoff.releaseTarget, "web-deployment");
  assert.equal(viewModel.releaseEvidenceHandoff.visibleChecks[1].checkId, "release-handoff");
});

test("proof adapter uses mobile artifact expectation to frame weak-class proof", () => {
  const viewModel = buildProofResultViewModel({
    project: buildWeakClassProject({
      expectationId: "artifact-expectation:mobile-app:coach-mobile-flow",
      projectType: "mobile-app",
      projectTypeLabel: "אפליקציה",
      proofArtifactType: "generated-surface",
      title: "Coach Mobile mobile flow",
      summary: "זרימת מובייל ראשונה עם מסך פתיחה ברור, פעולה ראשונה מובנת ומעבר נקי לצעד הבא.",
      continuityLine: "ב-Proof נרצה לראות זרימת מובייל עם מסך ראשון ברור, פעולה ראשונה מובנת וזרימה ניידת שמשרתת את המשתמש.",
      proofFocus: [
        "מסך ראשון ברור למשתמש הנכון",
        "פעולה ראשונה שאפשר להבין בלי הדרכה",
        "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
      ],
    }),
  });

  assert.deepEqual(
    viewModel.successCriteria.slice(1).map((item) => item.title),
    [
      "מסך ראשון ברור למשתמש הנכון",
      "פעולה ראשונה שאפשר להבין בלי הדרכה",
      "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
      "יש surface שאפשר לבדוק בפועל",
      "התצוגה כבר מחזיקה את הכיוון שסגרנו",
    ],
  );
  assert.equal(viewModel.artifacts[1].type, "מה המשתמש פוגש ראשון");
  assert.equal(viewModel.artifacts[2].type, "מה המשתמש אמור לעשות קודם");
  assert.equal(viewModel.artifacts[3].type, "איך הזרימה ממשיכה קדימה");
  assert.equal(viewModel.releaseEvidenceHandoff.explainableReleasePath, "live-browser-preview -> web-build -> web-deployment");
  assert.equal(viewModel.releaseEvidenceHandoff.handoffSteps[2], "continue to confirmation");
});

test("proof adapter exposes learning-aware generation shifts on weak-class proof routes", () => {
  const viewModel = buildProofResultViewModel({
    project: {
      ...buildWeakClassProject({
        expectationId: "artifact-expectation:landing-page:clinic-landing-page",
        projectType: "landing-page",
        projectTypeLabel: "דף נחיתה / שיווק",
        proofArtifactType: "generated-surface",
        title: "Clinic Landing landing page",
        summary: "דף נחיתה חד עם הבטחה ברורה, הוכחת אמון וקריאה אחת לפעולה.",
        continuityLine: "ב-Proof נרצה לראות דף נחיתה עם הבטחה ברורה, אמון ופעולה מיידית.",
        proofFocus: [
          "הבטחה ראשית מעל הקפל",
          "הוכחת אמון שתומכת בהחלטה",
          "CTA מרכזי אחד שקל להבין",
        ],
      }),
      generationIntent: {
        intentId: "generation-intent:landing-page:clinic-landing-page",
        learningAware: true,
        learningStrategyLabel: "הלמידה מזיזה את ה־generation לייצוב לפני הרחבה",
        learningReason: "הסבב האחרון חשף friction שחייב חיזוק proof לפני הרחבה.",
        learnedFocusAreas: [
          "לחזק את הוכחת הערך לפני הרחבת המסר",
          "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
        ],
        learnedProofRequirement: "ה־Proof הבא צריך להוכיח שהבטחת הערך והאמון כבר יציבים לפני הרחבת המסר.",
      },
    },
  });

  assert.equal(viewModel.successCriteria.some((item) => item.title === "הלמידה כבר שינתה את כיוון היצירה"), true);
  assert.equal(viewModel.artifacts.some((item) => item.type === "כיוון שנלמד מהסבב האחרון"), true);
});
