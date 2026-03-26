function normalizeSchema(nexusPersistenceSchema) {
  return nexusPersistenceSchema && typeof nexusPersistenceSchema === "object"
    ? nexusPersistenceSchema
    : {
        schemaId: "nexus-persistence-schema",
        entities: {},
      };
}

function buildDefaultQueryContracts(entity) {
  const primaryKey = entity.primaryKey ?? "id";
  const indexes = Array.isArray(entity.indexes) ? entity.indexes : [];

  return [
    {
      queryId: `${entity.entityName}:find-by-id`,
      type: "find-one",
      fields: [primaryKey],
    },
    ...indexes.map((index) => ({
      queryId: `${entity.entityName}:find-by-${index}`,
      type: "find-many",
      fields: [index],
    })),
  ];
}

export function createRepositoryLayerForCoreEntities({
  nexusPersistenceSchema = null,
  entityType = null,
} = {}) {
  const normalizedSchema = normalizeSchema(nexusPersistenceSchema);
  const entities = normalizedSchema.entities ?? {};
  const fallbackEntity = {
    entityName: entityType ?? "unknown",
    storageType: "document",
    primaryKey: "id",
    fields: [],
    indexes: [],
    relations: [],
  };
  const entity = entities[entityType] ?? fallbackEntity;

  return {
    entityRepository: {
      repositoryId: `repository:${entity.entityName}`,
      schemaId: normalizedSchema.schemaId ?? "nexus-persistence-schema",
      entityType: entity.entityName,
      storageType: entity.storageType ?? "document",
      primaryKey: entity.primaryKey ?? "id",
      fields: Array.isArray(entity.fields) ? entity.fields : [],
      relations: Array.isArray(entity.relations) ? entity.relations : [],
      supportedOperations: ["create", "read", "update", "delete", "list"],
      queryContracts: buildDefaultQueryContracts(entity),
      status: entities[entityType] ? "ready" : "unknown-entity",
    },
  };
}
