import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseTimestamp(value) {
  const normalized = normalizeString(value, null);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareTimelineEntries(left = {}, right = {}) {
  const leftTime = parseTimestamp(left.timestamp ?? left.lastSeenAt ?? left.currentLastSeenAt) ?? 0;
  const rightTime = parseTimestamp(right.timestamp ?? right.lastSeenAt ?? right.currentLastSeenAt) ?? 0;

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return `${left.recordId ?? ""}`.localeCompare(`${right.recordId ?? ""}`);
}

function buildSessionMetricRecordId(userSessionMetric = null) {
  const metric = normalizeObject(userSessionMetric);
  return `user-session:${normalizeString(metric.userId, "anonymous")}:${normalizeString(metric.sessionId, "no-session")}:${normalizeString(metric.lastSeenAt, "no-last-seen")}`;
}

function buildActivityRecord({ projectId = null, userActivityEvent = null } = {}) {
  const activity = normalizeObject(userActivityEvent);
  const recordId = normalizeString(activity.userActivityEventId, null);
  if (!recordId) {
    return null;
  }

  return {
    recordType: "user-activity-event",
    recordId,
    projectId: normalizeString(projectId, "unknown-project"),
    timestamp: normalizeString(activity.timestamp, null),
    payload: {
      ...activity,
    },
  };
}

function buildSessionRecord({ projectId = null, userSessionMetric = null } = {}) {
  const metric = normalizeObject(userSessionMetric);
  const recordId = buildSessionMetricRecordId(metric);

  return {
    recordType: "user-session-metric",
    recordId,
    projectId: normalizeString(projectId, "unknown-project"),
    timestamp: normalizeString(metric.lastSeenAt, null),
    payload: {
      ...metric,
      userSessionMetricId: recordId,
    },
  };
}

function buildReturningRecord({ projectId = null, returningUserMetric = null } = {}) {
  const metric = normalizeObject(returningUserMetric);
  const recordId = normalizeString(metric.returningUserMetricId, null);
  if (!recordId) {
    return null;
  }

  return {
    recordType: "returning-user-metric",
    recordId,
    projectId: normalizeString(projectId, "unknown-project"),
    timestamp: normalizeString(metric.currentLastSeenAt, null),
    payload: {
      ...metric,
    },
  };
}

function normalizeStoredRecord(record) {
  const normalized = normalizeObject(record);
  const recordId = normalizeString(normalized.recordId, null);
  const recordType = normalizeString(normalized.recordType, null);
  if (!recordId || !recordType) {
    return null;
  }

  return {
    recordType,
    recordId,
    projectId: normalizeString(normalized.projectId, "unknown-project"),
    timestamp: normalizeString(normalized.timestamp, null),
    payload: normalizeObject(normalized.payload),
  };
}

function buildEmptyActivityHistory(projectId) {
  return {
    userActivityHistoryId: `user-activity-history:${projectId}`,
    status: "ready",
    totalEvents: 0,
    latestTimestamp: null,
    entries: [],
    byUser: {},
  };
}

function buildEmptySessionHistory(projectId) {
  return {
    userSessionHistoryId: `user-session-history:${projectId}`,
    status: "ready",
    totalEntries: 0,
    totalSessions: 0,
    totalReturningSignals: 0,
    latestTimestamp: null,
    entries: [],
    byUser: {},
  };
}

export class UserActivitySessionHistoryStore {
  constructor({ filePath = null } = {}) {
    this.eventLog = filePath ? new FileEventLog({ filePath }) : null;
    this.records = new Map();

    for (const record of this.eventLog?.readAll() ?? []) {
      this.ingestRecord(record, { persist: false });
    }
  }

  ingestRecord(record, { persist = true } = {}) {
    const normalized = normalizeStoredRecord(record);
    if (!normalized) {
      return null;
    }

    if (this.records.has(normalized.recordId)) {
      return this.records.get(normalized.recordId);
    }

    this.records.set(normalized.recordId, normalized);
    if (persist && this.eventLog) {
      this.eventLog.append(normalized);
    }
    return normalized;
  }

  recordSignals({
    projectId = null,
    userActivityEvent = null,
    userSessionMetric = null,
    returningUserMetric = null,
  } = {}) {
    const records = [
      buildActivityRecord({ projectId, userActivityEvent }),
      buildSessionRecord({ projectId, userSessionMetric }),
      buildReturningRecord({ projectId, returningUserMetric }),
    ].filter(Boolean);

    return records.map((record) => this.ingestRecord(record)).filter(Boolean);
  }

  readProjectHistory(projectId = null) {
    const normalizedProjectId = normalizeString(projectId, "unknown-project");
    const records = [...this.records.values()]
      .filter((record) => record.projectId === normalizedProjectId)
      .sort(compareTimelineEntries);

    const activityEntries = [];
    const sessionEntries = [];
    const returningBySessionKey = new Map();

    for (const record of records) {
      if (record.recordType === "user-activity-event") {
        activityEntries.push({
          recordId: record.recordId,
          ...record.payload,
        });
        continue;
      }

      if (record.recordType === "returning-user-metric") {
        const payload = normalizeObject(record.payload);
        const sessionKey = `${normalizeString(payload.userId, "anonymous")}::${normalizeString(payload.sessionId, "no-session")}::${normalizeString(payload.currentLastSeenAt, "no-last-seen")}`;
        returningBySessionKey.set(sessionKey, payload);
        continue;
      }

      if (record.recordType === "user-session-metric") {
        sessionEntries.push({
          recordId: record.recordId,
          ...record.payload,
        });
      }
    }

    const mergedSessionEntries = sessionEntries
      .map((entry) => {
        const sessionKey = `${normalizeString(entry.userId, "anonymous")}::${normalizeString(entry.sessionId, "no-session")}::${normalizeString(entry.lastSeenAt, "no-last-seen")}`;
        const returningMetric = returningBySessionKey.get(sessionKey) ?? null;
        return {
          ...entry,
          returningUserMetricId: normalizeString(returningMetric?.returningUserMetricId, null),
          previousSessionId: normalizeString(returningMetric?.previousSessionId, null),
          previousLastSeenAt: normalizeString(returningMetric?.previousLastSeenAt, null),
          isReturningUser: returningMetric?.isReturningUser === true || entry.isReturningUser === true,
        };
      })
      .sort(compareTimelineEntries);

    const userActivityHistory = activityEntries.reduce((history, entry) => {
      const userKey = normalizeString(entry.userId, "anonymous");
      history.entries.push(entry);
      history.totalEvents += 1;
      history.latestTimestamp = normalizeString(entry.timestamp, history.latestTimestamp);
      history.byUser[userKey] = history.byUser[userKey] ?? {
        totalEvents: 0,
        sessionIds: [],
        latestTimestamp: null,
      };
      history.byUser[userKey].totalEvents += 1;
      if (!history.byUser[userKey].sessionIds.includes(entry.sessionId)) {
        history.byUser[userKey].sessionIds.push(entry.sessionId);
      }
      history.byUser[userKey].latestTimestamp = normalizeString(entry.timestamp, history.byUser[userKey].latestTimestamp);
      return history;
    }, buildEmptyActivityHistory(normalizedProjectId));

    const userSessionHistory = mergedSessionEntries.reduce((history, entry) => {
      const userKey = normalizeString(entry.userId, "anonymous");
      history.entries.push(entry);
      history.totalEntries += 1;
      history.totalSessions += 1;
      history.latestTimestamp = normalizeString(entry.lastSeenAt, history.latestTimestamp);
      if (entry.isReturningUser) {
        history.totalReturningSignals += 1;
      }
      history.byUser[userKey] = history.byUser[userKey] ?? {
        totalSessions: 0,
        returningSessions: 0,
        latestTimestamp: null,
        sessionIds: [],
      };
      history.byUser[userKey].totalSessions += 1;
      if (entry.isReturningUser) {
        history.byUser[userKey].returningSessions += 1;
      }
      if (!history.byUser[userKey].sessionIds.includes(entry.sessionId)) {
        history.byUser[userKey].sessionIds.push(entry.sessionId);
      }
      history.byUser[userKey].latestTimestamp = normalizeString(entry.lastSeenAt, history.byUser[userKey].latestTimestamp);
      return history;
    }, buildEmptySessionHistory(normalizedProjectId));

    return {
      userActivityHistory,
      userSessionHistory,
    };
  }
}

export function createUserActivitySessionHistoryStore(options = {}) {
  return new UserActivitySessionHistoryStore(options);
}

export function createPersistentUserActivitySessionHistoryStore({
  filePath = path.resolve(process.cwd(), "data/user-activity-session-history.ndjson"),
} = {}) {
  return new UserActivitySessionHistoryStore({ filePath });
}

export function createDurableUserActivitySessionHistory({
  projectId = null,
  userActivityEvent = null,
  userSessionMetric = null,
  returningUserMetric = null,
  historyStore = null,
} = {}) {
  const store = historyStore ?? createUserActivitySessionHistoryStore();
  store.recordSignals({
    projectId,
    userActivityEvent,
    userSessionMetric,
    returningUserMetric,
  });

  return store.readProjectHistory(projectId);
}
