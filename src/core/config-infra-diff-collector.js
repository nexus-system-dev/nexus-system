function normalizePlannedChanges(plannedChanges) {
  if (!Array.isArray(plannedChanges)) {
    return [];
  }

  return plannedChanges.filter((change) => change && typeof change === "object");
}

function isInfraChange(change) {
  if (change.kind === "infra" || change.kind === "config") {
    return true;
  }

  const text = [change.path, change.summary, change.command]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("env")
    || text.includes("deploy")
    || text.includes("hosting")
    || text.includes("route")
    || text.includes("routing")
    || text.includes("domain")
    || text.includes("ci")
    || text.includes("pipeline")
    || text.includes("github actions")
    || text.includes("docker")
    || text.includes("nginx")
    || text.includes("vercel")
  );
}

function inferInfraArea(change) {
  const text = [change.path, change.summary, change.command]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("ci") || text.includes("pipeline") || text.includes("github actions") || text.includes("workflow")) {
    return "ci";
  }

  if (text.includes("env")) {
    return "environment";
  }

  if (text.includes("deploy") || text.includes("hosting") || text.includes("vercel")) {
    return "deployment";
  }

  if (text.includes("route") || text.includes("routing") || text.includes("domain") || text.includes("nginx")) {
    return "routing";
  }

  return "infrastructure";
}

export function createConfigInfraDiffCollector({
  plannedChanges,
} = {}) {
  const normalizedChanges = normalizePlannedChanges(plannedChanges);
  const infraChanges = normalizedChanges.filter((change) => isInfraChange(change));

  return {
    infraDiff: {
      totalInfraChanges: infraChanges.length,
      changes: infraChanges.map((change, index) => ({
        diffEntryId: change.id ?? `infra-diff-${index + 1}`,
        path: change.path ?? null,
        operation: change.operation ?? "modify",
        summary: change.summary ?? change.command ?? "planned infrastructure change",
        command: change.command ?? null,
        args: Array.isArray(change.args) ? change.args : [],
        area: inferInfraArea(change),
      })),
      impactedAreas: [...new Set(infraChanges.map((change) => inferInfraArea(change)))],
    },
  };
}
