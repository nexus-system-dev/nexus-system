import test from "node:test";
import assert from "node:assert/strict";

import { createPrivacyRetentionAndDeletionPolicyResolver } from "../src/core/privacy-retention-and-deletion-policy-resolver.js";

function buildClassification(overrides = {}) {
  return {
    classificationId: "data-privacy:giftwallet:asset-1",
    exposureLevel: "internal",
    personalData: "none",
    learningSafety: "restricted",
    storageBinding: {
      storageScope: "project",
      storageDriver: "filesystem",
      retentionPolicy: {
        policyId: "project-lifecycle",
        source: "storage-record",
      },
    },
    source: "system",
    confidence: 0.7,
    reasoning: ["base"],
    summary: "base",
    ...overrides,
  };
}

test("privacy resolver keeps public learning-safe data", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "public",
      personalData: "none",
      learningSafety: "learning-safe",
    }),
    retentionPolicy: {
      policyId: "public-cache",
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "keep");
  assert.equal(privacyPolicyDecision.learningAllowed, true);
  assert.equal(privacyPolicyDecision.backupAllowed, true);
});

test("privacy resolver archives restricted internal data", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "internal",
      personalData: "none",
      learningSafety: "restricted",
    }),
    retentionPolicy: {
      policyId: "workspace-lifecycle",
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "archive");
  assert.equal(privacyPolicyDecision.deletionMode, "scheduled-review");
  assert.equal(privacyPolicyDecision.learningAllowed, false);
});

test("privacy resolver applies delete-on-expiry for confidential personal data", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "confidential",
      personalData: "personal",
      learningSafety: "restricted",
    }),
    retentionPolicy: {
      policyId: "account-lifecycle",
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "delete-on-expiry");
  assert.equal(privacyPolicyDecision.deletionRequired, false);
  assert.equal(privacyPolicyDecision.backupAllowed, true);
});

test("privacy resolver requires delete for secret data", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "secret",
      personalData: "sensitive-personal",
      learningSafety: "prohibited",
    }),
    retentionPolicy: {
      policyId: "project-lifecycle",
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "delete-required");
  assert.equal(privacyPolicyDecision.deletionRequired, true);
  assert.equal(privacyPolicyDecision.backupAllowed, false);
});

test("privacy resolver honors stricter retention override precedence", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "internal",
      personalData: "none",
      learningSafety: "learning-safe",
    }),
    retentionPolicy: {
      policyId: "secret-purge",
      retentionAction: "delete-required",
      deletionMode: "explicit-purge",
      backupAllowed: false,
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "delete-required");
  assert.equal(privacyPolicyDecision.deletionMode, "explicit-purge");
  assert.equal(privacyPolicyDecision.backupAllowed, false);
});

test("privacy resolver falls back deterministically when classification is incomplete", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: null,
    retentionPolicy: null,
  });

  assert.equal(privacyPolicyDecision.retentionAction, "archive");
  assert.equal(privacyPolicyDecision.learningAllowed, false);
  assert.equal(privacyPolicyDecision.backupAllowed, false);
  assert.equal(
    privacyPolicyDecision.reason.some((entry) => entry.includes("deterministic")),
    true,
  );
});

test("privacy resolver returns backup constraints as decision facets", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      exposureLevel: "confidential",
      personalData: "personal",
      learningSafety: "restricted",
    }),
    retentionPolicy: {
      policyId: "compliance-audit",
      backupAllowed: true,
      backupConstraints: {
        encryptionRequired: true,
        restoreScope: "authorized-only",
      },
    },
  });

  assert.equal(privacyPolicyDecision.backupAllowed, true);
  assert.equal(privacyPolicyDecision.backupConstraints.encryptionRequired, true);
  assert.equal(privacyPolicyDecision.backupConstraints.restoreScope, "authorized-only");
});

test("privacy resolver normalizes malformed classification and policy strings", () => {
  const { privacyPolicyDecision } = createPrivacyRetentionAndDeletionPolicyResolver({
    dataPrivacyClassification: buildClassification({
      classificationId: " data-privacy:giftwallet:asset-1 ",
      exposureLevel: " SECRET ",
      personalData: " Sensitive-Personal ",
      learningSafety: " PROHIBITED ",
    }),
    retentionPolicy: {
      policyId: "secret-purge",
      source: " DIRECT-INPUT ",
      retentionAction: " DELETE-REQUIRED ",
      deletionMode: " EXPLICIT-PURGE ",
      storageDriver: " VAULT ",
    },
  });

  assert.equal(privacyPolicyDecision.retentionAction, "delete-required");
  assert.equal(privacyPolicyDecision.deletionMode, "explicit-purge");
  assert.equal(privacyPolicyDecision.backupAllowed, false);
});
