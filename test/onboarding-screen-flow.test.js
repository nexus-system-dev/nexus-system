import test from "node:test";
import assert from "node:assert/strict";

import { buildOnboardingScreenFlow } from "../src/core/onboarding-screen-flow.js";

test("onboarding screen flow builds resume screen with autosave and required questions", () => {
  const { onboardingViewState } = buildOnboardingScreenFlow({
    onboardingSession: {
      sessionId: "session-1",
      status: "active",
      currentStep: "review-intake",
      nextStep: "confirm-project-setup",
      updatedAt: "2025-01-01T10:00:00.000Z",
    },
    onboardingProgress: {
      currentStep: "review-intake",
      nextStep: "confirm-project-setup",
      completedSteps: ["capture-vision", "capture-missing-inputs"],
      requiredActions: ["תן שם לפרויקט", "העלה איפיון, קבצים או קישור חיצוני"],
      resumeState: {
        canResume: true,
        resumeStep: "review-intake",
      },
    },
  });

  assert.equal(onboardingViewState.activeScreen, "resume");
  assert.equal(onboardingViewState.screens.resume.enabled, true);
  assert.equal(onboardingViewState.autosave.status, "idle");
  assert.equal(onboardingViewState.questions.length, 2);
  assert.equal(onboardingViewState.questions[1].responseType, "attachments");
  assert.equal(onboardingViewState.summary.canResume, true);
});

test("onboarding screen flow shows questionnaire for first-time onboarding", () => {
  const { onboardingViewState } = buildOnboardingScreenFlow({
    onboardingSession: {
      sessionId: "session-2",
      status: "active",
      currentStep: "capture-vision",
    },
    onboardingProgress: {
      currentStep: "capture-vision",
      completedSteps: [],
      requiredActions: ["הזן תיאור קצר של מה אתה רוצה לבנות"],
      resumeState: {
        canResume: false,
        resumeStep: "capture-vision",
      },
    },
  });

  assert.equal(onboardingViewState.activeScreen, "questionnaire");
  assert.equal(onboardingViewState.screens.questionnaire.enabled, true);
  assert.equal(onboardingViewState.summary.needsUserInput, true);
  assert.equal(onboardingViewState.questions[0].responseType, "text");
});

test("onboarding screen flow surfaces loading and error states safely", () => {
  const loading = buildOnboardingScreenFlow({
    onboardingSession: {
      sessionId: "session-3",
      status: "loading",
    },
    onboardingProgress: {
      currentStep: "capture-missing-inputs",
      completedSteps: ["capture-vision"],
      requiredActions: ["תן שם לפרויקט"],
      resumeState: {
        canResume: true,
      },
    },
  }).onboardingViewState;

  const error = buildOnboardingScreenFlow({
    onboardingSession: {
      sessionId: "session-4",
      status: "error",
      error: {
        message: "network-timeout",
      },
    },
    onboardingProgress: {
      currentStep: "review-intake",
      completedSteps: ["capture-vision"],
      requiredActions: ["תן שם לפרויקט"],
      resumeState: {
        canResume: true,
      },
    },
  }).onboardingViewState;

  assert.equal(loading.activeScreen, "loading");
  assert.equal(loading.autosave.status, "saving");
  assert.equal(error.activeScreen, "error");
  assert.equal(error.screens.error.reason, "network-timeout");
  assert.equal(error.summary.hasBlockingError, true);
});
