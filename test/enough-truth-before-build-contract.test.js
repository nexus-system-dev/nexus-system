import assert from "node:assert/strict";
import test from "node:test";

import { getEnoughTruthBeforeBuildContract } from "../src/core/enough-truth-before-build-contract.js";
import { createProjectDiscoveryAgentState } from "../web/shared/project-discovery-agent.js";

test("SLICE-003 contract defines enough-truth gate before any build handoff", () => {
  const contract = getEnoughTruthBeforeBuildContract();

  assert.equal(contract.taskId, "SLICE-003");
  assert.equal(contract.classification, "new shell task");
  assert.equal(contract.gateName, "enough-truth-before-build");
  assert.equal(contract.authority, "project-discovery-agent-decision");
  assert.equal(contract.preservedEngine, "onboarding-intake-engine");
  assert.ok(contract.requiredSignals.includes("agent-composed transcript response"));
  assert.ok(contract.notAllowed.includes("advance from legacy intake completion alone"));
  assert.ok(contract.downstreamStillOpen.includes("SKEL-001"));
});

test("SLICE-003 blocks weak product truth before build", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "תבנה לי משהו מגניב",
  });

  assert.equal(state.enoughTruthGate.taskId, "SLICE-003");
  assert.equal(state.enoughTruthGate.status, "needs-discovery");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.nextAgentHandoff.handoffAllowed, false);
});

test("SLICE-003 blocks strong local truth without an agent-composed response", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "מערכת לצוות מכירות שמנהלת לידים, המשתמש הוא איש מכירות, הכאב הוא איבוד follow-up, והזרימה הראשונה היא רשימת לידים עם אחראי תזכורת וצעד הבא.",
    conversation: {
      isComplete: true,
      transcript: [
        {
          speaker: "user",
          text: "מערכת לצוות מכירות שמנהלת לידים, המשתמש הוא איש מכירות, הכאב הוא איבוד follow-up, והזרימה הראשונה היא רשימת לידים עם אחראי תזכורת וצעד הבא.",
        },
      ],
    },
  });

  assert.equal(state.enoughTruthGate.status, "blocked-awaiting-agent-response");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.firstTaskCandidate.readiness, "needs-agent-response");
  assert.equal(state.nextAgentHandoff.nextAgent, null);
});

test("SLICE-003 allows build only from agent decision with skeletonReady true", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: "מערכת לניהול לידים",
    conversation: {
      transcript: [
        { speaker: "user", text: "מערכת לניהול לידים" },
        { speaker: "ai", text: "מי משתמש בזה ביום יום?", responseSource: "agent-envelope" },
        { speaker: "user", text: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות. הכאב הוא שאין אחראי ואין תזכורת. הזרימה הראשונה היא רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא." },
        { speaker: "ai", text: "יש מספיק אמת כדי לפתוח שלד ראשון סביב טיפול בלידים.", responseSource: "agent-envelope" },
      ],
      understanding: {
        audience: [{ value: "בעל עסק קטן", source: "agent-envelope" }],
        problem: [{ value: "אין אחראי ואין תזכורת", source: "agent-envelope" }],
        solution: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "agent-envelope" }],
        workflow: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "agent-envelope" }],
      },
      summarySnapshot: {
        understoodItems: [
          "המשתמש הוא בעל עסק קטן.",
          "הכאב הוא שאין אחראי ואין תזכורת.",
          "הזרימה הראשונה היא רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא.",
        ],
        missingItems: [],
        projectType: "saas",
      },
      lastAgentDecision: {
        nextMove: "advance-to-skeleton",
        skeletonReady: { ready: true, reason: "audience+problem+workflow" },
      },
    },
  });

  assert.equal(state.enoughTruthGate.status, "ready-for-build");
  assert.equal(state.enoughTruthGate.buildAllowed, true);
  assert.equal(state.nextAgentHandoff.nextAgent, "product-skeleton-agent");
  assert.equal(state.nextAgentHandoff.handoffAllowed, true);
});
