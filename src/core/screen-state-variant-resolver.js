// Task #57 — Create screen state variant resolver
// Resolves which variant of a screen should be active based on states,
// template variants, and validation signals — without ad-hoc UI decisions.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

const VARIANT_PRIORITY = ["error", "loading", "empty", "success", "populated", "default"];

function resolveCurrentStatePhase(screenStates) {
  const normalized = normalizeObject(screenStates);
  // Phase from explicit field or derived from loading/error/empty flags
  if (typeof normalized.phase === "string") return normalized.phase;
  if (normalized.isLoading === true) return "loading";
  if (normalized.hasError === true || normalized.error != null) return "error";
  if (normalized.isEmpty === true) return "empty";
  if (normalized.isSuccess === true) return "success";
  return "populated";
}

function scoreVariantMatch(variant, currentPhase, validationSignals) {
  const norm = normalizeObject(variant);
  const conditions = normalizeArray(norm.conditions);
  const signals = normalizeObject(validationSignals);
  let score = 0;

  for (const condition of conditions) {
    const normCond = normalizeObject(condition);
    // Phase match is highest signal
    if (normCond.phase === currentPhase) score += 10;
    // Validation signal match
    if (normCond.signalKey && signals[normCond.signalKey] === normCond.signalValue) score += 5;
    // Priority boost for named variants matching phase priority order
    const priorityIndex = VARIANT_PRIORITY.indexOf(normCond.phase);
    if (priorityIndex !== -1) score += VARIANT_PRIORITY.length - priorityIndex;
  }

  return score;
}

function resolveActiveVariant(templateVariants, currentPhase, validationSignals, interactionStateSystem) {
  const variants = normalizeArray(templateVariants);
  const variantIndex = {};

  // Build index from object form
  if (!Array.isArray(templateVariants) && templateVariants && typeof templateVariants === "object") {
    for (const [key, val] of Object.entries(templateVariants)) {
      const norm = normalizeObject(val);
      variantIndex[key] = { variantKey: key, ...norm };
    }
    // Score from index
    const scored = Object.entries(variantIndex).map(([key, v]) => ({
      variantKey: key,
      variant: v,
      score: scoreVariantMatch(v, currentPhase, validationSignals),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0] ?? null;
  }

  if (variants.length === 0) return null;

  const scored = variants.map((v) => ({
    variantKey: normalizeObject(v).variantKey ?? "default",
    variant: v,
    score: scoreVariantMatch(v, currentPhase, validationSignals),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

export function createScreenStateVariantResolver({
  screenStates = null,
  templateVariants = null,
  screenValidationChecklist = null,
  interactionStateSystem = null,
} = {}) {
  const states = normalizeObject(screenStates);
  const checklist = normalizeObject(screenValidationChecklist);
  const interactionSystem = normalizeObject(interactionStateSystem);

  const currentPhase = resolveCurrentStatePhase(states);
  const validationSignals = {
    ...normalizeObject(checklist.signals),
    ...normalizeObject(interactionSystem.activeSignals),
  };

  const resolved = resolveActiveVariant(templateVariants, currentPhase, validationSignals, interactionSystem);
  const activeVariantKey = resolved?.variantKey ?? "default";
  const activeVariant = normalizeObject(resolved?.variant);

  return {
    activeScreenVariantPlan: {
      planId: `variant-plan:${currentPhase}:${activeVariantKey}`,
      currentPhase,
      activeVariantKey,
      activeVariant: {
        variantKey: activeVariantKey,
        templateId: activeVariant.templateId ?? null,
        overrides: normalizeObject(activeVariant.overrides),
        conditions: normalizeArray(activeVariant.conditions),
      },
      resolutionScore: resolved?.score ?? 0,
      validationSignalsApplied: Object.keys(validationSignals).length,
      meta: {
        hasExplicitVariant: resolved !== null,
        phaseIsKnown: ["loading", "empty", "populated", "error", "success"].includes(currentPhase),
        usingDefaultFallback: activeVariantKey === "default",
      },
    },
  };
}
