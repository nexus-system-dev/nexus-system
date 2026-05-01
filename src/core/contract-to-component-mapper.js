// Task #56 — Create contract-to-component mapper
// Maps regions and component intents from the screen contract to approved components
// only from the component libraries and canonical component contract.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

// Approved component types from the canonical component contract
const APPROVED_COMPONENT_TYPES = new Set([
  "panel",
  "button",
  "input",
  "textarea",
  "select",
  "modal",
  "badge",
  "icon-button",
  "list",
  "table",
  "card",
  "header",
  "footer",
  "nav",
  "form",
  "alert",
  "tooltip",
  "progress",
  "avatar",
]);

function resolveApprovedComponentType(intent, componentLibraries) {
  const intentStr = typeof intent === "string" ? intent.toLowerCase() : "";
  const libraries = normalizeArray(componentLibraries);

  // Check direct match in approved types
  if (APPROVED_COMPONENT_TYPES.has(intentStr)) return intentStr;

  // Check component libraries for a mapping
  for (const lib of libraries) {
    const norm = normalizeObject(lib);
    const mapping = normalizeObject(norm.intentMapping);
    if (mapping[intentStr]) return mapping[intentStr];
    const components = normalizeObject(norm.components);
    if (components[intentStr]) return intentStr;
  }

  // Fallback to panel for unmapped intents (safe default)
  return "panel";
}

function buildComponentMapping(componentBoundaries, componentLibraries, componentContract) {
  const boundaries = normalizeArray(componentBoundaries);
  const contract = normalizeObject(componentContract);
  const allowedOverrides = normalizeObject(contract.allowedOverrides);

  return boundaries.map((boundary) => {
    const norm = normalizeObject(boundary);
    const intent = norm.componentType ?? norm.intent ?? "panel";
    const resolved = resolveApprovedComponentType(intent, componentLibraries);
    const override = allowedOverrides[norm.regionId] ?? null;

    return {
      regionId: norm.regionId ?? null,
      componentIntent: intent,
      resolvedComponent: override ?? resolved,
      isOverridden: override !== null,
      slotKey: norm.slotKey ?? null,
      isApproved: APPROVED_COMPONENT_TYPES.has(override ?? resolved),
      constraints: normalizeObject(norm.constraints),
    };
  });
}

export function createContractToComponentMapper({
  renderableScreenModel = null,
  componentLibraries = null,
  componentContract = null,
} = {}) {
  const model = normalizeObject(renderableScreenModel);
  const modelInner = normalizeObject(model.renderableScreenModel ?? model);
  const boundaries = modelInner.componentBoundaries ?? [];
  const libraries = normalizeArray(componentLibraries);
  const contract = normalizeObject(componentContract);

  const mapping = buildComponentMapping(boundaries, libraries, contract);
  const unapproved = mapping.filter((m) => !m.isApproved);

  return {
    screenComponentMapping: {
      mappingId: `component-map:${modelInner.modelId ?? modelInner.screenId ?? "unknown"}`,
      screenId: modelInner.screenId ?? null,
      mappings: mapping,
      summary: {
        totalRegions: mapping.length,
        approvedRegions: mapping.filter((m) => m.isApproved).length,
        overriddenRegions: mapping.filter((m) => m.isOverridden).length,
        unapprovedRegions: unapproved.length,
      },
      unapprovedRegions: unapproved.map((m) => ({
        regionId: m.regionId,
        componentIntent: m.componentIntent,
        resolvedComponent: m.resolvedComponent,
      })),
      isFullyApproved: unapproved.length === 0,
    },
  };
}
