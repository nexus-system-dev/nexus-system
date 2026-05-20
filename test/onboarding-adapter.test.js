import test from "node:test";
import assert from "node:assert/strict";

import { buildSmartOnboardingViewModel } from "../web/nexus-ui/adapters/onboarding-adapter.js";

test("onboarding adapter exposes adaptive intake contract without replacing the current onboarding flow", () => {
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

  assert.equal(viewModel.progressLabel, "שאלה 3 מתוך 3");
  assert.equal(viewModel.adaptiveOnboardingAgentContract.currentProjectTypeLabel, "כלי פנימי");
  assert.match(viewModel.adaptiveOnboardingAgentContract.currentQuestionPathLabel, /successful-solution/);
  assert.equal(viewModel.adaptiveOnboardingAgentContract.handoffStatus, "ready");
  assert.equal(viewModel.adaptiveOnboardingAgentContract.behaviors[1].status, "partial");
  assert.match(viewModel.adaptiveOnboardingAgentContract.explicitProhibitions[1], /open-ended chat drift/i);
});
