import test from "node:test";
import assert from "node:assert/strict";

import { createTestReportingAndRemediationSummary } from "../src/core/test-reporting-remediation-summary.js";

test("test reporting remediation summary returns failed suites and actions", () => {
  const { testReportSummary } = createTestReportingAndRemediationSummary({
    normalizedTestResults: {
      status: "failed",
      summary: {
        totalSuites: 3,
        failedSuites: 1,
        flakySuites: 1,
        averageCoverage: 0.78,
      },
      failures: [
        {
          suiteId: "integration",
          type: "integration",
          failureReason: "suite-not-completed",
        },
      ],
      flakySuites: [
        {
          suiteId: "e2e",
          type: "e2e",
        },
      ],
    },
    failureSummary: {
      status: "blocked",
    },
    followUpTasks: [
      { summary: "Re-run integration suite after fixing migration" },
    ],
  });

  assert.equal(testReportSummary.status, "failed");
  assert.equal(testReportSummary.failedSuites.length, 1);
  assert.equal(testReportSummary.flakySuites.length, 1);
  assert.equal(testReportSummary.remediationActions.length >= 2, true);
});

test("test reporting remediation summary returns clean headline when tests pass", () => {
  const { testReportSummary } = createTestReportingAndRemediationSummary({
    normalizedTestResults: {
      status: "passed",
      summary: {
        totalSuites: 2,
        failedSuites: 0,
        flakySuites: 0,
        averageCoverage: 0.91,
      },
      failures: [],
      flakySuites: [],
    },
    failureSummary: null,
    followUpTasks: [],
  });

  assert.equal(testReportSummary.status, "passed");
  assert.equal(testReportSummary.headline, "All required test suites passed");
  assert.deepEqual(testReportSummary.remediationActions, []);
});
