import test from "node:test";
import assert from "node:assert/strict";

import { createProjectStateBootstrapService } from "../src/core/project-state-bootstrap-service.js";

test("project state bootstrap service returns initial state and snapshot for ready payload", () => {
  const result = createProjectStateBootstrapService({
    stateBootstrapPayload: {
      sourceHandoffId: "handoff-1",
      identity: {
        projectId: "creator-app",
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
      bootstrapMetadata: {},
      approvals: ["מאשר להמשיך"],
      missingClarifications: [],
      intake: {
        projectType: "mobile-app",
      },
      draftMetadata: {
        draftId: "creator-app",
      },
      summary: {
        canBootstrap: true,
      },
    },
    projectOwnershipBinding: {
      projectId: "creator-app",
      ownerUserId: "user-1",
      workspaceId: "workspace-user-1",
      role: "owner",
    },
  });

  assert.equal(result.initialProjectState.projectId, "creator-app");
  assert.equal(result.initialProjectState.lifecyclePhase, "bootstrap-ready");
  assert.equal(result.projectStateSnapshot.projectId, "creator-app");
  assert.equal(result.projectStateSnapshot.summary.isRestorable, true);
});

test("project state bootstrap service marks blocked bootstrap when payload is incomplete", () => {
  const result = createProjectStateBootstrapService({
    stateBootstrapPayload: {
      identity: {},
      goals: {},
      constraints: {},
      readiness: {
        canBootstrap: false,
      },
      ownership: {},
      approvals: [],
      missingClarifications: ["תן שם לפרויקט"],
      draftMetadata: {
        draftId: "blank-project",
      },
      summary: {
        canBootstrap: false,
      },
    },
    projectOwnershipBinding: {
      projectId: "blank-project",
      ownerUserId: null,
      workspaceId: null,
    },
  });

  assert.equal(result.initialProjectState.lifecyclePhase, "bootstrap-blocked");
  assert.equal(result.initialProjectState.hasBlockers, true);
  assert.equal(result.projectStateSnapshot.projectId, "blank-project");
});
