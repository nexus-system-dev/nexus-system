import test from "node:test";
import assert from "node:assert/strict";

import { createOnboardingToStateHandoffContract } from "../src/core/onboarding-to-state-handoff-contract.js";

test("onboarding to state handoff contract returns ready payload for complete onboarding", () => {
  const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
    projectDraft: {
      id: "creator-app",
      name: "Creator App",
      owner: {
        userId: "user-1",
      },
      creationSource: "onboarding-session",
      onboardingReadiness: {
        canStartOnboarding: true,
      },
      bootstrapMetadata: {
        requestedDeliverables: ["auth", "payments"],
      },
    },
    projectIntake: {
      projectName: "Creator App",
      visionText: "אפליקציה ליוצרים עם התחברות ותשלומים",
      projectType: "mobile-app",
      requestedDeliverables: ["auth", "payments"],
      uploadedFiles: [{ name: "spec.md" }],
      externalLinks: ["https://github.com/example/creator-app"],
    },
    onboardingCompletionDecision: {
      decisionId: "decision-1",
      isComplete: true,
      requiresClarification: false,
      readinessLevel: "ready",
      nextAction: "build-project-state",
      missingInputs: [],
      clarificationPrompts: [],
    },
    onboardingSession: {
      sessionId: "session-1",
      approvals: ["מאשר להמשיך ליצירת state"],
    },
  });

  assert.equal(onboardingStateHandoff.handoffStatus, "ready");
  assert.equal(onboardingStateHandoff.projectDraft.draftId, "creator-app");
  assert.equal(onboardingStateHandoff.approvals.length, 1);
  assert.equal(onboardingStateHandoff.summary.canBuildProjectState, true);
});

test("onboarding to state handoff contract preserves missing clarifications when onboarding is incomplete", () => {
  const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
    projectDraft: {
      id: "blank-project",
      name: "Blank Project",
    },
    projectIntake: {
      projectName: "",
      visionText: "מוצר חדש",
      projectType: "unknown",
      requestedDeliverables: [],
      uploadedFiles: [],
      externalLinks: [],
    },
    onboardingCompletionDecision: {
      decisionId: "decision-2",
      isComplete: false,
      requiresClarification: true,
      readinessLevel: "blocked",
      nextAction: "collect-clarification",
      missingInputs: ["project-name", "supporting-material"],
      clarificationPrompts: ["תן שם לפרויקט", "חדד איזה סוג פרויקט אתה בונה"],
    },
    onboardingSession: {
      sessionId: "session-2",
      approvals: [],
    },
  });

  assert.equal(onboardingStateHandoff.handoffStatus, "needs-clarification");
  assert.equal(onboardingStateHandoff.missingClarifications.includes("תן שם לפרויקט"), true);
  assert.equal(onboardingStateHandoff.completionDecision.requiresClarification, true);
  assert.equal(onboardingStateHandoff.summary.missingClarificationCount, 2);
});
