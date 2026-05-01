function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickAnalyticsAssets(existingBusinessAssets) {
  return normalizeArray(existingBusinessAssets?.assets).filter((asset) => asset?.fileType === "data");
}

function inferAnalyticsProviders(dataAssets, externalSnapshot, runtimeSnapshot) {
  const providers = new Set();
  const analytics = normalizeObject(runtimeSnapshot?.analytics);

  for (const asset of dataAssets) {
    const label = normalizeString(asset?.label)?.toLowerCase() ?? "";
    const path = normalizeString(asset?.path)?.toLowerCase() ?? "";
    if (label.includes("ga") || path.includes("ga")) {
      providers.add("google-analytics");
    }
    if (label.includes("mixpanel") || path.includes("mixpanel")) {
      providers.add("mixpanel");
    }
    if (label.includes("amplitude") || path.includes("amplitude")) {
      providers.add("amplitude");
    }
    if (label.includes("analytics") || path.includes("analytics")) {
      providers.add("analytics-export");
    }
  }

  if (externalSnapshot?.features?.hasAnalytics) {
    providers.add("external-product-analytics");
  }
  if (Object.keys(analytics).length > 0) {
    providers.add("runtime-analytics");
  }

  return [...providers];
}

function buildMetricSummary(runtimeSnapshot, externalSnapshot, dataAssets) {
  const analytics = normalizeObject(runtimeSnapshot?.analytics);
  const productMetrics = normalizeObject(runtimeSnapshot?.productMetrics);
  const metrics = [];

  for (const [name, value] of Object.entries(analytics)) {
    metrics.push({
      metric: name,
      value,
      source: "runtimeSnapshot.analytics",
    });
  }

  for (const [name, value] of Object.entries(productMetrics)) {
    metrics.push({
      metric: name,
      value,
      source: "runtimeSnapshot.productMetrics",
    });
  }

  if (externalSnapshot?.features?.hasAnalytics) {
    metrics.push({
      metric: "externalAnalyticsAvailable",
      value: true,
      source: "externalSnapshot.features.hasAnalytics",
    });
  }

  if (dataAssets.length > 0) {
    metrics.push({
      metric: "importedDataAssets",
      value: dataAssets.length,
      source: "existingBusinessAssets.assets",
    });
  }

  return metrics;
}

function buildRecommendedActions({ dataAssets, runtimeSnapshot, providers }) {
  const actions = [];

  if (dataAssets.length > 0) {
    actions.push(`Map imported analytics export ${dataAssets[0].label ?? dataAssets[0].path ?? "data file"} into canonical growth signals.`);
  }
  if (Object.keys(normalizeObject(runtimeSnapshot?.analytics)).length > 0) {
    actions.push("Compare imported analytics exports against runtime analytics to identify trust gaps.");
  }
  if (providers.length === 0) {
    actions.push("Upload a CSV/XLS analytics export or connect a source that exposes analytics evidence.");
  }
  if (actions.length === 0) {
    actions.push("Continue into imported asset task extraction from the normalized analytics baseline.");
  }

  return actions;
}

export function createImportedAnalyticsNormalizationLayer({
  projectId = null,
  existingBusinessAssets = null,
  externalSnapshot = null,
  runtimeSnapshot = null,
} = {}) {
  const assets = normalizeObject(existingBusinessAssets);
  const dataAssets = pickAnalyticsAssets(assets);
  const runtimeAnalytics = normalizeObject(runtimeSnapshot?.analytics);
  const runtimeProductMetrics = normalizeObject(runtimeSnapshot?.productMetrics);
  const hasImportedEvidence =
    dataAssets.length > 0 || Object.keys(runtimeAnalytics).length > 0 || Object.keys(runtimeProductMetrics).length > 0;

  if (!hasImportedEvidence && externalSnapshot?.features?.hasAnalytics !== true) {
    return {
      importedAnalyticsNormalization: {
        normalizationId: `imported-analytics:${normalizeString(projectId) ?? "unknown-project"}`,
        status: "not-required",
        projectId: normalizeString(projectId),
        summary: {
          canNormalizeImportedAnalytics: false,
          normalizationStatus: "not-required",
          nextAction: "Attach an analytics export or connect analytics evidence before normalizing imported analytics.",
        },
        importContinuation: {
          canContinueFromNormalization: false,
          nextCapabilities: normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter(
            (capability) => capability !== "analytics-import",
          ),
        },
      },
    };
  }

  const providers = inferAnalyticsProviders(dataAssets, externalSnapshot, runtimeSnapshot);
  const normalizedMetrics = buildMetricSummary(runtimeSnapshot, externalSnapshot, dataAssets);
  const recommendedActions = buildRecommendedActions({ dataAssets, runtimeSnapshot, providers });
  const nextCapabilities = [
    "imported-asset-task-extraction",
    ...normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter((capability) => capability !== "analytics-import"),
  ];

  return {
    importedAnalyticsNormalization: {
      normalizationId: `imported-analytics:${normalizeString(projectId) ?? "unknown-project"}`,
      status: "ready",
      projectId: normalizeString(projectId),
      summary: {
        canNormalizeImportedAnalytics: true,
        normalizationStatus: "ready",
        providerCount: providers.length,
        importedAssetCount: dataAssets.length,
        nextAction: recommendedActions[0] ?? "Review normalized imported analytics.",
      },
      evidenceSources: {
        importedFiles: dataAssets.map((asset) => ({
          assetId: asset.assetId ?? null,
          label: asset.label ?? null,
          path: asset.path ?? null,
          sourceStages: normalizeArray(asset.sourceStages),
        })),
        providers,
        runtimeSignalsAvailable: Object.keys(runtimeAnalytics).length > 0 || Object.keys(runtimeProductMetrics).length > 0,
        externalAnalyticsFlag: externalSnapshot?.features?.hasAnalytics === true,
      },
      normalizedSignals: {
        metrics: normalizedMetrics,
        trustNotes: [
          ...(dataAssets.length > 0 ? ["Imported file evidence is available for analytics normalization."] : []),
          ...(Object.keys(runtimeAnalytics).length > 0 ? ["Runtime analytics evidence is available for comparison."] : []),
          ...(externalSnapshot?.features?.hasAnalytics ? ["External source reports analytics capability."] : []),
        ],
      },
      importContinuation: {
        canContinueFromNormalization: true,
        scanRoot: normalizeString(assets.importAndContinueSeed?.scanRoot),
        nextCapabilities: [...new Set(nextCapabilities)],
      },
    },
  };
}
