function normalizeScreenContract(screenContract) {
  return screenContract && typeof screenContract === "object" ? screenContract : {};
}

function resolveBooleanFlag(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function buildChecklistItems(screenContract) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const layout = normalizedScreenContract.layout ?? {};
  const stateSupport = normalizedScreenContract.stateSupport ?? {};
  const interactionModel = normalizedScreenContract.interactionModel ?? {};
  const primaryActionRequired = resolveBooleanFlag(interactionModel.primaryActionRequired, true);
  const hasStateCoverage = Boolean(stateSupport.loading || stateSupport.error || stateSupport.success);

  return [
    {
      key: "viewport-fit",
      label: "המסך חייב להתאים לרוחב מובייל בלי גלילה אופקית",
      required: true,
      status: "required",
    },
    {
      key: "primary-action-access",
      label: "הפעולה הראשית חייבת להישאר נגישה ונראית במסך קטן",
      required: primaryActionRequired,
      status: primaryActionRequired ? "required" : "optional",
    },
    {
      key: "state-coverage",
      label: "מצבי loading, error ו-success חייבים להישאר קריאים וברורים במובייל",
      required: hasStateCoverage,
      status: hasStateCoverage ? "required" : "optional",
    },
    {
      key: "touch-targets",
      label: "רכיבי לחיצה חייבים להיות מותאמים למגע ולא לצפיפות של דסקטופ",
      required: true,
      status: "required",
    },
    {
      key: "navigation-collapse",
      label: "ניווט משני או sidebar חייבים לעבור למצב מתקפל במובייל",
      required: Boolean(layout.supportsSidebar),
      status: layout.supportsSidebar ? "required" : "not-needed",
    },
    {
      key: "progress-visibility",
      label: "חיווי התקדמות חייב להישאר גלוי בלי להשתלט על המסך",
      required: Boolean(layout.supportsProgress),
      status: layout.supportsProgress ? "required" : "not-needed",
    },
  ];
}

function buildWarnings(screenContract) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const warnings = [];

  if (normalizedScreenContract.layout?.supportsSidebar) {
    warnings.push("Sidebar מלא לא יכול להישאר פתוח כברירת מחדל במובייל.");
  }

  if (normalizedScreenContract.layout?.layout === "workspace") {
    warnings.push("Workspace צפוף דורש היררכיית panels ברורה ויכולת החלפה מהירה בין אזורים.");
  }

  if (normalizedScreenContract.layout?.supportsProgress) {
    warnings.push("Progress חייב להישאר קריא גם כשהמסך קצר וצפוף.");
  }

  return warnings;
}

export function createMobileReadinessChecklist({
  screenId,
  title,
  screenContract,
} = {}) {
  const normalizedScreenContract = normalizeScreenContract(screenContract);
  const checklistItems = buildChecklistItems(normalizedScreenContract);
  const requiredItems = checklistItems.filter((item) => item.required).length;
  const supportsMobile = resolveBooleanFlag(normalizedScreenContract.interactionModel?.supportsMobile, true);

  return {
    mobileChecklist: {
      checklistId: `mobile-checklist:${screenId ?? normalizedScreenContract.screenType ?? "detail"}`,
      screenId: screenId ?? null,
      title: title ?? normalizedScreenContract.screenType ?? "Untitled Screen",
      screenType: normalizedScreenContract.screenType ?? "detail",
      supportsMobile,
      checklistItems,
      warnings: buildWarnings(normalizedScreenContract),
      summary: {
        totalItems: checklistItems.length,
        requiredItems,
        mobileReadyByContract: supportsMobile,
      },
    },
  };
}
