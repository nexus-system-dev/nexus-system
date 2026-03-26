function normalizeSchema(nexusPersistenceSchema) {
  return nexusPersistenceSchema && typeof nexusPersistenceSchema === "object"
    ? nexusPersistenceSchema
    : {
        schemaId: "nexus-persistence-schema",
        version: "1.0.0",
        entities: {},
      };
}

function buildMigrationSteps(entities) {
  return Object.values(entities).map((entity, index) => ({
    stepId: `migration-step-${index + 1}`,
    entityName: entity.entityName,
    action: "create-entity-table",
    primaryKey: entity.primaryKey ?? "id",
    indexCount: Array.isArray(entity.indexes) ? entity.indexes.length : 0,
    relationCount: Array.isArray(entity.relations) ? entity.relations.length : 0,
  }));
}

export function createNexusDatabaseMigrations({
  nexusPersistenceSchema = null,
} = {}) {
  const normalizedSchema = normalizeSchema(nexusPersistenceSchema);
  const entities = normalizedSchema.entities ?? {};
  const migrationSteps = buildMigrationSteps(entities);
  const entityNames = migrationSteps.map((step) => step.entityName);

  return {
    migrationPlan: {
      migrationPlanId: `migration-plan:${normalizedSchema.schemaId}:${normalizedSchema.version}`,
      schemaId: normalizedSchema.schemaId,
      schemaVersion: normalizedSchema.version,
      totalSteps: migrationSteps.length,
      migrationSteps,
      affectedEntities: entityNames,
      executionMode: "planned",
    },
    migrationArtifacts: {
      artifactGroupId: `migration-artifacts:${normalizedSchema.schemaId}:${normalizedSchema.version}`,
      files: entityNames.map((entityName, index) => ({
        artifactId: `migration-file-${index + 1}`,
        path: `db/migrations/${String(index + 1).padStart(3, "0")}_create_${entityName}.sql`,
        kind: "sql-migration",
        entityName,
      })),
      manifest: {
        schemaId: normalizedSchema.schemaId,
        schemaVersion: normalizedSchema.version,
        generatedAt: new Date().toISOString(),
      },
    },
  };
}
