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

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeTone(state, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const explicitTone = normalizeString(normalizedContext.tone, "").toLowerCase();

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
  const explicitUrgency = normalizeString(normalizedContext.urgency, "").toLowerCase();

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

  if (normalizeString(normalizedContext.surface, "") === "background") {
    return false;
  }

  return state !== "waiting" || urgency === "high" || urgency === "critical";
}

function buildVisibilityRules(state, urgency, interactionContext) {
  const normalizedContext = normalizeObject(interactionContext);
  const currentSurface = normalizeString(
    normalizedContext.currentSurface,
    normalizeString(normalizedContext.surface, "workspace"),
  );
  const executionMode = normalizeString(normalizedContext.executionMode, "interactive");
  const currentTask = normalizeString(normalizedContext.currentTask, null);

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
  const projectId = normalizeString(normalizedInteractionContext.projectId, "nexus");

  return {
    companionPresence: {
      presenceId: `companion-presence:${projectId}`,
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
