import { createAdaptiveOnboardingAgentContract } from "../../shared/adaptive-onboarding-agent-contract.js";

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
  const totalQuestions = Number(onboardingConversation?.totalQuestions ?? (currentIndex + 1));
  return `שאלה ${currentIndex + 1} במסלול אדפטיבי · עד ${Math.max(totalQuestions, currentIndex + 1)} צעדים כרגע`;
}

function resolveProviderRuntime({ onboardingConversation = null, onboardingFlow = null } = {}) {
  return normalizeObject(
    onboardingConversation?.providerRuntime
      ?? onboardingFlow?.providerRuntime
      ?? null,
  );
}

export function buildSmartOnboardingViewModel({
  currentProject = null,
  onboardingFlow = null,
  onboardingConversation = null,
} = {}) {
  const projectName = resolveProjectName({ currentProject, onboardingFlow });
  const summary = normalizeObject(onboardingConversation?.summary);
  const adaptiveOnboardingAgentContract = normalizeObject(
    currentProject?.adaptiveOnboardingAgentContract
      ?? createAdaptiveOnboardingAgentContract({
        projectIntake: currentProject?.projectIntake ?? onboardingFlow?.projectIntake ?? null,
        onboardingConversation,
        onboardingCompletionDecision: currentProject?.onboardingCompletionDecision ?? null,
        onboardingStateHandoff: currentProject?.onboardingStateHandoff ?? null,
        artifactExpectation: currentProject?.artifactExpectation ?? currentProject?.onboardingStateHandoff?.artifactExpectation ?? null,
      }).adaptiveOnboardingAgentContract,
  );
  const providerRuntime = resolveProviderRuntime({ onboardingConversation, onboardingFlow });

  return {
    title: "רוצה להבין את הפרויקט שלך",
    statusMessage: resolveStatusMessage({ onboardingConversation, summary }),
    projectName,
    progressLabel: resolveProgressLabel({ onboardingConversation }),
    questionTitle: resolveQuestionTitle({ onboardingConversation }),
    questionBody: resolveQuestionBody({ onboardingConversation }),
    answerDraft: onboardingConversation?.draftAnswer ?? "",
    isUnderstandingMode: onboardingConversation?.isComplete === true,
    providerRuntime: {
      selectedProviderId: providerRuntime.selectedProviderId ?? "openai",
      selectedProviderLabel: providerRuntime.selectedProviderLabel ?? "OpenAI",
      selectedRuntimeLabel: providerRuntime.selectedRuntimeLabel ?? "Provider-backed onboarding runtime",
      canonicalRuleLayer: providerRuntime.canonicalRuleLayer ?? "nexus-onboarding-rules-v1",
      summaryLine: providerRuntime.summaryLine ?? "בחירת provider עדיין לא פתחה runtime חי.",
      enforcementLine: providerRuntime.enforcementLine ?? "Nexus עדיין שומרת על כללי intake אחידים מעל כל provider.",
      availableProviders: Array.isArray(providerRuntime.availableProviders) ? providerRuntime.availableProviders : [],
      runtimeMode: providerRuntime.runtimeMode ?? "local",
    },
    summary: {
      understood: Array.isArray(summary.understoodItems) ? summary.understoodItems : [],
      missing: Array.isArray(summary.missingItems) ? summary.missingItems : [],
    },
    adaptiveOnboardingAgentContract: {
      statusLabel: adaptiveOnboardingAgentContract.statusLabel ?? "ה־adaptive intake agent מוגדר עכשיו כחוזה קנוני אחד",
      contractRule: adaptiveOnboardingAgentContract.contractRule ?? "",
      currentProjectTypeLabel: adaptiveOnboardingAgentContract.currentProjectTypeLabel ?? "סוג הפרויקט עדיין מתחדד",
      currentQuestionPathLabel: adaptiveOnboardingAgentContract.currentQuestionPathLabel ?? "target-audience -> active-question",
      handoffStatus: adaptiveOnboardingAgentContract.handoffStatus ?? "needs-clarification",
      readinessLevel: adaptiveOnboardingAgentContract.readinessLevel ?? "blocked",
      behaviors: Array.isArray(adaptiveOnboardingAgentContract.behaviors) ? adaptiveOnboardingAgentContract.behaviors : [],
      explicitProhibitions: Array.isArray(adaptiveOnboardingAgentContract.explicitProhibitions)
        ? adaptiveOnboardingAgentContract.explicitProhibitions
        : [],
    },
  };
}
