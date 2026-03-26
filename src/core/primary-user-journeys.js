function normalizeGoals(productGoals) {
  if (Array.isArray(productGoals)) {
    return productGoals.filter((goal) => typeof goal === "string" && goal.trim());
  }

  if (typeof productGoals === "string" && productGoals.trim()) {
    return [productGoals.trim()];
  }

  return [];
}

function normalizeCapabilities(coreCapabilities) {
  if (!Array.isArray(coreCapabilities)) {
    return [];
  }

  return coreCapabilities
    .map((capability) => {
      if (typeof capability === "string") {
        return capability.trim();
      }

      return capability?.label ?? capability?.value ?? null;
    })
    .filter(Boolean);
}

function createJourney({ journeyId, name, intent, steps }) {
  return {
    journeyId,
    name,
    intent,
    steps,
  };
}

function createStep({ stepId, label, outcome }) {
  return {
    stepId,
    label,
    outcome,
  };
}

export function definePrimaryUserJourneys({
  productGoals,
  coreCapabilities,
  businessContext = null,
  growthMarketingPlan = [],
} = {}) {
  const goals = normalizeGoals(productGoals);
  const capabilities = normalizeCapabilities(coreCapabilities);
  const growthTasks = Array.isArray(growthMarketingPlan) ? growthMarketingPlan : [];
  const userJourneys = [
    createJourney({
      journeyId: "journey-onboarding",
      name: "Project Onboarding",
      intent: "לקבל חזון, קבצים והקשר ולהפוך אותם לפרויקט מנוהל",
      steps: [
        createStep({ stepId: "capture-intake", label: "Capture intake", outcome: "project intake is created" }),
        createStep({ stepId: "resolve-gaps", label: "Resolve missing inputs", outcome: "required onboarding actions are clear" }),
        createStep({ stepId: "confirm-project", label: "Confirm project setup", outcome: "project moves into managed state" }),
      ],
    }),
    createJourney({
      journeyId: "journey-execution",
      name: "Execution Management",
      intent: "לבחור משימות, להבין חסמים ולעקוב אחרי התקדמות execution",
      steps: [
        createStep({ stepId: "review-state", label: "Review project state", outcome: "current bottleneck and next task are clear" }),
        createStep({ stepId: "approve-actions", label: "Approve critical actions", outcome: "gated actions can move forward" }),
        createStep({ stepId: "track-progress", label: "Track live progress", outcome: "user sees status, logs and next steps" }),
      ],
    }),
    createJourney({
      journeyId: "journey-release",
      name: "Release And Distribution",
      intent: "לאמת readiness, לנהל release ולבדוק סטטוסי הפצה",
      steps: [
        createStep({ stepId: "validate-release", label: "Validate release readiness", outcome: "blocking issues are visible" }),
        createStep({ stepId: "review-distribution", label: "Review distribution ownership", outcome: "release target is aligned with owned assets" }),
        createStep({ stepId: "track-release", label: "Track release status", outcome: "timeline and failures are visible" }),
      ],
    }),
  ];

  if (growthTasks.length > 0 || businessContext?.gtmStage) {
    userJourneys.push(
      createJourney({
        journeyId: "journey-growth",
        name: "Growth And Go-To-Market",
        intent: "להגדיר funnel, activation, KPI ו־growth follow-ups",
        steps: [
          createStep({ stepId: "review-growth-plan", label: "Review growth plan", outcome: "growth tasks are prioritized" }),
          createStep({ stepId: "define-funnel", label: "Define funnel and activation", outcome: "acquisition and onboarding are actionable" }),
          createStep({ stepId: "track-kpis", label: "Track business KPIs", outcome: "growth metrics can be monitored" }),
        ],
      }),
    );
  }

  const journeySteps = userJourneys.flatMap((journey) =>
    journey.steps.map((step, index) => ({
      ...step,
      journeyId: journey.journeyId,
      order: index + 1,
    })),
  );

  return {
    userJourneys: {
      goals,
      capabilities,
      targetAudience: businessContext?.targetAudience ?? null,
      gtmStage: businessContext?.gtmStage ?? null,
      journeys: userJourneys,
    },
    journeySteps,
  };
}
