import test from "node:test";
import assert from "node:assert/strict";

import { createProjectIdentityAssembler } from "../src/core/project-identity-assembler.js";

test("project identity assembler builds a clear profile and completeness state", () => {
  const { projectIdentityProfile, identityCompleteness } = createProjectIdentityAssembler({
    projectIdentity: {
      identityId: "project-identity:giftwallet",
      name: "GiftWallet",
      vision: "Ship the first gifting wallet flow",
      audience: "product teams",
      successDefinition: "Deliver wireframe, bootstrap",
      differentiation: "Faster gifting onboarding",
      tone: "clear",
    },
    projectDraft: {
      id: "giftwallet",
      name: "GiftWallet",
      goal: "Ship the first gifting wallet flow",
    },
    onboardingSession: {
      sessionId: "onboarding-giftwallet-1",
      projectDraftId: "giftwallet",
      currentStep: "review-intake",
      nextStep: "confirm-project-setup",
    },
  });

  assert.equal(projectIdentityProfile.projectName, "GiftWallet");
  assert.equal(projectIdentityProfile.summary.canShowIdentityCard, true);
  assert.equal(identityCompleteness.score > 0.8, true);
  assert.equal(Array.isArray(identityCompleteness.missingFields), true);
});

test("project identity assembler falls back safely when draft and onboarding data are partial", () => {
  const { projectIdentityProfile, identityCompleteness } = createProjectIdentityAssembler({
    projectIdentity: {
      name: "Fallback Project",
    },
  });

  assert.equal(typeof projectIdentityProfile.profileId, "string");
  assert.equal(projectIdentityProfile.projectName, "Fallback Project");
  assert.equal(typeof identityCompleteness.score, "number");
});
