import test from "node:test";
import assert from "node:assert/strict";

import { createDiffImpactSummarizer } from "../src/core/diff-impact-summarizer.js";

test("diff impact summarizer returns impact summary and risk flags", () => {
  const { impactSummary, riskFlags } = createDiffImpactSummarizer({
    codeDiff: {
      totalCodeChanges: 2,
      affectedPaths: ["src/auth/module.ts"],
    },
    migrationDiff: {
      totalMigrationChanges: 1,
      migrations: [{ path: "db/migrations/001_init.sql" }],
      dbRisks: ["database-schema-change"],
    },
    infraDiff: {
      totalInfraChanges: 2,
      impactedAreas: ["deployment", "environment"],
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: true,
        hasUncertainty: true,
      },
    },
  });

  assert.equal(impactSummary.totalChanges, 5);
  assert.equal(impactSummary.codeImpact, "present");
  assert.equal(impactSummary.migrationImpact, "present");
  assert.equal(impactSummary.infraImpact, "present");
  assert.equal(impactSummary.requiresApproval, true);
  assert.equal(riskFlags.includes("database-schema-change"), true);
  assert.equal(riskFlags.includes("deployment-impact"), true);
  assert.equal(riskFlags.includes("approval-required"), true);
});

test("diff impact summarizer falls back to empty summary", () => {
  const { impactSummary, riskFlags } = createDiffImpactSummarizer();

  assert.equal(impactSummary.totalChanges, 0);
  assert.equal(impactSummary.codeImpact, "none");
  assert.equal(Array.isArray(riskFlags), true);
  assert.equal(riskFlags.length, 0);
});
