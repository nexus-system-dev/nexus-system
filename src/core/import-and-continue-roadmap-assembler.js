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

function createRoadmapItem({ sourceType, sequence, title, detail, priority, evidence, dependencyIds = [] }) {
  const taskId = `import-continue:${sourceType}:${sequence}:${slugify(title)}`;
  return {
    taskId,
    sourceType,
    sequence,
    title,
    detail: normalizeString(detail),
    priority: normalizeString(priority) ?? "medium",
    dependencyIds: normalizeArray(dependencyIds),
    evidence: normalizeArray(evidence).filter(Boolean),
    status: "ready",
  };
}

function getRequiredCapability(sourceType) {
  if (sourceType === "repository") {
    return "repository-diagnosis";
  }
  if (sourceType === "website") {
    return "website-diagnosis";
  }
  if (sourceType === "analytics") {
    return "analytics-import";
  }
  if (sourceType === "documents") {
    return "document-diagnosis";
  }
  return null;
}

function buildCapabilityStatus(existingBusinessAssets) {
  const seed = normalizeObject(existingBusinessAssets?.importAndContinueSeed);
  const availableCapabilities = new Set(normalizeArray(seed.nextCapabilities).filter(Boolean));
  return {
    canContinueFromCurrentReality: seed.canContinueFromCurrentReality === true,
    scanRoot: normalizeString(seed.scanRoot),
    availableCapabilities,
  };
}

function groupTasksBySource(extractedTasks) {
  return normalizeArray(extractedTasks).reduce((groups, task) => {
    const sourceType = normalizeString(task?.sourceType) ?? "unknown";
    if (!groups.has(sourceType)) {
      groups.set(sourceType, []);
    }
    groups.get(sourceType).push(task);
    return groups;
  }, new Map());
}

function summarizeCapabilityStatus({ capabilityStatus, groups }) {
  const coverage = [];
  const missing = [];

  for (const sourceType of groups.keys()) {
    const requiredCapability = getRequiredCapability(sourceType);
    if (!requiredCapability || capabilityStatus.availableCapabilities.has(requiredCapability)) {
      coverage.push(sourceType);
      continue;
    }
    missing.push({
      sourceType,
      requiredCapability,
    });
  }

  return {
    coveredSourceTypes: coverage,
    missingCapabilityCoverage: missing,
  };
}

export function createImportAndContinueRoadmapAssembler({
  projectId = null,
  existingBusinessAssets = null,
  repositoryImportAndCodebaseDiagnosis = null,
  liveWebsiteIngestionAndFunnelDiagnosis = null,
  importedAnalyticsNormalization = null,
  importedAssetTaskExtraction = null,
} = {}) {
  const extraction = normalizeObject(importedAssetTaskExtraction);
  const extractedTasks = normalizeArray(extraction.extractedTasks);

  if (normalizeString(extraction.status) !== "ready" || extractedTasks.length === 0) {
    return {
      importAndContinueRoadmap: {
        roadmapId: `import-and-continue-roadmap:${normalizeString(projectId) ?? "unknown-project"}`,
        status: "missing-inputs",
        projectId: normalizeString(projectId),
        missingInputs: ["imported-asset-task-extraction"],
        roadmapItems: [],
        dependencyGraph: [],
      },
    };
  }

  const capabilityStatus = buildCapabilityStatus(existingBusinessAssets);
  const groups = groupTasksBySource(extractedTasks);
  const sourceOrder = ["repository", "website", "analytics", "documents"];
  const orderedSources = sourceOrder.filter((sourceType) => groups.has(sourceType));
  const fallbackSources = [...groups.keys()].filter((sourceType) => !orderedSources.includes(sourceType));
  const allSources = [...orderedSources, ...fallbackSources];

  const roadmapItems = [];
  const dependencyGraph = [];
  let previousTaskId = null;

  for (const sourceType of allSources) {
    const tasks = groups.get(sourceType) ?? [];
    tasks.forEach((task, index) => {
      const dependencyIds = previousTaskId ? [previousTaskId] : [];
      const roadmapItem = createRoadmapItem({
        sourceType,
        sequence: index + 1,
        title: task.title,
        detail: task.detail,
        priority: task.priority,
        evidence: task.evidence,
        dependencyIds,
      });
      roadmapItems.push(roadmapItem);
      dependencyGraph.push({
        taskId: roadmapItem.taskId,
        dependsOn: dependencyIds,
      });
      previousTaskId = roadmapItem.taskId;
    });
  }

  const { coveredSourceTypes, missingCapabilityCoverage } = summarizeCapabilityStatus({
    capabilityStatus,
    groups,
  });

  const nextAction = roadmapItems[0]?.title ?? "Review imported roadmap assembly.";
  const highestPriority = roadmapItems.find((item) => item.priority === "high")?.title ?? nextAction;
  const upstreamSummary = {
    repositoryReady: normalizeString(repositoryImportAndCodebaseDiagnosis?.status) === "ready",
    websiteReady: normalizeString(liveWebsiteIngestionAndFunnelDiagnosis?.status) === "ready",
    analyticsReady: normalizeString(importedAnalyticsNormalization?.status) === "ready",
    extractionReady: normalizeString(importedAssetTaskExtraction?.status) === "ready",
  };

  return {
    importAndContinueRoadmap: {
      roadmapId: `import-and-continue-roadmap:${normalizeString(projectId) ?? "unknown-project"}`,
      status: "ready",
      projectId: normalizeString(projectId),
      missingInputs: [],
      summary: {
        roadmapStatus: "ready",
        roadmapItemCount: roadmapItems.length,
        sourceCount: allSources.length,
        highestPriorityAction: highestPriority,
        nextAction,
      },
      continuityReadiness: {
        canContinueFromCurrentReality: capabilityStatus.canContinueFromCurrentReality,
        coveredSourceTypes,
        missingCapabilityCoverage,
        scanRoot: capabilityStatus.scanRoot,
      },
      upstreamSummary,
      roadmapItems,
      dependencyGraph,
    },
  };
}
