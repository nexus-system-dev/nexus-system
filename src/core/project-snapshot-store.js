import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferSnapshotReason(snapshot) {
  const lifecyclePhase = snapshot.stateSummary?.lifecyclePhase ?? "unknown";

  if (lifecyclePhase === "execution") {
    return "pre-execution-change";
  }

  if (lifecyclePhase === "release") {
    return "pre-release-change";
  }

  return "pre-major-change";
}

function inferTriggerType(snapshot) {
  const restoreScope = normalizeArray(snapshot.restoreMetadata?.restoreScope);

  if (restoreScope.includes("execution-graph")) {
    return "graph-sensitive-change";
  }

  return "state-change";
}

function buildSnapshotRecord(projectStateSnapshot = null, overrides = null) {
  const normalizedSnapshot = normalizeObject(projectStateSnapshot);
  const normalizedOverrides = normalizeObject(overrides);
  const snapshotId = normalizedSnapshot.snapshotId ?? "project-state-snapshot:unknown-project:v1";
  const stateVersion = normalizedSnapshot.stateVersion ?? 1;
  const executionGraphVersion = normalizedSnapshot.executionGraphVersion ?? 1;

  return {
    snapshotRecordId: `snapshot-record:${snapshotId}`,
    snapshotId,
    projectId: normalizedSnapshot.projectId ?? "unknown-project",
    storageType: "project-snapshot-store",
    triggerType: normalizedOverrides.triggerType ?? inferTriggerType(normalizedSnapshot),
    reason: normalizedOverrides.reason ?? inferSnapshotReason(normalizedSnapshot),
    versions: {
      stateVersion,
      executionGraphVersion,
    },
    workspaceReference: {
      workspaceId: normalizedSnapshot.workspaceReference?.workspaceId ?? null,
      workspaceArea: normalizedSnapshot.workspaceReference?.workspaceArea ?? "developer-workspace",
      workspaceVisibility: normalizedSnapshot.workspaceReference?.workspaceVisibility ?? "workspace",
    },
    restoreMetadata: {
      ...normalizeObject(normalizedSnapshot.restoreMetadata),
      retentionPolicy: "pre-change-history",
      restoreWindow: "project-lifecycle",
    },
    artifactSummary: {
      ...normalizeObject(normalizedSnapshot.artifactSummary),
    },
    restorePayload: {
      ...normalizeObject(normalizedSnapshot.restorePayload),
    },
    storageMetadata: {
      storedAt: new Date().toISOString(),
      checksum: `${normalizedSnapshot.projectId ?? "unknown-project"}:${stateVersion}:${executionGraphVersion}`,
      includesExecutionGraph: executionGraphVersion > 0,
    },
    summary: {
      isStored: true,
      stateVersion,
      executionGraphVersion,
      canRestoreFull: normalizedSnapshot.restoreMetadata?.canRestoreFull ?? true,
    },
  };
}

function normalizeRecord(record) {
  return record && typeof record === "object" ? record : null;
}

function compareStoredRecords(left = {}, right = {}) {
  const leftTime = Date.parse(left?.storageMetadata?.storedAt ?? 0) || 0;
  const rightTime = Date.parse(right?.storageMetadata?.storedAt ?? 0) || 0;
  return leftTime - rightTime;
}

export class ProjectSnapshotStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/project-snapshots.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalizedRecord = normalizeRecord(record);
      if (!normalizedRecord?.snapshotRecordId) {
        continue;
      }

      this.records.set(normalizedRecord.snapshotRecordId, normalizedRecord);
    }
  }

  store(record) {
    const normalizedRecord = normalizeRecord(record);
    if (!normalizedRecord?.snapshotRecordId) {
      return null;
    }

    this.records.set(normalizedRecord.snapshotRecordId, normalizedRecord);
    this.eventLog.append(normalizedRecord);
    return normalizedRecord;
  }

  readAll() {
    return [...this.records.values()].sort(compareStoredRecords);
  }

  getBySnapshotRecordId(snapshotRecordId) {
    return this.records.get(snapshotRecordId) ?? null;
  }

  query({
    projectId = null,
    workspaceId = null,
    triggerType = null,
    reason = null,
    limit = 50,
  } = {}) {
    return this.readAll()
      .filter((record) => (projectId ? record.projectId === projectId : true))
      .filter((record) => (workspaceId ? record.workspaceReference?.workspaceId === workspaceId : true))
      .filter((record) => (triggerType ? record.triggerType === triggerType : true))
      .filter((record) => (reason ? record.reason === reason : true))
      .slice(-limit);
  }
}

export function createProjectSnapshotStore({
  projectStateSnapshot = null,
  recordOverrides = null,
  snapshotStore = null,
  observabilityTransport = null,
  traceId = null,
} = {}) {
  const snapshotRecord = buildSnapshotRecord(projectStateSnapshot, recordOverrides);
  const storedSnapshotRecord =
    snapshotStore && typeof snapshotStore.store === "function"
      ? snapshotStore.store(snapshotRecord)
      : snapshotRecord;

  if (observabilityTransport && typeof observabilityTransport.recordTraceEnvelope === "function") {
    observabilityTransport.recordTraceEnvelope({
      platformTrace: {
        traceId: traceId ?? `${storedSnapshotRecord.snapshotRecordId}:store`,
        route: "/project-snapshots/store",
        method: "SYSTEM",
        service: "project-snapshot-store",
        status: "completed",
        completedAt: new Date().toISOString(),
        steps: [
          {
            stepId: "snapshot-stored",
            source: "project-snapshot-store",
            status: "completed",
            timestamp: new Date().toISOString(),
            message: storedSnapshotRecord.snapshotRecordId,
          },
        ],
      },
      platformLogs: [
        {
          level: "info",
          source: "project-snapshot-store",
          message: `Stored snapshot ${storedSnapshotRecord.snapshotRecordId}`,
          timestamp: new Date().toISOString(),
          metadata: {
            projectId: storedSnapshotRecord.projectId,
            workspaceId: storedSnapshotRecord.workspaceReference?.workspaceId ?? null,
            triggerType: storedSnapshotRecord.triggerType,
          },
        },
      ],
    });
  }

  return {
    snapshotRecord: storedSnapshotRecord,
  };
}

export function createPersistentProjectSnapshotStore(options) {
  return new ProjectSnapshotStore(options);
}
