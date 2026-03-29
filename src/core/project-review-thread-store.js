import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeRecord(record) {
  const normalizedRecord = normalizeObject(record);
  return normalizedRecord.threadId ? normalizedRecord : null;
}

function compareThreads(left = {}, right = {}) {
  const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? 0) || 0;
  const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? 0) || 0;
  return leftTime - rightTime;
}

export class ProjectReviewThreadStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/project-review-threads.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalizedRecord = normalizeRecord(record);
      if (!normalizedRecord) {
        continue;
      }

      this.records.set(normalizedRecord.threadId, normalizedRecord);
    }
  }

  upsert(record) {
    const normalizedRecord = normalizeRecord(record);
    if (!normalizedRecord) {
      return null;
    }

    this.records.set(normalizedRecord.threadId, normalizedRecord);
    this.eventLog.append(normalizedRecord);
    return normalizedRecord;
  }

  getByThreadId(threadId) {
    return this.records.get(threadId) ?? null;
  }

  readAll() {
    return [...this.records.values()].sort(compareThreads);
  }

  query({
    projectId = null,
    workspaceArea = null,
    resourceType = null,
    status = null,
    limit = 50,
  } = {}) {
    return this.readAll()
      .filter((record) => (projectId ? record.projectId === projectId : true))
      .filter((record) => (workspaceArea ? record.contextTarget?.workspaceArea === workspaceArea : true))
      .filter((record) => (resourceType ? record.contextTarget?.resourceType === resourceType : true))
      .filter((record) => (status ? record.status === status : true))
      .slice(-limit);
  }

  appendMessage({
    threadId,
    projectId = null,
    message,
  } = {}) {
    const existing = normalizeObject(this.getByThreadId(threadId));
    const normalizedMessage = normalizeObject(message);
    if (!existing.threadId || !normalizedMessage.messageId) {
      return null;
    }

    const nextRecord = {
      ...existing,
      projectId: projectId ?? existing.projectId ?? null,
      messages: [...normalizeArray(existing.messages), normalizedMessage],
      participants: dedupeParticipants([
        ...normalizeArray(existing.participants),
        {
          participantId: normalizedMessage.authorId ?? "unknown-collaborator",
          displayName: normalizedMessage.authorName ?? "Unknown collaborator",
        },
      ]),
      status: normalizedMessage.status ?? existing.status ?? "open",
      updatedAt: normalizedMessage.createdAt ?? new Date().toISOString(),
    };

    return this.upsert(nextRecord);
  }
}

function dedupeParticipants(participants) {
  const seen = new Set();
  return normalizeArray(participants).filter((participant) => {
    const normalizedParticipant = normalizeObject(participant);
    const participantId = normalizedParticipant.participantId ?? normalizedParticipant.displayName ?? null;
    if (!participantId || seen.has(participantId)) {
      return false;
    }

    seen.add(participantId);
    return true;
  });
}

export function createProjectReviewThreadStore(options) {
  return new ProjectReviewThreadStore(options);
}
