function truthy(value) {
  return value !== undefined && value !== null;
}

function pickFirst(...values) {
  return values.find((value) => truthy(value));
}

function summarizeHealth({ externalSnapshot, runtimeSnapshot, gitSnapshot }) {
  const ciStatus = runtimeSnapshot?.ci?.[0]?.status ?? null;
  const deploymentStatus = runtimeSnapshot?.deployments?.[0]?.status ?? null;
  const externalStatus = externalSnapshot?.health?.status ?? null;
  const gitConnected = Boolean(gitSnapshot?.repo?.fullName);

  const blockers = [
    ...(externalSnapshot?.health?.blockingIssues ?? []),
    ...(ciStatus && ciStatus !== "success" ? ["CI אינו ירוק"] : []),
    ...(deploymentStatus && !["healthy", "success"].includes(deploymentStatus) ? ["ה־deployment האחרון לא תקין"] : []),
  ];

  return {
    status:
      blockers.length > 0
        ? "blocked"
        : gitConnected || externalStatus === "ok" || ciStatus === "success" || deploymentStatus === "healthy"
          ? "active"
          : "idle",
    blockers,
    sources: {
      external: externalStatus,
      ci: ciStatus,
      deployment: deploymentStatus,
    },
  };
}

export function buildObservedProjectState(project) {
  const previousState = project.state ?? {};
  const normalized = project.normalizedSources ?? null;
  const normalizedScan = normalized?.scan?.data ?? project.scan ?? null;
  const normalizedExternal = normalized?.external?.data ?? project.externalSnapshot ?? null;
  const normalizedGit = normalized?.git?.data ?? project.gitSnapshot ?? null;
  const normalizedRuntime = normalized?.runtime?.data ?? project.runtimeSnapshot ?? null;
  const product = previousState.product ?? {};
  const analytics = previousState.analytics ?? {};
  const knowledge = previousState.knowledge ?? {};
  const stack = previousState.stack ?? {};

  const observedStack = {
    frontend: pickFirst(
      normalizedExternal?.technical?.stack?.frontend,
      normalizedScan?.stack?.frontend?.join(", "),
      stack.frontend,
      "לא זוהה",
    ),
    backend: pickFirst(
      normalizedExternal?.technical?.stack?.backend,
      normalizedScan?.stack?.backend?.join(", "),
      stack.backend,
      "לא זוהה",
    ),
    database: pickFirst(
      normalizedExternal?.technical?.stack?.database,
      normalizedScan?.stack?.database?.join(", "),
      stack.database,
      "לא זוהה",
    ),
  };

  const observedProduct = {
    ...product,
    hasAuth: Boolean(
      pickFirst(
        normalizedExternal?.features?.hasAuth,
        normalizedScan?.findings?.hasAuth,
        product.hasAuth,
      ),
    ),
    hasPaymentIntegration: Boolean(
      pickFirst(
        normalizedExternal?.features?.hasPayments,
        product.hasPaymentIntegration,
      ),
    ),
    hasWallet: Boolean(normalizedExternal?.features?.hasWallet ?? product.hasWallet),
    hasMigrations: Boolean(
      pickFirst(
        normalizedExternal?.technical?.hasMigrations,
        normalizedScan?.findings?.hasMigrations,
        product.hasMigrations,
      ),
    ),
    hasTests: Boolean(
      pickFirst(
        normalizedExternal?.technical?.hasTests,
        normalizedScan?.findings?.hasTests,
        product.hasTests,
      ),
    ),
  };

  const observedAnalytics = {
    ...analytics,
    hasBaselineCampaign: Boolean(
      pickFirst(
        normalizedExternal?.features?.hasAnalytics,
        analytics.hasBaselineCampaign,
      ),
    ),
    runtime: normalizedRuntime?.analytics ?? analytics.runtime ?? null,
    productMetrics: normalizedRuntime?.productMetrics ?? analytics.productMetrics ?? null,
  };

  const observedKnowledge = {
    ...knowledge,
    knownGaps: [
      ...new Set([
        ...(normalizedScan?.gaps ?? []),
        ...(normalizedExternal?.technical?.knownTechnicalGaps ?? []),
        ...(normalizedExternal?.roadmapContext?.knownMissingParts ?? []),
        ...(normalizedRuntime?.ci?.[0]?.status && normalizedRuntime.ci[0].status !== "success"
          ? ["CI נכשל או לא ירוק"]
          : []),
        ...(normalizedRuntime?.deployments?.[0]?.status &&
        !["healthy", "success"].includes(normalizedRuntime.deployments[0].status)
          ? ["ה־deployment האחרון לא בריא"]
          : []),
        ...(normalizedRuntime?.errorLogs?.reduce((sum, item) => sum + (item.count ?? 0), 0) > 0
          ? ["יש שגיאות runtime פעילות"]
          : []),
        ...(knowledge.knownGaps ?? []),
      ]),
    ],
    documents: normalizedScan?.knowledge
      ? {
          summary: normalizedScan.knowledge.summary ?? null,
          readmePath: normalizedScan.knowledge.readme?.path ?? null,
          docCount: normalizedScan.knowledge.docs?.length ?? 0,
          prDiscussionCount: normalizedScan.knowledge.prDiscussions?.length ?? 0,
          notionPageCount: normalizedScan.knowledge.notionPages?.length ?? 0,
        }
      : (knowledge.documents ?? null),
    git: normalizedGit
      ? {
          provider: normalized?.git?.source ?? "git",
          repo: normalizedGit.repo?.fullName ?? null,
          branchCount: normalizedGit.branches?.length ?? 0,
          commitCount: normalizedGit.commits?.length ?? 0,
          pullRequestCount: normalizedGit.pullRequests?.length ?? 0,
        }
      : (knowledge.git ?? null),
    runtime: normalizedRuntime
      ? {
          ciStatus: normalizedRuntime.ci?.[0]?.status ?? null,
          deploymentStatus: normalizedRuntime.deployments?.[0]?.status ?? null,
          monitoringAlerts: normalizedRuntime.monitoring?.filter((item) => item.status !== "ok").length ?? 0,
          errorCount: normalizedRuntime.errorLogs?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0,
        }
      : (knowledge.runtime ?? null),
    externalKnowledge: normalizedScan?.knowledge?.integrations ?? knowledge.externalKnowledge ?? null,
  };

  const health = summarizeHealth({
    externalSnapshot: normalizedExternal ? { health: normalizedExternal.health } : project.externalSnapshot,
    runtimeSnapshot: normalizedRuntime
      ? { ci: normalizedRuntime.ci, deployments: normalizedRuntime.deployments }
      : project.runtimeSnapshot,
    gitSnapshot: normalizedGit ? { repo: normalizedGit.repo } : project.gitSnapshot,
  });

  return {
    businessGoal: project.goal,
    product: observedProduct,
    analytics: observedAnalytics,
    knowledge: observedKnowledge,
    stack: observedStack,
    runtime: {
      ci: normalizedRuntime?.ci ?? previousState.runtime?.ci ?? [],
      testResults: normalizedRuntime?.testResults ?? previousState.runtime?.testResults ?? [],
      deployment: normalizedRuntime?.deployments?.[0] ?? previousState.runtime?.deployment ?? null,
      errorLogs: normalizedRuntime?.errorLogs ?? previousState.runtime?.errorLogs ?? [],
      monitoring: normalizedRuntime?.monitoring ?? previousState.runtime?.monitoring ?? [],
    },
    integrations: {
      casino: normalized?.external?.connected
        ? {
            connected: true,
            syncedAt: normalizedExternal?.syncedAt ?? null,
          }
        : { connected: false, syncedAt: null },
      git: normalized?.git?.connected
        ? {
            connected: true,
            provider: normalized?.git?.source ?? null,
            syncedAt: normalizedGit?.syncedAt ?? null,
          }
        : { connected: false, syncedAt: null },
      runtime: normalized?.runtime?.connected
        ? {
            connected: true,
            syncedAt: normalizedRuntime?.syncedAt ?? null,
          }
        : { connected: false, syncedAt: null },
      notion:
        (normalizedScan?.knowledge?.notionPages?.length ?? 0) > 0
          ? {
              connected: true,
              syncedAt: normalized?.scan?.normalizedAt ?? null,
            }
          : { connected: false, syncedAt: null },
    },
    observed: {
      lastObservedAt: new Date().toISOString(),
      health,
    },
  };
}
