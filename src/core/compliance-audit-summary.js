function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function toScope(scopeType = null, scopeId = null) {
  return {
    scopeType: normalizeString(scopeType, null),
    scopeId: normalizeString(scopeId, null),
  };
}

function buildPrivacyOverview(classification, decision) {
  if (!classification.classificationId && !decision.privacyPolicyDecisionId) {
    return null;
  }

  return {
    classificationId: classification.classificationId ?? null,
    exposureLevel: classification.exposureLevel ?? null,
    personalData: classification.personalData ?? null,
    learningSafety: classification.learningSafety ?? null,
    retentionAction: decision.retentionAction ?? null,
    deletionRequired: decision.deletionRequired ?? null,
    backupAllowed: typeof decision.backupAllowed === "boolean" ? decision.backupAllowed : null,
    posture:
      classification.exposureLevel === "secret"
      || decision.retentionAction === "delete-required"
        ? "high-sensitivity"
        : classification.exposureLevel === "confidential"
          ? "controlled"
          : "standard",
  };
}

function countBy(items, key) {
  return normalizeArray(items).reduce((totals, item) => {
    const normalized = normalizeString(item?.[key], "unknown");
    totals[normalized] = (totals[normalized] ?? 0) + 1;
    return totals;
  }, {});
}

function buildConsentOverview(consentState) {
  if (!consentState.complianceConsentStateId) {
    return null;
  }

  const consentEntries = normalizeArray(consentState.consentEntries);
  const legalBasisEntries = normalizeArray(consentState.legalBasisEntries);
  const statusCounts = countBy(consentEntries, "status");
  const legalBasisCounts = countBy(legalBasisEntries, "legalBasis");
  const effectiveLearningEntry = legalBasisEntries.find((entry) => entry.processingScope === "learning") ?? null;

  return {
    consentEntryCount: consentEntries.length,
    processingScopes: Array.isArray(consentState.processingScopes) ? consentState.processingScopes : [],
    statusCounts,
    legalBasisCounts,
    effectiveLearningBasis: effectiveLearningEntry
      ? {
          legalBasis: effectiveLearningEntry.legalBasis ?? "unknown",
          status: effectiveLearningEntry.status ?? "missing",
          scope: toScope(effectiveLearningEntry.scopeType, effectiveLearningEntry.scopeId),
        }
      : null,
    posture:
      (statusCounts.missing ?? 0) > 0
      || (statusCounts.withdrawn ?? 0) > 0
      || (statusCounts.expired ?? 0) > 0
        ? "gaps-present"
        : (statusCounts.denied ?? 0) > 0
          ? "restricted"
          : "covered",
  };
}

function buildRightsExecutionOverview(privacyRightsResult) {
  if (!privacyRightsResult.privacyRequestId) {
    return null;
  }

  const executedActions = normalizeArray(privacyRightsResult.executedActions);
  const actionCounts = countBy(executedActions, "status");
  return {
    latestPrivacyRequestId: privacyRightsResult.privacyRequestId,
    latestRequestStatus: privacyRightsResult.status ?? "unknown",
    successfulActions: actionCounts.success ?? 0,
    skippedActions: actionCounts.skipped ?? 0,
    failedActions: actionCounts.failed ?? 0,
    affectedScopes: normalizeArray(privacyRightsResult.affectedScopes),
    notableIssues: executedActions
      .filter((action) => ["skipped", "failed"].includes(action.status))
      .map((action) => ({
        actionType: action.actionType ?? "unknown-action",
        target: action.target ?? null,
        details: action.details ?? null,
      })),
  };
}

function buildLearningRestrictionOverview({ classification, decision, consentState, privacyRightsResult }) {
  const learningRestrictions = normalizeArray(consentState.activeRestrictions)
    .filter((restriction) => restriction.processingScope === "learning");
  const latestLearningRequest =
    privacyRightsResult.requestType === "learning-opt-out"
      ? privacyRightsResult
      : null;

  return {
    learningSafety: classification.learningSafety ?? "restricted",
    learningAllowed: typeof decision.learningAllowed === "boolean" ? decision.learningAllowed : false,
    restrictionLevel:
      learningRestrictions.some((entry) => entry.restrictionType === "learning-prohibited")
      || decision.learningAllowed === false
      || classification.learningSafety === "prohibited"
        ? "prohibited"
        : learningRestrictions.length > 0 || classification.learningSafety === "restricted"
          ? "restricted"
          : "allowed",
    activeLearningRestrictions: learningRestrictions,
    latestOptOutRequest:
      latestLearningRequest && latestLearningRequest.privacyRequestId
        ? {
            privacyRequestId: latestLearningRequest.privacyRequestId,
            status: latestLearningRequest.status ?? "unknown",
          }
        : null,
  };
}

function buildAuditReferences({ consentState, privacyRightsResult, projectAuditRecord, projectAuditPayload }) {
  const references = [];

  const normalizedRights = normalizeObject(privacyRightsResult);
  if (normalizedRights.privacyRequestId) {
    const firstScope = normalizeArray(normalizedRights.affectedScopes)[0] ?? {};
    references.push({
      referenceId: `audit-reference:privacy-rights:${normalizedRights.privacyRequestId}`,
      referenceType: "privacy-rights-result",
      recordId: normalizedRights.privacyRequestId,
      timestamp: normalizedRights.executedAt ?? null,
      scope: toScope(firstScope.scopeType, firstScope.scopeId),
      reason: "Latest privacy rights execution result contributes to the current compliance posture.",
    });
  }

  const normalizedAuditRecord = normalizeObject(projectAuditRecord);
  if (normalizedAuditRecord.projectAuditRecordId) {
    references.push({
      referenceId: `audit-reference:project-audit-record:${normalizedAuditRecord.projectAuditRecordId}`,
      referenceType: "project-audit-record",
      recordId: normalizedAuditRecord.projectAuditRecordId,
      timestamp: normalizedAuditRecord.timestamp ?? normalizedAuditRecord.recordedAt ?? null,
      scope: toScope("project", normalizedAuditRecord.projectId ?? null),
      reason: "Latest project audit record backs the current compliance snapshot.",
    });
  }

  const normalizedAuditPayload = normalizeObject(projectAuditPayload);
  if (normalizedAuditPayload.projectAuditPayloadId) {
    references.push({
      referenceId: `audit-reference:project-audit-payload:${normalizedAuditPayload.projectAuditPayloadId}`,
      referenceType: "project-audit-payload",
      recordId: normalizedAuditPayload.projectAuditPayloadId,
      timestamp: normalizeArray(normalizedAuditPayload.entries)[0]?.timestamp ?? null,
      scope: toScope("project", normalizedAuditPayload.projectId ?? null),
      reason: "Filtered audit payload points to the latest actor/action evidence included in the posture summary.",
    });
  }

  const consentEntries = normalizeArray(consentState.consentEntries)
    .filter((entry) => ["missing", "withdrawn", "expired", "denied"].includes(entry.status))
    .slice(0, 3);
  for (const entry of consentEntries) {
    references.push({
      referenceId: `audit-reference:consent-entry:${entry.entryId ?? "unknown"}`,
      referenceType: "consent-entry",
      recordId: entry.entryId ?? null,
      timestamp: entry.withdrawnAt ?? entry.expiresAt ?? entry.effectiveAt ?? null,
      scope: toScope(entry.scopeType, entry.scopeId),
      reason: `Consent entry for ${entry.processingScope ?? "unknown-scope"} contributes to active compliance restrictions.`,
    });
  }

  return references;
}

function buildOpenRisks({ consentState, privacyRightsResult, auditReferences, classification, decision }) {
  const risks = [];
  const activeRestrictions = normalizeArray(consentState.activeRestrictions);
  const legalBasisEntries = normalizeArray(consentState.legalBasisEntries);

  for (const entry of legalBasisEntries) {
    if (["missing", "withdrawn", "expired"].includes(entry.status)) {
      risks.push({
        riskId: `compliance-risk:missing-consent:${entry.processingScope}:${entry.scopeType}:${entry.scopeId ?? "global"}`,
        riskType: "missing-consent",
        severity: entry.processingScope === "learning" ? "high" : "medium",
        scope: toScope(entry.scopeType, entry.scopeId),
        reason: `Processing scope ${entry.processingScope} is in ${entry.status} state and lacks a valid legal basis.`,
      });
    }
    if (entry.legalBasis === "unknown") {
      risks.push({
        riskId: `compliance-risk:invalid-legal-basis:${entry.processingScope}:${entry.scopeType}:${entry.scopeId ?? "global"}`,
        riskType: "invalid-legal-basis",
        severity: "medium",
        scope: toScope(entry.scopeType, entry.scopeId),
        reason: `Processing scope ${entry.processingScope} still resolves to unknown legal basis.`,
      });
    }
  }

  for (const restriction of activeRestrictions) {
    if (restriction.restrictionType === "learning-restricted") {
      risks.push({
        riskId: `compliance-risk:learning-restricted:${restriction.restrictionId ?? "unknown"}`,
        riskType: "learning-restricted",
        severity: "medium",
        scope: toScope(restriction.scopeType, restriction.scopeId),
        reason: restriction.reason ?? "Learning is restricted and requires explicit review.",
      });
    }
    if (restriction.restrictionType === "learning-prohibited") {
      risks.push({
        riskId: `compliance-risk:unresolved-restriction:${restriction.restrictionId ?? "unknown"}`,
        riskType: "unresolved-restriction",
        severity: "high",
        scope: toScope(restriction.scopeType, restriction.scopeId),
        reason: restriction.reason ?? "A high-severity learning restriction remains active.",
      });
    }
  }

  const normalizedRights = normalizeObject(privacyRightsResult);
  if (normalizedRights.privacyRequestId) {
    if (normalizedRights.status === "failed") {
      risks.push({
        riskId: `compliance-risk:privacy-request-failed:${normalizedRights.privacyRequestId}`,
        riskType: "privacy-request-failed",
        severity: "high",
        scope: toScope(normalizeArray(normalizedRights.affectedScopes)[0]?.scopeType, normalizeArray(normalizedRights.affectedScopes)[0]?.scopeId),
        reason: "Latest privacy rights execution failed after starting side effects.",
      });
    }
    if (normalizedRights.status === "blocked") {
      risks.push({
        riskId: `compliance-risk:privacy-request-blocked:${normalizedRights.privacyRequestId}`,
        riskType: "privacy-request-blocked",
        severity: "high",
        scope: toScope(normalizeArray(normalizedRights.affectedScopes)[0]?.scopeType, normalizeArray(normalizedRights.affectedScopes)[0]?.scopeId),
        reason: "Latest privacy rights execution was blocked and requires manual review.",
      });
    }
    if (normalizedRights.status === "partial") {
      risks.push({
        riskId: `compliance-risk:missing-execution-coverage:${normalizedRights.privacyRequestId}`,
        riskType: "missing-execution-coverage",
        severity: "medium",
        scope: toScope(normalizeArray(normalizedRights.affectedScopes)[0]?.scopeType, normalizeArray(normalizedRights.affectedScopes)[0]?.scopeId),
        reason: "Latest privacy rights execution completed only partially across supported stores.",
      });
    }
  }

  if (decision.retentionAction === "delete-required" && decision.backupAllowed === true) {
    risks.push({
      riskId: `compliance-risk:retention-conflict:${classification.classificationId ?? "unknown"}`,
      riskType: "retention-conflict",
      severity: "high",
      scope: toScope(classification.storageBinding?.storageScope, null),
      reason: "Retention decision requires deletion while backups remain allowed.",
    });
  }

  if (auditReferences.length === 0) {
    risks.push({
      riskId: "compliance-risk:missing-audit-evidence",
      riskType: "missing-audit-evidence",
      severity: "medium",
      scope: toScope("project", null),
      reason: "No audit references were available to back the current compliance snapshot.",
    });
  }

  return risks;
}

function determineSummaryStatus({ missingCriticalInputs, openRisks, privacyRightsResult, auditReferences }) {
  if (missingCriticalInputs.length > 0) {
    return "missing-inputs";
  }

  const normalizedRights = normalizeObject(privacyRightsResult);
  if (openRisks.some((risk) => ["high", "critical"].includes(risk.severity))) {
    return "at-risk";
  }

  if ((normalizedRights.privacyRequestId && normalizedRights.status === "partial") || auditReferences.length < 2) {
    return "partial";
  }

  return "complete";
}

export function createComplianceAuditSummary({
  dataPrivacyClassification = null,
  privacyPolicyDecision = null,
  complianceConsentState = null,
  privacyRightsResult = null,
  projectAuditRecord = null,
  projectAuditPayload = null,
} = {}) {
  const classification = normalizeObject(dataPrivacyClassification);
  const decision = normalizeObject(privacyPolicyDecision);
  const consentState = normalizeObject(complianceConsentState);
  const rightsResult = normalizeObject(privacyRightsResult);
  const projectAudit = normalizeObject(projectAuditRecord);
  const auditPayload = normalizeObject(projectAuditPayload);

  const missingCriticalInputs = [];
  if (!consentState.complianceConsentStateId) {
    missingCriticalInputs.push("complianceConsentState");
  }
  if (!rightsResult.privacyRequestId) {
    missingCriticalInputs.push("privacyRightsResult");
  }

  const privacyOverview = buildPrivacyOverview(classification, decision);
  const consentOverview = buildConsentOverview(consentState);
  const rightsExecutionOverview = buildRightsExecutionOverview(rightsResult);
  const learningRestrictionOverview = buildLearningRestrictionOverview({
    classification,
    decision,
    consentState,
    privacyRightsResult: rightsResult,
  });
  const auditReferences = buildAuditReferences({
    consentState,
    privacyRightsResult: rightsResult,
    projectAuditRecord: projectAudit,
    projectAuditPayload: auditPayload,
  });
  const activeRestrictions = normalizeArray(consentState.activeRestrictions);
  const openRisks = buildOpenRisks({
    consentState,
    privacyRightsResult: rightsResult,
    auditReferences,
    classification,
    decision,
  });
  const summaryStatus = determineSummaryStatus({
    missingCriticalInputs,
    openRisks,
    privacyRightsResult: rightsResult,
    auditReferences,
  });

  const summary =
    summaryStatus === "missing-inputs"
      ? `Compliance audit summary is missing critical inputs: ${missingCriticalInputs.join(", ")}.`
      : summaryStatus === "at-risk"
        ? `Compliance posture is at risk with ${openRisks.length} open risks and ${activeRestrictions.length} active restrictions.`
        : summaryStatus === "partial"
          ? `Compliance posture is partially covered with ${auditReferences.length} audit references and ${openRisks.length} open risks.`
          : `Compliance posture is complete with ${auditReferences.length} audit references and ${activeRestrictions.length} active restrictions tracked.`;

  return {
    complianceAuditSummary: {
      complianceAuditSummaryId: `compliance-audit-summary:${classification.classificationId ?? consentState.complianceConsentStateId ?? "unknown"}`,
      summaryStatus,
      privacyOverview,
      consentOverview,
      rightsExecutionOverview,
      learningRestrictionOverview,
      auditReferences,
      activeRestrictions,
      openRisks,
      summary,
    },
  };
}
