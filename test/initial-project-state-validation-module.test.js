import test from "node:test";
import assert from "node:assert/strict";

import { createInitialProjectStateValidationModule } from "../src/core/initial-project-state-validation-module.js";

test("initial project state validation module passes valid canonical bootstrap state", () => {
  const { initialProjectStateValidation, stateValidationIssues } = createInitialProjectStateValidationModule({
    initialProjectState: {
      stateId: "initial-project-state:creator-app",
      projectId: "creator-app",
      workspaceId: "workspace-user-1",
      ownerUserId: "user-1",
      identity: {
        projectId: "creator-app",
        name: "Creator App",
      },
      goals: {
        businessGoal: "Launch first creator workflow",
      },
      constraints: {
        requiredInputs: ["project-draft", "project-intake", "ownership-binding"],
        readinessRequirements: [],
      },
      readiness: {
        status: "ready",
        canBootstrap: true,
      },
      ownership: {
        ownerUserId: "user-1",
        workspaceId: "workspace-user-1",
        role: "owner",
      },
      summary: {
        isCanonical: true,
        hasOwnership: true,
        isReadyForBootstrap: true,
      },
    },
    initialProjectStateContract: {
      requiredInputs: ["project-draft", "project-intake", "ownership-binding"],
      readiness: {
        missingRequirements: [],
      },
    },
  });

  assert.equal(initialProjectStateValidation.isValid, true);
  assert.equal(initialProjectStateValidation.summary.hasCanonicalSchema, true);
  assert.equal(initialProjectStateValidation.summary.hasOwnershipBinding, true);
  assert.deepEqual(stateValidationIssues, []);
});

test("initial project state validation module reports blocking issues and warnings", () => {
  const { initialProjectStateValidation, stateValidationIssues } = createInitialProjectStateValidationModule({
    initialProjectState: {
      stateId: null,
      projectId: "creator-app",
      workspaceId: "workspace-a",
      ownerUserId: "user-a",
      identity: {
        projectId: "project-b",
        name: null,
      },
      goals: {
        businessGoal: null,
      },
      constraints: {
        requiredInputs: ["project-draft"],
        readinessRequirements: [],
      },
      readiness: {
        status: "ready",
        canBootstrap: false,
      },
      ownership: {
        ownerUserId: "user-b",
        workspaceId: null,
        role: "owner",
      },
      summary: {
        isCanonical: false,
        hasOwnership: true,
        isReadyForBootstrap: true,
      },
    },
    initialProjectStateContract: {
      requiredInputs: ["project-draft", "project-intake", "ownership-binding"],
      readiness: {
        missingRequirements: ["workspace-id"],
      },
    },
  });

  assert.equal(initialProjectStateValidation.isValid, false);
  assert.equal(initialProjectStateValidation.blockingIssueCount > 0, true);
  assert.equal(initialProjectStateValidation.warningCount > 0, true);
  assert.equal(stateValidationIssues.some((issue) => issue.code === "missing-state-id"), true);
  assert.equal(stateValidationIssues.some((issue) => issue.code === "project-id-mismatch"), true);
  assert.equal(stateValidationIssues.some((issue) => issue.code === "required-inputs-mismatch"), true);
});
