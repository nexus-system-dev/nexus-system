import test from "node:test";
import assert from "node:assert/strict";

import { createNexusDatabaseMigrations } from "../src/core/nexus-database-migrations.js";

test("nexus database migrations return planned steps and sql artifacts", () => {
  const { migrationPlan, migrationArtifacts } = createNexusDatabaseMigrations({
    nexusPersistenceSchema: {
      schemaId: "nexus-persistence-schema",
      version: "1.0.0",
      entities: {
        users: {
          entityName: "users",
          primaryKey: "userId",
          indexes: ["email"],
          relations: [],
        },
        projects: {
          entityName: "projects",
          primaryKey: "projectId",
          indexes: ["workspaceId"],
          relations: ["approvals"],
        },
      },
    },
  });

  assert.equal(migrationPlan.totalSteps, 2);
  assert.equal(migrationPlan.affectedEntities.includes("users"), true);
  assert.equal(migrationPlan.migrationSteps[1].relationCount, 1);
  assert.equal(migrationArtifacts.files.length, 2);
  assert.equal(migrationArtifacts.files[0].path, "db/migrations/001_create_users.sql");
});

test("nexus database migrations fall back to empty plan", () => {
  const { migrationPlan, migrationArtifacts } = createNexusDatabaseMigrations();

  assert.equal(migrationPlan.totalSteps, 0);
  assert.deepEqual(migrationPlan.affectedEntities, []);
  assert.deepEqual(migrationArtifacts.files, []);
});
