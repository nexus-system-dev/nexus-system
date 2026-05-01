// Task #61 — Create project-state screen renderer
// Connects the registry and resolver to the frontend runtime so the application
// can display real screens from project state, not just a hand-authored shell.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveRenderTarget(activeScreenResolver, runtimeScreenRegistry) {
  const resolver = normalizeObject(activeScreenResolver);
  const registry = normalizeObject(runtimeScreenRegistry);
  const entries = normalizeArray(registry.entries);

  const screenId = resolver.resolvedScreenId;
  if (!screenId) return null;

  return entries.find((e) => normalizeObject(e).screenId === screenId) ?? null;
}

function buildLiveRuntimeState(renderTarget, activeScreenResolver, projectState) {
  const resolver = normalizeObject(activeScreenResolver);
  const state = normalizeObject(projectState);
  const target = normalizeObject(renderTarget);

  const screenId = resolver.resolvedScreenId;
  const compositionId = resolver.resolvedCompositionId;

  const projectPhase = state.phase ?? state.currentPhase ?? "active";
  const projectId = state.projectId ?? state.id ?? null;

  return {
    isActive: screenId !== null,
    activeScreenId: screenId ?? null,
    activeCompositionId: compositionId ?? null,
    activeFlowId: resolver.activeFlowId ?? null,
    resolutionStrategy: resolver.resolutionStrategy ?? "none",
    projectBinding: {
      projectId,
      projectPhase,
      screenBoundToProject: projectId !== null && screenId !== null,
    },
    renderTarget: renderTarget
      ? {
          screenId: target.screenId,
          screenType: target.screenType ?? "detail",
          orderInFlow: target.orderInFlow ?? null,
          isAvailable: target.isAvailable ?? true,
        }
      : null,
    navigation: {
      canNavigateBack: typeof target?.orderInFlow === "number" && target.orderInFlow > 1,
      canNavigateForward: target?.isAvailable === true,
      currentPosition: target?.orderInFlow ?? null,
    },
  };
}

export function createProjectStateScreenRenderer({
  runtimeScreenRegistry = null,
  activeScreenResolver = null,
  projectState = null,
} = {}) {
  const registry = normalizeObject(runtimeScreenRegistry);
  const registryInner = normalizeObject(registry.runtimeScreenRegistry ?? registry);

  const resolver = normalizeObject(activeScreenResolver);
  const resolverInner = normalizeObject(resolver.activeScreenResolver ?? resolver);

  const state = normalizeObject(projectState);

  const renderTarget = resolveRenderTarget(resolverInner, registryInner);
  const liveState = buildLiveRuntimeState(renderTarget, resolverInner, state);

  return {
    liveRuntimeScreenState: {
      stateId: `live-screen:${liveState.activeScreenId ?? "none"}:${Date.now()}`,
      ...liveState,
      registrySummary: {
        totalScreens: registryInner.totalScreens ?? 0,
        availableScreens: registryInner.availableScreens ?? 0,
      },
      meta: {
        isLive: liveState.isActive,
        sourceMode: "project-state-driven",
        isHandAuthoredShell: false,
      },
    },
  };
}
