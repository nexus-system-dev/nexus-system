function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizePattern(pattern, index) {
  const normalizedPattern = normalizeObject(pattern);

  return {
    patternId: normalizeString(normalizedPattern.patternId) ?? `cross-project-pattern-${index + 1}`,
    label:
      normalizeString(normalizedPattern.label)
      ?? normalizeString(normalizedPattern.category)
      ?? `Pattern ${index + 1}`,
    summary: normalizeString(normalizedPattern.summary) ?? normalizeString(normalizedPattern.reason),
    confidenceBand: normalizeString(normalizedPattern.confidenceBand) ?? "medium",
    scope: normalizeString(normalizedPattern.scope) ?? "anonymized-cross-project",
    evidenceCount:
      typeof normalizedPattern.evidenceCount === "number" && Number.isFinite(normalizedPattern.evidenceCount)
        ? Math.max(0, normalizedPattern.evidenceCount)
        : 0,
  };
}

function sanitizeHint(hint, index) {
  const normalizedHint = normalizeObject(hint);

  return {
    hintId: normalizeString(normalizedHint.hintId) ?? `cross-project-hint-${index + 1}`,
    label:
      normalizeString(normalizedHint.label)
      ?? normalizeString(normalizedHint.title)
      ?? `Recommendation hint ${index + 1}`,
    explanation: normalizeString(normalizedHint.explanation) ?? normalizeString(normalizedHint.reason),
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
      panelId: `cross-project-pattern-panel:${normalizeString(normalizedMemory.registryId) ?? "nexus"}`,
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
