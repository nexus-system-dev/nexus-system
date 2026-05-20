import test from "node:test";
import assert from "node:assert/strict";

import { createAdaptiveOnboardingAgentContract } from "../src/core/adaptive-onboarding-agent-contract.js";

test("adaptive onboarding agent contract exposes live branching, partial weak-answer detection, and bounded handoff truthfully", () => {
  const { adaptiveOnboardingAgentContract } = createAdaptiveOnboardingAgentContract({
    projectIntake: {
      projectType: "internal-tool",
    },
    onboardingConversation: {
      sessionId: "session-1",
      currentQuestion: {
        id: "successful-solution",
        title: "איך נראה פתרון מוצלח מבחינתם?",
      },
      summary: {
        projectType: "internal-tool",
        missingItems: ["איך נראה מסך עבודה מוצלח עבור הנציג"],
      },
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
  });

  assert.equal(adaptiveOnboardingAgentContract.contractFamily, "adaptive-onboarding-agent");
  assert.equal(adaptiveOnboardingAgentContract.currentProjectType, "internal-tool");
  assert.equal(adaptiveOnboardingAgentContract.currentQuestionPathLabel, "target-audience -> core-problem -> successful-solution -> active-question");
  assert.equal(adaptiveOnboardingAgentContract.behaviors[0].label, "class-aware branching");
  assert.equal(adaptiveOnboardingAgentContract.behaviors[0].status, "live");
  assert.equal(adaptiveOnboardingAgentContract.behaviors[1].status, "partial");
  assert.equal(adaptiveOnboardingAgentContract.behaviors[3].status, "live");
  assert.equal(adaptiveOnboardingAgentContract.handoffStatus, "ready");
  assert.match(adaptiveOnboardingAgentContract.explicitProhibitions[0], /free-form general assistant/i);
});

test("adaptive onboarding agent contract keeps class-clarification path visible when project type is still ambiguous", () => {
  const { adaptiveOnboardingAgentContract } = createAdaptiveOnboardingAgentContract({
    onboardingConversation: {
      sessionId: "session-2",
      currentQuestion: {
        id: "project-class",
        title: "מה הדבר המרכזי שאתה בונה כאן?",
      },
      summary: {
        missingItems: ["מה הדבר המרכזי שאתה בונה כאן"],
      },
    },
    onboardingCompletionDecision: {
      decisionId: "decision-2",
      readinessLevel: "blocked",
      clarificationPrompts: ["חדד איזה סוג פרויקט אתה בונה"],
    },
  });

  assert.equal(adaptiveOnboardingAgentContract.currentProjectType, "unknown");
  assert.match(adaptiveOnboardingAgentContract.currentQuestionPathLabel, /project-class/);
  assert.equal(adaptiveOnboardingAgentContract.behaviors[2].status, "live");
  assert.equal(adaptiveOnboardingAgentContract.summary.partialBehaviors >= 1, true);
});
