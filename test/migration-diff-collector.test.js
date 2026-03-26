import test from "node:test";
import assert from "node:assert/strict";

import { createMigrationDiffCollector } from "../src/core/migration-diff-collector.js";

test("migration diff collector returns migration entries and db risks", () => {
  const { migrationDiff } = createMigrationDiffCollector({
    plannedChanges: [
      {
        id: "change-1",
        kind: "migration",
        operation: "add",
        path: "db/migrations/001_init.sql",
        summary: "create-billing-module",
        command: "create-billing-module",
        args: ["saas", "node"],
      },
      {
        id: "change-2",
        kind: "code",
        path: "src/auth/module.ts",
        summary: "create-auth-module",
      },
    ],
  });

  assert.equal(migrationDiff.totalMigrationChanges, 1);
  assert.equal(migrationDiff.migrations[0].path, "db/migrations/001_init.sql");
  assert.equal(migrationDiff.dbRisks.includes("schema-coupled-business-logic"), true);
});

test("migration diff collector falls back to empty migration diff", () => {
  const { migrationDiff } = createMigrationDiffCollector();

  assert.equal(migrationDiff.totalMigrationChanges, 0);
  assert.equal(Array.isArray(migrationDiff.migrations), true);
  assert.equal(Array.isArray(migrationDiff.dbRisks), true);
});
