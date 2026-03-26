import test from "node:test";
import assert from "node:assert/strict";

import { createRepositoryLayerForCoreEntities } from "../src/core/entity-repository-layer.js";

test("repository layer returns canonical CRUD and query contract for known entity", () => {
  const { entityRepository } = createRepositoryLayerForCoreEntities({
    nexusPersistenceSchema: {
      schemaId: "nexus-persistence-schema",
      entities: {
        users: {
          entityName: "users",
          storageType: "table",
          primaryKey: "userId",
          fields: ["userId", "email"],
          indexes: ["email"],
          relations: ["workspaces"],
        },
      },
    },
    entityType: "users",
  });

  assert.equal(entityRepository.repositoryId, "repository:users");
  assert.equal(entityRepository.storageType, "table");
  assert.equal(entityRepository.primaryKey, "userId");
  assert.equal(entityRepository.supportedOperations.includes("update"), true);
  assert.equal(entityRepository.queryContracts[0].queryId, "users:find-by-id");
  assert.equal(entityRepository.queryContracts[1].queryId, "users:find-by-email");
});

test("repository layer falls back to unknown entity contract", () => {
  const { entityRepository } = createRepositoryLayerForCoreEntities({
    nexusPersistenceSchema: {
      schemaId: "nexus-persistence-schema",
      entities: {},
    },
    entityType: "unknownEntity",
  });

  assert.equal(entityRepository.status, "unknown-entity");
  assert.equal(entityRepository.entityType, "unknownEntity");
  assert.deepEqual(entityRepository.queryContracts[0].fields, ["id"]);
});
