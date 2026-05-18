import test from "node:test";
import assert from "node:assert/strict";

import { classifyProjectDomain } from "../src/core/domain-classifier.js";

test("classifyProjectDomain resolves landing-page as a canonical product class", () => {
  const result = classifyProjectDomain({
    projectIntake: {
      projectType: "landing-page",
      visionText: "Landing page for a coaching offer with a clear CTA and trust section.",
    },
    goal: "Build a landing page that converts visitors into booked calls.",
  });

  assert.equal(result.domain, "landing-page");
  assert.equal(result.productClass, "landing-page");
  assert.equal(result.productClassCandidates[0], "landing-page");
});

test("classifyProjectDomain preserves specialization while mapping to a canonical product class", () => {
  const result = classifyProjectDomain({
    projectIntake: {
      visionText: "Casino wallet and bonus flows for a new player experience.",
    },
    externalSources: {
      source: "casino-api",
    },
    goal: "Complete auth, wallet, and payments.",
  });

  assert.equal(result.domain, "casino");
  assert.equal(result.productClass, "saas");
  assert.equal(result.productClassCandidates.includes("saas"), true);
});
