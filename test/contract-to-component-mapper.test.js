import { test } from "node:test";
import assert from "node:assert/strict";
import { createContractToComponentMapper } from "../src/core/contract-to-component-mapper.js";

test("createContractToComponentMapper returns a valid mapping for empty input", () => {
  const { screenComponentMapping } = createContractToComponentMapper({});
  assert.ok(screenComponentMapping.mappingId);
  assert.equal(Array.isArray(screenComponentMapping.mappings), true);
  assert.equal(screenComponentMapping.isFullyApproved, true);
});

test("createContractToComponentMapper maps known component types to approved components", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s1",
      modelId: "renderable:s1",
      componentBoundaries: [
        { regionId: "r1", componentType: "button", slotKey: "slot-1" },
        { regionId: "r2", componentType: "panel", slotKey: "slot-2" },
      ],
    },
  };
  const { screenComponentMapping } = createContractToComponentMapper({ renderableScreenModel });
  assert.equal(screenComponentMapping.mappings.length, 2);
  assert.equal(screenComponentMapping.mappings[0].resolvedComponent, "button");
  assert.equal(screenComponentMapping.mappings[0].isApproved, true);
  assert.equal(screenComponentMapping.isFullyApproved, true);
});

test("createContractToComponentMapper falls back to panel for unmapped component type", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s2",
      componentBoundaries: [
        { regionId: "r1", componentType: "unknown-widget" },
      ],
    },
  };
  const { screenComponentMapping } = createContractToComponentMapper({ renderableScreenModel });
  assert.equal(screenComponentMapping.mappings[0].resolvedComponent, "panel");
  assert.equal(screenComponentMapping.mappings[0].isApproved, true);
});

test("createContractToComponentMapper applies override from componentContract", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s3",
      componentBoundaries: [
        { regionId: "r1", componentType: "panel" },
      ],
    },
  };
  const componentContract = {
    allowedOverrides: { r1: "card" },
  };
  const { screenComponentMapping } = createContractToComponentMapper({
    renderableScreenModel,
    componentContract,
  });
  assert.equal(screenComponentMapping.mappings[0].resolvedComponent, "card");
  assert.equal(screenComponentMapping.mappings[0].isOverridden, true);
});

test("createContractToComponentMapper reports unapproved regions accurately", () => {
  // Force an unapproved component via an override to an unknown type
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s4",
      componentBoundaries: [{ regionId: "r1", componentType: "panel" }],
    },
  };
  // Inject a non-approved override
  const componentContract = { allowedOverrides: { r1: "unknown-custom-widget" } };
  const { screenComponentMapping } = createContractToComponentMapper({
    renderableScreenModel,
    componentContract,
  });
  assert.equal(screenComponentMapping.isFullyApproved, false);
  assert.equal(screenComponentMapping.unapprovedRegions.length, 1);
});

test("createContractToComponentMapper summary counts are accurate", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s5",
      componentBoundaries: [
        { regionId: "r1", componentType: "button" },
        { regionId: "r2", componentType: "input" },
      ],
    },
  };
  const { screenComponentMapping } = createContractToComponentMapper({ renderableScreenModel });
  assert.equal(screenComponentMapping.summary.totalRegions, 2);
  assert.equal(screenComponentMapping.summary.approvedRegions, 2);
  assert.equal(screenComponentMapping.summary.overriddenRegions, 0);
});
