import test from "node:test";
import assert from "node:assert/strict";

import { defineInitialProjectStateCreationContract } from "../src/core/initial-project-state-creation-contract.js";

test("initial project state creation contract returns ready minimum viable contract", () => {
  const { initialProjectStateContract } = defineInitialProjectStateCreationContract({
    onboardingStateHandoff: {
      handoffId: "handoff-1",
      projectDraft: {
        draftId: "creator-app",
        name: "Creator App",
        bootstrapMetadata: {
          requestedDeliverables: ["auth", "payments"],
        },
      },
      projectIntake: {
        projectName: "Creator App",
        visionText: "אפליקציה ליוצרים עם התחברות ותשלומים",
        projectType: "mobile-app",
        requestedDeliverables: ["auth", "payments"],
      },
      approvals: ["מאשר להמשיך"],
      missingClarifications: [],
      completionDecision: {
        isComplete: true,
      },
      summary: {
        canBuildProjectState: true,
      },
    },
    projectOwnershipBinding: {
      projectId: "creator-app",
      ownerUserId: "user-1",
      workspaceId: "workspace-user-1",
      role: "owner",
    },
  });

  assert.equal(initialProjectStateContract.readiness.isReady, true);
  assert.equal(initialProjectStateContract.minimumViableState.projectId, "creator-app");
  assert.equal(initialProjectStateContract.minimumViableState.workspaceId, "workspace-user-1");
  assert.equal(initialProjectStateContract.summary.hasOwnershipBinding, true);
});

test("initial project state creation contract reports missing ownership and intake requirements", () => {
  const { initialProjectStateContract } = defineInitialProjectStateCreationContract({
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
      completionDecision: {
        isComplete: false,
      },
      summary: {
        canBuildProjectState: false,
      },
    },
    projectOwnershipBinding: {
      projectId: "blank-project",
      ownerUserId: null,
      workspaceId: null,
    },
  });

  assert.equal(initialProjectStateContract.readiness.isReady, false);
  assert.equal(initialProjectStateContract.requiredInputs.includes("vision"), true);
  assert.equal(initialProjectStateContract.requiredInputs.includes("owner-user-id"), true);
  assert.equal(initialProjectStateContract.readiness.missingRequirements.includes("workspace-id"), true);
});
