function normalizePlannedChanges(plannedChanges) {
  if (!Array.isArray(plannedChanges)) {
    return [];
  }

  return plannedChanges.filter((change) => change && typeof change === "object");
}

function isCodeChange(change) {
  if (change.kind === "infra" || change.kind === "config" || change.kind === "migration") {
    return false;
  }

  if (change.kind === "code") {
    return true;
  }

  return (
    typeof change.path === "string"
    && /\.(js|jsx|ts|tsx|mjs|cjs|json|css|scss|mdx?)$/i.test(change.path)
  );
}

export function createCodeDiffCollector({
  plannedChanges,
} = {}) {
  const normalizedChanges = normalizePlannedChanges(plannedChanges);
  const codeChanges = normalizedChanges.filter((change) => isCodeChange(change));

  return {
    codeDiff: {
      totalCodeChanges: codeChanges.length,
      files: codeChanges.map((change, index) => ({
        diffEntryId: change.id ?? `code-diff-${index + 1}`,
        path: change.path ?? null,
        operation: change.operation ?? "modify",
        summary: change.summary ?? change.command ?? "planned code change",
        command: change.command ?? null,
        args: Array.isArray(change.args) ? change.args : [],
      })),
      affectedPaths: codeChanges.map((change) => change.path).filter(Boolean),
    },
  };
}
