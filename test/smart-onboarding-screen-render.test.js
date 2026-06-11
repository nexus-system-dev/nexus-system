import test from "node:test";
import assert from "node:assert/strict";

import { renderSmartOnboardingScreen } from "../web/nexus-ui/screens/SmartOnboardingScreen.js";

test("smart onboarding screen renders adaptive intake contract card", () => {
  const html = renderSmartOnboardingScreen({
    title: "רוצה להבין את הפרויקט שלך",
    statusMessage: "אני כאן כדי להבין לעומק את הכלי הזה ואת מה שבאמת צריך לקרות בו לפני שממשיכים.",
    projectName: "Ops Queue",
    progressLabel: "שאלה 3 מתוך 4",
    questionTitle: "מה הבעיה המרכזית שהם מתמודדים איתה?",
    questionBody: "כבר ברור לי מי המשתמש. עכשיו צריך לדייק את הכאב החוזר.",
    answerDraft: "",
    isUnderstandingMode: false,
    summary: {
      understood: ["קהל יעד: צוות תפעול"],
      missing: ["מה צוואר הבקבוק המרכזי"],
    },
    adaptiveOnboardingAgentContract: {
      statusLabel: "ממה שכבר ברור לי",
      currentProjectTypeLabel: "כרגע זה נראה כמו כלי פנימי",
      currentQuestionPathLabel: "אני נשאר עם המשתמש, הבעיה והרגע שבו זה נשבר עד שהתמונה באמת מתבהרת.",
      handoffStatus: "ready",
      readinessLevel: "almost-ready",
      gateLabel: "יש כבר מספיק בהירות כדי להתקדם.",
      behaviors: [],
      explicitProhibitions: [],
    },
    providerRuntime: {
      selectedProviderId: "anthropic",
      selectedProviderLabel: "Anthropic",
      selectedRuntimeLabel: "Anthropic",
      selectedModelFamilyId: "deep",
      selectedModelLabel: "עמוק",
      selectedRuntimeModelId: "claude-3-7-sonnet-latest",
      selectedIntelligenceLevel: "high",
      selectedIntelligenceLabel: "גבוהה",
      canonicalRuleLayer: "nexus-onboarding-rules-v1",
      summaryLine: "כרגע אני עובד איתך דרך Anthropic.",
      enforcementLine: "גם עם מנוע או מודל אחרים, אני לא מתקדם לפני שהתמונה באמת ברורה.",
      accountingLine: "usage: 2 live calls · 1450 total tokens · cost est: $0.003500 · bundled-estimate",
      availabilityLine: "",
      operatorTruthLine: "health: healthy · active provider: Anthropic · model: claude-test",
      tradeoffLine: "מודל עמוק · עומק גבוהה · יותר עומק ודיוק על חשבון מהירות. יותר חידוד ויותר בדיקת כיוונים.",
      healthStatus: "healthy",
      runtimeMode: "provider-backed",
      availableProviders: [
        { providerId: "openai", companyLabel: "OpenAI" },
        { providerId: "anthropic", companyLabel: "Anthropic" },
      ],
      availableModelFamilies: [
        { modelFamilyId: "fast", modelLabel: "מהיר" },
        { modelFamilyId: "balanced", modelLabel: "מאוזן" },
        { modelFamilyId: "deep", modelLabel: "עמוק" },
      ],
      availableIntelligenceLevels: [
        { intelligenceLevelId: "low", intelligenceLabel: "נמוכה" },
        { intelligenceLevelId: "medium", intelligenceLabel: "בינונית" },
        { intelligenceLevelId: "high", intelligenceLabel: "גבוהה" },
      ],
    },
  });

  assert.match(html, /התמונה שמתחילה להיסגר/);
  assert.match(html, /יש כבר מספיק בהירות כדי להתקדם/);
  assert.match(html, /התמונה באמת מתבהרת/);
  assert.match(html, /nexus-onboarding-chat-card__provider" hidden/);
  assert.doesNotMatch(html, />שיחה דרך</);
  assert.doesNotMatch(html, />מודל</);
  assert.doesNotMatch(html, />עומק חשיבה</);
  assert.match(html, /<p id="onboarding-provider-runtime-label" hidden>Anthropic<\/p>/);
  assert.match(html, /אני ממשיך איתך מאותה נקודה, ולא מתקדם לפני שברור מה באמת חשוב כאן/);
  assert.match(html, /על מה אני נשען עכשיו/);
  assert.match(html, /איך אני נשאר איתך על אותו הכיוון/);
});

test("smart onboarding screen renders unavailable provider option truthfully", () => {
  const html = renderSmartOnboardingScreen({
    title: "רוצה להבין את הפרויקט שלך",
    statusMessage: "אני כאן כדי להבין לעומק את המוצר הזה ואת מה שבאמת צריך לקרות בו לפני שממשיכים.",
    projectName: "Ops Queue",
    progressLabel: "שאלה 1 מתוך 4",
    questionTitle: "מה הרעיון שיש לך בראש?",
    questionBody: "אני מתחיל מהרעיון עצמו כדי לא לקפוץ מוקדם מדי למסכים.",
    answerDraft: "",
    isUnderstandingMode: false,
    summary: {
      understood: [],
      missing: ["מי המשתמש המרכזי"],
    },
    adaptiveOnboardingAgentContract: {
      statusLabel: "ה־adaptive intake agent מוגדר עכשיו כחוזה קנוני אחד",
      currentProjectTypeLabel: "מוצר SaaS",
      currentQuestionPathLabel: "core-idea -> active-question",
      handoffStatus: "needs-clarification",
      readinessLevel: "blocked",
      behaviors: [],
      explicitProhibitions: [],
    },
    providerRuntime: {
      selectedProviderId: "openai",
      selectedProviderLabel: "OpenAI",
      selectedRuntimeLabel: "OpenAI",
      selectedModelFamilyId: "balanced",
      selectedModelLabel: "מאוזן",
      selectedRuntimeModelId: "gpt-5",
      selectedIntelligenceLevel: "medium",
      selectedIntelligenceLabel: "בינונית",
      canonicalRuleLayer: "nexus-onboarding-rules-v1",
      summaryLine: "כרגע אני עובד איתך דרך OpenAI.",
      enforcementLine: "גם אם מחליפים מנוע שיחה, אני עדיין לא מתקדם לפני שהתמונה באמת ברורה.",
      accountingLine: "",
      availabilityLine: "Anthropic עדיין לא זמין כרגע.",
      operatorTruthLine: "health: standby · OpenAI: ready · Anthropic: ANTHROPIC_API_KEY",
      tradeoffLine: "מודל מאוזן · עומק בינונית · ברירת מחדל מאוזנת. איזון בין מהירות לעומק.",
      healthStatus: "standby",
      runtimeMode: "provider-backed-shell",
      availableProviders: [
        { providerId: "openai", companyLabel: "OpenAI", disabled: false },
        { providerId: "anthropic", companyLabel: "Anthropic", disabled: true, availabilityReason: "ANTHROPIC_API_KEY" },
      ],
      availableModelFamilies: [
        { modelFamilyId: "balanced", modelLabel: "מאוזן" },
      ],
      availableIntelligenceLevels: [
        { intelligenceLevelId: "medium", intelligenceLabel: "בינונית" },
      ],
    },
  });

  assert.match(html, /Anthropic \(לא זמין כרגע\)/);
  assert.match(html, /<option value="anthropic" disabled>/);
  assert.match(html, /Anthropic עדיין לא זמין כרגע/);
});
