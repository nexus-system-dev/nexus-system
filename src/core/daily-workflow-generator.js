function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(dailyOwnerOverview, ownerPriorityQueue) {
  const missingInputs = [];
  if (!dailyOwnerOverview || normalizeString(dailyOwnerOverview.status) !== "ready") missingInputs.push("dailyOwnerOverview");
  if (!ownerPriorityQueue || normalizeString(ownerPriorityQueue.status) !== "ready") missingInputs.push("ownerPriorityQueue");
  return missingInputs;
}

export function createDailyWorkflowGenerator({
  dailyOwnerOverview = null,
  ownerPriorityQueue = null,
} = {}) {
  const overview = normalizeObject(dailyOwnerOverview);
  const queue = normalizeObject(ownerPriorityQueue);
  const missingInputs = buildMissingInputs(overview, queue);

  if (missingInputs.length > 0) {
    return { ownerDailyWorkflow: { ownerDailyWorkflowId: `owner-daily-workflow:${slugify(overview?.dailyOwnerOverviewId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    ownerDailyWorkflow: {
      ownerDailyWorkflowId: `owner-daily-workflow:${slugify(overview.dailyOwnerOverviewId)}`,
      status: "ready",
      missingInputs: [],
      focusTheme: normalizeString(queue.priorities?.[0]?.area) ?? "growth",
      workflowBlocks: ["review-health", "review-priorities", "execute-top-action", "close-day"],
    },
  };
}
