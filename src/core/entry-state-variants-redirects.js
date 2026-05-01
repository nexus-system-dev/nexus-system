function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(appEntryDecision, postLoginDestination, appLandingEntry) {
  const missingInputs = [];
  if (!appEntryDecision || normalizeString(appEntryDecision.status) !== "ready") missingInputs.push("appEntryDecision");
  if (!postLoginDestination || normalizeString(postLoginDestination.status) !== "ready") missingInputs.push("postLoginDestination");
  if (!appLandingEntry || normalizeString(appLandingEntry.status) !== "ready") missingInputs.push("appLandingEntry");
  return missingInputs;
}

function buildVariantId(kind) {
  return `entry-state:${slugify(kind)}`;
}

export function createEntryStateVariantsAndRedirects({
  appEntryDecision = null,
  postLoginDestination = null,
  appLandingEntry = null,
} = {}) {
  const normalizedEntryDecision = normalizeObject(appEntryDecision);
  const normalizedPostLoginDestination = normalizeObject(postLoginDestination);
  const normalizedAppLandingEntry = normalizeObject(appLandingEntry);
  const missingInputs = buildMissingInputs(normalizedEntryDecision, normalizedPostLoginDestination, normalizedAppLandingEntry);

  if (missingInputs.length > 0) {
    return {
      entryStateVariants: {
        entryStateVariantsId: `entry-state-variants:${slugify(normalizedEntryDecision?.appEntryDecisionId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const destination = normalizeString(normalizedPostLoginDestination.destination) ?? "dashboard";
  const decision = normalizeString(normalizedEntryDecision.decision) ?? "auth-gate";
  const variants = [
    { variantId: buildVariantId("new-user"), kind: "new-user", redirectTo: destination === "first-project-kickoff" ? "/app/new-project" : "/signup" },
    { variantId: buildVariantId("returning-user"), kind: "returning-user", redirectTo: "/app" },
    { variantId: buildVariantId("waitlist-state"), kind: "waitlist-state", redirectTo: "/waitlist" },
    { variantId: buildVariantId("session-expired"), kind: "session-expired", redirectTo: "/login" },
  ];

  return {
    entryStateVariants: {
      entryStateVariantsId: `entry-state-variants:${slugify(normalizedEntryDecision.appEntryDecisionId)}`,
      status: "ready",
      missingInputs: [],
      defaultVariant:
        decision === "waitlist-state"
          ? "waitlist-state"
          : destination === "first-project-kickoff"
            ? "new-user"
            : "returning-user",
      heroTitle: normalizeString(normalizedAppLandingEntry.heroTitle),
      variants,
    },
  };
}
