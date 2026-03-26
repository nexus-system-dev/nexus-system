import test from "node:test";
import assert from "node:assert/strict";

import { createExternalAccountRegistry } from "../src/core/external-account-registry.js";

test("external account registry returns canonical account record", () => {
  const { accountRecord } = createExternalAccountRegistry({
    accountType: "hosting",
    accountMetadata: {
      provider: "vercel",
      projectId: "giftwallet",
      capabilities: ["deployments", "domains"],
      connectionMode: "manual",
    },
  });

  assert.equal(accountRecord.accountType, "hosting");
  assert.equal(accountRecord.provider, "vercel");
  assert.equal(accountRecord.projectId, "giftwallet");
  assert.equal(accountRecord.accountId, "hosting:vercel:giftwallet");
});

test("external account registry falls back to unknown provider values", () => {
  const { accountRecord } = createExternalAccountRegistry();

  assert.equal(accountRecord.accountType, "unknown");
  assert.equal(accountRecord.provider, "unknown-provider");
  assert.equal(accountRecord.status, "connected");
});
