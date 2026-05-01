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

test("defineComponentContractSchema normalizes supported component types to canonical lowercase contracts", () => {
  const { componentContract } = defineComponentContractSchema({
    componentType: "  ICON-BUTTON  ",
  });

  assert.equal(componentContract.componentContractId, "component-contract:icon-button");
  assert.equal(componentContract.componentType, "icon-button");
  assert.deepEqual(componentContract.anatomy, ["container", "icon", "assistiveLabel"]);
  assert.equal(componentContract.behavior.interactive, true);
  assert.deepEqual(componentContract.behavior.supportsStates, ["hover", "active", "focus", "disabled", "destructive"]);
  assert.equal(componentContract.accessibility.requiresKeyboardSupport, true);
  assert.equal(componentContract.accessibility.requiresLabeling, true);
});

test("defineComponentContractSchema exposes canonical textarea contract", () => {
  const { componentContract } = defineComponentContractSchema({
    componentType: "textarea",
  });

  assert.equal(componentContract.componentContractId, "component-contract:textarea");
  assert.deepEqual(componentContract.anatomy, ["label", "field", "helperText", "validationMessage"]);
  assert.deepEqual(componentContract.behavior.supportsStates, ["focus", "disabled", "warning", "success"]);
  assert.deepEqual(componentContract.behavior.supportsContentSlots, ["label", "helperText", "placeholder"]);
  assert.equal(componentContract.accessibility.requiresFocusTreatment, true);
});

test("defineComponentContractSchema collapses unsupported component types to the canonical panel contract", () => {
  const { componentContract } = defineComponentContractSchema({
    componentType: "stat-card",
  });

  assert.equal(componentContract.componentContractId, "component-contract:panel");
  assert.equal(componentContract.componentType, "panel");
  assert.deepEqual(componentContract.anatomy, ["container", "header", "body", "footer"]);
  assert.equal(componentContract.behavior.interactive, false);
});
