import test from "node:test";
import assert from "node:assert/strict";

import { renderUnderstandingSummaryScreen } from "../web/nexus-ui/screens/UnderstandingSummaryScreen.js";

test("understanding summary screen renders learning-aware generation card when present", () => {
  const html = renderUnderstandingSummaryScreen({
    projectName: "Clinic Landing",
    title: "בוא נוודא שאני איתך על אותו הדבר",
    subtitle: "יש לי כבר תמונה די טובה של דף נחיתה / שיווק. אלה ארבע הנקודות שעליהן אני נשען כרגע.",
    detail: "מה אנחנו מכוונים לבנות עכשיו: Clinic Landing landing page.",
    whyItMatters: "ההבנה הזו היא הבסיס לכל החלטה שנקבל בהמשך.",
    confidenceLabel: "יש לי כבר תמונה די יציבה של מה צריך להיבנות עכשיו",
    cards: [
      { label: "קהל יעד", icon: "👥", title: "מאמנים", body: "קהל היעד ברור." },
      { label: "הבעיה", icon: "⚠️", title: "אין המרות", body: "הבעיה חדה." },
      { label: "הפתרון", icon: "💡", title: "דף חד", body: "הפתרון חד." },
      { label: "מטרת ההצלחה", icon: "🎯", title: "לייצר פניות", body: "המטרה ברורה." },
    ],
    generationLearningCard: {
      badge: "הכיוון שכבר מתחיל להיסגר",
      title: "Clinic Landing landing page",
      body: "הלמידה מזיזה את ה־generation לייצוב לפני הרחבה.",
      proofLine: "ה־Proof הבא צריך להוכיח שהבטחת הערך והאמון כבר יציבים לפני הרחבת המסר.",
      focusAreas: [
        "לחזק את הוכחת הערך לפני הרחבת המסר",
        "לייצב את אזור האמון לפני פתיחת וריאציות נוספות",
      ],
    },
  });

  assert.match(html, /מה נראה מיד אחר כך/);
  assert.match(html, /עוצרים רגע כדי ליישר קו/);
  assert.match(html, /למה אני עוצר על זה רגע/);
  assert.match(html, /הכיוון שכבר מתחיל להיסגר/);
  assert.match(html, /ה־Proof הבא צריך להוכיח/);
});
