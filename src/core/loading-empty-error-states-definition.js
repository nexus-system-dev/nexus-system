const CANONICAL_SCREEN_TYPES = new Set(["wizard", "dashboard", "tracking", "workspace", "detail"]);

function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function normalizeScreenType(screenType) {
  if (typeof screenType !== "string") {
    return "detail";
  }

  const normalized = screenType.trim().toLowerCase();
  return CANONICAL_SCREEN_TYPES.has(normalized) ? normalized : "detail";
}

function resolveBooleanFlag(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function createStateDefinition({ key, enabled, headline, description, tone }) {
  return {
    key,
    enabled,
    headline,
    description,
    tone,
  };
}

function buildStateDefinitions(screenContract) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const screenType = normalizeScreenType(normalizedScreenContract.screenType);
  const stateSupport = normalizedScreenContract.stateSupport ?? {};

  return {
    loading: createStateDefinition({
      key: "loading",
      enabled: resolveBooleanFlag(stateSupport.loading, true),
      headline: "טוענים את המידע",
      description: `המסך מסוג ${screenType} צריך להציג טעינה ברורה בלי להשאיר את המשתמש ללא הקשר.`,
      tone: "informative",
    }),
    empty: createStateDefinition({
      key: "empty",
      enabled: resolveBooleanFlag(stateSupport.empty, false),
      headline: "עדיין אין כאן תוכן",
      description: `המסך מסוג ${screenType} צריך להראות מצב ריק עם כיוון פעולה ברור, ולא חלל מת.`,
      tone: "guiding",
    }),
    error: createStateDefinition({
      key: "error",
      enabled: resolveBooleanFlag(stateSupport.error, true),
      headline: "משהו השתבש",
      description: `המסך מסוג ${screenType} צריך להסביר את התקלה ולהציע דרך התאוששות.`,
      tone: "warning",
    }),
    success: createStateDefinition({
      key: "success",
      enabled: resolveBooleanFlag(stateSupport.success, false),
      headline: "הפעולה הושלמה",
      description: `המסך מסוג ${screenType} צריך להראות מה הושלם ומה הצעד הבא.`,
      tone: "positive",
    }),
  };
}

export function createLoadingEmptyErrorStatesDefinition({
  screenId,
  title,
  screenContract,
} = {}) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const screenType = normalizeScreenType(normalizedScreenContract.screenType);
  const states = buildStateDefinitions(normalizedScreenContract);
  const enabledStates = Object.values(states).filter((state) => state.enabled).map((state) => state.key);

  return {
    screenStates: {
      stateDefinitionId: `screen-states:${screenId ?? screenType}`,
      screenId: screenId ?? null,
      title: title ?? screenType ?? "Untitled Screen",
      screenType,
      states,
      summary: {
        totalStates: Object.keys(states).length,
        enabledStates,
        supportsRecoveryState: Boolean(states.error?.enabled),
      },
    },
  };
}
