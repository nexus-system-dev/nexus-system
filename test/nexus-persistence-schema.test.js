import test from "node:test";
import assert from "node:assert/strict";

import { defineNexusPersistenceSchema } from "../src/core/nexus-persistence-schema.js";

test("nexus persistence schema returns canonical core entities", () => {
  const { nexusPersistenceSchema } = defineNexusPersistenceSchema({
    coreEntityDefinitions: [
      {
        entityName: "users",
        storageType: "table",
        primaryKey: "userId",
        fields: ["userId", "email", "displayName"],
        indexes: ["email"],
      },
      {
        entityName: "projects",
        fields: ["projectId", "workspaceId", "state"],
        relations: ["approvals"],
        indexes: ["workspaceId"],
      },
    ],
  });

  assert.equal(nexusPersistenceSchema.schemaId, "nexus-persistence-schema");
  assert.equal(nexusPersistenceSchema.summary.totalEntities, 5);
  assert.equal(nexusPersistenceSchema.entities.users.storageType, "table");
  assert.equal(nexusPersistenceSchema.entities.users.primaryKey, "userId");
  assert.equal(nexusPersistenceSchema.entities.projects.relations.includes("approvals"), true);
  assert.equal(nexusPersistenceSchema.summary.entityNames.includes("learningRecords"), true);
});

test("nexus persistence schema falls back to canonical defaults", () => {
  const { nexusPersistenceSchema } = defineNexusPersistenceSchema();

  assert.equal(nexusPersistenceSchema.summary.totalEntities, 5);
  assert.equal(Array.isArray(nexusPersistenceSchema.entities.workspaces.fields), true);
  assert.equal(Array.isArray(nexusPersistenceSchema.entities.approvals.indexes), true);
  assert.equal(nexusPersistenceSchema.entities.learningRecords.retentionPolicy, "learning-governance");
});
