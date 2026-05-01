import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProjectCreationEvent(record) {
  const normalized = normalizeObject(record);
  const projectCreationEventId = normalizeString(normalized.projectCreationEventId, null);
  const projectId = normalizeString(normalized.projectId, null);
  const creationSource = normalizeString(normalized.creationSource, null);
  const timestamp = normalizeString(normalized.timestamp, null);

  if (!projectCreationEventId || !projectId || !creationSource || !timestamp) {
    return null;
  }

  return {
    projectCreationEventId,
    userId: normalizeString(normalized.userId, null),
    projectId,
    creationSource,
    timestamp,
  };
}

export class DurableProjectCreationEventHistoryStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/project-creation-events.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalized = normalizeProjectCreationEvent(record);
      if (normalized) {
        this.records.set(normalized.projectCreationEventId, normalized);
      }
    }
  }

  append(event) {
    const normalized = normalizeProjectCreationEvent(event);
    if (!normalized) {
      return null;
    }

    if (this.records.has(normalized.projectCreationEventId)) {
      return this.records.get(normalized.projectCreationEventId);
    }

    this.records.set(normalized.projectCreationEventId, normalized);
    this.eventLog.append(normalized);
    return normalized;
  }

  readAll() {
    return [...this.records.values()].sort((left, right) => {
      const leftTime = Date.parse(left.timestamp) || 0;
      const rightTime = Date.parse(right.timestamp) || 0;
      return leftTime - rightTime;
    });
  }
}

export function createDurableProjectCreationEventHistoryStore(options) {
  return new DurableProjectCreationEventHistoryStore(options);
}
