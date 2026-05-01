function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeNonNegativeInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function buildMissingRevenueSummary() {
  return {
    revenueSummary: {
      revenueSummaryId: "revenue-summary:missing:missing-inputs:0:0:0:0:0",
      paymentPosture: "missing",
      summary: {
        summaryStatus: "missing-inputs",
        payingUsers: 0,
        convertedUsers: 0,
        activeSubscriptions: 0,
        countedEvents: 0,
        ignoredEvents: 0,
      },
    },
  };
}

function normalizePayingUserMetrics(payingUserMetrics) {
  const normalizedMetrics = normalizeObject(payingUserMetrics);
  const normalizedSummary = normalizeObject(normalizedMetrics?.summary);
  const summaryStatus = typeof normalizedSummary?.summaryStatus === "string"
    ? normalizedSummary.summaryStatus
    : null;

  if (!normalizedMetrics || !normalizedSummary || summaryStatus === null) {
    return null;
  }

  return {
    payingUsers: normalizeNonNegativeInteger(normalizedMetrics?.payingUsers),
    convertedUsers: normalizeNonNegativeInteger(normalizedMetrics?.convertedUsers),
    activeSubscriptions: normalizeNonNegativeInteger(normalizedMetrics?.activeSubscriptions),
    countedEvents: normalizeNonNegativeInteger(normalizedSummary?.countedEvents),
    ignoredEvents: normalizeNonNegativeInteger(normalizedSummary?.ignoredEvents),
    summaryStatus,
  };
}

function resolvePaymentPosture({
  summaryStatus,
  payingUsers,
  activeSubscriptions,
  ignoredEvents,
}) {
  if (summaryStatus !== "complete") {
    return "missing";
  }

  if (ignoredEvents > 0 || activeSubscriptions < payingUsers) {
    return "at-risk";
  }

  return "stable";
}

function buildRevenueSummaryId({
  paymentPosture,
  summaryStatus,
  payingUsers,
  convertedUsers,
  activeSubscriptions,
  countedEvents,
  ignoredEvents,
}) {
  return `revenue-summary:${paymentPosture}:${summaryStatus}:${payingUsers}:${convertedUsers}:${activeSubscriptions}:${countedEvents}:${ignoredEvents}`;
}

export function createRevenueSummaryAggregator({
  payingUserMetrics = null,
} = {}) {
  const normalizedMetrics = normalizePayingUserMetrics(payingUserMetrics);
  if (!normalizedMetrics) {
    return buildMissingRevenueSummary();
  }

  const paymentPosture = resolvePaymentPosture(normalizedMetrics);

  return {
    revenueSummary: {
      revenueSummaryId: buildRevenueSummaryId({
        paymentPosture,
        ...normalizedMetrics,
      }),
      paymentPosture,
      summary: {
        summaryStatus: normalizedMetrics.summaryStatus,
        payingUsers: normalizedMetrics.payingUsers,
        convertedUsers: normalizedMetrics.convertedUsers,
        activeSubscriptions: normalizedMetrics.activeSubscriptions,
        countedEvents: normalizedMetrics.countedEvents,
        ignoredEvents: normalizedMetrics.ignoredEvents,
      },
    },
  };
}
