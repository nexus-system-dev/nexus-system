import test from "node:test";
import assert from "node:assert/strict";

import { createDesignToolImportAdapter } from "../src/core/design-tool-import-adapter.js";

test("design tool import adapter becomes ready for uploaded design files without remote credentials", () => {
  const { designToolImportAdapter } = createDesignToolImportAdapter({
    projectId: "giftwallet",
    projectIntake: {
      uploadedFiles: [
        {
          name: "checkout-figma-export.txt",
          type: "text",
          content: "figma frame export",
        },
      ],
      externalLinks: [],
    },
    externalCapabilityRegistry: {
      summary: {
        providerCount: 1,
      },
      providerEntries: [],
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: false,
      },
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "healthy",
      integrationStatus: "connected",
    },
  });

  assert.equal(designToolImportAdapter.status, "ready");
  assert.equal(designToolImportAdapter.importMode, "file-ingest");
  assert.equal(designToolImportAdapter.providerType, "figma");
  assert.equal(designToolImportAdapter.importReadiness.canImportToGeneration, true);
  assert.equal(designToolImportAdapter.importReadiness.requiresCredentialBinding, false);
});

test("design tool import adapter blocks remote design tool imports when connector binding is not safe", () => {
  const { designToolImportAdapter } = createDesignToolImportAdapter({
    projectId: "giftwallet",
    projectIntake: {
      uploadedFiles: [],
      externalLinks: ["https://www.figma.com/file/abc123/checkout-flow"],
    },
    externalCapabilityRegistry: {
      summary: {
        providerCount: 1,
      },
      providerEntries: [
        {
          registryEntryId: "external-capability:figma",
          providerType: "figma",
        },
      ],
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: false,
      },
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "healthy",
      integrationStatus: "connected",
    },
  });

  assert.equal(designToolImportAdapter.status, "blocked");
  assert.equal(designToolImportAdapter.importMode, "remote-link");
  assert.equal(designToolImportAdapter.missingInputs.includes("connector-credential-binding"), true);
  assert.equal(designToolImportAdapter.importReadiness.requiresFallbackUpload, true);
  assert.equal(designToolImportAdapter.summary.canProceed, false);
});

test("design tool import adapter marks remote imports as degraded during provider failover", () => {
  const { designToolImportAdapter } = createDesignToolImportAdapter({
    projectId: "giftwallet",
    projectIntake: {
      uploadedFiles: [],
      externalLinks: ["https://www.figma.com/file/abc123/checkout-flow"],
    },
    externalCapabilityRegistry: {
      summary: {
        providerCount: 2,
      },
      providerEntries: [
        {
          registryEntryId: "external-capability:figma",
          providerType: "figma",
        },
      ],
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "failover",
      integrationStatus: "connected",
    },
  });

  assert.equal(designToolImportAdapter.status, "degraded");
  assert.equal(designToolImportAdapter.importReadiness.requiresCredentialBinding, true);
  assert.equal(designToolImportAdapter.importReadiness.requiresFallbackUpload, true);
});
