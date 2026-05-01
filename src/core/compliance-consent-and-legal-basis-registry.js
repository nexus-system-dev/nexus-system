function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

const BASELINE_SCOPES = ["data-usage", "learning", "notifications"];
const LEGAL_BASES = new Set([
  "consent",
  "contract",
  "legitimate-interest",
  "legal-obligation",
  "vital-interest",
  "public-task",
  "unknown",
  "custom",
]);
const STATUSES = new Set(["granted", "denied", "withdrawn", "missing", "expired"]);
const SCOPE_TYPES = new Set(["global", "workspace", "project"]);

function normalizeLegalBasis(value) {
  const normalized = normalizeString(value, "unknown")?.toLowerCase() ?? "unknown";
  return LEGAL_BASES.has(normalized) ? normalized : "custom";
}

function normalizeStatus(value) {
  const normalized = normalizeString(value, "missing")?.toLowerCase() ?? "missing";
  return STATUSES.has(normalized) ? normalized : "missing";
}

function normalizeScopeType(value) {
  const normalized = normalizeString(value, "global")?.toLowerCase() ?? "global";
  return SCOPE_TYPES.has(normalized) ? normalized : "global";
}

function inferStatusFromSignals(entry) {
  if (entry.withdrawnAt) {
    return "withdrawn";
  }
  if (entry.expiresAt) {
    const expiresAt = Date.parse(entry.expiresAt);
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      return "expired";
    }
  }
  if (typeof entry.approved === "boolean") {
    return entry.approved ? "granted" : "denied";
  }
  return normalizeStatus(entry.status);
}

function normalizeEntry(entry = {}, fallback = {}) {
  const normalized = normalizeObject(entry);
  const processingScope = normalizeString(normalized.processingScope, fallback.processingScope);
  const scopeType = normalizeScopeType(normalized.scopeType ?? fallback.scopeType);
  const scopeId = normalizeString(
    normalized.scopeId,
    scopeType === "global" ? null : fallback.scopeId ?? null,
  );
  const legalBasis = normalizeLegalBasis(normalized.legalBasis ?? fallback.legalBasis);
  const legalBasisDetails = normalizeObject(normalized.legalBasisDetails);
  const effectiveAt = normalizeString(normalized.effectiveAt, fallback.effectiveAt ?? null);
  const expiresAt = normalizeString(normalized.expiresAt, fallback.expiresAt ?? null);
  const withdrawnAt = normalizeString(normalized.withdrawnAt, fallback.withdrawnAt ?? null);
  const status = inferStatusFromSignals({
    ...normalized,
    withdrawnAt,
    expiresAt,
    status: normalized.status ?? fallback.status,
  });

  return {
    entryId:
      normalizeString(normalized.entryId, null)
      ?? `consent-entry:${fallback.userId ?? "anonymous"}:${scopeType}:${scopeId ?? "global"}:${processingScope ?? "scope"}`,
    userId: normalizeString(normalized.userId, fallback.userId ?? null),
    processingScope: processingScope ?? "unknown-scope",
    scopeType,
    scopeId,
    status,
    legalBasis,
    legalBasisDetails: Object.keys(legalBasisDetails).length > 0 ? legalBasisDetails : null,
    effectiveAt,
    expiresAt,
    withdrawnAt,
  };
}

function createBaselineEntries({ userId, workspaceId, projectId }) {
  return BASELINE_SCOPES.map((processingScope) =>
    normalizeEntry(
      {
        processingScope,
        scopeType: "global",
        status: "missing",
        legalBasis: "unknown",
      },
      { userId, workspaceId, projectId, processingScope },
    ));
}

function deriveEntriesFromConsentRecord({ consentRecord, userId, projectId }) {
  const normalizedConsent = normalizeObject(consentRecord);
  const consentId = normalizeString(normalizedConsent.consentId, null);
  if (!consentId) {
    return [];
  }

  return [
    normalizeEntry(
      {
        entryId: `consent-registry:${consentId}:data-usage`,
        processingScope: "data-usage",
        scopeType: "project",
        scopeId: projectId ?? normalizedConsent.projectId ?? null,
        status: normalizedConsent.approved === false ? "denied" : "granted",
        legalBasis: "consent",
        legalBasisDetails: {
          source: "owner-consent-record",
          actionType: normalizeString(normalizedConsent.actionType, null),
          target: normalizeString(normalizedConsent.target, null),
        },
      },
      { userId, projectId, processingScope: "data-usage" },
    ),
  ];
}

function deriveEntriesFromNotificationPreferences({ notificationPreferences, userId }) {
  const normalizedPreferences = normalizeObject(notificationPreferences);
  const preferenceUserId = normalizeString(normalizedPreferences.userId, null) ?? userId;
  if (!preferenceUserId) {
    return [];
  }

  return [
    normalizeEntry(
      {
        entryId: `consent-registry:${preferenceUserId}:global:notifications-preference`,
        processingScope: "notifications",
        scopeType: "global",
        status: "missing",
        legalBasis: "unknown",
        legalBasisDetails: {
          source: "notification-preferences-signal",
          channels: Array.isArray(normalizedPreferences.channels)
            ? normalizedPreferences.channels.map((channel) => normalizeString(channel, null)).filter(Boolean)
            : [],
          frequency: normalizeString(normalizedPreferences.frequency, null),
        },
      },
      { userId: preferenceUserId, processingScope: "notifications" },
    ),
  ];
}

function mergeEntries(entries = [], baselineEntries = []) {
  const merged = new Map();

  for (const entry of [...baselineEntries, ...entries]) {
    const key = `${entry.processingScope}:${entry.scopeType}:${entry.scopeId ?? "global"}`;
    merged.set(key, entry);
  }

  return [...merged.values()];
}

function specificityRank(entry) {
  if (entry.scopeType === "project") {
    return 3;
  }
  if (entry.scopeType === "workspace") {
    return 2;
  }
  return 1;
}

function selectEffectiveEntries(consentEntries = []) {
  const byScope = new Map();
  for (const entry of consentEntries) {
    const key = entry.processingScope;
    const existing = byScope.get(key);
    if (!existing || specificityRank(entry) >= specificityRank(existing)) {
      byScope.set(key, entry);
    }
  }
  return byScope;
}

function hasValidLegalBasis(entry) {
  if (!entry || ["withdrawn", "expired", "missing", "denied"].includes(entry.status)) {
    return false;
  }

  return entry.legalBasis !== "unknown";
}

function deriveRestriction(entry) {
  if (!entry) {
    return {
      restrictionId: "restriction:missing",
      restrictionType: "processing-prohibited",
      severity: "high",
      processingScope: "unknown",
      status: "active",
      reason: "No effective compliance entry exists.",
    };
  }

  const validBasis = hasValidLegalBasis(entry);

  if (entry.processingScope === "learning") {
    if (entry.status === "granted" && entry.legalBasis === "consent") {
      return null;
    }

    if (validBasis && entry.legalBasis !== "consent") {
      return {
        restrictionId: `restriction:${entry.entryId}`,
        restrictionType: "learning-restricted",
        severity: "medium",
        processingScope: entry.processingScope,
        scopeType: entry.scopeType,
        scopeId: entry.scopeId,
        status: "active",
        reason: `Learning is restricted because it relies on ${entry.legalBasis} instead of active consent.`,
      };
    }

    return {
      restrictionId: `restriction:${entry.entryId}`,
      restrictionType: "learning-prohibited",
      severity: "high",
      processingScope: entry.processingScope,
      scopeType: entry.scopeType,
      scopeId: entry.scopeId,
      status: "active",
      reason: "Learning is prohibited because there is no valid consent or supported alternative legal basis.",
    };
  }

  if (!validBasis) {
    return {
      restrictionId: `restriction:${entry.entryId}`,
      restrictionType: "processing-prohibited",
      severity: "high",
      processingScope: entry.processingScope,
      scopeType: entry.scopeType,
      scopeId: entry.scopeId,
      status: "active",
      reason: `Processing scope ${entry.processingScope} is blocked because consent/legal basis is ${entry.status}.`,
    };
  }

  if (entry.status === "denied") {
    return {
      restrictionId: `restriction:${entry.entryId}`,
      restrictionType: "processing-denied",
      severity: "high",
      processingScope: entry.processingScope,
      scopeType: entry.scopeType,
      scopeId: entry.scopeId,
      status: "active",
      reason: `Processing scope ${entry.processingScope} was explicitly denied.`,
    };
  }

  return null;
}

export function createComplianceConsentAndLegalBasisRegistry({
  userIdentity = null,
  consentRecord = null,
  notificationPreferences = null,
  approvalRecords = [],
  consentEntries = [],
  scopeContext = null,
} = {}) {
  const normalizedUserIdentity = normalizeObject(userIdentity);
  const normalizedScopeContext = normalizeObject(scopeContext);
  const userId = normalizeString(normalizedUserIdentity.userId, null);
  const workspaceId = normalizeString(normalizedScopeContext.workspaceId, null);
  const projectId = normalizeString(normalizedScopeContext.projectId, null);

  const explicitEntries = normalizeArray(consentEntries).map((entry) =>
    normalizeEntry(entry, {
      userId,
      workspaceId,
      projectId,
      processingScope: normalizeString(entry.processingScope, "unknown-scope"),
    })
  );
  const ownerConsentEntries = deriveEntriesFromConsentRecord({ consentRecord, userId, projectId });
  const notificationSignalEntries = deriveEntriesFromNotificationPreferences({ notificationPreferences, userId });
  const baselineEntries = createBaselineEntries({ userId, workspaceId, projectId });

  const mergedEntries = mergeEntries(
    [...explicitEntries, ...ownerConsentEntries, ...notificationSignalEntries],
    baselineEntries,
  );
  const effectiveEntries = selectEffectiveEntries(mergedEntries);
  const activeRestrictions = [...effectiveEntries.values()]
    .map((entry) => deriveRestriction(entry))
    .filter(Boolean);

  const processingScopes = [...new Set(mergedEntries.map((entry) => entry.processingScope))];
  const legalBasisEntries = mergedEntries.map((entry) => ({
    processingScope: entry.processingScope,
    scopeType: entry.scopeType,
    scopeId: entry.scopeId,
    legalBasis: entry.legalBasis,
    legalBasisDetails: entry.legalBasisDetails,
    status: entry.status,
  }));

  const approvalAuditCount = Array.isArray(approvalRecords) ? approvalRecords.length : 0;
  const summary = activeRestrictions.length > 0
    ? `Compliance registry tracks ${processingScopes.length} scopes with ${activeRestrictions.length} active restrictions.`
    : `Compliance registry tracks ${processingScopes.length} scopes with no active restrictions.`;

  return {
    complianceConsentState: {
      complianceConsentStateId: `compliance-consent:${userId ?? "anonymous"}:${projectId ?? workspaceId ?? "global"}`,
      userId,
      consentEntries: mergedEntries,
      processingScopes,
      legalBasisEntries,
      activeRestrictions,
      summary: approvalAuditCount > 0 ? `${summary} Approval audit references: ${approvalAuditCount}.` : summary,
    },
  };
}
