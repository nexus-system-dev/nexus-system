function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
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
  const screenType = normalizedScreenContract.screenType ?? "detail";
  const stateSupport = normalizedScreenContract.stateSupport ?? {};

  return {
    loading: createStateDefinition({
      key: "loading",
      enabled: stateSupport.loading !== false,
      headline: "טוענים את המידע",
      description: `המסך מסוג ${screenType} צריך להציג טעינה ברורה בלי להשאיר את המשתמש ללא הקשר.`,
      tone: "informative",
    }),
    empty: createStateDefinition({
      key: "empty",
      enabled: Boolean(stateSupport.empty),
      headline: "עדיין אין כאן תוכן",
      description: `המסך מסוג ${screenType} צריך להראות מצב ריק עם כיוון פעולה ברור, ולא חלל מת.`,
      tone: "guiding",
    }),
    error: createStateDefinition({
      key: "error",
      enabled: stateSupport.error !== false,
      headline: "משהו השתבש",
      description: `המסך מסוג ${screenType} צריך להסביר את התקלה ולהציע דרך התאוששות.`,
      tone: "warning",
    }),
    success: createStateDefinition({
      key: "success",
      enabled: Boolean(stateSupport.success),
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
  const states = buildStateDefinitions(normalizedScreenContract);
  const enabledStates = Object.values(states).filter((state) => state.enabled).map((state) => state.key);

  return {
    screenStates: {
      stateDefinitionId: `screen-states:${screenId ?? normalizedScreenContract.screenType ?? "detail"}`,
      screenId: screenId ?? null,
      title: title ?? normalizedScreenContract.screenType ?? "Untitled Screen",
      screenType: normalizedScreenContract.screenType ?? "detail",
      states,
      summary: {
        totalStates: Object.keys(states).length,
        enabledStates,
        supportsRecoveryState: Boolean(states.error?.enabled),
      },
    },
  };
}
