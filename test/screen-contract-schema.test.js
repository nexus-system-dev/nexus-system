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
