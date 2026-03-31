import test from "node:test";
import assert from "node:assert/strict";

import { createComplianceConsentAndLegalBasisRegistry } from "../src/core/compliance-consent-and-legal-basis-registry.js";

function buildRegistry(overrides = {}) {
  return createComplianceConsentAndLegalBasisRegistry({
    userIdentity: {
      userId: "user-1",
      email: "user@example.com",
    },
    consentRecord: null,
    notificationPreferences: {
      userId: "user-1",
      channels: ["email"],
      frequency: "digest",
    },
    approvalRecords: [],
    consentEntries: [],
    scopeContext: {
      workspaceId: "workspace-1",
      projectId: "project-1",
    },
    ...overrides,
  }).complianceConsentState;
}

test("consent registry includes baseline scopes even when input is partial", () => {
  const state = buildRegistry();

  assert.equal(state.processingScopes.includes("data-usage"), true);
  assert.equal(state.processingScopes.includes("learning"), true);
  assert.equal(state.processingScopes.includes("notifications"), true);
  assert.equal(state.consentEntries.some((entry) => entry.status === "missing"), true);
  assert.equal(state.activeRestrictions.length >= 1, true);
});

test("consent registry supports canonical legal basis values", () => {
  const state = buildRegistry({
    consentEntries: [
      {
        processingScope: "learning",
        scopeType: "workspace",
        scopeId: "workspace-1",
        status: "granted",
        legalBasis: "legitimate-interest",
      },
      {
        processingScope: "data-usage",
        scopeType: "project",
        scopeId: "project-1",
        status: "granted",
        legalBasis: "contract",
      },
    ],
  });

  assert.equal(
    state.legalBasisEntries.some((entry) => entry.legalBasis === "legitimate-interest"),
    true,
  );
  assert.equal(
    state.legalBasisEntries.some((entry) => entry.legalBasis === "contract"),
    true,
  );
});

test("consent registry supports global workspace and project scopes", () => {
  const state = buildRegistry({
    consentEntries: [
      {
        processingScope: "data-usage",
        scopeType: "global",
        status: "granted",
        legalBasis: "consent",
      },
      {
        processingScope: "learning",
        scopeType: "workspace",
        scopeId: "workspace-1",
        status: "granted",
        legalBasis: "consent",
      },
      {
        processingScope: "notifications",
        scopeType: "project",
        scopeId: "project-1",
        status: "denied",
        legalBasis: "consent",
      },
    ],
  });

  assert.equal(state.consentEntries.some((entry) => entry.scopeType === "global"), true);
  assert.equal(state.consentEntries.some((entry) => entry.scopeType === "workspace"), true);
  assert.equal(state.consentEntries.some((entry) => entry.scopeType === "project"), true);
});

test("withdrawn and expired entries are operationally invalid", () => {
  const state = buildRegistry({
    consentEntries: [
      {
        processingScope: "learning",
        scopeType: "global",
        status: "withdrawn",
        legalBasis: "consent",
        withdrawnAt: "2025-01-01T00:00:00.000Z",
      },
      {
        processingScope: "notifications",
        scopeType: "global",
        status: "expired",
        legalBasis: "consent",
        expiresAt: "2024-01-01T00:00:00.000Z",
      },
    ],
  });

  assert.equal(
    state.activeRestrictions.some((entry) => entry.processingScope === "learning" && entry.restrictionType === "learning-prohibited"),
    true,
  );
  assert.equal(
    state.activeRestrictions.some((entry) => entry.processingScope === "notifications"),
    true,
  );
});

test("learning without valid consent or alternative legal basis is prohibited", () => {
  const state = buildRegistry({
    consentEntries: [
      {
        processingScope: "learning",
        scopeType: "global",
        status: "missing",
        legalBasis: "unknown",
      },
    ],
  });

  assert.equal(
    state.activeRestrictions.some((entry) => entry.processingScope === "learning" && entry.restrictionType === "learning-prohibited"),
    true,
  );
});

test("learning with supported alternative legal basis becomes restricted", () => {
  const state = buildRegistry({
    consentEntries: [
      {
        processingScope: "learning",
        scopeType: "workspace",
        scopeId: "workspace-1",
        status: "granted",
        legalBasis: "legitimate-interest",
      },
    ],
  });

  assert.equal(
    state.activeRestrictions.some((entry) => entry.processingScope === "learning" && entry.restrictionType === "learning-restricted"),
    true,
  );
});

test("owner consent record is transformed into a supporting project-scoped entry", () => {
  const state = buildRegistry({
    consentRecord: {
      consentId: "consent:project-1:release-distribution:web",
      projectId: "project-1",
      approved: true,
      actionType: "release-distribution",
      target: "web",
    },
  });

  const entry = state.consentEntries.find((item) => item.entryId.includes("consent-registry:consent:project-1"));
  assert.equal(entry.processingScope, "data-usage");
  assert.equal(entry.scopeType, "project");
  assert.equal(entry.legalBasis, "consent");
});
