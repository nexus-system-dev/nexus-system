function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStringList(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((entry) => normalizeString(entry)).filter(Boolean))]
    : [];
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(messagingFramework) {
  const missingInputs = [];

  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }

  return missingInputs;
}

function buildAudienceConcern(audience, constraints, tone) {
  if (audience && constraints.length > 0) {
    return `${audience} worry that ${constraints[0].replace(/:/g, " ")} will slow adoption`;
  }

  if (audience && tone) {
    return `${audience} question whether the product voice matches operational reality`;
  }

  if (audience) {
    return `${audience} need proof that the workflow fits their day-to-day execution`;
  }

  return null;
}

function buildTrustConcern(gtmStage, strengths, proofPoints) {
  if (gtmStage === "pre-launch") {
    return "Teams need evidence that Nexus is credible before rolling it into production";
  }

  if (strengths.length > 0) {
    return `Teams ask whether "${strengths[0]}" is backed by repeatable delivery proof`;
  }

  if (proofPoints.length > 0) {
    return `Visitors ask how "${proofPoints[0]}" shows up in day-to-day usage`;
  }

  return "Visitors ask how the product proves trust before they commit";
}

function createObjectionMap({
  messagingFramework,
  businessContext,
  projectIdentity,
  manualContext,
}) {
  const normalizedBusinessContext = normalizeObject(businessContext);
  const normalizedProjectIdentity = normalizeObject(projectIdentity);
  const normalizedManualContext = normalizeObject(manualContext);
  const proofPoints = normalizeStringList(messagingFramework?.valueProps?.map((entry) => entry?.label));
  const strengths = normalizeStringList(normalizedManualContext?.competitiveContext?.strengths);
  const constraints = normalizeStringList(normalizedBusinessContext?.constraints);
  const audience = normalizeString(normalizedProjectIdentity?.audience)
    ?? normalizeString(normalizedBusinessContext?.targetAudience)
    ?? normalizeString(messagingFramework?.audience);
  const tone = normalizeString(normalizedProjectIdentity?.tone);
  const gtmStage = normalizeString(normalizedBusinessContext?.gtmStage) ?? "pre-launch";
  const baseObjections = Array.isArray(messagingFramework?.objections) ? messagingFramework.objections : [];
  const derivedConcerns = [
    buildAudienceConcern(audience, constraints, tone),
    buildTrustConcern(gtmStage, strengths, proofPoints),
  ].filter(Boolean);

  const seen = new Set();
  const entries = [];

  for (const entry of baseObjections) {
    const concern = normalizeString(entry?.concern);
    if (!concern || seen.has(concern)) {
      continue;
    }

    seen.add(concern);
    entries.push({
      objectionId: normalizeString(entry?.objectionId) ?? `objection:${slugify(concern)}`,
      concern,
      response: normalizeString(entry?.response) ?? normalizeString(messagingFramework?.headline),
      source: "messagingFramework",
    });
  }

  for (const concern of derivedConcerns) {
    if (seen.has(concern)) {
      continue;
    }

    seen.add(concern);
    entries.push({
      objectionId: `objection:${slugify(concern)}`,
      concern,
      response: normalizeString(messagingFramework?.headline) ?? normalizeString(messagingFramework?.subheadline),
      source: "projectSignals",
    });
  }

  return {
    objectionMapId: `objection-map:${slugify(messagingFramework?.messagingFrameworkId)}`,
    status: "ready",
    entries,
  };
}

function createFaqMap({
  messagingFramework,
  businessContext,
  projectIdentity,
  manualContext,
}) {
  const normalizedBusinessContext = normalizeObject(businessContext);
  const normalizedProjectIdentity = normalizeObject(projectIdentity);
  const normalizedManualContext = normalizeObject(manualContext);
  const valueProps = Array.isArray(messagingFramework?.valueProps) ? messagingFramework.valueProps : [];
  const ctaAngles = Array.isArray(messagingFramework?.ctaAngles) ? messagingFramework.ctaAngles : [];
  const audience = normalizeString(normalizedProjectIdentity?.audience)
    ?? normalizeString(normalizedBusinessContext?.targetAudience)
    ?? normalizeString(messagingFramework?.audience)
    ?? "teams";
  const constraints = normalizeStringList(normalizedBusinessContext?.constraints);
  const proofPoint = normalizeString(valueProps[0]?.label) ?? normalizeString(messagingFramework?.headline);
  const ctaReason = normalizeString(ctaAngles[0]?.reason) ?? normalizeString(messagingFramework?.subheadline);
  const trustSignal = normalizeString(normalizedManualContext?.competitiveContext?.strengths?.[0]) ?? proofPoint;

  const entries = [
    {
      faqId: "faq:who-is-nexus-for",
      question: "Who is Nexus for?",
      answer: `Nexus is positioned for ${audience} who need a governed path from planning into execution.`,
    },
    {
      faqId: "faq:why-trust-nexus",
      question: "Why should teams trust Nexus?",
      answer: `Nexus leads with ${trustSignal} and turns it into a repeatable execution flow instead of ad-hoc coordination.`,
    },
    {
      faqId: "faq:what-happens-after-signup",
      question: "What happens after signup?",
      answer: ctaReason
        ? `${ctaReason}. The next step routes users into onboarding and the first scoped project path.`
        : "Users move into onboarding and the first scoped project path.",
    },
  ];

  if (constraints.length > 0) {
    entries.push({
      faqId: "faq:how-does-nexus-handle-constraints",
      question: "How does Nexus handle constraints?",
      answer: `Nexus makes constraints explicit in the operating flow, starting with ${constraints[0].replace(/:/g, " ")} and preserving them in project state.`,
    });
  }

  return {
    faqMapId: `faq-map:${slugify(messagingFramework?.messagingFrameworkId)}`,
    status: "ready",
    entries,
  };
}

export function createObjectionAndFaqMap({
  messagingFramework = null,
  businessContext = null,
  projectIdentity = null,
  manualContext = null,
} = {}) {
  const normalizedMessagingFramework = normalizeObject(messagingFramework);
  const missingInputs = buildMissingInputs(normalizedMessagingFramework);

  if (missingInputs.length > 0) {
    return {
      objectionMap: {
        objectionMapId: `objection-map:${slugify(normalizedMessagingFramework?.messagingFrameworkId)}`,
        status: "missing-inputs",
        missingInputs,
        entries: [],
      },
      faqMap: {
        faqMapId: `faq-map:${slugify(normalizedMessagingFramework?.messagingFrameworkId)}`,
        status: "missing-inputs",
        missingInputs,
        entries: [],
      },
    };
  }

  return {
    objectionMap: createObjectionMap({
      messagingFramework: normalizedMessagingFramework,
      businessContext,
      projectIdentity,
      manualContext,
    }),
    faqMap: createFaqMap({
      messagingFramework: normalizedMessagingFramework,
      businessContext,
      projectIdentity,
      manualContext,
    }),
  };
}
