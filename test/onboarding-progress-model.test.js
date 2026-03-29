import test from "node:test";
import assert from "node:assert/strict";

import { createOnboardingProgressModel } from "../src/core/onboarding-progress-model.js";

test("onboarding progress model returns current step completed steps and resume state", () => {
  const { onboardingProgress } = createOnboardingProgressModel({
    onboardingSession: {
      sessionId: "session-1",
      currentStep: "review-intake",
      nextStep: "confirm-project-setup",
      status: "active",
      requiredActions: ["תן שם לפרויקט", "העלה איפיון, קבצים או קישור חיצוני"],
    },
  });

  assert.equal(onboardingProgress.currentStep, "review-intake");
  assert.deepEqual(onboardingProgress.completedSteps, [
    "capture-vision",
    "capture-missing-inputs",
    "clarify-project-type",
  ]);
  assert.equal(onboardingProgress.missingFields.includes("project-name"), true);
  assert.equal(onboardingProgress.resumeState.canResume, true);
});

test("onboarding progress model falls back safely without onboarding session", () => {
  const { onboardingProgress } = createOnboardingProgressModel();

  assert.equal(onboardingProgress.currentStep, "capture-vision");
  assert.deepEqual(onboardingProgress.completedSteps, []);
  assert.equal(onboardingProgress.resumeState.canResume, false);
});
