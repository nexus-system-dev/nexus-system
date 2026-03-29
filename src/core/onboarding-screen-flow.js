function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeRequiredActions(requiredActions = []) {
  if (!Array.isArray(requiredActions)) {
    return [];
  }

  return requiredActions
    .filter((action) => typeof action === "string" && action.trim())
    .map((action) => action.trim());
}

function createScreenState({
  enabled,
  reason = null,
  emphasis = "default",
  nextAction = null,
} = {}) {
  return {
    enabled,
    reason,
    emphasis,
    nextAction,
  };
}

function createQuestionId(action, index) {
  return `onboarding-question-${index + 1}:${action
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function buildQuestionCards(requiredActions, currentStep) {
  return requiredActions.map((action, index) => ({
    questionId: createQuestionId(action, index),
    prompt: action,
    step: currentStep,
    responseType: /קבצים|קישור|איפיון/.test(action) ? "attachments" : "text",
    isRequired: true,
  }));
}

function resolveActiveScreen(onboardingSession, onboardingProgress) {
  const status = onboardingSession.status ?? "idle";
  const currentStep = onboardingProgress.currentStep ?? onboardingSession.currentStep ?? "capture-vision";

  if (status === "completed" || currentStep === "completed") {
    return "completed";
  }
  if (status === "loading" || onboardingSession.isLoading === true || onboardingSession.pendingRequest === true) {
    return "loading";
  }
  if (status === "error" || onboardingSession.error) {
    return "error";
  }
  if (
    onboardingProgress.resumeState?.canResume === true
    && onboardingProgress.completedSteps?.length > 0
    && currentStep !== "capture-vision"
  ) {
    return "resume";
  }

  return "questionnaire";
}

function buildAutosaveState(onboardingSession, activeScreen) {
  const lastSavedAt = onboardingSession.updatedAt ?? onboardingSession.createdAt ?? null;
  const isLoading = activeScreen === "loading";
  const hasError = activeScreen === "error";

  return {
    enabled: activeScreen !== "completed",
    status: hasError ? "error" : (isLoading ? "saving" : "idle"),
    lastSavedAt,
    canResumeFromLastSave: Boolean(lastSavedAt),
  };
}

function buildScreenStates(activeScreen, onboardingProgress, onboardingSession) {
  const nextStep = onboardingProgress.nextStep ?? onboardingSession.nextStep ?? null;
  const blockingReason = onboardingProgress.requiredActions?.[0] ?? null;

  return {
    questionnaire: createScreenState({
      enabled: activeScreen === "questionnaire",
      reason: activeScreen === "questionnaire" ? onboardingProgress.currentStep : null,
      emphasis: activeScreen === "questionnaire" ? "primary" : "secondary",
      nextAction: activeScreen === "questionnaire" ? "answer-required-questions" : null,
    }),
    resume: createScreenState({
      enabled: activeScreen === "resume",
      reason: activeScreen === "resume" ? onboardingProgress.currentStep : null,
      emphasis: activeScreen === "resume" ? "primary" : "secondary",
      nextAction: activeScreen === "resume" ? "resume-onboarding" : null,
    }),
    loading: createScreenState({
      enabled: activeScreen === "loading",
      reason: activeScreen === "loading" ? "saving-onboarding-progress" : null,
      emphasis: "informational",
      nextAction: activeScreen === "loading" ? "wait-for-save" : null,
    }),
    error: createScreenState({
      enabled: activeScreen === "error",
      reason: activeScreen === "error" ? onboardingSession.error?.message ?? "onboarding-save-failed" : null,
      emphasis: "critical",
      nextAction: activeScreen === "error" ? "retry-onboarding-save" : null,
    }),
    completed: createScreenState({
      enabled: activeScreen === "completed",
      reason: activeScreen === "completed" ? "onboarding-complete" : null,
      emphasis: activeScreen === "completed" ? "success" : "secondary",
      nextAction: activeScreen === "completed" ? "continue-to-project-state" : null,
    }),
    nextStep,
    blockingReason,
  };
}

function buildSummary(activeScreen, onboardingProgress, screens) {
  return {
    activeScreen,
    needsUserInput: activeScreen === "questionnaire" || activeScreen === "resume",
    hasBlockingError: activeScreen === "error",
    canResume: onboardingProgress.resumeState?.canResume === true,
    missingActionCount: onboardingProgress.requiredActions?.length ?? 0,
    nextAction:
      screens.error.enabled
        ? screens.error.nextAction
        : (screens.resume.enabled
          ? screens.resume.nextAction
          : (screens.questionnaire.nextAction
            ?? screens.completed.nextAction
            ?? null)),
  };
}

export function buildOnboardingScreenFlow({
  onboardingSession = null,
  onboardingProgress = null,
  requiredActions = [],
} = {}) {
  const normalizedSession = normalizeObject(onboardingSession);
  const normalizedProgress = normalizeObject(onboardingProgress);
  const resolvedRequiredActions = normalizeRequiredActions(
    normalizedProgress.requiredActions?.length > 0
      ? normalizedProgress.requiredActions
      : requiredActions,
  );
  const progress = {
    ...normalizedProgress,
    currentStep: normalizedProgress.currentStep ?? normalizedSession.currentStep ?? "capture-vision",
    nextStep: normalizedProgress.nextStep ?? normalizedSession.nextStep ?? null,
    completedSteps: Array.isArray(normalizedProgress.completedSteps) ? normalizedProgress.completedSteps : [],
    requiredActions: resolvedRequiredActions,
    resumeState: normalizeObject(normalizedProgress.resumeState),
  };
  const activeScreen = resolveActiveScreen(normalizedSession, progress);
  const screens = buildScreenStates(activeScreen, progress, normalizedSession);
  const autosave = buildAutosaveState(normalizedSession, activeScreen);
  const questions = buildQuestionCards(resolvedRequiredActions, progress.currentStep);

  return {
    onboardingViewState: {
      viewStateId: `onboarding-view:${normalizedSession.sessionId ?? normalizedSession.projectDraftId ?? "unknown"}`,
      activeScreen,
      currentStep: progress.currentStep,
      nextStep: progress.nextStep,
      screens,
      questions,
      autosave,
      resumeState: progress.resumeState,
      summary: buildSummary(activeScreen, progress, screens),
    },
  };
}
