function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveProjectTypeLabel(projectType) {
  if (projectType === "landing-page") {
    return "דף נחיתה / שיווק";
  }
  if (projectType === "commerce-ops") {
    return "מערכת מסחר ותפעול";
  }
  if (projectType === "internal-tool") {
    return "כלי פנימי";
  }
  if (projectType === "saas") {
    return "מוצר SaaS / follow-up";
  }
  if (projectType === "mobile-app") {
    return "אפליקציה";
  }
  return "סוג הפרויקט עדיין מתחדד";
}

function createBehavior({
  behaviorId,
  label,
  status,
  currentEffect,
  nextRequirement,
} = {}) {
  return {
    behaviorId,
    label,
    status: normalizeString(status, "next"),
    currentEffect: normalizeString(currentEffect, "the current product surface does not prove this behavior yet"),
    nextRequirement: normalizeString(
      nextRequirement,
      "later implementation must make this behavior stronger and visibly verifiable inside Nexus",
    ),
  };
}

function summarizeBehaviors(behaviors = []) {
  return normalizeArray(behaviors).reduce((summary, behavior) => {
    if (behavior.status === "live") {
      summary.live += 1;
    } else if (behavior.status === "partial") {
      summary.partial += 1;
    } else {
      summary.next += 1;
    }
    return summary;
  }, { live: 0, partial: 0, next: 0 });
}

function resolveProjectType({
  artifactExpectation = null,
  onboardingStateHandoff = null,
  onboardingCompletionDecision = null,
  projectIntake = null,
  onboardingConversation = null,
} = {}) {
  const expectation = normalizeObject(artifactExpectation);
  const handoff = normalizeObject(onboardingStateHandoff);
  const decision = normalizeObject(onboardingCompletionDecision);
  const intake = normalizeObject(projectIntake);
  const summary = normalizeObject(onboardingConversation?.summary);

  const summaryProjectType = normalizeString(summary.projectType);
  if (summaryProjectType) {
    return summaryProjectType;
  }

  if (onboardingConversation?.isComplete === true || decision.summary?.projectTypeResolved === true) {
    return normalizeString(
      handoff.projectIntake?.projectType,
      normalizeString(
        intake.projectType,
        normalizeString(
          expectation.projectType,
          "resolved",
        ),
      ),
    );
  }

  return "unknown";
}

function resolveQuestionPath({
  projectType,
  currentQuestionId = null,
  isComplete = false,
  summary = null,
} = {}) {
  const normalizedSummary = normalizeObject(summary);
  const learnedPath = normalizeArray(normalizedSummary.learnedQuestionPath);
  if (learnedPath.length > 0) {
    return [...learnedPath, isComplete ? "understanding-handoff" : "active-question"];
  }

  const path = ["core-idea", "target-audience"];
  const requiresClassClarification = currentQuestionId === "project-class" || projectType === "unknown";
  const requiresSolution = projectType !== "landing-page";

  if (requiresClassClarification) {
    path.push("project-class");
  }

  path.push("core-problem");

  if (requiresSolution) {
    path.push("successful-solution");
  }

  path.push("build-direction");

  path.push(isComplete ? "understanding-handoff" : "active-question");
  return path;
}

export function createAdaptiveOnboardingAgentContract({
  projectIntake = null,
  onboardingConversation = null,
  onboardingCompletionDecision = null,
  onboardingStateHandoff = null,
  artifactExpectation = null,
} = {}) {
  const intake = normalizeObject(projectIntake);
  const conversation = normalizeObject(onboardingConversation);
  const decision = normalizeObject(onboardingCompletionDecision);
  const handoff = normalizeObject(onboardingStateHandoff);
  const expectation = normalizeObject(artifactExpectation);
  const summary = normalizeObject(conversation.summary);
  const currentQuestion = normalizeObject(conversation.currentQuestion);

  const handoffReady = normalizeString(handoff.handoffStatus, "needs-clarification");
  const readinessLevel = normalizeString(decision.readinessLevel, handoffReady === "ready" ? "ready" : "blocked");
  const projectType = resolveProjectType({
    artifactExpectation: expectation,
    onboardingStateHandoff: handoff,
    onboardingCompletionDecision: decision,
    projectIntake: intake,
    onboardingConversation: conversation,
  });
  const projectTypeLabel = resolveProjectTypeLabel(projectType);
  const canOpenUnderstandingHandoff = (
    (conversation.isComplete === true || decision.isComplete === true)
    && handoffReady === "ready"
    && (readinessLevel === "ready" || readinessLevel === "ready-with-supporting-material-gap")
  );
  const currentQuestionPath = resolveQuestionPath({
    projectType,
    currentQuestionId: currentQuestion.id,
    isComplete: canOpenUnderstandingHandoff,
    summary,
  });
  const canExplainBranching = Boolean(currentQuestion.id || summary.projectType || expectation.projectType);
  const hasClarificationSignals = normalizeArray(summary.missingItems).length > 0 || normalizeArray(decision.clarificationPrompts).length > 0;
  const learningGuidedSelection = normalizeString(summary.learningStatus) === "live";
  const weakAnswerDetectionLive = learningGuidedSelection && normalizeString(summary.learningReason);

  const behaviors = [
    createBehavior({
      behaviorId: "class-aware-branching",
      label: "class-aware branching",
      status: canExplainBranching ? "live" : "partial",
      currentEffect: canExplainBranching
        ? `The intake path already branches around ${projectTypeLabel} instead of forcing one generic script for every product class.`
        : "The onboarding flow is bounded, but class-aware branching is not yet explicit enough in the current state.",
      nextRequirement: "Later live proofs must show different classes receiving different visible questioning paths on the same onboarding surface.",
    }),
    createBehavior({
      behaviorId: "learning-guided-question-selection",
      label: "learning-guided question selection",
      status: learningGuidedSelection ? "live" : "partial",
      currentEffect: learningGuidedSelection
        ? normalizeString(
            summary.learningReason,
            "Stored learning signals now influence which onboarding question appears next and when Nexus blocks premature progression.",
          )
        : "The onboarding flow is adaptive, but the active state does not yet prove that stored learning signals are choosing the next question.",
      nextRequirement: "Later live proofs must show stored learning signals changing the visible question path on the same onboarding route.",
    }),
    createBehavior({
      behaviorId: "weak-answer-detection",
      label: "weak / generic answer detection",
      status: weakAnswerDetectionLive ? "live" : "partial",
      currentEffect: weakAnswerDetectionLive
        ? normalizeString(
            summary.learningReason,
            "Weak or generic answers now trigger a sharper clarification loop before the handoff can advance.",
          )
        : "Nexus already catches ambiguity and missing understanding, but weak-answer quality scoring is not yet a fully closed live behavior.",
      nextRequirement: weakAnswerDetectionLive
        ? "Later live proofs must keep blocking weak answers without silently resetting to generic progression."
        : "Later implementation must classify weak or generic answers explicitly and trigger stronger clarification visibly.",
    }),
    createBehavior({
      behaviorId: "clarity-refinement",
      label: "clarity refinement",
      status: hasClarificationSignals ? "live" : "partial",
      currentEffect: hasClarificationSignals
        ? "The next question is already chosen to reduce the most important missing understanding area."
        : "Refinement is bounded by the current question path, but the active state does not show a new clarification need right now.",
      nextRequirement: "Later implementation must keep refinement specific and avoid repeating low-information prompts.",
    }),
    createBehavior({
      behaviorId: "sufficiency-gate",
      label: "sufficiency gate",
      status: decision.decisionId ? "live" : "partial",
      currentEffect: decision.decisionId
        ? `Onboarding already exposes a readiness gate with \`${readinessLevel}\` truth before the handoff can advance.`
        : "The current route shows the conversation, but the sufficiency gate is not yet attached to a resolved completion decision.",
      nextRequirement: "Later live proofs must show that the agent stops only when understanding is sufficient for credible downstream steering.",
    }),
    createBehavior({
      behaviorId: "bounded-handoff",
      label: "bounded handoff into generation",
      status: handoff.handoffId ? "live" : "partial",
      currentEffect: handoff.handoffId
        ? `The intake already resolves one canonical handoff with \`${handoffReady}\` truth instead of leaking into informal summaries.`
        : "The route still needs a canonical handoff object before the generation side can claim stronger intake truth.",
      nextRequirement: "Later generation must reuse this handoff payload instead of rebuilding weaker generic intent downstream.",
    }),
    createBehavior({
      behaviorId: "bounded-non-chat-discipline",
      label: "bounded non-chat discipline",
      status: currentQuestion.id || handoff.handoffId || decision.decisionId ? "live" : "partial",
      currentEffect: "The onboarding flow remains product-bounded and question-led instead of opening free-form general chat behavior.",
      nextRequirement: "Later implementation must preserve product rules, class gates, and handoff truth even when the intake becomes more adaptive.",
    }),
  ];

  const behaviorSummary = summarizeBehaviors(behaviors);

  return {
    adaptiveOnboardingAgentContract: {
      contractId: `adaptive-onboarding-agent:${handoff.handoffId ?? conversation.sessionId ?? intake.projectName ?? "unknown"}`,
      contractFamily: "adaptive-onboarding-agent",
      status: behaviorSummary.partial > 0 ? "partial" : "live",
      statusLabel: "ה־adaptive intake agent מוגדר עכשיו כחוזה קנוני אחד",
      contractRule: "Nexus may refine onboarding per product class, but it must stay bounded, sufficiency-gated, and attached to one canonical handoff into generation.",
      currentProjectType: projectType,
      currentProjectTypeLabel: projectTypeLabel,
      currentQuestionId: normalizeString(currentQuestion.id, "none"),
      currentQuestionTitle: normalizeString(currentQuestion.title, "The current question is not active right now"),
      currentQuestionPath,
      currentQuestionPathLabel: currentQuestionPath.join(" -> "),
      handoffStatus: handoffReady,
      readinessLevel,
      behaviors,
      continuityRules: [
        "intake state must survive restore, revisit, and project resume without silently resetting",
        "approved intake truth may not be rewritten silently once it is attached to the same project",
        "the same intake handoff must remain attached through Understanding and Generation",
      ],
      generationIntegrationRules: [
        "the intake agent must emit one canonical handoff payload for generation, not parallel informal summaries",
        "generation must reuse the intake truth that was actually collected instead of reconstructing a weaker generic brief downstream",
      ],
      explicitProhibitions: [
        "no free-form general assistant behavior",
        "no open-ended chat drift that bypasses class resolution or sufficiency gates",
        "no advancing into generation without canonical intake handoff truth",
      ],
      visibleProductExpectations: [
        "smarter onboarding behavior",
        "different questioning paths per product class",
        "stronger generation focus",
        "reduced drift between onboarding and downstream build work",
      ],
      summary: {
        liveBehaviors: behaviorSummary.live,
        partialBehaviors: behaviorSummary.partial,
        nextBehaviors: behaviorSummary.next,
        handoffStatus: handoffReady,
        readinessLevel,
      },
    },
  };
}
