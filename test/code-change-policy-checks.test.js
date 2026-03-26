import test from "node:test";
import assert from "node:assert/strict";

import { createCodeChangePolicyChecks } from "../src/core/code-change-policy-checks.js";

test("code change policy checks flag missing tests, config and migration risks", () => {
  const { policyViolations } = createCodeChangePolicyChecks({
    changeSet: [
      {
        id: "change-code",
        path: "src/app.ts",
        operation: "modify",
        summary: "update execution flow",
        kind: "code",
      },
      {
        id: "change-env",
        path: ".github/workflows/deploy.yml",
        operation: "modify",
        summary: "update deploy pipeline",
        kind: "infra",
      },
      {
        id: "change-migration",
        path: "db/migrations/001_add_wallet.sql",
        operation: "modify",
        summary: "schema migration for wallet",
        kind: "migration",
      },
      {
        id: "change-destructive",
        path: "db/migrations/002_drop_column.sql",
        operation: "delete",
        summary: "drop column from payments table",
        kind: "migration",
      },
    ],
  });

  assert.equal(policyViolations.some((violation) => violation.type === "missing-test-coverage"), true);
  assert.equal(policyViolations.some((violation) => violation.type === "config-change-review-required"), true);
  assert.equal(policyViolations.some((violation) => violation.type === "migration-review-required"), true);
  assert.equal(policyViolations.some((violation) => violation.type === "destructive-change"), true);
});

test("code change policy checks suppress missing test violation when tests are present", () => {
  const { policyViolations } = createCodeChangePolicyChecks({
    changeSet: [
      {
        id: "change-code",
        path: "src/app.ts",
        operation: "modify",
        summary: "update execution flow",
        kind: "code",
      },
      {
        id: "change-test",
        path: "test/app.test.js",
        operation: "modify",
        summary: "cover execution flow",
        kind: "code",
      },
    ],
  });

  assert.equal(policyViolations.some((violation) => violation.type === "missing-test-coverage"), false);
});
