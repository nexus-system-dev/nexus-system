function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolveMotionLevel(companionState, companionTriggerDecision) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const state = normalizedCompanionState.state ?? normalizedCompanionState.mode ?? "observing";
  const decisionType = normalizedTriggerDecision.decisionType ?? "stay-quiet";

  if (decisionType === "interrupt" || state === "warning") {
    return "noticeable";
  }

  if (state === "recommending" || state === "analyzing" || decisionType === "show") {
    return "gentle";
  }

  return "minimal";
}

function resolveAnimationMode(companionState, companionTriggerDecision) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const state = normalizedCompanionState.state ?? normalizedCompanionState.mode ?? "observing";
  const decisionType = normalizedTriggerDecision.decisionType ?? "stay-quiet";

  if (decisionType === "stay-quiet") {
    return "still";
  }

  if (state === "warning") {
    return "pulse";
  }

  if (state === "recommending") {
    return "glow";
  }

  if (state === "analyzing") {
    return "breathe";
  }

  return "idle";
}

function buildSummary(animationMode, motionLevel, companionTriggerDecision) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);

  return {
    animationMode,
    motionLevel,
    nonBlocking: true,
    respectsQuietMode: normalizedTriggerDecision.decisionType === "stay-quiet",
    allowsInterruptionCue: normalizedTriggerDecision.summary?.canInterrupt === true,
  };
}

export function createCompanionAnimationStateRules({
  companionState = null,
  companionTriggerDecision = null,
} = {}) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const motionLevel = resolveMotionLevel(normalizedCompanionState, normalizedTriggerDecision);
  const animationMode = resolveAnimationMode(normalizedCompanionState, normalizedTriggerDecision);

  return {
    animationStateRules: {
      animationRulesId: `companion-animation:${normalizedCompanionState.stateId ?? "project"}`,
      animationMode,
      motionLevel,
      loop: animationMode !== "still",
      durationMs: motionLevel === "noticeable" ? 1400 : motionLevel === "gentle" ? 2200 : 0,
      easing: motionLevel === "noticeable" ? "ease-out" : "ease-in-out",
      summary: buildSummary(animationMode, motionLevel, normalizedTriggerDecision),
    },
  };
}
