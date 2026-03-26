import test from "node:test";
import assert from "node:assert/strict";

import { createBlockingIssuesClassifier } from "../src/core/blocking-issues-classifier.js";

test("blocking issues classifier returns categorized blocking issues", () => {
  const { blockingIssues } = createBlockingIssuesClassifier({
    artifactValidation: {
      missingArtifacts: ["build-output"],
    },
    metadataValidation: {
      missingMetadata: ["version-info"],
    },
    approvalValidation: {
      missingApprovals: ["deployment-approval"],
    },
  });

  assert.equal(blockingIssues.length, 3);
  assert.deepEqual(blockingIssues[0], {
    category: "artifact",
    severity: "blocking",
    issue: "build-output",
  });
  assert.equal(blockingIssues.some((item) => item.category === "metadata"), true);
  assert.equal(blockingIssues.some((item) => item.category === "approval"), true);
});

test("blocking issues classifier returns empty array when everything is ready", () => {
  const { blockingIssues } = createBlockingIssuesClassifier({
    artifactValidation: { missingArtifacts: [] },
    metadataValidation: { missingMetadata: [] },
    approvalValidation: { missingApprovals: [] },
  });

  assert.deepEqual(blockingIssues, []);
});
