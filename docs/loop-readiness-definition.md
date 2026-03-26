# Loop Readiness Definition

המטרה של המסמך הזה היא להגדיר בצורה קשיחה מה נחשב `loop מלא אמיתי` ב־Nexus.

ההגדרה הזאת נועדה למנוע מצב שבו planner, simulation, derived state או flow חלקי ייחשבו בטעות כלופ עובד.

## ההגדרה

`loop מלא` קיים רק אם כל השלבים הבאים מתרחשים בפועל:

1. מתקבל `project intake` אמיתי דרך `Onboarding Engine`
2. נבנה `Project State` תקף
3. נטענות או מיוצרות `tasks` אמיתיות דרך bootstrap / templates / graph
4. `Execution Graph` או `Scheduler` בוחר `next task` אמיתי
5. המערכת מבצעת פעולה אמיתית דרך `execution path`
6. מתקבל `executionResult` אמיתי מהפעולה
7. `Task Result Ingestion` קולט את התוצאה
8. `Project State` ו־`Execution Graph` מתעדכנים לפי התוצאה
9. המערכת מחזירה `explanation` של:
   - מה בוצע
   - מה השתנה
   - מה המשימה הבאה

## מה נחשב execution אמיתי

רק פעולה אמיתית דרך execution surface נחשבת.

דוגמאות:
- `shell command`
- פעולת `git`
- יצירת קובץ
- עריכת קובץ
- `build`
- פעולה אמיתית אחרת שמשנה את העולם מחוץ לשכבת התכנון

## מה לא נחשב loop

הדברים הבאים לא נחשבים:
- planner בלבד
- simulation
- derived state
- task selection בלי ביצוע אמיתי
- result מחושב בלי פעולה אמיתית

## כלל הדיווח

אם יש `loop מלא`, מחזירים:

`LOOP_READY: YES`

ובקצרה:
- ה־flow שנבדק
- ה־input
- הפעולה האמיתית שבוצעה
- ה־result
- איך ה־state התעדכן

אם אין `loop מלא`:
- לא מחזירים כלום
- לא מפריעים לפיתוח

## משפט ההכרעה

`loop` מתחיל באמת רק ברגע שיש:

`פעולה אמיתית + תוצאה אמיתית + עדכון אמיתי`
