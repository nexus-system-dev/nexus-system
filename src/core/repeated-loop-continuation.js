function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function resolveArtifactExpectation(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.artifactExpectation
      ?? safeProject.context?.artifactExpectation
      ?? safeProject.onboardingStateHandoff?.artifactExpectation
      ?? safeProject.context?.onboardingStateHandoff?.artifactExpectation,
  );
}

function resolveGenerationIntent(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.generationIntent
      ?? safeProject.context?.generationIntent
      ?? safeProject.aiDesignRequest?.generationIntent
      ?? safeProject.context?.aiDesignRequest?.generationIntent,
  );
}

function resolveContinuationGate(project = null) {
  const safeProject = normalizeObject(project);
  return normalizeObject(
    safeProject.onboardingStateHandoff?.continuationGate
      ?? safeProject.context?.onboardingStateHandoff?.continuationGate
      ?? safeProject.onboardingCompletionDecision?.continuationGate
      ?? safeProject.context?.onboardingCompletionDecision?.continuationGate,
  );
}

function buildClarificationContinuation({
  artifactTitle,
  projectType,
  approvalCount,
  continuationGate,
}) {
  const iterationNumber = approvalCount + 1;
  const requestedMaterialLabel = normalizeString(continuationGate.requestedMaterialLabel, "חומר תומך שמדייק את הסבב הבא");
  const detail = normalizeString(
    continuationGate.detail,
    "נדרש עוד חומר תומך לפני שאפשר לפתוח increment אמיתי בלי למחזר את אותו artifact.",
  );
  const proofLineByType = {
    "landing-page": `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תראה שיפור אמיתי בהבטחה, באמון ובכפתור הפעולה של ${artifactTitle}.`,
    "mobile-app": `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תראה מסך ראשון חד יותר, פעולה ראשונה ברורה יותר, וזרימת המשך אמיתית של ${artifactTitle}.`,
    "commerce-ops": `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תראה תור הזמנות חד יותר, מצב קטלוג ברור יותר, ופעולה תפעולית אמיתית בתוך ${artifactTitle}.`,
    "internal-tool": `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תראה תור עבודה חד יותר, בעלות ברורה יותר, ופעולה הבאה אמיתית בתוך ${artifactTitle}.`,
    "small-saas": `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תראה פעולה הבאה מדויקת יותר ומשטח מוצרי חזק יותר עבור ${artifactTitle}.`,
  };

  return {
    active: true,
    requiresClarification: true,
    iterationNumber,
    projectType,
    artifactTitle,
    missionTitle: `לפני סבב ${iterationNumber} של ${artifactTitle} צריך עוד חומר תומך`,
    missionDescription: `Nexus לא ממשיך עכשיו אוטומטית כדי לא למחזר את אותו artifact. ${detail}`,
    expectedProofLine: proofLineByType[projectType] ?? `אחרי שיצורף ${requestedMaterialLabel}, התצוגה הבאה תוכל להראות התקדמות אמיתית של ${artifactTitle}.`,
    upcomingItems: [
      `לצרף ${requestedMaterialLabel}`,
      "לשמור את ההבהרה צמודה לאותו artifact שכבר אושר",
      "לפתוח מחדש את הסבב רק אחרי שיש מספיק הקשר לשיפור אמיתי",
    ],
    clarification: {
      gateType: "repeated-loop-supporting-material",
      requestedMaterialLabel,
      title: continuationGate.title || "צריך עוד חומר תומך לפני הסבב הבא",
      detail,
      promptTitle: `מה חסר כדי שסבב ${iterationNumber} של ${artifactTitle} יהיה אמיתי?`,
      promptBody: `כדי לא למחזר את ${artifactTitle}, Nexus צריך עכשיו ${requestedMaterialLabel}.`,
      promptPlaceholder: `הדבק כאן ${requestedMaterialLabel}`,
    },
    proofIncrement: {
      iterationNumber,
      reason: `הסבב הבא של ${artifactTitle} מושהה truthfully עד שיצורף ${requestedMaterialLabel}, כדי לא לייצר replay קוסמטי במקום התקדמות אמיתית.`,
    },
  };
}

function buildMobileContinuation({ artifactTitle, summary, audience, problem, solution, approvalCount }) {
  const iterationNumber = approvalCount + 1;
  const missionTitle = `לקדם את ${artifactTitle}`;
  const missionDescription = `סבב ${iterationNumber} עובר עכשיו מה־proof הראשוני לחידוד המסך הראשון, הפעולה הראשונה, והמסך שאליו הזרימה נוחתת אחריה.`;

  return {
    active: true,
    iterationNumber,
    projectType: "mobile-app",
    artifactTitle,
    missionTitle,
    missionDescription,
    expectedProofLine: `התצוגה הבאה תראה ${artifactTitle} עם מסך ראשון חד יותר, פעולה ראשונה ברורה יותר, ומעבר נקי למסך ההמשך.`,
    upcomingItems: [
      "לחדד את מסך הבית סביב מה שקורה היום",
      "להפוך את הפעולה הראשונה להחלטה אחת ברורה",
      "לקבע את המסך הבא כך שהזרימה לא תיעצר אחרי הלחיצה הראשונה",
    ],
    execution: {
      missionTitle,
      detail: summary || solution || "הסבב החדש מחזק את הזרימה הניידת בלי לשבור את ה־artifact שכבר אושר.",
      statusItems: [
        { label: "מסכמים מה המשתמש צריך להבין במסך הראשון", status: "done" },
        { label: "מחדדים את הפעולה הראשונה כך שתהיה ברורה בלחיצה אחת", status: "active" },
        { label: "מקבעים את מסך ההמשך כדי שלא נאבד הקשר", status: "active" },
        { label: "מכינים תצוגה שמראה מה השתפר מאז האישור", status: "pending" },
      ],
      liveItems: [
        "מחדד את מסך הבית סביב מה שקורה היום",
        "מקבע את הפעולה הראשונה כך שתדרוש אפס הסבר חיצוני",
        "מסדר את המעבר למסך ההמשך בלי לנתק את ההקשר",
        "מכין הוכחה שמראה את ההתקדמות של הסבב החדש",
      ],
      logItems: [
        { time: "עכשיו", message: `סבב ${iterationNumber} מחזק את המסך הראשון של ${artifactTitle}.` },
        { time: "עכשיו", message: `היעד הבא: פעולה ראשונה שברורה מיד ל-${audience || "המשתמש הנכון"}.` },
        { time: "עכשיו", message: `החסם שנפתר עכשיו: ${problem || "הזרימה עדיין לא חדה מספיק אחרי האישור הראשון"}.` },
      ],
    },
    proofIncrement: {
      iterationNumber,
      title: `סבב ${iterationNumber} מחדד את מסך הבית, הפעולה הראשונה, ומסך ההמשך`,
      statusLine: `סבב ${iterationNumber} מקדם עכשיו את המסך הראשון, הפעולה הראשונה, ומעבר ההמשך של ${artifactTitle}`,
      reason: `האישור האחרון פתח סבב המשך שמחזק את השימושיות של הזרימה עבור ${audience || "המשתמש הנכון"} בלי להחליף את התוצר שכבר אושר.`,
      highlights: [
        "המסך הראשון נהיה חד יותר סביב ההחלטה שצריך לקבל עכשיו",
        "הפעולה הראשונה מוצגת כצעד אחד שאפשר להבין בלי הדרכה",
        "המעבר למסך הבא נשאר חלק מהתוצר, במקום להישאר implicit",
      ],
    },
  };
}

function buildLandingContinuation({ artifactTitle, summary, audience, problem, approvalCount }) {
  const iterationNumber = approvalCount + 1;
  const missionTitle = `לקדם את ${artifactTitle}`;
  return {
    active: true,
    iterationNumber,
    projectType: "landing-page",
    artifactTitle,
    missionTitle,
    missionDescription: `סבב ${iterationNumber} מחזק עכשיו את ההבטחה, בלוק האמון, וה־CTA של דף הנחיתה שאושר.`,
    expectedProofLine: `התצוגה הבאה תראה ${artifactTitle} עם הבטחה חדה יותר מעל הקפל, אזור אמון ברור יותר, ופעולה שקל לבחור בה.`,
    upcomingItems: [
      "לחדד את ההבטחה הראשית מעל הקפל",
      "לחזק את בלוק האמון שמצדיק את ההחלטה",
      "לקבע CTA אחד ברור שלא מתפצל בין אפשרויות",
    ],
    execution: {
      missionTitle,
      detail: summary || "הסבב החדש מחזק את מבנה ההמרה של דף הנחיתה בלי לשנות את סוג התוצר.",
      statusItems: [
        { label: "מחדדים את ההבטחה הראשית מעל הקפל", status: "active" },
        { label: "ממקמים מחדש את בלוק האמון הקריטי", status: "active" },
        { label: "מקבעים CTA אחד ברור לשלב הבא", status: "pending" },
        { label: "מכינים תצוגה שמראה את השיפור בהיררכיה ובהמרה", status: "pending" },
      ],
      liveItems: [
        "מנסח מחדש את ההבטחה הראשית כדי שתהיה מיידית יותר",
        "מחזק את ההוכחה המרכזית שתומכת בהחלטה",
        "מבטל פיצול בין קריאות לפעולה ושומר CTA אחד",
        "מכין תצוגה שמראה מה השתפר מאז האישור",
      ],
      logItems: [
        { time: "עכשיו", message: `סבב ${iterationNumber} מחזק את מסלול ההמרה של ${artifactTitle}.` },
        { time: "עכשיו", message: `התצוגה הבאה תתמקד בהבטחה, באמון, ובפעולה המרכזית של ${artifactTitle}.` },
        { time: "עכשיו", message: `החסם שנפתר עכשיו: ${problem || "דף הנחיתה עדיין לא חד מספיק אחרי הסבב הראשון"}.` },
      ],
    },
    proofIncrement: {
      iterationNumber,
      title: `סבב ${iterationNumber} מחדד את ההבטחה, בלוק האמון וה־CTA`,
      statusLine: `סבב ${iterationNumber} מקדם עכשיו את ההבטחה הראשית, בלוק האמון וה־CTA של ${artifactTitle}`,
      reason: `האישור האחרון פתח סבב המשך שמחזק את ההמרה של הדף עבור ${audience || "הקהל הנכון"} בלי לסטות מסוג התוצר.`,
      highlights: [
        "ההבטחה מעל הקפל נוסחה מחדש כך שתהיה ברורה יותר בלחיצה הראשונה",
        "בלוק האמון נהיה חלק גלוי יותר מהחלטת ההמשך",
        "ה־CTA נשאר יחיד וברור במקום להתפצל בין כמה כיוונים",
      ],
    },
  };
}

function buildInternalToolContinuation({ artifactTitle, summary, approvalCount }) {
  const iterationNumber = approvalCount + 1;
  const missionTitle = `לקדם את ${artifactTitle}`;
  return {
    active: true,
    iterationNumber,
    projectType: "internal-tool",
    artifactTitle,
    missionTitle,
    missionDescription: `סבב ${iterationNumber} מחזק עכשיו את ה־ownership, ה־SLA, והפעולה הבאה של סביבת העבודה שאושרה.`,
    expectedProofLine: `התצוגה הבאה תראה ${artifactTitle} עם בעלות חדה יותר, SLA ברור יותר, ופעולה הבאה שניתנת לביצוע מיד.`,
    upcomingItems: [
      "לחדד מי הבעלים של כל בקשה בתור",
      "לקבע SLA גלוי שמאפשר להבין דחיפות",
      "להבליט פעולה אחת ברורה שאפשר לבצע מיד מה־workspace",
    ],
    execution: {
      missionTitle,
      detail: summary || "הסבב החדש מחזק את מרחב העבודה הפנימי בלי לאבד את התור שכבר אושר.",
      statusItems: [
        { label: "מגדירים בעלות גלויה על כל בקשה", status: "done" },
        { label: "מחדדים את ה־SLA כך שיראו מה דורש טיפול היום", status: "active" },
        { label: "מקבעים פעולה הבאה אחת שאפשר לבצע מיד", status: "active" },
        { label: "מכינים תצוגה שמראה את שדרוג ה־workspace", status: "pending" },
      ],
      liveItems: [
        "מגדיר בעלות גלויה על כל בקשה בתור",
        "מארגן מחדש את ה־SLA כדי שהדחיפות תהיה ברורה",
        "מבליט פעולה אחת שאפשר לבצע מיד מה־workspace",
        "מכין תצוגה שמראה את ההתקדמות מאז האישור",
      ],
      logItems: [
        { time: "עכשיו", message: `סבב ${iterationNumber} מקדם את ${artifactTitle} מעבר לסקיצה הראשונית.` },
        { time: "עכשיו", message: "ה־workspace הבא יראה בעלות, SLA ופעולה הבאה באופן חד יותר." },
        { time: "עכשיו", message: "מה ננעל עכשיו: הפעולה הראשונה שכל נציג אמור לראות." },
      ],
    },
    proofIncrement: {
      iterationNumber,
      title: `סבב ${iterationNumber} מחדד ownership, SLA, ופעולה הבאה`,
      statusLine: `סבב ${iterationNumber} מקדם עכשיו ownership, SLA, והפעולה הבאה של ${artifactTitle}`,
      reason: "האישור האחרון פתח סבב שמחזק את ה־workspace כך שהוא יוביל לצעד הבא בלי לדרוש הסבר חיצוני.",
      highlights: [
        "הבעלות על כל בקשה נשארת גלויה יותר על גבי התור",
        "ה־SLA נהיה חלק ברור מההחלטה מה דחוף עכשיו",
        "הפעולה הבאה נהיית חלק נראה מה־workspace עצמו",
      ],
    },
  };
}

function buildCommerceOpsContinuation({ artifactTitle, summary, approvalCount }) {
  const iterationNumber = approvalCount + 1;
  const missionTitle = `לקדם את ${artifactTitle}`;
  return {
    active: true,
    iterationNumber,
    projectType: "commerce-ops",
    artifactTitle,
    missionTitle,
    missionDescription: `סבב ${iterationNumber} מחזק עכשיו את תור ההזמנות, מצב הקטלוג והפעולה התפעולית הבאה של סביבת המסחר שאושרה.`,
    expectedProofLine: `התצוגה הבאה תראה ${artifactTitle} עם תיעדוף הזמנות חד יותר, מצב קטלוג ברור יותר, ופעולה תפעולית אחת שאפשר לבצע מיד.`,
    upcomingItems: [
      "לחדד איזו הזמנה דורשת טיפול ראשון",
      "לקבע מצב קטלוג ומלאי שמאפשר להבין איפה החיכוך",
      "להבליט פעולה תפעולית אחת שמקדמת את המסחר עכשיו",
    ],
    execution: {
      missionTitle,
      detail: summary || "הסבב החדש מחזק את מרחב המסחר והתפעול בלי לאבד את התור שכבר אושר.",
      statusItems: [
        { label: "מגדירים סדר עדיפות להזמנות", status: "done" },
        { label: "מחדדים את מצב הקטלוג והמלאי", status: "active" },
        { label: "מקבעים פעולה תפעולית אחת שאפשר לבצע מיד", status: "active" },
        { label: "מכינים תצוגה שמראה את שדרוג מרחב המסחר", status: "pending" },
      ],
      liveItems: [
        "מארגן מחדש את תור ההזמנות לפי הדחיפות האמיתית",
        "מחדד את מצב הקטלוג כך שיהיה ברור מה דורש טיפול",
        "מבליט פעולה תפעולית אחת שהצוות יכול לבצע מיד",
        "מכין תצוגה שמראה את ההתקדמות מאז האישור",
      ],
      logItems: [
        { time: "עכשיו", message: `סבב ${iterationNumber} מקדם את ${artifactTitle} מעבר לסקיצה הראשונית.` },
        { time: "עכשיו", message: "מרחב המסחר הבא יראה הזמנות, קטלוג ופעולה תפעולית באופן חד יותר." },
        { time: "עכשיו", message: "מה ננעל עכשיו: הפעולה הראשונה שהצוות צריך לבצע כדי לקדם את המסחר." },
      ],
    },
    proofIncrement: {
      iterationNumber,
      title: `סבב ${iterationNumber} מחדד תיעדוף הזמנות, קטלוג והפעולה התפעולית הבאה`,
      statusLine: `סבב ${iterationNumber} מקדם עכשיו תיעדוף הזמנות, קטלוג והפעולה התפעולית הבאה של ${artifactTitle}`,
      reason: "האישור האחרון פתח סבב שמחזק את מרחב המסחר כך שהוא יוביל לצעד הבא בלי להישאר dashboard כללי.",
      highlights: [
        "תור ההזמנות נהיה חלק חד יותר מההחלטה מה דחוף עכשיו",
        "מצב הקטלוג והמלאי נהיה גלוי יותר כדי להבין איפה נתקעים",
        "הפעולה התפעולית הבאה נהיית חלק נראה מהמרחב עצמו",
      ],
    },
  };
}

function buildFollowupContinuation({ artifactTitle, summary, approvalCount }) {
  const iterationNumber = approvalCount + 1;
  const missionTitle = `לקדם את ${artifactTitle}`;
  return {
    active: true,
    iterationNumber,
    projectType: "small-saas",
    artifactTitle,
    missionTitle,
    missionDescription: `סבב ${iterationNumber} מחזק עכשיו את לוח המעקב, הפעולה הבאה, והמסר המוכן לשליחה של ${artifactTitle}.`,
    expectedProofLine: `התצוגה הבאה תראה ${artifactTitle} עם פעולה הבאה ברורה יותר, עדיפות חדה יותר, והודעה מוכנה מדויקת יותר.`,
    upcomingItems: [
      "לחדד איזה לקוח דורש follow-up עכשיו",
      "לקבע פעולה הבאה אחת מעל שאר ההמלצות",
      "לשפר את ההודעה המוכנה כך שתהיה שליחה מיידית",
    ],
    execution: {
      missionTitle,
      detail: summary || "הסבב החדש מחזק את לוח המעקב כדי שההחלטה מה לעשות עכשיו תהיה ברורה יותר.",
      statusItems: [
        { label: "מחדדים את הלקוח בעדיפות הגבוהה ביותר", status: "active" },
        { label: "מקבעים פעולה הבאה אחת בראש הלוח", status: "active" },
        { label: "מלטשים את המסר המוכן לשליחה", status: "pending" },
        { label: "מכינים תצוגה שמראה את שיפור ההחלטה", status: "pending" },
      ],
      liveItems: [
        "מגדיר מחדש את הלקוח שדורש follow-up עכשיו",
        "ממקם פעולה אחת ברורה מעל כל שאר ההמלצות",
        "מעדכן את נוסח ההודעה כך שתהיה מוכנה לשליחה",
        "מכין תצוגה שמראה את ההתקדמות של הסבב החדש",
      ],
      logItems: [
        { time: "עכשיו", message: `סבב ${iterationNumber} מחזק את לוח המעקב של ${artifactTitle}.` },
        { time: "עכשיו", message: "המערכת מקבעת פעולה אחת ברורה ללקוח הבא." },
        { time: "עכשיו", message: "ההוכחה הבאה תראה איך הפעולה והמסר השתפרו מאז האישור." },
      ],
    },
    proofIncrement: {
      iterationNumber,
      title: `סבב ${iterationNumber} מחדד את הפעולה הבאה והמסר המוכן לשליחה`,
      statusLine: `סבב ${iterationNumber} מקדם עכשיו את הפעולה הבאה, סדר העדיפויות, והמסר המוכן של ${artifactTitle}`,
      reason: "האישור האחרון פתח סבב שמחזק את הפעולה שהצוות יכול לבצע עכשיו, לא רק את הדאשבורד הראשוני.",
      highlights: [
        "הלקוח הבא לפעולה הוגדר באופן חד יותר",
        "הפעולה הבאה נהיית חלק נראה יותר מהלוח",
        "המסר המוכן לשליחה נהיה מדויק יותר לשלב ההמשך",
      ],
    },
  };
}

export function buildRepeatedLoopContinuation({ projectId, project, approvalCount = 0 } = {}) {
  const safeProject = normalizeObject(project);
  const expectation = resolveArtifactExpectation(safeProject);
  const generationIntent = resolveGenerationIntent(safeProject);
  const continuationGate = resolveContinuationGate(safeProject);
  const artifactTitle = normalizeString(expectation.title, normalizeString(safeProject.name, "התוצר שאושר"));
  const summary = normalizeString(expectation.summary, normalizeString(generationIntent.generationGoal, ""));
  const audience = normalizeString(expectation.audience, "");
  const problem = normalizeString(expectation.problem, "");
  const solution = normalizeString(expectation.solution, "");
  const projectType = normalizeString(expectation.projectType, "");

  const base = {
    continuationId: `repeated-loop:${projectId}:${approvalCount + 1}`,
    createdAt: new Date().toISOString(),
  };

  if (normalizeString(continuationGate.gateType) === "supporting-material") {
    return {
      ...base,
      ...buildClarificationContinuation({
        artifactTitle,
        projectType,
        approvalCount,
        continuationGate,
      }),
    };
  }

  if (projectType === "landing-page") {
    return {
      ...base,
      ...buildLandingContinuation({ artifactTitle, summary, audience, problem, approvalCount }),
    };
  }

  if (projectType === "internal-tool") {
    return {
      ...base,
      ...buildInternalToolContinuation({ artifactTitle, summary, approvalCount }),
    };
  }

  if (projectType === "commerce-ops") {
    return {
      ...base,
      ...buildCommerceOpsContinuation({ artifactTitle, summary, approvalCount }),
    };
  }

  if (projectType === "mobile-app") {
    return {
      ...base,
      ...buildMobileContinuation({ artifactTitle, summary, audience, problem, solution, approvalCount }),
    };
  }

  return {
    ...base,
    ...buildFollowupContinuation({ artifactTitle, summary, approvalCount }),
  };
}
