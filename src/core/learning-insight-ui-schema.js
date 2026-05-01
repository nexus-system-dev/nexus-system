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

function toConfidenceScore(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(1, value));
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "high") {
      return 0.85;
    }
    if (normalized === "medium") {
      return 0.6;
    }
    if (normalized === "low") {
      return 0.35;
    }
  }

  return 0.5;
}

function toConfidenceBand(score) {
  if (score >= 0.8) {
    return "high";
  }
  if (score >= 0.55) {
    return "medium";
  }
  return "low";
}

function normalizeTraceSteps(learningTrace) {
  const normalizedTrace = normalizeObject(learningTrace);
  const traceSteps = normalizeArray(normalizedTrace.traceSteps);

  return traceSteps.map((step, index) => {
    const normalizedStep = normalizeObject(step);
    return {
      stepId: normalizeString(normalizedStep.stepId) ?? `learning-trace-step-${index + 1}`,
      title:
        normalizeString(normalizedStep.title)
        ?? normalizeString(normalizedStep.pattern)
        ?? `Trace step ${index + 1}`,
      reasoning: normalizeString(normalizedStep.reasoning) ?? normalizeString(normalizedStep.summary),
      source: normalizeString(normalizedStep.source) ?? normalizeString(normalizedStep.kind) ?? "learning-trace",
    };
  });
}

function buildInsightItems(learningInsights, traceSteps) {
  const normalizedInsights = normalizeObject(learningInsights);
  const items = normalizeArray(normalizedInsights.items);

  if (items.length > 0) {
    return items.map((item, index) => {
      const normalizedItem = normalizeObject(item);
      const confidenceScore = toConfidenceScore(
        normalizedItem.confidenceScore ?? normalizedItem.confidence ?? normalizedItem.strength,
      );

      return {
        insightId: normalizeString(normalizedItem.id) ?? `learning-insight-${index + 1}`,
        title:
          normalizeString(normalizedItem.title)
          ?? normalizeString(normalizedItem.pattern)
          ?? `Learning insight ${index + 1}`,
        pattern:
          normalizeString(normalizedItem.pattern)
          ?? normalizeString(normalizedItem.title)
          ?? "Unclassified pattern",
        summary: normalizeString(normalizedItem.summary) ?? normalizeString(normalizedItem.description),
        confidenceScore,
        confidenceBand: toConfidenceBand(confidenceScore),
        recommendationReasoning:
          normalizeString(normalizedItem.recommendationReasoning)
          ?? normalizeString(normalizedItem.reasoning)
          ?? traceSteps[0]?.reasoning
          ?? null,
        evidence: normalizeArray(normalizedItem.evidence).filter((entry) => entry !== undefined),
      };
    });
  }

  return traceSteps.map((step, index) => ({
    insightId: `learning-insight-${index + 1}`,
    title: step.title,
    pattern: step.title,
    summary: step.reasoning,
    confidenceScore: 0.5,
    confidenceBand: "low",
    recommendationReasoning: step.reasoning,
    evidence: [],
  }));
}

function buildPatterns(insightItems) {
  return insightItems.map((item) => ({
    patternId: `pattern:${item.insightId}`,
    label: item.pattern,
    confidenceBand: item.confidenceBand,
    confidenceScore: item.confidenceScore,
  }));
}

function buildRecommendationReasoning(learningInsights, learningTrace, traceSteps, insightItems) {
  const normalizedInsights = normalizeObject(learningInsights);
  const normalizedTrace = normalizeObject(learningTrace);

  return {
    summary: normalizedTrace.recommendationReasoning
      ?? normalizeString(normalizedInsights.summary)
      ?? insightItems[0]?.recommendationReasoning
      ?? "No learning recommendation reasoning available yet",
    traceSteps,
    dependsOn: [
      "learningInsights.items",
      "learningTrace.traceSteps",
      "learningTrace.recommendationReasoning",
    ],
  };
}

export function defineLearningInsightUiSchema({
  learningInsights = null,
  learningTrace = null,
} = {}) {
  const normalizedInsights = normalizeObject(learningInsights);
  const normalizedTrace = normalizeObject(learningTrace);
  const traceSteps = normalizeTraceSteps(normalizedTrace);
  const insightItems = buildInsightItems(normalizedInsights, traceSteps);
  const patterns = buildPatterns(insightItems);
  const overallConfidenceScore = insightItems.length > 0
    ? insightItems.reduce((sum, item) => sum + item.confidenceScore, 0) / insightItems.length
    : 0.35;

  return {
    learningInsightViewModel: {
      viewModelId: `learning-insight-view:${normalizeString(normalizedInsights.insightSetId) ?? "nexus"}`,
      summary: {
        headline: normalizeString(normalizedInsights.summary) ?? "No learning insights are visible yet",
        totalInsights: insightItems.length,
        patternCount: patterns.length,
        highConfidenceInsights: insightItems.filter((item) => item.confidenceBand === "high").length,
        hasRecommendationReasoning: Boolean(
          normalizedTrace.recommendationReasoning
            ?? normalizedInsights.summary
            ?? insightItems[0]?.recommendationReasoning,
        ),
      },
      insights: insightItems,
      patterns,
      confidence: {
        overallScore: Number(overallConfidenceScore.toFixed(2)),
        band: toConfidenceBand(overallConfidenceScore),
      },
      recommendationReasoning: buildRecommendationReasoning(
        normalizedInsights,
        normalizedTrace,
        traceSteps,
        insightItems,
      ),
    },
  };
}
