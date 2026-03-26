import test from "node:test";
import assert from "node:assert/strict";

import { createProviderConnectorAssembler } from "../src/core/provider-connector-assembler.js";

test("provider connector assembler returns canonical connector", () => {
  const { providerConnector } = createProviderConnectorAssembler({
    providerSession: {
      providerType: "hosting",
      status: "connected",
    },
    providerCapabilities: {
      providerType: "hosting",
      capabilities: ["deploy"],
    },
    providerOperations: [
      {
        operationType: "deploy",
      },
    ],
  });

  assert.equal(providerConnector.providerType, "hosting");
  assert.equal(providerConnector.status, "connected");
  assert.equal(Array.isArray(providerConnector.operations), true);
});

test("provider connector assembler falls back to generic connector", () => {
  const { providerConnector } = createProviderConnectorAssembler();

  assert.equal(providerConnector.providerType, "generic");
  assert.equal(Array.isArray(providerConnector.operations), true);
});
