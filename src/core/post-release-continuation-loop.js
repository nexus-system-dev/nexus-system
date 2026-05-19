function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const CLASS_DEFAULT_MOVES = {
  "landing-page": [
    "לחדד את ההבטחה הראשית מעל הקפל",
    "לחזק את בלוק האמון שמצדיק את ההמשך",
    "לקבע CTA אחד ברור למסלול ההמרה הבא",
  ],
  "mobile-app": [
    "לחדד את המסך הראשון סביב מה שהמשתמש צריך להבין עכשיו",
    "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
    "לקבע את מסך ההמשך כך שהזרימה לא תיעצר אחרי הלחיצה הראשונה",
  ],
  "internal-tool": [
    "לחדד את הבעלות על הפריטים הפעילים",
    "להבליט SLA או דחיפות שדורשים טיפול עכשיו",
    "לקבע פעולה הבאה אחת מתוך ה־workspace",
  ],
  "commerce-ops": [
    "לחדד איזה הזמנה דורשת טיפול ראשון",
    "להבהיר מצב קטלוג ומלאי שמסביר את החיכוך הבא",
    "להבליט פעולה תפעולית אחת שמקדמת את המסחר עכשיו",
  ],
};

function buildGenericMoves(productClass) {
  return CLASS_DEFAULT_MOVES[productClass] ?? [
    "לחדד את החלק הבא בתוצר שכבר אושר",
    "להפוך את הפעולה הבאה לברורה יותר מתוך המוצר",
    "לפתוח סבב שיפור שמחובר ישירות ל־release האחרון",
  ];
}

function buildStatusLabel(status) {
  if (status === "active") {
    return "סבב ההמשך כבר פתוח";
  }
  if (status === "ready") {
    return "מוכן לפתוח סבב המשך";
  }
  if (status === "preparing") {
    return "סבב ההמשך מתגבש";
  }
  return "עדיין אין סבב המשך אמיתי";
}

export function createPostReleaseContinuationLoop({
  productClass = null,
  proofArtifact = null,
  releaseEvidenceHandoffModel = null,
  releaseableProductStateContract = null,
  repeatedLoopContinuation = null,
} = {}) {
  const artifact = normalizeObject(proofArtifact);
  const handoff = normalizeObject(releaseEvidenceHandoffModel);
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const repeated = normalizeObject(repeatedLoopContinuation);
  const artifactTitle = normalizeString(artifact.title, "התוצר שאושר");
  const normalizedProductClass = normalizeString(productClass, "generic");
  const repeatedMoves = normalizeArray(repeated.upcomingItems).filter(Boolean);
  const continuationMoves = repeatedMoves.length ? repeatedMoves : buildGenericMoves(normalizedProductClass);
  const status = repeated.active === true
    ? "active"
    : releaseableState.status === "ready"
      ? "ready"
      : handoff.status === "active" || handoff.status === "preparing"
        ? "preparing"
        : "not-ready";
  const nextMoveTitle = normalizeString(
    repeated.missionTitle,
    `לקדם את ${artifactTitle}`,
  );
  const nextMoveDescription = normalizeString(
    repeated.missionDescription,
    `אחרי ה־release האחרון Nexus חייבת לפתוח סבב המשך שמקדם את ${artifactTitle} דרך fixes, improvements, או growth moves אמיתיים.`,
  );

  return {
    postReleaseContinuationLoop: {
      loopId: `post-release-continuation:${normalizeString(artifact.artifactId, "unknown-artifact")}`,
      loopFamily: "post-release-continuation",
      status,
      statusLabel: buildStatusLabel(status),
      originArtifactTitle: artifactTitle,
      originReleaseTarget: normalizeString(handoff.releaseTarget, normalizeString(releaseableState.releaseTarget, "private-deployment")),
      nextMoveTitle,
      nextMoveDescription,
      nextMoveFamily: repeated.active === true ? "explicit-loop-move" : "derived-loop-move",
      visibleContinuationRule: "release is not a terminal end state; the next fixes, improvements, or growth moves must emerge visibly inside Nexus",
      continuationMoves,
      boundedGrowthRule: "continuation may surface only product-connected moves, not fake autonomous company behavior",
      continuityRule: "post-release continuation must survive revisit, route restore, and transition back into execution",
    },
  };
}
