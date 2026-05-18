function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolveProjectTypeLabel(summary = {}) {
  return typeof summary.projectTypeLabel === "string" && summary.projectTypeLabel.trim()
    ? summary.projectTypeLabel.trim()
    : "הפרויקט";
}

function resolveProjectName({ currentProject = null, onboardingFlow = null } = {}) {
  return currentProject?.name ?? onboardingFlow?.projectName ?? "";
}

function resolveStatusMessage({ onboardingConversation = null, summary = {} } = {}) {
  const projectTypeLabel = resolveProjectTypeLabel(summary);
  if (onboardingConversation?.pendingAdvance) {
    return "ה־AI מעבד את מה שכתבת וממשיך לחדד את ההבנה של הפרויקט.";
  }

  if (onboardingConversation?.isComplete) {
    return `השלמנו את השיחה עבור ${projectTypeLabel}. עכשיו בודקים את סיכום ההבנה לפני שממשיכים ללופ.`;
  }

  return `כמה שאלות קצרות שיעזרו לי להבין טוב יותר את ${projectTypeLabel} ואת ההקשר שלו.`;
}

function resolveQuestionTitle({ onboardingConversation = null } = {}) {
  return onboardingConversation?.currentQuestion?.title ?? "בוא נתחיל להבין את הפרויקט שלך";
}

function resolveQuestionBody({ onboardingConversation = null } = {}) {
  if (onboardingConversation?.pendingAdvance) {
    return "עוד רגע תופיע השאלה הבאה לפי מה שכתבת.";
  }

  if (typeof onboardingConversation?.currentQuestion?.reason === "string" && onboardingConversation.currentQuestion.reason.trim()) {
    return onboardingConversation.currentQuestion.reason.trim();
  }

  if (typeof onboardingConversation?.completionReason === "string" && onboardingConversation.completionReason.trim()) {
    return onboardingConversation.completionReason.trim();
  }

  return onboardingConversation?.currentQuestion?.title ?? "ספר לי מי קהל היעד, מה הבעיה, ואיך נראה פתרון מוצלח מבחינתך.";
}

function resolveProgressLabel({ onboardingConversation = null } = {}) {
  if (onboardingConversation?.isComplete) {
    return "השיחה הושלמה";
  }

  const currentIndex = Number(onboardingConversation?.currentIndex ?? 0);
  const totalQuestions = Number(onboardingConversation?.totalQuestions ?? 3);
  return `שאלה ${currentIndex + 1} מתוך ${Math.max(totalQuestions, currentIndex + 1)}`;
}

export function buildSmartOnboardingViewModel({
  currentProject = null,
  onboardingFlow = null,
  onboardingConversation = null,
} = {}) {
  const projectName = resolveProjectName({ currentProject, onboardingFlow });
  const summary = normalizeObject(onboardingConversation?.summary);

  return {
    title: "רוצה להבין את הפרויקט שלך",
    statusMessage: resolveStatusMessage({ onboardingConversation, summary }),
    projectName,
    progressLabel: resolveProgressLabel({ onboardingConversation }),
    questionTitle: resolveQuestionTitle({ onboardingConversation }),
    questionBody: resolveQuestionBody({ onboardingConversation }),
    answerDraft: onboardingConversation?.draftAnswer ?? "",
    isUnderstandingMode: onboardingConversation?.isComplete === true,
    summary: {
      understood: Array.isArray(summary.understoodItems) ? summary.understoodItems : [],
      missing: Array.isArray(summary.missingItems) ? summary.missingItems : [],
    },
  };
}
