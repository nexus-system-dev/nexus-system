function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value) {
  return value === true;
}

function normalizeSource(value) {
  const normalized = normalizeString(value, null)?.toLowerCase() ?? null;
  if (normalized === null) {
    return "system";
  }
  if (["manual", "user-upload", "derived", "learning", "analysis"].includes(normalized)) {
    return "derived";
  }
  return "system";
}

function normalizeScope(value) {
  const normalized = normalizeString(value, null)?.toLowerCase() ?? null;
  if (["public", "project", "workspace", "user"].includes(normalized)) {
    return normalized;
  }
  return "project";
}

function normalizeRetentionPolicy(retentionPolicy) {
  if (!retentionPolicy) {
    return null;
  }

  if (typeof retentionPolicy === "string" && retentionPolicy.trim().length > 0) {
    return {
      policyId: retentionPolicy.trim(),
      source: "storage-context",
    };
  }

  if (retentionPolicy && typeof retentionPolicy === "object" && !Array.isArray(retentionPolicy)) {
    return {
      policyId: normalizeString(retentionPolicy.policyId ?? retentionPolicy.id, "custom-retention-policy"),
      source: normalizeString(retentionPolicy.source, "storage-context"),
      ttlDays: typeof retentionPolicy.ttlDays === "number" ? retentionPolicy.ttlDays : null,
      reviewCadence: normalizeString(retentionPolicy.reviewCadence, null),
    };
  }

  return null;
}

function normalizeDataAsset(dataAsset = null) {
  const normalized = normalizeObject(dataAsset);
  const canonicalAsset = {
    assetId: normalizeString(
      normalized.assetId,
      normalizeString(normalized.projectId, "project-state:unknown"),
    ),
    assetType: normalizeString(normalized.assetType, "project-state"),
    scope: normalizeScope(normalized.scope),
    containsPersonalData: normalizeBoolean(
      normalized.containsPersonalData
        ?? normalized.containsIdentifiers
        ?? normalized.containsUserContent,
    ),
    containsSecrets: normalizeBoolean(
      normalized.containsSecrets
        ?? normalized.containsCredentials,
    ),
    containsLearningMaterial: normalizeBoolean(
      normalized.containsLearningMaterial
        ?? normalized.intendedUse === "learning-analysis"
        ?? normalized.intendedUse === "learning"
        ?? false,
    ),
    source: normalizeSource(normalized.source ?? normalized.origin),
  };

  return canonicalAsset;
}

function normalizeStorageContext(storageContext = null) {
  const normalized = normalizeObject(storageContext);
  return {
    projectId: normalizeString(normalized.projectId, "unknown-project"),
    workspaceId: normalizeString(normalized.workspaceId, null),
    storageScope: normalizeString(normalized.storageScope, "project")?.toLowerCase(),
    storageDriver: normalizeString(normalized.storageDriver, "filesystem")?.toLowerCase(),
    retentionPolicy: normalizeRetentionPolicy(normalized.retentionPolicy),
    tenantBoundary: normalizeString(normalized.tenantBoundary, "workspace")?.toLowerCase(),
    workspaceVisibility: normalizeString(normalized.workspaceVisibility, "private")?.toLowerCase(),
    tenantSensitivity: normalizeString(normalized.tenantSensitivity, "medium")?.toLowerCase(),
  };
}

function isSensitivePersonalAsset(asset) {
  return asset.containsPersonalData
    && /(identity|payment|financial|biometric|credential|auth|secret)/i.test(asset.assetType);
}

function hasExplicitSignals(asset, storage) {
  return Boolean(
    asset.containsSecrets
    || asset.containsPersonalData
    || asset.containsLearningMaterial
    || asset.scope === "public"
    || asset.assetType !== "project-state"
    || storage.retentionPolicy !== null,
  );
}

function deriveExposureLevel(asset, storage) {
  if (asset.containsSecrets) {
    return "secret";
  }

  if (asset.containsPersonalData) {
    return "confidential";
  }

  if (asset.scope === "public" && asset.source === "system" && !asset.containsSecrets && !asset.containsPersonalData) {
    return "public";
  }

  return "internal";
}

function derivePersonalData(asset) {
  if (isSensitivePersonalAsset(asset)) {
    return "sensitive-personal";
  }

  if (asset.containsPersonalData) {
    return "personal";
  }

  return "none";
}

function deriveLearningSafety(asset, hasSignals) {
  if (!hasSignals) {
    return "restricted";
  }

  if (asset.containsSecrets) {
    return "prohibited";
  }

  if (asset.containsPersonalData) {
    return "restricted";
  }

  if (asset.containsLearningMaterial || asset.scope === "public") {
    return "learning-safe";
  }

  return "restricted";
}

function deriveConfidence(asset, storage, fallbackApplied) {
  if (fallbackApplied) {
    return 0.28;
  }

  const signalCount = [
    asset.containsSecrets,
    asset.containsPersonalData,
    asset.containsLearningMaterial,
    asset.scope === "public",
    storage.retentionPolicy !== null,
  ].filter(Boolean).length;

  return Math.min(0.95, 0.58 + (signalCount * 0.08));
}

function buildReasoning(asset, storage, { exposureLevel, personalData, learningSafety }, fallbackApplied) {
  const reasoning = [];

  if (fallbackApplied) {
    reasoning.push("Classification used deterministic fallback because the asset carried insufficient privacy signals.");
  }

  if (asset.containsSecrets) {
    reasoning.push("Asset contains secrets, so exposure is elevated to secret and learning is prohibited.");
  }
  if (asset.containsPersonalData) {
    reasoning.push("Asset contains personal data, so the personal-data axis is elevated independently of exposure.");
  }
  if (asset.containsLearningMaterial) {
    reasoning.push("Asset explicitly contains learning material, which keeps the learning axis explicit instead of inferred from storage.");
  }
  if (storage.retentionPolicy?.policyId) {
    reasoning.push(`Storage retention policy ${storage.retentionPolicy.policyId} was bound into storage metadata and confidence only.`);
  }
  reasoning.push(`Storage binding resolved to ${storage.storageScope}/${storage.storageDriver}.`);
  reasoning.push(`Classification resolved as ${exposureLevel}/${personalData}/${learningSafety}.`);

  return reasoning;
}

export function defineDataPrivacyClassificationSchema({
  dataAsset = null,
  storageContext = null,
} = {}) {
  const normalizedAsset = normalizeDataAsset(dataAsset);
  const normalizedStorage = normalizeStorageContext(storageContext);
  const fallbackApplied = !hasExplicitSignals(normalizedAsset, normalizedStorage);
  const exposureLevel = fallbackApplied ? "internal" : deriveExposureLevel(normalizedAsset, normalizedStorage);
  const personalData = fallbackApplied ? "none" : derivePersonalData(normalizedAsset);
  const learningSafety = deriveLearningSafety(normalizedAsset, !fallbackApplied);
  const reasoning = buildReasoning(
    normalizedAsset,
    normalizedStorage,
    { exposureLevel, personalData, learningSafety },
    fallbackApplied,
  );

  return {
    dataPrivacyClassification: {
      classificationId: `data-privacy:${normalizedStorage.projectId}:${normalizedAsset.assetId}`,
      exposureLevel,
      personalData,
      learningSafety,
      storageBinding: {
        storageScope: normalizedStorage.storageScope ?? null,
        storageDriver: normalizedStorage.storageDriver ?? null,
        retentionPolicy: normalizedStorage.retentionPolicy,
      },
      source: normalizedAsset.source,
      confidence: deriveConfidence(normalizedAsset, normalizedStorage, fallbackApplied),
      reasoning,
      summary: `Data privacy classification for ${normalizedAsset.assetType} resolved as ${exposureLevel}/${personalData}/${learningSafety}.`,
    },
  };
}
