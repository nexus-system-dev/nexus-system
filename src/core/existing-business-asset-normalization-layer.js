function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function classifyFileType(fileName) {
  const normalized = normalizeString(fileName)?.toLowerCase() ?? "";
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(normalized)) {
    return "image";
  }
  if (/\.(csv|tsv|xls|xlsx)$/i.test(normalized)) {
    return "data";
  }
  if (/\.(zip|tar|gz|tgz)$/i.test(normalized)) {
    return "archive";
  }
  return "document";
}

function inferRepositoryUrl(projectIntake, gitSnapshot) {
  const repoUrl = normalizeString(gitSnapshot?.repo?.url);
  if (repoUrl) {
    return repoUrl;
  }

  const fullName = normalizeString(gitSnapshot?.repo?.fullName);
  if (fullName) {
    return `https://github.com/${fullName}`;
  }

  const links = normalizeArray(projectIntake?.externalLinks);
  return links.find((link) => /^https?:\/\/(www\.)?github\.com\//i.test(link)) ?? null;
}

function inferRepositoryLabel(projectIntake, gitSnapshot) {
  return normalizeString(gitSnapshot?.repo?.fullName)
    ?? normalizeString(projectIntake?.projectName)
    ?? "connected-repository";
}

function buildAssetIdPrefix(projectId) {
  return normalizeString(projectId) ?? "unknown-project";
}

function registerAsset(registry, asset) {
  if (!asset?.dedupeKey) {
    return;
  }

  const existing = registry.get(asset.dedupeKey);
  if (!existing) {
    registry.set(asset.dedupeKey, {
      ...asset,
      sourceStages: [...new Set(normalizeArray(asset.sourceStages))],
      evidencePaths: [...new Set(normalizeArray(asset.evidencePaths))],
    });
    return;
  }

  registry.set(asset.dedupeKey, {
    ...existing,
    label: existing.label ?? asset.label ?? null,
    fileType: existing.fileType ?? asset.fileType ?? null,
    repository: existing.repository ?? asset.repository ?? null,
    url: existing.url ?? asset.url ?? null,
    path: existing.path ?? asset.path ?? null,
    metadata: {
      ...normalizeObject(existing.metadata),
      ...normalizeObject(asset.metadata),
    },
    sourceStages: [...new Set([...normalizeArray(existing.sourceStages), ...normalizeArray(asset.sourceStages)])],
    evidencePaths: [...new Set([...normalizeArray(existing.evidencePaths), ...normalizeArray(asset.evidencePaths)])],
  });
}

export function createExistingBusinessAssetNormalizationLayer({
  projectId = null,
  projectIntake = null,
  intakeScanHandoff = null,
  scan = null,
  gitSnapshot = null,
} = {}) {
  const intake = normalizeObject(projectIntake);
  const normalizedScan = normalizeObject(scan);
  const knowledge = normalizeObject(normalizedScan.knowledge);
  const docs = normalizeArray(knowledge.docs);
  const uploadedFiles = normalizeArray(intake.uploadedFiles);
  const externalLinks = normalizeArray(intake.externalLinks);
  const repositoryUrl = inferRepositoryUrl(intake, gitSnapshot);
  const uploadedRootReadme = uploadedFiles.some((file) => normalizeString(file?.name)?.toLowerCase() === "readme.md");
  const registry = new Map();
  const assetIdPrefix = buildAssetIdPrefix(projectId);

  for (const uploadedFile of uploadedFiles) {
    const fileName = normalizeString(uploadedFile?.name);
    if (!fileName) {
      continue;
    }

    const normalizedPath = fileName.startsWith("docs/") || fileName === "README.md"
      ? fileName
      : `docs/${fileName}`;

    registerAsset(registry, {
      assetId: `existing-asset:${assetIdPrefix}:file:${normalizedPath.toLowerCase()}`,
      dedupeKey: `file:${normalizedPath.toLowerCase()}`,
      assetType: "file",
      fileType: classifyFileType(fileName),
      label: fileName,
      path: normalizedPath,
      url: null,
      repository: null,
      sourceStages: ["uploaded-intake"],
      evidencePaths: [normalizedPath],
      metadata: {
        uploadType: uploadedFile?.type ?? null,
      },
    });
  }

  const readmePath = normalizeString(knowledge.readme?.path);
  if (readmePath) {
    registerAsset(registry, {
      assetId: `existing-asset:${assetIdPrefix}:file:${readmePath.toLowerCase()}`,
      dedupeKey: `file:${readmePath.toLowerCase()}`,
      assetType: "file",
      fileType: "document",
      label: readmePath,
      path: readmePath,
      url: null,
      repository: null,
      sourceStages: ["project-scan"],
      evidencePaths: [readmePath],
      metadata: {
        knowledgeRole: "readme",
      },
    });
  }

  for (const doc of docs) {
    const docPath = normalizeString(doc?.path);
    if (!docPath) {
      continue;
    }

    const normalizedDocPath = docPath.toLowerCase();
    if (normalizedDocPath === "docs/external-links.md") {
      continue;
    }
    if (normalizedDocPath === "docs/readme.md" && uploadedRootReadme) {
      continue;
    }

    registerAsset(registry, {
      assetId: `existing-asset:${assetIdPrefix}:file:${docPath.toLowerCase()}`,
      dedupeKey: `file:${docPath.toLowerCase()}`,
      assetType: "file",
      fileType: "document",
      label: docPath,
      path: docPath,
      url: null,
      repository: null,
      sourceStages: ["project-scan"],
      evidencePaths: [docPath],
      metadata: {
        knowledgeRole: "document",
      },
    });
  }

  for (const link of externalLinks) {
    const normalizedLink = normalizeString(link);
    if (!normalizedLink || normalizedLink === repositoryUrl) {
      continue;
    }

    registerAsset(registry, {
      assetId: `existing-asset:${assetIdPrefix}:link:${normalizedLink.toLowerCase()}`,
      dedupeKey: `link:${normalizedLink.toLowerCase()}`,
      assetType: "link",
      fileType: null,
      label: normalizedLink,
      path: null,
      url: normalizedLink,
      repository: null,
      sourceStages: ["external-link"],
      evidencePaths: [],
      metadata: {
        hostname: (() => {
          try {
            return new URL(normalizedLink).hostname;
          } catch {
            return null;
          }
        })(),
      },
    });
  }

  if (repositoryUrl) {
    registerAsset(registry, {
      assetId: `existing-asset:${assetIdPrefix}:repo:${repositoryUrl.toLowerCase()}`,
      dedupeKey: `repo:${repositoryUrl.toLowerCase()}`,
      assetType: "repository",
      fileType: null,
      label: inferRepositoryLabel(intake, gitSnapshot),
      path: null,
      url: repositoryUrl,
      repository: {
        provider: normalizeString(gitSnapshot?.provider) ?? "github",
        fullName: normalizeString(gitSnapshot?.repo?.fullName) ?? null,
        defaultBranch: normalizeString(gitSnapshot?.repo?.defaultBranch) ?? null,
      },
      sourceStages: [
        ...(normalizeString(gitSnapshot?.provider) || normalizeObject(gitSnapshot?.repo).fullName ? ["git-snapshot"] : []),
        ...(externalLinks.some((link) => normalizeString(link) === repositoryUrl) ? ["external-link"] : []),
      ],
      evidencePaths: [],
      metadata: {
        branchCount: normalizeArray(gitSnapshot?.branches).length,
        commitCount: normalizeArray(gitSnapshot?.commits).length,
        pullRequestCount: normalizeArray(gitSnapshot?.pullRequests).length,
      },
    });
  }

  const assets = [...registry.values()]
    .map((asset) => ({
      ...asset,
      sourceStages: [...new Set(asset.sourceStages)].sort(),
      evidencePaths: [...new Set(asset.evidencePaths)].sort(),
      metadata: normalizeObject(asset.metadata),
    }))
    .sort((left, right) => left.assetId.localeCompare(right.assetId));

  const fileAssets = assets.filter((asset) => asset.assetType === "file");
  const linkAssets = assets.filter((asset) => asset.assetType === "link");
  const repositoryAssets = assets.filter((asset) => asset.assetType === "repository");
  const importedArtifacts = Number.isFinite(intakeScanHandoff?.importedArtifacts) ? intakeScanHandoff.importedArtifacts : 0;

  const ready = assets.length > 0;
  return {
    existingBusinessAssets: {
      normalizationId: `existing-business-assets:${assetIdPrefix}`,
      status: ready ? "ready" : "not-required",
      projectId: normalizeString(projectId),
      sourceCoverage: {
        hasUploadedFiles: uploadedFiles.length > 0,
        hasExternalLinks: linkAssets.length > 0,
        hasRepository: repositoryAssets.length > 0,
        hasScannerEvidence: Boolean(readmePath) || docs.length > 0,
        hasImportedArtifacts: importedArtifacts > 0,
      },
      summary: {
        totalAssets: assets.length,
        fileAssetCount: fileAssets.length,
        linkAssetCount: linkAssets.length,
        repositoryAssetCount: repositoryAssets.length,
        importedArtifactCount: importedArtifacts,
      },
      diagnosisSeed: {
        projectName: normalizeString(intake.projectName),
        visionText: normalizeString(intake.visionText),
        projectType: normalizeString(intake.projectType) ?? "unknown",
        requestedDeliverables: normalizeArray(intake.requestedDeliverables),
        stack: normalizeObject(normalizedScan.stack),
        knownGaps: normalizeArray(normalizedScan.gaps),
        hasAuth: normalizedScan.findings?.hasAuth === true,
        knowledgeSummary: normalizeString(knowledge.summary),
      },
      importAndContinueSeed: {
        canContinueFromCurrentReality: ready,
        scanRoot: normalizeString(intakeScanHandoff?.scanRoot),
        repositoryUrl,
        nextCapabilities: [
          ...(repositoryAssets.length > 0 ? ["repository-diagnosis"] : []),
          ...(linkAssets.length > 0 ? ["website-diagnosis"] : []),
          ...(fileAssets.length > 0 ? ["document-diagnosis"] : []),
        ],
      },
      assets,
    },
  };
}
