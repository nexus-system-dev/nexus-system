function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerDailyWorkflow, ownerControlCenter) {
  const missingInputs = [];
  if (!ownerDailyWorkflow || normalizeString(ownerDailyWorkflow.status) !== "ready") missingInputs.push("ownerDailyWorkflow");
  if (!ownerControlCenter || normalizeString(ownerControlCenter.status) !== "ready") missingInputs.push("ownerControlCenter");
  return missingInputs;
}

export function createFocusAreaSelector({
  ownerDailyWorkflow = null,
  ownerControlCenter = null,
} = {}) {
  const workflow = normalizeObject(ownerDailyWorkflow);
  const center = normalizeObject(ownerControlCenter);
  const missingInputs = buildMissingInputs(workflow, center);

  if (missingInputs.length > 0) {
    return { ownerFocusArea: { ownerFocusAreaId: `owner-focus:${slugify(workflow?.ownerDailyWorkflowId)}`, status: "missing-inputs", missingInputs } };
  }

  const area = normalizeString(workflow.focusTheme) ?? (normalizeString(center.healthStatus) === "stable" ? "growth" : "reliability");
  return {
    ownerFocusArea: {
      ownerFocusAreaId: `owner-focus:${slugify(workflow.ownerDailyWorkflowId)}`,
      status: "ready",
      missingInputs: [],
      area,
    },
  };
}
