function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function normalizeMobileChecklist(mobileChecklist) {
  return mobileChecklist && typeof mobileChecklist === "object" ? mobileChecklist : {};
}

function normalizeScreenStates(screenStates) {
  return screenStates && typeof screenStates === "object" ? screenStates : {};
}

function createValidationItem({ key, label, passed, reason, severity = "required" }) {
  return {
    key,
    label,
    passed,
    reason,
    severity,
  };
}

export function createScreenValidationChecklist({
  screenId,
  title,
  screenContract,
  mobileChecklist,
  screenStates,
} = {}) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const normalizedMobileChecklist = normalizeMobileChecklist(mobileChecklist);
  const normalizedScreenStates = normalizeScreenStates(screenStates);

  const primaryActionDefined = Boolean(normalizedScreenContract.primaryActionRequired || normalizedScreenContract.interactionModel?.primaryActionRequired);
  const mobileCoverage = Array.isArray(normalizedMobileChecklist.checklistItems) && normalizedMobileChecklist.checklistItems.length > 0;
  const stateDefinitions = normalizedScreenStates.states ?? {};
  const stateCoverage =
    Boolean(stateDefinitions.loading?.enabled)
    && Boolean(stateDefinitions.error?.enabled)
    && (Boolean(stateDefinitions.success?.enabled) || Boolean(stateDefinitions.empty?.enabled));

  const items = [
    createValidationItem({
      key: "primary-action",
      label: "למסך חייבת להיות פעולה ראשית ברורה לפני implementation",
      passed: primaryActionDefined,
      reason: primaryActionDefined
        ? "החוזה מגדיר פעולה ראשית למסך."
        : "אין פעולה ראשית ברורה בחוזה המסך.",
    }),
    createValidationItem({
      key: "mobile-coverage",
      label: "למסך חייב להיות checklist שימושיות למובייל",
      passed: mobileCoverage,
      reason: mobileCoverage
        ? "נבנה checklist מובייל למסך."
        : "חסר checklist מובייל למסך.",
    }),
    createValidationItem({
      key: "state-coverage",
      label: "למסך חייבים להיות מצבי loading, error ו־success/empty ברורים",
      passed: stateCoverage,
      reason: stateCoverage
        ? "שכבת המצבים של המסך מכסה את מצבי ה־UI הקריטיים."
        : "חסרה שכבת מצבים מלאה למסך.",
    }),
    createValidationItem({
      key: "mobile-support-flag",
      label: "חוזה המסך צריך להצהיר אם המסך נתמך במובייל",
      passed: normalizedScreenContract.interactionModel?.supportsMobile !== false,
      reason:
        normalizedScreenContract.interactionModel?.supportsMobile !== false
          ? "המסך מסומן כתומך מובייל."
          : "חוזה המסך מסמן שהמסך לא תומך מובייל.",
      severity: "advisory",
    }),
  ];

  const passedItems = items.filter((item) => item.passed).length;
  const blockingIssues = items.filter((item) => !item.passed && item.severity === "required");

  return {
    screenValidationChecklist: {
      checklistId: `screen-validation:${screenId ?? normalizedScreenContract.screenType ?? "detail"}`,
      screenId: screenId ?? null,
      title: title ?? normalizedScreenContract.screenType ?? "Untitled Screen",
      screenType: normalizedScreenContract.screenType ?? "detail",
      items,
      blockingIssues,
      summary: {
        totalItems: items.length,
        passedItems,
        isReadyForImplementation: blockingIssues.length === 0,
      },
    },
  };
}
