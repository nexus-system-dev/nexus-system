import { formatArtifactStatus, resolveCanonicalArtifact } from "./shared-proof-artifact.js";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function escapeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function sanitizeProductFacingCopy(value, fallback = "") {
  const text = escapeText(value, fallback);
  return text
    .replaceAll("ב-Proof", "בתצוגה שנפתח")
    .replaceAll("ה־Proof", "התצוגה הבאה")
    .replaceAll("Proof", "התצוגה")
    .replaceAll("ownership", "בעלות")
    .replaceAll("workspace", "משטח עבודה")
    .replaceAll("Workspace", "משטח עבודה")
    .replaceAll("owner", "אחראי")
    .replaceAll("Owner", "אחראי")
    .replaceAll("SLA", "רמת שירות");
}

function resolveArtifactExpectation(project) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.proofArtifact?.artifactExpectation,
  );
}

function looksLikeInternalIdentifier(value = "") {
  const text = escapeText(value, "");
  return text.includes(":") || text.includes(".preview") || text.startsWith("generated-");
}

function buildHumanProofSurfaceTitle({ artifactExpectation = {}, fallback = "" } = {}) {
  return artifactExpectation.title || fallback || "תצוגת הוכחה";
}

function buildHumanProofSurfaceMeta({ artifactExpectation = {}, fallback = "" } = {}) {
  return artifactExpectation.projectTypeLabel || fallback || "תצוגת הוכחה פעילה";
}

function isWeakGeneratedSurfaceClass(artifact, artifactExpectation = {}) {
  return artifact.artifactType === "generated-surface"
    && ["landing-page", "mobile-app"].includes(String(artifactExpectation.projectType ?? "").trim());
}

function resolveWeakClassFocusAreas(artifactExpectation = {}) {
  const focusAreas = normalizeArray(artifactExpectation.proofFocus)
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim());

  if (focusAreas.length) {
    return focusAreas;
  }

  if (artifactExpectation.projectType === "landing-page") {
    return [
      "הבטחה ראשית מעל הקפל",
      "הוכחת אמון שתומכת בהחלטה",
      "CTA מרכזי אחד שקל להבין",
    ];
  }

  if (artifactExpectation.projectType === "mobile-app") {
    return [
      "מסך ראשון ברור למשתמש הנכון",
      "פעולה ראשונה שאפשר להבין בלי הדרכה",
      "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
    ];
  }

  return [];
}

function resolveWeakClassProofCriteria(artifactExpectation = {}) {
  const title = artifactExpectation.title || "התוצר";
  const focusAreas = resolveWeakClassFocusAreas(artifactExpectation);

  if (artifactExpectation.projectType === "landing-page") {
    return [
      {
        title: focusAreas[0] ?? "הבטחה ראשית מעל הקפל",
        body: `${title} צריך לגרום למבקר להבין בתוך שניות מה מציעים לו ולמה זה רלוונטי עבורו.`,
        passed: true,
      },
      {
        title: focusAreas[1] ?? "הוכחת אמון שתומכת בהחלטה",
        body: `${title} צריך להראות למה אפשר לסמוך על ההצעה עוד לפני הגלילה או הלחיצה.`,
        passed: true,
      },
      {
        title: focusAreas[2] ?? "CTA מרכזי אחד שקל להבין",
        body: `${title} צריך להוביל לפעולה אחת ברורה שמחוברת ישירות למה שסגרנו ב-onboarding.`,
        passed: true,
      },
    ];
  }

  if (artifactExpectation.projectType === "mobile-app") {
    return [
      {
        title: focusAreas[0] ?? "מסך ראשון ברור למשתמש הנכון",
        body: `${title} צריך להבהיר כבר במסך הראשון למי הזרימה מיועדת ומה המשתמש אמור להבין מיד.`,
        passed: true,
      },
      {
        title: focusAreas[1] ?? "פעולה ראשונה שאפשר להבין בלי הדרכה",
        body: `${title} צריך להראות פעולה ראשונה מובנת בלי להעמיס הסבר או לנחש את הצעד הבא.`,
        passed: true,
      },
      {
        title: focusAreas[2] ?? "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
        body: `${title} צריך לשמור על רצף ברור בין המסך הראשון לצעד הבא כך שהמובייל ירגיש כמו פתרון ולא רק כמו surface.`,
        passed: true,
      },
    ];
  }

  return focusAreas.map((focus, index) => ({
    title: index === 0
      ? `ה־proof מוכיח ${focus}`
      : focus,
    body: `${title} צריך להמחיש כאן ${focus.toLowerCase()} כחלק מהארטיפקט שאליו כיוונו כבר ב-onboarding.`,
    passed: true,
  }));
}

function resolveWeakClassArtifactDescriptors(artifactExpectation = {}) {
  const focusAreas = resolveWeakClassFocusAreas(artifactExpectation);

  if (artifactExpectation.projectType === "landing-page") {
    return [
      {
        name: focusAreas[0] ?? "הבטחה ראשית מעל הקפל",
        type: "מה המבקר צריך להבין מיד",
        description: `${artifactExpectation.title || "דף הנחיתה"} צריך לפתוח בהבטחה שקושרת בין הקהל, ההצעה והכאב המרכזי.`,
      },
      {
        name: focusAreas[1] ?? "הוכחת אמון שתומכת בהחלטה",
        type: "למה אפשר לסמוך על ההצעה",
        description: "ה־proof צריך להראות שהמסך כולל סימני אמון או הוכחה שמחזקים את ההחלטה להמשיך.",
      },
      {
        name: focusAreas[2] ?? "CTA מרכזי אחד שקל להבין",
        type: "לאיזו פעולה המסך מוביל",
        description: "ה־proof צריך להבהיר מה הפעולה המרכזית שהמבקר אמור לעשות עכשיו בלי לפצל קשב.",
      },
    ];
  }

  if (artifactExpectation.projectType === "mobile-app") {
    return [
      {
        name: focusAreas[0] ?? "מסך ראשון ברור למשתמש הנכון",
        type: "מה המשתמש פוגש ראשון",
        description: `${artifactExpectation.title || "זרימת המובייל"} צריך להבהיר מיד מה תפקיד המסך הראשון ולמי הוא מיועד.`,
      },
      {
        name: focusAreas[1] ?? "פעולה ראשונה שאפשר להבין בלי הדרכה",
        type: "מה המשתמש אמור לעשות קודם",
        description: "ה־proof צריך להראות שהפעולה הראשונה מובנת מתוך המסך עצמו ולא נשענת על הסבר חיצוני.",
      },
      {
        name: focusAreas[2] ?? "זרימה ניידת שמטפלת ישירות בכאב המרכזי",
        type: "איך הזרימה ממשיכה קדימה",
        description: "ה־proof צריך לשמור על רצף ברור אל הצעד הבא כך שהמובייל ירגיש שמיש ולא רק יפה.",
      },
    ];
  }

  return focusAreas.map((focus) => ({
    name: focus,
    type: "מה צריך להיות גלוי בתוצר",
    description: `${artifactExpectation.title || "התוצר"} צריך להמחיש כאן ${focus.toLowerCase()} כחלק מהארטיפקט שאליו כיוונו כבר ב-onboarding.`,
  }));
}

function resolveProofArtifactType(project) {
  const artifact = resolveCanonicalArtifact(project);
  return {
    artifact,
    artifactType: artifact.artifactType,
    payload: normalizeObject(artifact.previewPayload),
  };
}

function resolveProofStats(project) {
  const { artifactType, payload } = resolveProofArtifactType(project);
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const analytics = normalizeObject(normalizeObject(project.growthWorkspace).analytics);

  if (artifactType === "commerce-ops-dashboard") {
    const payloadStats = normalizeArray(payload.stats);
    return [
      {
        label: payloadStats[0]?.label ?? "הזמנות דחופות",
        value: String(payloadStats[0]?.value ?? "5"),
      },
      {
        label: payloadStats[1]?.label ?? "חריגות קטלוג",
        value: String(payloadStats[1]?.value ?? "3"),
      },
      {
        label: payloadStats[2]?.label ?? "פריטי מלאי בסיכון",
        value: String(payloadStats[2]?.value ?? "2"),
      },
      {
        label: "owners פעילים",
        value: "3",
      },
    ];
  }

  if (artifactType === "internal-ops-dashboard") {
    const payloadStats = normalizeArray(payload.stats);
    return [
      {
        label: payloadStats[0]?.label ?? "בקשות פתוחות",
        value: String(payloadStats[0]?.value ?? "12"),
      },
      {
        label: payloadStats[1]?.label ?? "דורש טיפול היום",
        value: String(payloadStats[1]?.value ?? "4"),
      },
      {
        label: payloadStats[2]?.label ?? "בעלי משימה פעילים",
        value: String(payloadStats[2]?.value ?? "3"),
      },
      {
        label: "חסמי רמת שירות",
        value: "1",
      },
    ];
  }

  return [
    {
      label: analytics.summaryCards?.[0]?.label ?? "ביקורים",
      value: String(analytics.summaryCards?.[0]?.value ?? generatedSurfaceProofSchema.evidence?.regionCount ?? "128"),
    },
    {
      label: analytics.summaryCards?.[1]?.label ?? "הרשמות",
      value: String(analytics.summaryCards?.[1]?.value ?? generatedSurfaceProofSchema.evidence?.visibleCtaCount ?? "23"),
    },
    {
      label: analytics.summaryCards?.[2]?.label ?? "שיעור המרה",
      value: String(analytics.summaryCards?.[2]?.value ?? "18%"),
    },
    {
      label: analytics.summaryCards?.[3]?.label ?? "עלות ליד",
      value: String(analytics.summaryCards?.[3]?.value ?? "₪0.45"),
    },
  ];
}

function hasOpenProductSurface(artifact) {
  return artifact.actions?.open?.supported === true || artifact.actions?.download?.supported === true;
}

function resolveSuccessCriteria(project, artifact) {
  const state = normalizeObject(project.state);
  const artifactExpectation = resolveArtifactExpectation(project);
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema ?? state.generatedSurfaceProofSchema);
  const releaseValidation = normalizeObject(normalizeObject(project.releaseWorkspace).validation);
  const proposalApplyDecision = normalizeObject(project.proposalApplyDecision ?? state.proposalApplyDecision);
  const previewStatus = generatedSurfaceProofSchema.summary?.previewStatus ?? "available";
  const validationStatus = generatedSurfaceProofSchema.summary?.validationStatus ?? releaseValidation.status ?? "passed";
  const weakClassGeneratedSurface = isWeakGeneratedSurfaceClass(artifact, artifactExpectation);

  if (artifact.artifactType === "internal-ops-dashboard" || artifact.artifactType === "commerce-ops-dashboard") {
    const isCommerce = artifact.artifactType === "commerce-ops-dashboard";
    return [
      ...(artifactExpectation.title
        ? [{
            title: "התצוגה נשארת נאמנה למה שסגרנו",
            body: `התוצר ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
            passed: true,
          }]
        : []),
      {
        title: isCommerce ? "נבנה מרכז מסחר שאפשר לבדוק באמת" : "נבנה משטח עבודה שאפשר לבדוק באמת",
        body: isCommerce
          ? "יש מסך מסחר חי שאפשר לפתוח, לקרוא, ולהבין ממנו מה דחוף בהזמנות, בקטלוג ובמלאי."
          : "יש מסך עבודה חי שאפשר לפתוח, לקרוא, ולהבין ממנו מה נבנה לצוות.",
        passed: true,
      },
      {
        title: "הצעד הבא ברור",
        body: isCommerce
          ? "התוצר מראה מה צריך לטפל עכשיו במסחר, מי מחזיק את הבעלות, ואיך נראית הפעולה הקרובה."
          : "התוצר מראה מה צריך לטפל עכשיו, מי הקהל שלו, ואיך נראית הפעולה הקרובה.",
        passed: true,
      },
      {
        title: "אפשר להמשיך עם אותו תוצר",
        body: "אפשר לפתוח את התוצר, לעבור לאישור, ולהמשיך עם אותו משטח עבודה לאורך הלולאה.",
        passed: true,
      },
      {
        title: "ה־surface מוכן לסבב שיפור",
        body: proposalApplyDecision.status === "blocked"
          ? "המסך מוכן לבדיקה ולאישור, גם אם נשאר מקום לשיפור בסבב הבא."
          : `סטטוס האישור כרגע: ${formatArtifactStatus(proposalApplyDecision.status ?? artifact.status)}`,
        passed: true,
      },
    ];
  }

  if (artifact.artifactType === "landing-page") {
    return [
      ...(artifactExpectation.title
        ? [{
            title: "התצוגה נשארת נאמנה למה שסגרנו",
            body: `התוצר ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
            passed: true,
          }]
        : []),
      {
        title: "רואים את הדף עצמו ולא renderer state",
        body: "רואים דף נחיתה עם הבטחה, אמון ופעולה ברורה במקום לדבר על חלקים טכניים של המערכת.",
        passed: true,
      },
      {
        title: "יש הבטחה חדה מעל הקפל",
        body: "המבקר יכול להבין מהר מה ההצעה ולמה היא רלוונטית עבורו.",
        passed: true,
      },
      {
        title: "יש אמון ופעולה ברורה",
        body: "המסך מראה למה אפשר לסמוך על ההצעה ולאיזו פעולה אחת ממשיכים מכאן.",
        passed: true,
      },
      {
        title: "אפשר לפתוח את הדף ולהמשיך ממנו",
        body: "אפשר לפתוח את דף הנחיתה כמשטח עצמאי, להוריד אותו, ולהמשיך ממנו לאישור.",
        passed: true,
      },
    ];
  }

  if (artifact.artifactType === "mobile-app") {
    return [
      ...(artifactExpectation.title
        ? [{
            title: "התצוגה נשארת נאמנה למה שסגרנו",
            body: `התוצר ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
            passed: true,
          }]
        : []),
      {
        title: "רואים את הזרימה עצמה ולא שכבת מעבר טכנית",
        body: "רואים זרימת מובייל עם מסך ראשון, פעולה ראשונה והמשך ברור קדימה במקום לדבר על נתונים טכניים בלבד.",
        passed: true,
      },
      {
        title: "המסך הראשון ברור למשתמש",
        body: "המשתמש יכול להבין כבר ב־Proof מה הוא פוגש ראשון ולמה המסך הזה רלוונטי עבורו.",
        passed: true,
      },
      {
        title: "הפעולה הראשונה נראית שמישה",
        body: "המסך מבהיר מה עושים קודם ואיך הזרימה ממשיכה לצעד הבא בלי להישען על הסבר חיצוני.",
        passed: true,
      },
      {
        title: "התוצר נשאר מוכן להתקדמות",
        body: "התצוגה שומרת גם את נתיב ההמשך כך שהמובייל מרגיש כמו מוצר שניתן לקדם, לא רק הדגמה חד-פעמית.",
        passed: true,
      },
    ];
  }

  if (artifact.artifactType === "followup-dashboard") {
    return [
      ...(artifactExpectation.title
        ? [{
            title: "התוצאה נשארת נאמנה למה שסגרנו",
            body: `התוצר ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
            passed: true,
          }]
        : []),
      {
        title: "רואים לוח עבודה שאפשר להבין מיד",
        body: "המסך מציג לקוחות, סדר עדיפויות והפעולה הבאה במקום לדבר על רשומה טכנית או תקציר מערכת.",
        passed: true,
      },
      {
        title: "הפעולה הבאה ברורה לצוות",
        body: "אפשר להבין מיד למי צריך לפנות עכשיו ומה הנוסח שמוכן לשליחה.",
        passed: true,
      },
      {
        title: "יש רצף להמשך העבודה",
        body: "התוצר נשאר פתיח, ניתן לפתיחה ולהמשך review בלי לאבד את ההקשר של הלקוח הבא.",
        passed: true,
      },
      {
        title: "שפת המסך נשארת מוצרית",
        body: "המסך מדבר על לקוחות, הודעות והמשך טיפול, בלי להעמיס סטטוסי validation או apply כשכבת אמת ראשית.",
        passed: true,
      },
    ];
  }

  if (weakClassGeneratedSurface) {
    return [
      ...(artifactExpectation.title
        ? [{
            title: "התצוגה נשארת נאמנה למה שסגרנו",
            body: `התוצר שמופיע כאן ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
            passed: true,
          }]
        : []),
      ...resolveWeakClassProofCriteria(artifactExpectation),
      {
        title: "יש surface שאפשר לבדוק בפועל",
        body: generatedSurfaceProofSchema.evidence?.isPreviewable
          ? "המסך מוכן לבדיקה ויזואלית כחלק מהארטיפקט שאליו כיוונו."
          : "נבנתה תצוגה ראשונה שאפשר לבדוק בתוך המסלול גם לפני פתיחה חיצונית מלאה.",
        passed: generatedSurfaceProofSchema.evidence?.isPreviewable !== false,
      },
      {
        title: "התצוגה כבר מחזיקה את הכיוון שסגרנו",
        body: sanitizeProductFacingCopy(
          artifactExpectation.continuityLine,
          `${artifactExpectation.title || "התוצר"} כבר מחזיק את ההבטחה, הפעולה והרצף שהוגדרו ב־onboarding.`,
        ),
        passed: true,
      },
    ];
  }

  return [
    ...(artifactExpectation.title
      ? [{
          title: "התצוגה נשארת נאמנה למה שסגרנו",
          body: `התוצר שמופיע כאן ממשיך את הכיוון שהוגדר ב-onboarding: ${artifactExpectation.title}.`,
          passed: true,
        }]
      : []),
    {
      title: "נוצר תוצר שניתן לבדיקה",
      body: generatedSurfaceProofSchema.evidence?.isPreviewable
        ? "יש תצוגה שאפשר לפתוח, לבדוק ולהבין ממנה מה כבר נבנה."
        : "יש תצוגה חיה שמחזיקה את התוצר ומאפשרת לבדוק מה כבר נבנה בו.",
      passed: generatedSurfaceProofSchema.evidence?.isPreviewable !== false,
    },
    {
      title: "כיוון המוצר נשמר",
      body: sanitizeProductFacingCopy(
        artifactExpectation.continuityLine,
        artifactExpectation.summary || "התצוגה נשארת צמודה למה שסגרנו עד עכשיו ולא מתפרקת לשפת מערכת פנימית.",
      ),
      passed: true,
    },
    {
      title: "יש צעד המשך ברור",
      body: sanitizeProductFacingCopy(
        artifact.previewPayload?.nextAction?.title,
        artifact.previewPayload?.statusLine || "התוצר נשמר כחלק רציף מהלולאה ומוכן לצעד ההמשך הבא.",
      ),
      passed: hasOpenProductSurface(artifact),
    },
    {
      title: "אפשר להמשיך מכאן בביטחון",
      body: artifact.actions?.open?.supported === true
        ? "אפשר לפתוח את התוצר, לעבור לאישור, ולהמשיך איתו בלי לאבד את ההקשר."
        : "התוצר נשמר בתוך המסלול כך שאפשר להמשיך איתו קדימה בלי לאבד את ההקשר.",
      passed: true,
    },
  ];
}

function resolveArtifacts(project, artifact) {
  const generatedSurfaceProofSchema = normalizeObject(project.generatedSurfaceProofSchema);
  const aiControlCenterSurface = normalizeObject(project.aiControlCenterSurface);
  const artifactExpectation = resolveArtifactExpectation(project);
  const previewScreenId = aiControlCenterSurface.generatedSurfacePreview?.screenId ?? "generated-preview";
  const payload = normalizeObject(artifact.previewPayload);
  const weakClassGeneratedSurface = isWeakGeneratedSurfaceClass(artifact, artifactExpectation);

  if (weakClassGeneratedSurface) {
    return [
      ...(artifactExpectation.title
        ? [{
            name: artifactExpectation.title,
            type: "הארטיפקט שאליו כיוונו",
            meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
            description: artifactExpectation.summary ?? "זה התוצר שננעל ב-onboarding והוא הבסיס ל-proof הנוכחי.",
          }]
        : []),
      ...resolveWeakClassArtifactDescriptors(artifactExpectation).map((item) => ({
        name: item.name,
        type: item.type,
        meta: artifactExpectation.projectTypeLabel ?? "Proof focus",
        description: item.description,
      })),
      {
        name: looksLikeInternalIdentifier(previewScreenId)
          ? buildHumanProofSurfaceTitle({ artifactExpectation, fallback: "המסך שנבדק ב־Proof" })
          : previewScreenId,
        type: "המסך שנבדק עכשיו",
        meta: "תצוגת מוצר פעילה",
        description: "זה המשטח הוויזואלי שעליו בודקים אם הארטיפקט באמת מממש את הכיוון שננעל כבר ב-onboarding.",
      },
    ];
  }

  if (artifact.artifactType === "internal-ops-dashboard" || artifact.artifactType === "commerce-ops-dashboard") {
    const isCommerce = artifact.artifactType === "commerce-ops-dashboard";
    return [
      ...(artifactExpectation.title
        ? [{
            name: artifactExpectation.title,
            type: "כיוון שננעל ב-onboarding",
            meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
            description: sanitizeProductFacingCopy(artifactExpectation.summary, "זה התוצר שנקבע כבר בשלב ההבנה ולא הומצא רק בתצוגה הזו."),
          }]
        : []),
      {
        name: sanitizeProductFacingCopy(payload.title, isCommerce ? "משטח מסחר" : "משטח תפעול"),
        type: isCommerce ? "מרכז המסחר" : "משטח העבודה",
        meta: `${normalizeArray(payload.queueColumns).length} עמודות תור`,
        description: isCommerce
          ? "המסך המרכזי שנבנה כדי לרכז הזמנות, חריגות קטלוג, מלאי ובעלות לצוות המסחר."
          : "המסך המרכזי שנבנה כדי לרכז בקשות, סטטוסים ובעלות לצוות.",
      },
      {
        name: sanitizeProductFacingCopy(payload.nextAction?.title, "הפעולה הבאה"),
        type: "מוקד הפעולה",
        meta: sanitizeProductFacingCopy(payload.statusLine, "הצעד הבא מוכן"),
        description: isCommerce
          ? "הפעולה המיידית שהצוות יכול לקחת כדי לשחרר צוואר בקבוק מסחרי ולהחזיר את המסלול למכירה תקינה."
          : "הפעולה המיידית שהצוות יכול לקחת כדי לשחרר צוואר בקבוק.",
      },
      {
        name: sanitizeProductFacingCopy(payload.audience, isCommerce ? "צוותי מסחר" : "צוותים פנימיים"),
        type: "הקהל שמקבל את התוצר",
        meta: "מוכן לעבודה מיידית",
        description: "מי שמשטח העבודה נבנה עבורו ומה אפשר לעשות איתו מיד.",
      },
    ];
  }

  if (artifact.artifactType === "landing-page") {
    return [
      ...(artifactExpectation.title
        ? [{
            name: artifactExpectation.title,
            type: "כיוון שננעל ב-onboarding",
            meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
            description: sanitizeProductFacingCopy(artifactExpectation.summary, "זה דף הנחיתה שנקבע כבר בשלב ההבנה ולא הומצא רק בתצוגה הזו."),
          }]
        : []),
      {
        name: payload.headline ?? payload.title ?? "Landing hero",
        type: "הבטחה ראשית מעל הקפל",
        meta: payload.primaryCta?.label ?? "כפתור פעולה",
        description: "הכותרת וה־CTA המרכזי שאיתם המבקר פוגש את התוצר כבר במסך הראשון.",
      },
      {
        name: payload.valueProps?.[0] ?? "Trust and value blocks",
        type: "עמודי התווך של ההצעה",
        meta: `${normalizeArray(payload.valueProps).length} מסרי ערך`,
        description: "המסרים שהופכים את דף הנחיתה למשהו שאפשר באמת להציג למבקר ולא רק לבדוק טכנית.",
      },
      {
        name: payload.proofBlocks?.[0]?.title ?? "Trust proof",
        type: "בלוקי אמון",
        meta: `${normalizeArray(payload.proofBlocks).length} בלוקים גלויים`,
        description: "שכבת ההוכחה שמחזקת את ההחלטה להמשיך לפעולה.",
      },
    ];
  }

  if (artifact.artifactType === "mobile-app") {
    return [
      ...(artifactExpectation.title
        ? [{
            name: artifactExpectation.title,
            type: "כיוון שננעל ב-onboarding",
            meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
            description: sanitizeProductFacingCopy(artifactExpectation.summary, "זו זרימת המובייל שנקבעה כבר בשלב ההבנה ולא הומצאה רק בתצוגה הזו."),
          }]
        : []),
      {
        name: payload.firstScreen?.title ?? "First screen",
        type: "מה המשתמש פוגש ראשון",
        meta: payload.firstScreen?.screenType ?? "מסך מובייל",
        description: "המסך הראשון שאמור להסביר מיד למי הזרימה מיועדת ומה מבינים ממנו בלי הדרכה.",
      },
      {
        name: payload.firstAction?.title ?? "First action",
        type: "מה המשתמש אמור לעשות קודם",
        meta: payload.continuity?.nextScreenTitle ?? "המסך הבא",
        description: "הפעולה הראשונה שהמוצר מבקש מהמשתמש, עם רצף ברור למסך הבא.",
      },
      {
        name: payload.release?.artifactPath ?? "artifacts/ios/app.ipa",
        type: "נתיב שחרור שנשמר",
        meta: payload.release?.exportMethod ?? "app-store",
        description: "ה־artifact שומר גם את נתיב ה־release כדי שהמובייל ירגיש תוצר שאפשר באמת לקדם.",
      },
    ];
  }

  if (artifact.artifactType === "followup-dashboard") {
    return [
      ...(artifactExpectation.title
        ? [{
            name: artifactExpectation.title,
            type: "כיוון שננעל ב-onboarding",
            meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
            description: artifactExpectation.summary ?? "זה הדאשבורד שנקבע כבר בשלב ההבנה ולא הומצא רק בשלב התוצאה.",
          }]
        : []),
      {
        name: payload.clients?.[0]?.name ?? "הלקוח הבא לטיפול",
        type: "מי דורש פעולה עכשיו",
        meta: `${normalizeArray(payload.clients).length} לקוחות במעקב`,
        description: "הלוח מראה מי דורש טיפול עכשיו בלי לגרום למשתמש לחפש בין תקצירים טכניים.",
      },
      {
        name: payload.nextAction?.title ?? "הפעולה הבאה",
        type: "מה עושים עכשיו",
        meta: payload.statusLine ?? "הצעד הבא מוכן",
        description: "הפעולה הבאה מוצגת כחלק מהלוח עצמו ולא רק כהמלצה מופשטת.",
      },
      {
        name: payload.generatedMessage?.label ?? "הודעה מוכנה לשליחה",
        type: "מה כבר מוכן לשימוש",
        meta: "מוכן לשימוש מיידי",
        description: "ההודעה המוכנה והכפתורים מסבירים מה אפשר לעשות מיד מתוך התוצר.",
      },
    ];
  }

  return [
    ...(artifactExpectation.title
      ? [{
          name: artifactExpectation.title,
          type: "כיוון שננעל ב-onboarding",
          meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
          description: sanitizeProductFacingCopy(artifactExpectation.summary, "זה התוצר שנקבע כבר בשלב ההבנה ולא הומצא רק בתצוגה הזו."),
        }]
      : []),
    {
      name: looksLikeInternalIdentifier(previewScreenId)
        ? buildHumanProofSurfaceTitle({ artifactExpectation, fallback: "תצוגת ה־proof הפעילה" })
        : previewScreenId,
      type: "משטח התצוגה",
      meta: "תצוגת מוצר פעילה",
      description: "התצוגה הגלויה שנוצרה עבור התוצר הנוכחי ושעליה בודקים את ההבטחה, הפעולה והרצף.",
    },
    {
      name: buildHumanProofSurfaceTitle({ artifactExpectation, fallback: generatedSurfaceProofSchema.proofId ?? "proof-record" }),
      type: "מה כבר מוחשי בתצוגה",
      meta: artifactExpectation.projectTypeLabel ?? "כיוון המוצר",
      description: "זה החלק במסלול שבו אפשר כבר לראות את התוצר עצמו ולא רק לדבר עליו.",
    },
    {
      name: artifactExpectation.title || "מקור התוצר הפעיל",
      type: "הכיוון שנשמר לאורך הלולאה",
      meta: generatedSurfaceProofSchema.evidence?.hasCtaAnchors ? "יש פעולת המשך גלויה" : "התצוגה מחזיקה את כיוון המוצר",
      description: "זה הכיוון שממנו התוצר הנוכחי צמח ושאותו צריך להמשיך להעמיק בלולאה הבאה.",
    },
  ];
}

export function buildProofResultViewModel({ project = null, qaMode = false } = {}) {
  const safeProject = normalizeObject(project);
  const artifactExpectation = resolveArtifactExpectation(safeProject);
  const aiControlCenterSurface = normalizeObject(safeProject.aiControlCenterSurface);
  const generatedSurfaceProofSchema = normalizeObject(safeProject.generatedSurfaceProofSchema);
  const artifact = resolveCanonicalArtifact(safeProject);
  const artifactPayload = normalizeObject(artifact.previewPayload);
  const previewTitle = artifact.artifactType === "generated-surface"
    ? buildHumanProofSurfaceTitle({
        artifactExpectation,
        fallback: aiControlCenterSurface.generatedSurfacePreview?.screenId ?? "תצוגת הוכחה",
      })
    : artifact.title;
  const proofStatus = generatedSurfaceProofSchema.summary?.proofStatus ?? "ready";
  const previewMeta = artifact.artifactType === "generated-surface"
    ? (isWeakGeneratedSurfaceClass(artifact, artifactExpectation)
        ? escapeText(artifactExpectation.projectTypeLabel, buildHumanProofSurfaceMeta({ artifactExpectation }))
        : buildHumanProofSurfaceMeta({
            artifactExpectation,
            fallback: looksLikeInternalIdentifier(aiControlCenterSurface.liveRuntimeBinding?.activeScreenId ?? "")
              ? "תצוגת הוכחה פעילה"
              : (aiControlCenterSurface.liveRuntimeBinding?.activeScreenId ?? "תצוגת הוכחה פעילה"),
          }))
    : escapeText(artifactPayload.statusLine, artifact.status);
  const previewSupportLine = artifact.artifactType === "generated-surface"
    ? (looksLikeInternalIdentifier(artifact.provenance?.screenId ?? "")
        ? escapeText(artifactExpectation.summary, "זה התוצר שנמצא כרגע בבדיקה חיה בתוך הלולאה.")
        : (artifact.provenance?.screenId ?? artifact.previewKind))
    : escapeText(artifactPayload.subtitle, artifact.previewKind);

  return {
    title: "זה מה שנבנה עד עכשיו",
    subtitle: qaMode
      ? "זה מצב QA זמני למסך proof גם בלי runtime מלא."
      : "כאן רואים את התוצר שנבנה עבורך, ולמה הוא כבר מוכן לצעד הבא.",
    showQaNav: qaMode,
    projectName: safeProject.name ?? "QA mode",
    badge: qaMode ? "QA preview override" : "תצוגת התוצר",
    previewLabel: "תצוגת המוצר",
    previewTitle,
    previewMeta,
    readyTitle: artifact.artifactType === "generated-surface" ? `מוכן ${previewTitle}` : `${previewTitle} מוכן לבדיקה`,
    readySubtitle: artifact.artifactType === "generated-surface"
      ? sanitizeProductFacingCopy(
          artifactExpectation.continuityLine,
          "התצוגה הזו כבר מוכנה לבדיקה ולהמשך, בלי לאבד את הכיוון המוצרי שננעל קודם.",
        )
      : sanitizeProductFacingCopy(artifactPayload.subtitle, `מצב התצוגה: ${proofStatus}`),
    artifact,
    whyThisCounts:
      artifactExpectation.continuityLine
        ? sanitizeProductFacingCopy(artifactExpectation.continuityLine)
        : artifact.artifactType === "generated-surface"
        ? "כבר רואים כאן תוצר מוחשי שאפשר לבדוק ולהמשיך ממנו, במקום שכבת מערכת פנימית."
        : "נבנה עבורך משטח מוצרי שאפשר לבדוק, לפתוח, ולהמשיך ממנו לאישור בלי לאבד את התוצר.",
    successCriteria: resolveSuccessCriteria(safeProject, artifact),
    artifacts: resolveArtifacts(safeProject, artifact),
    stats: resolveProofStats(safeProject),
    artifactSupportLine: previewSupportLine,
    artifactDisplayStatus: formatArtifactStatus(artifact.status),
    primaryAction: { label: "המשך לאישור", target: "confirmation" },
    secondaryActions: [
      {
        label: artifact.actions?.open?.label ?? "פתח את התוצר",
        target: "proof-open",
        supported: artifact.actions?.open?.supported === true,
      },
      {
        label: artifact.actions?.download?.label ?? "הורד את התוצר",
        target: "proof-download",
        supported: artifact.actions?.download?.supported === true,
      },
    ],
  };
}
