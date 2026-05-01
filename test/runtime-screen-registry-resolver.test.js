import { test } from "node:test";
import assert from "node:assert/strict";
import { createRuntimeScreenRegistryResolver } from "../src/core/runtime-screen-registry-resolver.js";

test("createRuntimeScreenRegistryResolver returns valid registry and resolver for empty input", () => {
  const { runtimeScreenRegistry, activeScreenResolver } = createRuntimeScreenRegistryResolver({});
  assert.ok(runtimeScreenRegistry.registryId);
  assert.equal(Array.isArray(runtimeScreenRegistry.entries), true);
  assert.equal(typeof activeScreenResolver.resolutionStrategy, "string");
});

test("createRuntimeScreenRegistryResolver builds registry from screenInventory", () => {
  const screenInventory = [
    { screenId: "s1", flowId: "flow-1", screenType: "wizard", orderInFlow: 1 },
    { screenId: "s2", flowId: "flow-1", screenType: "detail", orderInFlow: 2 },
  ];
  const renderableScreenComposition = {
    renderableScreenComposition: { compositionId: "comp-1", meta: { isRenderable: true } },
  };
  const { runtimeScreenRegistry } = createRuntimeScreenRegistryResolver({
    screenInventory,
    renderableScreenComposition,
  });
  assert.equal(runtimeScreenRegistry.totalScreens, 2);
  assert.equal(runtimeScreenRegistry.entries[0].screenId, "s1");
  assert.equal(runtimeScreenRegistry.entries[1].screenId, "s2");
});

test("createRuntimeScreenRegistryResolver resolves active screen by exact currentScreenId", () => {
  const screenInventory = [
    { screenId: "s1", orderInFlow: 1 },
    { screenId: "s2", orderInFlow: 2 },
  ];
  const projectState = { currentScreenId: "s2" };
  const renderableScreenComposition = {
    renderableScreenComposition: { meta: { isRenderable: true } },
  };
  const { activeScreenResolver } = createRuntimeScreenRegistryResolver({
    screenInventory,
    renderableScreenComposition,
    projectState,
  });
  assert.equal(activeScreenResolver.resolvedScreenId, "s2");
  assert.equal(activeScreenResolver.resolutionStrategy, "exact-match");
});

test("createRuntimeScreenRegistryResolver resolves by flow when no exact match", () => {
  const screenInventory = [
    { screenId: "s1", flowId: "flow-1", orderInFlow: 1 },
    { screenId: "s2", flowId: "flow-1", orderInFlow: 2 },
  ];
  const projectState = { currentFlowId: "flow-1" };
  const renderableScreenComposition = {
    renderableScreenComposition: { meta: { isRenderable: true } },
  };
  const { activeScreenResolver } = createRuntimeScreenRegistryResolver({
    screenInventory,
    renderableScreenComposition,
    projectState,
  });
  assert.equal(activeScreenResolver.resolvedScreenId, "s1"); // first in flow
  assert.equal(activeScreenResolver.resolutionStrategy, "flow-match");
});

test("createRuntimeScreenRegistryResolver falls back to first available entry", () => {
  const screenInventory = [{ screenId: "s1" }];
  const { activeScreenResolver } = createRuntimeScreenRegistryResolver({
    screenInventory,
    renderableScreenComposition: {
      renderableScreenComposition: { meta: { isRenderable: true } },
    },
  });
  assert.equal(activeScreenResolver.resolvedScreenId, "s1");
  assert.equal(activeScreenResolver.resolutionStrategy, "fallback");
});

test("createRuntimeScreenRegistryResolver reports none strategy for empty registry", () => {
  const { activeScreenResolver } = createRuntimeScreenRegistryResolver({
    screenInventory: [],
  });
  assert.equal(activeScreenResolver.resolutionStrategy, "none");
  assert.equal(activeScreenResolver.meta.hasActiveScreen, false);
});
