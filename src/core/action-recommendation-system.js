function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerPriorityQueue, ownerControlCenter) {
  const missingInputs = [];
  if (!ownerPriorityQueue || normalizeString(ownerPriorityQueue.status) !== "ready") {
    missingInputs.push("ownerPriorityQueue");
  }
  if (!ownerControlCenter || normalizeString(ownerControlCenter.status) !== "ready") {
    missingInputs.push("ownerControlCenter");
  }
  return missingInputs;
}

export function createActionRecommendationSystem({
  ownerPriorityQueue = null,
  ownerControlCenter = null,
} = {}) {
  const normalizedQueue = normalizeObject(ownerPriorityQueue);
  const normalizedCenter = normalizeObject(ownerControlCenter);
  const missingInputs = buildMissingInputs(normalizedQueue, normalizedCenter);

  if (missingInputs.length > 0) {
    return {
      ownerActionRecommendations: {
        ownerActionRecommendationsId: `owner-actions:${slugify(normalizedQueue?.ownerPriorityQueueId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const topPriority = normalizedQueue.priorities?.[0] ?? null;

  return {
    ownerActionRecommendations: {
      ownerActionRecommendationsId: `owner-actions:${slugify(normalizedQueue.ownerPriorityQueueId)}`,
      status: "ready",
      missingInputs: [],
      recommendations: [
        {
          recommendationId: "owner-action:top-priority",
          actionArea: normalizeString(topPriority?.area) ?? "growth",
          summary: `Review ${normalizeString(topPriority?.area) ?? "growth"} actions in the owner control center`,
          traceId: normalizeString(normalizedCenter.traceId),
        },
      ],
    },
  };
}
