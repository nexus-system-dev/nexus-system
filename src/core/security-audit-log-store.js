import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeRecord(record) {
  return record && typeof record === "object" ? record : null;
}

export class SecurityAuditLogStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/security-audit.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = this.eventLog.readAll();
  }

  append(record) {
    const normalizedRecord = normalizeRecord(record);
    if (!normalizedRecord?.securityAuditId) {
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
    eventType = null,
    severity = null,
    actorId = null,
    limit = 50,
  } = {}) {
    return this.records
      .filter((record) => (projectId ? record.projectId === projectId : true))
      .filter((record) => (workspaceId ? record.workspaceId === workspaceId : true))
      .filter((record) => (eventType ? record.eventType === eventType : true))
      .filter((record) => (severity ? record.severity === severity : true))
      .filter((record) => (actorId ? record.actor?.actorId === actorId : true))
      .slice(-limit);
  }
}

export function createSecurityAuditLogStore(options) {
  return new SecurityAuditLogStore(options);
}
