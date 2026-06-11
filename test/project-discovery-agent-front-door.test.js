import test from "node:test";
import assert from "node:assert/strict";

import { createProjectDiscoveryAgentState } from "../web/shared/project-discovery-agent.js";
import { buildProjectCreateViewModel } from "../web/nexus-ui/adapters/project-adapter.js";
import { renderProjectCreateScreen } from "../web/nexus-ui/screens/ProjectCreateScreen.js";

test("project discovery agent produces canonical front-door state without replacing hidden intake", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: "מערכת שמנהלת לידים לצוות מכירות כדי שלא מפספסים follow-up ומראה דשבורד ברור",
    selectedFiles: [{ name: "brief.md" }],
  });

  assert.equal(state.agentName, "Project Discovery Agent");
  assert.equal(state.canonicalUnderstanding.handoffStatus, "needs-agent-composed-response");
  assert.equal(state.firstTaskCandidate.readiness, "needs-agent-response");
  assert.equal(state.hiddenEngine.preserved, true);
  assert.equal(state.hiddenEngine.isAgentBrain, false);
  assert.equal(state.agentLayer.agentAuthority, "nexus-owned-agent-layer");
  assert.deepEqual(state.agentLayer.chain, [
    "project-discovery-agent",
    "product-skeleton-agent",
    "build-loop-agent",
  ]);
  assert.equal(state.nextAgentHandoff.nextAgent, null);
  assert.equal(state.nextAgentHandoff.handoffAllowed, false);
  assert.equal(state.enoughTruthGate.status, "blocked-awaiting-agent-response");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.isConversational, true);
  assert.equal(state.transcript.some((entry) => entry.speaker === "user"), true);
  assert.equal(state.agentResponseSource, "no-agent-response");
  assert.equal(state.responsePolicy.prohibited.includes("main-discovery-response-from-hardcoded-sentence-template"), true);
  assert.equal(state.responsePolicy.agentMustCompose.includes("natural-language-reflection"), true);
  assert.match(state.roleLine, /הבנת פרויקט קנונית/);
  assert.equal(state.currentAgentMessage, "");
  assert.deepEqual(state.transcript.map((entry) => entry.speaker), ["user"]);
  assert.deepEqual(state.missingItems, ["Nexus צריך לענות דרך סוכן חי שמנסח מתוך השיחה לפני פתיחת שלד ראשון."]);
  assert.equal(state.detectedGaps.includes("לא זוהה חור קריטי בשלב הזה."), true);
});

test("project discovery agent renders multi-turn transcript from hidden intake conversation", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: "אני רוצה מערכת שמנהלת לידים",
    conversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "אני רוצה מערכת שמנהלת לידים" },
        { id: "a1", speaker: "ai", text: "מי המשתמש המרכזי שמחזיק את הליד בפועל?", responseSource: "agent-envelope" },
        { id: "u2", speaker: "user", text: "איש מכירות בצוות קטן" },
        { id: "a2", speaker: "ai", text: "מעולה. עכשיו נחדד איפה follow-up נופל.", responseSource: "agent-envelope" },
      ],
      summarySnapshot: {
        understoodItems: ["המשתמש הוא איש מכירות בצוות קטן."],
        missingItems: ["איפה follow-up נופל בפועל"],
        projectType: "saas",
        projectTypeConfidence: 0.6,
        actors: [{ role: "operator", label: "איש מכירות" }],
      },
    },
  });

  assert.equal(state.turnCount, 4);
  assert.equal(state.agentResponseSource, "agent-composed-transcript");
  assert.equal(state.enoughTruthGate.status, "needs-discovery");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.currentAgentMessage, "מעולה. עכשיו נחדד איפה follow-up נופל.");
  assert.deepEqual(state.transcript.map((entry) => entry.speaker), ["user", "agent", "user", "agent"]);
  assert.deepEqual(state.missingItems, ["איפה follow-up נופל בפועל"]);
});

test("project discovery agent does not let stale intake missing items override enough free-form truth", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
    conversation: {
      summary: {
        missingItems: [
          "מי מחזיק את הליד או הלקוח בפועל",
          "האם ה-v1 משרת בעל עסק או איש מכירות",
        ],
      },
    },
  });

  assert.deepEqual(state.missingItems, ["Nexus צריך לענות דרך סוכן חי שמנסח מתוך השיחה לפני פתיחת שלד ראשון."]);
  assert.equal(state.firstTaskCandidate.readiness, "needs-agent-response");
  assert.equal(state.agentResponseSource, "no-agent-response");
  assert.equal(state.enoughTruthGate.status, "blocked-awaiting-agent-response");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.nextAgentHandoff.handoffAllowed, false);
  assert.equal(state.canonicalUnderstanding.handoffStatus, "needs-agent-composed-response");
});

test("completed backend intake cannot bypass the live Project Discovery Agent response", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Follow-up OS",
    visionText: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
    conversation: {
      isComplete: true,
      transcript: [
        {
          id: "u1",
          speaker: "user",
          text: "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up. המשתמש המרכזי הוא איש מכירות, הכאב הוא איבוד לידים בין שיחות, וה-flow הראשון הוא רשימת לידים עם בעלות, תזכורת וצעד הבא.",
        },
      ],
      summary: {
        understoodItems: [
          "אנשי מכירות צריכים רשימת לידים עם בעלות, תזכורת וצעד הבא.",
        ],
        missingItems: ["אין חוסר קריטי לפני שלד ראשון."],
      },
      answers: {
        "core-idea": "מערכת דשבורד לצוות מכירות שמנהלת לידים כדי שלא מפספסים follow-up.",
        "target-audience": "אנשי מכירות",
        "core-problem": "איבוד לידים בין שיחות",
        "successful-solution": "רשימת לידים עם בעלות, תזכורת וצעד הבא",
      },
    },
  });

  assert.equal(state.agentResponseSource, "no-agent-response");
  assert.equal(state.enoughTruthGate.status, "blocked-awaiting-agent-response");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.firstTaskCandidate.readiness, "needs-agent-response");
  assert.equal(state.nextAgentHandoff.handoffAllowed, false);
  assert.equal(state.canonicalUnderstanding.handoffStatus, "needs-agent-composed-response");
  assert.deepEqual(state.missingItems, ["Nexus צריך לענות דרך סוכן חי שמנסח מתוך השיחה לפני פתיחת שלד ראשון."]);
});

test("project discovery agent can become ready from a messy first idea plus a clarifying reply", () => {
  const state = createProjectDiscoveryAgentState({
    projectName: "Business Order",
    visionText: "אני רוצה מערכת שתעשה סדר בעסק ותעזור לי לא לפספס דברים",
    conversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "אני רוצה מערכת שתעשה סדר בעסק ותעזור לי לא לפספס דברים" },
        { id: "a1", speaker: "ai", text: "מי הבן אדם שבאמת צריך את זה ביום-יום?", responseSource: "agent-envelope" },
        {
          id: "u2",
          speaker: "user",
          text: "זה מיועד לבעל עסק קטן שמקבל לידים מוואטסאפ ושיחות. הכאב הוא שאין בעלות ברורה על כל ליד, וה-flow הראשון צריך להיות רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא.",
        },
        {
          id: "a2",
          speaker: "ai",
          text: "הבנתי. יש מספיק אמת כדי לפתוח שלד ראשון של רשימת לידים עם בעלות, סטטוס ותזכורת.",
          responseSource: "agent-envelope",
        },
      ],
      understanding: {
        audience: [{ value: "בעל עסק קטן שמקבל לידים מוואטסאפ ושיחות", source: "u2" }],
        problem: [{ value: "אין בעלות ברורה על כל ליד", source: "u2" }],
        solution: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "u2" }],
        class: [{ value: "saas", source: "u2" }],
        actor: [],
        workflow: [{ value: "רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא", source: "u2" }],
        risk: [],
      },
      summarySnapshot: {
        understoodItems: [
          "בעל עסק קטן מקבל לידים מוואטסאפ ושיחות.",
          "הכאב הוא שאין בעלות ברורה על כל ליד.",
          "ה-flow הראשון הוא רשימת לידים עם אחראי, סטטוס, תזכורת וצעד הבא.",
        ],
        missingItems: [],
        projectType: "saas",
        projectTypeConfidence: 0.82,
        actors: [{ role: "operator", label: "בעל עסק קטן" }],
      },
      lastAgentDecision: {
        nextMove: "advance-to-skeleton",
        skeletonReady: { ready: true, reason: "יש קהל, כאב, פתרון וזרימה ראשונה." },
      },
    },
  });

  assert.deepEqual(state.missingItems, ["אין חוסר קריטי לפני שלד ראשון."]);
  assert.equal(state.firstTaskCandidate.readiness, "ready");
  assert.equal(state.enoughTruthGate.status, "ready-for-build");
  assert.equal(state.enoughTruthGate.buildAllowed, true);
  assert.equal(state.nextAgentHandoff.handoffAllowed, true);
});

test("project discovery agent refuses to pretend that weak input is enough", () => {
  const state = createProjectDiscoveryAgentState({
    visionText: "פלטפורמה להכול",
  });

  assert.equal(state.canonicalUnderstanding.handoffStatus, "needs-discovery");
  assert.equal(state.enoughTruthGate.status, "needs-discovery");
  assert.equal(state.enoughTruthGate.buildAllowed, false);
  assert.equal(state.firstTaskCandidate.readiness, "needs-discovery");
  assert.equal(state.agentResponseSource, "no-agent-response");
  assert.match(state.responsePolicy.mustAsk, /משתמש|בן אדם|קהל/);
  assert.equal(state.currentAgentMessage, "");
  assert.equal(state.detectedGaps.some((gap) => /רחב מדי|קצר מדי/.test(gap)), true);
});

test("create front door renders the Project Discovery Agent as the visible entry experience", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      projectName: "Follow-up OS",
      visionText: "מערכת שמנהלת לידים לצוות מכירות כדי שלא מפספסים follow-up ומראה דשבורד ברור",
      fileName: "brief.md",
      fileContent: JSON.stringify([{ name: "brief.md" }]),
    },
  });
  const html = renderProjectCreateScreen(viewModel);

  assert.match(html, /מה אתה רוצה לבנות/);
  assert.doesNotMatch(html, /Project Discovery Agent/);
  assert.doesNotMatch(html, /סוכן גילוי הפרויקט/);
  assert.doesNotMatch(html, /מה אני מבין עד עכשיו/);
  assert.doesNotMatch(html, /מה אני עוד צריך ממך/);
  assert.doesNotMatch(html, /מה עלול להפיל את זה/);
  assert.doesNotMatch(html, /מה אבנה ראשון אם זה מספיק ברור/);
  assert.match(html, /data-agent-mode="project-discovery"/);
  assert.match(html, /data-hidden-intake-engine="preserved"/);
  assert.match(html, /data-agent-conversation="multi-turn"/);
  assert.match(html, /data-agent-authority="nexus-owned-agent-layer"/);
  assert.match(html, /data-intake-agent-brain="false"/);
  assert.match(html, /data-agent-layer-contract="nexus-real-agent-layer:v1"/);
  assert.match(html, /data-agent-response-source="no-agent-response"/);
  assert.match(html, /data-enough-truth-task="SLICE-003"/);
  assert.match(html, /data-enough-truth-status="blocked-awaiting-agent-response"/);
  assert.match(html, /data-enough-truth-build-allowed="false"/);
  assert.match(html, /data-enough-truth-authority="project-discovery-agent-decision"/);
  assert.match(html, /data-enough-truth-engine="onboarding-intake-engine"/);
  assert.doesNotMatch(html, /project-discovery-agent -&gt; product-skeleton-agent -&gt; build-loop-agent/);
  assert.doesNotMatch(html, /support-infrastructure-only/);
  assert.match(html, /project-discovery-agent-thread/);
  assert.doesNotMatch(html, /step 1|step 2|שאלה 1|שאלה 2|שאלה 3/i);
});

test("create front door renders only agent-authored speech as Nexus speech", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      projectName: "Follow-up OS",
      visionText: "מערכת שמנהלת לידים לצוות מכירות",
    },
    onboardingConversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "מערכת שמנהלת לידים לצוות מכירות" },
        { id: "a1", speaker: "ai", text: "איזה רגע במעקב אחרי ליד הכי נופל היום?", responseSource: "agent-envelope" },
        { id: "a2", speaker: "ai", text: "פברוק ישן לא אמור להופיע", responseSource: "policy-draft" },
        { id: "a3", speaker: "ai", text: "provider-composed ישן לא אמור להופיע", responseSource: "provider-composed" },
      ],
    },
  });
  const html = renderProjectCreateScreen(viewModel);

  assert.match(html, /מערכת שמנהלת לידים לצוות מכירות/);
  assert.match(html, /איזה רגע במעקב אחרי ליד הכי נופל היום/);
  assert.doesNotMatch(html, /פברוק ישן לא אמור להופיע/);
  assert.doesNotMatch(html, /provider-composed ישן לא אמור להופיע/);
  assert.match(html, /data-agent-response-source="agent-composed-transcript"/);
  assert.doesNotMatch(html, /לפני שאני פותח שלד ראשון|זה חשוב כדי שלא אבנה מוצר יפה|יש מספיק כיוון/);
});

test("create front door can show agent unavailable status without fabricating Nexus speech", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      projectName: "Failure proof",
      visionText: "תבנה לי אפליקציה",
    },
    statusMessage: "הסוכן לא זמין כרגע. אפשר לנסות שוב בלי לאבד את ההודעה.",
    onboardingConversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "תבנה לי אפליקציה" },
      ],
      lastAgentTurn: {
        status: "failed",
        pendingUserMessage: "תבנה לי אפליקציה",
      },
    },
  });
  const html = renderProjectCreateScreen(viewModel);

  assert.match(html, /הסוכן לא זמין כרגע/);
  assert.match(html, /תבנה לי אפליקציה/);
  assert.doesNotMatch(html, /Nexus<\/span>\s*<p>הסוכן לא זמין/);
  assert.doesNotMatch(html, /provider|runtime|schema|policy-draft|Nexus Wave 2 Permanent Executor/i);
});

test("create front door can show first skeleton handoff failure without opening fake product speech", () => {
  const viewModel = buildProjectCreateViewModel({
    draftInputs: {
      projectName: "Lead follow-up",
      visionText: "כלי פנימי לניהול לידים עם אחראי ותזכורת",
    },
    statusMessage: "Nexus הבינה שיש מספיק אמת לפתיחת שלד ראשון, אבל סוכן השלד לא פעל עכשיו. ההבנה נשמרה, לא אפתח שלד מזויף, ואפשר לנסות שוב.",
    onboardingConversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "כלי פנימי לניהול לידים עם אחראי ותזכורת" },
        {
          id: "a1",
          speaker: "ai",
          text: "הבנתי מספיק כדי להתקדם להכנת סקיצה ראשונה.",
          responseSource: "agent-envelope",
        },
      ],
      lastAgentDecision: {
        intent: "product-answer",
        nextMove: "advance-to-skeleton",
        skeletonReady: {
          ready: true,
        },
      },
    },
  });
  const html = renderProjectCreateScreen(viewModel);

  assert.match(html, /סוכן השלד לא פעל עכשיו/);
  assert.match(html, /לא אפתח שלד מזויף/);
  assert.match(html, /הבנתי מספיק כדי להתקדם להכנת סקיצה ראשונה/);
  assert.doesNotMatch(html, /data-product-skeleton-task="SKEL-001"/);
  assert.doesNotMatch(html, /data-visual-skeleton-task="VSKEL-001"/);
});
