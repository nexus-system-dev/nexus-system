const VISIBLE_SHELL_REPLACEMENTS = [
  [/\bQA preview override\b/gi, "תצוגת בדיקה זמנית"],
  [/\bQA mode\b/gi, "תצוגת בדיקה"],
  [/\bBuild progression\b/gi, "התקדמות הבנייה"],
  [/\bClass-aware evolution\b/gi, "התפתחות לפי סוג המוצר"],
  [/\bLocal workspace contract\b/gi, "רצף עבודה מקומי"],
  [/\bDesktop shell scope\b/gi, "עבודה מקומית"],
  [/\bRuntime path\b/gi, "מסלול הרצה"],
  [/\bPackaging \/ preview contract\b/gi, "הכנה לתצוגה ושיתוף"],
  [/\bReleaseable state\b/gi, "מוכנות לשיתוף"],
  [/\bDeployment \/ release path\b/gi, "מסלול שחרור"],
  [/\bDeployment feedback\b/gi, "מצב השחרור"],
  [/\bLearning decision impact\b/gi, "השפעת הלמידה על ההמשך"],
  [/\bGrowth boundary\b/gi, "גבולות הצעות הצמיחה"],
  [/\bPost-release continuation\b/gi, "המשך אחרי שחרור"],
  [/\bProof\b/gi, "בדיקה"],
  [/\bLoop\b/gi, "בנייה"],
  [/\bTimeline\b/gi, "היסטוריה"],
  [/\bExecution\b/gi, "ביצוע"],
  [/\bState Update\b/gi, "עדכון מצב"],
  [/\bNext Task\b/gi, "הצעד הבא"],
  [/\bCreate\b/gi, "יצירה"],
  [/\bConfirmation\b/gi, "אישור"],
  [/\bOrchestration\b/gi, "תיאום"],
  [/\borchestration\b/gi, "תיאום"],
  [/\bpipeline\b/gi, "רצף עבודה"],
  [/\bruntime\b/gi, "הרצה"],
  [/\bworker\b/gi, "תהליך רקע"],
  [/\bqueue\b/gi, "רשימת המשך"],
  [/\bhandoff\b/gi, "המשך מסודר"],
  [/\broute restore\b/gi, "חזרה לאותו מקום"],
  [/\broute\b/gi, "מסך"],
  [/\bWave 4\b/gi, "Nexus"],
  [/\bcheckId\b/gi, "בדיקה"],
  [/\brelease evidence\b/gi, "בדיקת שחרור"],
  [/->/g, "→"],
  [/לולאה/g, "בנייה"],
  [/ציר זמן/g, "היסטוריה"],
  [/מצב QA/g, "תצוגת בדיקה"],
  [/תצוגת QA/g, "תצוגת בדיקה"],
  [/מסלול בדיקה/g, "תצוגת בדיקה"],
  [/blocked state/gi, "מצב המתנה"],
  [/shell הקנוני/g, "מרחב העבודה"],
  [/\bURL\b/g, "הכתובת הנוכחית"],
  [/\s*first artifact\s*/gi, " "],
  [/\bnexus\.preview\b/gi, "תצוגת מוצר"],
  [/\bPRO-SKEL-[0-9]+\b/gi, "בדיקת איכות מוצר"],
  [/\bSLICE-[0-9]+\b/gi, "בדיקת מוצר"],
];

export function sanitizeVisibleShellCopy(value) {
  let text = String(value ?? "");
  for (const [pattern, replacement] of VISIBLE_SHELL_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

export function escapeVisibleShellCopy(value) {
  return sanitizeVisibleShellCopy(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
