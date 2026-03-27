function createEmptyCollection(collection, key = "screens") {
  return collection && typeof collection === "object"
    ? collection
    : { [key]: [], summary: {} };
}

function indexByScreenId(collection) {
  const screens = Array.isArray(collection.screens) ? collection.screens : [];
  return new Map(screens.map((screen) => [screen.screenId, screen]));
}

function extractBlockingIssues(...collections) {
  return collections.flatMap((entry) => (Array.isArray(entry?.blockingIssues) ? entry.blockingIssues : []));
}

export function createScreenReviewAssembler({
  primaryActionValidation,
  mobileValidation,
  stateCoverageValidation,
  consistencyValidation,
} = {}) {
  const normalizedPrimaryActionValidation = createEmptyCollection(primaryActionValidation);
  const normalizedMobileValidation = createEmptyCollection(mobileValidation);
  const normalizedStateCoverageValidation = createEmptyCollection(stateCoverageValidation);
  const normalizedConsistencyValidation = createEmptyCollection(consistencyValidation);

  const primaryIndex = indexByScreenId(normalizedPrimaryActionValidation);
  const mobileIndex = indexByScreenId(normalizedMobileValidation);
  const stateCoverageIndex = indexByScreenId(normalizedStateCoverageValidation);
  const consistencyIndex = indexByScreenId(normalizedConsistencyValidation);

  const screenIds = Array.from(
    new Set([
      ...primaryIndex.keys(),
      ...mobileIndex.keys(),
      ...stateCoverageIndex.keys(),
      ...consistencyIndex.keys(),
    ]),
  );

  const screens = screenIds.map((screenId) => {
    const primary = primaryIndex.get(screenId) ?? null;
    const mobile = mobileIndex.get(screenId) ?? null;
    const stateCoverage = stateCoverageIndex.get(screenId) ?? null;
    const consistency = consistencyIndex.get(screenId) ?? null;
    const isReady = Boolean(
      primary?.summary?.isValid
        && mobile?.summary?.isUsable
        && stateCoverage?.summary?.isValid
        && consistency?.summary?.isConsistent,
    );

    return {
      screenId,
      screenType:
        primary?.screenType
        ?? mobile?.screenType
        ?? stateCoverage?.screenType
        ?? null,
      review: {
        primaryAction: primary,
        mobile,
        stateCoverage,
        consistency,
      },
      summary: {
        isReady,
        blockingIssues: extractBlockingIssues(primary, mobile, stateCoverage, consistency),
      },
    };
  });

  return {
    screenReviewReport: {
      reportId: `screen-review-report:${screens.length}`,
      screens,
      summary: {
        totalScreens: screens.length,
        readyScreens: screens.filter((screen) => screen.summary.isReady).length,
        blockedScreens: screens.filter((screen) => !screen.summary.isReady).length,
      },
    },
  };
}
