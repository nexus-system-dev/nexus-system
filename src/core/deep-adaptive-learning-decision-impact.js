function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildRepairMoves(productClass, artifactTitle) {
  if (productClass === "landing-page") {
    return [
      "לחזק את הוכחת הערך לפני הרחבת המסר",
      "לייצב את אזור האמון וה־CTA לפני מהלך צמיחה נוסף",
      `לאסוף עוד proof חי עבור ${artifactTitle}`,
    ];
  }

  if (productClass === "mobile-app") {
    return [
      "לייצב את המסך הראשון לפני הרחבת הזרימה",
      "לחזק את הפעולה הראשונה כך שלא תיתקע בלחיצה הראשונה",
      `לאסוף עוד proof שימושי עבור ${artifactTitle}`,
    ];
  }

  if (productClass === "internal-tool" || productClass === "commerce-ops") {
    return [
      "לייצב את התור הפעיל לפני הרחבת ה־workspace",
      "לחזק את מצב הבעלות והדחיפות לפני מהלך נוסף",
      `לאסוף עוד proof תפעולי עבור ${artifactTitle}`,
    ];
  }

  return [
    `לייצב את ${artifactTitle} לפני הרחבה נוספת`,
    "לחזק את המהלך שכבר הוכח לפני פתיחת מסלול נוסף",
    "לאסוף עוד proof חי מהשימוש האחרון",
  ];
}

function buildAdvanceMoves(existingMoves = [], artifactTitle) {
  const normalized = normalizeArray(existingMoves).map((item) => normalizeString(item)).filter(Boolean);
  if (normalized.length > 0) {
    return normalized;
  }

  return [
    `לקדם את ${artifactTitle} דרך המהלך הבא שכבר הוכח`,
    "לפתוח את סבב ההמשך מתוך מה שכבר עובד",
    "להישאר מחובר ל־release האחרון בלי drift",
  ];
}

export function createDeepAdaptiveLearningDecisionImpact({
  projectId = null,
  productClass = null,
  outcomeFeedbackState = null,
  approvalStatus = null,
  adaptiveExecutionDecision = null,
  releaseEvidenceHandoffModel = null,
  deploymentStateFeedbackContract = null,
  postReleaseContinuationLoop = null,
  classAwareRuntimeResolver = null,
  classAwarePackagingPreviewContract = null,
} = {}) {
  const feedback = normalizeObject(outcomeFeedbackState);
  const approval = normalizeObject(approvalStatus);
  const adaptiveDecision = normalizeObject(adaptiveExecutionDecision);
  const releaseEvidence = normalizeObject(releaseEvidenceHandoffModel);
  const deploymentFeedback = normalizeObject(deploymentStateFeedbackContract);
  const continuationLoop = normalizeObject(postReleaseContinuationLoop);
  const runtimeResolver = normalizeObject(classAwareRuntimeResolver);
  const packagingContract = normalizeObject(classAwarePackagingPreviewContract);
  const artifactTitle = normalizeString(
    continuationLoop.originArtifactTitle,
    "התוצר שאושר",
  );

  const needsRepair = feedback.status === "attention-required"
    || feedback.trend === "stalled"
    || adaptiveDecision.loopMode === "stabilize";
  const approvalReady = approval.status === "approved" || approval.status === "ready";
  const deploymentHealthy = deploymentFeedback.policyDecision === "allowed"
    && normalizeString(deploymentFeedback.latestProviderStatus, "unknown") !== "production-health-unconfirmed";
  const releaseReady = normalizeString(releaseEvidence.nextAction) === "handoff-to-release-path";

  const strategy = needsRepair ? "repair-before-expand" : "advance-validated-path";
  const statusLabel = needsRepair
    ? "הלמידה כבר משנה את ההמשך לכיוון repair לפני expansion"
    : "הלמידה כבר משנה את ההמשך לכיוון expansion רק אחרי מה שכבר הוכח";
  const runtimeLabel = needsRepair
    ? "לייצב את runtime/package הנוכחי לפני הרחבה"
    : "להמשיך על runtime/package שכבר הוכח";
  const releaseLabel = !approvalReady || !deploymentHealthy || !releaseReady
    ? "להחזיק את קידום ה־release עד שהלמידה תאשר יציבות"
    : "להמשיך את ה־release path שכבר הוכח";
  const continuationTitle = needsRepair
    ? `לייצב את ${artifactTitle} לפני הרחבה נוספת`
    : normalizeString(continuationLoop.nextMoveTitle, `לקדם את ${artifactTitle}`);
  const continuationDescription = needsRepair
    ? "הסבב הבא משתנה עכשיו truthfully בגלל חסימות, כשלונות, או friction שנצברו. לפני הרחבה, Nexus מחזירה את ההמשך לצעד repair שמחזק את מה שכבר נבנה."
    : normalizeString(
        continuationLoop.nextMoveDescription,
        "הלמידה מאפשרת להמשיך את המהלך שכבר הוכח בלי לחזור למסלול גנרי.",
      );
  const continuationMoves = needsRepair
    ? buildRepairMoves(productClass, artifactTitle)
    : buildAdvanceMoves(continuationLoop.continuationMoves, artifactTitle);

  return {
    learningDecisionImpact: {
      impactId: `learning-decision-impact:${normalizeString(projectId, "unknown-project")}`,
      impactFamily: "deep-adaptive-learning-decision-impact",
      status: "ready",
      strategy,
      statusLabel,
      drivingSignals: [
        feedback.status ? `outcome:${feedback.status}` : null,
        feedback.trend ? `trend:${feedback.trend}` : null,
        adaptiveDecision.loopMode ? `adaptive:${adaptiveDecision.loopMode}` : null,
        deploymentFeedback.policyDecision ? `deploy:${deploymentFeedback.policyDecision}` : null,
        deploymentFeedback.latestProviderStatus ? `provider:${deploymentFeedback.latestProviderStatus}` : null,
        approval.status ? `approval:${approval.status}` : null,
      ].filter(Boolean),
      runtimeDecision: {
        status: needsRepair ? "live-stabilize" : "live-advance",
        label: runtimeLabel,
        currentEffect: needsRepair
          ? `Nexus שומרת על ${normalizeString(runtimeResolver.runtimeFamily, "runtime")} ו־${normalizeString(packagingContract.packageMode, "packaging")} עד שהסימנים הבעייתיים יירדו.`
          : `Nexus ממשיכה עם ${normalizeString(runtimeResolver.runtimeFamily, "runtime")} ו־${normalizeString(packagingContract.packageMode, "packaging")} כי הסבב האחרון לא דורש rollback.`,
      },
      releaseDecision: {
        status: !approvalReady || !deploymentHealthy || !releaseReady ? "live-hold" : "live-advance",
        label: releaseLabel,
        currentEffect: !approvalReady || !deploymentHealthy || !releaseReady
          ? "ה־release הבא לא מקודם אוטומטית; learning מחייב עוד proof, אישור, או יציבות deploy לפני promotion."
          : "ה־release path ממשיך מתוך מה שכבר הוכח, בלי לפתוח מסלול חדש ולא מבוסס.",
      },
      continuationDecision: {
        status: needsRepair ? "live-repair" : "live-advance",
        title: continuationTitle,
        description: continuationDescription,
        moves: continuationMoves,
        nextMoveFamily: needsRepair ? "learning-repair-move" : normalizeString(continuationLoop.nextMoveFamily, "derived-loop-move"),
      },
      nextTaskDecision: {
        title: continuationTitle,
        description: continuationDescription,
        lane: needsRepair ? "stabilization" : "loop",
        dependencyStatus: needsRepair
          ? "הלמידה זיהתה שצריך repair לפני move נוסף"
          : "הלמידה מאשרת להמשיך מתוך מה שכבר הוכח",
        whyNow: needsRepair
          ? "זה הצעד הנכון עכשיו כי outcome feedback ו־adaptive execution כבר מראים שהפרויקט צריך repair לפני expansion."
          : "זה הצעד הנכון עכשיו כי הלמידה מהסבב האחרון לא פתחה חסם חדש ומאשרת המשך על מה שכבר הוכח.",
      },
      continuityRule: "learning-driven decisions must survive revisit, rerun, route restore, and return into execution without silently resetting to generic defaults",
    },
  };
}
