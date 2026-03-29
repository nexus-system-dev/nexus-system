# V1 Bug Validation

מטרת הקובץ:
- לרכז באגים, חוסרים ורגרסיות שמתגלים בזמן בדיקת `v1`
- להפריד בין `backlog` של פיתוח עתידי לבין בעיות שמונעות שחרור או בדיקת מציאות תקינה

## סטטוסים

- `פתוח` - זוהה ועדיין לא טופל
- `בטיפול` - נמצא בעבודה
- `נפתר` - תוקן ואומת
- `לא לחסימה` - קיים, אבל לא חוסם את `v1`

## תבנית רישום

```md
## V1-BUG-XXX - כותרת קצרה
- סטטוס: פתוח
- חומרה: קריטי | גבוה | בינוני | נמוך
- אזור: onboarding | identity | execution | explanation | workspace | release | api
- התגלה ב: שלב בדיקה / תאריך
- תיאור:
- צעדי שחזור:
- תוצאה בפועל:
- תוצאה צפויה:
- הערות:
```

## באגים פתוחים

## V1-BUG-001 - חוסר עקביות בזהות הפרויקט שחוזרת מהשרת
- סטטוס: נפתר
- חומרה: קריטי
- אזור: identity
- התגלה ב: בדיקת תרחיש משתמש אמיתי דרך `/api/projects` ו־`/api/projects/giftwallet`
- תיאור:
  פרויקט `giftwallet` חזר עם שם הפרויקט `Royal Casino`, מה שמצביע על ערבוב או זיהום state בין פרויקטי demo.
- צעדי שחזור:
  1. להרים את השרת עם `npm run dev`
  2. לשלוף `GET /api/projects`
  3. לשלוף `GET /api/projects/giftwallet`
- תוצאה בפועל:
  ה־project id הוא `giftwallet`, אבל השם שחוזר הוא `Royal Casino`.
- תוצאה צפויה:
  כל פרויקט יחזיר זהות עקבית עם ה־id וה־goal שלו בלבד.
- הערות:
  טופל בניקוי הליבה מהזרעה אוטומטית של פרויקטי demo ובביטול התלות ב־`giftwallet`/`royal-casino` כברירת מחדל ב־startup.
  אימות לאחר התיקון:
  - `GET /api/projects` החזיר רשימה ריקה בשרת נקי
  - יצירת פרויקט חדש דרך `POST /api/projects` החזירה זהות עקבית (`id`/`name`/`goal`)
- משימת תיקון טכנית:
  - כותרת: `Lock project identity isolation at service/bootstrap boundaries`
  - מטרה:
    להבטיח ש־project identity לא תוכל להיזדהם יותר דרך seed data, bootstrap defaults או shared mutable state.
  - קבצים רלוונטיים:
    - `src/core/project-service.js`
    - `src/core/application-server-bootstrap.js`
    - `src/server.js`
    - `test/application-server-bootstrap.test.js`
  - דרישות מימוש:
    - לשמור על `seedDemoProjects` כ־opt-in בלבד.
    - למנוע כל fallback קשיח ל־project ids של demo ב־startup וב־project creation.
    - לוודא ש־default agents ו־default runtime context נוצרים בצורה נייטרלית.
    - לשמור על rebuild/context sync פר־project בלבד, בלי שיתוף object references בין פרויקטים.
  - בדיקות נדרשות:
    - `GET /api/projects` בשרת נקי מחזיר רשימה ריקה.
    - יצירת שני פרויקטים שונים דרך `POST /api/projects` מחזירה זהות עקבית לכל אחד.
    - אין הופעה של `giftwallet`/`royal-casino` ב־startup path אלא אם הופעל seed מפורש.

## V1-BUG-002 - חוסר יישור בין מטרת הפרויקט לבין הפעולות/המשימות שנבחרות
- סטטוס: נפתר
- חומרה: קריטי
- אזור: execution
- התגלה ב: בדיקת תרחיש משתמש אמיתי דרך payload של `giftwallet`
- תיאור:
  היעד שחוזר מדבר על השלמת `Auth System`, אבל המשימות שנראות בפועל הן `landing-page`, `payment-integration`, `campaign-plan`.
- צעדי שחזור:
  1. להרים את השרת עם `npm run dev`
  2. לשלוף `GET /api/projects/giftwallet`
  3. להשוות בין `goal` / `analysis.nextActions` / `events` / `runtimeResults`
- תוצאה בפועל:
  יש מיסאליינמנט בין מה שהמערכת אומרת שהיא מקדמת לבין מה שהיא באמת רצה עליו.
- תוצאה צפויה:
  ה־next actions והמשימות בפועל יהיו תואמים לצוואר הבקבוק וליעד הראשי של הפרויקט.
- הערות:
  לאחר ניקוי הליבה ויצירת פרויקט חדש דרך `POST /api/projects`, היעד החדש:
  `Build a small SaaS MVP with onboarding and auth`
  הוביל למשימה:
  `saas-auth`
  שזה שיפור ממשי ביישור בין goal לבין action.
  עם זאת, עדיין יש צורך לבדוק לעומק:
  - איך `nextAction` מוצגת למשתמש
  - האם כל שרשרת ההסברים וה־progress נשארת מיושרת ולא רק המשימה הראשונה
  לכן הבאג לא נסגר סופית עדיין.
  מימוש ראשוני הושלם:
  - `failureSummary` ו־`followUpTasks` מיושרים עכשיו ל־`activeBottleneck` ול־`unblockPlan`
  - הוסר שימוש מועדף ב־`context.bottleneck` הכללי כשכבר קיים חסם פעיל ספציפי
  - follow-up tasks נגזרים קודם מ־next actions של החסם ורק אחר כך מרעשי שגיאה גנריים
  - טסטים נוספו כדי לוודא שלא מתקבלת יותר תמונה stale כמו `אין כרגע חסם מרכזי` לצד approval/release blocker פעיל
  אימות ידני חוזר עבר:
  - בפרויקט onboarding SaaS חי ה־goal נשאר auth/onboarding-oriented
  - `failureSummary.bottleneck` עבר ל־`Approval`
  - `followUpTasks` חזרו כ־`Open approval request` במקום release blockers גנריים
  - `testReportSummary.remediationActions` מיושרות לאותו חסם פעיל
- משימת תיקון טכנית:
  - כותרת: `Align goal, bottleneck, next action, and follow-up tasks`
  - מטרה:
    ליישר את כל שרשרת ההחלטה כך שה־goal, החסם הפעיל, המשימה הבאה, ההסבר וה־follow-up tasks יתייחסו לאותו כיוון פרויקט.
  - קבצים רלוונטיים:
    - `src/core/context-builder.js`
    - `src/core/next-action-explanation-builder.js`
    - `src/core/unblock-path-generator.js`
    - `src/core/project-service.js`
  - דרישות מימוש:
    - לחשב `nextAction` מתוך `activeBottleneck` וה־goal הנוכחי, לא מתוך signals ישנים.
    - למנוע חזרה של משימות generic או lanes לא קשורים כשהפרויקט חסום על approval/release.
    - לוודא ש־`followUpTasks` נגזרים מאותו blocker/context ולא ממצב stale.
    - להוסיף guard שמתריע כש־goal category וה־action category לא מיושרים.
  - בדיקות נדרשות:
    - בפרויקט SaaS עם goal של auth/onboarding, ה־next action הראשון נשאר ב־auth/onboarding lane.
    - אחרי approval או release transition, המשימות הבאות מתעדכנות לפי החסם החדש.
    - `projectExplanation.nextAction` ו־`followUpTasks` נשארים מיושרים לאותו blocker.

## V1-BUG-003 - פער בשרת בין onboarding session לבין יצירת פרויקט usable
- סטטוס: נפתר
- חומרה: גבוה
- אזור: onboarding
- התגלה ב: ניסיון לבצע תרחיש משתמש אמיתי דרך API
- תיאור:
  השרת תומך ב־onboarding sessions, intake ו־finish, אבל בבדיקה הידנית לא זוהה flow HTTP מלא וברור שיוצר מזה פרויקט חדש usable מקצה לקצה.
- צעדי שחזור:
  1. להשתמש בנתיבי `/api/onboarding/*`
  2. לסיים session
  3. לחפש פרויקט חדש usable שנוצר ומתקדם
- תוצאה בפועל:
  היה צורך ליפול חזרה לפרויקט demo שנזרע אוטומטית כדי לבדוק את הזרימה.
- תוצאה צפויה:
  onboarding מלא יסתיים ביצירת פרויקט אמיתי, זמין לשליפה ול־run-cycle דרך השרת.
- הערות:
  זה חוסם בדיקת מציאות מלאה של משתמש חדש דרך ה־API.
- הערות מימוש:
  - `finishOnboardingSession` יוצר עכשיו פרויקט אמיתי ב־`ProjectService`
  - `POST /api/projects` ו־finish onboarding משתמשים באותו מסלול יצירת פרויקט usable
  - טסטי service עודכנו כדי לוודא ש־finish מחזיר גם `project` עם `projectIdentity`, `firstValueOutput` ו־`projectExplanation`
  - אימות ידני חוזר עבר:
    - `POST /api/onboarding/sessions` יצר session תקין
    - `PATCH /api/onboarding/sessions/:id/intake` עדכן intake תקין
    - `POST /api/onboarding/sessions/:id/finish` החזיר `project` usable מלא
    - `GET /api/projects` כלל את הפרויקט החדש ברשימה
- משימת תיקון טכנית:
  - כותרת: `Close onboarding HTTP flow into a usable project lifecycle`
  - מטרה:
    לסגור flow HTTP מלא שבו onboarding session מסתיים ביצירת פרויקט אמיתי, נשלף, עם context usable ולופ ראשון פעיל.
  - קבצים רלוונטיים:
    - `src/server.js`
    - `src/core/project-service.js`
    - `src/core/context-builder.js`
    - נתיבי `/api/onboarding/*`
  - דרישות מימוש:
    - לחבר `finish onboarding` ליצירת project persisted בפועל.
    - להחזיר `projectId`/`project` usable בתשובת הסיום.
    - לוודא שהפרויקט החדש מקבל `projectIdentity`, `instantValuePlan`, `firstValueOutput` ו־`projectExplanation`.
    - למנוע תלות בפרויקט seeded כדי להתחיל תרחיש משתמש חדש.
  - בדיקות נדרשות:
    - session onboarding חדש מייצר project חדש ב־`GET /api/projects`.
    - `GET /api/projects/{id}` מיד אחרי finish מחזיר פרויקט usable עם first value.
    - אין צורך ב־demo seed כדי להשלים את flow המשתמש הראשוני.

## V1-BUG-004 - ה־first value עדיין טכנית מדי ולא מספיק מוחשית למשתמש
- סטטוס: נפתר
- חומרה: בינוני
- אזור: first-value
- התגלה ב: בדיקת `first value` על הפרויקט `v1-manual-check`
- תיאור:
  המערכת מחזירה `firstValueOutput` ו־`firstValueSummary` תקינים, אבל התוצר הראשון עדיין מנוסח בשפה טכנית מדי (`app-shell`, `auth-module`, `billing-module`) ולא מרגיש מספיק כמו תוצאה מוחשית או מרשימה למשתמש אמיתי.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לשלוף את `GET /api/projects/v1-manual-check`
  3. לבדוק את `firstValueOutput`, `realityProgress` ו־`firstValueSummary`
- תוצאה בפועל:
  יש תוצאה ראשונה והמערכת אף מסמנת `feelsReal: true`, אבל ההצגה נשארת טכנית ומעורבבת עם signals של חסימה (`deploy-blocked`, `release:blocked`).
- תוצאה צפויה:
  ה־first value צריכה להרגיש למשתמש כמו תוצאה ברורה, מוחשית ומתקדמת, לא רק כמו רשימת artifacts פנימיים.
- הערות:
  זה לא כשל לוגי; זה פער מוצרי/UX.
  מבחינת `v1`, זו הצלחה חלקית: יש first value, אבל היא עדיין לא מספיק חזקה ברמת חוויית משתמש.
  מימוש הושלם:
  - `firstValueOutput` מתרגם עכשיו artifacts ל־user-visible outcomes כמו `starter app`, `working auth flow`, `ready project repo`
  - headlines/details ב־preview מדברים על תוצאה מוחשית במקום על `artifacts`
  - `realityProgress` מוסיף `userFacingMilestones` ו־`valueMoment`
  - `firstValueSummary.message` מחבר את ה־headline, ה־detail והמיילסטון הראשון למשפט תוצאתי ברור יותר
  - נוספו טסטים שמוודאים שאין חזרה ל־artifact ids גולמיים ב־first value path
  מצב נוכחי:
  - טסטים אוטומטיים עוברים
  - בוצע אימות ידני חוזר מול השרת החי על `v1-bug-004-check`
  - `userVisibleArtifacts` ו־`userFacingMilestones` אכן פחות טכניים ומציגים ערך ברור יותר
  - לאחר תיקון נוסף של קדימות ה־preview וה־copy הראשי, בוצע אימות ידני סופי על `v1-bug-004-final`
  - ב־payload החי הופיעו:
    - `firstValueOutput.preview.headline = Your starter app is ready`
    - `firstValueSummary.message = V1 Bug 004 Final: Your starter app is ready...`
  - כלומר ה־first value מוצגת עכשיו כתוצאה מוחשית וברורה, ולא כתיאור טכני של artifact פנימי
- משימת תיקון טכנית:
  - כותרת: `Translate first value from internal artifacts to user-visible outcome`
  - מטרה:
    להפוך את `firstValueOutput` ו־`firstValueSummary` מתיאור טכני של artifacts לתיאור מוחשי שהמשתמש יכול להבין ולהרגיש.
  - קבצים רלוונטיים:
    - `src/core/first-tangible-outcome-generator.js`
    - `src/core/progress-to-reality-mapper.js`
    - `src/core/first-value-summary-assembler.js`
  - דרישות מימוש:
    - למפות artifact sets לתוויות משתמשיות כמו preview, starter app, first screen, ready repo.
    - להפריד בין “מה נוצר” לבין “מה חסום”, ולא לערבב חסימת release בתוך רגע ה־first value עצמו.
    - לשפר את copy של preview/headline/message כך שיתאר תוצאה במקום רכיבי מערכת.
  - בדיקות נדרשות:
    - `firstValueOutput.preview` לא מציג רק ids כמו `app-shell`/`auth-module`.
    - `firstValueSummary` נותן תיאור תוצאתי ברור למה המשתמש קיבל עכשיו.
    - `realityProgress` לא מוחק את תחושת הערך הראשון בגלל signal חסימה משני.

## V1-BUG-005 - שכבת ההסברים עדיין טכנית מדי ולא מספיק מדברת בשפת משתמש
- סטטוס: נפתר
- חומרה: בינוני
- אזור: explanations
- התגלה ב: בדיקת `projectExplanation`, `failureExplanation` ו־`approvalExplanation` על `v1-manual-check`
- תיאור:
  ההסברים קיימים ומחוברים נכון ל־state, אבל הם עדיין משתמשים בשפה מערכתית/טכנית מדי (`Recommended defaults are still provisional`, `build-output`, `approval-blocker`, `scheduler-partial`) ולא תמיד מבדילים טוב בין כשל אמיתי לבין חסימה תפעולית.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לשלוף את `GET /api/projects/v1-manual-check`
  3. לבדוק את `projectExplanation`, `failureExplanation`, `approvalExplanation`
- תוצאה בפועל:
  יש explanations לכל חלק חשוב, אבל הן מרגישות יותר כמו שפת מערכת פנימית מאשר שפה שעוזרת למשתמש להבין מיד מה קורה.
- תוצאה צפויה:
  explanations צריכות להיות מדויקות, אבל גם בהירות, אנושיות וממוקדות פעולה למשתמש.
- הערות:
  זה לא חור לוגי אלא פער ניסוח/מוצר.
  מבחינת `v1`, זו הצלחה חלקית: explainability קיימת, אבל עדיין לא מלוטשת מספיק.
  מימוש הושלם:
  - `nextActionExplanation.reason` ו־`userFacingAction` עברו לניסוח אנושי וממוקד פעולה
  - `failureExplanation` מבדיל עכשיו טוב יותר בין חסימה, כשל, שחרור ו־credentials בשפה משתמשית
  - `approvalExplanation` מתרגם סיבות ודחייה לניסוח ברור ולא למונחי מערכת
  - `changeExplanation` מציג התקדמות בשפה תוצאתית במקום `state advances` גולמיים
  - `projectExplanation` מחזיק עכשיו גם `headline` ו־`userSummary` אנושיים
  - נוספו ועודכנו טסטים שמוודאים שהטקסט הגלוי לא נשען על labels מערכתיים ישנים
  מצב נוכחי:
  - הטסטים הממוקדים של שכבת ההסברים עברו
  - `npm test` עובר עם כיסוי מלא
  - אימות ידני חוזר מול השרת החי עבר על `v1-bug-005-check`
  - ב־payload החי הופיעו:
    - `projectExplanation.headline = צריך את האישור שלך כדי שנוכל להמשיך.`
    - `nextAction.userFacingAction = לאשר את ההגדרות כדי להתקדם`
    - `failure.failedWhat = הביצוע ממתין לאישור שלך לפני שאפשר להמשיך.`
    - `failure.likelyCause = כמה הגדרות מפתח עדיין מחכות לאישור שלך.`
    - `approval.whyApproval = יש כמה הגדרות שעדיין דורשות את האישור שלך`
  - כלומר שכבת ה־explanations עצמה כבר לא נשענת על labels מערכתיים גולמיים ומציגה שפה ברורה למשתמש
- משימת תיקון טכנית:
  - כותרת: `Humanize explanation language and separate system labels from user copy`
  - מטרה:
    לשמור על דיוק לוגי בהסברים, אבל להפסיק לחשוף למשתמש labels מערכתיים שאינם action-oriented.
  - קבצים רלוונטיים:
    - `src/core/next-action-explanation-builder.js`
    - `src/core/failure-explanation-builder.js`
    - `src/core/approval-explanation-builder.js`
    - `src/core/execution-change-explanation-builder.js`
    - `src/core/explanation-assembler.js`
  - דרישות מימוש:
    - להחליף מונחים כמו `approval-blocker`, `scheduler-partial`, `build-output` בניסוח מוצרי ברור.
    - להבדיל בין blocked, failed, waiting, approved בצורה עקבית בכל ההסברים.
    - לשמור system labels פנימיים ב־metadata בלבד אם צריך debug.
  - בדיקות נדרשות:
    - `projectExplanation` נשאר ברור גם בלי ידע פנימי על המערכת.
    - approval block לא מוצג כ־failure רגיל.
    - explanation payload שומר על פעולה מומלצת אחת ברורה.

## V1-BUG-006 - שכבת החסמים קוהרנטית, אבל מצב ההסבר מעליה עדיין לא עקבי
- סטטוס: נפתר
- חומרה: בינוני
- אזור: bottleneck
- התגלה ב: בדיקת `activeBottleneck`, `unblockPlan`, `updatedBottleneckState` ו־`projectExplanation` על `v1-manual-check`
- תיאור:
  מנוע החסמים עצמו מזהה נכון חסם יחיד מסוג `approval-blocker` ובונה `unblockPlan` פשוט וברור, אבל שכבת ההסבר שמעליו עדיין לא עקבית: `why-approval` מסומן כלא זמין למרות שקיים `approvalExplanation`, ו־`failureExplanation` מציג מצב של "step failed" למרות שבפועל מדובר ב־approval block ולא בכשל הרצה רגיל.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לשלוף את `GET /api/projects/v1-manual-check`
  3. לבדוק את `activeBottleneck`, `unblockPlan`, `updatedBottleneckState`, `explanationSchema`, `failureExplanation`, `approvalExplanation`
- תוצאה בפועל:
  החסם הפעיל ברור, ה־unblock plan מובן, אבל ה־explanation schema והסברי הכשל/approval לא מיושרים עד הסוף לאותו מצב.
- תוצאה צפויה:
  כשהחסם הוא approval block, גם availability של `why-approval` וגם הניסוח של `failure/blocking` צריכים להיות עקביים עם אותו מצב, בלי לערבב בין "נכשל" לבין "חסום".
- הערות:
  זה לא כשל בלוגיקת החסם, אלא פער תיאום בין מנוע החסמים לבין שכבת ההסבר שמוצגת למשתמש.
  מימוש הושלם:
  - `why-approval` מחושב עכשיו גם מתוך `approvalRequest`, `policyTrace` ו־`activeBottleneck`, לא רק מ־`approvalStatus`
  - `failureExplanation` במצב `approval-blocker` מתאר חסימה ולא "step failed"
  - `context-builder` מעביר `approvalRequest` מסונכרן ל־`explanationSchema`
  - נוספו טסטים למצב approval blocker פעיל ולמעבר מ־approval blocker ל־release blocker
  אימות ידני חוזר עבר:
  - בפרויקט חי `activeBottleneck.blockerType` נשאר `approval-blocker`
  - `explanationSchema` מציג `why-approval` עם `available: true`
  - `failureExplanation.failedWhat` הפך ל־`Execution is blocked until the required approval is granted`
  - `approvalExplanation.summary.blockerType` נשאר מיושר ל־`approval-blocker`
- משימת תיקון טכנית:
  - כותרת: `Synchronize bottleneck engine outputs with explanation availability`
  - מטרה:
    ליישר בין `activeBottleneck`/`unblockPlan` לבין `explanationSchema`, `failureExplanation` ו־`approvalExplanation`.
  - קבצים רלוונטיים:
    - `src/core/explanation-schema.js`
    - `src/core/failure-explanation-builder.js`
    - `src/core/approval-explanation-builder.js`
    - `src/core/context-builder.js`
  - דרישות מימוש:
    - אם `approvalExplanation` קיים, `why-approval` לא יכול להיות `available: false`.
    - במצב approval block, `failureExplanation` צריך לתאר חסימה ולא כשל הרצה.
    - לחשב explanation availability אחרי שכל ה־bottleneck/recovery artifacts נבנו.
  - בדיקות נדרשות:
    - approval blocker מציג availability עקבי ב־schema ובהסברים.
    - מעבר מ־approval blocker ל־release blocker מעדכן availability מחדש.

## V1-BUG-007 - recovery payload מיושר לחסם, אבל follow-up tasks שוברים את התמונה
- סטטוס: נפתר
- חומרה: בינוני
- אזור: recovery
- התגלה ב: בדיקת `recoveryOptionsPayload` ו־`followUpTasks` על `v1-manual-check`
- תיאור:
  שכבת ה־recovery עצמה בונה החלטה נכונה (`ask-user`) ו־payload ברור יחסית למצב של approval block, אבל מיד אחריה `followUpTasks` חוזרים לשפה של release blockers ואף טוענים `אין כרגע חסם מרכזי`, למרות שבאותו payload קיים `activeBottleneck` ברור מסוג approval blocker.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לשלוף את `GET /api/projects/v1-manual-check`
  3. לבדוק את `activeBottleneck`, `recoveryOptionsPayload`, `followUpTasks`
- תוצאה בפועל:
  recovery למשתמש אומר שנדרש אישור, אבל ה־follow-up tasks מחזירים תמונה סותרת של חסמי release ו־"אין כרגע חסם מרכזי".
- תוצאה צפויה:
  אחרי recovery decision, גם המשימות הבאות צריכות להיות מיושרות לחסם הפעיל ולא להציג תמונת מצב סותרת.
- הערות:
  זה לא שובר את ה־recovery עצמו, אבל כן שובר אמון והבנה אצל המשתמש כי התמונה משתנה בין payload אחד לשני.
  מצב מעודכן:
  - בעקבות היישור שכבר הוכנס ב־`V1-BUG-002`, `followUpTasks` נגזרים בפועל מ־`unblockPlan` והחסם הפעיל במקום מ־generic release noise
  - נוספה בדיקת רגרסיה מפורשת ב־`project-service` שמוודאת:
    - `recoveryDecision.decisionType = ask-user`
    - `recoveryOptionsPayload.attemptedRecovery.actions[0].actionType = request-approval`
    - `followUpTasks[0].summary = Open approval request`
    - ואין חזרה ל־`release blocker` גנרי או `אין כרגע חסם מרכזי`
  אימות ידני:
  - בבדיקת השרת החי על פרויקט `v1-bug-006-check`, recovery payload נשאר מיושר ל־approval
  - `followUpTasks` חזרו כ־`Open approval request`
  - לא נצפתה יותר תמונה סותרת בין recovery לבין ההמשך
- משימת תיקון טכנית:
  - כותרת: `Bind follow-up task generation to the current recovery decision`
  - מטרה:
    למנוע מצב שבו recovery בונה מסר אחד, אבל follow-up tasks נמשכים ממקור ישן ומחזירים תמונת מצב סותרת.
  - קבצים רלוונטיים:
    - `src/core/recovery-orchestration-module.js`
    - `src/core/user-facing-recovery-options-assembler.js`
    - `src/core/context-builder.js`
  - דרישות מימוש:
    - לייצר `followUpTasks` מתוך `recoveryDecision`, `activeBottleneck` ו־`unblockPlan` הנוכחיים.
    - להסיר fallback ל־generic release tasks כשקיים blocker פעיל אחר.
    - לשמור מסר אחד עקבי בין recovery payload, next action ו־follow-up list.
  - בדיקות נדרשות:
    - במצב approval-blocked, follow-up tasks לא יגידו “אין כרגע חסם מרכזי”.
    - recovery payload ו־follow-up tasks יציגו אותה פעולה ראשית.

## V1-BUG-008 - אישור משנה את החסם בפועל, אבל שכבות ההסבר והסטטוס נשארות עם שאריות approval סותרות
- סטטוס: נפתר
- חומרה: גבוה
- אזור: approval
- התגלה ב: בדיקת approval flow ידנית על `v1-manual-check`
- תיאור:
  לאחר `POST /approvals/approve` השרת אכן מקבל את האישור ומעביר את החסם הפעיל ל־`release-blocker`, אבל חלק מהשכבות לא מתיישרות עם המצב החדש: `approvalExplanation` עדיין מתנהג כאילו approval חוסם, ו־`updatedBottleneckState` מסומן `cleared` בזמן ש־`activeBottleneck` עדיין `release-blocker` חוסם.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לשלוף `GET /api/projects/{projectId}/approvals`
  3. לאשר דרך `POST /api/projects/{projectId}/approvals/approve`
  4. לשלוף `GET /api/projects/{projectId}` ולבדוק את `activeBottleneck`, `updatedBottleneckState`, `approvalExplanation`, `projectExplanation`
- תוצאה בפועל:
  האישור עצמו נרשם כמו שצריך, אבל state והסברים נשארים עם שאריות מהחסם הקודם ומייצרים תמונה סותרת.
- תוצאה צפויה:
  אחרי approval, כל שכבות ה־state וההסבר צריכות להתיישר לחסם החדש בלבד, בלי שאריות approval ובלי סטטוס "cleared" כשעדיין יש חסם פעיל.
- הערות:
  זה ממצא משמעותי כי הוא מראה שה־approval flow עובד פונקציונלית, אבל לא משלים re-sync מלא של המצב המוצרי.
  מימוש הושלם:
  - approval request מסונכרן עכשיו ל־approval status האמיתי
  - policy/explanation כבר לא שומרים דרישת approval אחרי approve
  - updated bottleneck state לא מסומן `cleared` כשעדיין יש חסם פעיל חדש
  אימות ידני חוזר עבר:
  - אחרי approve החסם הפעיל עבר ל־`release-blocker`
  - `updatedBottleneckState.status` נשאר `pending-unblock`
  - `approvalExplanation.summary.requiresApproval` ירד ל־`false`
  - `projectExplanation` עבר להתייחס ל־release blocker במקום approval blocker
- משימת תיקון טכנית:
  - כותרת: `Perform full project re-sync after approval decisions`
  - מטרה:
    לוודא שלאחר approve/reject/revoke כל שכבות ה־project state, bottlenecks, explanations ו־follow-up tasks נבנות מחדש מאותו מצב עדכני.
  - קבצים רלוונטיים:
    - `src/core/project-service.js`
    - `src/core/context-builder.js`
    - `src/server.js`
  - דרישות מימוש:
    - approve/reject/revoke צריכים להפעיל rebuild context מלא לפרויקט.
    - `approvalRequest.status`, `approvalStatus`, `activeBottleneck`, `updatedBottleneckState`, `approvalExplanation` ו־`projectExplanation` צריכים להתיישר לאותו מצב חדש.
    - למנוע מצב שבו `updatedBottleneckState` מסומן `cleared` בזמן שעדיין יש blocker פעיל חדש.
  - בדיקות נדרשות:
    - approve מעביר את הפרויקט מחסם approval לחסם הבא בלי שאריות approval.
    - reject נשאר approval-blocked בכל השכבות.
    - revoke מחזיר מצב עקבי של pending/missing approval.

## V1-BUG-009 - מודל הניווט שומר project context, אבל handoff/resume נשארים stale
- סטטוס: נפתר
- חומרה: בינוני
- אזור: workspace
- התגלה ב: בדיקת `workspaceNavigationModel` הידנית על `v1-manual-check`
- תיאור:
  `workspaceNavigationModel` שומר נכון את `projectId` וה־routes בין ה־workspaces, אבל `handoffContext` נשאר עם מידע לא מעודכן: `nextAction` הוא `null` ו־`releaseStatus` מוצג כ־`published` למרות שבאותו פרויקט החסם הפעיל כבר עבר ל־`release-blocker`.
- צעדי שחזור:
  1. ליצור פרויקט חדש דרך `POST /api/projects`
  2. לבצע approval ידני דרך `POST /api/projects/{projectId}/approvals/approve`
  3. לשלוף `GET /api/projects/{projectId}`
  4. לבדוק `workspaceNavigationModel.handoffContext` מול `activeBottleneck` ו־`projectExplanation`
- תוצאה בפועל:
  הניווט בין workspaces בנוי נכון ברמת המבנה, אבל ה־handoff context לא משקף את מצב הפרויקט העדכני ולכן resume ידני לא באמת חד וברור.
- תוצאה צפויה:
  handoff/resume צריכים לשקף את ה־next action וה־status האמיתיים של הפרויקט בזמן אמת.
- הערות:
  זה לא שובר את עצם הניווט, אבל כן פוגע בהמשכיות אמיתית בין workspaces ובתחושת "אפשר להמשיך מאותה נקודה".
  מימוש הושלם:
  - `handoffContext.nextAction` נבנה עכשיו מ־`projectExplanation.nextAction.selectedAction` לפני fallback ל־workspace overview
  - `handoffContext.releaseStatus` נגזר מ־`releaseStatus` ומהחסם הפעיל, ולא נשאר על `published` כשיש `release-blocker`
  - נוסף `resumeToken` יציב שמקודד `projectId`, ה־workspace הנוכחי וסוג החסם
  - `context-builder` מעביר ל־navigation model גם את `projectExplanation`, `activeBottleneck` ו־`releaseStatus`
  - נוספה בדיקת service שמוודאת refresh של handoff context אחרי approve transition
  אימות ידני חוזר עבר:
  - אחרי approve בשרת החי `activeBottleneck.blockerType` עבר ל־`release-blocker`
  - `workspaceNavigationModel.handoffContext.nextAction` התעדכן ל־`fix-release-validation`
  - `workspaceNavigationModel.handoffContext.releaseStatus` התעדכן ל־`blocked`
  - `workspaceNavigationModel.handoffContext.resumeToken` נשמר כ־`resume:v1-bug-009-check:project-brain:release-blocker`
- משימת תיקון טכנית:
  - כותרת: `Refresh workspace handoff context from live project state`
  - מטרה:
    לוודא ש־`workspaceNavigationModel.handoffContext` משקף את ה־next action, ה־release status וה־resume point האמיתיים בזמן אמת.
  - קבצים רלוונטיים:
    - `src/core/cross-workspace-navigation-model.js`
    - `src/core/project-brain-workspace.js`
    - `src/core/development-workspace.js`
    - `src/core/release-workspace.js`
    - `src/core/context-builder.js`
  - דרישות מימוש:
    - לחשב `handoffContext` מתוך `projectExplanation`, `activeBottleneck`, `releaseStatus` ו־workspace state העדכניים.
    - למנוע `nextAction: null` כשקיימת פעולה ברורה בפרויקט.
    - לוודא ש־release status ב־handoff משקף את אותו status שמוצג ב־release/bottleneck layers.
  - בדיקות נדרשות:
    - אחרי approval transition, handoff context מתעדכן לחסם החדש.
    - מעבר בין workspaces שומר על אותו `projectId` ועל resume action שימושי.

## V1-BUG-010 - ה־app shell לא סוגר end-to-end את המסלול מ־empty app לפרויקט usable
- סטטוס: פתוח
- חומרה: קריטי
- אזור: onboarding
- התגלה ב: בדיקת מסך ריק ב־web app אחרי הסרת demo seed
- תיאור:
  למרות שה־backend כבר יודע ליצור `projectDraft`, לנהל onboarding sessions ולסיים onboarding לפרויקט usable דרך API, ה־app shell הראשי עדיין מתחיל רק מ־`GET /api/projects`. כשאין פרויקטים, אין handoff ל־create project, ל־onboarding או ל־`loadProject(project.id)`, ולכן המשתמש נשאר במסך ריק.
- צעדי שחזור:
  1. להרים את השרת בלי seed data.
  2. לפתוח את ה־web app כש־`/api/projects` מחזיר רשימה ריקה.
  3. לנסות להגיע מתוך המסך הראשי ליצירת פרויקט ראשון.
- תוצאה בפועל:
  המסך הראשי נטען ריק, בלי מסלול usable שמוביל ל־draft creation, onboarding finish וטעינת workspace.
- תוצאה צפויה:
  empty app state יוביל את המשתמש דרך `Create Project -> onboarding -> finish -> loadProject(project.id) -> workspace` בלי תלות ידנית ב־API או seed data.
- הערות:
  זה לא סותר את `V1-BUG-003`. שם נסגר ה־backend HTTP flow של onboarding ל־project usable; כאן הפער הוא בשכבת הכניסה הראשית של המוצר ובחוסר הוכחת end-to-end דרך ה־app shell עצמו.
- משימת תיקון טכנית:
  - כותרת: `Close empty app to first project workspace integration flow`
  - מטרה:
    לחבר את מצב `אין פרויקטים` במסך הראשי ליצירת draft, כניסה/חידוש onboarding, finish onboarding וטעינה אוטומטית של workspace לפרויקט החדש.
  - קבצים רלוונטיים:
    - `web/app.js`
    - `web/index.html`
    - `src/server.js`
    - `src/core/project-service.js`
    - `test/web-app-wave1-cockpit.test.js`
    - `test/server-health-endpoints.test.js`
  - דרישות מימוש:
    - להציג empty state אמיתי כש־`/api/projects` ריק.
    - לא לחבר CTA מטעה בלי מסלול usable מלא.
    - לחבר `POST /api/project-drafts` למסלול entry נכון.
    - לחבר onboarding entry/resume מתוך ה־app shell.
    - אחרי finish onboarding לקרוא `loadProject(project.id)` ולנחות ב־workspace usable.
  - בדיקות נדרשות:
    - תרחיש app ריק מגיע ל־draft creation מתוך ה־UI.
    - finish onboarding מחזיר `project.id` וה־UI טוען אותו.
    - ה־workspace הראשון נטען בלי seed data ובלי קריאות ידניות ל־API מחוץ ל־flow.
