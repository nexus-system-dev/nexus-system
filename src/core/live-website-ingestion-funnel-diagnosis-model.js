function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function pickWebsiteAsset(existingBusinessAssets) {
  return normalizeArray(existingBusinessAssets?.assets).find((asset) => asset?.assetType === "link") ?? null;
}

function inferHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function buildCapabilityReadout(externalSnapshot) {
  const features = normalizeObject(externalSnapshot?.features);
  return [
    {
      capability: "auth",
      status: features.hasAuth ? "present" : "unknown",
      source: "externalSnapshot.features.hasAuth",
    },
    {
      capability: "payments",
      status: features.hasPayments ? "present" : "unknown",
      source: "externalSnapshot.features.hasPayments",
    },
    {
      capability: "analytics",
      status: features.hasAnalytics ? "present" : "unknown",
      source: "externalSnapshot.features.hasAnalytics",
    },
  ];
}

function buildRecommendedActions({ blockedFlows, scanGaps, externalSnapshot }) {
  const actions = [];
  const roadmapContext = normalizeObject(externalSnapshot?.roadmapContext);
  const missingParts = normalizeArray(roadmapContext.knownMissingParts);

  if (blockedFlows.length > 0) {
    actions.push(`Unblock the live-site flow: ${blockedFlows[0]}.`);
  }
  if (missingParts.length > 0) {
    actions.push(`Review missing business capability: ${missingParts[0]}.`);
  }
  if (scanGaps.length > 0) {
    actions.push(`Cross-check site diagnosis against repo gap: ${scanGaps[0]}.`);
  }
  if (actions.length === 0) {
    actions.push("Continue into imported asset task extraction from the diagnosed live website baseline.");
  }

  return actions;
}

function buildDiagnosisSummary({ websiteUrl, hostname, blockedFlows, externalSnapshot }) {
  const health = normalizeObject(externalSnapshot?.health);
  const technical = normalizeObject(externalSnapshot?.technical);
  const status = health.status ?? "unknown";
  const stack = normalizeObject(technical.stack);
  const stackSummary = [stack.frontend, stack.backend, stack.database].filter(Boolean).join(" | ");
  const blockedFlowSummary = blockedFlows.slice(0, 2).join(" | ");

  return {
    canDiagnoseWebsite: true,
    diagnosisStatus: "ready",
    websiteSummary: `${hostname ?? websiteUrl} | health: ${status}`,
    funnelSummary: blockedFlowSummary || "No blocked flows reported from the live website snapshot.",
    stackSummary: stackSummary || "No technical stack summary from the live website snapshot.",
  };
}

export function createLiveWebsiteIngestionFunnelDiagnosisModel({
  projectId = null,
  existingBusinessAssets = null,
  externalSnapshot = null,
  scan = null,
} = {}) {
  const assets = normalizeObject(existingBusinessAssets);
  const websiteAsset = pickWebsiteAsset(assets);

  if (!websiteAsset) {
    return {
      liveWebsiteIngestionAndFunnelDiagnosis: {
        diagnosisId: `live-website-diagnosis:${normalizeString(projectId) ?? "unknown-project"}`,
        status: "not-required",
        projectId: normalizeString(projectId),
        website: null,
        summary: {
          canDiagnoseWebsite: false,
          diagnosisStatus: "not-required",
          nextAction: "Connect a live website source before running website ingestion diagnosis.",
        },
        importContinuation: {
          canContinueFromDiagnosis: false,
          nextCapabilities: normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter(
            (capability) => capability !== "website-diagnosis",
          ),
        },
      },
    };
  }

  const normalizedSnapshot = normalizeObject(externalSnapshot);
  const normalizedScan = normalizeObject(scan);
  const websiteUrl = normalizeString(websiteAsset.url);
  const hostname = normalizeString(websiteAsset?.metadata?.hostname) ?? inferHostname(websiteUrl);
  const blockedFlows = normalizeArray(normalizedSnapshot.blockedFlows);
  const scanGaps = normalizeArray(normalizedScan.gaps);
  const recommendedActions = buildRecommendedActions({
    blockedFlows,
    scanGaps,
    externalSnapshot: normalizedSnapshot,
  });
  const nextCapabilities = [
    "imported-asset-task-extraction",
    ...normalizeArray(assets.importAndContinueSeed?.nextCapabilities).filter((capability) => capability !== "website-diagnosis"),
  ];

  return {
    liveWebsiteIngestionAndFunnelDiagnosis: {
      diagnosisId: `live-website-diagnosis:${normalizeString(projectId) ?? "unknown-project"}`,
      status: "ready",
      projectId: normalizeString(projectId),
      website: {
        url: websiteUrl,
        hostname,
        source: normalizeString(normalizedSnapshot.source) ?? "external-link",
        syncedAt: normalizeString(normalizedSnapshot.syncedAt),
      },
      summary: {
        ...buildDiagnosisSummary({
          websiteUrl,
          hostname,
          blockedFlows,
          externalSnapshot: normalizedSnapshot,
        }),
        nextAction: recommendedActions[0] ?? "Review live website diagnosis findings.",
      },
      siteSignals: {
        health: normalizeObject(normalizedSnapshot.health),
        features: normalizeObject(normalizedSnapshot.features),
        flows: normalizeObject(normalizedSnapshot.flows),
        technical: normalizeObject(normalizedSnapshot.technical),
        capabilityReadiness: buildCapabilityReadout(normalizedSnapshot),
      },
      funnelDiagnosis: {
        blockedFlows,
        knownGaps: scanGaps.slice(0, 5),
        knownMissingParts: normalizeArray(normalizedSnapshot?.roadmapContext?.knownMissingParts),
        criticalDependencies: normalizeArray(normalizedSnapshot?.roadmapContext?.criticalDependencies),
        recommendedActions,
      },
      importContinuation: {
        canContinueFromDiagnosis: true,
        scanRoot: normalizeString(assets.importAndContinueSeed?.scanRoot),
        nextCapabilities: [...new Set(nextCapabilities)],
      },
    },
  };
}
