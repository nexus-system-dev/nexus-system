import test from "node:test";
import assert from "node:assert/strict";

import { defineScreenContractSchema } from "../src/core/screen-contract-schema.js";

test("screen contract schema returns canonical contract for wizard screens", () => {
  const { screenContract } = defineScreenContractSchema({
    screenType: "wizard",
  });

  assert.equal(screenContract.screenType, "wizard");
  assert.equal(screenContract.layout.layout, "step-flow");
  assert.equal(screenContract.layout.supportsProgress, true);
  assert.equal(screenContract.stateSupport.loading, true);
  assert.equal(screenContract.interactionModel.primaryActionRequired, true);
});

test("screen contract schema falls back to detail contract", () => {
  const { screenContract } = defineScreenContractSchema({});

  assert.equal(screenContract.screenType, "detail");
  assert.equal(screenContract.layout.layout, "detail");
  assert.equal(screenContract.interactionModel.supportsMobile, true);
});

test("screen contract schema normalizes unknown screen types to canonical detail", () => {
  const { screenContract } = defineScreenContractSchema({
    screenType: "modal",
  });

  assert.equal(screenContract.screenType, "detail");
  assert.equal(screenContract.layout.layout, "detail");
  assert.equal(screenContract.stateSupport.success, true);
});

test("screen contract schema normalizes case and whitespace for canonical screen types", () => {
  const { screenContract } = defineScreenContractSchema({
    screenType: "  WORKSPACE  ",
  });

  assert.equal(screenContract.screenType, "workspace");
  assert.equal(screenContract.layout.layout, "workspace");
  assert.equal(screenContract.stateSupport.empty, true);
});
