function normalizeEntity(entityDefinition, fallbackName) {
  const entity = entityDefinition && typeof entityDefinition === "object" ? entityDefinition : {};
  const fields = Array.isArray(entity.fields) ? entity.fields : [];
  const relations = Array.isArray(entity.relations) ? entity.relations : [];
  const indexes = Array.isArray(entity.indexes) ? entity.indexes : [];

  return {
    entityName: entity.entityName ?? fallbackName,
    storageType: entity.storageType ?? "document",
    primaryKey: entity.primaryKey ?? "id",
    fields,
    relations,
    indexes,
    retentionPolicy: entity.retentionPolicy ?? "default",
  };
}

function findEntity(coreEntityDefinitions, entityName, fallback) {
  const definitions = Array.isArray(coreEntityDefinitions) ? coreEntityDefinitions : [];
  const match = definitions.find((entity) => entity?.entityName === entityName);
  return normalizeEntity(match ?? fallback, entityName);
}

export function defineNexusPersistenceSchema({
  coreEntityDefinitions = null,
} = {}) {
  const entities = {
    users: findEntity(coreEntityDefinitions, "users", {
      fields: ["userId", "email", "displayName", "status", "verificationStatus", "authMetadata"],
      indexes: ["email", "status"],
      retentionPolicy: "account-lifecycle",
    }),
    workspaces: findEntity(coreEntityDefinitions, "workspaces", {
      fields: ["workspaceId", "ownerUserId", "policyProfile", "teamPreferences", "createdAt"],
      relations: ["memberships", "projects"],
      indexes: ["ownerUserId"],
      retentionPolicy: "workspace-lifecycle",
    }),
    projects: findEntity(coreEntityDefinitions, "projects", {
      fields: ["projectId", "workspaceId", "goal", "domain", "status", "state", "context"],
      relations: ["approvals", "artifacts", "learningRecords"],
      indexes: ["workspaceId", "status", "domain"],
      retentionPolicy: "project-lifecycle",
    }),
    approvals: findEntity(coreEntityDefinitions, "approvals", {
      fields: ["approvalRecordId", "projectId", "approvalRequestId", "status", "decision", "auditTrail"],
      relations: ["projects", "users"],
      indexes: ["projectId", "status"],
      retentionPolicy: "compliance-audit",
    }),
    learningRecords: findEntity(coreEntityDefinitions, "learningRecords", {
      fields: ["learningRecordId", "scope", "patternType", "confidence", "outcomeScore", "sourceProjectId"],
      relations: ["projects", "users"],
      indexes: ["scope", "patternType", "sourceProjectId"],
      retentionPolicy: "learning-governance",
    }),
  };

  const entityList = Object.values(entities);

  return {
    nexusPersistenceSchema: {
      schemaId: "nexus-persistence-schema",
      version: "1.0.0",
      entities,
      summary: {
        totalEntities: entityList.length,
        entityNames: entityList.map((entity) => entity.entityName),
        relationCount: entityList.reduce((count, entity) => count + entity.relations.length, 0),
      },
    },
  };
}
