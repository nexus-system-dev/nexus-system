# Real Agent Layer Contract

תאריך: `2026-05-28`  
סטטוס: `trueGreen contract`  
משימה: `AGT-001A`

## Canonical Decision

`AGT-001A` נוצר כדי לעצור סגירה מזויפת של ה־front door דרך מנוע `intake` ישן.

ה־front door של Nexus חייב להיות שכבת סוכנים אמיתית:

```txt
Project Discovery Agent -> Product Skeleton Agent -> Build / Loop Agent
```

לא:

- onboarding screen
- form
- chatbot wrapper
- agent-looking card
- improved intake engine
- gate fixes over the old intake system

החוק הקנוני:

```txt
The Nexus front door is a role-defined multi-agent system.
It is not an onboarding screen, not a form, not a chatbot wrapper,
and not an improved intake engine.
```

## 1. Project Discovery Agent

### Role

לקבל את המשתמש דרך שיחה חופשית ולהפוך רעיון לא ברור ל־product understanding קנוני.

### Skill

- להבין רעיון חופשי
- לדלות פרטים לפי קטגוריות מוצר
- לזהות חוסרים, סתירות והנחות חלשות
- לשאול המשך בצורה חכמה
- לשמור הקשר לאורך כמה turns
- לדעת מתי יש מספיק אמת מוצרית כדי להתקדם

### Conversation Policy

- שיחה טבעית, לא שאלון
- שאלה אחת או מעט שאלות בכל פעם
- לא להכריח סדר שדות קשיח
- לא להעמיד פנים שיש מספיק אמת כשהרעיון עדיין עמום
- לא להמשיך discovery כבד כשכבר יש מספיק אמת לשלד ראשון

### Behavior Policy vs Scripted Copy

Nexus לא מכתיבה לסוכן משפטים מוכנים לשיחה המרכזית.

Nexus כן מגדירה:

- מה התפקיד של הסוכן
- אילו קטגוריות מוצר חייבים להבין
- מה צריך לבדוק לפני התקדמות
- מתי לשאול עוד
- מתי לא לשאול עוד
- מתי קיימת מספיק אמת מוצרית
- מה חייב לעבור לסוכן הבא

הסוכן עצמו חייב לנסח את התשובה למשתמש לפי השיחה בפועל.

כלומר:

- לא: `תגיד למשתמש את המשפט הזה`
- כן: `החזר למשתמש במילים טבעיות את מי המשתמש, מה הכאב, מה הזרימה הראשונה, ומה עדיין חסר אם חסר`

משפטים קשיחים מותרים רק למצבי תקלה, ספק לא זמין, או מצב ריק ראשוני.

בשיחה המרכזית:

- אסור לסגור `AGT-001` דרך החלפת copy
- אסור לסגור `AGT-001` דרך תבנית שמתחזה להבנה
- אסור לסגור `AGT-001` אם הסוכן לא מנסח תשובה מתוך ההקשר והשיחה

Canonical rule:

```txt
Nexus defines the Project Discovery Agent role and behavior.
The agent composes the user-facing response from the actual conversation.
```

### Memory / Context Ownership

הסוכן מחזיק:

- user intent
- product category assumptions
- target actor
- core problem
- workflow spine
- constraints
- open questions
- confidence / readiness

מנוע ה־intake יכול לשמור את זה, אבל לא להחליט במקום הסוכן.

### Decisions

הסוכן מחליט:

- מה כבר ברור
- מה חסר
- איזו שאלה לשאול עכשיו
- האם יש מספיק product truth
- האם להעביר ל־Product Skeleton Agent

### Must Not Do

- לא לבנות UI בעצמו
- לא להחליף את Product Skeleton Agent
- לא להחליף את Build / Loop Agent
- לא להפוך את מנוע ה־intake הישן ל־brain שלו
- לא להיסגר דרך completion gates בלבד

### Enough Product Truth

יש מספיק אמת מוצרית כשקיימים לפחות:

- core idea
- primary actor
- core problem / pain
- first workflow spine
- intended outcome
- enough constraints to avoid a generic product

## 2. Product Skeleton Agent

### Role

לקבל `project understanding` מה־Discovery Agent ולהפוך אותו לשלד מוצר קנוני ראשון.

### Input

- canonical project understanding
- missing/open questions
- readiness signal
- confidence notes
- first workflow spine

### Output

`canonical product skeleton` הכולל:

- product name / working title
- product promise
- primary actor
- core problem
- first workflow
- main surface candidate
- first entities
- first actions
- first artifact expectation
- open unknowns
- assumptions

### Open / Unknown

השלד חייב לסמן במפורש:

- מה ידוע
- מה הנחה
- מה פתוח
- מה לא חוסם build ראשון

## 3. Build / Loop Agent

### Role

לקבל שלד מוצר ולהפוך אותו לכיוון בנייה ראשון בתוך Nexus Loop.

### Input

- canonical product skeleton
- first workflow
- surface candidate
- artifact expectation
- open assumptions

### Output

- first build slice
- executable build direction
- first task
- first skeleton/artifact surface
- continuation context for the next turn

### Loop Handoff

ה־handoff ל־Loop קורה רק אחרי:

- Discovery Agent סימן enough product truth
- Product Skeleton Agent יצר skeleton קנוני
- Build / Loop Agent קיבל skeleton והפיק first build direction

## 4. Agent-To-Agent Handoff Contract

### Passed Between Agents

- structured understanding
- confidence/readiness
- open questions
- assumptions
- first workflow
- skeleton fields
- build direction

### Required Proof

כל handoff חייב להוכיח:

- מי הסוכן שמעביר
- מה הוא הבין
- למה מותר להתקדם
- מה נשאר פתוח
- מה הסוכן הבא אמור לעשות

### Persisted State

- conversation turns
- project understanding
- skeleton
- handoff records
- first task
- continuity context

### Visible To User

- שיחה עם Nexus
- הבנה קצרה של מה Nexus הבינה
- שאלה חכמה כשצריך
- שלד ראשון כשיש מספיק אמת
- מעבר טבעי ל־Build/Loop

### Internal Only

- provider choice
- intake persistence details
- gate internals
- agent routing internals
- scoring/confidence internals

## 5. Boundary From Old Intake Engine

מנוע ה־intake הישן מותר לשימוש עבור:

- persistence
- sessions
- restore
- summaries
- compatibility
- continuity fallback

אבל:

```txt
The intake engine is storage/support infrastructure.
It is not the agent brain.
```

אסור:

- לסגור `AGT-001` דרך gate fixes בלבד
- לתת ל־intake completion להחליט במקום Agent policy
- להתייחס ל־chat UI כסוכן
- להתייחס ל־summary card כ־agentic behavior
- לבנות `SURF-001` לפני שיש חוזה agent layer ברור

## 6. Done Criteria

`AGT-001A` יכול להיסגר רק כשיש:

- מיקום ברור בקוד/קנון ל־Project Discovery Agent role
- conversation policy מוגדרת
- decision policy מוגדרת
- Product Skeleton Agent contract מוגדר
- Build / Loop Agent handoff מוגדר
- agent-to-agent handoff payload מוגדר
- גבול ברור מול מנוע ה־intake הישן
- בדיקה או contract test שמוכיחים שה־intake engine אינו ה־agent brain

## 7. Current Status

`AGT-001A` סגור כ־contract.

`AGT-001` אינו סגור כ־`trueGreen` אם השיחה המרכזית נשענת על משפטי copy קשיחים במקום על תשובת סוכן שמנוסחת מתוך ההקשר.

`AGT-001C` נדרש לפני `SURF-001` כדי לנעול את מדיניות ההתנהגות של הסוכן ולהוכיח שה־front door אינו רק החלפת ניסוח מעל מנוע intake ישן.

## 8. Code Contract And Verification

החוזה קיים גם בקוד:

- `/Users/yogevlavian/Desktop/The Nexus/src/core/real-agent-layer-contract.js`

בדיקת חוזה:

- `/Users/yogevlavian/Desktop/The Nexus/test/real-agent-layer-contract.test.js`

הבדיקה מוכיחה:

- שרשרת `Project Discovery Agent -> Product Skeleton Agent -> Build / Loop Agent`
- לכל סוכן יש אחריות החלטה משלו
- מנוע ה־intake מותר רק לתמיכה ושמירה
- מנוע ה־intake אסור כ־`agent brain`

Verification:

```txt
node --check src/core/real-agent-layer-contract.js
node --test test/real-agent-layer-contract.test.js
node --check web/shared/project-discovery-agent.js && node --check web/app.js && node --test test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js test/real-agent-layer-contract.test.js test/onboarding-service-conversation.test.js
```
