import test from "node:test";
import assert from "node:assert/strict";

import { createReleaseValidationAssembler } from "../src/core/release-validation-assembler.js";

test("release validation assembler returns ready report when all validations pass", () => {
  const { validationReport, blockingIssues } = createReleaseValidationAssembler({
    artifactValidation: { isReady: true },
    metadataValidation: { isReady: true },
    approvalValidation: { isReady: true },
    blockingIssues: [],
    releaseRequirements: {
      releaseTarget: "web-deployment",
      domain: "saas",
    },
  });

  assert.equal(validationReport.status, "ready");
  assert.equal(validationReport.isReady, true);
  assert.equal(validationReport.releaseTarget, "web-deployment");
  assert.equal(validationReport.domain, "saas");
  assert.deepEqual(blockingIssues, []);
});

test("release validation assembler returns blocked report when blocking issues exist", () => {
  const { validationReport, blockingIssues } = createReleaseValidationAssembler({
    artifactValidation: { isReady: false },
    metadataValidation: { isReady: true },
    approvalValidation: { isReady: false },
    blockingIssues: [{ category: "artifact", severity: "blocking", issue: "build-output" }],
  });

  assert.equal(validationReport.status, "blocked");
  assert.equal(validationReport.isReady, false);
  assert.equal(validationReport.blockingIssueCount, 1);
  assert.equal(blockingIssues.length, 1);
});
