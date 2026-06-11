import assert from "node:assert/strict";
import test from "node:test";

import { getAskOnlyIfNeededInteractionContract } from "../src/core/ask-only-if-needed-interaction-contract.js";
import { createProjectDiscoveryAgentState } from "../web/shared/project-discovery-agent.js";
import { buildProjectCreateViewModel } from "../web/nexus-ui/adapters/project-adapter.js";
import { renderProjectCreateScreen } from "../web/nexus-ui/screens/ProjectCreateScreen.js";

test("SLICE-004 contract allows only one needed question, advance, or safe stop", () => {
  const contract = getAskOnlyIfNeededInteractionContract();

  assert.equal(contract.taskId, "SLICE-004");
  assert.equal(contract.classification, "new shell task");
  assert.equal(contract.policyName, "ask-only-if-needed");
  assert.equal(contract.authority, "project-discovery-agent-decision");
  assert.ok(contract.allowedOutcomes.includes("ask-one-blocking-question"));
  assert.ok(contract.allowedOutcomes.includes("advance-without-extra-question"));
  assert.ok(contract.allowedOutcomes.includes("stop-without-fake-skeleton"));
  assert.ok(contract.prohibited.includes("multi-question checklist before first skeleton"));
  assert.ok(contract.downstreamStillOpen.includes("SKEL-001"));
});

test("SLICE-004 asks one blocking question when the agent asks", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "אני רוצה מערכת לניהול לידים",
    conversation: {
      transcript: [
        { speaker: "user", text: "אני רוצה מערכת לניהול לידים" },
        {
          speaker: "ai",
          text: "מי האדם שמטפל בלידים ביום יום?",
          responseSource: "agent-envelope",
        },
      ],
      summarySnapshot: {
        understoodItems: ["נדרש כלי לניהול לידים."],
        missingItems: ["מי האדם שמטפל בלידים ביום יום?"],
        projectType: "saas",
        projectTypeConfidence: 0.6,
        actors: [],
      },
      lastAgentDecision: {
        nextMove: "ask",
        nextQuestion: "מי האדם שמטפל בלידים ביום יום?",
        skeletonReady: { ready: false, reason: "missing primary actor" },
      },
    },
  });

  assert.equal(state.askPolicy.taskId, "SLICE-004");
  assert.equal(state.askPolicy.outcome, "ask-one-blocking-question");
  assert.equal(state.askPolicy.questionCount, 1);
  assert.equal(state.askPolicy.blockingQuestion, "מי האדם שמטפל בלידים ביום יום?");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
});

test("SLICE-004 advances without extra question when enough truth is agent-approved", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "מערכת לניהול לידים",
    conversation: {
      transcript: [
        { speaker: "user", text: "מערכת לניהול לידים" },
        { speaker: "ai", text: "יש מספיק אמת לפתוח שלד ראשון.", responseSource: "agent-envelope" },
      ],
      understanding: {
        audience: [{ value: "בעל עסק קטן", source: "agent-envelope" }],
        problem: [{ value: "לידים נאבדים בלי תזכורת", source: "agent-envelope" }],
        solution: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "agent-envelope" }],
        workflow: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "agent-envelope" }],
      },
      summarySnapshot: {
        understoodItems: ["בעל עסק קטן צריך לנהל לידים עם תזכורת."],
        missingItems: [],
        projectType: "saas",
        projectTypeConfidence: 0.8,
        actors: [{ role: "operator", label: "בעל עסק קטן" }],
      },
      lastAgentDecision: {
        nextMove: "advance-to-skeleton",
        nextQuestion: null,
        skeletonReady: { ready: true, reason: "audience+problem+workflow" },
      },
    },
  });

  assert.equal(state.askPolicy.outcome, "advance-without-extra-question");
  assert.equal(state.askPolicy.questionCount, 0);
  assert.equal(state.enoughTruthGate.buildAllowed, true);
});

test("SLICE-004 stops without fake skeleton when there is no safe visible question", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "",
  });

  assert.equal(state.askPolicy.outcome, "stop-without-fake-skeleton");
  assert.equal(state.askPolicy.questionCount, 0);
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.nextAgentHandoff.handoffAllowed, false);
});

test("Create surface exposes SLICE-004 ask policy markers without visible system labels", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      visionText: "אני רוצה מערכת לניהול לידים",
    },
    onboardingConversation: {
      transcript: [
        { speaker: "user", text: "אני רוצה מערכת לניהול לידים" },
        {
          speaker: "ai",
          text: "מי האדם שמטפל בלידים ביום יום?",
          responseSource: "agent-envelope",
        },
      ],
      summarySnapshot: {
        understoodItems: ["נדרש כלי לניהול לידים."],
        missingItems: ["מי האדם שמטפל בלידים ביום יום?"],
        projectType: "saas",
        projectTypeConfidence: 0.6,
        actors: [],
      },
      lastAgentDecision: {
        nextMove: "ask",
        nextQuestion: "מי האדם שמטפל בלידים ביום יום?",
        skeletonReady: { ready: false, reason: "missing primary actor" },
      },
    },
  });
  const html = renderProjectCreateScreen(viewModel);
  const visibleText = html.replace(/<[^>]*>/g, " ");

  assert.match(html, /data-ask-policy-task="SLICE-004"/);
  assert.match(html, /data-ask-policy="ask-only-if-needed"/);
  assert.match(html, /data-ask-policy-outcome="ask-one-blocking-question"/);
  assert.match(html, /data-ask-policy-question-count="1"/);
  assert.doesNotMatch(visibleText, /ask-only-if-needed/);
  assert.doesNotMatch(visibleText, /SLICE-004/);
});
