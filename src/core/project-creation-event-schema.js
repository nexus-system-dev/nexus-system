function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function defineProjectCreationEventSchema({
  userId = null,
  projectId = null,
  creationSource = null,
  timestamp = null,
} = {}) {
  const normalizedProjectId = normalizeString(projectId);
  const normalizedUserId = normalizeString(userId);
  const normalizedCreationSource = normalizeString(creationSource);
  const normalizedTimestamp = normalizeString(timestamp) ?? new Date().toISOString();

  return {
    projectCreationEvent: {
      projectCreationEventId: `project-creation:${normalizedProjectId ?? "unknown"}:${normalizedTimestamp}`,
      userId: normalizedUserId,
      projectId: normalizedProjectId,
      creationSource: normalizedCreationSource,
      timestamp: normalizedTimestamp,
    },
  };
}
