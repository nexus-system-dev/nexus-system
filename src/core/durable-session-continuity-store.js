import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeContinuityRecord(record) {
  const normalized = normalizeObject(record);
  const userId = normalizeString(normalized.userId ?? normalized.sessionState?.userId, null);
  if (!userId) {
    return null;
  }

  return {
    continuityRecordId: normalizeString(
      normalized.continuityRecordId,
      `session-continuity:${userId}:${normalizeString(normalized.sessionState?.sessionId, "no-session")}`,
    ),
    userId,
    sessionState: normalizeObject(normalized.sessionState),
    tokenBundle: normalizeObject(normalized.tokenBundle),
    postAuthRedirect: normalizeObject(normalized.postAuthRedirect),
    authenticationRouteDecision: normalizeObject(normalized.authenticationRouteDecision),
    storedAt: normalizeString(normalized.storedAt, new Date().toISOString()),
  };
}

export class DurableSessionContinuityStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/session-continuity.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalized = normalizeContinuityRecord(record);
      if (normalized) {
        this.records.set(normalized.userId, normalized);
      }
    }
  }

  upsert(record) {
    const normalized = normalizeContinuityRecord(record);
    if (!normalized) {
      return null;
    }

    this.records.set(normalized.userId, normalized);
    this.eventLog.append(normalized);
    return normalized;
  }

  getByUserId(userId) {
    const normalizedUserId = normalizeString(userId, null);
    return normalizedUserId ? this.records.get(normalizedUserId) ?? null : null;
  }

  readAll() {
    return [...this.records.values()];
  }
}

export function createDurableSessionContinuityStore(options) {
  return new DurableSessionContinuityStore(options);
}
