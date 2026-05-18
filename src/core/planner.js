import { createTask } from "./types.js";

const MIN_PLANNING_CONFIDENCE = 0.65;

function isReliable(item) {
  if (!item) {
    return false;
  }

  const metadata = item.metadata ?? item;
  return metadata.status !== "unknown" && metadata.confidence >= MIN_PLANNING_CONFIDENCE;
}

function getReliableContext(projectState) {
  const context = projectState.context ?? null;

  return {
    context,
    reliableGaps: context?.gaps?.filter((gap) => isReliable(gap)) ?? [],
    reliableFlows: context?.flows?.filter((flow) => isReliable(flow)) ?? [],
  };
}

function hasGap(gaps, variants) {
  return variants.some((variant) => gaps.has(variant));
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolvePlanningDomain(projectState) {
  const explicitDomain = normalizeString(projectState?.context?.domain);
  if (explicitDomain) {
    return explicitDomain;
  }

  const intakeProjectType = normalizeString(projectState?.intake?.projectType);
  if (["casino", "saas", "internal-tool", "commerce-ops", "mobile-app", "agency-system"].includes(intakeProjectType)) {
    return intakeProjectType;
  }

  return "generic";
}

function priorityToNumber(priority) {
  if (priority === "high") {
    return 3;
  }
  if (priority === "medium") {
    return 2;
  }
  return 1;
}

function mapImportedTaskToRoadmapTask(task, businessGoal, stack = {}) {
  const sourceType = normalizeString(task?.sourceType) || "documents";
  const category = normalizeString(task?.category) || "knowledge-review";
  const title = normalizeString(task?.title) || "Review imported project evidence";
  const detail = normalizeString(task?.detail);
  const evidence = normalizeArray(task?.evidence).filter(Boolean);

  const taskTypeBySource = {
    repository: "backend",
    website: "frontend",
    analytics: "analytics",
    documents: "product",
  };
  const laneBySource = {
    repository: "build",
    website: "marketing",
    analytics: "growth",
    documents: "maintenance",
  };

  return createTask({
    id: normalizeString(task?.extractedTaskId) || `imported-task:${sourceType}:${category}`,
    taskType: taskTypeBySource[sourceType] ?? "product",
    lane: laneBySource[sourceType] ?? "maintenance",
    summary: title,
    requiredCapabilities:
      sourceType === "repository"
        ? ["backend", "product"]
        : sourceType === "website"
          ? ["frontend", "product"]
          : sourceType === "analytics"
            ? ["analytics", "product"]
            : ["product"],
    successCriteria: [
      "The next step stays anchored to imported project evidence.",
      "The resulting task reflects the uploaded project rather than a generic fallback.",
      detail || "The extracted evidence is translated into a concrete product step.",
    ],
    context: {
      businessGoal,
      stack,
      sourceType,
      category,
      importedEvidence: evidence,
      importedDetail: detail || null,
    },
    lockKey: normalizeString(task?.extractedTaskId) || `${sourceType}-${category}`,
    priority: priorityToNumber(task?.priority),
  });
}

function buildImportedAssetRoadmap(projectState) {
  const extraction = normalizeObject(projectState?.importedAssetTaskExtraction);
  if (normalizeString(extraction.status) !== "ready") {
    return [];
  }

  const extractedTasks = normalizeArray(extraction.extractedTasks);
  if (extractedTasks.length === 0) {
    return [];
  }

  const businessGoal = projectState?.businessGoal ?? "";
  const stack = projectState?.stack ?? {};
  return extractedTasks.slice(0, 3).map((task) => mapImportedTaskToRoadmapTask(task, businessGoal, stack));
}

function buildCasinoRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {} } = projectState;
  const { context, reliableGaps, reliableFlows } = getReliableContext(projectState);

  if (context?.domain !== "casino" || reliableGaps.length === 0) {
    return [];
  }

  const gapTexts = new Set(reliableGaps.map((gap) => gap.text));
  const blockedAuthFlow = reliableFlows.some((flow) => ["registration", "login"].includes(flow.name));

  if (
    hasGap(gapTexts, [
      "Database migrations implementation",
      "לא זוהו קבצי migrations או ניהול סכימה",
      "Migrations are planned but not implemented.",
    ])
  ) {
    tasks.push(
      createTask({
        id: "casino-db-migrations",
        taskType: "backend",
        lane: "build",
        summary: "להקים מיגרציות וסכמת בסיס נתונים",
        requiredCapabilities: ["backend", "database"],
        successCriteria: [
          "יש שכבת migrations פעילה",
          "סכמת בסיס הנתונים ממומשת בפועל",
          "אפשר לחבר את שירותי ה-auth וה-wallet למסד",
        ],
        context: {
          businessGoal,
          stack,
          gaps: reliableGaps.map((gap) => gap.text),
        },
        lockKey: "database-schema",
      }),
    );
  }

  if (blockedAuthFlow || gapTexts.has("Frontend auth integration")) {
    tasks.push(
      createTask({
        id: "casino-auth-flow",
        taskType: "frontend",
        lane: "build",
        summary: "לחבר את זרימת ההתחברות של ה-frontend ל-backend",
        requiredCapabilities: ["frontend", "backend"],
        successCriteria: [
          "registration ו-login מחוברים ל-API",
          "אפשר להשלים התחברות מקצה לקצה",
          "זרימות auth לא נשארות במצב partial",
        ],
        context: {
          businessGoal,
          stack,
        },
        dependencies: tasks.some((task) => task.id === "casino-db-migrations") ? ["casino-db-migrations"] : [],
        lockKey: "auth-flow",
      }),
    );
  }

  if (gapTexts.has("Wallet and treasury implementation")) {
    tasks.push(
      createTask({
        id: "casino-wallet",
        taskType: "backend",
        lane: "build",
        summary: "להקים את שכבת wallet ו-treasury",
        requiredCapabilities: ["backend", "payments"],
        successCriteria: [
          "יש מודול wallet פעיל",
          "יש שירות treasury בסיסי",
          "אפשר לעקוב אחרי יתרה ותנועות פנימיות",
        ],
        context: {
          businessGoal,
          stack,
        },
        dependencies: tasks.some((task) => task.id === "casino-auth-flow") ? ["casino-auth-flow"] : [],
        lockKey: "wallet",
      }),
    );
  }

  if (gapTexts.has("Bonus implementation")) {
    tasks.push(
      createTask({
        id: "casino-bonus",
        taskType: "growth",
        lane: "growth",
        summary: "להקים מודול bonuses בסיסי",
        requiredCapabilities: ["backend", "analytics"],
        successCriteria: [
          "יש מבנה bonus בסיסי",
          "אפשר להפעיל bonus claim flow",
          "ניתן למדוד שימוש בבונוסים",
        ],
        context: {
          businessGoal,
          stack,
        },
        dependencies: tasks.some((task) => task.id === "casino-wallet") ? ["casino-wallet"] : [],
        lockKey: "bonus",
      }),
    );
  }

  if (gapTexts.has("Game implementation")) {
    tasks.push(
      createTask({
        id: "casino-games",
        taskType: "frontend",
        lane: "build",
        summary: "להקים מודולי משחק וזרימת game launch",
        requiredCapabilities: ["backend", "frontend"],
        successCriteria: [
          "יש מודולי משחק ראשוניים",
          "יש game launch flow",
          "המשחקים יכולים להתחבר ל-wallet",
        ],
        context: {
          businessGoal,
          stack,
        },
        dependencies: tasks.some((task) => task.id === "casino-wallet") ? ["casino-wallet"] : [],
        lockKey: "games",
      }),
    );
  }

  return tasks;
}

function buildSaasRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {}, analytics = {}, product = {} } = projectState;
  const { context, reliableGaps } = getReliableContext(projectState);

  if (context?.domain !== "saas") {
    return [];
  }

  const gapTexts = new Set(reliableGaps.map((gap) => gap.text.toLowerCase()));
  const missingAuth = !product.hasAuth || gapTexts.has("auth") || gapTexts.has("authentication");
  const missingBilling =
    !product.hasPaymentIntegration ||
    gapTexts.has("billing") ||
    gapTexts.has("payments") ||
    gapTexts.has("subscription billing");
  const missingOnboarding =
    gapTexts.has("onboarding") ||
    gapTexts.has("activation") ||
    gapTexts.has("user onboarding flow");
  const missingAcquisition =
    !analytics.hasBaselineCampaign ||
    gapTexts.has("landing page") ||
    gapTexts.has("go-to-market funnel") ||
    gapTexts.has("paid acquisition");

  if (missingAuth) {
    tasks.push(
      createTask({
        id: "saas-auth",
        taskType: "backend",
        lane: "build",
        summary: "להקים התחברות והרשמה למוצר ה-SaaS",
        requiredCapabilities: ["backend", "security"],
        successCriteria: [
          "אפשר לפתוח חשבון ולהתחבר",
          "יש ניהול session תקין",
          "המשתמש מגיע למסך מוצר אחרי התחברות",
        ],
        context: { businessGoal, stack },
        lockKey: "saas-auth",
      }),
    );
  }

  if (missingBilling) {
    tasks.push(
      createTask({
        id: "saas-billing",
        taskType: "backend",
        lane: "build",
        summary: "להקים מנוי, חיוב ותשלומים",
        requiredCapabilities: ["backend", "payments"],
        successCriteria: [
          "אפשר להתחיל מנוי",
          "יש טיפול בכשלון חיוב",
          "יש סטטוס מנוי ברור לכל משתמש",
        ],
        context: { businessGoal, stack },
        dependencies: tasks.some((task) => task.id === "saas-auth") ? ["saas-auth"] : [],
        lockKey: "saas-billing",
      }),
    );
  }

  if (missingOnboarding) {
    tasks.push(
      createTask({
        id: "saas-onboarding",
        taskType: "growth",
        lane: "growth",
        summary: "לבנות onboarding ו-activation flow",
        requiredCapabilities: ["frontend", "product"],
        successCriteria: [
          "משתמש חדש מבין איך להתחיל",
          "יש צעד activation ראשון",
          "אפשר למדוד completion של onboarding",
        ],
        context: { businessGoal, analytics },
        dependencies: tasks.some((task) => task.id === "saas-auth") ? ["saas-auth"] : [],
        lockKey: "saas-onboarding",
      }),
    );
  }

  if (missingAcquisition) {
    tasks.push(
      createTask({
        id: "saas-acquisition",
        taskType: "growth",
        lane: "marketing",
        summary: "להקים משפך רכישת משתמשים ראשון",
        requiredCapabilities: ["marketing", "analytics", "frontend"],
        successCriteria: [
          "יש עמוד נחיתה ברור",
          "יש CTA מדיד",
          "יש קמפיין ראשון שאפשר להשיק",
        ],
        context: { businessGoal, analytics },
        dependencies: [
          ...(tasks.some((task) => task.id === "saas-onboarding") ? ["saas-onboarding"] : []),
          ...(tasks.some((task) => task.id === "saas-billing") ? ["saas-billing"] : []),
        ],
        lockKey: "saas-acquisition",
      }),
    );
  }

  return tasks;
}

function buildMobileAppRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {} } = projectState;
  const { context, reliableGaps } = getReliableContext(projectState);

  if (context?.domain !== "mobile-app") {
    return [];
  }

  const gapTexts = new Set(reliableGaps.map((gap) => gap.text.toLowerCase()));

  if (gapTexts.has("auth") || gapTexts.has("authentication") || gapTexts.has("login flow")) {
    tasks.push(
      createTask({
        id: "mobile-auth",
        taskType: "mobile",
        lane: "build",
        summary: "להשלים זרימת התחברות והרשמה במובייל",
        requiredCapabilities: ["mobile", "backend"],
        successCriteria: [
          "אפשר להירשם ולהתחבר מהאפליקציה",
          "יש טיפול נכון בשגיאות auth",
          "ה-session נשמר בצורה בטוחה",
        ],
        context: { businessGoal, stack },
        lockKey: "mobile-auth",
      }),
    );
  }

  if (
    gapTexts.has("api integration") ||
    gapTexts.has("backend integration") ||
    gapTexts.has("data synchronization")
  ) {
    tasks.push(
      createTask({
        id: "mobile-api-integration",
        taskType: "mobile",
        lane: "build",
        summary: "לחבר את האפליקציה ל-API ולסנכרון נתונים",
        requiredCapabilities: ["mobile", "backend"],
        successCriteria: [
          "המסכים המרכזיים מקבלים נתונים חיים",
          "יש טיפול במצב offline או כשל רשת",
          "יש שכבת client API מסודרת",
        ],
        context: { businessGoal, stack },
        dependencies: tasks.some((task) => task.id === "mobile-auth") ? ["mobile-auth"] : [],
        lockKey: "mobile-api",
      }),
    );
  }

  if (gapTexts.has("push notifications") || gapTexts.has("notifications")) {
    tasks.push(
      createTask({
        id: "mobile-notifications",
        taskType: "mobile",
        lane: "growth",
        summary: "להקים שכבת notifications ו-engagement",
        requiredCapabilities: ["mobile", "analytics"],
        successCriteria: [
          "אפשר לשלוח push בסיסי",
          "המשתמש יכול לאשר או לחסום notifications",
          "יש מדידה של open rate",
        ],
        context: { businessGoal, stack },
        dependencies: tasks.some((task) => task.id === "mobile-api-integration") ? ["mobile-api-integration"] : [],
        lockKey: "mobile-notifications",
      }),
    );
  }

  if (
    gapTexts.has("release pipeline") ||
    gapTexts.has("app store deployment") ||
    gapTexts.has("crash reporting")
  ) {
    tasks.push(
      createTask({
        id: "mobile-release",
        taskType: "release",
        lane: "maintenance",
        summary: "להקים pipeline לשחרור גרסה וניטור קריסות",
        requiredCapabilities: ["mobile", "devops"],
        successCriteria: [
          "יש build repeatable לגרסת מובייל",
          "יש crash reporting",
          "אפשר לשחרר גרסה לבדיקה",
        ],
        context: { businessGoal, stack },
        lockKey: "mobile-release",
      }),
    );
  }

  return tasks;
}

function buildAgencySystemRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {}, analytics = {} } = projectState;
  const { context, reliableGaps } = getReliableContext(projectState);

  if (context?.domain !== "agency-system") {
    return [];
  }

  const gapTexts = new Set(reliableGaps.map((gap) => gap.text.toLowerCase()));

  if (gapTexts.has("client intake") || gapTexts.has("lead intake") || gapTexts.has("project intake")) {
    tasks.push(
      createTask({
        id: "agency-intake",
        taskType: "frontend",
        lane: "growth",
        summary: "להקים intake מסודר ללידים ופרויקטים חדשים",
        requiredCapabilities: ["frontend", "operations"],
        successCriteria: [
          "יש טופס intake מסודר",
          "המידע נכנס למערכת במקום אחד",
          "אפשר לשייך כל פנייה ללקוח ופרויקט",
        ],
        context: { businessGoal, analytics },
        lockKey: "agency-intake",
      }),
    );
  }

  if (gapTexts.has("task assignment") || gapTexts.has("resource planning") || gapTexts.has("team allocation")) {
    tasks.push(
      createTask({
        id: "agency-allocation",
        taskType: "ops",
        lane: "maintenance",
        summary: "לבנות שכבת שיבוץ משימות ומשאבים לצוות",
        requiredCapabilities: ["backend", "operations"],
        successCriteria: [
          "אפשר להקצות בעלות על משימות",
          "יש תמונת עומסים של הצוות",
          "אפשר לראות מי פנוי למה",
        ],
        context: { businessGoal, stack },
        dependencies: tasks.some((task) => task.id === "agency-intake") ? ["agency-intake"] : [],
        lockKey: "agency-allocation",
      }),
    );
  }

  if (gapTexts.has("client reporting") || gapTexts.has("delivery visibility") || gapTexts.has("status reports")) {
    tasks.push(
      createTask({
        id: "agency-reporting",
        taskType: "frontend",
        lane: "growth",
        summary: "להקים שקיפות דיווח ללקוח על מצב העבודה",
        requiredCapabilities: ["backend", "frontend"],
        successCriteria: [
          "אפשר להפיק סטטוס עדכני ללקוח",
          "יש נראות של חסמים והתקדמות",
          "הלקוח רואה deliverables מרכזיים",
        ],
        context: { businessGoal, analytics },
        dependencies: tasks.some((task) => task.id === "agency-allocation") ? ["agency-allocation"] : [],
        lockKey: "agency-reporting",
      }),
    );
  }

  return tasks;
}

function buildInternalToolRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {} } = projectState;
  const intake = normalizeObject(projectState?.intake);
  const normalizedGoal = `${normalizeString(businessGoal)} ${normalizeString(intake.visionText)}`.toLowerCase();

  tasks.push(
    createTask({
      id: "internal-tool-workspace",
      taskType: "frontend",
      lane: "build",
      summary: "לבנות מסך עבודה מרכזי עם תור ברור, סטטוס ופעולה הבאה",
      requiredCapabilities: ["frontend", "product"],
      successCriteria: [
        "יש מסך אחד שמרכז את העבודה היומית.",
        "המשתמש רואה מה חדש, מה תקוע, ומה הפעולה הבאה.",
        "המשטח מרגיש כמו workspace פנימי ולא כמו דף שיווקי.",
      ],
      context: {
        businessGoal,
        stack,
        projectType: "internal-tool",
      },
      lockKey: "internal-tool-workspace",
      priority: 3,
    }),
  );

  if (/(queue|routing|handoff|ownership|תור|בעלות|ניתוב|העברה)/i.test(normalizedGoal)) {
    tasks.push(
      createTask({
        id: "internal-tool-ownership",
        taskType: "ops",
        lane: "maintenance",
        summary: "לקבע ownership וחוקי handoff על כל פריט עבודה",
        requiredCapabilities: ["operations", "product"],
        successCriteria: [
          "לכל פריט יש בעלות ברורה.",
          "יש חוקי handoff בין תפקידים.",
          "אי אפשר לאבד פריט בין בעלי תפקידים.",
        ],
        context: {
          businessGoal,
          stack,
          projectType: "internal-tool",
        },
        dependencies: ["internal-tool-workspace"],
        lockKey: "internal-tool-ownership",
        priority: 2,
        statusReason: "dependency",
      }),
    );
  }

  if (/(sla|wait|delay|urgent|visibility|proof|state|loop|זמן|דחוף|הוכחה|סטייט|לולאה)/i.test(normalizedGoal)) {
    tasks.push(
      createTask({
        id: "internal-tool-visibility",
        taskType: "product",
        lane: "maintenance",
        summary: "להוסיף שכבת visibility שמדגישה SLA, דחיפות ומצב אמיתי",
        requiredCapabilities: ["product", "analytics"],
        successCriteria: [
          "רואים מה דורש טיפול היום.",
          "יש אינדיקציה ברורה למה תקוע או בסיכון.",
          "ה־proof משקף מצב עבודה אמיתי ולא KPI שיווקי.",
        ],
        context: {
          businessGoal,
          stack,
          projectType: "internal-tool",
        },
        dependencies: ["internal-tool-workspace"],
        lockKey: "internal-tool-visibility",
        priority: 1,
        statusReason: "dependency",
      }),
    );
  }

  return tasks;
}

function buildCommerceOpsRoadmap(projectState) {
  const tasks = [];
  const { businessGoal, stack = {} } = projectState;
  const intake = normalizeObject(projectState?.intake);
  const normalizedGoal = `${normalizeString(businessGoal)} ${normalizeString(intake.visionText)}`.toLowerCase();

  tasks.push(
    createTask({
      id: "commerce-ops-command-center",
      taskType: "frontend",
      lane: "build",
      summary: "לבנות מרכז תפעול מסחר שמחבר קטלוג, הזמנות ופעולה הבאה במקום אחד",
      requiredCapabilities: ["frontend", "product"],
      successCriteria: [
        "יש מסך מסחר אחד שמרכז תור עבודה, הזמנות ופעולה הבאה.",
        "הצוות מבין מיד מה דחוף בקטלוג, מה תקוע בהזמנות, ומה נסגר היום.",
        "המשטח מרגיש כמו מרכז תפעול מסחר ולא כמו workspace פנימי גנרי.",
      ],
      context: {
        businessGoal,
        stack,
        projectType: "commerce-ops",
      },
      lockKey: "commerce-ops-command-center",
      priority: 3,
    }),
  );

  if (/(order|orders|checkout|fulfillment|shipping|refund|הזמנות|משלוח|סליקה|החזר)/i.test(normalizedGoal)) {
    tasks.push(
      createTask({
        id: "commerce-ops-orders",
        taskType: "ops",
        lane: "maintenance",
        summary: "לסגור צווארי בקבוק בהזמנות, טיפול ותעדוף מסחרי",
        requiredCapabilities: ["operations", "product"],
        successCriteria: [
          "יש בעלות ברורה על הזמנות שדורשות טיפול.",
          "אפשר לזהות הזמנות תקועות ודחופות בלי חיפוש ידני.",
          "הפעולה הבאה על כל הזמנה ברורה לצוות המסחר.",
        ],
        context: {
          businessGoal,
          stack,
          projectType: "commerce-ops",
        },
        dependencies: ["commerce-ops-command-center"],
        lockKey: "commerce-ops-orders",
        priority: 2,
        statusReason: "dependency",
      }),
    );
  }

  if (/(catalog|inventory|sku|variant|content|merch|קטלוג|מלאי|sku|וריאנט|תוכן)/i.test(normalizedGoal)) {
    tasks.push(
      createTask({
        id: "commerce-ops-catalog",
        taskType: "product",
        lane: "maintenance",
        summary: "להבליט חריגות קטלוג, מלאי ותוכן שמשפיעות על המכירה",
        requiredCapabilities: ["product", "analytics"],
        successCriteria: [
          "מזהים חריגות קטלוג ומלאי באותו משטח עבודה.",
          "רואים מה משפיע על ההמרה או על תקינות ההזמנה.",
          "ה־proof מציג בעיות מסחר אמיתיות ולא רק queue כללי.",
        ],
        context: {
          businessGoal,
          stack,
          projectType: "commerce-ops",
        },
        dependencies: ["commerce-ops-command-center"],
        lockKey: "commerce-ops-catalog",
        priority: 1,
        statusReason: "dependency",
      }),
    );
  }

  return tasks;
}

function buildGenericRoadmap(projectState) {
  const tasks = [];
  const {
    product = {},
    businessGoal,
    knowledge = {},
    stack = {},
    analytics = {},
  } = projectState;

  if (!product.hasAuth) {
    tasks.push(
      createTask({
        id: "build-auth",
        taskType: "backend",
        lane: "build",
        summary: "להקים מערכת התחברות והרשמה",
        requiredCapabilities: ["backend", "security"],
        successCriteria: [
          "משתמשים יכולים להירשם ולהתחבר",
          "נתיבים מוגנים דורשים אימות",
          "בדיקת עשן בסיסית של ההתחברות עוברת",
        ],
        context: {
          businessGoal,
          stack,
          gaps: knowledge.knownGaps ?? [],
        },
        lockKey: "auth",
      }),
    );
  }

  if (!product.hasStagingEnvironment) {
    tasks.push(
      createTask({
        id: "setup-staging",
        taskType: "ops",
        lane: "maintenance",
        summary: "להקים סביבת Staging",
        requiredCapabilities: ["devops"],
        successCriteria: [
          "אפשר לגשת לסביבת ה-Staging",
          "תהליך ה-Deploy תומך ב-Staging",
          "משתני הסביבה מתועדים",
        ],
        context: {
          businessGoal,
          stack,
        },
        lockKey: "staging",
      }),
    );
  }

  if (!product.hasLandingPage) {
    tasks.push(
      createTask({
        id: "landing-page",
        taskType: "frontend",
        lane: "marketing",
        summary: "ליצור עמוד נחיתה ממיר",
        requiredCapabilities: ["frontend", "copywriting"],
        successCriteria: [
          "עמוד הנחיתה מסביר את הצעת הערך",
          "יש קריאה מרכזית לפעולה שאפשר למדוד",
          "אפשר להעלות את העמוד ל-Staging",
        ],
        context: {
          businessGoal,
          analytics,
        },
        dependencies: product.hasStagingEnvironment ? [] : ["setup-staging"],
        lockKey: "landing-page",
      }),
    );
  }

  if (!product.hasPaymentIntegration) {
    tasks.push(
      createTask({
        id: "payment-integration",
        taskType: "backend",
        lane: "build",
        summary: "לחבר תשלומים ותהליך חיוב",
        requiredCapabilities: ["backend", "payments"],
        successCriteria: [
          "משתמשים יכולים להתחיל מנוי בתשלום",
          "זרימות הצלחה וכישלון של תשלום מטופלות",
          "אירועי חיוב נשמרים לדיווח עתידי",
        ],
        context: {
          businessGoal,
          stack,
        },
        dependencies: [
          ...(product.hasAuth ? [] : ["build-auth"]),
          ...(product.hasStagingEnvironment ? [] : ["setup-staging"]),
        ],
        lockKey: "billing",
      }),
    );
  }

  if (!analytics.hasBaselineCampaign) {
    tasks.push(
      createTask({
        id: "campaign-plan",
        taskType: "growth",
        lane: "growth",
        summary: "להכין ניסוי ראשון לרכישת משתמשים בתשלום",
        requiredCapabilities: ["marketing", "analytics"],
        successCriteria: [
          "יש השערה ברורה לערוץ השיווקי",
          "מוגדר מדד הצלחה לקמפיין",
          "אפשר להשיק את הקמפיין אחרי שהעמוד באוויר",
        ],
        context: {
          businessGoal,
          analytics,
        },
        dependencies: [
          ...(product.hasLandingPage ? [] : ["landing-page"]),
          ...(product.hasPaymentIntegration ? [] : ["payment-integration"]),
        ],
        lockKey: "growth-campaign",
      }),
    );
  }

  return tasks;
}

export class StrategicPlanner {
  constructor({ domainStrategies = {} } = {}) {
    this.domainStrategies = {
      casino: buildCasinoRoadmap,
      saas: buildSaasRoadmap,
      "internal-tool": buildInternalToolRoadmap,
      "commerce-ops": buildCommerceOpsRoadmap,
      "mobile-app": buildMobileAppRoadmap,
      "agency-system": buildAgencySystemRoadmap,
      generic: buildGenericRoadmap,
      ...domainStrategies,
    };
  }

  generateInitialRoadmap(projectState) {
    const importedRoadmap = buildImportedAssetRoadmap(projectState);
    if (importedRoadmap.length > 0) {
      return importedRoadmap;
    }

    const domain = resolvePlanningDomain(projectState);
    const strategy = this.domainStrategies[domain] ?? this.domainStrategies.generic;
    const domainTasks = strategy(projectState);

    if (domain !== "generic" && domainTasks.length > 0) {
      return domainTasks;
    }

    return buildGenericRoadmap(projectState);
  }
}
