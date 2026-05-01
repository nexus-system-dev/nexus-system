function createEmptyCollection(collection, key = "screens") {
  return collection && typeof collection === "object"
    ? collection
    : { [key]: [], summary: {} };
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function indexByScreenId(collection) {
  const screens = Array.isArray(collection.screens) ? collection.screens : [];
  return new Map(
    screens
      .filter((screen) => screen && typeof screen === "object")
      .map((screen) => {
        const screenId = normalizeString(screen.screenId);
        if (!screenId) {
          return null;
        }

        return [
          screenId,
          {
            ...screen,
            screenId,
            screenType: normalizeString(screen.screenType),
          },
        ];
      })
      .filter(Boolean),
  );
}

function extractBlockingIssues(...collections) {
  return [...new Set(
    collections.flatMap((entry) =>
      (Array.isArray(entry?.blockingIssues) ? entry.blockingIssues : [])
        .filter((issue) => typeof issue === "string" && issue.trim())
        .map((issue) => issue.trim()),
    ),
  )];
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
