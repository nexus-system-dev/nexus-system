import test from "node:test";
import assert from "node:assert/strict";

import { createProjectDraftCreationService } from "../src/core/project-draft-creation-service.js";

test("project draft creation service creates a draft and returns draft id", () => {
  const result = createProjectDraftCreationService({
    userIdentity: {
      userId: "user-1",
      email: "user@example.com",
      displayName: "User Example",
    },
    projectCreationInput: {
      projectName: "Creator App",
      visionText: "אפליקציה ליוצרים",
      requestedDeliverables: ["auth"],
    },
  });

  assert.equal(result.projectDraftId, "creator-app");
  assert.equal(result.projectDraft.id, "creator-app");
  assert.equal(result.projectDraft.owner.userId, "user-1");
  assert.equal(result.projectDraft.creationSource, "project-creation");
});
