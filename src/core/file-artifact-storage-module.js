function normalizeArtifactMetadata(artifactMetadata = null) {
  return artifactMetadata && typeof artifactMetadata === "object" && !Array.isArray(artifactMetadata)
    ? artifactMetadata
    : {};
}

function normalizeStorageRequest(storageRequest = null) {
  const normalized = storageRequest && typeof storageRequest === "object" && !Array.isArray(storageRequest)
    ? storageRequest
    : {};

  return {
    projectId: typeof normalized.projectId === "string" ? normalized.projectId : "unknown-project",
    workspaceId: typeof normalized.workspaceId === "string" ? normalized.workspaceId : null,
    runId: typeof normalized.runId === "string" ? normalized.runId : null,
    storageScope: typeof normalized.storageScope === "string" ? normalized.storageScope : "project",
    storageDriver: typeof normalized.storageDriver === "string" ? normalized.storageDriver : "filesystem",
    attachments: Array.isArray(normalized.attachments) ? normalized.attachments : [],
    retentionPolicy: typeof normalized.retentionPolicy === "string" ? normalized.retentionPolicy : "project-lifecycle",
  };
}

function buildArtifactEntries(metadata, request) {
  const artifactRecord = metadata.artifactRecord ?? null;
  const packagedArtifact = metadata.packagedArtifact ?? null;
  const buildArtifacts = Array.isArray(artifactRecord?.artifacts) ? artifactRecord.artifacts : [];
  const outputPaths = Array.isArray(artifactRecord?.outputPaths) ? artifactRecord.outputPaths : [];
  const packagedFiles = Array.isArray(packagedArtifact?.files) ? packagedArtifact.files : [];

  const buildEntries = buildArtifacts.map((artifactName, index) => ({
    storageItemId: `artifact:${request.projectId}:build:${index + 1}`,
    kind: "build-artifact",
    sourceType: "build",
    sourceId: artifactRecord?.buildTarget ?? "unknown-build",
    name: artifactName,
    path: outputPaths[index] ?? `dist/${artifactName}`,
    status: artifactRecord?.status ?? "registered",
  }));

  const packagedEntries = packagedFiles.map((filePath, index) => ({
    storageItemId: `artifact:${request.projectId}:package:${index + 1}`,
    kind: "packaged-file",
    sourceType: "package",
    sourceId: packagedArtifact?.packageFormat ?? "unknown-package",
    name: String(filePath).split("/").pop() ?? `package-file-${index + 1}`,
    path: filePath,
    status: packagedArtifact?.metadata?.verificationStatus ?? "pending",
  }));

  return [...buildEntries, ...packagedEntries];
}

function buildAttachmentEntries(request) {
  return request.attachments
    .filter((item) => item && typeof item === "object")
    .map((attachment, index) => ({
      storageItemId: `attachment:${request.projectId}:${index + 1}`,
      attachmentId: attachment.id ?? `attachment-${index + 1}`,
      kind: "attachment",
      name: typeof attachment.name === "string" ? attachment.name : `attachment-${index + 1}`,
      path:
        typeof attachment.path === "string"
          ? attachment.path
          : `attachments/${request.projectId}/${attachment.id ?? `attachment-${index + 1}`}`,
      contentType: typeof attachment.type === "string" ? attachment.type : "unknown",
      size: typeof attachment.size === "number" ? attachment.size : null,
      status: "stored",
    }));
}

export function createFileAndArtifactStorageModule({
  artifactMetadata = null,
  storageRequest = null,
} = {}) {
  const normalizedMetadata = normalizeArtifactMetadata(artifactMetadata);
  const normalizedRequest = normalizeStorageRequest(storageRequest);
  const artifacts = buildArtifactEntries(normalizedMetadata, normalizedRequest);
  const attachments = buildAttachmentEntries(normalizedRequest);

  return {
    storageRecord: {
      storageRecordId: `storage:${normalizedRequest.projectId}:${normalizedRequest.storageScope}`,
      projectId: normalizedRequest.projectId,
      workspaceId: normalizedRequest.workspaceId,
      runId: normalizedRequest.runId,
      storageScope: normalizedRequest.storageScope,
      storageDriver: normalizedRequest.storageDriver,
      storagePath: `storage/projects/${normalizedRequest.projectId}`,
      artifacts,
      attachments,
      retentionPolicy: normalizedRequest.retentionPolicy,
      status: artifacts.length > 0 || attachments.length > 0 ? "ready" : "empty",
      summary: {
        artifactCount: artifacts.length,
        attachmentCount: attachments.length,
        totalStoredItems: artifacts.length + attachments.length,
      },
      recordedAt: new Date().toISOString(),
    },
  };
}
