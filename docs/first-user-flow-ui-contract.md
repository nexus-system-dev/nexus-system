# First User Flow UI Contract

## Purpose

המסמך הזה מגדיר בצורה מפורשת איך הפלואו הראשון של המשתמש אמור להיראות ולהתנהג בדפדפן, ואיזה גיבוי חייב להיות לו בבקאנד.

הוא נועד למנוע מצב שבו:
- יש endpoint אבל אין חוויה ברורה
- יש כפתור אבל לא ברור מה אמור לקרות בלחיצה
- יש flow מחובר טכנית אבל המשתמש מרגיש שלא קרה כלום

המסמך הזה הוא source-of-truth ל־UX-visible behavior עבור:

`onboarding -> project state -> next task -> approval/review -> rerun cycle`

## Scope

בתוך הסקופ:
- ה־existing cockpit/app path בלבד
- ה־existing onboarding / project / run-cycle / approval paths בלבד
- הגדרה מפורשת של מסכים, אזורים, כפתורים, transitions, blocked states ו־loading states

מחוץ לסקופ:
- endpoint חדש
- orchestration חדש
- execution loop חדש
- real upload pipeline
- scanner handoff
- flow חדש מחוץ ל־existing cockpit/app path

## Current Validation Status

סטטוס נוכחי של ה־`v1 first user flow`:
- `usable`

המסלול שאושר ונבדק בדפדפן:
- `Create Project`
- `Onboarding conversation`
- `AI working memory`
- `Finish onboarding`
- `Workspace landing`
- `Run-cycle continuity`
- `Return to Create Project`
- `Reopen onboarding`

פסק הדין הנוכחי:
- אין כרגע שלב `Broken` בתוך המסלול הזה
- המסלול usable בתוך ה־existing cockpit/app path
- זהו `v1 flow`, לא סוף הדרך של הכניסה למוצר כולו

## Contract Format

לכל שלב ב־flow ננעל:
- `User goal`
- `Visible sections`
- `Primary action`
- `Secondary actions`
- `What happens on click`
- `Backend dependency`
- `Success state`
- `Blocked state`
- `Error state`
- `Not acceptable`

---

## 1. Empty State

### User goal

להבין שאין עדיין פרויקט, ולהתחיל את יצירת הפרויקט הראשון בלי ambiguity.

### Visible sections

- כותרת ברורה שמסבירה שאין עדיין פרויקט
- הסבר קצר מה הפעולה הבאה
- טופס קצר להתחלת יצירת הפרויקט
- CTA ראשי אחד ברור

### Primary action

- כפתור: `צור פרויקט`

### Secondary actions

- אין חובה לפעולות משניות בשלב הזה

### What happens on click

בלחיצה על `צור פרויקט`:
- המערכת יוצרת `project draft`
- המערכת פותחת `onboarding session`
- המשתמש עובר באופן ברור לשלב onboarding

### Backend dependency

- `POST /api/project-drafts`
- `POST /api/onboarding/sessions`

### Success state

- המשתמש לא נשאר באותו מצב empty state כאילו לא קרה כלום
- יש transition ברור למסך onboarding
- ברור שהפרויקט הראשוני נפתח ושהמשתמש עבר לשלב הבא

### Blocked state

- אם אי אפשר ליצור draft או session:
  - מוצגת הודעה ברורה באזור המרכזי של המסך
  - המשתמש מבין אם צריך לנסות שוב או לתקן משהו

### Error state

- הודעת שגיאה בולטת ולא טקסט שקט שקל לפספס

### Not acceptable

- dashboard טכני ריק בלי הכוונה
- אותו מסך בדיוק בלי שום תחושת התקדמות
- CTA שקיים אבל לא ברור מה יקרה אחרי הלחיצה

---

## 2. Transition To Onboarding

### User goal

להבין שעבר משלב יצירת הפרויקט לשלב onboarding אמיתי שבו המערכת לומדת מה הוא רוצה לבנות.

### Visible sections

- כותרת חדשה וברורה של onboarding
- אזור שיחה / דיאלוג עם AI
- אזור נלווה של notes / מה המערכת כבר הבינה
- CTA ברור להמשך / סיום onboarding

### Primary action

- תחילת דיאלוג onboarding
- אחר כך: `סיים Onboarding`

### Secondary actions

- המשך שיחה / הבהרה
- עריכת תשובות קיימות

### What happens on click

אחרי `צור פרויקט`:
- ה־UI חייב להשתנות בצורה ברורה
- טופס יצירת הפרויקט הראשוני לא נשאר כ־main screen
- המשתמש רואה onboarding screen נפרד או מצב onboarding מובחן בבירור

### Backend dependency

- `POST /api/project-drafts`
- `POST /api/onboarding/sessions`
- `PATCH /api/onboarding/sessions/:id/intake`
- `POST /api/onboarding/sessions/:id/files`
- `POST /api/onboarding/sessions/:id/finish`

### Success state

- ברור למשתמש שהוא עכשיו בתוך onboarding
- ברור שה־AI אוסף ומבנה את ההבנה על הפרויקט
- יש תחושת התקדמות בין שלבים

### Blocked state

- אם חסר מידע:
  - ה־UI מציג מה חסר
  - ההודעה נמצאת באזור המרכזי של ה־onboarding
  - לא רק status קטן שקל לפספס

### Error state

- אם request נכשל:
  - מוצג state ברור של כשל
  - המשתמש מבין אם צריך לנסות שוב או להשלים שדה חובה

### Not acceptable

- להישאר באותם שדות של יצירת הפרויקט ורק להחליף טקסט כפתור
- onboarding שנראה כמו אותו טופס עם copy אחר
- אין distinction ברור בין `create project` לבין `onboarding`
- אין representation גלוי של מה ה־AI כבר הבין

---

## Open Questions For Next Sections

הסעיפים הבאים לנעילה:
- איך נראית השיחה עצמה עם ה־AI
- האם notes של ה־AI גלויים תוך כדי או רק כסיכום מצטבר
- איך בדיוק נראה `finish onboarding`
- איך נראה המסך הראשון אחרי פתיחת project/workspace
- איך מוצגים:
  - `מה המצב עכשיו`
  - `החסם המרכזי`
  - `next task`
  - `recommendation`
