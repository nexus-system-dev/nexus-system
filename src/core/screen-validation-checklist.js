function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function normalizeMobileChecklist(mobileChecklist) {
  return mobileChecklist && typeof mobileChecklist === "object" ? mobileChecklist : {};
}

function normalizeScreenStates(screenStates) {
  return screenStates && typeof screenStates === "object" ? screenStates : {};
}

function resolveBooleanFlag(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
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
  const interactionModel = normalizedScreenContract.interactionModel ?? {};
  const primaryActionRequired = resolveBooleanFlag(interactionModel.primaryActionRequired, true);
  const supportsMobileDeclared = typeof interactionModel.supportsMobile === "boolean";

  const primaryActionDefined =
    primaryActionRequired === false
      ? true
      : Boolean(
          normalizedScreenContract.primaryAction?.actionId && normalizedScreenContract.primaryAction?.label
        ) || primaryActionRequired;
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
        ? (primaryActionRequired === false ? "החוזה מגדיר שהפעולה הראשית אופציונלית למסך זה." : "החוזה מגדיר פעולה ראשית למסך.")
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
      passed: supportsMobileDeclared,
      reason:
        supportsMobileDeclared
          ? "חוזה המסך מצהיר במפורש על תמיכה במובייל."
          : "חוזה המסך לא מצהיר בצורה בוליאנית מפורשת על תמיכה במובייל.",
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
