import test from "node:test";
import assert from "node:assert/strict";

import { defineDataPrivacyClassificationSchema } from "../src/core/data-privacy-classification-schema.js";

test("data privacy classification normalizes canonical asset input and returns flat output shape", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:status-page",
      assetType: "status-page",
      scope: "public",
      containsPersonalData: false,
      containsSecrets: false,
      containsLearningMaterial: true,
      source: "system",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "public",
      storageDriver: "filesystem",
      retentionPolicy: {
        policyId: "public-cache",
        source: "storage-context",
      },
    },
  });

  assert.equal(typeof dataPrivacyClassification.classificationId, "string");
  assert.equal(dataPrivacyClassification.exposureLevel, "public");
  assert.equal(dataPrivacyClassification.personalData, "none");
  assert.equal(dataPrivacyClassification.learningSafety, "learning-safe");
  assert.equal(dataPrivacyClassification.source, "system");
  assert.equal(typeof dataPrivacyClassification.confidence, "number");
  assert.equal(Array.isArray(dataPrivacyClassification.reasoning), true);
  assert.equal(typeof dataPrivacyClassification.summary, "string");
  assert.equal(dataPrivacyClassification.storageBinding.storageScope, "public");
  assert.equal(dataPrivacyClassification.storageBinding.retentionPolicy.policyId, "public-cache");
});

test("data privacy classification normalizes legacy fields into the new canonical contract", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:uploaded-brief",
      assetType: "project-brief",
      scope: "project",
      containsUserContent: true,
      containsIdentifiers: true,
      source: "user-upload",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "project",
      storageDriver: "filesystem",
      retentionPolicy: "project-lifecycle",
    },
  });

  assert.equal(dataPrivacyClassification.exposureLevel, "confidential");
  assert.equal(dataPrivacyClassification.personalData, "personal");
  assert.equal(dataPrivacyClassification.learningSafety, "restricted");
  assert.equal(dataPrivacyClassification.source, "derived");
  assert.equal(typeof dataPrivacyClassification.storageBinding.retentionPolicy, "object");
});

test("data privacy classification resolves sensitive personal data independently from exposure", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:identity-export",
      assetType: "identity-document",
      scope: "user",
      containsPersonalData: true,
      containsSecrets: false,
      containsLearningMaterial: false,
      source: "derived",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "user",
      storageDriver: "filesystem",
      retentionPolicy: {
        policyId: "identity-retention",
        source: "storage-context",
      },
    },
  });

  assert.equal(dataPrivacyClassification.exposureLevel, "confidential");
  assert.equal(dataPrivacyClassification.personalData, "sensitive-personal");
  assert.equal(dataPrivacyClassification.learningSafety, "restricted");
});

test("data privacy classification resolves secret assets", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:credential-bundle",
      assetType: "credential-bundle",
      scope: "workspace",
      containsPersonalData: false,
      containsSecrets: true,
      containsLearningMaterial: false,
      source: "derived",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "workspace",
      storageDriver: "vault",
      retentionPolicy: {
        policyId: "account-lifecycle",
        source: "storage-context",
      },
    },
  });

  assert.equal(dataPrivacyClassification.exposureLevel, "secret");
  assert.equal(dataPrivacyClassification.personalData, "none");
  assert.equal(dataPrivacyClassification.learningSafety, "prohibited");
});

test("data privacy classification uses deterministic fallback when asset signals are missing", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:unknown",
      assetType: "project-state",
      scope: "project",
      containsPersonalData: false,
      containsSecrets: false,
      containsLearningMaterial: false,
      source: "system",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "project",
      storageDriver: "filesystem",
      retentionPolicy: null,
    },
  });

  assert.equal(dataPrivacyClassification.exposureLevel, "internal");
  assert.equal(dataPrivacyClassification.personalData, "none");
  assert.equal(dataPrivacyClassification.learningSafety, "restricted");
  assert.equal(dataPrivacyClassification.confidence < 0.5, true);
  assert.equal(
    dataPrivacyClassification.reasoning.some((entry) => entry.includes("deterministic fallback")),
    true,
  );
});

test("data privacy classification binds storage context into storageBinding and reasoning only", () => {
  const { dataPrivacyClassification } = defineDataPrivacyClassificationSchema({
    dataAsset: {
      assetId: "asset:knowledge-snippet",
      assetType: "knowledge-snippet",
      scope: "project",
      containsPersonalData: false,
      containsSecrets: false,
      containsLearningMaterial: true,
      source: "derived",
    },
    storageContext: {
      projectId: "giftwallet",
      storageScope: "workspace",
      storageDriver: "database",
      retentionPolicy: {
        policyId: "learning-governance",
        source: "nexus-persistence-schema",
      },
    },
  });

  assert.equal(dataPrivacyClassification.exposureLevel, "internal");
  assert.equal(dataPrivacyClassification.personalData, "none");
  assert.equal(dataPrivacyClassification.learningSafety, "learning-safe");
  assert.equal(dataPrivacyClassification.storageBinding.storageDriver, "database");
  assert.equal(dataPrivacyClassification.storageBinding.retentionPolicy.policyId, "learning-governance");
  assert.equal(
    dataPrivacyClassification.reasoning.some((entry) => entry.includes("learning-governance")),
    true,
  );
});
