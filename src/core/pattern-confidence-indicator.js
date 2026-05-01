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

function normalizeConfidenceScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(1, value));
  }

  return 0.35;
}

function toConfidenceTone(confidenceBand) {
  if (confidenceBand === "high") {
    return "trusted";
  }
  if (confidenceBand === "medium") {
    return "watch";
  }
  return "tentative";
}

function toConfidenceLabel(confidenceBand) {
  if (confidenceBand === "high") {
    return "Well established";
  }
  if (confidenceBand === "medium") {
    return "Moderately supported";
  }
  return "Hypothesis";
}

function buildIndicators(learningInsightViewModel) {
  const normalizedViewModel = normalizeObject(learningInsightViewModel);
  const patterns = normalizeArray(normalizedViewModel.patterns);
  const insights = normalizeArray(normalizedViewModel.insights);

  return patterns.map((pattern, index) => {
    const normalizedPattern = normalizeObject(pattern);
    const linkedInsight = insights.find((insight) => insight.pattern === normalizedPattern.label) ?? insights[index] ?? {};
    const confidenceBand =
      normalizeString(normalizedPattern.confidenceBand)
      ?? normalizeString(linkedInsight.confidenceBand)
      ?? "low";
    const confidenceScore = normalizeConfidenceScore(
      normalizedPattern.confidenceScore ?? linkedInsight.confidenceScore,
    );

    return {
      indicatorId: `confidence-indicator:${normalizeString(normalizedPattern.patternId) ?? index + 1}`,
      patternId: normalizeString(normalizedPattern.patternId),
      label:
        normalizeString(normalizedPattern.label)
        ?? normalizeString(linkedInsight.pattern)
        ?? `Pattern ${index + 1}`,
      confidenceBand,
      confidenceScore,
      confidenceLabel: toConfidenceLabel(confidenceBand),
      tone: toConfidenceTone(confidenceBand),
      reasoning:
        normalizeString(linkedInsight.recommendationReasoning)
        ?? normalizeString(linkedInsight.summary),
    };
  });
}

export function createPatternConfidenceIndicator({
  learningInsightViewModel = null,
} = {}) {
  const normalizedViewModel = normalizeObject(learningInsightViewModel);
  const indicators = buildIndicators(normalizedViewModel);

  return {
    confidenceIndicator: {
      indicatorCollectionId: `pattern-confidence:${normalizeString(normalizedViewModel.viewModelId) ?? "nexus"}`,
      indicators,
      summary: {
        totalPatterns: indicators.length,
        highConfidencePatterns: indicators.filter((indicator) => indicator.confidenceBand === "high").length,
        hasTentativePatterns: indicators.some((indicator) => indicator.confidenceBand === "low"),
      },
    },
  };
}
