function normalizeDeveloperWorkspace(developerWorkspace = null) {
  return developerWorkspace && typeof developerWorkspace === "object" && !Array.isArray(developerWorkspace)
    ? developerWorkspace
    : {};
}

function normalizeStorageRecord(storageRecord = null) {
  return storageRecord && typeof storageRecord === "object" && !Array.isArray(storageRecord)
    ? storageRecord
    : {};
}

function buildFileTree(developerWorkspace, storageRecord) {
  const workspaceItems = Array.isArray(developerWorkspace.fileTree?.items) ? developerWorkspace.fileTree.items : [];
  const storageArtifacts = Array.isArray(storageRecord.artifacts) ? storageRecord.artifacts : [];
  const storageAttachments = Array.isArray(storageRecord.attachments) ? storageRecord.attachments : [];

  return {
    rootLabel: developerWorkspace.fileTree?.rootLabel ?? storageRecord.projectId ?? "project",
    items: workspaceItems.map((item) => {
      const artifactMatch = storageArtifacts.find((artifact) => artifact.path === item.path);
      const attachmentMatch = storageAttachments.find((attachment) => attachment.path === item.path);

      return {
        fileId: item.fileId,
        path: item.path,
        name: item.name,
        source: item.source,
        isOpen: item.path === developerWorkspace.editor?.activeFilePath
          || (Array.isArray(developerWorkspace.editor?.openFiles)
            && developerWorkspace.editor.openFiles.some((openFile) => openFile.path === item.path)),
        hasInlineDiff: Boolean(
          Array.isArray(developerWorkspace.diffPanel?.sections?.code)
          && developerWorkspace.diffPanel.sections.code.some((entry) => entry.path === item.path),
        ),
        storageItemId: artifactMatch?.storageItemId ?? attachmentMatch?.storageItemId ?? null,
      };
    }),
  };
}

function buildEditorTabs(developerWorkspace) {
  const openFiles = Array.isArray(developerWorkspace.editor?.openFiles) ? developerWorkspace.editor.openFiles : [];

  return openFiles.map((openFile, index) => ({
    tabId: openFile.tabId ?? `editor-tab-${index + 1}`,
    path: openFile.path,
    isActive: openFile.path === developerWorkspace.editor?.activeFilePath,
    isDirty: openFile.isDirty === true,
    hasInlineDiff: openFile.hasDiff === true,
  }));
}

function buildInlineDiffMap(developerWorkspace) {
  const codeEntries = Array.isArray(developerWorkspace.diffPanel?.sections?.code)
    ? developerWorkspace.diffPanel.sections.code
    : [];
  const migrationEntries = Array.isArray(developerWorkspace.diffPanel?.sections?.migrations)
    ? developerWorkspace.diffPanel.sections.migrations
    : [];

  return [...codeEntries, ...migrationEntries].map((entry, index) => ({
    diffId: entry.diffEntryId ?? entry.id ?? `inline-diff-${index + 1}`,
    path: entry.path ?? entry.filePath ?? null,
    kind: migrationEntries.includes(entry) ? "migration" : "code",
    summary: entry.summary ?? entry.reason ?? entry.changeType ?? "pending change",
  }));
}

export function createFileTreeAndEditorContract({
  developerWorkspace = null,
  storageRecord = null,
} = {}) {
  const normalizedWorkspace = normalizeDeveloperWorkspace(developerWorkspace);
  const normalizedStorage = normalizeStorageRecord(storageRecord);
  const fileTree = buildFileTree(normalizedWorkspace, normalizedStorage);
  const editorTabs = buildEditorTabs(normalizedWorkspace);
  const inlineDiffMap = buildInlineDiffMap(normalizedWorkspace);

  return {
    fileEditorContract: {
      contractId: `file-editor:${normalizedWorkspace.workspaceId ?? "unknown-workspace"}`,
      workspaceId: normalizedWorkspace.workspaceId ?? null,
      fileTree,
      editor: {
        activeFilePath: normalizedWorkspace.editor?.activeFilePath ?? null,
        tabs: editorTabs,
        supportsInlineDiff: normalizedWorkspace.editor?.diffAware === true,
      },
      storageBinding: {
        storageRecordId: normalizedStorage.storageRecordId ?? null,
        totalArtifacts: normalizedStorage.summary?.artifactCount ?? 0,
        totalAttachments: normalizedStorage.summary?.attachmentCount ?? 0,
      },
      inlineDiffMap,
    },
  };
}
