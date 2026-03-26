import test from "node:test";
import assert from "node:assert/strict";

import { createFirstTangibleOutcomeGenerator } from "../src/core/first-tangible-outcome-generator.js";

test("first tangible outcome generator returns artifact-backed first value output", () => {
  const { firstValueOutput } = createFirstTangibleOutcomeGenerator({
    projectState: {
      projectId: "project-1",
      projectName: "GiftWallet",
    },
    bootstrapResult: {
      status: "completed",
      artifacts: ["app-shell", "auth-module", "project-root"],
    },
  });

  assert.equal(firstValueOutput.outcomeType, "starter-app");
  assert.equal(firstValueOutput.summary.artifactCount, 3);
  assert.equal(firstValueOutput.summary.feelsReal, true);
  assert.equal(firstValueOutput.preview.headline, "Your starter app is ready");
  assert.equal(firstValueOutput.preview.primaryArtifact, "starter app shell");
  assert.deepEqual(firstValueOutput.userVisibleArtifacts.slice(0, 2), [
    "starter app shell",
    "working auth flow",
  ]);
});

test("first tangible outcome generator prefers artifact-backed preview over generic instant value copy", () => {
  const { firstValueOutput } = createFirstTangibleOutcomeGenerator({
    instantValuePlan: {
      outputType: "first-visible-artifact",
      preview: {
        headline: "A first real project result is ready for Alpha",
      },
    },
    projectState: {
      projectId: "project-1",
      projectName: "Alpha",
    },
    bootstrapResult: {
      status: "completed",
      artifacts: ["app-shell", "auth-module"],
    },
  });

  assert.equal(firstValueOutput.outcomeType, "starter-app");
  assert.equal(firstValueOutput.preview.headline, "Your starter app is ready");
});

test("first tangible outcome generator falls back safely without artifacts", () => {
  const { firstValueOutput } = createFirstTangibleOutcomeGenerator({
    projectState: {
      projectId: "project-2",
      projectName: "Alpha",
    },
    bootstrapResult: {
      status: "pending",
    },
  });

  assert.equal(firstValueOutput.outcomeType, "project-foundation");
  assert.equal(typeof firstValueOutput.preview.headline, "string");
});
