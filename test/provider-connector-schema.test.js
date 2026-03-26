import test from "node:test";
import assert from "node:assert/strict";

import { defineProviderConnectorSchema } from "../src/core/provider-connector-schema.js";

test("provider connector schema returns hosting schema", () => {
  const { providerConnectorSchema } = defineProviderConnectorSchema({
    providerType: "hosting",
  });

  assert.equal(providerConnectorSchema.providerType, "hosting");
  assert.equal(providerConnectorSchema.authenticationModes.includes("api-key"), true);
  assert.equal(providerConnectorSchema.capabilities.includes("deploy"), true);
});

test("provider connector schema falls back to generic", () => {
  const { providerConnectorSchema } = defineProviderConnectorSchema();

  assert.equal(providerConnectorSchema.providerType, "generic");
  assert.equal(providerConnectorSchema.authenticationModes.includes("manual"), true);
});
