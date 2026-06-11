import { createAdaptiveOnboardingAgentContract } from "../../shared/adaptive-onboarding-agent-contract.js";
import {
  resolveHumanContractStatusLabel,
  resolveHumanConversationPathLabel,
  resolveHumanVisibleRuntimeShellLine,
} from "../../shared/live-conversation-tone-contract.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function resolveConversationGateLabel({ handoffStatus = "", readinessLevel = "" } = {}) {
  if (handoffStatus === "ready" && (readinessLevel === "ready" || readinessLevel === "ready-with-supporting-material-gap")) {
    return "יש לי כבר תמונה מספיק ברורה כדי להתקדם.";
  }
  return "אני עוד לא סוגר, כי יש עוד נקודה אחת שחשוב לי להבין יותר טוב.";
}

function resolveConversationPathLabel(pathLabel = "") {
  return resolveHumanConversationPathLabel(pathLabel);
}

function resolveContractStatusLabel(statusLabel = "") {
  return resolveHumanContractStatusLabel(statusLabel);
}

function resolveProjectTypeContextLabel(projectTypeLabel = "") {
  if (typeof projectTypeLabel === "string" && projectTypeLabel.trim()) {
    return `כרגע זה נראה לי כמו ${projectTypeLabel.trim()}`;
  }
  return "אני עדיין מדייק איזה סוג מוצר זה באמת.";
}

function resolveRuntimeLabel(runtimeLabel = "", providerLabel = "") {
  if (typeof runtimeLabel === "string" && runtimeLabel.trim() && !/onboarding runtime/i.test(runtimeLabel)) {
    return runtimeLabel.trim();
  }
  return providerLabel ? `כרגע אני ממשיך איתך דרך ${providerLabel}` : "כרגע אני ממשיך איתך עם מה שפעיל כאן";
}

function resolveEnforcementLine(line = "") {
  if (typeof line === "string" && line.trim() && !/class gates|handoff|readiness|bounded|provider|runtime/i.test(line)) {
    return line.trim();
  }
  return "גם אם משהו מתחלף מאחורי הקלעים, אני לא מתקדם לפני שהתמונה באמת ברורה.";
}

function resolveVisibleRuntimeShellLine(providerRuntime = {}) {
  return resolveHumanVisibleRuntimeShellLine(normalizeObject(providerRuntime));
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
  const providerRuntime = normalizeObject(onboardingConversation?.providerRuntime);
  if (onboardingConversation?.pendingAdvance) {
    return "אני רגע מחדד את מה שכתבת כדי לשאול את הדבר הכי חשוב עכשיו.";
  }

  if (providerRuntime.healthStatus === "degraded") {
    return "יש כרגע עיכוב קטן ברקע, אבל אני ממשיך איתך מאותה נקודה.";
  }

  if (onboardingConversation?.isComplete) {
    return `יש לי כבר תמונה טובה של ${projectTypeLabel}. עכשיו בודקים שהסיכום באמת יושב נכון לפני שממשיכים.`;
  }

  return `אני כאן כדי להבין לעומק את ${projectTypeLabel} ואת מה שבאמת צריך לקרות בו.`;
}

function resolveQuestionTitle({ onboardingConversation = null } = {}) {
  return onboardingConversation?.currentQuestion?.title ?? "בוא נתחיל להבין את הפרויקט שלך";
}

function resolveQuestionBody({ onboardingConversation = null } = {}) {
  if (onboardingConversation?.pendingAdvance) {
    return "עוד רגע אני חוזר עם השאלה שהכי תקדם את ההבנה שלנו.";
  }

  const rawReason = typeof onboardingConversation?.currentQuestion?.reason === "string"
    ? onboardingConversation.currentQuestion.reason.trim()
    : "";
  if (rawReason) {
    if (/השאלה הזו סוגרת את הפער/u.test(rawReason)) {
      const questionId = onboardingConversation?.currentQuestion?.id ?? "";
      if (questionId === "target-audience") {
        return "אני מתחיל מהאדם שבאמת צריך את זה, כדי להבין עבור מי המוצר הזה נבנה.";
      }
      if (questionId === "core-problem") {
        return "אני רוצה להבין מה הכי נשבר או מעכב היום, כדי לא להישאר עם תיאור כללי מדי.";
      }
      if (questionId === "workflow-detail") {
        return "אני רוצה להבין איך זה עובד בפועל בתוך רגע אמיתי של עבודה, לא רק ברמת הרעיון.";
      }
      if (questionId === "build-direction") {
        return "אני רוצה להבין מה חייב להיות ברור למשתמש מיד כשהוא פותח את המוצר.";
      }
      return "אני שואל את זה כדי להבין את המוצר שלך יותר לעומק, בלי לקפוץ מוקדם מדי לפתרון.";
    }
    return rawReason;
  }

  if (typeof onboardingConversation?.completionReason === "string" && onboardingConversation.completionReason.trim()) {
    return onboardingConversation.completionReason.trim();
  }

  return onboardingConversation?.currentQuestion?.title ?? "ספר לי מי קהל היעד, מה הבעיה, ואיך נראה פתרון מוצלח מבחינתך.";
}

function resolveProgressLabel({ onboardingConversation = null } = {}) {
  if (onboardingConversation?.isComplete) {
    return "התמונה כבר די סגורה";
  }

  const currentIndex = Number(onboardingConversation?.currentIndex ?? 0);
  return `שאלה ${currentIndex + 1} · נשארים על זה עד שהתמונה באמת ברורה`;
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
  const derivedAdaptiveOnboardingAgentContract = normalizeObject(
    createAdaptiveOnboardingAgentContract({
      projectIntake: currentProject?.projectIntake ?? onboardingFlow?.projectIntake ?? null,
      onboardingConversation,
      onboardingCompletionDecision: currentProject?.onboardingCompletionDecision ?? null,
      onboardingStateHandoff: currentProject?.onboardingStateHandoff ?? null,
      artifactExpectation: currentProject?.artifactExpectation ?? currentProject?.onboardingStateHandoff?.artifactExpectation ?? null,
    }).adaptiveOnboardingAgentContract,
  );
  const adaptiveOnboardingAgentContract = normalizeObject(
    derivedAdaptiveOnboardingAgentContract.contractId
      ? derivedAdaptiveOnboardingAgentContract
      : currentProject?.adaptiveOnboardingAgentContract,
  );
  const normalizedAdaptiveGate = adaptiveOnboardingAgentContract;
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
      selectedRuntimeLabel: resolveRuntimeLabel(providerRuntime.selectedRuntimeLabel, providerRuntime.selectedProviderLabel ?? "OpenAI"),
      selectedModelFamilyId: providerRuntime.selectedModelFamilyId ?? "balanced",
      selectedModelLabel: providerRuntime.selectedModelLabel ?? "מאוזן",
      selectedRuntimeModelId: providerRuntime.selectedRuntimeModelId ?? null,
      selectedIntelligenceLevel: providerRuntime.selectedIntelligenceLevel ?? "medium",
      selectedIntelligenceLabel: providerRuntime.selectedIntelligenceLabel ?? "בינונית",
      canonicalRuleLayer: providerRuntime.canonicalRuleLayer ?? "nexus-onboarding-rules-v1",
      summaryLine: providerRuntime.summaryLine ?? "עדיין לא נבחר מודל חי שמוביל את השיחה.",
      visibleShellLine: resolveVisibleRuntimeShellLine(providerRuntime),
      enforcementLine: resolveEnforcementLine(providerRuntime.enforcementLine),
      accountingLine: providerRuntime.accountingLine ?? "",
      availabilityLine: providerRuntime.availabilityLine ?? "",
      operatorTruthLine: providerRuntime.operatorTruthLine ?? "",
      tradeoffLine: providerRuntime.tradeoffLine ?? "",
      healthStatus: providerRuntime.healthStatus ?? "standby",
      availableProviders: Array.isArray(providerRuntime.availableProviders) ? providerRuntime.availableProviders : [],
      availableModelFamilies: Array.isArray(providerRuntime.availableModelFamilies) ? providerRuntime.availableModelFamilies : [],
      availableIntelligenceLevels: Array.isArray(providerRuntime.availableIntelligenceLevels) ? providerRuntime.availableIntelligenceLevels : [],
      runtimeMode: providerRuntime.runtimeMode ?? "local",
    },
    summary: {
      understood: Array.isArray(summary.understoodItems) ? summary.understoodItems : [],
      missing: Array.isArray(summary.missingItems) ? summary.missingItems : [],
    },
    adaptiveOnboardingAgentContract: {
      statusLabel: resolveContractStatusLabel(normalizedAdaptiveGate.statusLabel),
      contractRule: normalizedAdaptiveGate.contractRule ?? "",
      currentProjectTypeLabel: resolveProjectTypeContextLabel(normalizedAdaptiveGate.currentProjectTypeLabel),
      currentQuestionPathLabel: resolveConversationPathLabel(normalizedAdaptiveGate.currentQuestionPathLabel),
      handoffStatus: normalizedAdaptiveGate.handoffStatus ?? "needs-clarification",
      readinessLevel: normalizedAdaptiveGate.readinessLevel ?? "blocked",
      gateLabel: resolveConversationGateLabel({
        handoffStatus: normalizedAdaptiveGate.handoffStatus ?? "needs-clarification",
        readinessLevel: normalizedAdaptiveGate.readinessLevel ?? "blocked",
      }),
      behaviors: Array.isArray(normalizedAdaptiveGate.behaviors) ? normalizedAdaptiveGate.behaviors : [],
      explicitProhibitions: Array.isArray(normalizedAdaptiveGate.explicitProhibitions)
        ? normalizedAdaptiveGate.explicitProhibitions
        : [],
    },
  };
}
