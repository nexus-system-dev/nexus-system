import test from "node:test";
import assert from "node:assert/strict";

import { renderUnderstandingSummaryScreen } from "../web/nexus-ui/screens/UnderstandingSummaryScreen.js";

test("understanding summary screen renders learning-aware generation card when present", () => {
  const html = renderUnderstandingSummaryScreen({
    projectName: "Clinic Landing",
    title: "זה מה שהבנתי",
    subtitle: "ניתחתי את השיחה שלנו והפקתי את המרכיבים המרכזיים.",
    detail: "מה אנחנו מכוונים לבנות עכשיו: Clinic Landing landing page.",
    whyItMatters: "ההבנה הזו היא הבסיס לכל החלטה שנקבל בהמשך.",
    confidenceLabel: "רמת ביטחון גבוהה על בסיס שיחת ה־onboarding",
    cards: [
      { label: "קהל יעד", icon: "👥", title: "מאמנים", body: "קהל היעד ברור." },
      { label: "הבעיה", icon: "⚠️", title: "אין המרות", body: "הבעיה חדה." },
      { label: "הפתרון", icon: "💡", title: "דף חד", body: "הפתרון חד." },
      { label: "מטרת ההצלחה", icon: "🎯", title: "לייצר פניות", body: "המטרה ברורה." },
    ],
    generationLearningCard: {
      badge: "כיוון generation חי",
      title: "Clinic Landing landing page",
      body: "הלמידה מזיזה את ה־generation לייצוב לפני הרחבה.",
      proofLine: "ה־Proof הבא צריך להוכיח שהבטחת הערך והאמון כבר יציבים לפני הרחבת המסר.",
      focusAreas: [
        "לחזק את הוכחת הערך לפני הרחבת המסר",
        "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
      ],
    },
  });

  assert.match(html, /איך Nexus עומדת לבנות את זה עכשיו/);
  assert.match(html, /כיוון generation חי/);
  assert.match(html, /ה־Proof הבא צריך להוכיח/);
});
