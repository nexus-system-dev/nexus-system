function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function uniqueItems(items = []) {
  return [...new Set(normalizeArray(items).map((value) => String(value).trim()).filter(Boolean))];
}

function normalizeQuestionPath(path = []) {
  return normalizeArray(path)
    .map((value) => normalizeString(value))
    .filter(Boolean);
}

function hasGenericBusinessPhrase(value = "") {
  return /^(?:a |an |the )?(?:business|company|system|platform|product|app|website)$/i.test(value)
    || /^(?:small )?business(?:es)?$/i.test(value)
    || /^(?:עסק|עסקים|חברה|מערכת|מוצר|אפליקציה|אתר)$/u.test(value);
}

function hasGenericClientOwnerPhrase(value = "") {
  return /^(?:my )?client(?:s)?$/i.test(value)
    || /^(?:the )?client(?:s)?$/i.test(value)
    || /^(?:ה)?לקוח(?:ות)?(?:\s+שלי)?$/u.test(value)
    || /^client(?:s)? שלי$/iu.test(value);
}

function hasWeakProblemLength(value = "") {
  const words = normalizeString(value).split(/\s+/).filter(Boolean);
  return words.length < 4;
}

function scoreCoreIdeaCandidate(value = "", domain = "generic") {
  const normalized = normalizeString(value);
  if (!normalized) {
    return -1;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  let score = words.length;
  if (hasGenericBusinessPhrase(normalized.toLowerCase())) {
    score -= 6;
  }
  if (domain === "delivery-logistics") {
    const deliverySignals = (normalized.match(/scan|scanner|scanning|map|address|addresses|route|routes|delivery|deliveries|dispatch|courier|box|boxes|package|packages|לסרוק|סריקה|מפה|כתובת|כתובות|מסלול|מסלולים|משלוח|משלוחים|שליח|שליחים|קרטון|קרטונים|חבילה|חבילות/giu) ?? []).length;
    score += deliverySignals * 3;
  }
  if (/אני רוצה|אני בונה|אם זה היה קיים|מה שזה יעשה|זה אמור/u.test(normalized)) {
    score += 2;
  }
  return score;
}

export function isGenericAudienceAnswer(value = "") {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return false;
  }

  return hasGenericBusinessPhrase(normalized)
    || hasGenericClientOwnerPhrase(normalized)
    || /for (a |the )?business/i.test(normalized)
    || /(?:ל|עבור)?עסקים$/u.test(normalized)
    || /(?:ל|עבור)עסק$/u.test(normalized)
    || /(?:ל|עבור)חברה$/u.test(normalized)
    || /for customers$/i.test(normalized)
    || /^customers$/i.test(normalized);
}

function trimAudienceContinuation(value = "") {
  return normalizeString(value)
    .replace(/[.!?]\s*(?:קודם|אחר כך|ואז|ואחר כך|כדי|כי)(?:\s|$)[\s\S]*$/u, "")
    .replace(/,\s*(?:קודם|אחר כך|ואז|ואחר כך|כדי|כי)(?:\s|$)[\s\S]*$/u, "")
    .replace(/\s+(?:קודם|אחר כך|ואז|ואחר כך)(?:\s|$)[\s\S]*$/u, "")
    .trim();
}

export function resolveAudienceFocusLabel(value = "") {
  const normalized = normalizeString(value);
  if (!normalized) {
    return "";
  }

  const withoutContinuation = trimAudienceContinuation(normalized);
  if (withoutContinuation) {
    return withoutContinuation.replace(/[.!?]+$/u, "").trim();
  }

  const firstSentence = normalized
    .split(/[.!?]/u)
    .map((part) => part.trim())
    .find(Boolean);
  return (firstSentence || normalized).replace(/[.!?]+$/u, "").trim();
}

export function isGenericProblemAnswer(value = "") {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return false;
  }

  return /need(s)? (a )?(better )?(system|platform|app|tool)/i.test(normalized)
    || /want(s)? (a )?(better )?(system|platform|app|tool)/i.test(normalized)
    || /צריך(?:ים)? (מערכת|כלי|פתרון)/u.test(normalized)
    || /לעבוד (יותר )?(מסודר|טוב)/u.test(normalized)
    || /לנהל (יותר )?(טוב|מסודר)/u.test(normalized)
    || hasWeakProblemLength(normalized);
}

function resolveLearningStrategyLabel(strategy = "clarify-before-build") {
  if (strategy === "repair-before-expand") {
    return "הלמידה עוצרת תשובות חלשות ומכריחה לחדד לפני שממשיכים";
  }
  if (strategy === "stabilize-before-build") {
    return "הלמידה מחזיקה את ה־onboarding על בסיס יציב לפני build";
  }
  return "הלמידה בודקת שהשיחה חדה מספיק לפני שעוברים לשלב הבא";
}

function resolveLearningReason({
  clarificationMode = null,
  requiresLandingSolution = false,
  projectType = "unknown",
  learningContext = null,
} = {}) {
  const context = normalizeObject(learningContext);
  if (clarificationMode === "generic-audience") {
    return "התשובה עדיין כללית מדי. אני צריך להבין מי בדיוק המשתמש ומה קורה אצלו ביום-יום כדי לא לפספס את המוצר.";
  }
  if (clarificationMode === "generic-problem") {
    return "תיאור הבעיה עדיין כללי מדי. אני צריך את הרגע שבו זה נשבר באמת כדי להבין מה בונים.";
  }
  if (requiresLandingSolution && projectType === "landing-page") {
    return context.signalSource === "stored-learning"
      ? "בדף נחיתה אי אפשר לעצור רק בקהל ובכאב; צריך לחדד גם מה יגרום לו באמת לעצור ולהשאיר פרטים."
      : "בדף נחיתה צריך לחדד גם מה גורם למשתמש לעצור ולהשאיר פרטים, לא רק למי פונים.";
  }
  return context.signalSource === "stored-learning"
    ? "אני עדיין נשאר על זה, כי יש כאן משהו שחשוב לי לחדד לפני שממשיכים."
    : "אני עוד לא סוגר את זה, כדי לא להניח הנחה מוקדמת מדי.";
}

const PRODUCT_CONVERSATION_FAMILY_PACKS = {
  "commerce-storefront": {
    mode: "builder-momentum",
    inferredDefaults: [
      "קטלוג מוצרים",
      "עגלת קניות",
      "סליקה",
      "מלאי בסיסי",
      "משלוחים",
      "אזור ניהול בסיסי",
    ],
    audienceAmbiguities: [
      "האם ה־v1 מתמקד קודם בחוויית הקנייה של הלקוח או בצד התפעולי של בעל העסק",
      "האם אתה רוצה חנות פשוטה יחסית או חוויית בחירה חכמה יותר שעוזרת לבחור מכשיר נכון",
    ],
    problemAmbiguities: [
      "איפה הכאב האמיתי שמצדיק לבנות את זה עכשיו: בחירה וקנייה, או תפעול של מלאי, מחירים והזמנות",
      "מה נשבר היום מעבר לבסיס שכל חנות אונליין כבר אמורה לדעת לעשות",
    ],
    solutionAmbiguities: [
      "האם ה־v1 הוא חנות שמוכרת מהר, או חוויה חכמה יותר שמעלה ביטחון בקנייה ובהשוואת מכשירים",
      "מה הדיפרנציאציה הראשונה שאתה רוצה להכניס מעבר לבסיס המסחרי הסטנדרטי",
    ],
    buildDirectionAmbiguities: [
      "האם הקנייה הראשונית אמורה להיות כאורח או שרוצים להכריח חשבון כבר מההתחלה",
      "איזה חלק חכם או תפעולי חייב להיות ברור מיד במסך הראשון",
    ],
    lateAmbiguities: [
      "איזו מורכבות תפעולית נשארה פתוחה: סנכרון מלאי, ספקים, סניפים או fulfilment",
      "איפה אתה רוצה שהחנות תהיה חריגה מהבייסיק של storefront רגיל",
    ],
  },
  marketplace: {
    mode: "builder-momentum",
    inferredDefaults: [
      "פרופילים לשני הצדדים",
      "חיפוש וסינון בסיסיים",
      "התאמה או בקשת פנייה",
      "אמון בסיסי דרך פרופיל ותוכן",
      "flow ראשון לסגירת עניין",
    ],
    audienceAmbiguities: [
      "מי שני הצדדים כאן באמת, ומי מהם חייב להרגיש ערך ראשון כדי שהזירה תתחיל לזוז",
      "מי הצד הראשון שאתה חייב להביא כדי שהמוצר לא ירגיש ריק",
    ],
    problemAmbiguities: [
      "מה נשבר היום בין שני הצדדים: מציאת התאמה, יצירת אמון, תמחור, או סגירת עסקה",
      "איפה השוק הזה קורס היום גם כשיש ביקוש וגם כשיש היצע",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לגרום לאנשים למצוא התאמה טובה, או קודם לאפשר פנייה וסגירה חלקה",
      "מה חייב לעבוד ראשון כדי שהשוק הזה ירגיש חי ולא כמו לוח מודעות ריק",
    ],
    buildDirectionAmbiguities: [
      "האם ה-flow הראשון הוא חיפוש, בקשת הצעת מחיר, קביעת שיחה, או תשלום חלקי",
      "איזו נקודת אמון חייבת להיות גלויה מיד כדי ששני הצדדים יסכימו להתקדם",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: תמחור, דירוגים, dispute, או תשלום בתוך המערכת",
      "איפה אתה רוצה שה-zירה תהיה יותר חכמה ממאגר ספקים רגיל",
    ],
  },
  "booking-scheduling": {
    mode: "builder-momentum",
    inferredDefaults: ["בחירת שירות", "יומן זמינות", "בחירת זמן", "אישור הזמנה", "תזכורות בסיסיות"],
    audienceAmbiguities: [
      "מי מזמין בפועל, ומי חי בתוך הזמינות או מאשר את ההזמנה לאורך היום",
      "האם ה-v1 צריך לשרת קודם את הצד שקובע תור או את הצד שמנהל יומן וזמינות",
    ],
    problemAmbiguities: [
      "מה נשבר היום בתהליך ההזמנה: זמינות, אישור, ביטולים, או תיאום ידני",
      "איפה אנשים נתקעים או נושרים לפני שהתור באמת נסגר",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לסגור זמינות וזמן, או גם אישור, תזכורות ותשלום באותו flow",
      "מה חייב לעבוד ראשון כדי שאנשים יפסיקו לנהל תורים ידנית",
    ],
    buildDirectionAmbiguities: [
      "האם ההזמנה נסגרת מיד, או שיש שלב אישור לפני שהיא נהיית סופית",
      "האם קודם חייבים תזכורות וביטולים מסודרים, או שזה יכול לחכות לשלב הבא",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: כמה יומנים, אילוצי זמינות, ביטולים, או תשלום",
      "איפה אתה רוצה שהחוויה תהיה חכמה יותר מיומן הזמנות רגיל",
    ],
  },
  "crm-followup": {
    mode: "builder-momentum",
    inferredDefaults: ["לידים או לקוחות", "בעלות", "צעד הבא", "תזכורות", "timeline בסיסי"],
    audienceAmbiguities: [
      "מי מחזיק את הליד או הלקוח בפועל, ומי אחראי שלא ייפול follow-up בין הכיסאות",
      "האם ה-v1 משרת קודם בעל עסק, איש מכירות, או צוות שירות שחי בתוך המעקב",
    ],
    problemAmbiguities: [
      "איפה המעקב נשבר היום: בעלות לא ברורה, תזכורות שלא קורות, או צעד הבא שלא נסגר",
      "איזה רגע יומי גורם לזה שליד או לקוח פשוט נופל החוצה מהתהליך",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לסגור בעלות וצעד הבא, או שגם stages, אוטומציות ודו\"חות כבר בפנים",
      "מה חייב לעבוד ראשון כדי שלא יפספסו ליד נוסף",
    ],
    buildDirectionAmbiguities: [
      "מה חייב להיות גלוי מיד במסך הראשון: הבעלים, הלקוח הבא, התזכורת הדחופה, או כל אלה יחד",
      "האם קודם רוצים משטח עבודה ברור, או מנוע follow-up חצי אוטומטי שכבר דוחף פעולה",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: שלבים, אוטומציות, התראות, או חידושים",
      "איפה אתה רוצה שהמערכת תהיה חכמה יותר מ-CRM בסיסי עם תזכורות",
    ],
  },
  "delivery-logistics": {
    mode: "builder-momentum",
    inferredDefaults: ["קליטת כתובת", "מפה", "עצירות", "תיקון ידני", "מעקב בסיסי"],
    audienceAmbiguities: [
      "מי עובד עם זה בפועל: שליח, סדרן, מנהל מסלולים, או מוקד תפעולי",
      "האם ה-v1 משרת קודם את מי שנמצא בשטח או את מי שמסדר את המסלול מאחורה",
    ],
    problemAmbiguities: [
      "מה נשבר היום בין סריקה, זיהוי כתובת, הצגה על מפה, ותיקון ידני",
      "איפה הולך הזמן או נוצרות הטעויות בדרך לבניית המסלול",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לשים את כל הכתובות על מפה, או גם לעזור כבר בסדר מסלול ובהחלטה מה התחנה הבאה",
      "מה חייב לעבוד ראשון כדי לחסוך הקלדה ידנית וטעויות בשטח",
    ],
    buildDirectionAmbiguities: [
      "מה חייב להיות ברור מיד אחרי סריקה: שהכתובת נקלטה, איפה היא על המפה, או מה הצעד הבא במסלול",
      "האם קודם חייבים תיקון ידני נוח, או שהדגש הוא על רצף מהיר מסריקה למסלול",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: תיקוני כתובת, בניית route, קיבוץ עצירות, או עבודה של צוות מול שליח יחיד",
      "איפה אתה רוצה שהאפליקציה תהיה חכמה יותר ממפה עם נעצים בלבד",
    ],
  },
  "services-content": {
    mode: "builder-momentum",
    inferredDefaults: ["הצעה", "עמוד מכירה או ליד", "אמון", "תהליך רכישה או פנייה", "מסלול המשך בסיסי"],
    audienceAmbiguities: [
      "מי האדם שבאמת קונה את הליווי או התוכן, ומי רק מנהל את המכירה מאחור",
      "האם ה-v1 צריך קודם לשרת פנייה חמה, רכישה ישירה, או תהליך התאמה לפני סגירה",
    ],
    problemAmbiguities: [
      "מה נשבר היום במכירה: אמון, הצעה לא ברורה, איסוף פרטים, או המעבר מפנייה לרכישה",
      "איפה אנשים מתעניינים אבל לא מגיעים לצעד הבא",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם למכור הצעה אחת טוב, או כבר לנהל כמה מסלולים / כמה סוגי תוכן",
      "מה חייב לעבוד ראשון כדי להפוך עניין לפנייה או תשלום אמיתי",
    ],
    buildDirectionAmbiguities: [
      "האם החוויה הראשונה אמורה להוביל לטופס, לשיחת התאמה, או לרכישה ישירה",
      "איזה חלק מהמכירה חייב להיות ברור מיד: ההבטחה, המחיר, מה מקבלים, או שלב ההתאמה",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: כמה הצעות, intake אחרי רכישה, או שילוב בין תוכן לפגישות",
      "איפה אתה רוצה שהחוויה תהיה עמוקה יותר מעמוד מכירה סטנדרטי",
    ],
  },
  "admin-dashboard": {
    mode: "builder-momentum",
    inferredDefaults: ["מדדים", "חריגות", "מצב נוכחי", "drill-down בסיסי", "תמונה תפעולית"],
    audienceAmbiguities: [
      "מי פותח את הדשבורד הזה ביום-יום, ואיזו החלטה הוא צריך לקחת ממנו מהר",
      "האם ה-v1 צריך לשרת קודם מנהל תפעול, מנהל אזור, או בעלים שמחפש תמונה עליונה",
    ],
    problemAmbiguities: [
      "מה נשבר היום בלי הדשבורד: מידע מפוזר, חריגות שמגלים מאוחר, או חוסר בהירות מה דחוף עכשיו",
      "איזו החלטה תפעולית מתקבלת היום מאוחר מדי או בלי מספיק הקשר",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לזהות חריגות ולהפנות מבט, או גם לאפשר פעולה ישירה מתוך הדשבורד",
      "מה חייב לעבוד ראשון כדי שהמסך הזה יהיה כלי קבלת החלטות ולא רק מסך צפייה",
    ],
    buildDirectionAmbiguities: [
      "אילו מדדים וחריגות חייבים להיות גלויים מיד בלי לגלול או לחפש",
      "האם המשתמש אמור רק להבין מה קרה, או גם לשייך טיפול ולהגיב מתוך הדשבורד",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: drill-down, actionability, alerts, או כמה שכבות ניהול",
      "איפה אתה רוצה שהמסך יהיה יותר חד מדשבורד KPI רגיל",
    ],
  },
  "internal-tool": {
    mode: "builder-momentum",
    inferredDefaults: ["תור עבודה", "בעלות", "סטטוס", "עדיפות או SLA", "פעולה הבאה"],
    audienceAmbiguities: [
      "איזה צוות באמת חי בתוך הכלי, ומי הבעלים של התור או התיק ביום רגיל",
      "האם ה-v1 צריך קודם לשרת נציגים בשטח העבודה, או מנהלים שמחלקים עומסים ומחליטים עדיפויות",
    ],
    problemAmbiguities: [
      "מה נשבר היום בתור העבודה: בעלות לא ברורה, עומסים, SLA, או מעבר מידע בין נציגים",
      "איזה רגע במשמרת גורם לזה שהעבודה נתקעת או נופלת בין אנשים",
    ],
    solutionAmbiguities: [
      "האם ה-v1 צריך קודם לסגור תור, בעלות ופעולה הבאה, או גם הרשאות, escalation ודו\"חות",
      "מה חייב לעבוד ראשון כדי שהצוות יפסיק לאבד הקשר בין פריטים",
    ],
    buildDirectionAmbiguities: [
      "מה חייב להיות ברור מיד במסך הראשון: מי בעל התיק, מה דחוף, ומה הצעד הבא",
      "האם קודם רוצים משטח עבודה מהיר לנציג, או שכבת פיקוח למנהל משמרת",
    ],
    lateAmbiguities: [
      "איזו מורכבות נשארה פתוחה: חלוקת עומסים, SLA, הרשאות, או escalations",
      "איפה אתה רוצה שהכלי יהיה יותר חכם מתור עבודה בסיסי",
    ],
  },
  saas: {
    mode: "thinking",
    inferredDefaults: [],
  },
  generic: {
    mode: "thinking",
    inferredDefaults: [],
  },
};

export function resolveCanonicalOnboardingAnswers(answers = {}) {
  const normalizedAnswers = normalizeObject(answers);
  const coreIdea = normalizeString(normalizedAnswers["core-idea"]);
  const rawAudience = normalizeString(normalizedAnswers["target-audience"]);
  const refinedAudience = normalizeString(normalizedAnswers["audience-clarification"]);
  const rawProblem = normalizeString(normalizedAnswers["core-problem"]);
  const refinedProblem = normalizeString(normalizedAnswers["problem-clarification"]);

  return {
    coreIdea,
    rawAudience,
    refinedAudience,
    audience: resolveAudienceFocusLabel(refinedAudience || rawAudience),
    hasGenericAudience: isGenericAudienceAnswer(resolveAudienceFocusLabel(refinedAudience || rawAudience)),
    rawProblem,
    refinedProblem,
    problem: refinedProblem || rawProblem,
    hasGenericProblem: isGenericProblemAnswer(refinedProblem || rawProblem),
    solution: normalizeString(normalizedAnswers["successful-solution"]),
    buildDirection: normalizeString(normalizedAnswers["build-direction"]),
    projectClassAnswer: normalizeString(normalizedAnswers["project-class"]),
  };
}

export function resolveStrongestCoreIdea(candidates = [], { domain = "generic" } = {}) {
  const normalizedCandidates = uniqueItems(candidates);
  if (!normalizedCandidates.length) {
    return "";
  }

  return normalizedCandidates
    .map((candidate) => ({
      candidate,
      score: scoreCoreIdeaCandidate(candidate, domain),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return right.candidate.length - left.candidate.length;
    })[0]?.candidate ?? "";
}

function resolveProductConversationFamilyKey({ domain = "generic", projectType = "unknown" } = {}) {
  const normalizedDomain = normalizeString(domain, "generic");
  if (normalizedDomain !== "generic" && PRODUCT_CONVERSATION_FAMILY_PACKS[normalizedDomain]) {
    return normalizedDomain;
  }
  const normalizedProjectType = normalizeString(projectType, "unknown");
  if (PRODUCT_CONVERSATION_FAMILY_PACKS[normalizedProjectType]) {
    return normalizedProjectType;
  }
  return "generic";
}

export function resolveProductConversationFamilyPack({ domain = "generic", projectType = "unknown" } = {}) {
  return PRODUCT_CONVERSATION_FAMILY_PACKS[
    resolveProductConversationFamilyKey({ domain, projectType })
  ] ?? PRODUCT_CONVERSATION_FAMILY_PACKS.generic;
}

export function resolveConversationBehaviorMode({
  classification = {},
  canonicalAnswers = {},
} = {}) {
  const normalizedClassification = normalizeObject(classification);
  const domain = normalizeString(normalizedClassification.domain, "generic");
  const projectType = normalizeString(normalizedClassification.projectType, "unknown");
  const familyKey = resolveProductConversationFamilyKey({ domain, projectType });
  const pack = resolveProductConversationFamilyPack({ domain, projectType });
  const coreIdea = normalizeString(canonicalAnswers.coreIdea);
  const hasHighFamilyConfidence = Boolean(coreIdea) && familyKey !== "generic";
  const incompatibleWithProjectType = (
    (domain === "crm-followup" && projectType === "internal-tool")
    || (domain === "crm-followup" && projectType === "landing-page")
  );
  if (pack.mode === "builder-momentum" && hasHighFamilyConfidence && !incompatibleWithProjectType) {
    return "builder-momentum";
  }
  return "thinking";
}

export function resolveSafeInferredDefaults({
  classification = {},
  canonicalAnswers = {},
} = {}) {
  const normalizedClassification = normalizeObject(classification);
  const mode = resolveConversationBehaviorMode({ classification, canonicalAnswers });
  if (mode !== "builder-momentum") {
    return [];
  }
  return uniqueItems(
    resolveProductConversationFamilyPack({
      domain: normalizedClassification.domain,
      projectType: normalizedClassification.projectType,
    }).inferredDefaults,
  );
}

export function buildInferredStructureLine({
  classification = {},
  canonicalAnswers = {},
} = {}) {
  const inferredDefaults = resolveSafeInferredDefaults({ classification, canonicalAnswers });
  if (!inferredDefaults.length) {
    return "";
  }
  return `מבנה בסיסי שאני כבר מניח ל-v1: ${inferredDefaults.join(", ")}`;
}

export function buildMeaningfulMissingItems({
  classification = {},
  canonicalAnswers = {},
} = {}) {
  const normalizedClassification = normalizeObject(classification);
  const domain = normalizeString(normalizedClassification.domain, "generic");
  const pack = resolveProductConversationFamilyPack({
    domain,
    projectType: normalizeString(normalizedClassification.projectType, "unknown"),
  });
  const mode = resolveConversationBehaviorMode({ classification, canonicalAnswers });
  if (mode !== "builder-momentum") {
    return [];
  }

  if (!canonicalAnswers.audience || canonicalAnswers.hasGenericAudience) {
    return uniqueItems(pack.audienceAmbiguities);
  }
  if (!canonicalAnswers.problem || canonicalAnswers.hasGenericProblem) {
    return uniqueItems(pack.problemAmbiguities);
  }
  if (!canonicalAnswers.solution) {
    return uniqueItems(pack.solutionAmbiguities);
  }
  if (!canonicalAnswers.buildDirection) {
    return uniqueItems(pack.buildDirectionAmbiguities);
  }
  return uniqueItems(pack.lateAmbiguities);
}

export function createLearningGuidedOnboardingContext({
  learningDecisionImpact = null,
  generationIntent = null,
  projectTypeHint = "",
  visionText = "",
} = {}) {
  const learningImpact = normalizeObject(learningDecisionImpact);
  const intent = normalizeObject(generationIntent);
  const drivingSignals = uniqueItems([
    ...normalizeArray(learningImpact.drivingSignals),
    ...normalizeArray(intent.learnedSignals),
  ]);
  const signalSource = drivingSignals.length > 0 || learningImpact.impactId || intent.learningAware === true
    ? "stored-learning"
    : "system-patterns";
  const strategy = normalizeString(
    learningImpact.strategy,
    normalizeString(intent.learningStrategy, "clarify-before-build"),
  );
  const forceLandingSolution = (
    normalizeString(projectTypeHint) === "landing-page"
    || /landing page|landing-page|דף נחיתה/i.test(visionText)
  ) && (
    strategy === "repair-before-expand"
    || drivingSignals.some((signal) => /failure|attention|required|stalled|cta|value|trust/i.test(signal))
  );

  return {
    signalSource,
    strategy,
    strategyLabel: resolveLearningStrategyLabel(strategy),
    drivingSignals,
    forceLandingSolution,
  };
}

export function hasLearningGuidedSufficientUnderstanding({
  projectType = "unknown",
  audience = "",
  problem = "",
  solution = "",
  buildDirection = "",
  workflowDetail = "",
  domain = "generic",
  learningContext = null,
} = {}) {
  if (!audience || !problem) {
    return false;
  }

  const context = normalizeObject(learningContext);
  if (!buildDirection) {
    return false;
  }

  if (projectType === "landing-page" && context.forceLandingSolution !== true) {
    return true;
  }

  if (projectType === "landing-page" && context.forceLandingSolution === true) {
    return Boolean(solution && buildDirection);
  }

  if (
    [
      "delivery-logistics",
      "commerce-storefront",
      "marketplace",
      "booking-scheduling",
      "crm-followup",
      "services-content",
      "admin-dashboard",
    ].includes(domain)
    && !workflowDetail
  ) {
    return false;
  }

  return Boolean(solution);
}

export function resolveLearningGuidedOnboardingDecision({
  answers = {},
  classification = {},
  learningContext = null,
} = {}) {
  const normalizedClassification = normalizeObject(classification);
  const context = normalizeObject(learningContext);
  const canonicalAnswers = resolveCanonicalOnboardingAnswers(answers);
  const projectType = normalizeString(normalizedClassification.projectType, "unknown");
  const isAmbiguous = normalizedClassification.isAmbiguous === true;
  const domain = normalizeString(normalizedClassification.domain, "generic");
  const weakAudience = Boolean(canonicalAnswers.audience) && canonicalAnswers.hasGenericAudience === true;
  const weakProblem = Boolean(canonicalAnswers.problem) && canonicalAnswers.hasGenericProblem === true;
  const requiresLandingSolution = projectType === "landing-page" && context.forceLandingSolution === true;
  const workflowDetail = normalizeString(answers["workflow-detail"]);
  const conversationMode = resolveConversationBehaviorMode({
    classification: normalizedClassification,
    canonicalAnswers,
  });
  const inferredDefaults = resolveSafeInferredDefaults({
    classification: normalizedClassification,
    canonicalAnswers,
  });

  const questionPlan = ["core-idea"];
  if (canonicalAnswers.coreIdea) {
    questionPlan.push("target-audience");
  }
  if (weakAudience) {
    questionPlan.push("audience-clarification");
  }
  if (canonicalAnswers.audience && !weakAudience && isAmbiguous && !canonicalAnswers.projectClassAnswer && domain !== "commerce-storefront") {
    questionPlan.push("project-class");
  }
  if (canonicalAnswers.audience && !weakAudience) {
    questionPlan.push("core-problem");
  }
  if (canonicalAnswers.problem && weakProblem) {
    questionPlan.push("problem-clarification");
  }

  const needsSolutionQuestion = canonicalAnswers.audience
    && canonicalAnswers.problem
    && (
      projectType !== "landing-page"
      || requiresLandingSolution
    );
  if (needsSolutionQuestion) {
    questionPlan.push("successful-solution");
  }
  const needsBuildDirectionQuestion = canonicalAnswers.audience
    && canonicalAnswers.problem
    && (
      canonicalAnswers.solution
      || (projectType === "landing-page" && !requiresLandingSolution)
    );
  if (needsBuildDirectionQuestion) {
    questionPlan.push("build-direction");
  }

  let nextQuestionId = null;
  let clarificationMode = null;

  if (!canonicalAnswers.coreIdea) {
    nextQuestionId = "core-idea";
  } else if (!canonicalAnswers.rawAudience) {
    nextQuestionId = "target-audience";
  } else if (weakAudience) {
    nextQuestionId = "audience-clarification";
    clarificationMode = "generic-audience";
  } else if (canonicalAnswers.audience && isAmbiguous && !canonicalAnswers.projectClassAnswer && domain !== "commerce-storefront") {
    nextQuestionId = "project-class";
  } else if (!canonicalAnswers.rawProblem) {
    nextQuestionId = "core-problem";
  } else if (weakProblem) {
    nextQuestionId = "problem-clarification";
    clarificationMode = "generic-problem";
  } else if (!hasLearningGuidedSufficientUnderstanding({
    projectType,
    audience: canonicalAnswers.audience,
    problem: canonicalAnswers.problem,
    solution: canonicalAnswers.solution,
    buildDirection: canonicalAnswers.buildDirection,
    workflowDetail,
    domain,
    learningContext: context,
  })) {
    nextQuestionId = needsSolutionQuestion && !canonicalAnswers.solution
      ? "successful-solution"
      : "build-direction";
  }

  const learningStatus = context.signalSource === "stored-learning" ? "live" : "partial";
  const learningReason = resolveLearningReason({
    clarificationMode,
    requiresLandingSolution,
    projectType,
    learningContext: context,
  });

  return {
    canonicalAnswers,
    questionPlan: normalizeQuestionPath(questionPlan),
    nextQuestionId,
    clarificationMode,
    weakAudience,
    weakProblem,
    requiresLandingSolution,
    learningStatus,
    learningStrategy: normalizeString(context.strategy, "clarify-before-build"),
    learningStrategyLabel: normalizeString(context.strategyLabel, resolveLearningStrategyLabel()),
    learningReason,
    learningSignals: uniqueItems(context.drivingSignals),
    conversationMode,
    inferredDefaults,
    readinessLine: nextQuestionId === null
      ? "יש כבר מספיק בהירות כדי לעבור הלאה בלי לנחש למה התכוונת."
      : conversationMode === "builder-momentum"
        ? "יש כבר מספיק ודאות כדי להניח את הבסיס ולהיעצר רק על ההחלטה שבאמת משנה את המוצר."
      : clarificationMode
        ? "עוד מוקדם לסגור. חסר לי חידוד אחד משמעותי כדי לא לפספס את המוצר."
        : requiresLandingSolution && projectType === "landing-page"
          ? "עוד לא נכון לעצור. צריך לחדד מה בדיוק הדף צריך להבטיח ולהוכיח."
          : nextQuestionId === "build-direction"
            ? "השיחה נשארת פתוחה עד שיהיה ברור מה המשתמש חייב להבין או לעשות מיד כשהמוצר נפתח."
            : nextQuestionId === "core-idea"
              ? "אני מתחיל מהרעיון עצמו כדי לא לקפוץ מהר מדי למסכים או לפיצ'רים."
              : "השיחה נשארת פתוחה עד שנבין את הנקודה הכי חשובה שעוד חסרה.",
    handoffStrengthLine: requiresLandingSolution && projectType === "landing-page"
      ? "כבר ברור למי הדף מיועד, אבל צריך לחדד גם את ההבטחה, האמון והפעולה המרכזית."
      : conversationMode === "builder-momentum"
        ? "ההמשך כבר יישען על בסיס שאני מניח כסטנדרט, ואני אעצור רק איפה שיש fork מוצרי אמיתי."
      : nextQuestionId === "build-direction"
        ? "לפני שממשיכים, אני רוצה להבין מה חייב להיות ברור למשתמש כבר מהרגע הראשון."
        : clarificationMode
          ? "אני עדיין עוצר כאן, כי תשובה חדה יותר תשמור על ההמשך מדויק ולא כללי."
          : "ההמשך יישאר צמוד למה שנלמד בשיחה, בלי לחזור לתיאור כללי מדי.",
  };
}
