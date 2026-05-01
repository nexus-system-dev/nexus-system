function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(dailyOwnerOverview) {
  const missingInputs = [];
  if (!dailyOwnerOverview || normalizeString(dailyOwnerOverview.status) !== "ready") {
    missingInputs.push("dailyOwnerOverview");
  }
  return missingInputs;
}

export function createOwnerPriorityEngine({
  dailyOwnerOverview = null,
  ownerControlCenter = null,
} = {}) {
  const normalizedOverview = normalizeObject(dailyOwnerOverview);
  const normalizedCenter = normalizeObject(ownerControlCenter);
  const missingInputs = buildMissingInputs(normalizedOverview);

  if (missingInputs.length > 0) {
    return {
      ownerPriorityQueue: {
        ownerPriorityQueueId: `owner-priority:${slugify(normalizedOverview?.dailyOwnerOverviewId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  return {
    ownerPriorityQueue: {
      ownerPriorityQueueId: `owner-priority:${slugify(normalizedOverview.dailyOwnerOverviewId)}`,
      status: "ready",
      missingInputs: [],
      priorities: [
        {
          priorityId: "owner-priority:health",
          area: normalizeString(normalizedCenter?.healthStatus) === "stable" ? "growth" : "reliability",
          urgency: normalizedOverview.openIssues > 0 ? "high" : "medium",
        },
      ],
    },
  };
}
