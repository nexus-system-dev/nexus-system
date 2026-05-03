function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function inferProviderFromLink(link) {
  const normalized = normalizeString(link, "")?.toLowerCase() ?? "";
  if (normalized.includes("figma")) {
    return "figma";
  }
  if (normalized.includes("sketch")) {
    return "sketch";
  }
  if (normalized.includes("adobe")) {
    return "adobe-xd";
  }
  return "generic-design-tool";
}

function inferProviderFromFile(file) {
  const haystack = [
    normalizeString(file?.name, ""),
    normalizeString(file?.type, ""),
    normalizeString(file?.content, ""),
  ].join(" ").toLowerCase();

  if (haystack.includes("figma")) {
    return "figma";
  }
  if (haystack.includes("sketch")) {
    return "sketch";
  }
  if (haystack.includes("adobe") || haystack.includes("xd")) {
    return "adobe-xd";
  }
  return "design-file";
}

function collectDesignLinks(projectIntake) {
  return normalizeArray(projectIntake.externalLinks).filter((link) =>
    /figma|sketch|adobe|design|ui/i.test(String(link)),
  );
}

function collectDesignFiles(projectIntake) {
  return normalizeArray(projectIntake.uploadedFiles).filter((file) => {
    const name = normalizeString(file?.name, "");
    const type = normalizeString(file?.type, "");
    const content = normalizeString(file?.content, "");
    return /figma|design|ui|sketch|adobe|xd/i.test(`${name} ${type} ${content}`);
  });
}

function resolveStatus({ importMode, safeForRuntimeUse, externalProviderHealthAndFailover }) {
  if (importMode === "missing-inputs") {
    return "missing-inputs";
  }

  if (importMode === "file-ingest") {
    return "ready";
  }

  if (safeForRuntimeUse !== true) {
    return "blocked";
  }

  if (
    normalizeString(externalProviderHealthAndFailover.lifecycleState, "healthy") === "failover"
    || normalizeString(externalProviderHealthAndFailover.integrationStatus, "connected") === "blocked"
  ) {
    return "degraded";
  }

  return "ready";
}

export function createDesignToolImportAdapter({
  projectId = null,
  projectIntake = null,
  externalCapabilityRegistry = null,
  connectorCredentialBinding = null,
  externalProviderHealthAndFailover = null,
} = {}) {
  const intake = normalizeObject(projectIntake);
  const registry = normalizeObject(externalCapabilityRegistry);
  const binding = normalizeObject(connectorCredentialBinding);
  const health = normalizeObject(externalProviderHealthAndFailover);
  const designLinks = collectDesignLinks(intake);
  const designFiles = collectDesignFiles(intake);
  const primaryLink = designLinks[0] ?? null;
  const primaryFile = designFiles[0] ?? null;
  const importMode = primaryLink ? "remote-link" : primaryFile ? "file-ingest" : "missing-inputs";
  const providerType = primaryLink
    ? inferProviderFromLink(primaryLink)
    : primaryFile
      ? inferProviderFromFile(primaryFile)
      : "unknown";
  const safeForRuntimeUse = binding.summary?.safeForRuntimeUse === true;
  const matchingProviderEntry = normalizeArray(registry.providerEntries).find((entry) => {
    const entryProviderType = normalizeString(entry?.providerType, "")?.toLowerCase();
    return entryProviderType === providerType || entryProviderType === "design-tool";
  }) ?? null;
  const missingInputs = [
    designLinks.length === 0 && designFiles.length === 0 ? "design-input" : null,
    importMode === "remote-link" && safeForRuntimeUse !== true ? "connector-credential-binding" : null,
  ].filter(Boolean);
  const status = resolveStatus({
    importMode,
    safeForRuntimeUse,
    externalProviderHealthAndFailover: health,
  });

  return {
    designToolImportAdapter: {
      designToolImportAdapterId: `design-tool-import:${slugify(projectId ?? providerType)}`,
      projectId: normalizeString(projectId),
      status,
      importMode,
      providerType,
      missingInputs,
      source: {
        type: primaryLink ? "external-link" : primaryFile ? "uploaded-file" : "none",
        value: normalizeString(primaryLink, normalizeString(primaryFile?.name)),
      },
      registryBinding: {
        registryEntryId: normalizeString(matchingProviderEntry?.registryEntryId),
        providerCount: Number(registry.summary?.providerCount ?? 0),
        safeForRuntimeUse,
      },
      importArtifacts: {
        linkCount: designLinks.length,
        fileCount: designFiles.length,
        attachmentNames: designFiles.map((file) => normalizeString(file?.name, "unknown-file")),
      },
      importReadiness: {
        canImportToGeneration: missingInputs.length === 0 && status !== "blocked",
        requiresCredentialBinding: importMode === "remote-link",
        requiresFallbackUpload: importMode === "remote-link" && status !== "ready",
      },
      summary: {
        hasDesignInput: designLinks.length > 0 || designFiles.length > 0,
        usesRemoteDesignTool: importMode === "remote-link",
        canProceed: missingInputs.length === 0 && status !== "blocked",
      },
    },
  };
}
