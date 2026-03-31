function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeClassification(dataPrivacyClassification = null) {
  const normalized = normalizeObject(dataPrivacyClassification);
  return {
    classificationId: normalizeString(normalized.classificationId, null),
    exposureLevel: normalizeString(normalized.exposureLevel, "internal"),
    personalData: normalizeString(normalized.personalData, "none"),
    learningSafety: normalizeString(normalized.learningSafety, "restricted"),
    storageBinding: normalizeObject(normalized.storageBinding),
  };
}

function normalizeRetentionPolicy(retentionPolicy = null) {
  if (typeof retentionPolicy === "string" && retentionPolicy.trim().length > 0) {
    return {
      policyId: retentionPolicy.trim(),
      source: "direct-input",
      retentionAction: null,
      window: null,
      deletionMode: null,
      backupAllowed: null,
      backupConstraints: null,
    };
  }

  const normalized = normalizeObject(retentionPolicy);
  const policyId = normalizeString(normalized.policyId ?? normalized.id, "privacy-fallback-policy");
  return {
    policyId,
    source: normalizeString(normalized.source, "direct-input"),
    retentionAction: normalizeString(normalized.retentionAction, null),
    window: normalizeObject(normalized.window),
    deletionMode: normalizeString(normalized.deletionMode, null),
    backupAllowed: typeof normalized.backupAllowed === "boolean" ? normalized.backupAllowed : null,
    backupConstraints: Object.keys(normalizeObject(normalized.backupConstraints)).length > 0
      ? normalizeObject(normalized.backupConstraints)
      : null,
    protectsArtifacts: normalizeBoolean(normalized.protectsArtifacts, false),
    storageDriver: normalizeString(normalized.storageDriver, null),
  };
}

function buildWindow(windowConfig, fallbackValues) {
  const normalizedWindow = normalizeObject(windowConfig);
  return {
    archiveAfterDays:
      typeof normalizedWindow.archiveAfterDays === "number"
        ? normalizedWindow.archiveAfterDays
        : fallbackValues.archiveAfterDays,
    deleteAfterDays:
      typeof normalizedWindow.deleteAfterDays === "number"
        ? normalizedWindow.deleteAfterDays
        : fallbackValues.deleteAfterDays,
    reviewAfterDays:
      typeof normalizedWindow.reviewAfterDays === "number"
        ? normalizedWindow.reviewAfterDays
        : fallbackValues.reviewAfterDays,
    policyId: fallbackValues.policyId,
  };
}

function buildBaseDecision(classification) {
  if (classification.exposureLevel === "secret") {
    return {
      retentionAction: "delete-required",
      retentionWindow: buildWindow({}, {
        archiveAfterDays: null,
        deleteAfterDays: 7,
        reviewAfterDays: 1,
        policyId: "secret-delete-required",
      }),
      deletionRequired: true,
      deletionMode: "explicit-purge",
      learningAllowed: false,
      backupAllowed: false,
      backupConstraints: {
        backupMode: "blocked",
        requiresExplicitException: true,
      },
      reason: [
        "Secret exposure requires explicit deletion semantics.",
        "Secret data is not eligible for passive learning or standard backups.",
      ],
    };
  }

  if (classification.personalData !== "none" || classification.exposureLevel === "confidential") {
    return {
      retentionAction: "delete-on-expiry",
      retentionWindow: buildWindow({}, {
        archiveAfterDays: 30,
        deleteAfterDays: 90,
        reviewAfterDays: 14,
        policyId: "personal-delete-on-expiry",
      }),
      deletionRequired: false,
      deletionMode: "scheduled-expiry",
      learningAllowed: false,
      backupAllowed: true,
      backupConstraints: {
        backupMode: "encrypted-restricted",
        restoreScope: "authorized-only",
      },
      reason: [
        "Personal or confidential data must expire on a defined retention window.",
        "Learning is disabled because the classification is not learning-safe.",
      ],
    };
  }

  if (classification.learningSafety === "learning-safe") {
    return {
      retentionAction: "keep",
      retentionWindow: buildWindow({}, {
        archiveAfterDays: null,
        deleteAfterDays: null,
        reviewAfterDays: 30,
        policyId: "keep-standard",
      }),
      deletionRequired: false,
      deletionMode: null,
      learningAllowed: true,
      backupAllowed: true,
      backupConstraints: {
        backupMode: "standard",
        restoreScope: "project",
      },
      reason: [
        "Learning-safe non-personal data can be kept under the default retention window.",
      ],
    };
  }

  return {
    retentionAction: "archive",
    retentionWindow: buildWindow({}, {
      archiveAfterDays: 14,
      deleteAfterDays: 180,
      reviewAfterDays: 30,
      policyId: "archive-restricted",
    }),
    deletionRequired: false,
    deletionMode: "scheduled-review",
    learningAllowed: false,
    backupAllowed: true,
    backupConstraints: {
      backupMode: "restricted",
      restoreScope: "workspace",
    },
    reason: [
      "Restricted non-secret data is archived by default instead of being kept open-ended.",
    ],
  };
}

function applyPolicyOverrides(baseDecision, retentionPolicy, reasons) {
  const decision = {
    ...baseDecision,
    retentionWindow: normalizeObject(baseDecision.retentionWindow),
    backupConstraints: baseDecision.backupConstraints ? { ...baseDecision.backupConstraints } : null,
  };

  if (retentionPolicy.policyId === "privacy-fallback-policy") {
    reasons.push("Retention policy was incomplete, so the resolver used deterministic privacy fallback semantics.");
    return decision;
  }

  reasons.push(`Retention policy ${retentionPolicy.policyId} was evaluated as an operational override.`);

  const strictActionMap = {
    keep: 0,
    archive: 1,
    "delete-on-expiry": 2,
    "delete-required": 3,
  };

  const policyAction =
    retentionPolicy.retentionAction
    ?? (["account-lifecycle", "compliance-audit"].includes(retentionPolicy.policyId)
      ? "delete-on-expiry"
      : ["workspace-lifecycle", "learning-governance"].includes(retentionPolicy.policyId)
        ? "archive"
        : ["secret-purge", "no-backup-secret"].includes(retentionPolicy.policyId)
          ? "delete-required"
          : null);

  if (policyAction && strictActionMap[policyAction] > strictActionMap[decision.retentionAction]) {
    decision.retentionAction = policyAction;
    reasons.push(`Retention policy escalated the decision to ${policyAction}.`);
  }

  if (policyAction === "delete-required") {
    decision.deletionRequired = true;
    decision.deletionMode = retentionPolicy.deletionMode ?? "explicit-purge";
    decision.backupAllowed = false;
    decision.backupConstraints = {
      backupMode: "blocked",
      requiresExplicitException: true,
    };
  } else if (policyAction === "delete-on-expiry") {
    decision.deletionMode = retentionPolicy.deletionMode ?? "scheduled-expiry";
  } else if (policyAction === "archive") {
    decision.deletionMode = retentionPolicy.deletionMode ?? "scheduled-review";
  }

  if (Object.keys(retentionPolicy.window ?? {}).length > 0) {
    decision.retentionWindow = buildWindow(retentionPolicy.window, {
      archiveAfterDays: decision.retentionWindow.archiveAfterDays ?? null,
      deleteAfterDays: decision.retentionWindow.deleteAfterDays ?? null,
      reviewAfterDays: decision.retentionWindow.reviewAfterDays ?? null,
      policyId: retentionPolicy.policyId,
    });
  } else {
    decision.retentionWindow = {
      ...decision.retentionWindow,
      policyId: retentionPolicy.policyId,
    };
  }

  if (typeof retentionPolicy.backupAllowed === "boolean") {
    if (decision.backupAllowed === false && retentionPolicy.backupAllowed === true) {
      reasons.push("Retention policy requested backup enablement, but the privacy decision kept backups blocked due to stricter privacy constraints.");
    } else {
      decision.backupAllowed = retentionPolicy.backupAllowed;
      reasons.push(`Retention policy explicitly set backupAllowed=${retentionPolicy.backupAllowed}.`);
    }
  }

  if (retentionPolicy.backupConstraints) {
    decision.backupConstraints = {
      ...(decision.backupConstraints ?? {}),
      ...retentionPolicy.backupConstraints,
    };
  }

  return decision;
}

export function createPrivacyRetentionAndDeletionPolicyResolver({
  dataPrivacyClassification = null,
  retentionPolicy = null,
} = {}) {
  const classification = normalizeClassification(dataPrivacyClassification);
  const normalizedRetentionPolicy = normalizeRetentionPolicy(
    retentionPolicy ?? classification.storageBinding?.retentionPolicy ?? null,
  );
  const reasons = [];
  const classificationMissing =
    !classification.classificationId
    || !classification.exposureLevel
    || !classification.learningSafety;

  if (classificationMissing) {
    reasons.push("Data privacy classification input was incomplete, so the resolver applied deterministic restrictive defaults.");
  } else {
    reasons.push(
      `Classification ${classification.classificationId} entered the resolver as ${classification.exposureLevel}/${classification.personalData}/${classification.learningSafety}.`,
    );
  }

  const baseDecision = classificationMissing
    ? {
        retentionAction: "archive",
        retentionWindow: buildWindow({}, {
          archiveAfterDays: 7,
          deleteAfterDays: 30,
          reviewAfterDays: 7,
          policyId: "privacy-fallback-policy",
        }),
        deletionRequired: false,
        deletionMode: "scheduled-review",
        learningAllowed: false,
        backupAllowed: false,
        backupConstraints: {
          backupMode: "blocked-until-classification",
        },
        reason: [
          "Resolver fallback prevents permissive handling when upstream privacy classification is incomplete.",
        ],
      }
    : buildBaseDecision(classification);

  const decision = applyPolicyOverrides(baseDecision, normalizedRetentionPolicy, reasons);
  const mergedReasons = [...reasons, ...baseDecision.reason];

  if (decision.backupAllowed === false) {
    mergedReasons.push("Backup is restricted by the resolved privacy decision.");
  }
  if (decision.learningAllowed === false) {
    mergedReasons.push("Learning is disabled by the resolved privacy decision.");
  }

  return {
    privacyPolicyDecision: {
      privacyPolicyDecisionId: `privacy-policy:${classification.classificationId ?? "unknown"}:${normalizedRetentionPolicy.policyId}`,
      retentionAction: decision.retentionAction,
      retentionWindow: decision.retentionWindow ?? null,
      deletionRequired: decision.deletionRequired,
      deletionMode: decision.deletionMode,
      learningAllowed: decision.learningAllowed,
      backupAllowed: decision.backupAllowed,
      backupConstraints: decision.backupConstraints ?? null,
      reason: mergedReasons,
      summary: `Privacy policy decision resolved to ${decision.retentionAction} with learning ${decision.learningAllowed ? "enabled" : "disabled"} and backups ${decision.backupAllowed === false ? "restricted" : "allowed"}.`,
    },
  };
}
