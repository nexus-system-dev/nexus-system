export const DESIGN_PLUGIN_REGISTRY_TASK_ID = "DESIGN-PLUG-001";
export const BUILT_IN_DESIGN_PLUGINS_TASK_ID = "DESIGN-PLUG-002";
export const USER_DESIGN_PREFERENCE_TASK_ID = "DESIGN-PLUG-003";

export const DESIGN_PLUGIN_REQUIRED_OUTPUT_SCHEMA = Object.freeze({
  styleName: "string",
  whenToUse: "string[]",
  whenNotToUse: "string[]",
  colors: "object",
  typography: "object",
  spacing: "object",
  cardShape: "object",
  buttonShape: "object",
  lightDarkGuidance: "object",
  rtlSupport: "object",
  sampleRegions: "object[]",
  antiClutterRules: "string[]",
  antiGenericDesignRules: "string[]",
  desiredWowLevel: "low|medium|high",
  productTypeFit: "string[]",
  audienceFit: "string[]",
});

const PRODUCT_TRUTH_FIELDS = Object.freeze([
  "productType",
  "primaryUser",
  "primaryProblem",
  "firstWorkflow",
  "initialScreens",
  "initialActions",
  "dataObjects",
  "versionOneBoundary",
  "assumptions",
  "unknowns",
  "handoffToVisualSkeleton",
]);

const DEFAULT_REGISTRY = Object.freeze([
  {
    id: "minimal-saas",
    name: "Minimal SaaS",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["saas", "web app", "ai product", "b2b"],
    productFit: ["software", "dashboard when needed", "simple b2b flow"],
    audienceFit: ["founder", "operator", "team"],
    whenToUse: ["The product is a clean B2B workflow or SaaS surface."],
    whenNotToUse: ["The product needs a local service feel, premium editorial brand, or commerce catalog."],
    preferenceKeywords: ["clean", "simple", "b2b", "saas", "נקי", "פשוט"],
    visualRules: {
      styleName: "Minimal SaaS",
      colors: { background: "#F7F8F5", surface: "#FFFFFF", primary: "#1F5F4A", accent: "#D9E8C7", text: "#1C2420" },
      typography: { heading: "Editorial geometric sans", body: "Readable business sans", density: "calm" },
      spacing: { scale: "8px", rhythm: "open", maxWidth: "wide-but-not-dashboard" },
      cardShape: { radius: "18px", border: "1px solid #DCE4DA", shadow: "soft" },
      buttonShape: { radius: "999px", weight: "medium", intent: "clear primary action" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: false },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["primary workflow card", "focused action strip", "secondary insight panel"],
      antiClutterRules: ["Use one primary action.", "Avoid grid dashboards unless the skeleton explicitly needs metrics."],
      antiGenericDesignRules: ["Do not render a dashboard just because the product is B2B."],
      desiredWowLevel: "medium",
      dashboardDefault: false,
    },
  },
  {
    id: "premium-brand",
    name: "Premium Brand",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["brand", "gift", "beauty", "fashion", "lifestyle"],
    productFit: ["premium", "editorial", "commerce-adjacent", "יוקרתי", "מתנה", "מתנות", "רקמה", "מותג"],
    audienceFit: ["consumer", "boutique owner", "brand buyer", "לקוחה", "קונה", "צרכן"],
    whenToUse: ["The product needs trust, emotion, curation, or a premium purchase feeling."],
    whenNotToUse: ["The product is an operational back-office tool or dense internal workflow."],
    preferenceKeywords: ["premium", "luxury", "brand", "gift", "יוקרתי", "מותג", "מתנה", "רקמה"],
    visualRules: {
      styleName: "Premium Brand",
      colors: { background: "#F3EEE6", surface: "#FFFDF8", primary: "#3B2A21", accent: "#B9825A", text: "#271D18" },
      typography: { heading: "High-contrast editorial serif", body: "Warm refined sans", density: "spacious" },
      spacing: { scale: "10px", rhythm: "editorial", maxWidth: "focused" },
      cardShape: { radius: "24px", border: "1px solid #E7D7C6", shadow: "layered editorial" },
      buttonShape: { radius: "16px", weight: "confident", intent: "premium purchase or inquiry" },
      lightDarkGuidance: { defaultMode: "warm-light", darkAllowed: false },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["hero product story", "curated selection cards", "trust and material detail"],
      antiClutterRules: ["Show fewer choices with stronger hierarchy.", "Avoid dense operations controls."],
      antiGenericDesignRules: ["Do not use SaaS dashboard panels for emotional brand products."],
      desiredWowLevel: "high",
      dashboardDefault: false,
    },
  },
  {
    id: "startup-landing",
    name: "Startup Landing",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["landing page", "startup", "ai product", "acquisition"],
    productFit: ["marketing page", "first demo", "acquisition story"],
    audienceFit: ["visitor", "buyer", "early adopter"],
    whenToUse: ["The product first needs to explain value and drive one public action."],
    whenNotToUse: ["The product is already an internal tool workflow that needs operations clarity."],
    preferenceKeywords: ["landing", "startup", "marketing", "עמוד נחיתה", "סטארטאפ"],
    visualRules: {
      styleName: "Startup Landing",
      colors: { background: "#F6F4EE", surface: "#FFFFFF", primary: "#123C69", accent: "#F0B35E", text: "#18212B" },
      typography: { heading: "Sharp launch-display sans", body: "Readable product sans", density: "story-first" },
      spacing: { scale: "12px", rhythm: "sectioned", maxWidth: "marketing" },
      cardShape: { radius: "22px", border: "1px solid #DEE4EA", shadow: "hero depth" },
      buttonShape: { radius: "14px", weight: "bold", intent: "single conversion action" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: true },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["value hero", "problem proof", "single CTA", "demo preview"],
      antiClutterRules: ["Do not show admin controls as the first impression.", "Keep one conversion path."],
      antiGenericDesignRules: ["Do not make every startup product look like a chat app."],
      desiredWowLevel: "high",
      dashboardDefault: false,
    },
  },
  {
    id: "internal-tool",
    name: "Internal Tool",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["internal tool", "crm", "lead management", "operations", "back office"],
    productFit: ["tasks", "tables", "statuses", "ownership", "workflow"],
    audienceFit: ["operator", "admin", "business owner", "team member"],
    whenToUse: ["The product is a work surface for handling records, tasks, statuses, and ownership."],
    whenNotToUse: ["The product is primarily a public landing page, premium catalog, or consumer mobile app."],
    preferenceKeywords: ["internal", "tool", "crm", "operations", "רציני", "כלי פנימי", "לידים"],
    visualRules: {
      styleName: "Internal Tool",
      colors: { background: "#EEF2EF", surface: "#FFFFFF", primary: "#285146", accent: "#BFD8C7", text: "#17211D" },
      typography: { heading: "Structured operations sans", body: "High-legibility UI sans", density: "productive" },
      spacing: { scale: "8px", rhythm: "compact-but-calm", maxWidth: "workspace" },
      cardShape: { radius: "14px", border: "1px solid #D4DDD8", shadow: "low" },
      buttonShape: { radius: "12px", weight: "medium", intent: "workflow action" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: false },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["work queue", "today follow-up zone", "record detail card", "status action rail"],
      antiClutterRules: ["Show operational meaning before raw files or charts.", "Use tables only when records truly need scanning."],
      antiGenericDesignRules: ["Do not default to analytics dashboard; default to the first workflow."],
      desiredWowLevel: "medium",
      dashboardDefault: false,
    },
  },
  {
    id: "israeli-smb",
    name: "Israeli SMB",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["local business", "service business", "lead management", "internal tool"],
    productFit: ["hebrew", "rtl", "whatsapp", "phone", "service workflow", "small business", "עברית", "וואטסאפ", "שיחות", "לידים"],
    audienceFit: ["small business owner", "service operator", "local team", "בעל עסק קטן", "עסק קטן"],
    whenToUse: ["The product serves a Hebrew or Israeli small-business workflow with phone, WhatsApp, service, or leads."],
    whenNotToUse: ["The product needs an international enterprise SaaS or luxury editorial tone."],
    preferenceKeywords: ["israeli", "hebrew", "rtl", "whatsapp", "ישראלי", "עברית", "וואטסאפ", "עסק קטן"],
    visualRules: {
      styleName: "Israeli SMB",
      colors: { background: "#F6F1E8", surface: "#FFFDF8", primary: "#17634E", accent: "#F2C36B", text: "#20231F" },
      typography: { heading: "Friendly Hebrew UI sans", body: "Clear Hebrew service sans", density: "human" },
      spacing: { scale: "8px", rhythm: "service-workflow", maxWidth: "business-owner" },
      cardShape: { radius: "20px", border: "1px solid #E3D8C7", shadow: "warm practical" },
      buttonShape: { radius: "16px", weight: "clear", intent: "phone or follow-up action" },
      lightDarkGuidance: { defaultMode: "warm-light", darkAllowed: false },
      rtlSupport: { supported: true, directionAwareSpacing: true, hebrewFirst: true },
      sampleRegions: ["לחזור היום", "לידים חדשים", "אחראי וצעד הבא", "כרטיס פעולה מהיר"],
      antiClutterRules: ["Keep the owner action obvious.", "Avoid enterprise dashboards and English-first labels."],
      antiGenericDesignRules: ["Use Hebrew service context instead of generic CRM chrome."],
      desiredWowLevel: "medium",
      dashboardDefault: false,
    },
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["ecommerce", "shop", "catalog", "checkout", "inventory"],
    productFit: ["products", "cart", "checkout", "inventory", "catalog"],
    audienceFit: ["shopper", "merchant", "store operator"],
    whenToUse: ["The product revolves around products, catalog browsing, cart, checkout, or inventory."],
    whenNotToUse: ["The product is a service CRM or internal task workflow without a catalog."],
    preferenceKeywords: ["shop", "store", "catalog", "ecommerce", "חנות", "קטלוג"],
    visualRules: {
      styleName: "Ecommerce",
      colors: { background: "#FAF7F0", surface: "#FFFFFF", primary: "#262A35", accent: "#E07A5F", text: "#1E2026" },
      typography: { heading: "Retail editorial sans", body: "Commerce UI sans", density: "browseable" },
      spacing: { scale: "10px", rhythm: "catalog", maxWidth: "storefront" },
      cardShape: { radius: "18px", border: "1px solid #E9E1D6", shadow: "product-card" },
      buttonShape: { radius: "12px", weight: "bold", intent: "buy or add item" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: false },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["product grid", "featured item", "cart summary", "inventory signal"],
      antiClutterRules: ["Show product value before admin inventory controls."],
      antiGenericDesignRules: ["Do not use CRM queues for catalog-first products."],
      desiredWowLevel: "high",
      dashboardDefault: false,
    },
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["mobile app", "consumer app", "tabs", "onboarding"],
    productFit: ["mobile flow", "fast actions", "tabs", "onboarding"],
    audienceFit: ["mobile user", "consumer", "field operator"],
    whenToUse: ["The product is primarily used as a mobile flow with fast repeated actions."],
    whenNotToUse: ["The product is desktop-first operations or a public landing page."],
    preferenceKeywords: ["mobile", "app", "tabs", "אפליקציה", "מובייל"],
    visualRules: {
      styleName: "Mobile App",
      colors: { background: "#F2F5F8", surface: "#FFFFFF", primary: "#26547C", accent: "#60C2A4", text: "#14213D" },
      typography: { heading: "Rounded mobile display sans", body: "Touch UI sans", density: "tap-friendly" },
      spacing: { scale: "8px", rhythm: "touch", maxWidth: "mobile-frame" },
      cardShape: { radius: "26px", border: "1px solid #DDE7EE", shadow: "floating mobile" },
      buttonShape: { radius: "999px", weight: "bold", intent: "thumb-first action" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: true },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["top status", "tabbed action zone", "quick card", "empty onboarding state"],
      antiClutterRules: ["Do not render desktop tables on mobile-first products."],
      antiGenericDesignRules: ["Use touch affordances, not web dashboard chrome."],
      desiredWowLevel: "medium",
      dashboardDefault: false,
    },
  },
  {
    id: "logistics-map",
    name: "Logistics Map",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["logistics", "delivery", "routing", "map"],
    productFit: ["drivers", "locations", "routes", "deliveries", "statuses"],
    audienceFit: ["dispatcher", "driver", "operations manager"],
    whenToUse: ["The product centers on locations, routes, delivery states, or dispatch decisions."],
    whenNotToUse: ["The product does not need spatial awareness or route/state orchestration."],
    preferenceKeywords: ["map", "delivery", "driver", "route", "מפה", "משלוחים", "נהגים"],
    visualRules: {
      styleName: "Logistics Map",
      colors: { background: "#EEF3F1", surface: "#FFFFFF", primary: "#1D4E5F", accent: "#F6A04D", text: "#182A2D" },
      typography: { heading: "Technical operations sans", body: "Dense readable sans", density: "command-center" },
      spacing: { scale: "8px", rhythm: "map-and-status", maxWidth: "full-workspace" },
      cardShape: { radius: "12px", border: "1px solid #CFDCDC", shadow: "map overlay" },
      buttonShape: { radius: "10px", weight: "medium", intent: "dispatch decision" },
      lightDarkGuidance: { defaultMode: "light", darkAllowed: true },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["map canvas", "route status cards", "driver queue", "exception banner"],
      antiClutterRules: ["Separate map state from operational decisions."],
      antiGenericDesignRules: ["Do not replace location truth with generic KPI cards."],
      desiredWowLevel: "high",
      dashboardDefault: false,
    },
  },
  {
    id: "ai-product",
    name: "AI Product",
    status: "active",
    releaseScope: "v1",
    source: "internal-nexus-design-system",
    supportedProductTypes: ["ai", "copilot", "agent", "assistant"],
    productFit: ["ai workflow", "agent action", "explainable automation"],
    audienceFit: ["operator", "knowledge worker", "creator"],
    whenToUse: ["The product uses AI as a workflow layer but must not collapse into generic chat UI."],
    whenNotToUse: ["The product has no AI action or agentic workflow."],
    preferenceKeywords: ["ai", "agent", "copilot", "assistant", "בינה", "סוכן"],
    visualRules: {
      styleName: "AI Product",
      colors: { background: "#F4F2FA", surface: "#FFFFFF", primary: "#443C68", accent: "#8FD6C8", text: "#201B2F" },
      typography: { heading: "Precise future-facing sans", body: "Explainable product sans", density: "guided" },
      spacing: { scale: "10px", rhythm: "agentic", maxWidth: "guided-workflow" },
      cardShape: { radius: "20px", border: "1px solid #DFD9EE", shadow: "subtle glow" },
      buttonShape: { radius: "14px", weight: "medium", intent: "agent action with explanation" },
      lightDarkGuidance: { defaultMode: "soft-light", darkAllowed: true },
      rtlSupport: { supported: true, directionAwareSpacing: true },
      sampleRegions: ["agent recommendation", "human approval", "workflow result", "evidence panel"],
      antiClutterRules: ["Show what the agent did and what needs approval.", "Do not make generic chat the whole product."],
      antiGenericDesignRules: ["AI is a workflow capability, not just a chat bubble."],
      desiredWowLevel: "high",
      dashboardDefault: false,
    },
  },
]);

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function includesAny(haystack, values = []) {
  const normalized = normalizeText(haystack);
  return values.some((value) => normalized.includes(normalizeText(value)));
}

function detectPreferredPluginIdFromPreference(designPreferenceText, registry = DEFAULT_REGISTRY) {
  const matches = registry
    .map((plugin) => ({
      plugin,
      score: includesAny(designPreferenceText, plugin.preferenceKeywords) ? plugin.preferenceKeywords.filter((keyword) => normalizeText(designPreferenceText).includes(normalizeText(keyword))).length : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.plugin.id.localeCompare(b.plugin.id));
  return matches[0]?.plugin?.id || "";
}

export function normalizeUserDesignSourceInput({
  stylePreference = "",
  inspirationReference = "",
  figmaConnection = null,
  brandKit = null,
  existingDesignSystem = "",
  explicitPluginId = "",
  registry = DEFAULT_REGISTRY,
} = {}) {
  const text = [stylePreference, inspirationReference, existingDesignSystem].filter(Boolean).join(" ");
  const inferredPluginId = explicitPluginId || detectPreferredPluginIdFromPreference(text, registry);
  const hasFigmaInput = Boolean(figmaConnection?.fileKey || figmaConnection?.url || figmaConnection?.name);
  const hasBrandKit = Boolean(brandKit?.name || brandKit?.colors || brandKit?.fonts || brandKit?.logo);
  const hasDesignInput = Boolean(text || inferredPluginId || hasFigmaInput || hasBrandKit);

  return {
    taskId: USER_DESIGN_PREFERENCE_TASK_ID,
    status: hasDesignInput ? "design-source-present" : "no-user-design-source",
    v1Mode: "lightweight-before-first-skeleton",
    stylePreference,
    inspirationReference,
    existingDesignSystem,
    preferredPluginId: inferredPluginId,
    figma: hasFigmaInput
      ? {
          status: "bounded-design-source",
          requiredForFirstSkeleton: false,
          fileKey: figmaConnection?.fileKey || "",
          name: figmaConnection?.name || "",
          mayProvideVisualDirection: true,
          mayProvideProductTruth: false,
        }
      : {
          status: "not-provided",
          requiredForFirstSkeleton: false,
          mayProvideProductTruth: false,
        },
    brandKit: hasBrandKit
      ? {
          status: "bounded-design-source",
          name: brandKit?.name || "",
          hasColors: Boolean(brandKit?.colors),
          hasFonts: Boolean(brandKit?.fonts),
          hasLogo: Boolean(brandKit?.logo),
          mayProvideVisualDirection: true,
          mayProvideProductTruth: false,
        }
      : {
          status: "not-provided",
          mayProvideProductTruth: false,
        },
    truthBoundary: {
      sourceType: "design-source-only",
      canInfluenceLookAndFeel: true,
      canSelectOrOverridePlugin: Boolean(inferredPluginId),
      canMutateProductSkeleton: false,
      canReplaceProductGraph: false,
      canCreateProductScope: false,
    },
  };
}

function cloneProductTruth(input = {}) {
  return PRODUCT_TRUTH_FIELDS.reduce((truth, field) => {
    if (input[field] !== undefined) {
      truth[field] = structuredClone(input[field]);
    }
    return truth;
  }, {});
}

function buildProductSignal(productSkeletonAgentOutput = {}) {
  const workflow = productSkeletonAgentOutput.firstWorkflow || {};
  const screens = Array.isArray(productSkeletonAgentOutput.initialScreens)
    ? productSkeletonAgentOutput.initialScreens.map((screen) => `${screen.name || ""} ${screen.purpose || ""}`).join(" ")
    : "";
  const actions = Array.isArray(productSkeletonAgentOutput.initialActions)
    ? productSkeletonAgentOutput.initialActions.join(" ")
    : "";
  return [
    productSkeletonAgentOutput.productType,
    productSkeletonAgentOutput.primaryUser,
    productSkeletonAgentOutput.primaryProblem,
    workflow.title,
    workflow.whyThisFirst,
    screens,
    actions,
  ].join(" ");
}

function scorePlugin(plugin, productSignal, userDesignPreference) {
  let score = 0;
  if (includesAny(productSignal, plugin.supportedProductTypes)) score += 4;
  if (includesAny(productSignal, plugin.productFit)) score += 3;
  if (includesAny(productSignal, plugin.audienceFit)) score += 2;
  if (includesAny(userDesignPreference, plugin.preferenceKeywords)) score += 20;
  return score;
}

function findPluginById(registry, pluginId) {
  return registry.find((plugin) => plugin.id === pluginId);
}

function toRegistryPluginContract(plugin) {
  return {
    id: plugin.id,
    name: plugin.name,
    status: plugin.status,
    releaseScope: plugin.releaseScope,
    source: plugin.source,
    supportedProductTypes: [...plugin.supportedProductTypes],
    productFit: [...plugin.productFit],
    audienceFit: [...plugin.audienceFit],
    whenToUse: [...plugin.whenToUse],
    whenNotToUse: [...plugin.whenNotToUse],
    requiredOutputSchema: { ...DESIGN_PLUGIN_REQUIRED_OUTPUT_SCHEMA },
    visualRules: structuredClone(plugin.visualRules),
  };
}

export function getBuiltInDesignPluginDefinitions(registry = DEFAULT_REGISTRY) {
  const requiredV1PluginIds = [
    "minimal-saas",
    "premium-brand",
    "startup-landing",
    "mobile-app",
    "internal-tool",
    "ecommerce",
    "israeli-smb",
    "logistics-map",
    "ai-product",
  ];
  const orderedPlugins = requiredV1PluginIds
    .map((pluginId) => findPluginById(registry, pluginId))
    .filter(Boolean);
  return {
    taskId: BUILT_IN_DESIGN_PLUGINS_TASK_ID,
    sourceRegistryTaskId: DESIGN_PLUGIN_REGISTRY_TASK_ID,
    requiredV1PluginIds,
    plugins: orderedPlugins.map(toRegistryPluginContract),
    fallbackPolicy: {
      fallbackPluginId: "minimal-saas",
      dashboardIsDefault: false,
      reason: "Fallback must provide a clean first workflow surface, not a generic dashboard.",
    },
  };
}

export function createDesignPluginRegistryContract(registry = DEFAULT_REGISTRY) {
  return {
    taskId: DESIGN_PLUGIN_REGISTRY_TASK_ID,
    registryMode: "internal-v1-not-marketplace",
    truthBoundary: {
      affects: "visual-language-only",
      mayReadProductTruth: true,
      mayMutateProductTruth: false,
      productTruthOwner: "product-graph-and-product-skeleton-agent",
    },
    requiredPluginFields: [
      "id",
      "name",
      "whenToUse",
      "whenNotToUse",
      "supportedProductTypes",
      "productFit",
      "audienceFit",
      "source",
      "status",
      "releaseScope",
    ],
    requiredPluginOutputSchema: { ...DESIGN_PLUGIN_REQUIRED_OUTPUT_SCHEMA },
    plugins: registry.map(toRegistryPluginContract),
    prohibitions: [
      "no-marketplace-in-v1",
      "no-product-scope-invention",
      "no-product-graph-replacement",
      "no-hardcoded-visual-skeleton-style",
    ],
  };
}

export function resolveDesignPluginForVisualSkeletonRequest({
  productSkeletonAgentOutput,
  explicitPluginId = "",
  userDesignPreference = "",
  designSourceInput = null,
  registry = DEFAULT_REGISTRY,
} = {}) {
  const hasExplicitPluginId = Boolean(explicitPluginId);
  const designSource = normalizeUserDesignSourceInput({
    ...(designSourceInput || {}),
    stylePreference: designSourceInput?.stylePreference ?? userDesignPreference,
    explicitPluginId,
    registry,
  });
  const productTruthSnapshot = cloneProductTruth(productSkeletonAgentOutput || {});
  const productSignal = buildProductSignal(productSkeletonAgentOutput || {});
  const contractRegistry = registry.map(toRegistryPluginContract);
  const explicitPlugin = designSource.preferredPluginId ? findPluginById(registry, designSource.preferredPluginId) : null;
  const scored = registry
    .map((plugin) => ({
      plugin,
      score: scorePlugin(plugin, productSignal, userDesignPreference || designSource.stylePreference),
    }))
    .sort((a, b) => b.score - a.score || a.plugin.id.localeCompare(b.plugin.id));
  const bestScoredPlugin = scored[0]?.score > 0 ? scored[0].plugin : null;
  const selected = explicitPlugin || bestScoredPlugin || findPluginById(registry, "minimal-saas") || DEFAULT_REGISTRY[0];
  const matchedBy = explicitPlugin ? "explicit-plugin-id" : bestScoredPlugin ? "product-or-preference-fit" : "bounded-default";

  return {
    taskId: DESIGN_PLUGIN_REGISTRY_TASK_ID,
    registryMode: "internal-v1-not-marketplace",
    selection: {
      pluginId: selected.id,
      pluginName: selected.name,
      matchedBy: explicitPlugin && hasExplicitPluginId ? "explicit-plugin-id" : explicitPlugin && designSource.status === "design-source-present" ? "user-design-source" : matchedBy,
      reason: explicitPlugin
        ? "העדפת העיצוב של המשתמש או מקור עיצוב מוגדר בחרו כיוון חזותי."
        : "נבחרה שפת עיצוב לפי סוג המוצר, הקהל והעדפת המשתמש אם קיימת.",
    },
    designSource,
    plugin: toRegistryPluginContract(selected),
    registry: contractRegistry,
    productTruthBoundary: {
      canReadProductSkeleton: true,
      canMutateProductSkeleton: false,
      canReplaceProductGraph: false,
      designAffects: "look-and-feel-only",
    },
    productTruthSnapshot,
    handoffToVisualProductSkeletonAgent: {
      allowed: Boolean(productSkeletonAgentOutput),
      carriesSelectedDesignPlugin: true,
      requiresVisualAgentRealityGate: true,
    },
  };
}

export function assertDesignPluginSelectionPreservesProductTruth(selectionEnvelope, productSkeletonAgentOutput) {
  const expected = cloneProductTruth(productSkeletonAgentOutput || {});
  const actual = selectionEnvelope?.productTruthSnapshot || {};
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  return {
    ok: expectedJson === actualJson && selectionEnvelope?.productTruthBoundary?.canMutateProductSkeleton === false,
    expected,
    actual,
    boundary: selectionEnvelope?.productTruthBoundary,
  };
}
