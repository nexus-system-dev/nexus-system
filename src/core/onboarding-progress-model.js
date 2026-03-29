function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

const STEP_ORDER = [
  "capture-vision",
  "capture-missing-inputs",
  "clarify-project-type",
  "review-intake",
  "confirm-project-setup",
  "completed",
];

function resolveCompletedSteps(currentStep) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex <= 0) {
    return [];
  }

  return STEP_ORDER.slice(0, currentIndex);
}

function resolveMissingFields(onboardingSession) {
  const requiredActions = Array.isArray(onboardingSession.requiredActions)
    ? onboardingSession.requiredActions
    : [];

  const mappedFields = [];
  for (const action of requiredActions) {
    if (/שם לפרויקט/.test(action)) {
      mappedFields.push("project-name");
    } else if (/תיאור קצר/.test(action)) {
      mappedFields.push("vision");
    } else if (/איפיון|קבצים|קישור/.test(action)) {
      mappedFields.push("supporting-material");
    } else if (/סוג פרויקט/.test(action)) {
      mappedFields.push("project-type");
    }
  }

  return [...new Set(mappedFields)];
}

function resolveResumeState(onboardingSession, currentStep, missingFields) {
  const status = onboardingSession.status ?? "idle";

  return {
    canResume: status === "active" && currentStep !== "completed",
    resumeStep: currentStep,
    isBlocked: missingFields.length > 0,
  };
}

export function createOnboardingProgressModel({
  onboardingSession = null,
  currentStep = null,
} = {}) {
  const normalizedSession = normalizeObject(onboardingSession);
  const resolvedCurrentStep = currentStep ?? normalizedSession.currentStep ?? "capture-vision";
  const completedSteps = resolveCompletedSteps(resolvedCurrentStep);
  const missingFields = resolveMissingFields(normalizedSession);
  const resumeState = resolveResumeState(normalizedSession, resolvedCurrentStep, missingFields);

  return {
    onboardingProgress: {
      progressId: `onboarding-progress:${normalizedSession.sessionId ?? normalizedSession.projectDraftId ?? "unknown"}`,
      currentStep: resolvedCurrentStep,
      nextStep: normalizedSession.nextStep ?? null,
      completedSteps,
      missingFields,
      requiredActions: normalizedSession.requiredActions ?? [],
      resumeState,
      summary: {
        completedStepCount: completedSteps.length,
        hasMissingFields: missingFields.length > 0,
        canResume: resumeState.canResume,
      },
    },
  };
}
