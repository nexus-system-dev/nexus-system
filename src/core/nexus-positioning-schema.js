function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeString(item)).filter(Boolean))];
}

function normalizeDifferentiation(value) {
  if (Array.isArray(value)) {
    return normalizeStringList(value);
  }

  const normalizedValue = normalizeString(value);
  return normalizedValue ? [normalizedValue] : [];
}

function normalizeCompetitiveContext(competitiveContext) {
  const normalizedCompetitiveContext = normalizeObject(competitiveContext);
  if (!normalizedCompetitiveContext) {
    return null;
  }

  return {
    competitors: normalizeStringList(normalizedCompetitiveContext.competitors),
    alternatives: normalizeStringList(normalizedCompetitiveContext.alternatives),
    differentiation: normalizeDifferentiation(normalizedCompetitiveContext.differentiation),
    strengths: normalizeStringList(normalizedCompetitiveContext.strengths),
    weaknesses: normalizeStringList(normalizedCompetitiveContext.weaknesses),
  };
}

function resolveProductVision(productVision) {
  const normalizedProductVision = normalizeObject(productVision);
  if (normalizedProductVision) {
    return {
      statement: normalizeString(normalizedProductVision.statement),
      problem: normalizeString(normalizedProductVision.problem),
      promise: normalizeString(normalizedProductVision.promise),
      proofPoints: normalizeStringList(normalizedProductVision.proofPoints),
    };
  }

  const normalizedVisionString = normalizeString(productVision);
  return {
    statement: normalizedVisionString,
    problem: normalizedVisionString,
    promise: normalizedVisionString,
    proofPoints: [],
  };
}

function resolveProofPoints(productVision, competitiveContext) {
  if (productVision.proofPoints.length > 0) {
    return productVision.proofPoints;
  }

  return competitiveContext?.strengths ?? [];
}

function buildMissingInputs({ productVision, targetAudience, competitiveContext }) {
  const missingInputs = [];

  if (!productVision.problem && !productVision.statement) {
    missingInputs.push("productVision");
  }
  if (!normalizeString(targetAudience)) {
    missingInputs.push("targetAudience");
  }
  if (!competitiveContext) {
    missingInputs.push("competitiveContext");
  }

  return missingInputs;
}

function createPositioningId(targetAudience, productVision) {
  const audiencePart = normalizeString(targetAudience) ?? "unknown-audience";
  const visionPart = productVision.statement ?? productVision.problem ?? productVision.promise ?? "unknown-vision";
  return `nexus-positioning:${audiencePart}:${visionPart}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function defineNexusPositioningSchema({
  productVision = null,
  targetAudience = null,
  competitiveContext = null,
} = {}) {
  const normalizedProductVision = resolveProductVision(productVision);
  const normalizedCompetitiveContext = normalizeCompetitiveContext(competitiveContext);
  const missingInputs = buildMissingInputs({
    productVision: normalizedProductVision,
    targetAudience,
    competitiveContext: normalizedCompetitiveContext,
  });

  return {
    nexusPositioning: {
      nexusPositioningId: createPositioningId(targetAudience, normalizedProductVision),
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      audience: normalizeString(targetAudience),
      problem: normalizedProductVision.problem ?? normalizedProductVision.statement,
      promise: normalizedProductVision.promise ?? normalizedProductVision.statement,
      differentiation: normalizedCompetitiveContext?.differentiation ?? [],
      proofPoints: resolveProofPoints(normalizedProductVision, normalizedCompetitiveContext),
      competitiveContext: normalizedCompetitiveContext,
    },
  };
}
