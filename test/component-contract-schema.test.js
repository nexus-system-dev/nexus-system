import test from "node:test";
import assert from "node:assert/strict";

import { defineComponentContractSchema } from "../src/core/component-contract-schema.js";

test("defineComponentContractSchema returns canonical button contract", () => {
  const { componentContract } = defineComponentContractSchema({
    componentType: "button",
  });

  assert.equal(componentContract.componentContractId, "component-contract:button");
  assert.deepEqual(componentContract.anatomy, ["container", "label", "icon"]);
  assert.equal(componentContract.behavior.interactive, true);
  assert.deepEqual(componentContract.behavior.supportsStates, ["hover", "active", "focus", "disabled", "destructive"]);
  assert.equal(componentContract.accessibility.requiresKeyboardSupport, true);
  assert.equal(componentContract.summary.supportedStateCount, 5);
});

test("defineComponentContractSchema falls back to canonical panel contract", () => {
  const { componentContract } = defineComponentContractSchema();

  assert.equal(componentContract.componentType, "panel");
  assert.deepEqual(componentContract.anatomy, ["container", "header", "body", "footer"]);
  assert.equal(componentContract.behavior.interactive, false);
  assert.deepEqual(componentContract.behavior.supportsStates, ["success", "warning"]);
  assert.equal(componentContract.accessibility.requiresFocusTreatment, false);
});
