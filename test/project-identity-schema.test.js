import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectIdentitySchema } from "../src/core/project-identity-schema.js";

test("project identity schema returns canonical identity from intake and business context", () => {
  const { projectIdentity } = defineProjectIdentitySchema({
    projectIntake: {
      projectName: "GiftWallet",
      visionText: "Mobile gifting wallet with instant onboarding",
      requestedDeliverables: ["wireframe", "bootstrap"],
    },
    businessContext: {
      targetAudience: "product teams",
      positioning: "Fast gifting wallet experience",
      kpis: ["activation-rate", "retention-rate"],
    },
    domainDecision: {
      domain: "saas",
    },
  });

  assert.equal(projectIdentity.name, "GiftWallet");
  assert.equal(projectIdentity.audience, "product teams");
  assert.equal(projectIdentity.tone, "clear");
  assert.equal(projectIdentity.summary.domain, "saas");
});

test("project identity schema falls back safely when inputs are partial", () => {
  const { projectIdentity } = defineProjectIdentitySchema();

  assert.equal(typeof projectIdentity.identityId, "string");
  assert.equal(typeof projectIdentity.name, "string");
  assert.equal(typeof projectIdentity.successDefinition, "string");
});
