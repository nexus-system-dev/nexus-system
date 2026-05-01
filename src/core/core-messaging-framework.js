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

function buildMessagingFrameworkId(positioning) {
  const positioningId = normalizeString(positioning?.nexusPositioningId) ?? "unknown-positioning";
  return `messaging-framework:${positioningId}`;
}

function buildMissingInputs(positioning) {
  const missingInputs = [];

  if (!positioning || normalizeString(positioning.status) !== "ready") {
    missingInputs.push("nexusPositioning");
  }

  return missingInputs;
}

function buildValueProps(positioning) {
  const props = [];
  const differentiation = normalizeStringList(positioning?.differentiation);
  const proofPoints = normalizeStringList(positioning?.proofPoints);

  for (const item of differentiation) {
    props.push({
      valuePropId: `value-prop:${item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown"}`,
      label: item,
      source: "differentiation",
    });
  }

  for (const item of proofPoints) {
    if (props.some((prop) => prop.label === item)) {
      continue;
    }

    props.push({
      valuePropId: `value-prop:${item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown"}`,
      label: item,
      source: "proof-point",
    });
  }

  return props;
}

function buildObjections(positioning) {
  const weaknesses = normalizeStringList(positioning?.competitiveContext?.weaknesses);

  return weaknesses.map((weakness) => ({
    objectionId: `objection:${weakness.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown"}`,
    concern: weakness,
    response: normalizeString(positioning?.promise),
  }));
}

function buildCtaAngles(positioning) {
  const promise = normalizeString(positioning?.promise);
  const problem = normalizeString(positioning?.problem);
  const proofPoints = normalizeStringList(positioning?.proofPoints);

  return [
    {
      ctaAngleId: "cta-angle:start-execution",
      label: "Start with a scoped project",
      reason: promise ?? problem,
    },
    {
      ctaAngleId: "cta-angle-see-proof",
      label: "See governed execution proof",
      reason: proofPoints[0] ?? promise,
    },
  ].filter((angle) => normalizeString(angle.reason));
}

export function createCoreMessagingFramework({ nexusPositioning = null } = {}) {
  const normalizedPositioning = normalizeObject(nexusPositioning);
  const missingInputs = buildMissingInputs(normalizedPositioning);

  return {
    messagingFramework: {
      messagingFrameworkId: buildMessagingFrameworkId(normalizedPositioning),
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      audience: normalizeString(normalizedPositioning?.audience),
      headline: normalizeString(normalizedPositioning?.promise),
      subheadline: normalizeString(normalizedPositioning?.problem),
      valueProps: missingInputs.length === 0 ? buildValueProps(normalizedPositioning) : [],
      objections: missingInputs.length === 0 ? buildObjections(normalizedPositioning) : [],
      ctaAngles: missingInputs.length === 0 ? buildCtaAngles(normalizedPositioning) : [],
    },
  };
}
