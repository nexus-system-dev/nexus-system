export const ASK_ONLY_IF_NEEDED_INTERACTION_CONTRACT = Object.freeze({
  taskId: "SLICE-004",
  classification: "new shell task",
  policyName: "ask-only-if-needed",
  authority: "project-discovery-agent-decision",
  preservedEngine: "onboarding-intake-engine",
  allowedOutcomes: [
    "ask-one-blocking-question",
    "advance-without-extra-question",
    "stop-without-fake-skeleton",
  ],
  askRules: [
    "ask only when a blocking product-truth gap exists",
    "ask exactly one visible question",
    "question must be user-facing and present in the agent reply",
    "do not ask checklist-style follow-ups once enough truth exists",
  ],
  prohibited: [
    "multi-question checklist before first skeleton",
    "asking for polish details when enough truth exists",
    "hiding missing understanding behind placeholders",
    "opening a skeleton when the correct outcome is stop",
  ],
  downstreamStillOpen: [
    "SKEL-001",
    "VSKEL-001",
    "BLD-AGT-001",
  ],
});

export function getAskOnlyIfNeededInteractionContract() {
  return ASK_ONLY_IF_NEEDED_INTERACTION_CONTRACT;
}
