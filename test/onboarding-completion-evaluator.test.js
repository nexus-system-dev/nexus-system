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
      conversation: {
        answers: {
          "target-audience": "יוצרים שמוכרים קורסים",
          "core-problem": "הם לא מבינים מה דחוף אחרי כניסה למוצר ולכן מפספסים follow-up",
          "successful-solution": "לוח אחד עם חידושים, תזכורות והפעולה הבאה",
          "build-direction": "המסך הראשון חייב להראות מיד מה דחוף, מה התחדש, ומה הפעולה הראשונה לבצע",
        },
      },
      requiredActions: [],
    },
  });

  assert.equal(onboardingCompletionDecision.isComplete, true);
  assert.equal(onboardingCompletionDecision.requiresClarification, false);
  assert.equal(onboardingCompletionDecision.readinessLevel, "ready");
  assert.equal(onboardingCompletionDecision.completionStatus, "completed");
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
  assert.equal(onboardingCompletionDecision.completionStatus, "needs-clarification");
  assert.equal(onboardingCompletionDecision.primaryBlockingReason, "תן שם לפרויקט");
});

test("onboarding completion evaluator keeps supporting material as continuation gate when understanding is sufficient", () => {
  const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
    projectIntake: {
      projectName: "Clinic Launch",
      visionText: "Landing page for a new clinic service",
      projectType: "landing-page",
      uploadedFiles: [],
      externalLinks: [],
    },
    onboardingSession: {
      sessionId: "session-3",
      conversation: {
        answers: {
          "target-audience": "Busy parents",
          "core-problem": "They do not understand what to book first",
          "build-direction": "The page must make the first booking step, the trust proof, and the main CTA obvious immediately",
        },
      },
      requiredActions: [],
    },
  });

  assert.equal(onboardingCompletionDecision.isComplete, true);
  assert.equal(onboardingCompletionDecision.requiresClarification, false);
  assert.equal(onboardingCompletionDecision.readinessLevel, "ready-with-supporting-material-gap");
  assert.equal(onboardingCompletionDecision.supportingMaterialDeferred, true);
  assert.equal(onboardingCompletionDecision.nextAction, "build-project-state-with-supporting-material-gate");
  assert.equal(onboardingCompletionDecision.continuationGate?.gateType, "supporting-material");
  assert.equal(onboardingCompletionDecision.missingInputs.includes("supporting-material"), true);
});

test("onboarding completion evaluator blocks shallow understanding even when intake fields exist", () => {
  const { onboardingCompletionDecision } = createOnboardingCompletionEvaluator({
    projectIntake: {
      projectName: "Clinic Launch",
      visionText: "Landing page for a new clinic service",
      projectType: "landing-page",
      uploadedFiles: [{ name: "brief.md" }],
      externalLinks: [],
    },
    onboardingSession: {
      sessionId: "session-4",
      conversation: {
        answers: {
          "target-audience": "Busy parents",
          "core-problem": "They do not understand what to book first",
        },
      },
      requiredActions: [],
    },
  });

  assert.equal(onboardingCompletionDecision.isComplete, false);
  assert.equal(onboardingCompletionDecision.requiresClarification, true);
  assert.equal(onboardingCompletionDecision.readinessLevel, "blocked");
  assert.equal(onboardingCompletionDecision.summary.minimumDepthReached, false);
  assert.match(onboardingCompletionDecision.primaryBlockingReason ?? "", /מה חייב להיות ברור מיד|must be clear/i);
});
