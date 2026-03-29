import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeRecord(record) {
  return record && typeof record === "object" ? record : null;
}

export class SystemAuditLogStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/system-audit.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = this.eventLog.readAll();
  }

  append(record) {
    const normalizedRecord = normalizeRecord(record);
    if (!normalizedRecord?.auditLogId) {
      return null;
    }

    this.records.push(normalizedRecord);
    this.eventLog.append(normalizedRecord);
    return normalizedRecord;
  }

  readAll() {
    return [...this.records];
  }

  query({
    projectId = null,
    workspaceId = null,
    category = null,
    actorId = null,
    limit = 50,
  } = {}) {
    return this.records
      .filter((record) => (projectId ? record.projectId === projectId : true))
      .filter((record) => (workspaceId ? record.workspaceId === workspaceId : true))
      .filter((record) => (category ? record.category === category : true))
      .filter((record) => (actorId ? record.actorId === actorId : true))
      .slice(-limit);
  }
}

export function createSystemAuditLogStore(options) {
  return new SystemAuditLogStore(options);
}
