import test from "node:test";
import assert from "node:assert/strict";

import { createProjectCreationExperienceModel } from "../src/core/project-creation-experience-model.js";

test("project creation experience model shows creation CTA for project creation destination", () => {
  const { projectCreationExperience } = createProjectCreationExperienceModel({
    workspaceModel: {
      workspaceId: "workspace-user-1",
      status: "draft",
    },
    postLoginDestination: "project-creation",
  });

  assert.equal(projectCreationExperience.primaryAction.actionId, "create-first-project");
  assert.equal(projectCreationExperience.draftCreation.status, "ready");
  assert.equal(projectCreationExperience.emptyWorkspaceState.isEmpty, true);
  assert.equal(projectCreationExperience.redirect.target, "onboarding");
});

test("project creation experience model supports resume and workbench states", () => {
  const { projectCreationExperience } = createProjectCreationExperienceModel({
    workspaceModel: {
      workspaceId: "workspace-user-1",
      status: "active",
    },
    postLoginDestination: "onboarding-resume",
  });

  assert.equal(projectCreationExperience.primaryAction.actionId, "resume-onboarding");
  assert.equal(projectCreationExperience.redirect.shouldAutoRedirect, true);
  assert.equal(projectCreationExperience.summary.showsCreationCta, false);
});
