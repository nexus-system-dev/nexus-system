function createNormalizedSource({
  key,
  connected = false,
  source = "unknown",
  confidence = 0,
  data = null,
}) {
  return {
    key,
    connected,
    source,
    confidence,
    normalizedAt: new Date().toISOString(),
    data,
  };
}

function normalizeScan(scan) {
  if (!scan) {
    return createNormalizedSource({
      key: "scan",
      source: "project-scan",
    });
  }

  return createNormalizedSource({
    key: "scan",
    connected: true,
    source: "project-scan",
    confidence: 0.85,
    data: {
      path: scan.path,
      summary: scan.summary,
      stack: scan.stack,
      frameworks: scan.frameworks ?? null,
      findings: scan.findings ?? {},
      gaps: scan.gaps ?? [],
      architecture: scan.architecture ?? null,
      database: scan.database ?? null,
      messaging: scan.messaging ?? [],
      queues: scan.queues ?? [],
      knowledge: scan.knowledge ?? null,
      evidence: scan.evidence ?? {},
    },
  });
}

function normalizeExternal(externalSnapshot) {
  if (!externalSnapshot) {
    return createNormalizedSource({
      key: "external",
      source: "external",
    });
  }

  return createNormalizedSource({
    key: "external",
    connected: true,
    source: externalSnapshot.source ?? "external",
    confidence: externalSnapshot.confidence ?? 0.9,
    data: {
      syncedAt: externalSnapshot.syncedAt ?? null,
      health: externalSnapshot.health ?? null,
      features: externalSnapshot.features ?? {},
      flows: externalSnapshot.flows ?? {},
      technical: externalSnapshot.technical ?? null,
      roadmapContext: externalSnapshot.roadmapContext ?? null,
      blockedFlows: externalSnapshot.blockedFlows ?? [],
    },
  });
}

function normalizeGit(gitSnapshot) {
  if (!gitSnapshot) {
    return createNormalizedSource({
      key: "git",
      source: "git",
    });
  }

  return createNormalizedSource({
    key: "git",
    connected: true,
    source: gitSnapshot.provider ?? "git",
    confidence: 0.95,
    data: {
      syncedAt: gitSnapshot.syncedAt ?? null,
      repo: gitSnapshot.repo ?? null,
      branches: gitSnapshot.branches ?? [],
      commits: gitSnapshot.commits ?? [],
      pullRequests: gitSnapshot.pullRequests ?? [],
      diffs: gitSnapshot.diffs ?? [],
    },
  });
}

function normalizeRuntime(runtimeSnapshot) {
  if (!runtimeSnapshot) {
    return createNormalizedSource({
      key: "runtime",
      source: "runtime-sources",
    });
  }

  return createNormalizedSource({
    key: "runtime",
    connected: true,
    source: runtimeSnapshot.source ?? "runtime-sources",
    confidence: runtimeSnapshot.confidence ?? 0.9,
    data: {
      syncedAt: runtimeSnapshot.syncedAt ?? null,
      ci: runtimeSnapshot.ci ?? [],
      testResults: runtimeSnapshot.testResults ?? [],
      deployments: runtimeSnapshot.deployments ?? [],
      errorLogs: runtimeSnapshot.errorLogs ?? [],
      monitoring: runtimeSnapshot.monitoring ?? [],
      analytics: runtimeSnapshot.analytics ?? null,
      productMetrics: runtimeSnapshot.productMetrics ?? null,
    },
  });
}

export function normalizeProjectSources(project) {
  const scan = normalizeScan(project.scan);
  const external = normalizeExternal(project.externalSnapshot);
  const git = normalizeGit(project.gitSnapshot);
  const runtime = normalizeRuntime(project.runtimeSnapshot);

  return {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    scan,
    external,
    git,
    runtime,
    knowledge: {
      source: "normalized-layer",
      summary: scan.data?.knowledge?.summary ?? null,
      readme: scan.data?.knowledge?.readme ?? null,
      docs: scan.data?.knowledge?.docs ?? [],
      prDiscussions: scan.data?.knowledge?.prDiscussions ?? [],
      notionPages: scan.data?.knowledge?.notionPages ?? [],
      integrations: scan.data?.knowledge?.integrations ?? null,
    },
  };
}
