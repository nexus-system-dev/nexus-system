function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(websiteConversionFlow) {
  const missingInputs = [];
  if (!websiteConversionFlow || normalizeString(websiteConversionFlow.status) !== "ready") {
    missingInputs.push("websiteConversionFlow");
  }
  return missingInputs;
}

export function createWaitlistAndAccessRequestModule({
  visitorInput = null,
  websiteConversionFlow = null,
} = {}) {
  const normalizedVisitor = normalizeObject(visitorInput);
  const normalizedFlow = normalizeObject(websiteConversionFlow);
  const missingInputs = buildMissingInputs(normalizedFlow);

  if (missingInputs.length > 0) {
    return {
      waitlistRecord: {
        waitlistRecordId: `waitlist-record:${slugify(normalizedVisitor?.email)}`,
        status: "missing-inputs",
        missingInputs,
      },
      accessRequest: {
        accessRequestId: `access-request:${slugify(normalizedVisitor?.email)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const email = normalizeString(normalizedVisitor?.email) ?? "unknown@example.com";
  const requestedAccess = normalizedFlow.entryRoute === "signup" || normalizedFlow.entryRoute === "waitlist";

  return {
    waitlistRecord: {
      waitlistRecordId: `waitlist-record:${slugify(email)}`,
      status: requestedAccess ? "captured" : "not-required",
      email,
      source: normalizedFlow.entryRoute,
    },
    accessRequest: {
      accessRequestId: `access-request:${slugify(email)}`,
      status: requestedAccess ? "submitted" : "not-required",
      email,
      requestedRoute: normalizedFlow.entryRoute,
    },
  };
}
