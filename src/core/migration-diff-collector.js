function normalizePlannedChanges(plannedChanges) {
  if (!Array.isArray(plannedChanges)) {
    return [];
  }

  return plannedChanges.filter((change) => change && typeof change === "object");
}

function isMigrationChange(change) {
  if (change.kind === "migration") {
    return true;
  }

  const text = [change.path, change.summary, change.command].filter(Boolean).join(" ").toLowerCase();
  return (
    text.includes("migration")
    || text.includes("schema")
    || text.includes("billing")
    || text.includes("database")
    || text.includes("db")
  );
}

function inferDbRisk(change) {
  const text = [change.path, change.summary, change.command].filter(Boolean).join(" ").toLowerCase();

  if (text.includes("billing")) {
    return "schema-coupled-business-logic";
  }

  if (text.includes("schema") || text.includes("migration") || text.includes("db")) {
    return "database-schema-change";
  }

  return "unknown-db-risk";
}

export function createMigrationDiffCollector({
  plannedChanges,
} = {}) {
  const normalizedChanges = normalizePlannedChanges(plannedChanges);
  const migrationChanges = normalizedChanges.filter((change) => isMigrationChange(change));

  return {
    migrationDiff: {
      totalMigrationChanges: migrationChanges.length,
      migrations: migrationChanges.map((change, index) => ({
        diffEntryId: change.id ?? `migration-diff-${index + 1}`,
        path: change.path ?? null,
        operation: change.operation ?? "modify",
        summary: change.summary ?? change.command ?? "planned migration change",
        command: change.command ?? null,
        args: Array.isArray(change.args) ? change.args : [],
        dbRisk: inferDbRisk(change),
      })),
      dbRisks: [...new Set(migrationChanges.map((change) => inferDbRisk(change)))],
    },
  };
}
