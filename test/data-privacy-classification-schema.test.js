import test from "node:test";
import assert from "node:assert/strict";

import { defineDataPrivacyClassificationSchema } from "../src/core/data-privacy-classification-schema.js";

test("data privacy classification resolves public and learning-safe defaults", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetType: "status-page",
      origin: "system",
      intendedUse: "runtime",
      containsCredentials: false,
      containsUserContent: false,
      containsIdentifiers: false,
      tenantSensitivity: "low",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "public",
      storageDriver: "filesystem",
      retentionPolicy: "project-lifecycle",
      tenantBoundary: "workspace",
      tenantSensitivity: "low",
    },
  });

  assert.equal(dataPrivacyClassification.axes.exposureLevel, "public");
  assert.equal(dataPrivacyClassification.axes.personalData, "none");
  assert.equal(dataPrivacyClassification.axes.learningSafety, "learning-safe");
  assert.equal(typeof dataPrivacyClassification.metadata.classificationId, "string");
  assert.equal(Array.isArray(dataPrivacyClassification.metadata.reasoning), true);
});

test("data privacy classification resolves internal content and personal data", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetType: "project-brief",
      origin: "user-upload",
      intendedUse: "planning",
      containsUserContent: true,
      containsIdentifiers: true,
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "project",
      storageDriver: "filesystem",
      retentionPolicy: "project-lifecycle",
      tenantBoundary: "workspace",
      tenantSensitivity: "medium",
    },
  });

  assert.equal(dataPrivacyClassification.axes.exposureLevel, "confidential");
  assert.equal(dataPrivacyClassification.axes.personalData, "sensitive-personal");
  assert.equal(dataPrivacyClassification.axes.learningSafety, "restricted");
});

test("data privacy classification resolves confidential retention-bound data", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetType: "approval-record",
      origin: "system",
      intendedUse: "compliance-review",
      containsIdentifiers: true,
      containsUserContent: false,
      tenantSensitivity: "medium",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "workspace",
      storageDriver: "database",
      retentionPolicy: "compliance-audit",
      tenantBoundary: "workspace",
      tenantSensitivity: "high",
    },
  });

  assert.equal(dataPrivacyClassification.axes.exposureLevel, "confidential");
  assert.equal(dataPrivacyClassification.axes.personalData, "personal");
  assert.equal(dataPrivacyClassification.axes.learningSafety, "restricted");
  assert.equal(dataPrivacyClassification.axes.storageBinding.retentionPolicy, "compliance-audit");
});

test("data privacy classification resolves secret credential material", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetType: "credential-bundle",
      origin: "manual",
      intendedUse: "runtime-security",
      containsCredentials: true,
      containsIdentifiers: true,
      tenantSensitivity: "critical",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "workspace",
      storageDriver: "vault",
      retentionPolicy: "account-lifecycle",
      tenantBoundary: "workspace",
      tenantSensitivity: "critical",
    },
  });

  assert.equal(dataPrivacyClassification.axes.exposureLevel, "secret");
  assert.equal(dataPrivacyClassification.axes.personalData, "personal");
  assert.equal(dataPrivacyClassification.axes.learningSafety, "prohibited");
});

test("data privacy classification returns deterministic fallback when signals are missing", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema();

  assert.equal(dataPrivacyClassification.axes.exposureLevel, "internal");
  assert.equal(dataPrivacyClassification.axes.personalData, "none");
  assert.equal(dataPrivacyClassification.axes.learningSafety, "learning-safe");
  assert.equal(typeof dataPrivacyClassification.axes.storageBinding.storageScope, "string");
  assert.equal(dataPrivacyClassification.metadata.reasoning.length >= 1, true);
  assert.equal(dataPrivacyClassification.metadata.summary.includes("project-state"), true);
});
