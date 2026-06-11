# Nexus Project Discovery Agent Front Door Contract

תאריך: `2026-05-27`  
סטטוס: `canonical product-gap contract`  
משימה: `AGT-001`

## Purpose

להגדיר קנונית שחוויית הכניסה הסופית של Nexus אינה שאלון, fixed intake flow, או מסך onboarding ישן.

ה־front door הסופי של Nexus הוא:

```txt
Project Discovery Agent
```

כלומר סוכן שיחה חופשי, Nexus-native, שמבין את הרעיון של המשתמש, מזהה חורים, שואל המשך רק כשצריך, ובונה הבנת פרויקט קנונית שמזינה את ה־Nexus Loop.

## Canonical Clarification

לא פותחים מחדש את `SHL-002`.

`SHL-002` סגר אמת אחת בלבד:

```txt
onboarding is not a standalone visible route
```

הוא לא טען שה־intake engine הקיים הוא חוויית ה־onboarding הסופית.

## Product Gap

ה־intake engine הקיים נשמר כתשתית נסתרת, אבל הוא אינו ה־UX הסופי הרצוי.

הפער:

```txt
The final Nexus front door is an agentic discovery conversation, not a questionnaire.
```

זהו פער מוצרי מרכזי, לא polish.

## Desired Final Experience

החוויה הרצויה:
- המשתמש מדבר חופשי כמו בצ׳אט אמיתי
- הסוכן מחזיק role ברור: להבין את הרעיון ולהפוך אותו לפרויקט ברור
- הסוכן שואל follow-up רק כשחסר משהו שמשנה את המוצר
- הסוכן מזהה missing information, contradictions, weak assumptions, product gaps
- הסוכן בונה canonical project understanding
- הסוכן לא מרגיש כמו `step 1 / step 2 / step 3`
- הסוכן מוסר ל־Nexus Loop משימה ראשונה משמעותית

## Temporary Hidden Infrastructure

מנוע ה־intake הישן יכול להישאר זמנית מאחורי הקלעים עבור:
- persistence
- sessions
- summaries
- compatibility
- handoff
- restore / continuity
- fallback during migration

אסור למחוק אותו לפני שהסוכן החדש מוכיח כיסוי מלא.

## Required Coverage Before Replacement

`AGT-001` לא נסגר עד שה־Project Discovery Agent מוכיח:
- free-flowing conversational discovery
- durable first user message
- adaptive follow-up questions
- gap / contradiction detection
- canonical project understanding output
- project/session creation or bootstrap
- loop handoff with first meaningful task
- refresh / return continuity
- no duplicate turns on retry
- no leakage from old project truth into new discovery

## Relationship To Existing Wave 4 Contract

המשימה הזו ממשיכה את:

- [wave4-conversation-first-entry-foundation-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-conversation-first-entry-foundation-contract.md)

`W4-AGENT-005A` הגדיר foundation.

`AGT-001` הוא ה־implementation blocker הקנוני בתוך task map החדש.

## Explicit Non-Goals For This Write-Back

בשלב הרישום הזה:
- לא מממשים את הסוכן
- לא מוחקים את ה־intake engine
- לא פותחים מחדש את `SHL-002`
- לא משנים route behavior נוסף
- לא הופכים generic chat למסך ברירת מחדל בלי proof

## Closure Rule

`AGT-001` ייסגר רק כאשר:
- Project Discovery Agent קיים כחוויית front door אמיתית
- הוא מחובר ל־hidden intake/session/project truth
- הוא מפיק project understanding קנוני
- הוא מוסר ל־Nexus Loop משימה ראשונה
- הוא verified ב־live flow
- ה־old rigid intake behavior כבר לא נדרש כחוויית ברירת מחדל
