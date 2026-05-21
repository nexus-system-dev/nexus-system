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

function hasWeakProblemLength(value = "") {
  const words = normalizeString(value).split(/\s+/).filter(Boolean);
  return words.length < 4;
}

function isGenericAudienceAnswer(value = "") {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) {
    return false;
  }

  return hasGenericBusinessPhrase(normalized)
    || /for (a |the )?business/i.test(normalized)
    || /(?:ל|עבור)עסק$/u.test(normalized)
    || /(?:ל|עבור)חברה$/u.test(normalized)
    || /for customers$/i.test(normalized)
    || /^customers$/i.test(normalized);
}

function isGenericProblemAnswer(value = "") {
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
    return "הלמידה עוצרת תשובות חלשות ומכריחה clarify לפני handoff";
  }
  if (strategy === "stabilize-before-build") {
    return "הלמידה מחזיקה את ה־onboarding על בסיס יציב לפני build";
  }
  return "הלמידה בודקת שהשיחה חדה מספיק לפני מעבר ל־generation";
}

function resolveLearningReason({
  clarificationMode = null,
  requiresLandingSolution = false,
  projectType = "unknown",
  learningContext = null,
} = {}) {
  const context = normalizeObject(learningContext);
  if (clarificationMode === "generic-audience") {
    return "הלמידה זיהתה שתשובות כמו 'עסק' או 'מערכת לעסק' יוצרות generation גנרי, ולכן Nexus עוצרת ומכריחה לחדד סוג עסק, משתמש ו-workflow.";
  }
  if (clarificationMode === "generic-problem") {
    return "הלמידה זיהתה שתיאורי כאב כלליים לא מספיקים כדי לכוון build אמיתי, ולכן Nexus עוצרת ומכריחה לתאר מה נשבר בפועל, אצל מי ובאיזה רגע.";
  }
  if (requiresLandingSolution && projectType === "landing-page") {
    return context.signalSource === "stored-learning"
      ? "כשלונות, friction, או retry patterns קודמים מראים שבדף נחיתה אי אפשר לעצור רק בקהל ובכאב; צריך לחדד גם איך נראה דף שממיר באמת."
      : "Nexus מחזיקה את דף הנחיתה לעוד שאלה כדי לא לשחרר generation עם הבטחה כללית מדי.";
  }
  return context.signalSource === "stored-learning"
    ? "הלמידה כבר משנה את השאלה הבאה ואת readiness gate לפי outcome patterns קודמים."
    : "חוקי ה־intake נשארים חדים כדי למנוע progression מוקדם מדי.";
}

export function resolveCanonicalOnboardingAnswers(answers = {}) {
  const normalizedAnswers = normalizeObject(answers);
  const rawAudience = normalizeString(normalizedAnswers["target-audience"]);
  const refinedAudience = normalizeString(normalizedAnswers["audience-clarification"]);
  const rawProblem = normalizeString(normalizedAnswers["core-problem"]);
  const refinedProblem = normalizeString(normalizedAnswers["problem-clarification"]);

  return {
    rawAudience,
    refinedAudience,
    audience: refinedAudience || rawAudience,
    rawProblem,
    refinedProblem,
    problem: refinedProblem || rawProblem,
    solution: normalizeString(normalizedAnswers["successful-solution"]),
    projectClassAnswer: normalizeString(normalizedAnswers["project-class"]),
  };
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
  learningContext = null,
} = {}) {
  if (!audience || !problem) {
    return false;
  }

  const context = normalizeObject(learningContext);
  if (projectType === "landing-page" && context.forceLandingSolution !== true) {
    return true;
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
  const weakAudience = Boolean(canonicalAnswers.rawAudience)
    && !canonicalAnswers.refinedAudience
    && isGenericAudienceAnswer(canonicalAnswers.rawAudience);
  const weakProblem = Boolean(canonicalAnswers.rawProblem)
    && !canonicalAnswers.refinedProblem
    && isGenericProblemAnswer(canonicalAnswers.rawProblem);
  const requiresLandingSolution = projectType === "landing-page" && context.forceLandingSolution === true;

  const questionPlan = ["target-audience"];
  if (weakAudience) {
    questionPlan.push("audience-clarification");
  }
  if (canonicalAnswers.audience && isAmbiguous && !canonicalAnswers.projectClassAnswer) {
    questionPlan.push("project-class");
  }
  if (canonicalAnswers.audience) {
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

  let nextQuestionId = null;
  let clarificationMode = null;

  if (!canonicalAnswers.rawAudience) {
    nextQuestionId = "target-audience";
  } else if (weakAudience) {
    nextQuestionId = "audience-clarification";
    clarificationMode = "generic-audience";
  } else if (canonicalAnswers.audience && isAmbiguous && !canonicalAnswers.projectClassAnswer) {
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
    learningContext: context,
  })) {
    nextQuestionId = "successful-solution";
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
    readinessLine: nextQuestionId === null
      ? "הלמידה מאשרת שיש מספיק חומר כדי לעבור ל־Understanding ולחזק את ה־generation handoff."
      : clarificationMode
        ? "הלמידה חוסמת progression מוקדם מדי ודורשת הבהרה חדה יותר לפני handoff."
        : requiresLandingSolution && projectType === "landing-page"
          ? "הלמידה משאירה את ה־Landing page בעוד סבב כדי לא לעבור ל־generation עם הבטחה חלשה."
          : "ה־intake נשאר פתוח עד שהשאלה הבאה תסגור את הפער המרכזי שחסר.",
    handoffStrengthLine: requiresLandingSolution && projectType === "landing-page"
      ? "ה־handoff ל־generation יכלול גם את צורת ההבטחה, האמון וה־CTA במקום לעצור רק בקהל ובכאב."
      : clarificationMode
        ? "ה־handoff ל־generation יישאר חסום עד שנקבל תשובה מספיק חדה כדי לבנות בלי drift."
        : "ה־handoff הבא יישאר צמוד למה שנלמד בשיחה במקום לשחזר brief גנרי downstream.",
  };
}
