function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(messagingFramework, objectionMap) {
  const missingInputs = [];
  if (!messagingFramework || normalizeString(messagingFramework.status) !== "ready") {
    missingInputs.push("messagingFramework");
  }
  if (!objectionMap || normalizeString(objectionMap.status) !== "ready") {
    missingInputs.push("objectionMap");
  }
  return missingInputs;
}

export function createTrustProofBlockBuilder({
  messagingFramework = null,
  objectionMap = null,
  landingPageIa = null,
} = {}) {
  const normalizedFramework = normalizeObject(messagingFramework);
  const normalizedObjectionMap = normalizeObject(objectionMap);
  const normalizedIa = normalizeObject(landingPageIa);
  const missingInputs = buildMissingInputs(normalizedFramework, normalizedObjectionMap);

  if (missingInputs.length > 0) {
    return {
      trustProofBlocks: {
        trustProofBlocksId: `trust-proof:${slugify(normalizedFramework?.messagingFrameworkId)}`,
        status: "missing-inputs",
        missingInputs,
        blocks: [],
      },
    };
  }

  return {
    trustProofBlocks: {
      trustProofBlocksId: `trust-proof:${slugify(normalizedFramework.messagingFrameworkId)}`,
      status: "ready",
      missingInputs: [],
      blocks: [
        {
          blockId: "proof:governance",
          title: "Governed execution",
          body: normalizeString(normalizedFramework.valueProps?.[0]?.label) ?? normalizeString(normalizedFramework.headline),
        },
        {
          blockId: "proof:adoption-risk",
          title: "Adoption risk handled",
          body: normalizeString(normalizedObjectionMap.entries?.[0]?.response) ?? "Start with scoped work instead of a full migration.",
        },
        {
          blockId: "proof:placement",
          title: "Built into the landing flow",
          body: normalizedIa?.sections?.some((section) => section.sectionId === "section:proof")
            ? "The landing architecture reserves a dedicated proof section."
            : "Proof content is available for the landing experience.",
        },
      ],
    },
  };
}
