import test from "node:test";
import assert from "node:assert/strict";

import { buildSmartOnboardingViewModel } from "../web/nexus-ui/adapters/onboarding-adapter.js";

test("onboarding adapter exposes adaptive intake progress and contract truth", () => {
  const viewModel = buildSmartOnboardingViewModel({
    currentProject: {
      name: "Ops Queue",
      projectIntake: {
        projectType: "internal-tool",
      },
      onboardingCompletionDecision: {
        decisionId: "decision-1",
        readinessLevel: "almost-ready",
        clarificationPrompts: ["איך נראה מסך עבודה מוצלח עבור הנציג"],
      },
      onboardingStateHandoff: {
        handoffId: "handoff-1",
        handoffStatus: "ready",
        projectIntake: {
          projectType: "internal-tool",
        },
      },
      artifactExpectation: {
        projectType: "internal-tool",
      },
    },
    onboardingConversation: {
      currentIndex: 2,
      totalQuestions: 3,
      providerRuntime: {
        selectedProviderId: "anthropic",
        selectedProviderLabel: "Anthropic",
        selectedRuntimeLabel: "Anthropic onboarding runtime",
        canonicalRuleLayer: "nexus-onboarding-rules-v1",
        summaryLine: "Anthropic פעיל עכשיו, אבל עדיין כפוף לכללי ה־intake הקנוניים של Nexus.",
        enforcementLine: "בחירת provider לא מבטלת class gates, clarification pressure, readiness gates או bounded handoff.",
        runtimeMode: "provider-backed",
        availableProviders: [
          { providerId: "openai", companyLabel: "OpenAI" },
          { providerId: "anthropic", companyLabel: "Anthropic" },
        ],
      },
      currentQuestion: {
        id: "build-direction",
        title: "מה חייב להיות ברור מיד במסך הראשון כדי שהפתרון באמת יעבוד?",
        reason: "יש כבר קהל, כאב ופתרון. עכשיו צריך לנעול את כיוון ה־build הראשון.",
      },
      summary: {
        projectType: "internal-tool",
        projectTypeLabel: "כלי פנימי",
        understoodItems: ["קהל יעד: צוות תפעול"],
        missingItems: ["איך נראה מסך עבודה מוצלח עבור הנציג"],
      },
    },
  });

  assert.equal(viewModel.progressLabel, "שאלה 3 · נשארים על זה עד שהתמונה באמת ברורה");
  assert.equal(viewModel.adaptiveOnboardingAgentContract.currentProjectTypeLabel, "כרגע זה נראה לי כמו כלי פנימי");
  assert.match(viewModel.adaptiveOnboardingAgentContract.currentQuestionPathLabel, /המשתמש, הכאב, והרגע שבו זה באמת נשבר|התמונה נסגרת נכון/i);
  assert.equal(viewModel.adaptiveOnboardingAgentContract.handoffStatus, "ready");
  assert.equal(viewModel.providerRuntime.selectedProviderId, "anthropic");
  assert.equal(viewModel.providerRuntime.availableProviders.length, 2);
  assert.match(viewModel.providerRuntime.enforcementLine, /התמונה באמת ברורה|להבין/u);
  const weakAnswerBehavior = viewModel.adaptiveOnboardingAgentContract.behaviors.find((behavior) => behavior.behaviorId === "weak-answer-detection");
  assert.equal(weakAnswerBehavior?.status, "partial");
  assert.match(viewModel.adaptiveOnboardingAgentContract.explicitProhibitions[1], /open-ended chat drift/i);
});

test("onboarding adapter does not promote blocked handoff to ready just because conversation is marked complete", () => {
  const viewModel = buildSmartOnboardingViewModel({
    currentProject: {
      name: "Route Planner",
      projectIntake: {
        projectType: "saas",
      },
      onboardingCompletionDecision: {
        decisionId: "decision-2",
        isComplete: false,
        readinessLevel: "blocked",
        clarificationPrompts: [
          "איך נראה פתרון מוצלח מבחינתם",
          "איך הם משתמשים היום",
        ],
      },
      onboardingStateHandoff: {
        handoffId: "handoff-2",
        handoffStatus: "needs-clarification",
        projectIntake: {
          projectType: "saas",
        },
      },
      artifactExpectation: {
        projectType: "saas",
      },
    },
    onboardingConversation: {
      isComplete: true,
      currentIndex: 4,
      totalQuestions: 4,
      providerRuntime: {
        selectedProviderId: "openai",
        selectedProviderLabel: "OpenAI",
        selectedRuntimeLabel: "OpenAI onboarding runtime",
        canonicalRuleLayer: "nexus-onboarding-rules-v1",
        summaryLine: "OpenAI פעיל עכשיו, אבל עדיין כפוף לכללי ה־intake הקנוניים של Nexus.",
        enforcementLine: "בחירת provider לא מבטלת class gates, clarification pressure, readiness gates או bounded handoff.",
        runtimeMode: "provider-backed-live",
        availableProviders: [
          { providerId: "openai", companyLabel: "OpenAI" },
          { providerId: "anthropic", companyLabel: "Anthropic" },
        ],
      },
      summary: {
        projectType: "saas",
        projectTypeLabel: "מוצר SaaS / follow-up",
        understoodItems: [
          "קהל יעד: בעלי עסקים",
          "בעיה מרכזית: קשה לעקוב אחרי חבילות",
        ],
        missingItems: [
          "איך נראה פתרון מוצלח מבחינתם",
          "איך הם משתמשים היום",
        ],
      },
      currentQuestion: null,
      completionReason: "הסיכום עוד לא מספיק חזק כדי לעבור ל־Understanding.",
    },
  });

  assert.equal(viewModel.adaptiveOnboardingAgentContract.handoffStatus, "needs-clarification");
  assert.equal(viewModel.adaptiveOnboardingAgentContract.readinessLevel, "blocked");
  assert.doesNotMatch(
    viewModel.adaptiveOnboardingAgentContract.currentQuestionPathLabel,
    /understanding-handoff/,
  );
});
