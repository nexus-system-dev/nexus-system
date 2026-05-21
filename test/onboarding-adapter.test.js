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
        id: "successful-solution",
        title: "איך נראה פתרון מוצלח מבחינתם?",
        reason: "יש כבר קהל יעד וכאב מרכזי. נשאר לחדד את צורת הפתרון.",
      },
      summary: {
        projectType: "internal-tool",
        projectTypeLabel: "כלי פנימי",
        understoodItems: ["קהל יעד: צוות תפעול"],
        missingItems: ["איך נראה מסך עבודה מוצלח עבור הנציג"],
      },
    },
  });

  assert.equal(viewModel.progressLabel, "שאלה 3 במסלול אדפטיבי · עד 3 צעדים כרגע");
  assert.equal(viewModel.adaptiveOnboardingAgentContract.currentProjectTypeLabel, "כלי פנימי");
  assert.match(viewModel.adaptiveOnboardingAgentContract.currentQuestionPathLabel, /successful-solution/);
  assert.equal(viewModel.adaptiveOnboardingAgentContract.handoffStatus, "ready");
  assert.equal(viewModel.providerRuntime.selectedProviderId, "anthropic");
  assert.equal(viewModel.providerRuntime.availableProviders.length, 2);
  assert.match(viewModel.providerRuntime.enforcementLine, /class gates/i);
  const weakAnswerBehavior = viewModel.adaptiveOnboardingAgentContract.behaviors.find((behavior) => behavior.behaviorId === "weak-answer-detection");
  assert.equal(weakAnswerBehavior?.status, "partial");
  assert.match(viewModel.adaptiveOnboardingAgentContract.explicitProhibitions[1], /open-ended chat drift/i);
});
