import { ADVANCED_ROUTES, PRIMARY_LOOP_ROUTES, SUPPORT_ROUTES } from "./index.js";

export const LEGACY_DECOMPOSITION_ACTIONS = [
  "preserve hidden",
  "remove visible",
  "replace",
  "migrate",
];

export const LEGACY_FRONTEND_DECOMPOSITION_MAP = {
  create: {
    action: "replace",
    canonicalSurface: "Home",
    enginePreserved: "project creation and project-service intake truth",
    visibleRemoval: "old create screen stops being the product entry point",
    nextTask: "SURF-002",
  },
  onboarding: {
    action: "remove visible",
    canonicalSurface: "Home / Build",
    enginePreserved: "onboarding intake hidden engine",
    visibleRemoval: "standalone onboarding route",
    nextTask: "SHL-002",
  },
  understanding: {
    action: "remove visible",
    canonicalSurface: "Build",
    enginePreserved: "intent interpretation and artifact expectation",
    visibleRemoval: "standalone understanding summary route",
    nextTask: "SHL-003",
  },
  loop: {
    action: "remove visible",
    canonicalSurface: "Build",
    enginePreserved: "loop planning and repeated continuation",
    visibleRemoval: "orchestration-first loop route",
    nextTask: "SHL-004",
  },
  execution: {
    action: "migrate",
    canonicalSurface: "Build",
    enginePreserved: "runtime, build, packaging, and release contracts",
    visibleRemoval: "execution route as separate DevOps-style shell",
    nextTask: "SURF-003",
  },
  proof: {
    action: "remove visible",
    canonicalSurface: "Build / History",
    enginePreserved: "artifact proof generation engine",
    visibleRemoval: "standalone proof route",
    nextTask: "SHL-004",
  },
  artifact: {
    action: "migrate",
    canonicalSurface: "Build / Share / History",
    enginePreserved: "artifact preview and export capability",
    visibleRemoval: "artifact as proof-step destination",
    nextTask: "SURF-003",
  },
  confirmation: {
    action: "migrate",
    canonicalSurface: "Build",
    enginePreserved: "approval and human-in-the-loop decision gates",
    visibleRemoval: "ceremonial confirmation screen",
    nextTask: "EXP-002",
  },
  "state-update": {
    action: "migrate",
    canonicalSurface: "History",
    enginePreserved: "mutation state update and continuity records",
    visibleRemoval: "state-update as standalone route",
    nextTask: "SURF-006",
  },
  "next-task": {
    action: "migrate",
    canonicalSurface: "Build / Growth",
    enginePreserved: "next-task and continuation intelligence",
    visibleRemoval: "task queue as primary UX",
    nextTask: "SURF-003",
  },
  timeline: {
    action: "remove visible",
    canonicalSurface: "History",
    enginePreserved: "event history, snapshots, and change explanation",
    visibleRemoval: "technical timeline route",
    nextTask: "SHL-004",
  },
  home: {
    action: "replace",
    canonicalSurface: "Home",
    enginePreserved: "project continuity and return destination",
    visibleRemoval: "support dashboard home",
    nextTask: "SURF-002",
  },
  files: {
    action: "migrate",
    canonicalSurface: "Build / Share / Studio",
    enginePreserved: "asset and file support",
    visibleRemoval: "files as disconnected support route",
    nextTask: "SURF-003",
  },
  notifications: {
    action: "migrate",
    canonicalSurface: "Home / History",
    enginePreserved: "owner-visible alerts only when contextual",
    visibleRemoval: "notification center as default surface",
    nextTask: "SURF-002",
  },
  settings: {
    action: "migrate",
    canonicalSurface: "Studio / Org",
    enginePreserved: "profile, provider, permission, and environment settings",
    visibleRemoval: "settings as broad product control center",
    nextTask: "SURF-008",
  },
  integrations: {
    action: "migrate",
    canonicalSurface: "Studio / Org",
    enginePreserved: "scoped external capability bindings",
    visibleRemoval: "integration marketplace-style route",
    nextTask: "EXP-007",
  },
  help: {
    action: "replace",
    canonicalSurface: "Home",
    enginePreserved: "support copy and recovery guidance",
    visibleRemoval: "help route as product surface",
    nextTask: "SURF-002",
  },
  qa: {
    action: "preserve hidden",
    canonicalSurface: "Internal QA",
    enginePreserved: "fallback route diagnostics and test harness",
    visibleRemoval: "QA route from user-facing navigation",
    nextTask: "REL-006",
  },
  workspace: {
    action: "replace",
    canonicalSurface: "Build",
    enginePreserved: "workspace layout shell primitives",
    visibleRemoval: "workspace as ambiguous catch-all route",
    nextTask: "SURF-003",
  },
  advanced: {
    action: "preserve hidden",
    canonicalSurface: "Studio / Org",
    enginePreserved: "advanced capability boundary",
    visibleRemoval: "advanced route from v1 default UX",
    nextTask: "EXP-007",
  },
  developer: {
    action: "preserve hidden",
    canonicalSurface: "Studio",
    enginePreserved: "developer diagnostics and local execution bridge",
    visibleRemoval: "developer route from normal builder UX",
    nextTask: "SURF-008",
  },
  brain: {
    action: "preserve hidden",
    canonicalSurface: "Internal engine",
    enginePreserved: "memory and product graph intelligence",
    visibleRemoval: "brain route from visible product",
    nextTask: "ENG-007",
  },
  release: {
    action: "migrate",
    canonicalSurface: "Release",
    enginePreserved: "release readiness and deployment contracts",
    visibleRemoval: "release as advanced side route",
    nextTask: "SURF-004",
  },
  growth: {
    action: "migrate",
    canonicalSurface: "Growth",
    enginePreserved: "growth intelligence after product truth exists",
    visibleRemoval: "growth as advanced side route",
    nextTask: "SURF-005",
  },
};

export const LEGACY_INDEX_SECTIONS = [
  "create",
  "home",
  "files",
  "settings",
  "help",
  "onboarding",
  "understanding",
  "loop",
  "execution",
  "proof",
  "artifact",
  "confirmation",
  "state-update",
  "next-task",
  "timeline",
  "qa",
  "workspace",
];

export const LEGACY_ROUTE_FAMILIES = {
  primary: PRIMARY_LOOP_ROUTES,
  support: SUPPORT_ROUTES,
  advanced: ADVANCED_ROUTES,
  indexSections: LEGACY_INDEX_SECTIONS,
};

export function listLegacyFrontendDecompositionEntries() {
  return Object.entries(LEGACY_FRONTEND_DECOMPOSITION_MAP).map(([routeKey, entry]) => ({
    routeKey,
    ...entry,
  }));
}
