import test from "node:test";
import assert from "node:assert/strict";

import { classifyProjectDomain } from "../src/core/domain-classifier.js";

test("domain classifier identifies mobile app from intake and scan signals", () => {
  const result = classifyProjectDomain({
    projectIntake: {
      projectType: "mobile-app",
      visionText: "אפליקציה ב-React Native להזמנת שליחים",
      requestedDeliverables: ["auth"],
    },
    scan: {
      stack: {
        frontend: ["Expo", "React Native"],
        backend: ["Express"],
        database: ["Postgres"],
      },
    },
    knowledge: {
      summary: "mobile app with onboarding",
    },
  });

  assert.equal(result.domain, "mobile-app");
  assert.equal(result.domainCandidates[0], "mobile-app");
  assert.equal(result.confidenceScores["mobile-app"] > 0.5, true);
});

test("domain classifier identifies casino from external source", () => {
  const result = classifyProjectDomain({
    goal: "להקים wallet ותשלומים לקזינו",
    externalSources: {
      source: "casino-api",
      roadmapContext: {
        knownMissingParts: ["Wallet and treasury implementation"],
      },
    },
  });

  assert.equal(result.domain, "casino");
  assert.equal(result.confidenceScores.casino, 1);
});
