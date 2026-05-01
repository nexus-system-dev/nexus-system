import path from "node:path";

import { FileEventLog } from "./file-event-log.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeProjectRecord(record) {
  const normalized = normalizeObject(record);
  const projectId = normalizeString(normalized.project?.id ?? normalized.projectId, null);
  if (!projectId) {
    return null;
  }

  const project = normalizeObject(normalized.project);
  const workspaceId =
    normalizeString(normalized.workspaceId, null)
    ?? normalizeString(project.context?.workspaceModel?.workspaceId, null)
    ?? normalizeString(project.state?.workspaceModel?.workspaceId, null);

  return {
    projectId,
    workspaceId,
    storedAt: normalizeString(normalized.storedAt, new Date().toISOString()),
    project,
  };
}

export class DurableProjectWorkspaceStore {
  constructor({
    filePath = path.resolve(process.cwd(), "data/project-workspaces.ndjson"),
  } = {}) {
    this.eventLog = new FileEventLog({ filePath });
    this.records = new Map();

    for (const record of this.eventLog.readAll()) {
      const normalized = normalizeProjectRecord(record);
      if (normalized) {
        this.records.set(normalized.projectId, normalized);
      }
    }
  }

  upsert(project) {
    const normalizedProject = normalizeObject(project);
    const projectId = normalizeString(normalizedProject.id, null);
    if (!projectId) {
      return null;
    }

    const record = normalizeProjectRecord({
      projectId,
      workspaceId:
        normalizedProject.context?.workspaceModel?.workspaceId
        ?? normalizedProject.state?.workspaceModel?.workspaceId
        ?? null,
      storedAt: new Date().toISOString(),
      project: normalizedProject,
    });

    this.records.set(projectId, record);
    this.eventLog.append(record);
    return record;
  }

  getByProjectId(projectId) {
    const normalizedProjectId = normalizeString(projectId, null);
    return normalizedProjectId ? this.records.get(normalizedProjectId) ?? null : null;
  }

  getByWorkspaceId(workspaceId) {
    const normalizedWorkspaceId = normalizeString(workspaceId, null);
    if (!normalizedWorkspaceId) {
      return null;
    }

    for (const record of this.records.values()) {
      if (normalizeString(record.workspaceId, null) === normalizedWorkspaceId) {
        return record;
      }
    }

    return null;
  }

  readAll() {
    return [...this.records.values()];
  }
}

export function createDurableProjectWorkspaceStore(options) {
  return new DurableProjectWorkspaceStore(options);
}
