import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectDraftSchema } from "../src/core/project-draft-schema.js";

test("project draft schema returns canonical draft with owner onboarding readiness and bootstrap metadata", () => {
  const { projectDraft } = defineProjectDraftSchema({
    userIdentity: {
      userId: "user-1",
      email: "user@example.com",
      displayName: "User Example",
    },
    initialInput: {
      projectDraftId: "delivery-app",
      projectName: "Delivery App",
      visionText: "אפליקציה להזמנת שליחים בזמן אמת",
      attachments: [{ name: "spec.md" }],
      links: ["https://github.com/example/delivery-app"],
      requestedDeliverables: ["auth", "growth"],
      creationSource: "onboarding-session",
    },
  });

  assert.equal(projectDraft.id, "delivery-app");
  assert.equal(projectDraft.owner.userId, "user-1");
  assert.equal(projectDraft.creationSource, "onboarding-session");
  assert.equal(projectDraft.onboardingReadiness.status, "ready");
  assert.equal(projectDraft.onboardingReadiness.canStartOnboarding, true);
  assert.equal(projectDraft.bootstrapMetadata.attachmentCount, 1);
  assert.equal(projectDraft.bootstrapMetadata.linkCount, 1);
  assert.equal(Array.isArray(projectDraft.bootstrapMetadata.requestedDeliverables), true);
});

test("project draft schema flags missing inputs when goal is absent", () => {
  const { projectDraft } = defineProjectDraftSchema({
    userIdentity: {
      userId: "user-2",
    },
    initialInput: {
      projectDraftId: "blank-project",
      projectName: "Blank Project",
    },
  });

  assert.equal(projectDraft.onboardingReadiness.status, "needs-input");
  assert.equal(projectDraft.onboardingReadiness.missingFields.includes("goal"), true);
  assert.equal(projectDraft.bootstrapMetadata.suggestedBootstrapMode, "manual");
});
