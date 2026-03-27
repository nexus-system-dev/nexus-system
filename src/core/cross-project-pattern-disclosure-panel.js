function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function sanitizePattern(pattern, index) {
  const normalizedPattern = normalizeObject(pattern);

  return {
    patternId: normalizedPattern.patternId ?? `cross-project-pattern-${index + 1}`,
    label: normalizedPattern.label ?? normalizedPattern.category ?? `Pattern ${index + 1}`,
    summary: normalizedPattern.summary ?? normalizedPattern.reason ?? null,
    confidenceBand: normalizedPattern.confidenceBand ?? "medium",
    scope: normalizedPattern.scope ?? "anonymized-cross-project",
    evidenceCount: typeof normalizedPattern.evidenceCount === "number" ? normalizedPattern.evidenceCount : 0,
  };
}

function sanitizeHint(hint, index) {
  const normalizedHint = normalizeObject(hint);

  return {
    hintId: normalizedHint.hintId ?? `cross-project-hint-${index + 1}`,
    label: normalizedHint.label ?? normalizedHint.title ?? `Recommendation hint ${index + 1}`,
    explanation: normalizedHint.explanation ?? normalizedHint.reason ?? null,
  };
}

export function createCrossProjectPatternDisclosurePanel({
  crossProjectMemory = null,
  recommendationHints = null,
} = {}) {
  const normalizedMemory = normalizeObject(crossProjectMemory);
  const patterns = normalizeArray(normalizedMemory.patterns).map(sanitizePattern);
  const hints = normalizeArray(recommendationHints).map(sanitizeHint);

  return {
    crossProjectPatternPanel: {
      panelId: `cross-project-pattern-panel:${normalizedMemory.registryId ?? "nexus"}`,
      patterns,
      recommendationHints: hints,
      disclosure: {
        mode: "anonymized-cross-project",
        containsUserData: false,
        containsProjectIdentifiers: false,
      },
      summary: {
        totalPatterns: patterns.length,
        totalHints: hints.length,
        safeToDisplay: true,
      },
    },
  };
}
