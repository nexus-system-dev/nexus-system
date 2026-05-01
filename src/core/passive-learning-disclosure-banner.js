function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function createPassiveLearningDisclosureBanner({
  learningInsights = null,
} = {}) {
  const normalizedLearningInsights = normalizeObject(learningInsights);
  const insightItems = normalizeArray(normalizedLearningInsights.items);
  const summary = normalizeString(normalizedLearningInsights.summary);
  const hasInsights = insightItems.length > 0 || Boolean(summary);

  return {
    learningDisclosure: {
      bannerId: `learning-disclosure:${normalizeString(normalizedLearningInsights.insightSetId) ?? "nexus"}`,
      headline: "ה־AI הלומדת מסיקה וממליצה בלבד.",
      message: "היא לא מבצעת פעולות בפועל ולא משנה את הפרויקט בלי זרימה מפורשת של המערכת או החלטת משתמש.",
      tone: "informational",
      visible: hasInsights,
      summary: {
        hasLearningInsights: hasInsights,
        isPassiveOnly: true,
      },
    },
  };
}
