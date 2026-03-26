import test from "node:test";
import assert from "node:assert/strict";

import { createConfigInfraDiffCollector } from "../src/core/config-infra-diff-collector.js";

test("config and infra diff collector returns env deploy and ci changes", () => {
  const { infraDiff } = createConfigInfraDiffCollector({
    plannedChanges: [
      {
        id: "infra-1",
        kind: "infra",
        path: ".github/workflows/deploy.yml",
        operation: "modify",
        summary: "update deploy pipeline",
        command: "update-deploy-pipeline",
      },
      {
        id: "infra-2",
        path: ".env.production",
        operation: "modify",
        summary: "set production env",
        command: "write-env-config",
      },
    ],
  });

  assert.equal(infraDiff.totalInfraChanges, 2);
  assert.equal(infraDiff.changes[0].path, ".github/workflows/deploy.yml");
  assert.equal(infraDiff.impactedAreas.includes("ci"), true);
  assert.equal(infraDiff.impactedAreas.includes("environment"), true);
});

test("config and infra diff collector falls back to empty diff", () => {
  const { infraDiff } = createConfigInfraDiffCollector();

  assert.equal(infraDiff.totalInfraChanges, 0);
  assert.equal(Array.isArray(infraDiff.changes), true);
  assert.equal(Array.isArray(infraDiff.impactedAreas), true);
});
