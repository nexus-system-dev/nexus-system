import { renderNexusButton } from "../components/NexusButton.js";
import { renderNexusCard } from "../components/NexusCard.js";
import { renderNexusQaNav } from "../components/NexusQaNav.js";
import { renderNexusStepper } from "../components/NexusStepper.js";
import { renderWorkspaceLayout } from "../layouts/WorkspaceLayout.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const PRIMARY_SIDEBAR = [
  { title: "יצירה", href: "/create", target: "create", icon: "＋" },
  { title: "הבנה", href: "/onboarding", target: "onboarding", icon: "⌂" },
  { title: "לולאה", href: "/loop", target: "loop", icon: "▦" },
  { title: "ציר זמן", href: "/timeline", target: "timeline", icon: "◷" },
];

const SUPPORT_SIDEBAR = [
  { title: "בית", href: "/home", icon: "⌂" },
  { title: "קבצים", href: "/files", icon: "⌘" },
];

const ADVANCED_SIDEBAR = [
  { title: "Developer", href: "/developer", icon: "⌘" },
  { title: "מוח הפרויקט", href: "/brain", icon: "☷" },
  { title: "שחרורים", href: "/release", icon: "▤" },
  { title: "צמיחה", href: "/growth", icon: "↗" },
];

const FOOTER_SIDEBAR = [
  { title: "הגדרות", href: "/settings", icon: "⚙" },
  { title: "עזרה", href: "/help", icon: "?" },
];

const ROUTE_MODELS = {
  loop: {
    title: "מה עושים עכשיו",
    subtitle: "המשימה הבאה שלך",
    lead: "להכין ניסוי ראשון לרכישת משתמשים",
    note: "זה מצב QA זמני כדי לבדוק shell, כפתורים והיררכיה גם בלי פרויקט פעיל.",
    primaryCta: "בצע את המשימה ⚡",
    secondaryCta: "ראה הוכחה 👁",
  },
  execution: {
    title: "מבצעים את המשימה",
    subtitle: "המערכת פועלת לביצוע המשימה שלך 🚀",
    lead: "יוצר Landing page, מחבר טופס הרשמה ומכין מעקב ראשוני.",
    note: "מצב QA זמני עם סטטוסי ביצוע מדומים עד לחיבור המלא.",
    primaryCta: "הצג הוכחה כשמוכן ←",
    secondaryCta: "עצור ביצוע",
  },
  proof: {
    title: "הנה מה שבניתי",
    subtitle: "מצב QA זמני למסך proof עד החיבור הסופי ל־runtime.",
    lead: "נוצר תוצר ראשוני עם deliverables, מדדים, וקבצים לבדיקה.",
    note: "המסך נשאר עם המעטפת המאושרת של Figma גם כשאין עדיין proof backend מלא.",
    primaryCta: "המשך לאישור",
    secondaryCta: "פתח בדף חדש ↗",
  },
  confirmation: {
    title: "מה דעתך על התוצאה?",
    subtitle: "אישור או בקשת תיקון לפני שממשיכים לשלב הבא.",
    lead: "אפשר לאשר שהתוצאה טובה או לבקש דיוק נוסף.",
    note: "מצב QA זמני למסך confirmation עד החיבור ל־approval flow המלא.",
    primaryCta: "זה טוב, המשך",
    secondaryCta: "צריך שינויים",
  },
  "state-update": {
    title: "המצב עודכן",
    subtitle: "כך Nexus היה מסכם את שינוי המצב אחרי האישור.",
    lead: "המשימה סומנה כהושלמה והפרויקט התקדם לשלב הבא.",
    note: "מצב mock בטוח כדי לבדוק את הסיפור הוויזואלי של transition בין אישור למשימה הבאה.",
    primaryCta: "המשך למשימה הבאה",
    secondaryCta: "פתח את ציר הזמן",
  },
  "next-task": {
    title: "המשימה הבאה",
    subtitle: "Nexus בחר את הצעד הבא כדי לשמור על מומנטום.",
    lead: "להכין ניסוי מעקב קצר אחרי העלייה הראשונה לאוויר.",
    note: "מצב QA זמני למסך next task בלי תלות בהשלמת loop אמיתי.",
    primaryCta: "התחל משימה חדשה",
    secondaryCta: "למה דווקא זה?",
  },
  timeline: {
    title: "ציר הזמן של הפרויקט",
    subtitle: "כל מה שכבר קרה בפרויקט, כרונולוגית.",
    lead: "יצירת פרויקט → onboarding → understanding → loop → proof.",
    note: "מצב QA זמני למסך timeline עד ההטמעה המלאה של history.",
    primaryCta: "חזור לשלב הפעיל",
    secondaryCta: "פתח אבן דרך",
  },
};

function buildStepper(currentKey) {
  const understandingStatus = currentKey === "understanding" ? "active" : "inactive";
  const loopStatus = ["loop", "execution", "proof", "confirmation", "state-update", "next-task", "timeline"].includes(currentKey)
    ? "active"
    : "inactive";

  return renderNexusStepper([
    { label: "יצירה", status: "complete", glyph: "✓" },
    { label: "הכרת הפרויקט", status: "complete", glyph: "✓" },
    { label: "הבנה", status: understandingStatus },
    { label: "פעולה", status: loopStatus },
  ]);
}

export function renderQaFallbackScreen(routeKey) {
  const model = ROUTE_MODELS[routeKey] ?? ROUTE_MODELS.loop;
  const content = `
    <section class="nexus-qa-fallback-screen">
      <div class="nexus-qa-fallback-screen__stepper">
        ${buildStepper(routeKey)}
      </div>
      ${renderNexusQaNav(routeKey)}
      <div class="nexus-qa-fallback-screen__intro">
        <h1>${escapeHtml(model.title)}</h1>
        <p>${escapeHtml(model.subtitle)}</p>
      </div>
      <div class="nexus-qa-fallback-screen__grid">
        ${renderNexusCard({
          className: "nexus-qa-fallback-screen__lead-card",
          padding: "lg",
          content: `
            <strong class="nexus-qa-fallback-screen__eyebrow">QA preview override</strong>
            <h2>${escapeHtml(model.lead)}</h2>
            <p>${escapeHtml(model.note)}</p>
            <div class="nexus-qa-fallback-screen__actions">
              ${renderNexusButton({ label: model.secondaryCta, variant: "secondary", attrs: { "data-nexus-ui-qa-target": routeKey } })}
              ${renderNexusButton({ label: model.primaryCta, variant: "primary", attrs: { "data-nexus-ui-qa-target": routeKey } })}
            </div>
          `,
        })}
        ${renderNexusCard({
          className: "nexus-qa-fallback-screen__meta-card",
          padding: "md",
          content: `
            <h3>Safe mock state fallback</h3>
            <ul class="nexus-qa-fallback-screen__list">
              <li>אין צורך בפרויקט אמיתי כדי לפתוח את המסך.</li>
              <li>ה־CTA נשארים נראים כמו במסך המאושר.</li>
              <li>המצב הזה זמני לבדיקה ולא מחליף את ה־runtime האמיתי.</li>
            </ul>
          `,
        })}
      </div>
    </section>
  `;

  return renderWorkspaceLayout({
    sidebar: {
      currentRoute: routeKey === "timeline" ? "/timeline" : "/loop",
      primary: PRIMARY_SIDEBAR,
      support: SUPPORT_SIDEBAR,
      advanced: ADVANCED_SIDEBAR,
      footer: FOOTER_SIDEBAR,
    },
    topbar: { projectName: "QA mode", avatar: "Q" },
    content,
  });
}
