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
      "mobile-app": buildMobileAppRoadmap,
      "agency-system": buildAgencySystemRoadmap,
      generic: buildGenericRoadmap,
      ...domainStrategies,
    };
  }

  generateInitialRoadmap(projectState) {
    const domain = projectState.context?.domain ?? "generic";
    const strategy = this.domainStrategies[domain] ?? this.domainStrategies.generic;
    const domainTasks = strategy(projectState);

    if (domain !== "generic" && domainTasks.length > 0) {
      return domainTasks;
    }

    return buildGenericRoadmap(projectState);
  }
}
