function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}
function buildMissingInputs(gtmMetricSchema) {
  const missingInputs = [];
  if (!gtmMetricSchema || normalizeString(gtmMetricSchema.status) !== "ready") missingInputs.push("gtmMetricSchema");
  return missingInputs;
}
export function createAcquisitionSourceTracker({ gtmMetricSchema = null, projectCreationEvent = null, userActivityEvent = null, attributionMetadata = null } = {}) {
  const schema = normalizeObject(gtmMetricSchema);
  const creation = normalizeObject(projectCreationEvent);
  const activity = normalizeObject(userActivityEvent);
  const attribution = normalizeObject(attributionMetadata);
  const missingInputs = buildMissingInputs(schema);
  if (missingInputs.length > 0) {
    return { acquisitionSourceMetrics: { acquisitionSourceMetricsId: `acquisition-source:${slugify(schema?.gtmMetricSchemaId)}`, status: "missing-inputs", missingInputs, entries: [] } };
  }
  const source = normalizeString(attribution?.source) ?? normalizeString(activity?.currentSurface) ?? "direct";
  return {
    acquisitionSourceMetrics: {
      acquisitionSourceMetricsId: `acquisition-source:${slugify(schema.gtmMetricSchemaId)}`,
      status: "ready",
      missingInputs: [],
      entries: [{
        sourceId: `source:${slugify(source)}`,
        source,
        projectCreated: Boolean(creation?.eventId ?? creation?.projectId),
      }],
    },
  };
}
