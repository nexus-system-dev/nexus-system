function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value) {
  return value === true;
}

function normalizeSensitivity(value) {
  const normalized = normalizeString(value, "medium").toLowerCase();
  if (["critical", "high", "medium", "low"].includes(normalized)) {
    return normalized;
  }
  return "medium";
}

function normalizeDataAsset(dataAsset = null) {
  const normalized = normalizeObject(dataAsset);
  return {
    assetType: normalizeString(normalized.assetType, "project-state"),
    origin: normalizeString(normalized.origin, "system"),
    intendedUse: normalizeString(normalized.intendedUse, "runtime"),
    containsCredentials: normalizeBoolean(normalized.containsCredentials),
    containsUserContent: normalizeBoolean(normalized.containsUserContent),
    containsIdentifiers: normalizeBoolean(normalized.containsIdentifiers),
    tenantSensitivity: normalizeSensitivity(normalized.tenantSensitivity),
  };
}

function normalizeStorageContext(storageContext = null) {
  const normalized = normalizeObject(storageContext);
  return {
    projectId: normalizeString(normalized.projectId, "unknown-project"),
    workspaceId: normalizeString(normalized.workspaceId, null),
    storageScope: normalizeString(normalized.storageScope, "project"),
    storageDriver: normalizeString(normalized.storageDriver, "filesystem"),
    retentionPolicy: normalizeString(normalized.retentionPolicy, "project-lifecycle"),
    tenantBoundary: normalizeString(normalized.tenantBoundary, "workspace"),
    workspaceVisibility: normalizeString(normalized.workspaceVisibility, "private"),
    tenantSensitivity: normalizeSensitivity(normalized.tenantSensitivity),
  };
}

function deriveStorageBinding(storage) {
  return {
    storageScope: storage.storageScope,
    storageDriver: storage.storageDriver,
    retentionPolicy: storage.retentionPolicy,
    tenantBoundary: storage.tenantBoundary,
    workspaceVisibility: storage.workspaceVisibility,
    tenantSensitivity: storage.tenantSensitivity,
  };
}

function derivePersonalData(asset) {
  if (asset.containsIdentifiers && (asset.containsUserContent || asset.assetType.includes("user") || asset.intendedUse.includes("learning"))) {
    return "sensitive-personal";
  }

  if (asset.containsIdentifiers || asset.containsUserContent) {
    return "personal";
  }

  return "none";
}

function deriveExposureLevel(asset, storage) {
  if (
    asset.containsCredentials
    || asset.assetType.includes("credential")
    || asset.assetType.includes("secret")
    || asset.tenantSensitivity === "critical"
    || storage.tenantSensitivity === "critical"
  ) {
    return "secret";
  }

  if (
    derivePersonalData(asset) === "sensitive-personal"
    || ["compliance-audit", "account-lifecycle"].includes(storage.retentionPolicy)
    || asset.tenantSensitivity === "high"
    || storage.tenantSensitivity === "high"
  ) {
    return "confidential";
  }

  if (
    asset.containsUserContent
    || asset.origin === "manual"
    || asset.origin === "user-upload"
    || ["project", "workspace"].includes(storage.storageScope)
  ) {
    return "internal";
  }

  return "public";
}

function deriveLearningSafety(asset, storage, personalData, exposureLevel) {
  if (
    asset.containsCredentials
    || exposureLevel === "secret"
    || asset.intendedUse.includes("credential")
    || asset.intendedUse.includes("security")
  ) {
    return "prohibited";
  }

  if (
    personalData !== "none"
    || ["compliance-audit", "account-lifecycle", "learning-governance"].includes(storage.retentionPolicy)
    || ["critical", "high"].includes(asset.tenantSensitivity)
    || ["critical", "high"].includes(storage.tenantSensitivity)
  ) {
    return "restricted";
  }

  return "learning-safe";
}

function buildReasoning(asset, storage, axes) {
  const reasons = [];

  if (asset.containsCredentials) {
    reasons.push("Asset contains credential material, which elevates exposure and learning restrictions.");
  }
  if (asset.containsIdentifiers) {
    reasons.push("Asset contains identifiers, so personal-data handling must stay explicit.");
  }
  if (asset.containsUserContent) {
    reasons.push("Asset includes user-provided content, which raises internal/privacy expectations.");
  }
  if (["compliance-audit", "account-lifecycle", "learning-governance"].includes(storage.retentionPolicy)) {
    reasons.push(`Retention policy ${storage.retentionPolicy} requires tighter privacy handling.`);
  }
  if (["critical", "high"].includes(asset.tenantSensitivity) || ["critical", "high"].includes(storage.tenantSensitivity)) {
    reasons.push("Tenant sensitivity is elevated, so classification must stay conservative.");
  }
  if (reasons.length === 0) {
    reasons.push("Classification used deterministic defaults because the asset carried limited privacy signals.");
  }

  reasons.push(`Exposure resolved to ${axes.exposureLevel}, personal data to ${axes.personalData}, and learning safety to ${axes.learningSafety}.`);
  return reasons;
}

function deriveSource(asset) {
  if (asset.origin === "manual" || asset.origin === "user-upload") {
    return "manual";
  }

  if (asset.containsCredentials || asset.containsIdentifiers || asset.containsUserContent) {
    return "derived";
  }

  return "system";
}

function deriveConfidence(asset, storage) {
  const signalCount = [
    asset.containsCredentials,
    asset.containsIdentifiers,
    asset.containsUserContent,
    storage.retentionPolicy !== "project-lifecycle",
    ["critical", "high"].includes(asset.tenantSensitivity) || ["critical", "high"].includes(storage.tenantSensitivity),
  ].filter(Boolean).length;

  return Math.min(0.95, 0.55 + (signalCount * 0.08));
}

export function defineDataPrivacyClassificationSchema({
  dataAsset = null,
  storageContext = null,
} = {}) {
  const normalizedAsset = normalizeDataAsset(dataAsset);
  const normalizedStorage = normalizeStorageContext(storageContext);
  const personalData = derivePersonalData(normalizedAsset);
  const exposureLevel = deriveExposureLevel(normalizedAsset, normalizedStorage);
  const learningSafety = deriveLearningSafety(normalizedAsset, normalizedStorage, personalData, exposureLevel);
  const reasoning = buildReasoning(normalizedAsset, normalizedStorage, {
    exposureLevel,
    personalData,
    learningSafety,
  });

  return {
    dataPrivacyClassification: {
      axes: {
        exposureLevel,
        personalData,
        learningSafety,
        storageBinding: deriveStorageBinding(normalizedStorage),
      },
      metadata: {
        classificationId: `data-privacy:${normalizedStorage.projectId}:${normalizedAsset.assetType}`,
        source: deriveSource(normalizedAsset),
        confidence: deriveConfidence(normalizedAsset, normalizedStorage),
        reasoning,
        summary: `Data privacy classification for ${normalizedAsset.assetType} resolved as ${exposureLevel}/${personalData}/${learningSafety}.`,
      },
    },
  };
}
