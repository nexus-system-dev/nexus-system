import test from "node:test";
import assert from "node:assert/strict";

import { createOnboardingToStateTransformationMapper } from "../src/core/onboarding-to-state-transformation-mapper.js";

test("onboarding to state transformation mapper returns bootstrap payload for ready state", () => {
  const { stateBootstrapPayload } = createOnboardingToStateTransformationMapper({
    onboardingStateHandoff: {
      handoffId: "handoff-1",
      projectDraft: {
        draftId: "creator-app",
        creationSource: "onboarding-session",
      },
      projectIntake: {
        projectName: "Creator App",
        visionText: "אפליקציה ליוצרים",
        projectType: "mobile-app",
        requestedDeliverables: ["auth"],
        uploadedFiles: [{ name: "spec.md" }],
        externalLinks: ["https://github.com/example/creator-app"],
      },
      approvals: ["מאשר להמשיך"],
      missingClarifications: [],
    },
    initialProjectState: {
      stateId: "initial-project-state:creator-app",
      identity: {
        identityId: "project-identity:Creator App",
      },
      goals: {
        businessGoal: "אפליקציה ליוצרים",
      },
      constraints: {
        requiredInputs: ["project-draft"],
      },
      readiness: {
        canBootstrap: true,
      },
      ownership: {
        ownerUserId: "user-1",
        workspaceId: "workspace-user-1",
        role: "owner",
      },
      bootstrapMetadata: {
        requestedDeliverables: ["auth"],
      },
    },
  });

  assert.equal(stateBootstrapPayload.summary.canBootstrap, true);
  assert.equal(stateBootstrapPayload.ownership.workspaceId, "workspace-user-1");
  assert.equal(stateBootstrapPayload.intake.projectType, "mobile-app");
  assert.equal(stateBootstrapPayload.bootstrapMetadata.approvalCount, 1);
});

test("onboarding to state transformation mapper preserves blocking clarifications", () => {
  const { stateBootstrapPayload } = createOnboardingToStateTransformationMapper({
    onboardingStateHandoff: {
      handoffId: "handoff-2",
      projectDraft: {
        draftId: "blank-project",
      },
      projectIntake: {
        projectName: null,
        visionText: null,
        projectType: "unknown",
      },
      approvals: [],
      missingClarifications: ["תן שם לפרויקט"],
    },
    initialProjectState: {
      stateId: "initial-project-state:blank-project",
      readiness: {
        canBootstrap: false,
      },
      ownership: {
        ownerUserId: null,
        workspaceId: null,
      },
    },
  });

  assert.equal(stateBootstrapPayload.summary.canBootstrap, false);
  assert.equal(stateBootstrapPayload.summary.hasMissingClarifications, true);
  assert.equal(stateBootstrapPayload.missingClarifications.includes("תן שם לפרויקט"), true);
});
