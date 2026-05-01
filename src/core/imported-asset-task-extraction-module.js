function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function createTask({ sourceType, category, title, detail, priority = "medium", evidence = [] }) {
  return {
    extractedTaskId: `imported-task:${sourceType}:${category}:${slugify(title)}`,
    sourceType,
    category,
    title,
    detail,
    priority,
    evidence,
  };
}

function extractRepositoryTasks(repositoryDiagnosis) {
  const diagnosis = normalizeObject(repositoryDiagnosis);
  if (normalizeString(diagnosis.status) !== "ready") {
    return [];
  }

  const gaps = normalizeArray(diagnosis?.diagnosisReadout?.blockingGaps);
  const actions = normalizeArray(diagnosis?.diagnosisReadout?.recommendedActions);
  const tasks = [];

  if (gaps[0]) {
    tasks.push(
      createTask({
        sourceType: "repository",
        category: "codebase-gap",
        title: `Resolve repository gap: ${gaps[0]}`,
        detail: diagnosis.summary?.architectureSummary ?? diagnosis.summary?.codebaseSummary ?? null,
        priority: "high",
        evidence: [diagnosis.repository?.fullName, gaps[0]].filter(Boolean),
      }),
    );
  }

  if (actions[0]) {
    tasks.push(
      createTask({
        sourceType: "repository",
        category: "next-action",
        title: actions[0],
        detail: diagnosis.summary?.nextAction ?? null,
        priority: "medium",
        evidence: [diagnosis.repository?.fullName].filter(Boolean),
      }),
    );
  }

  return tasks;
}

function extractWebsiteTasks(websiteDiagnosis) {
  const diagnosis = normalizeObject(websiteDiagnosis);
  if (normalizeString(diagnosis.status) !== "ready") {
    return [];
  }

  const blockedFlows = normalizeArray(diagnosis?.funnelDiagnosis?.blockedFlows);
  const dependencies = normalizeArray(diagnosis?.funnelDiagnosis?.criticalDependencies);
  const actions = normalizeArray(diagnosis?.funnelDiagnosis?.recommendedActions);
  const tasks = [];

  if (blockedFlows[0]) {
    tasks.push(
      createTask({
        sourceType: "website",
        category: "blocked-flow",
        title: `Unblock website flow: ${blockedFlows[0]}`,
        detail: diagnosis.summary?.funnelSummary ?? null,
        priority: "high",
        evidence: [diagnosis.website?.hostname, blockedFlows[0]].filter(Boolean),
      }),
    );
  }

  if (dependencies[0]) {
    tasks.push(
      createTask({
        sourceType: "website",
        category: "dependency",
        title: `Address website dependency: ${dependencies[0]}`,
        detail: actions[0] ?? null,
        priority: "medium",
        evidence: [diagnosis.website?.url, dependencies[0]].filter(Boolean),
      }),
    );
  }

  return tasks;
}

function extractAnalyticsTasks(analyticsNormalization) {
  const normalization = normalizeObject(analyticsNormalization);
  if (normalizeString(normalization.status) !== "ready") {
    return [];
  }

  const files = normalizeArray(normalization?.evidenceSources?.importedFiles);
  const metrics = normalizeArray(normalization?.normalizedSignals?.metrics);
  const tasks = [];

  if (files[0]) {
    tasks.push(
      createTask({
        sourceType: "analytics",
        category: "data-import",
        title: `Map imported analytics export: ${files[0].label ?? files[0].path ?? "analytics file"}`,
        detail: normalization.summary?.nextAction ?? null,
        priority: "medium",
        evidence: [files[0].path, files[0].label].filter(Boolean),
      }),
    );
  }

  if (metrics[0]) {
    tasks.push(
      createTask({
        sourceType: "analytics",
        category: "metric-truth",
        title: `Validate imported metric truth: ${metrics[0].metric}`,
        detail: `Observed value: ${String(metrics[0].value)}`,
        priority: "medium",
        evidence: [metrics[0].source].filter(Boolean),
      }),
    );
  }

  return tasks;
}

function extractDocumentTasks(existingBusinessAssets) {
  const assets = normalizeObject(existingBusinessAssets);
  const fileAssets = normalizeArray(assets.assets).filter((asset) => asset?.assetType === "file" && asset?.fileType === "document");
  if (fileAssets.length === 0) {
    return [];
  }

  return [
    createTask({
      sourceType: "documents",
      category: "knowledge-review",
      title: `Review imported documentation: ${fileAssets[0].path ?? fileAssets[0].label ?? "document"}`,
      detail: "Convert imported documentation into actionable implementation steps.",
      priority: "low",
      evidence: [fileAssets[0].path, fileAssets[0].label].filter(Boolean),
    }),
  ];
}

export function createImportedAssetTaskExtractionModule({
  projectId = null,
  existingBusinessAssets = null,
  repositoryImportAndCodebaseDiagnosis = null,
  liveWebsiteIngestionAndFunnelDiagnosis = null,
  importedAnalyticsNormalization = null,
} = {}) {
  const extractedTasks = [
    ...extractRepositoryTasks(repositoryImportAndCodebaseDiagnosis),
    ...extractWebsiteTasks(liveWebsiteIngestionAndFunnelDiagnosis),
    ...extractAnalyticsTasks(importedAnalyticsNormalization),
    ...extractDocumentTasks(existingBusinessAssets),
  ];

  if (extractedTasks.length === 0) {
    return {
      importedAssetTaskExtraction: {
        extractionId: `imported-asset-task-extraction:${normalizeString(projectId) ?? "unknown-project"}`,
        status: "missing-inputs",
        projectId: normalizeString(projectId),
        missingInputs: ["imported-diagnosis-surfaces"],
        extractedTasks: [],
      },
    };
  }

  const highPriorityCount = extractedTasks.filter((task) => task.priority === "high").length;
  const sourceCoverage = [...new Set(extractedTasks.map((task) => task.sourceType))];

  return {
    importedAssetTaskExtraction: {
      extractionId: `imported-asset-task-extraction:${normalizeString(projectId) ?? "unknown-project"}`,
      status: "ready",
      projectId: normalizeString(projectId),
      missingInputs: [],
      summary: {
        totalExtractedTasks: extractedTasks.length,
        highPriorityCount,
        sourceCoverage,
        nextAction: extractedTasks[0]?.title ?? "Review extracted imported tasks.",
      },
      extractedTasks,
    },
  };
}
