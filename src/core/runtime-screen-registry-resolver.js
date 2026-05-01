// Task #59 — Create runtime screen registry resolver
// Builds a registry and resolver that select which renderable screen is available
// and which should be active based on project state, flow map, and screen inventory.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildRegistryEntry(screen, composition) {
  const screenNorm = normalizeObject(screen);
  const compNorm = normalizeObject(composition);
  const compInner = normalizeObject(compNorm.renderableScreenComposition ?? compNorm);

  return {
    screenId: screenNorm.screenId ?? screenNorm.id ?? compInner.compositionId ?? "unknown",
    flowId: screenNorm.flowId ?? null,
    screenType: screenNorm.screenType ?? screenNorm.type ?? "detail",
    isAvailable: compInner.meta?.isRenderable ?? compInner.isRenderable ?? true,
    composition: compInner.compositionId ?? null,
    orderInFlow: typeof screenNorm.orderInFlow === "number" ? screenNorm.orderInFlow : null,
    conditions: normalizeArray(screenNorm.conditions),
  };
}

function resolveActiveScreen(registryEntries, screenFlowMap, projectState) {
  const flowMap = normalizeObject(screenFlowMap);
  const state = normalizeObject(projectState);

  const currentFlowId = state.currentFlowId ?? flowMap.defaultFlowId ?? null;
  const currentScreenId = state.currentScreenId ?? flowMap.defaultScreenId ?? null;
  const projectPhase = state.phase ?? state.currentPhase ?? null;

  // Available entries only
  const available = registryEntries.filter((e) => e.isAvailable);
  if (available.length === 0) return null;

  // Try exact match by current screen ID
  if (currentScreenId) {
    const exact = available.find((e) => e.screenId === currentScreenId);
    if (exact) return exact;
  }

  // Try flow match
  if (currentFlowId) {
    const flowMatches = available
      .filter((e) => e.flowId === currentFlowId)
      .sort((a, b) => (a.orderInFlow ?? 999) - (b.orderInFlow ?? 999));
    if (flowMatches.length > 0) return flowMatches[0];
  }

  // Try phase-based condition match
  if (projectPhase) {
    const phaseMatch = available.find((e) =>
      e.conditions.some((c) => normalizeObject(c).phase === projectPhase)
    );
    if (phaseMatch) return phaseMatch;
  }

  // Fallback: first available
  return available[0] ?? null;
}

export function createRuntimeScreenRegistryResolver({
  screenInventory = null,
  screenFlowMap = null,
  renderableScreenComposition = null,
  projectState = null,
} = {}) {
  const inventory = normalizeArray(screenInventory);
  const flowMap = normalizeObject(screenFlowMap);
  const composition = normalizeObject(renderableScreenComposition);
  const state = normalizeObject(projectState);

  // Build registry from inventory + composition
  // If screenInventory was explicitly provided as an empty array, registry is empty.
  // Only synthesize from composition when screenInventory was not provided (null).
  const compInner = normalizeObject(composition.renderableScreenComposition ?? composition);
  const inventoryWasProvided = screenInventory !== null;
  const registryEntries = inventory.length > 0
    ? inventory.map((screen) => buildRegistryEntry(screen, composition))
    : inventoryWasProvided
      ? [] // explicitly empty inventory → empty registry
      : [buildRegistryEntry({ screenId: compInner.screenId, flowId: null, isAvailable: compInner.meta?.isRenderable ?? true }, composition)];

  const activeEntry = resolveActiveScreen(registryEntries, flowMap, state);

  return {
    runtimeScreenRegistry: {
      registryId: `screen-registry:${Date.now()}`,
      entries: registryEntries,
      totalScreens: registryEntries.length,
      availableScreens: registryEntries.filter((e) => e.isAvailable).length,
    },
    activeScreenResolver: {
      resolvedScreenId: activeEntry?.screenId ?? null,
      resolvedCompositionId: activeEntry?.composition ?? compInner.compositionId ?? null,
      activeFlowId: activeEntry?.flowId ?? state.currentFlowId ?? null,
      resolutionStrategy: activeEntry
        ? activeEntry.screenId === state.currentScreenId
          ? "exact-match"
          : activeEntry.flowId
            ? "flow-match"
            : "fallback"
        : "none",
      meta: {
        hasActiveScreen: activeEntry !== null,
        isRegistryEmpty: registryEntries.length === 0,
        availableCount: registryEntries.filter((e) => e.isAvailable).length,
      },
    },
  };
}
