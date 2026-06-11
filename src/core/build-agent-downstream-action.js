function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasPattern(message, patterns = []) {
  const normalized = normalizeString(message).toLowerCase();
  return patterns.some((pattern) => pattern.test(normalized));
}

export function resolveBuildAgentDownstreamAction({
  buildAgentTurn = null,
  message = "",
} = {}) {
  const turn = normalizeObject(buildAgentTurn);
  const text = normalizeString(message, "");

  if (turn.requiresApproval === true || turn.status === "blocked-or-approval-required") {
    return {
      shouldApply: false,
      status: "approval-or-boundary-required",
      reason: "הבקשה דורשת אישור או חסימה לפני שינוי מוצר.",
    };
  }

  if (
    turn.owner === "mutation-change-agent"
    && hasPattern(text, [/הוסף ליד|תוסיף ליד|ליד חדש|new lead|add lead|record/])
  ) {
    return {
      shouldApply: true,
      owner: "mutation-change-agent",
      operationId: "record.create",
      payload: {
        name: "ליד חדש מבדיקה",
        status: "פתוח",
        owner: "ללא אחראי",
        reminder: "היום",
        nextStep: "לחזור לשיחה",
      },
      visibleSummary: "נוסף ליד זמני לשלד ונשמר כחלק מאמת הפרויקט.",
    };
  }

  if (
    turn.owner === "mutation-change-agent"
    && hasPattern(text, [/מקור ליד|שדה מקור|source field|lead source|מקור/])
  ) {
    return {
      shouldApply: true,
      owner: "mutation-change-agent",
      operationId: "record.addField",
      payload: {
        fieldName: "מקור ליד",
        defaultValue: "לא סומן",
      },
      visibleSummary: "נוסף שדה מקור ליד לשלד ולרשומות הדוגמה.",
    };
  }

  if (
    turn.owner === "mutation-change-agent"
    && hasPattern(text, [/אחראי|owner|שייך|assign/])
  ) {
    return {
      shouldApply: true,
      owner: "mutation-change-agent",
      operationId: "record.assignOwner",
      payload: {
        recordId: "rec-1",
        owner: "נועה",
      },
      visibleSummary: "האחראי של הרשומה הראשונה עודכן בשלד.",
    };
  }

  if (
    turn.owner === "mutation-change-agent"
    && hasPattern(text, [/סטטוס|status|בטיפול|בוצע/])
  ) {
    return {
      shouldApply: true,
      owner: "mutation-change-agent",
      operationId: "record.updateStatus",
      payload: {
        recordId: "rec-1",
        status: "בטיפול",
      },
      visibleSummary: "סטטוס הרשומה הראשונה עודכן בשלד.",
    };
  }

  if (
    turn.owner === "visual-build-agent"
    && hasPattern(text, [/כרטיס|כרטיסים|cards|מעקב היום|חזרה היום|follow.?up|לקוחות חמים|לידים חמים/])
  ) {
    return {
      shouldApply: true,
      owner: "visual-build-agent",
      actionKind: "visual-build",
      operationId: "visual.leads.cardsFollowupToday",
      payload: {
        affectedScreen: "מסך לידים",
        affectedRegion: "lead-cards-and-follow-up",
      },
      visibleSummary: "רשימת הלידים הפכה לכרטיסים ונוסף אזור חזרה היום.",
    };
  }

  if (
    turn.owner === "visual-build-agent"
    && hasPattern(text, [/סלאש|splash|פתיחה|מסך פתיחה|שם האפליקציה|app name/])
  ) {
    return {
      shouldApply: true,
      owner: "visual-build-agent",
      actionKind: "visual-build",
      operationId: "visual.screen.addSplash",
      payload: {
        affectedScreen: "מסך פתיחה",
        affectedRegion: "splash-screen",
      },
      visibleSummary: "נוסף מסך פתיחה חזותי לשלד הריצה.",
    };
  }

  return {
    shouldApply: false,
    status: "routed-only",
    reason: "הבקשה נותבה, אבל אין עדיין פעולת שינוי בטוחה להפעלה אוטומטית.",
  };
}
