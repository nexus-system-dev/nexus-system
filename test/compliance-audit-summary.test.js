import test from "node:test";
import assert from "node:assert/strict";

import { createComplianceAuditSummary } from "../src/core/compliance-audit-summary.js";

function createClassification(overrides = {}) {
  return {
    classificationId: "classification-1",
    exposureLevel: "internal",
    personalData: "none",
    learningSafety: "learning-safe",
    storageBinding: {
      storageScope: "project",
      storageDriver: "filesystem",
      retentionPolicy: {
        policyId: "project-lifecycle",
      },
    },
    ...overrides,
  };
}

function createPrivacyPolicyDecision(overrides = {}) {
  return {
    privacyPolicyDecisionId: "privacy-policy-1",
    retentionAction: "keep",
    retentionWindow: {
      policyId: "project-lifecycle",
    },
    deletionRequired: false,
    deletionMode: null,
    learningAllowed: true,
    backupAllowed: true,
    backupConstraints: {
      backupMode: "standard",
    },
    ...overrides,
  };
}

function createConsentState(overrides = {}) {
  return {
    complianceConsentStateId: "compliance-consent-1",
    userId: "user-1",
    consentEntries: [
      {
        entryId: "consent-1",
        processingScope: "data-usage",
        scopeType: "global",
        scopeId: null,
        status: "granted",
        legalBasis: "contract",
      },
      {
        entryId: "consent-2",
        processingScope: "learning",
        scopeType: "project",
        scopeId: "giftwallet",
        status: "granted",
        legalBasis: "consent",
      },
      {
        entryId: "consent-3",
        processingScope: "notifications",
        scopeType: "global",
        scopeId: null,
        status: "granted",
        legalBasis: "consent",
      },
    ],
    processingScopes: ["data-usage", "learning", "notifications"],
    legalBasisEntries: [
      {
        processingScope: "data-usage",
        scopeType: "global",
        scopeId: null,
        legalBasis: "contract",
        status: "granted",
      },
      {
        processingScope: "learning",
        scopeType: "project",
        scopeId: "giftwallet",
        legalBasis: "consent",
        status: "granted",
      },
      {
        processingScope: "notifications",
        scopeType: "global",
        scopeId: null,
        legalBasis: "consent",
        status: "granted",
      },
    ],
    activeRestrictions: [],
    ...overrides,
  };
}

function createPrivacyRightsResult(overrides = {}) {
  return {
    privacyRequestId: "privacy-request:giftwallet:export:user-1",
    requestType: "export",
    status: "completed",
    executedActions: [
      {
        actionType: "export-subject-data",
        target: "project-export-bundle",
        status: "success",
        details: "Exported consent entries.",
      },
    ],
    affectedScopes: [
      {
        scopeType: "project",
        scopeId: "giftwallet",
        result: "exported",
      },
    ],
    summary: "Export completed.",
    ...overrides,
  };
}

function createAuditRecord(overrides = {}) {
  return {
    projectAuditRecordId: "project-audit-record:1",
    projectId: "giftwallet",
    timestamp: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createAuditPayload(overrides = {}) {
  return {
    projectAuditPayloadId: "project-audit-payload:giftwallet",
    projectId: "giftwallet",
    entries: [
      {
        entryId: "actor-action-trace:1",
        timestamp: "2025-01-01T00:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

test("compliance audit summary resolves complete posture when inputs are clean and evidenced", () => {
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification(),
    privacyPolicyDecision: createPrivacyPolicyDecision(),
    complianceConsentState: createConsentState(),
    privacyRightsResult: createPrivacyRightsResult(),
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload(),
  });

  assert.equal(complianceAuditSummary.summaryStatus, "complete");
  assert.equal(typeof complianceAuditSummary.privacyOverview.classificationId, "string");
  assert.equal(typeof complianceAuditSummary.consentOverview.statusCounts.granted, "number");
  assert.equal(complianceAuditSummary.rightsExecutionOverview.latestRequestStatus, "completed");
  assert.equal(complianceAuditSummary.learningRestrictionOverview.restrictionLevel, "allowed");
  assert.equal(complianceAuditSummary.auditReferences.length >= 2, true);
});

test("compliance audit summary resolves missing-inputs when privacy rights input is missing", () => {
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification(),
    privacyPolicyDecision: createPrivacyPolicyDecision(),
    complianceConsentState: createConsentState(),
    privacyRightsResult: null,
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload(),
  });

  assert.equal(complianceAuditSummary.summaryStatus, "missing-inputs");
  assert.equal(complianceAuditSummary.rightsExecutionOverview, null);
  assert.equal(
    complianceAuditSummary.summary.includes("privacyRightsResult"),
    true,
  );
});

test("compliance audit summary resolves at-risk when high severity compliance risks are open", () => {
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification({
      exposureLevel: "secret",
      learningSafety: "prohibited",
    }),
    privacyPolicyDecision: createPrivacyPolicyDecision({
      retentionAction: "delete-required",
      learningAllowed: false,
      backupAllowed: false,
    }),
    complianceConsentState: createConsentState({
      consentEntries: [
        {
          entryId: "consent-learning-missing",
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          status: "missing",
          legalBasis: "unknown",
        },
      ],
      legalBasisEntries: [
        {
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          legalBasis: "unknown",
          status: "missing",
        },
      ],
      activeRestrictions: [
        {
          restrictionId: "restriction:learning-prohibited",
          restrictionType: "learning-prohibited",
          severity: "high",
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          reason: "Learning is prohibited.",
        },
      ],
    }),
    privacyRightsResult: createPrivacyRightsResult({
      status: "failed",
      executedActions: [
        {
          actionType: "delete-user-profile",
          target: "manualContext.userProfile",
          status: "failed",
          details: "Store unavailable.",
        },
      ],
    }),
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload(),
  });

  assert.equal(complianceAuditSummary.summaryStatus, "at-risk");
  assert.equal(
    complianceAuditSummary.openRisks.some((risk) => risk.riskType === "privacy-request-failed"),
    true,
  );
});

test("compliance audit summary resolves partial when posture is usable but coverage is incomplete", () => {
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification(),
    privacyPolicyDecision: createPrivacyPolicyDecision(),
    complianceConsentState: createConsentState(),
    privacyRightsResult: createPrivacyRightsResult({
      status: "partial",
      executedActions: [
        {
          actionType: "forget-user-profile",
          target: "manualContext.userProfile",
          status: "success",
          details: null,
        },
        {
          actionType: "forget-audit-stores",
          target: "system/security audit logs",
          status: "skipped",
          details: "No supported hook exists.",
        },
      ],
    }),
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload({
      entries: [],
    }),
  });

  assert.equal(complianceAuditSummary.summaryStatus, "partial");
  assert.equal(
    complianceAuditSummary.openRisks.some((risk) => risk.riskType === "missing-execution-coverage"),
    true,
  );
});

test("compliance audit summary keeps activeRestrictions separate from openRisks", () => {
  const restriction = {
    restrictionId: "restriction:notifications",
    restrictionType: "processing-prohibited",
    severity: "high",
    processingScope: "notifications",
    scopeType: "global",
    scopeId: null,
    reason: "Notifications are blocked.",
  };
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification(),
    privacyPolicyDecision: createPrivacyPolicyDecision({
      learningAllowed: false,
    }),
    complianceConsentState: createConsentState({
      consentEntries: [
        {
          entryId: "consent-notifications",
          processingScope: "notifications",
          scopeType: "global",
          scopeId: null,
          status: "missing",
          legalBasis: "unknown",
        },
      ],
      legalBasisEntries: [
        {
          processingScope: "notifications",
          scopeType: "global",
          scopeId: null,
          legalBasis: "unknown",
          status: "missing",
        },
      ],
      activeRestrictions: [restriction],
    }),
    privacyRightsResult: createPrivacyRightsResult(),
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload(),
  });

  assert.equal(complianceAuditSummary.activeRestrictions[0].restrictionId, "restriction:notifications");
  assert.equal(
    complianceAuditSummary.openRisks.some((risk) => risk.riskType === "missing-consent"),
    true,
  );
  assert.equal(
    complianceAuditSummary.openRisks.some((risk) => risk.riskId === "restriction:notifications"),
    false,
  );
});

test("compliance audit summary builds canonical auditReferences", () => {
  const { complianceAuditSummary } = createComplianceAuditSummary({
    dataPrivacyClassification: createClassification(),
    privacyPolicyDecision: createPrivacyPolicyDecision(),
    complianceConsentState: createConsentState({
      consentEntries: [
        {
          entryId: "consent-withdrawn",
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          status: "withdrawn",
          legalBasis: "consent",
          withdrawnAt: "2025-01-02T00:00:00.000Z",
        },
      ],
      legalBasisEntries: [
        {
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          legalBasis: "consent",
          status: "withdrawn",
        },
      ],
      activeRestrictions: [],
    }),
    privacyRightsResult: createPrivacyRightsResult(),
    projectAuditRecord: createAuditRecord(),
    projectAuditPayload: createAuditPayload(),
  });

  assert.equal(
    complianceAuditSummary.auditReferences.every((reference) =>
      typeof reference.referenceId === "string"
      && typeof reference.referenceType === "string"
      && typeof reference.scope === "object"
    ),
    true,
  );
});
