function normalizeScreenTemplateSchema(screenTemplateSchema) {
  return screenTemplateSchema && typeof screenTemplateSchema === "object" ? screenTemplateSchema : {};
}

function normalizeLearningInsightViewModel(learningInsightViewModel) {
  return learningInsightViewModel && typeof learningInsightViewModel === "object" ? learningInsightViewModel : {};
}

export function createAiLearningWorkspaceTemplate({
  screenTemplateSchema,
  learningInsightViewModel,
} = {}) {
  const normalizedScreenTemplateSchema = normalizeScreenTemplateSchema(screenTemplateSchema);
  const normalizedLearningInsightViewModel = normalizeLearningInsightViewModel(learningInsightViewModel);
  const regions = Array.isArray(normalizedScreenTemplateSchema.regions)
    ? normalizedScreenTemplateSchema.regions
    : [];

  return {
    aiLearningWorkspaceTemplate: {
      templateId: `ai-learning-workspace:${normalizedScreenTemplateSchema.templateId ?? "workspace"}`,
      templateType: "ai-learning-workspace",
      baseTemplateId: normalizedScreenTemplateSchema.templateId ?? null,
      sections: {
        topbar: {
          enabled: regions.includes("topbar"),
          role: "learning workspace title, scope and quick filters",
        },
        sidebar: {
          enabled: regions.includes("sidebar"),
          role: "navigation between insight clusters and learning views",
        },
        workspacePanels: {
          enabled: regions.includes("workspace-panels") || regions.includes("content-grid"),
          role: "main insight panels, pattern cards and recommendation views",
        },
        assistantRail: {
          enabled: regions.includes("assistant-rail"),
          role: "reasoning, confidence interpretation and recommendation context",
        },
        statusStrip: {
          enabled: regions.includes("status-strip") || regions.includes("summary-strip"),
          role: "learning status, confidence summary and passive learning disclosure",
        },
      },
      composition: {
        primaryComponents: [
          "stat-card",
          "activity-log",
          "key-value-panel",
          "status-chip",
        ],
        secondaryComponents: [
          "banner",
          "table",
          "progress",
        ],
        supportsInsightExploration: true,
        insightCount: Array.isArray(normalizedLearningInsightViewModel.insights)
          ? normalizedLearningInsightViewModel.insights.length
          : 0,
      },
      summary: {
        enabledSections: regions.filter((region) =>
          ["topbar", "sidebar", "workspace-panels", "assistant-rail", "status-strip", "content-grid", "summary-strip"]
            .includes(region),
        ).length,
        supportsLearningInsights: true,
        supportsRecommendationReasoning: true,
      },
    },
  };
}
