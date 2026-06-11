function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

const COMPARABLE_PRODUCT_PACKS = {
  "commerce-storefront": {
    familyLabel: "commerce-storefront",
    comparableProducts: ["Shopify", "Amazon", "KSP"],
    patterns: [
      {
        id: "guest-checkout",
        signals: ["אורח", "התחברות", "חשבון", "checkout", "קנייה"],
        observation: "בחנויות דומות סוגרים מוקדם אם הקנייה הראשונית היא כאורח או רק אחרי התחברות, כי זה משנה גם המרה וגם מורכבות מוצרית.",
        followUpQuestion: "אצלך ב-v1 הלקוח אמור לקנות כאורח או שחייבים לפתוח חשבון לפני הזמנה?",
      },
      {
        id: "checkout-scope",
        signals: ["סליקה", "הזמנה", "תשלום", "checkout"],
        observation: "עוד הכרעה שבדרך כלל עושים מוקדם היא אם v1 כבר כולל סליקה מלאה, או שקודם מספיק קטלוג ויצירת הזמנה מסודרת.",
        followUpQuestion: "מה נכון יותר אצלך בגרסה הראשונה: סליקה מלאה, או קודם קטלוג + יצירת הזמנה?",
      },
      {
        id: "ops-scope",
        signals: ["מלאי", "משלוחים", "וריאציות", "מחסן", "tracking", "מעקב"],
        observation: "בחנויות שעובדות טוב לא דוחים יותר מדי את שאלת המלאי, המשלוחים והווריאציות, כי אלה דברים שמעצבים את כל מבנה החנות והתפעול.",
        followUpQuestion: "מה מהשלושה חייב להיות אמיתי כבר ב-v1 אצלך: מלאי, משלוחים, או וריאציות מוצר?",
      },
    ],
  },
  marketplace: {
    familyLabel: "marketplace",
    comparableProducts: ["Upwork", "Fiverr", "Airbnb"],
    patterns: [
      {
        id: "seed-side",
        signals: ["צד", "ספק", "לקוח", "בעלי מקצוע", "היצע", "ביקוש"],
        observation: "ב-marketplace-ים דומים מכריעים מוקדם מי הצד שצריך להיכנס ראשון כדי שהמערכת לא תרגיש ריקה.",
        followUpQuestion: "אצלך מי הצד שחייב להגיע ראשון כדי שהמוצר יתחיל לעבוד באמת?",
      },
      {
        id: "trust-layer",
        signals: ["אמון", "ביקורות", "דירוג", "מחלוקת", "אישור"],
        observation: "עוד שכבה שחוזרת כמעט תמיד היא מנגנון אמון: דירוגים, אישורים, או כל דרך אחרת להוריד חיכוך בין הצדדים.",
        followUpQuestion: "מה אצלך צריך לבנות אמון כבר ב-v1: ביקורות, אימות, או בכלל משהו אחר?",
      },
    ],
  },
  "booking-scheduling": {
    familyLabel: "booking-scheduling",
    comparableProducts: ["Calendly", "Treatwell", "Zocdoc"],
    patterns: [
      {
        id: "approval-model",
        signals: ["אישור", "זמינות", "יומן", "תור"],
        observation: "במוצרי booking דומים אחת ההכרעות הראשונות היא אם האישור הוא אוטומטי מול זמינות חיה, או שיש אישור ידני מאחורי הקלעים.",
        followUpQuestion: "אצלך הזמנה אמורה להיסגר מיד לפי זמינות, או לחכות לאישור ידני?",
      },
      {
        id: "cancellation-reminders",
        signals: ["ביטול", "תזכורות", "no-show", "דחייה"],
        observation: "מוצרים טובים מהסוג הזה סוגרים מוקדם גם את מדיניות הביטולים והתזכורות, כי שם הרבה מהכאוס התפעולי נוצר.",
        followUpQuestion: "מה כואב יותר אצלך כרגע: ביטולים ברגע האחרון או חוסר תזכורות?",
      },
    ],
  },
  "crm-followup": {
    familyLabel: "crm-followup",
    comparableProducts: ["HubSpot", "Pipedrive", "Close"],
    patterns: [
      {
        id: "ownership-next-step",
        signals: ["ליד", "בעלות", "follow-up", "תזכורת", "צעד הבא"],
        observation: "במערכות follow-up דומות נועלים מוקדם מי הבעלים של כל ליד ואיך הצעד הבא מוצג בלי חיפוש, כי אחרת המעקב נשבר מהר מאוד.",
        followUpQuestion: "אצלך מה חייב להיות חד כבר במסך הראשון על כל ליד: הבעלים, הסטטוס, או הצעד הבא?",
      },
      {
        id: "automation-threshold",
        signals: ["אוטומציה", "pipeline", "שלב", "התראה"],
        observation: "עוד הבחנה שחוזרת שוב ושוב היא מה חייב להיות אוטומטי כבר ב-v1, לעומת מה עדיין יכול להישאר ידני בלי לשבור את ה-flow.",
        followUpQuestion: "איזו פעולה אצלך חייבת להפוך לאוטומטית כבר ב-v1 כדי שלא יפספסו עוד ליד?",
      },
    ],
  },
  "internal-tool": {
    familyLabel: "internal-tool",
    comparableProducts: ["Zendesk", "Jira Service Management", "Intercom Inbox"],
    patterns: [
      {
        id: "ownership-queue",
        signals: ["תור", "בעלות", "SLA", "נציג", "צוות"],
        observation: "בכלים פנימיים דומים הרבה מהערך נובע מכך שבעלות, תור ודחיפות ברורים מיד, אחרת הצוות עדיין עובד דרך כאוס.",
        followUpQuestion: "אצלך מה חייב להיות חד מיידית על כל פריט עבודה: מי הבעלים, מה הדחיפות, או מה ה-SLA?",
      },
    ],
  },
  saas: {
    familyLabel: "saas",
    comparableProducts: ["Notion", "Linear", "Monday"],
    patterns: [
      {
        id: "core-loop",
        signals: ["חוזר", "loop", "הרגל", "שימוש", "מנהלים", "צוות"],
        observation: "במוצרי SaaS טובים עוצרים מוקדם על ה-core loop, אחרת נבנה מוצר שיש בו הרבה יכולות אבל לא ברור למה חוזרים אליו שוב.",
        followUpQuestion: "מה הפעולה שחייבת לגרום למשתמש לחזור למוצר שוב ושוב אצלך?",
      },
      {
        id: "first-value",
        signals: ["ערך ראשון", "onboarding", "כניסה ראשונה", "מסך ראשון"],
        observation: "עוד שאלה מרכזית במוצרים דומים היא מה הערך הראשון שהמשתמש רואה כבר בשימוש הראשון, לפני שמעמיסים עוד יכולות.",
        followUpQuestion: "מה אצלך חייב להרגיש בעל ערך כבר בכניסה הראשונה כדי שהמוצר לא ירגיש כמו דמו?",
      },
    ],
  },
  "delivery-logistics": {
    familyLabel: "delivery-logistics",
    comparableProducts: ["Onfleet", "Circuit", "Route4Me"],
    patterns: [
      {
        id: "scan-to-map",
        signals: ["סריקה", "כתובת", "מפה", "נעץ", "OCR"],
        observation: "באפליקציות לוגיסטיקה דומות סוגרים מוקדם מה קורה מיד אחרי הסריקה: רק זיהוי והצבה על מפה, או גם החלטה תפעולית על המסלול.",
        followUpQuestion: "אצלך אחרי שהכתובת נסרקת, המטרה היא רק להניח נעץ על המפה או גם להשפיע על סדר המסלול?",
      },
      {
        id: "error-recovery",
        signals: ["שגוי", "תיקון", "ידני", "טעויות"],
        observation: "עוד נקודה שחוזרת תמיד היא מה קורה כשסריקה או כתובת לא מדויקות, כי שם חוויית השטח נופלת אם אין תיקון מהיר.",
        followUpQuestion: "מה צריך לקרות אצלך כשכתובת נסרקת לא נכון: תיקון ידני, הצעה חלופית, או הסלמה למוקד?",
      },
    ],
  },
  "services-content": {
    familyLabel: "services-content",
    comparableProducts: ["Kajabi", "Teachable", "Contra"],
    patterns: [
      {
        id: "lead-vs-buy",
        signals: ["פנייה", "רכישה", "שירות", "תוכן", "תוכנית"],
        observation: "במוצרי שירות/תוכן דומים עוצרים מוקדם על השאלה אם ה-v1 צריך לייצר פנייה איכותית או לאפשר רכישה ישירה בלי שיחת מכירה.",
        followUpQuestion: "אצלך בגרסה הראשונה המטרה היא פנייה איכותית או רכישה ישירה?",
      },
      {
        id: "offer-shape",
        signals: ["חבילה", "מסלול", "תוכנית", "פגישות"],
        observation: "עוד החלטה שחוזרת היא אם מוכרים הצעה אחת מאוד ברורה או כמה מסלולים, כי זה משנה גם את המסר וגם את flow המכירה.",
        followUpQuestion: "אצלך נכון יותר להתחיל מהצעה אחת חדה או מכמה מסלולים נפרדים?",
      },
    ],
  },
  "admin-dashboard": {
    familyLabel: "admin-dashboard",
    comparableProducts: ["Datadog", "Looker", "Grafana"],
    patterns: [
      {
        id: "decision-view",
        signals: ["חריגה", "מדדים", "החלטה", "dashboard", "דשבורד"],
        observation: "בדשבורדים דומים לא מספיק להראות נתונים; צריך להכריע מוקדם איזו החלטה המשתמש מקבל מתוך המסך הזה.",
        followUpQuestion: "אצלך איזו החלטה תפעולית אמורה לצאת מהדשבורד הזה כבר בדקה הראשונה?",
      },
      {
        id: "action-vs-observation",
        signals: ["לפעול", "drill-down", "התראה", "צפייה"],
        observation: "עוד דילמה שחוזרת היא אם זה מסך תצפית בלבד או שגם פועלים ממנו, כי זה משנה את כל המבנה.",
        followUpQuestion: "המשתמש אצלך רק מזהה חריגה מהדשבורד, או שגם אמור לפעול ממנו מיד?",
      },
    ],
  },
};

function inferComparableProductFamily({
  projectType = "unknown",
  projectGoal = "",
  understoodItems = [],
  missingItems = [],
} = {}) {
  const normalizedProjectType = normalizeString(projectType, "unknown");
  const sourceText = [
    normalizedProjectType,
    normalizeString(projectGoal),
    ...normalizeArray(understoodItems),
    ...normalizeArray(missingItems),
  ]
    .filter(Boolean)
    .join("\n");

  if (normalizedProjectType === "commerce-ops") {
    return "commerce-storefront";
  }

  if (/(delivery|dispatch|route|routes|map|scanner|scan|courier|logistics|שליח|כתובת|מפה|סריקה|מסלול|לוגיסט)/iu.test(sourceText)) {
    return "delivery-logistics";
  }
  if (/(marketplace|two sided|two-sided|seller|buyer|בעלי מקצוע|זירה|ליסטינג|הצעת מחיר)/iu.test(sourceText)) {
    return "marketplace";
  }
  if (/(booking|appointment|reservation|calendar|slot|תור|קליניק|זמינות|יומן)/iu.test(sourceText)) {
    return "booking-scheduling";
  }
  if (/(crm|follow-up|follow up|lead|pipeline|renewal|ליד|חידוש|מעקב)/iu.test(sourceText)) {
    return "crm-followup";
  }
  if (/(dashboard|metrics|anomaly|חריג|מדד|דשבורד)/iu.test(sourceText)) {
    return "admin-dashboard";
  }
  if (/(service|consult|program|course|expert|ליווי|תוכנית|תוכן|פגישות)/iu.test(sourceText)) {
    return "services-content";
  }
  if (/(store|shop|catalog|checkout|inventory|shipping|variant|coupon|wishlist|סליקה|מלאי|מוצרים|משלוחים|קטלוג)/iu.test(sourceText)) {
    return "commerce-storefront";
  }
  if (normalizedProjectType === "internal-tool") {
    return "internal-tool";
  }
  return normalizedProjectType === "saas" ? "saas" : null;
}

function resolveComparablePatternFocus(pack = null, missingItems = []) {
  const patterns = normalizeArray(pack?.patterns);
  const normalizedMissing = normalizeArray(missingItems).join("\n");
  if (!normalizedMissing) {
    return patterns.slice(0, 2);
  }
  const focused = patterns.filter((pattern) => normalizeArray(pattern.signals).some((signal) => normalizedMissing.includes(signal)));
  return (focused.length > 0 ? focused : patterns).slice(0, 2);
}

export function buildComparableProductIntelligenceContext({
  projectType = "unknown",
  projectGoal = "",
  understoodItems = [],
  missingItems = [],
  userMessage = "",
} = {}) {
  const familyId = inferComparableProductFamily({
    projectType,
    projectGoal,
    understoodItems,
    missingItems,
  });
  if (!familyId || !COMPARABLE_PRODUCT_PACKS[familyId]) {
    return null;
  }
  const pack = COMPARABLE_PRODUCT_PACKS[familyId];
  const focusPatterns = resolveComparablePatternFocus(pack, missingItems);
  return {
    familyId,
    familyLabel: pack.familyLabel,
    comparableProducts: pack.comparableProducts,
    responseRules: [
      "Treat these similar products and patterns as hidden background, not as user-facing truth.",
      "Translate them into one or two bounded product observations tied to the current project and missing decisions.",
      "Do not dump a research summary. Mention product names only if the user explicitly asks for examples or comparisons.",
      "If the user is asking what similar products usually do, answer concretely and then ask one strong follow-up question.",
    ],
    focusPatterns,
    userMessage: normalizeString(userMessage),
  };
}

function userAskedForComparablePatterns(userMessage = "") {
  const normalized = normalizeString(userMessage);
  if (!normalized) {
    return false;
  }
  return /(מוצרים?\s+דומים|מתחרים|מקובל|בדרך כלל|נהוג|מה עוד כדאי|כדאי לשים לב|איך זה בדרך כלל עובד|similar|competitor|benchmark|best practice)/iu.test(normalized);
}

export function buildComparableProductShellReply({
  userMessage = "",
  projectType = "unknown",
  projectGoal = "",
  understoodItems = [],
  missingItems = [],
} = {}) {
  const context = buildComparableProductIntelligenceContext({
    projectType,
    projectGoal,
    understoodItems,
    missingItems,
    userMessage,
  });
  if (!context || !userAskedForComparablePatterns(userMessage)) {
    return "";
  }

  const focusPatterns = normalizeArray(context.focusPatterns);
  const leadingObservation = normalizeString(focusPatterns[0]?.observation);
  const secondaryObservation = normalizeString(focusPatterns[1]?.observation);
  const followUpQuestion = normalizeString(
    focusPatterns[0]?.followUpQuestion,
    normalizeArray(missingItems)[0],
  );
  const secondarySentence = secondaryObservation ? ` בנוסף, ${secondaryObservation}` : "";

  return `${leadingObservation}${secondarySentence} אצלך הייתי נועל קודם את ההחלטה הזו כדי לא לבנות על הנחה שגויה: ${followUpQuestion}`;
}
