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

function resolveConversationAnswers(onboardingSession) {
  return normalizeObject(onboardingSession?.conversation?.answers);
}

function hasSufficientUnderstanding({ projectType, answers }) {
  const audience = typeof answers["target-audience"] === "string" ? answers["target-audience"].trim() : "";
  const problem = typeof answers["core-problem"] === "string" ? answers["core-problem"].trim() : "";
  const solution = typeof answers["successful-solution"] === "string" ? answers["successful-solution"].trim() : "";

  if (!audience || !problem) {
    return false;
  }

  if (projectType === "landing-page") {
    return true;
  }

  return Boolean(solution);
}

function resolveContinuationGate({ projectType, supportingMaterialDeferred }) {
  if (!supportingMaterialDeferred) {
    return null;
  }

  if (projectType === "landing-page") {
    return {
      gateType: "supporting-material",
      status: "continue-with-supporting-material-gap",
      title: "אפשר להמשיך ללופ, אבל כדאי לצרף חומר תומך לשכבת האמון",
      detail: "ההבנה כבר מספיקה כדי לקדם דף נחיתה. אם תצרף קישור, מסמך או דוגמה קיימת, Nexus יוכל לדייק יותר את ההבטחה והוכחות האמון בלי לעצור את ההתקדמות.",
      requestedMaterialLabel: "קישור לעמוד קיים, מסמך מוצר, או עוגני אמון שיווקיים",
    };
  }

  if (projectType === "mobile-app") {
    return {
      gateType: "supporting-material",
      status: "continue-with-supporting-material-gap",
      title: "אפשר להמשיך ללופ, אבל חומר תומך יחזק את הדיוק של הזרימה הניידת",
      detail: "ההבנה כבר מספיקה כדי לקדם את זרימת המובייל. אם תצרף מסך קיים, spec או קישור רלוונטי, Nexus ידייק יותר את המסך הראשון והפעולה הראשונה בלי לעצור את ההתקדמות.",
      requestedMaterialLabel: "מסכים קיימים, spec למובייל, או קישור שמדגים את הזרימה הרצויה",
    };
  }

  return {
    gateType: "supporting-material",
    status: "continue-with-supporting-material-gap",
    title: "אפשר להמשיך ללופ, ועדיין כדאי לצרף חומר תומך",
    detail: "ההבנה כבר מספיקה כדי להמשיך. קישור, מסמך או דוגמה יחזקו את הדיוק של המשימה הבאה בלי לעצור את ה־handoff.",
    requestedMaterialLabel: "קישור, מסמך, או דוגמה רלוונטית לפרויקט",
  };
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

function resolveCompletionStatus(requiresClarification) {
  return requiresClarification ? "needs-clarification" : "completed";
}

export function createOnboardingCompletionEvaluator({
  projectIntake = null,
  onboardingSession = null,
} = {}) {
  const normalizedIntake = normalizeObject(projectIntake);
  const normalizedSession = normalizeObject(onboardingSession);
  const rawMissingInputs = inferMissingInputs(normalizedIntake);
  const projectType = normalizedIntake.projectType ?? "unknown";
  const answers = resolveConversationAnswers(normalizedSession);
  const supportingMaterialDeferred = rawMissingInputs.length === 1
    && rawMissingInputs[0] === "supporting-material"
    && projectType !== "unknown"
    && hasSufficientUnderstanding({ projectType, answers });
  const missingInputs = supportingMaterialDeferred
    ? rawMissingInputs.filter((field) => field !== "supporting-material")
    : rawMissingInputs;
  const clarificationPrompts = buildClarificationPrompts(
    missingInputs,
    projectType,
    normalizedSession.requiredActions,
  );
  const requiresClarification = missingInputs.length > 0 || projectType === "unknown";
  const isComplete = requiresClarification === false;
  const readinessLevel = supportingMaterialDeferred
    ? "ready-with-supporting-material-gap"
    : resolveReadinessLevel(missingInputs, requiresClarification);
  const completionStatus = resolveCompletionStatus(requiresClarification);
  const nextAction = isComplete
    ? (supportingMaterialDeferred
        ? "build-project-state-with-supporting-material-gate"
        : "build-project-state")
    : "collect-clarification";
  const primaryBlockingReason = clarificationPrompts[0] ?? null;
  const continuationGate = resolveContinuationGate({ projectType, supportingMaterialDeferred });

  return {
    onboardingCompletionDecision: {
      decisionId: `onboarding-completion:${normalizedSession.sessionId ?? normalizedSession.projectDraftId ?? "unknown"}`,
      isComplete,
      requiresClarification,
      readinessLevel,
      completionStatus,
      missingInputs: rawMissingInputs,
      clarificationPrompts,
      primaryBlockingReason,
      nextAction,
      supportingMaterialDeferred,
      continuationGate,
      summary: {
        canCreateProjectState: isComplete,
        missingInputCount: rawMissingInputs.length,
        hasSupportingMaterial:
          normalizeArray(normalizedIntake.uploadedFiles).length > 0
          || normalizeArray(normalizedIntake.externalLinks).length > 0,
        supportingMaterialDeferred,
        projectTypeResolved: projectType !== "unknown",
      },
    },
  };
}
