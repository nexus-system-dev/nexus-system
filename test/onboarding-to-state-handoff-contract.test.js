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
      completionStatus: "completed",
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
  assert.equal(onboardingStateHandoff.completionStatus, "completed");
  assert.equal(onboardingStateHandoff.projectDraft.draftId, "creator-app");
  assert.equal(onboardingStateHandoff.approvals.length, 1);
  assert.equal(onboardingStateHandoff.summary.canBuildProjectState, true);
  assert.equal(onboardingStateHandoff.artifactExpectation.title, "Creator App mobile flow");
  assert.equal(onboardingStateHandoff.artifactExpectation.projectType, "mobile-app");
  assert.equal(onboardingStateHandoff.artifactExpectation.proofArtifactType, "mobile-app");
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
      completionStatus: "needs-clarification",
      primaryBlockingReason: "תן שם לפרויקט",
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
  assert.equal(onboardingStateHandoff.completionStatus, "needs-clarification");
  assert.equal(onboardingStateHandoff.missingClarifications.includes("תן שם לפרויקט"), true);
  assert.equal(onboardingStateHandoff.completionDecision.requiresClarification, true);
  assert.equal(onboardingStateHandoff.completionDecision.primaryBlockingReason, "תן שם לפרויקט");
  assert.equal(onboardingStateHandoff.summary.missingClarificationCount, 2);
});

test("onboarding handoff emits internal-tool artifact expectation truth", () => {
  const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
    projectDraft: {
      id: "queue-workspace",
      name: "Queue Workspace",
    },
    projectIntake: {
      projectName: "Queue Workspace",
      visionText: "Internal queue workspace for support reps",
      projectType: "internal-tool",
      requestedDeliverables: [],
      uploadedFiles: [],
      externalLinks: [],
    },
    onboardingCompletionDecision: {
      isComplete: true,
      requiresClarification: false,
      readinessLevel: "ready",
      completionStatus: "completed",
      missingInputs: [],
      clarificationPrompts: [],
    },
    onboardingSession: {
      conversation: {
        answers: {
          "target-audience": "Support reps",
          "core-problem": "Queue ownership is unclear",
          "successful-solution": "A shared queue with owner, SLA, and next action",
        },
      },
      approvals: [],
    },
  });

  assert.equal(onboardingStateHandoff.artifactExpectation.artifactType, "internal-ops-workspace");
  assert.equal(onboardingStateHandoff.artifactExpectation.proofArtifactType, "internal-ops-dashboard");
  assert.match(onboardingStateHandoff.artifactExpectation.continuityLine, /ownership/);
});

test("onboarding handoff preserves continuation gate when only supporting material is still missing", () => {
  const { onboardingStateHandoff } = createOnboardingToStateHandoffContract({
    projectDraft: {
      id: "clinic-launch",
      name: "Clinic Launch",
    },
    projectIntake: {
      projectName: "Clinic Launch",
      visionText: "Landing page for a new clinic service",
      projectType: "landing-page",
      requestedDeliverables: [],
      uploadedFiles: [],
      externalLinks: [],
    },
    onboardingCompletionDecision: {
      isComplete: true,
      requiresClarification: false,
      readinessLevel: "ready-with-supporting-material-gap",
      completionStatus: "completed",
      nextAction: "build-project-state-with-supporting-material-gate",
      missingInputs: ["supporting-material"],
      clarificationPrompts: [],
      supportingMaterialDeferred: true,
      continuationGate: {
        gateType: "supporting-material",
        title: "אפשר להמשיך ללופ, אבל כדאי לצרף חומר תומך לשכבת האמון",
        requestedMaterialLabel: "קישור לעמוד קיים, מסמך מוצר, או עוגני אמון שיווקיים",
      },
    },
    onboardingSession: {
      sessionId: "session-3",
      approvals: ["נכון, בוא נתקדם"],
    },
  });

  assert.equal(onboardingStateHandoff.handoffStatus, "ready");
  assert.equal(onboardingStateHandoff.completionDecision.supportingMaterialDeferred, true);
  assert.equal(onboardingStateHandoff.continuationGate?.gateType, "supporting-material");
  assert.equal(onboardingStateHandoff.summary.hasContinuationGate, true);
});
