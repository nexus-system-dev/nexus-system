export const HOME_IDEA_HANDOFF_CONTRACT = Object.freeze({
  taskId: "SLICE-002",
  sourceSurface: "home",
  targetSurface: "create",
  classification: "new shell task",
  responsibleAgent: "project-discovery-agent",
  hiddenEngine: "onboarding-intake-engine",
  preserves: [
    "Home remains a momentum gateway",
    "Project Discovery Agent remains the idea-understanding owner",
    "Onboarding intake engine remains the hidden persistence/session engine",
  ],
  removes: [
    "Home must not behave like a dashboard-first project manager",
    "Home must not claim a skeleton or build result before the discovery agent runs",
  ],
  builds: [
    "A visible Home affordance for starting a new product idea",
    "A handoff marker from Home into the Create discovery surface",
    "A proof boundary that this is a handoff, not live downstream agent closure",
  ],
  boundaries: {
    proofBoundary: "handoff-only-not-agent-response",
    doesNotClose: [
      "SLICE-003",
      "SLICE-004",
      "SKEL-001",
      "VSKEL-001",
      "BLD-AGT-001",
    ],
  },
});

export function getHomeIdeaHandoffContract() {
  return HOME_IDEA_HANDOFF_CONTRACT;
}
