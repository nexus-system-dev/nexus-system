import { test } from "node:test";
import assert from "node:assert/strict";
import { createProjectStateScreenRenderer } from "../src/core/project-state-screen-renderer.js";

test("createProjectStateScreenRenderer returns valid live state for empty input", () => {
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({});
  assert.ok(liveRuntimeScreenState.stateId);
  assert.equal(liveRuntimeScreenState.meta.sourceMode, "project-state-driven");
  assert.equal(liveRuntimeScreenState.meta.isHandAuthoredShell, false);
});

test("createProjectStateScreenRenderer resolves active screen from registry and resolver", () => {
  const runtimeScreenRegistry = {
    runtimeScreenRegistry: {
      registryId: "reg-1",
      totalScreens: 2,
      availableScreens: 2,
      entries: [
        { screenId: "s1", screenType: "wizard", orderInFlow: 1, isAvailable: true },
        { screenId: "s2", screenType: "detail", orderInFlow: 2, isAvailable: true },
      ],
    },
  };
  const activeScreenResolver = {
    activeScreenResolver: {
      resolvedScreenId: "s1",
      resolvedCompositionId: "comp-1",
      activeFlowId: "flow-1",
      resolutionStrategy: "exact-match",
      meta: { hasActiveScreen: true },
    },
  };
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    runtimeScreenRegistry,
    activeScreenResolver,
  });
  assert.equal(liveRuntimeScreenState.activeScreenId, "s1");
  assert.equal(liveRuntimeScreenState.activeCompositionId, "comp-1");
  assert.equal(liveRuntimeScreenState.activeFlowId, "flow-1");
  assert.equal(liveRuntimeScreenState.resolutionStrategy, "exact-match");
  assert.equal(liveRuntimeScreenState.isActive, true);
  assert.equal(liveRuntimeScreenState.meta.isLive, true);
});

test("createProjectStateScreenRenderer binds project state", () => {
  const activeScreenResolver = {
    activeScreenResolver: {
      resolvedScreenId: "s1",
      resolutionStrategy: "fallback",
    },
  };
  const projectState = { projectId: "proj-123", phase: "active" };
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    activeScreenResolver,
    projectState,
  });
  assert.equal(liveRuntimeScreenState.projectBinding.projectId, "proj-123");
  assert.equal(liveRuntimeScreenState.projectBinding.projectPhase, "active");
  assert.equal(liveRuntimeScreenState.projectBinding.screenBoundToProject, true);
});

test("createProjectStateScreenRenderer is not live when no active screen", () => {
  const activeScreenResolver = {
    activeScreenResolver: {
      resolvedScreenId: null,
      resolutionStrategy: "none",
    },
  };
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    activeScreenResolver,
  });
  assert.equal(liveRuntimeScreenState.isActive, false);
  assert.equal(liveRuntimeScreenState.meta.isLive, false);
});

test("createProjectStateScreenRenderer reflects registry summary", () => {
  const runtimeScreenRegistry = {
    runtimeScreenRegistry: {
      totalScreens: 5,
      availableScreens: 4,
      entries: [],
    },
  };
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    runtimeScreenRegistry,
  });
  assert.equal(liveRuntimeScreenState.registrySummary.totalScreens, 5);
  assert.equal(liveRuntimeScreenState.registrySummary.availableScreens, 4);
});

test("createProjectStateScreenRenderer navigation reflects first screen position", () => {
  const runtimeScreenRegistry = {
    runtimeScreenRegistry: {
      totalScreens: 1,
      availableScreens: 1,
      entries: [{ screenId: "s1", orderInFlow: 1, isAvailable: true }],
    },
  };
  const activeScreenResolver = {
    activeScreenResolver: {
      resolvedScreenId: "s1",
      resolutionStrategy: "exact-match",
    },
  };
  const { liveRuntimeScreenState } = createProjectStateScreenRenderer({
    runtimeScreenRegistry,
    activeScreenResolver,
  });
  assert.equal(liveRuntimeScreenState.navigation.currentPosition, 1);
  assert.equal(liveRuntimeScreenState.navigation.canNavigateBack, false);
});
