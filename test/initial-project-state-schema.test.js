import test from "node:test";
import assert from "node:assert/strict";

import { defineCanonicalInitialProjectStateSchema } from "../src/core/initial-project-state-schema.js";

test("canonical initial project state schema returns canonical ready state", () => {
  const { initialProjectState } = defineCanonicalInitialProjectStateSchema({
    initialProjectStateContract: {
      contractId: "contract-1",
      sourceHandoffId: "handoff-1",
      requiredInputs: ["project-draft", "project-intake", "ownership-binding"],
      optionalMetadata: {
        approvals: ["מאשר להמשיך"],
        requestedDeliverables: ["auth", "payments"],
        bootstrapMetadata: {
          suggestedBootstrapMode: "assisted",
        },
        missingClarifications: [],
        ownershipRole: "owner",
      },
      minimumViableState: {
        projectId: "creator-app",
        projectName: "Creator App",
        businessGoal: "אפליקציה ליוצרים עם התחברות ותשלומים",
        projectType: "mobile-app",
        ownerUserId: "user-1",
        workspaceId: "workspace-user-1",
      },
      readiness: {
        isReady: true,
        canBootstrapState: true,
        missingRequirements: [],
      },
    },
    projectIdentity: {
      identityId: "project-identity:Creator App",
      name: "Creator App",
      vision: "אפליקציה ליוצרים עם התחברות ותשלומים",
      audience: "creators",
      tone: "clear",
      successDefinition: "Deliver auth, payments",
    },
  });

  assert.equal(initialProjectState.identity.projectId, "creator-app");
  assert.equal(initialProjectState.goals.projectType, "mobile-app");
  assert.equal(initialProjectState.readiness.canBootstrap, true);
  assert.equal(initialProjectState.ownership.workspaceId, "workspace-user-1");
  assert.equal(initialProjectState.summary.isCanonical, true);
});

test("canonical initial project state schema preserves blockers and missing clarifications", () => {
  const { initialProjectState } = defineCanonicalInitialProjectStateSchema({
    initialProjectStateContract: {
      contractId: "contract-2",
      sourceHandoffId: "handoff-2",
      requiredInputs: ["vision", "project-name", "workspace-id"],
      optionalMetadata: {
        approvals: [],
        requestedDeliverables: [],
        bootstrapMetadata: {},
        missingClarifications: ["תן שם לפרויקט"],
        ownershipRole: null,
      },
      minimumViableState: {
        projectId: "blank-project",
        projectName: null,
        businessGoal: null,
        projectType: "unknown",
        ownerUserId: null,
        workspaceId: null,
      },
      readiness: {
        isReady: false,
        canBootstrapState: false,
        missingRequirements: ["vision", "project-name", "workspace-id"],
      },
    },
    projectIdentity: {},
  });

  assert.equal(initialProjectState.readiness.status, "blocked");
  assert.equal(initialProjectState.constraints.missingClarifications.includes("תן שם לפרויקט"), true);
  assert.equal(initialProjectState.constraints.readinessRequirements.includes("workspace-id"), true);
  assert.equal(initialProjectState.summary.isReadyForBootstrap, false);
});
