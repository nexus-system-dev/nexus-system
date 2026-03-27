function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
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
    const confidenceBand = normalizedPattern.confidenceBand ?? linkedInsight.confidenceBand ?? "low";
    const confidenceScore = normalizedPattern.confidenceScore ?? linkedInsight.confidenceScore ?? 0.35;

    return {
      indicatorId: `confidence-indicator:${normalizedPattern.patternId ?? index + 1}`,
      patternId: normalizedPattern.patternId ?? null,
      label: normalizedPattern.label ?? linkedInsight.pattern ?? `Pattern ${index + 1}`,
      confidenceBand,
      confidenceScore,
      confidenceLabel: toConfidenceLabel(confidenceBand),
      tone: toConfidenceTone(confidenceBand),
      reasoning: linkedInsight.recommendationReasoning ?? linkedInsight.summary ?? null,
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
      indicatorCollectionId: `pattern-confidence:${normalizedViewModel.viewModelId ?? "nexus"}`,
      indicators,
      summary: {
        totalPatterns: indicators.length,
        highConfidencePatterns: indicators.filter((indicator) => indicator.confidenceBand === "high").length,
        hasTentativePatterns: indicators.some((indicator) => indicator.confidenceBand === "low"),
      },
    },
  };
}
