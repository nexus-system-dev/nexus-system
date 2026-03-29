function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferMissingInputs(projectIntake) {
  const missingInputs = [];

  if (typeof projectIntake.visionText !== "string" || !projectIntake.visionText.trim()) {
    missingInputs.push("vision");
  }
  if (typeof projectIntake.projectName !== "string" || !projectIntake.projectName.trim()) {
    missingInputs.push("project-name");
  }
  if (
    normalizeArray(projectIntake.uploadedFiles).length === 0
    && normalizeArray(projectIntake.externalLinks).length === 0
  ) {
    missingInputs.push("supporting-material");
  }

  return missingInputs;
}

function buildClarificationPrompts(missingInputs, projectType, requiredActions) {
  const prompts = [];

  for (const field of missingInputs) {
    if (field === "vision") {
      prompts.push("הזן תיאור קצר של מה אתה רוצה לבנות");
    } else if (field === "project-name") {
      prompts.push("תן שם לפרויקט");
    } else if (field === "supporting-material") {
      prompts.push("העלה איפיון, קבצים או קישור חיצוני");
    }
  }

  if (projectType === "unknown") {
    prompts.push("חדד איזה סוג פרויקט אתה בונה");
  }

  for (const action of normalizeArray(requiredActions)) {
    if (typeof action === "string" && action.trim() && !prompts.includes(action.trim())) {
      prompts.push(action.trim());
    }
  }

  return prompts;
}

function resolveReadinessLevel(missingInputs, requiresClarification) {
  if (!requiresClarification) {
    return "ready";
  }
  if (missingInputs.length <= 1) {
    return "almost-ready";
  }
  return "blocked";
}

export function createOnboardingCompletionEvaluator({
  projectIntake = null,
  onboardingSession = null,
} = {}) {
  const normalizedIntake = normalizeObject(projectIntake);
  const normalizedSession = normalizeObject(onboardingSession);
  const missingInputs = inferMissingInputs(normalizedIntake);
  const projectType = normalizedIntake.projectType ?? "unknown";
  const clarificationPrompts = buildClarificationPrompts(
    missingInputs,
    projectType,
    normalizedSession.requiredActions,
  );
  const requiresClarification = missingInputs.length > 0 || projectType === "unknown";
  const isComplete = requiresClarification === false;
  const readinessLevel = resolveReadinessLevel(missingInputs, requiresClarification);
  const nextAction = isComplete ? "build-project-state" : "collect-clarification";

  return {
    onboardingCompletionDecision: {
      decisionId: `onboarding-completion:${normalizedSession.sessionId ?? normalizedSession.projectDraftId ?? "unknown"}`,
      isComplete,
      requiresClarification,
      readinessLevel,
      missingInputs,
      clarificationPrompts,
      nextAction,
      summary: {
        canCreateProjectState: isComplete,
        missingInputCount: missingInputs.length,
        hasSupportingMaterial:
          normalizeArray(normalizedIntake.uploadedFiles).length > 0
          || normalizeArray(normalizedIntake.externalLinks).length > 0,
        projectTypeResolved: projectType !== "unknown",
      },
    },
  };
}
