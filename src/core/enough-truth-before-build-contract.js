export const ENOUGH_TRUTH_BEFORE_BUILD_CONTRACT = Object.freeze({
  taskId: "SLICE-003",
  classification: "new shell task",
  gateName: "enough-truth-before-build",
  authority: "project-discovery-agent-decision",
  preservedEngine: "onboarding-intake-engine",
  requiredSignals: [
    "active discovery session",
    "agent-composed transcript response",
    "canonical understanding ready-for-first-task",
    "handoff allowed to product-skeleton-agent",
    "hidden intake engine is not the agent brain",
  ],
  allowedOutcomes: [
    "proceed-to-first-skeleton",
    "ask-one-blocking-question",
    "stay-in-discovery-without-fake-skeleton",
  ],
  notAllowed: [
    "advance from legacy intake completion alone",
    "advance from restored summary alone",
    "advance from local heuristic readiness alone",
    "show first skeleton without Project Discovery Agent handoff",
  ],
  downstreamStillOpen: [
    "SLICE-004",
    "SKEL-001",
    "VSKEL-001",
    "BLD-AGT-001",
  ],
});

export function getEnoughTruthBeforeBuildContract() {
  return ENOUGH_TRUTH_BEFORE_BUILD_CONTRACT;
}
