import test from "node:test";
import assert from "node:assert/strict";

import { createUserFacingDiffPreviewAssembler } from "../src/core/user-facing-diff-preview-assembler.js";

test("user-facing diff preview assembler returns canonical preview", () => {
  const { diffPreview } = createUserFacingDiffPreviewAssembler({
    codeDiff: {
      files: [{ path: "src/auth/module.ts", operation: "modify" }],
    },
    migrationDiff: {
      migrations: [{ path: "db/migrations/001_init.sql", dbRisk: "database-schema-change" }],
    },
    infraDiff: {
      changes: [{ path: ".env.production", area: "environment" }],
    },
    impactSummary: {
      totalChanges: 3,
      codeImpact: "present",
      migrationImpact: "present",
      infraImpact: "present",
      affectedCodePaths: ["src/auth/module.ts"],
      affectedMigrationPaths: ["db/migrations/001_init.sql"],
      affectedInfraAreas: ["environment"],
      requiresApproval: true,
      hasUncertainty: false,
    },
    riskFlags: ["database-schema-change", "approval-required"],
  });

  assert.equal(diffPreview.summary.totalChanges, 3);
  assert.equal(diffPreview.sections.code.length, 1);
  assert.equal(diffPreview.sections.migrations.length, 1);
  assert.equal(diffPreview.sections.infra.length, 1);
  assert.equal(diffPreview.approvalGuidance.required, true);
  assert.equal(diffPreview.riskFlags.includes("approval-required"), true);
});

test("user-facing diff preview assembler falls back to empty preview", () => {
  const { diffPreview } = createUserFacingDiffPreviewAssembler();

  assert.equal(diffPreview.summary.totalChanges, 0);
  assert.equal(Array.isArray(diffPreview.sections.code), true);
  assert.equal(diffPreview.approvalGuidance.required, false);
});
