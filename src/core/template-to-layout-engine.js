// Task #55 — Create template-to-layout engine
// Converts template contracts and layout templates into a canonical layout structure
// that the runtime can use to assemble regions, hierarchy, and section rhythm stably.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

const VALID_LAYOUT_TYPES = new Set([
  "single-column",
  "two-column",
  "sidebar-main",
  "grid",
  "stacked",
  "wizard-step",
]);

const VALID_SECTION_RHYTHMS = new Set(["compact", "comfortable", "spacious"]);

function resolveLayoutType(templateLayoutKey) {
  const key = typeof templateLayoutKey === "string" ? templateLayoutKey.toLowerCase() : "";
  if (VALID_LAYOUT_TYPES.has(key)) return key;
  if (key.includes("wizard")) return "wizard-step";
  if (key.includes("grid")) return "grid";
  if (key.includes("sidebar")) return "sidebar-main";
  if (key.includes("two") || key.includes("2")) return "two-column";
  if (key.includes("stack")) return "stacked";
  return "single-column";
}

function buildLayoutRegions(templateSections, layoutSystem) {
  const sections = normalizeArray(templateSections);
  const layoutDef = normalizeObject(layoutSystem);
  const regionDefaults = normalizeObject(layoutDef.regionDefaults);

  return sections.map((section, index) => {
    const norm = normalizeObject(section);
    return {
      regionId: norm.sectionId ?? norm.regionId ?? `region-${index + 1}`,
      label: normalizeString(norm.label ?? norm.title, `Region ${index + 1}`),
      slot: norm.slot ?? norm.slotKey ?? `slot-${index + 1}`,
      order: typeof norm.order === "number" ? norm.order : index + 1,
      isOptional: norm.isOptional ?? false,
      maxHeight: norm.maxHeight ?? regionDefaults.maxHeight ?? null,
      grows: norm.grows ?? regionDefaults.grows ?? false,
    };
  });
}

function buildSectionRhythm(layoutSystem, templateMeta) {
  const layout = normalizeObject(layoutSystem);
  const meta = normalizeObject(templateMeta);
  const rhythm = meta.sectionRhythm ?? layout.defaultRhythm ?? "comfortable";
  return VALID_SECTION_RHYTHMS.has(rhythm) ? rhythm : "comfortable";
}

export function createTemplateToLayoutEngine({
  renderableScreenModel = null,
  screenTemplates = null,
  layoutSystem = null,
} = {}) {
  const model = normalizeObject(renderableScreenModel);
  const modelInner = normalizeObject(model.renderableScreenModel ?? model);
  const templates = normalizeObject(screenTemplates);
  const layout = normalizeObject(layoutSystem);

  const templateId = modelInner.template?.templateId ?? templates.templateId ?? null;
  const layoutKey = modelInner.template?.layoutKey ?? templates.layoutKey ?? "default";
  const templateSections = modelInner.template?.sections ?? templates.sections ?? [];

  const layoutType = resolveLayoutType(layoutKey);
  const regions = buildLayoutRegions(templateSections, layout);
  const sectionRhythm = buildSectionRhythm(layout, normalizeObject(templates.meta));

  return {
    layoutCompositionPlan: {
      planId: `layout-plan:${modelInner.modelId ?? modelInner.screenId ?? "unknown"}`,
      screenId: modelInner.screenId ?? null,
      templateId,
      layoutType,
      sectionRhythm,
      regions,
      hierarchy: {
        root: "screen-root",
        slots: regions.map((r) => r.slot),
        depth: regions.length > 0 ? Math.ceil(Math.log2(regions.length + 1)) : 1,
      },
      meta: {
        regionCount: regions.length,
        hasOptionalRegions: regions.some((r) => r.isOptional),
        supportsGrowth: regions.some((r) => r.grows),
      },
    },
  };
}
