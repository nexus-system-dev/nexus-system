import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectCreateViewModel } from "../web/nexus-ui/adapters/project-adapter.js";
import { renderProjectCreateScreen } from "../web/nexus-ui/screens/ProjectCreateScreen.js";

test("project create screen renders a Nexus-native conversation-first front door", () => {
  const html = renderProjectCreateScreen(buildProjectCreateViewModel({
    draftInputs: {
      visionText: "",
    },
    statusMessage: "כתוב חופשי. נמשיך משם.",
  }));

  assert.match(html, /Nexus/);
  assert.match(html, /מה אתה רוצה לבנות/);
  assert.doesNotMatch(html, /Project Discovery Agent/);
  assert.doesNotMatch(html, /סוכן גילוי הפרויקט/);
  assert.doesNotMatch(html, /ספר לי חופשי מה אתה רוצה לבנות/);
  assert.match(html, /כתוב מה אתה רוצה לבנות/);
  assert.doesNotMatch(html, /כתוב הודעה לסוכן הגילוי של Nexus/);
  assert.doesNotMatch(html, /גרור קבצים לתוך השיחה או לחץ על \+/);
  assert.match(html, /data-agent-response-source="no-agent-response"/);
  assert.doesNotMatch(html, /פרטים מתקדמים למי שרוצה לדייק לפני השלד הראשון/);
  assert.doesNotMatch(html, /מה אני מבין עד עכשיו|מה אני עוד צריך ממך|מה עלול להפיל את זה|מה אבנה ראשון/);
  assert.doesNotMatch(html, /איך לפתוח חזק/);
  assert.doesNotMatch(html, /step 1|step 2|שאלה 1|שאלה 2|שאלה 3/i);
});

test("ID-001 create screen shows local identity and persistence boundary", () => {
  const html = renderProjectCreateScreen(buildProjectCreateViewModel({
    draftInputs: {
      visionText: "כלי לניהול לידים",
    },
    identity: {
      userId: "user-local-1",
      displayName: "משתמש בדיקה",
      mode: "local-user",
      status: "active",
      label: "שמירה מקומית פעילה",
      boundary: "הפרויקט יישמר תחת המשתמש המקומי הזה ויישאר זמין אחרי רענון בדפדפן הזה.",
      canLogout: true,
    },
  }));

  assert.match(html, /data-identity-task="ID-001"/);
  assert.match(html, /data-identity-mode="local-user"/);
  assert.match(html, /data-identity-status="active"/);
  assert.match(html, /data-identity-user-id="user-local-1"/);
  assert.match(html, /שמירה מקומית פעילה/);
  assert.match(html, /יישאר זמין אחרי רענון/);
  assert.match(html, /יציאה ממצב מקומי/);
});

test("project create screen can show live skeleton handoff progress without fake skeleton output", () => {
  const html = renderProjectCreateScreen(buildProjectCreateViewModel({
    draftInputs: {
      projectName: "Lead follow-up",
      visionText: "כלי פנימי לניהול לידים עם אחראי ותזכורת",
    },
    statusMessage: "מכין שלד חי ראשון. אעבור למסך הבנייה רק אחרי שהמסך החזותי חוזר.",
    onboardingConversation: {
      transcript: [
        { id: "u1", speaker: "user", text: "כלי פנימי לניהול לידים עם אחראי ותזכורת" },
        {
          id: "a1",
          speaker: "ai",
          text: "אני מעדכן ומכין שלד ראשוני למוצר.",
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
  }));

  assert.match(html, /מכין שלד חי ראשון/);
  assert.match(html, /אעבור למסך הבנייה רק אחרי שהמסך החזותי חוזר/);
  assert.match(html, /אני מעדכן ומכין שלד ראשוני למוצר/);
  assert.doesNotMatch(html, /data-product-skeleton-task="SKEL-001"/);
  assert.doesNotMatch(html, /data-visual-skeleton-task="VSKEL-001"/);
});
