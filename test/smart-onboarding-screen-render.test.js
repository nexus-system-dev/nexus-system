import test from "node:test";
import assert from "node:assert/strict";

import { renderSmartOnboardingScreen } from "../web/nexus-ui/screens/SmartOnboardingScreen.js";

test("smart onboarding screen renders adaptive intake contract card", () => {
  const html = renderSmartOnboardingScreen({
    title: "רוצה להבין את הפרויקט שלך",
    statusMessage: "כמה שאלות קצרות שיעזרו לי להבין טוב יותר את הפרויקט.",
    projectName: "Ops Queue",
    progressLabel: "שאלה 2 מתוך 4",
    questionTitle: "מה הבעיה המרכזית שהם מתמודדים איתה?",
    questionBody: "כבר ברור לי מי המשתמש. עכשיו צריך לדייק את הכאב החוזר.",
    answerDraft: "",
    isUnderstandingMode: false,
    summary: {
      understood: ["קהל יעד: צוות תפעול"],
      missing: ["מה צוואר הבקבוק המרכזי"],
    },
    adaptiveOnboardingAgentContract: {
      statusLabel: "ה־adaptive intake agent מוגדר עכשיו כחוזה קנוני אחד",
      currentProjectTypeLabel: "כלי פנימי",
      currentQuestionPathLabel: "target-audience -> core-problem -> successful-solution -> active-question",
      handoffStatus: "ready",
      readinessLevel: "almost-ready",
      behaviors: [
        { label: "class-aware branching", status: "live" },
        { label: "weak / generic answer detection", status: "partial" },
      ],
      explicitProhibitions: [
        "no free-form general assistant behavior",
        "no advancing into generation without canonical intake handoff truth",
      ],
    },
    providerRuntime: {
      selectedProviderId: "anthropic",
      selectedProviderLabel: "Anthropic",
      selectedRuntimeLabel: "Anthropic onboarding runtime",
      canonicalRuleLayer: "nexus-onboarding-rules-v1",
      summaryLine: "Anthropic פעיל עכשיו, אבל עדיין כפוף לכללי ה־intake הקנוניים של Nexus.",
      enforcementLine: "בחירת provider לא מבטלת class gates, clarification pressure, readiness gates או bounded handoff.",
      runtimeMode: "provider-backed",
      availableProviders: [
        { providerId: "openai", companyLabel: "OpenAI" },
        { providerId: "anthropic", companyLabel: "Anthropic" },
      ],
    },
  });

  assert.match(html, /Adaptive intake contract/);
  assert.match(html, /ה־adaptive intake agent מוגדר עכשיו כחוזה קנוני אחד/);
  assert.match(html, /target-audience -&gt; core-problem -&gt; successful-solution -&gt; active-question/);
  assert.match(html, /weak \/ generic answer detection · partial/);
  assert.match(html, /canonical intake handoff truth/);
  assert.match(html, /שוחח עם/);
  assert.match(html, /Anthropic onboarding runtime/);
  assert.match(html, /rules: nexus-onboarding-rules-v1 · mode: provider-backed/);
});
