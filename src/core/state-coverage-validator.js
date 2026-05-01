function normalizeScreenTemplate(screenTemplate) {
  return screenTemplate && typeof screenTemplate === "object" ? screenTemplate : {};
}

function normalizeScreenStates(screenStates) {
  return screenStates && typeof screenStates === "object" ? screenStates : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStates(states) {
  return states && typeof states === "object" ? states : {};
}

function supportsState(templateType, stateKey) {
  if (templateType === "dashboard") {
    return ["loading", "empty", "error"].includes(stateKey);
  }

  if (templateType === "workflow") {
    return ["loading", "error", "success"].includes(stateKey);
  }

  if (templateType === "management") {
    return ["loading", "empty", "error", "success"].includes(stateKey);
  }

  return ["loading", "error", "success"].includes(stateKey);
}

export function createStateCoverageValidator({
  screenId,
  screenTemplate,
  screenStates,
} = {}) {
  const normalizedScreenTemplate = normalizeScreenTemplate(screenTemplate);
  const normalizedScreenStates = normalizeScreenStates(screenStates);
  const normalizedScreenId = normalizeString(screenId);
  const normalizedScreenType = normalizeString(normalizedScreenStates.screenType);
  const templateType = normalizeString(normalizedScreenTemplate.templateType) ?? normalizedScreenType ?? "detail";
  const states = normalizeStates(normalizedScreenStates.states);
  const requiredStates = ["loading", "empty", "error", "success"].filter((stateKey) =>
    supportsState(templateType, stateKey),
  );
  const availableStates = requiredStates.filter((stateKey) => Boolean(states[stateKey]?.enabled));
  const missingStates = requiredStates.filter((stateKey) => !availableStates.includes(stateKey));

  return {
    stateCoverageValidation: {
      validationId: `state-coverage-validation:${normalizedScreenId ?? normalizedScreenType ?? "unknown"}`,
      screenId: normalizedScreenId,
      screenType: normalizedScreenType,
      templateType,
      summary: {
        requiredStates,
        availableStates,
        missingStates,
        isValid: missingStates.length === 0,
      },
      blockingIssues: missingStates.map((stateKey) => `missing-${stateKey}-state`),
    },
  };
}
