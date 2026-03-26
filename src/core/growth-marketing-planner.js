import { createTask } from "./types.js";

function createGrowthTask({
  id,
  summary,
  successCriteria,
  businessGoal,
  businessContext,
  dependencies = [],
  lockKey,
  requiredCapabilities = ["marketing", "analytics"],
}) {
  return createTask({
    id,
    lane: "growth",
    summary,
    requiredCapabilities,
    successCriteria,
    context: {
      businessGoal,
      businessContext,
    },
    dependencies,
    lockKey,
  });
}

export function buildGrowthMarketingPlanner({
  businessGoal = "",
  businessContext = null,
  businessBottleneck = null,
  decisionIntelligence = null,
} = {}) {
  const tasks = [];
  const funnel = businessContext?.funnel ?? {};
  const kpis = businessContext?.kpis ?? [];
  const gtmStage = businessContext?.gtmStage ?? null;
  const unresolvedApprovals = decisionIntelligence?.approvalRequired ?? [];

  if (funnel.acquisition === "needs-definition") {
    tasks.push(
      createGrowthTask({
        id: "growth-acquisition-funnel",
        summary: "להגדיר משפך רכישה ראשוני",
        successCriteria: [
          "יש ערוץ רכישה ראשי מוגדר",
          "יש CTA ראשי מדיד",
          "יש flow ברור מ-visit ל-signup",
        ],
        businessGoal,
        businessContext,
        lockKey: "growth-acquisition-funnel",
      }),
    );
  }

  if (funnel.activation === "baseline-defined" || gtmStage === "build") {
    tasks.push(
      createGrowthTask({
        id: "growth-onboarding-flow",
        summary: "להקים onboarding ו-activation flow עסקי",
        successCriteria: [
          "יש צעד activation ראשון",
          "יש מדידה ל-completion של onboarding",
          "משתמש חדש מבין מה הערך הראשוני",
        ],
        businessGoal,
        businessContext,
        dependencies: tasks.some((task) => task.id === "growth-acquisition-funnel")
          ? ["growth-acquisition-funnel"]
          : [],
        lockKey: "growth-onboarding-flow",
        requiredCapabilities: ["marketing", "product", "analytics"],
      }),
    );
  }

  if (funnel.retention === "needs-definition" || kpis.includes("retention-rate")) {
    tasks.push(
      createGrowthTask({
        id: "growth-retention-loop",
        summary: "להגדיר retention loop ראשוני",
        successCriteria: [
          "יש trigger מרכזי לחזרת משתמש",
          "יש metric retention ברור",
          "יש פעולה אחת לשיפור retention",
        ],
        businessGoal,
        businessContext,
        dependencies: tasks.some((task) => task.id === "growth-onboarding-flow")
          ? ["growth-onboarding-flow"]
          : [],
        lockKey: "growth-retention-loop",
      }),
    );
  }

  if (kpis.length > 0) {
    tasks.push(
      createGrowthTask({
        id: "growth-kpi-instrumentation",
        summary: "להגדיר KPI עסקיים ומדידה ראשונית",
        successCriteria: [
          "יש רשימת KPI מוסכמת",
          "לכל KPI יש הגדרת מדידה",
          "יש מקום אחד שבו אפשר לקרוא את המדדים",
        ],
        businessGoal,
        businessContext,
        lockKey: "growth-kpi-instrumentation",
      }),
    );
  }

  if (businessBottleneck?.id === "business:approval-pending" || unresolvedApprovals.length > 0) {
    tasks.push(
      createGrowthTask({
        id: "growth-business-approvals",
        summary: "לרכז החלטות ואישורים עסקיים פתוחים",
        successCriteria: [
          "יש רשימת אישורים פתוחים",
          "ברור מה חוסם launch או growth",
          "יש owner לכל החלטה עסקית פתוחה",
        ],
        businessGoal,
        businessContext,
        lockKey: "growth-business-approvals",
        requiredCapabilities: ["ops", "marketing"],
      }),
    );
  }

  return tasks;
}
