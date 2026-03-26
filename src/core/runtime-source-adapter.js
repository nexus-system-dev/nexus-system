import { SourceAdapter } from "./source-adapter.js";

function normalizeCi(summary) {
  if (!summary) {
    return null;
  }

  return {
    provider: summary.provider ?? "unknown",
    status: summary.status ?? "unknown",
    branch: summary.branch ?? null,
    workflow: summary.workflow ?? summary.pipeline ?? null,
    finishedAt: summary.finishedAt ?? null,
  };
}

function normalizeDeployment(summary) {
  if (!summary) {
    return null;
  }

  return {
    environment: summary.environment ?? "unknown",
    status: summary.status ?? "unknown",
    version: summary.version ?? null,
    deployedAt: summary.deployedAt ?? null,
  };
}

export class RuntimeSourceAdapter extends SourceAdapter {
  constructor() {
    super({ type: "runtime-sources" });
  }

  normalize({ snapshot }) {
    const latestCi = snapshot.ci?.[0] ?? null;
    const latestDeployment = snapshot.deployments?.[0] ?? null;
    const errorCount = snapshot.errorLogs?.reduce((sum, item) => sum + (item.count ?? 0), 0) ?? 0;
    const monitoringIncidents = snapshot.monitoring?.filter((item) => item.status !== "ok").length ?? 0;

    return {
      runtimeSnapshot: {
        source: "runtime-sources",
        confidence: 0.9,
        syncedAt: snapshot.syncedAt,
        ci: snapshot.ci ?? [],
        testResults: snapshot.testResults ?? [],
        deployments: snapshot.deployments ?? [],
        errorLogs: snapshot.errorLogs ?? [],
        monitoring: snapshot.monitoring ?? [],
        analytics: snapshot.analytics ?? null,
        productMetrics: snapshot.productMetrics ?? null,
      },
      statePatch: {
        runtime: {
          ci: normalizeCi(latestCi),
          testResults: snapshot.testResults ?? [],
          deployment: normalizeDeployment(latestDeployment),
          errorCount,
          monitoringIncidents,
          analytics: snapshot.analytics ?? null,
          productMetrics: snapshot.productMetrics ?? null,
        },
      },
      approvals: [],
      knownGaps: [
        ...(latestCi && latestCi.status !== "success" ? ["CI נכשל או לא ירוק"] : []),
        ...(latestDeployment && latestDeployment.status !== "healthy" ? ["ה־deployment האחרון לא בריא"] : []),
        ...(errorCount > 0 ? ["יש שגיאות runtime פעילות"] : []),
        ...(monitoringIncidents > 0 ? ["יש התראות monitoring פעילות"] : []),
      ],
    };
  }
}
