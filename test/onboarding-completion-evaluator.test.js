import test from "node:test";
import assert from "node:assert/strict";

import { createOnboardingCompletionEvaluator } from "../src/core/onboarding-completion-evaluator.js";

test("onboarding completion evaluator marks intake ready when required inputs exist", () => {
  const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
    projectIntake: {
      projectName: "Creator App",
      visionText: "אפליקציה ליוצרים עם התחברות ותשלומים",
      projectType: "mobile-app",
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: ["https://github.com/example/creator-app"],
    },
    onboardingSession: {
      sessionId: "session-1",
      requiredActions: [],
    },
  });

  assert.equal(onboardingCompletionDecision.isComplete, true);
  assert.equal(onboardingCompletionDecision.requiresClarification, false);
  assert.equal(onboardingCompletionDecision.readinessLevel, "ready");
  assert.equal(onboardingCompletionDecision.nextAction, "build-project-state");
  assert.equal(onboardingCompletionDecision.summary.projectTypeResolved, true);
});

test("onboarding completion evaluator requests clarification for missing intake and unknown type", () => {
  const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
    projectIntake: {
      projectName: "",
      visionText: "מוצר חדש",
      projectType: "unknown",
      uploadedFiles: [],
      externalLinks: [],
    },
    onboardingSession: {
      sessionId: "session-2",
      requiredActions: ["תן שם לפרויקט"],
    },
  });

  assert.equal(onboardingCompletionDecision.isComplete, false);
  assert.equal(onboardingCompletionDecision.requiresClarification, true);
  assert.equal(onboardingCompletionDecision.missingInputs.includes("project-name"), true);
  assert.equal(onboardingCompletionDecision.missingInputs.includes("supporting-material"), true);
  assert.equal(onboardingCompletionDecision.clarificationPrompts.includes("חדד איזה סוג פרויקט אתה בונה"), true);
  assert.equal(onboardingCompletionDecision.readinessLevel, "blocked");
});
