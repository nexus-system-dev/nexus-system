import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeUserRecord(record) {
  const normalized = normalizeObject(record);
  const userId = normalizeString(normalized.userIdentity?.userId, null);
  if (!userId) {
    return null;
  }

  return {
    ...normalized,
    userIdentity: normalizeObject(normalized.userIdentity),
  };
}

export class DurableUserAccountStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/user-accounts.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalized = normalizeUserRecord(record);
      if (normalized) {
        this.records.set(normalized.userIdentity.userId, normalized);
      }
    }
  }

  upsert(record) {
    const normalized = normalizeUserRecord(record);
    if (!normalized) {
      return null;
    }

    this.records.set(normalized.userIdentity.userId, normalized);
    this.eventLog.append(normalized);
    return normalized;
  }

  getByUserId(userId) {
    const normalizedUserId = normalizeString(userId, null);
    return normalizedUserId ? this.records.get(normalizedUserId) ?? null : null;
  }

  getByEmail(email) {
    const normalizedEmail = normalizeString(email, null);
    if (!normalizedEmail) {
      return null;
    }

    for (const record of this.records.values()) {
      if (normalizeString(record.userIdentity?.email, null) === normalizedEmail) {
        return record;
      }
    }

    return null;
  }

  readAll() {
    return [...this.records.values()];
  }
}

export function createDurableUserAccountStore(options) {
  return new DurableUserAccountStore(options);
}
