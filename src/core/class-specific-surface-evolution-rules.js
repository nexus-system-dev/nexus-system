import { normalizeCanonicalProductClass, resolveCanonicalProductClassProfile } from "../../web/shared/product-class-model.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const EVOLUTION_RULES = {
  "landing-page": {
    evolutionFamily: "section-evolution",
    frontendSurfaceType: "marketing-page",
    backendStateType: "conversion-state",
    sceneType: "section-sequence",
    visibleEvolutionRule: "sections-must-clarify-promise-trust-and-cta-in-order",
    requiredVisibleChanges: ["headline evolves", "trust proof appears", "single CTA stays primary"],
    backendCoupling: ["conversion logic must update CTA surface", "proof state must remain visible on the page"],
    restoreIdentity: ["headline identity survives restore", "section order survives restore"],
  },
  "mobile-app": {
    evolutionFamily: "screen-evolution",
    frontendSurfaceType: "mobile-simulator",
    backendStateType: "flow-state",
    sceneType: "screen-sequence",
    visibleEvolutionRule: "screen and navigation must evolve with the first action",
    requiredVisibleChanges: ["first screen evolves", "primary action becomes clearer", "navigation direction remains visible"],
    backendCoupling: ["action state must mutate the visible screen", "flow state must stay connected to navigation shell"],
    restoreIdentity: ["active screen survives restore", "next-step continuity survives restore"],
  },
  "internal-tool": {
    evolutionFamily: "workspace-evolution",
    frontendSurfaceType: "operations-workspace",
    backendStateType: "queue-state",
    sceneType: "queue-workspace",
    visibleEvolutionRule: "queue ownership and next action must evolve inside the same workspace",
    requiredVisibleChanges: ["queue surface evolves", "ownership becomes explicit", "next action remains actionable"],
    backendCoupling: ["queue state must mutate visible panels", "assignment state must stay coupled to action panel"],
    restoreIdentity: ["queue identity survives restore", "workspace action state survives restore"],
  },
  "commerce-ops": {
    evolutionFamily: "commerce-workspace-evolution",
    frontendSurfaceType: "commerce-workspace",
    backendStateType: "operations-state",
    sceneType: "operations-workspace",
    visibleEvolutionRule: "orders catalog and operations urgency must evolve together",
    requiredVisibleChanges: ["orders panel evolves", "catalog state updates visibly", "ops action remains legible"],
    backendCoupling: ["orders state must mutate visible ops surface", "catalog state cannot detach from action surface"],
    restoreIdentity: ["orders identity survives restore", "catalog and ops state survive restore"],
  },
  saas: {
    evolutionFamily: "workflow-evolution",
    frontendSurfaceType: "product-workspace",
    backendStateType: "workflow-state",
    sceneType: "workflow-sequence",
    visibleEvolutionRule: "product workflow and state feedback must evolve together",
    requiredVisibleChanges: ["workflow surface evolves", "state feedback updates visibly", "primary action remains productive"],
    backendCoupling: ["workflow state must mutate visible product surface", "product shell must reflect workflow progress"],
    restoreIdentity: ["workflow identity survives restore", "product state survives restore"],
  },
  game: {
    evolutionFamily: "scene-evolution",
    frontendSurfaceType: "playable-preview",
    backendStateType: "play-state",
    sceneType: "scene-state",
    visibleEvolutionRule: "scene HUD and first interaction must evolve together",
    requiredVisibleChanges: ["scene evolves", "HUD changes visibly", "interaction anchor remains playable"],
    backendCoupling: ["play state must mutate the scene", "interaction state must remain visible in HUD or scene"],
    restoreIdentity: ["scene identity survives restore", "interaction anchor survives restore"],
  },
  book: {
    evolutionFamily: "outline-evolution",
    frontendSurfaceType: "document-preview",
    backendStateType: "outline-state",
    sceneType: "outline-sequence",
    visibleEvolutionRule: "outline chapter sequence and publishing direction must evolve together",
    requiredVisibleChanges: ["outline evolves", "chapter sequence becomes clearer", "publishing direction remains visible"],
    backendCoupling: ["outline state must mutate visible document structure"],
    restoreIdentity: ["outline identity survives restore", "chapter structure survives restore"],
  },
  "content-product": {
    evolutionFamily: "module-evolution",
    frontendSurfaceType: "content-preview",
    backendStateType: "module-state",
    sceneType: "module-sequence",
    visibleEvolutionRule: "modules delivery path and teaching sequence must evolve together",
    requiredVisibleChanges: ["module structure evolves", "delivery path updates visibly", "teaching sequence remains coherent"],
    backendCoupling: ["module state must mutate visible delivery surface"],
    restoreIdentity: ["module identity survives restore", "delivery path survives restore"],
  },
  generic: {
    evolutionFamily: "generic-evolution",
    frontendSurfaceType: "generic-preview",
    backendStateType: "generic-state",
    sceneType: "overview-sequence",
    visibleEvolutionRule: "overview and next step must evolve visibly",
    requiredVisibleChanges: ["overview evolves", "next step remains visible"],
    backendCoupling: ["generic state must mutate visible overview"],
    restoreIdentity: ["overview identity survives restore"],
  },
};

export function createClassSpecificSurfaceEvolutionRules({
  productClass = "unknown",
  runtimeDirection = null,
  classAwareGenerationContract = null,
  splitWorkspaceLiveBuildSurfaceModel = null,
} = {}) {
  const normalizedProductClass = normalizeCanonicalProductClass(productClass, { fallback: "generic" });
  const profile = resolveCanonicalProductClassProfile(normalizedProductClass);
  const rules = EVOLUTION_RULES[normalizedProductClass] ?? EVOLUTION_RULES.generic;
  const generationContract = normalizeObject(classAwareGenerationContract);
  const workspaceModel = normalizeObject(splitWorkspaceLiveBuildSurfaceModel);

  return {
    contractId: `surface-evolution:${normalizedProductClass}`,
    productClass: normalizedProductClass,
    label: profile.label,
    evolutionFamily: rules.evolutionFamily,
    frontendSurfaceType: rules.frontendSurfaceType,
    backendStateType: rules.backendStateType,
    sceneType: rules.sceneType,
    visibleEvolutionRule: rules.visibleEvolutionRule,
    requiredVisibleChanges: unique(rules.requiredVisibleChanges),
    backendCoupling: unique([
      ...rules.backendCoupling,
      ...(generationContract.backendCouplingRules ?? []),
    ]),
    restoreIdentity: unique(rules.restoreIdentity),
    previewFamily: workspaceModel.previewFrameFamily ?? runtimeDirection?.previewFamily ?? profile.previewFamily,
    buildSurfaceFamily: workspaceModel.buildSurfaceFamily ?? runtimeDirection?.buildSurfaceFamily ?? profile.buildSurfaceFamily,
    releasePathFamily: runtimeDirection?.releasePathFamily ?? profile.releasePathFamily,
  };
}
