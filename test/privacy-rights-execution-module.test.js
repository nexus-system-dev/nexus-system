import test from "node:test";
import assert from "node:assert/strict";

import { createPrivacyRightsExecutionModule } from "../src/core/privacy-rights-execution-module.js";

function createProject(overrides = {}) {
  return {
    id: "giftwallet",
    userId: "user-1",
    name: "GiftWallet",
    manualContext: {
      userProfile: {
        userId: "user-1",
        email: "user@example.com",
        displayName: "User One",
      },
      userSessionMetric: {
        userId: "user-1",
        sessionId: "session-1",
        status: "active",
      },
      notificationPreferences: {
        userId: "user-1",
        channels: ["in-app", "email"],
        eventTypes: ["security", "learning"],
        digestEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
      },
      consentEntries: [
        {
          entryId: "consent-1",
          userId: "user-1",
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          status: "granted",
          legalBasis: "consent",
        },
      ],
      learningEvent: {
        learningEventId: "learning-event-1",
      },
      learningTrace: {
        traceId: "learning-trace-1",
      },
      attachments: [{ id: "attachment-1", name: "brief.pdf" }],
    },
    projectIntake: {
      uploadedFiles: [{ id: "upload-1", name: "customers.csv" }],
    },
    projectDraft: {
      owner: {
        userId: "user-1",
        email: "user@example.com",
        displayName: "User One",
      },
    },
    onboardingSession: {
      userId: "user-1",
    },
    context: {
      learningInsights: {
        items: [{ id: "insight-1" }],
      },
    },
    linkedAccounts: [],
    ...overrides,
  };
}

function createContext(overrides = {}) {
  return {
    dataPrivacyClassification: {
      classificationId: "classification-1",
      exposureLevel: "confidential",
      personalData: "personal",
      learningSafety: "restricted",
      storageBinding: {
        retentionPolicy: {
          policyId: "project-lifecycle",
        },
      },
    },
    privacyPolicyDecision: {
      privacyPolicyDecisionId: "privacy-policy-1",
      retentionAction: "delete-on-expiry",
      learningAllowed: false,
      backupAllowed: true,
    },
    complianceConsentState: {
      consentEntries: [
        {
          entryId: "consent-1",
          userId: "user-1",
          processingScope: "learning",
          scopeType: "project",
          scopeId: "giftwallet",
          status: "granted",
          legalBasis: "consent",
        },
      ],
      legalBasisEntries: [],
    },
    ...overrides,
  };
}

test("export request returns real export payload from supported stores", () => {
  const project = createProject();
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "export",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "completed");
  assert.equal(privacyRightsResult.executedActions[0].actionType, "export-subject-data");
  assert.equal(project.privacyRightsResult.exportPayload.userProfile.email, "user@example.com");
});

test("delete request removes supported project-scoped stores and returns partial when unsupported stores remain", () => {
  const project = createProject();
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "delete",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "completed");
  assert.equal(project.manualContext.userProfile.email, null);
  assert.equal(project.projectIntake.uploadedFiles.length, 0);
});

test("forget-me traverses multiple supported stores and returns partial when audit stores have no hook", () => {
  const project = createProject();
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "forget-me",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "global",
      scopeId: null,
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "partial");
  assert.equal(project.userId, "deleted:user-1");
  assert.equal(project.manualContext.notificationPreferences.emailEnabled, false);
  assert.equal(
    privacyRightsResult.executedActions.some((action) => action.target === "system/security audit logs" && action.status === "skipped"),
    true,
  );
});

test("learning-opt-out updates consent and clears learning artifacts with honest partial status when hooks are missing", () => {
  const project = createProject();
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "learning-opt-out",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(["completed", "partial"].includes(privacyRightsResult.status), true);
  assert.equal(project.context.learningInsights, null);
  assert.equal(project.manualContext.learningEvent, null);
  assert.equal(project.manualContext.consentEntries.some((entry) => entry.processingScope === "learning" && entry.status === "withdrawn"), true);
});

test("request is blocked when actor is unauthorized", () => {
  const project = createProject();
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "export",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-2",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "blocked");
});

test("request is blocked when legal obligation basis requires retention", () => {
  const project = createProject();
  const context = createContext({
    complianceConsentState: {
      consentEntries: [],
      legalBasisEntries: [
        {
          processingScope: "data-usage",
          scopeType: "project",
          scopeId: "giftwallet",
          legalBasis: "legal-obligation",
          status: "granted",
        },
      ],
    },
  });

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "delete",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "blocked");
});

test("request returns failed when execution hits a technical error", () => {
  const project = createProject();
  Object.defineProperty(project, "context", {
    get() {
      throw new Error("context store unavailable");
    },
  });
  const context = createContext();

  const { privacyRightsResult } = createPrivacyRightsExecutionModule({
    privacyRequest: {
      requestType: "learning-opt-out",
      subjectType: "user",
      subjectId: "user-1",
      scopeType: "project",
      scopeId: "giftwallet",
      requestedBy: {
        actorId: "user-1",
        actorType: "user",
      },
    },
    project,
    context,
  });

  assert.equal(privacyRightsResult.status, "failed");
});
