function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createRevenueTrackingSystem({
  revenueSummary = null,
  subscriptionState = null,
} = {}) {
  const revenue = normalizeObject(revenueSummary);
  const subscription = normalizeObject(subscriptionState);
  const hasRevenueSummary = revenue && normalizeString(revenue.status) === "ready";
  const hasSubscriptionState = Boolean(subscription && normalizeString(subscription.status));
  const status = hasRevenueSummary || hasSubscriptionState ? "ready" : "missing-inputs";
  const missingInputs = status === "ready" ? [] : ["revenueSummary", "subscriptionState"];

  return {
    ownerRevenueView: {
      ownerRevenueViewId: `owner-revenue:${slugify(revenue?.revenueSummaryId)}`,
      status,
      missingInputs,
      revenueStatus: normalizeString(revenue?.status) ?? "missing",
      subscriptionStatus: normalizeString(subscription?.status) ?? "not-required",
    },
  };
}
