import test from "node:test";
import assert from "node:assert/strict";

import { createPostProjectCreationRedirectResolver } from "../src/core/post-project-creation-redirect-resolver.js";

test("post project creation redirect resolver continues to onboarding when draft is ready", () => {
  const { projectCreationRedirect } = createPostProjectCreationRedirectResolver({
    projectDraft: {
      id: "creator-app",
      onboardingReadiness: {
        canStartOnboarding: true,
      },
    },
    projectCreationExperience: {
      redirect: {
        shouldAutoRedirect: false,
      },
    },
  });

  assert.equal(projectCreationRedirect.target, "onboarding");
  assert.equal(projectCreationRedirect.shouldCreateOnboardingSession, true);
  assert.equal(projectCreationRedirect.summary.continuesImmediately, true);
});

test("post project creation redirect resolver sends incomplete draft to later flow", () => {
  const { projectCreationRedirect } = createPostProjectCreationRedirectResolver({
    projectDraft: {
      id: "blank-project",
      onboardingReadiness: {
        canStartOnboarding: false,
      },
    },
    projectCreationExperience: {
      redirect: {
        shouldAutoRedirect: false,
      },
    },
  });

  assert.equal(projectCreationRedirect.target, "later");
  assert.equal(projectCreationRedirect.summary.canReturnLater, true);
});

test("post project creation redirect resolver uses resume flow when auto redirect is enabled", () => {
  const { projectCreationRedirect } = createPostProjectCreationRedirectResolver({
    projectDraft: {
      id: "resume-project",
      onboardingReadiness: {
        canStartOnboarding: true,
      },
    },
    projectCreationExperience: {
      redirect: {
        shouldAutoRedirect: true,
      },
    },
  });

  assert.equal(projectCreationRedirect.target, "resume-flow");
  assert.equal(projectCreationRedirect.summary.resumesExistingFlow, true);
});
