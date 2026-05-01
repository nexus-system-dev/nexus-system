function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerFocusArea, ownerActionRecommendations) {
  const missingInputs = [];
  if (!ownerFocusArea || normalizeString(ownerFocusArea.status) !== "ready") missingInputs.push("ownerFocusArea");
  if (!ownerActionRecommendations || normalizeString(ownerActionRecommendations.status) !== "ready") missingInputs.push("ownerActionRecommendations");
  return missingInputs;
}

export function createTaskRecommendationEngine({
  ownerFocusArea = null,
  ownerActionRecommendations = null,
} = {}) {
  const focus = normalizeObject(ownerFocusArea);
  const recommendations = normalizeObject(ownerActionRecommendations);
  const missingInputs = buildMissingInputs(focus, recommendations);

  if (missingInputs.length > 0) {
    return { ownerTaskList: { ownerTaskListId: `owner-task-list:${slugify(focus?.ownerFocusAreaId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    ownerTaskList: {
      ownerTaskListId: `owner-task-list:${slugify(focus.ownerFocusAreaId)}`,
      status: "ready",
      missingInputs: [],
      tasks: (recommendations.recommendations ?? []).map((item, index) => ({
        ownerTaskId: `owner-task:${index + 1}`,
        area: normalizeString(focus.area) ?? "growth",
        summary: normalizeString(item.summary) ?? "Review owner action",
      })),
    },
  };
}
