function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeState(state) {
  const normalizedState = typeof state === "string" ? state.trim().toLowerCase() : "";

  if (["observing", "analyzing", "recommending", "warning", "waiting"].includes(normalizedState)) {
    return normalizedState;
  }

  return "observing";
}

function normalizeTone(state, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const explicitTone = typeof normalizedContext.tone === "string" ? normalizedContext.tone.trim().toLowerCase() : "";

  if (explicitTone) {
    return explicitTone;
  }

  if (state === "warning") {
    return "serious";
  }

  if (state === "recommending") {
    return "helpful";
  }

  if (state === "analyzing") {
    return "focused";
  }

  if (state === "waiting") {
    return "quiet";
  }

  return "calm";
}

function normalizeUrgency(state, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const explicitUrgency = typeof normalizedContext.urgency === "string"
    ? normalizedContext.urgency.trim().toLowerCase()
    : "";

  if (["low", "medium", "high", "critical"].includes(explicitUrgency)) {
    return explicitUrgency;
  }

  if (state === "warning") {
    return "high";
  }

  if (state === "recommending" || state === "analyzing") {
    return "medium";
  }

  return "low";
}

function resolveVisibility(state, urgency, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const explicitVisible = normalizedContext.visible;

  if (typeof explicitVisible === "boolean") {
    return explicitVisible;
  }

  if (normalizedContext.surface === "background") {
    return false;
  }

  return state !== "waiting" || urgency === "high" || urgency === "critical";
}

function buildVisibilityRules(state, urgency, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const currentSurface = normalizedContext.currentSurface ?? normalizedContext.surface ?? "workspace";
  const executionMode = normalizedContext.executionMode ?? "interactive";
  const currentTask = normalizedContext.currentTask ?? null;

  return {
    showInWorkspace: currentSurface !== "background",
    showAsDockBadge: urgency === "high" || urgency === "critical",
    allowInlineMessage: state === "recommending" || state === "warning",
    allowInterruption: urgency === "critical" && executionMode !== "critical-run",
    staysQuietDuringCriticalExecution: executionMode === "critical-run",
    currentSurface,
    currentTask,
  };
}

function buildSummary(state, tone, urgency, visible, visibilityRules) {
  return {
    state,
    tone,
    urgency,
    visible,
    canInterrupt: visibilityRules.allowInterruption,
    prefersDockPresence: visibilityRules.showAsDockBadge,
  };
}

export function defineAiCompanionPresenceSchema({
  assistantState = null,
  interactionContext = null,
} = {}) {
  const normalizedAssistantState = normalizeObject(assistantState);
  const normalizedInteractionContext = normalizeObject(interactionContext);
  const state = normalizeState(
    normalizedAssistantState.state
      ?? normalizedAssistantState.mode
      ?? normalizedInteractionContext.assistantMode
      ?? null,
  );
  const tone = normalizeTone(state, normalizedInteractionContext);
  const urgency = normalizeUrgency(state, normalizedInteractionContext);
  const visible = resolveVisibility(state, urgency, normalizedInteractionContext);
  const visibilityRules = buildVisibilityRules(state, urgency, normalizedInteractionContext);

  return {
    companionPresence: {
      presenceId: `companion-presence:${normalizedInteractionContext.projectId ?? "nexus"}`,
      state,
      tone,
      urgency,
      visible,
      visualMode: visible ? "dock" : "ambient",
      visibilityRules,
      summary: buildSummary(state, tone, urgency, visible, visibilityRules),
    },
  };
}
