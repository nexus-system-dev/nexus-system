# V2 Wave 1 Bug Validation

מטרת הקובץ:
- לרכז את כל ממצאי ה־`Wave 1 Validation Gate` עבור `Nexus v2`
- לבדוק את `Wave 1` כשכבת מוצר רוחבית אחת, לא כאוסף משימות נפרדות
- להפריד בין באגים חוסמים, חולשות מוצריות, וחוסרים שאפשר לדחות אחרי `Wave 2`

## סטטוסים

- `פתוח` - זוהה ועדיין לא טופל
- `בתיקוף` - נדרש אימות נוסף או שחזור משלים
- `לא לחסימה` - פער אמיתי, אבל לא חוסם מעבר
- `מוכן לתיקון` - סבב הבדיקות הושלם והבאג מוכן לטיפול
- `נפתר` - תוקן ואומת

## חומרה

- `קריטי` - שובר קוהרנטיות מערכתית או חוסם מעבר לגל הבא
- `גבוה` - פוגע משמעותית בשימושיות או באמינות של שכבת מוצר מרכזית
- `בינוני` - פער מוחשי, אבל לא חוסם את כל הגל
- `נמוך` - חוסר ליטוש, ניסוח או חיבור משני

## תבנית רישום

```md
## V2-W1-BUG-XXX - כותרת קצרה
- סטטוס: פתוח
- חומרה: קריטי | גבוה | בינוני | נמוך
- אזור: ui-contracts | design-system | component-library | screen-templates | screen-review | ai-learning | ai-companion | realtime | collaboration | versioning | cross-layer
- התגלה ב: בדיקה / תאריך / קובץ
- תיאור:
- צעדי שחזור:
- תוצאה בפועל:
- תוצאה צפויה:
- הערות:
- משימת תיקון טכנית:
  - כותרת:
  - מטרה:
  - קבצים רלוונטיים:
  - דרישות מימוש:
  - בדיקות נדרשות:
```

## סט הבדיקות של Wave 1

הסדר הקבוע:
1. להגדיר את הבדיקה
2. להריץ אותה
3. לסמן `עבר` / `נכשל` / `עבר חלקית`
4. להפיק לקח
5. לפתוח באג אם צריך
6. לא לתקן עדיין

### W1-TEST-001 - UI contracts consistency
- מטרה: לוודא שחוזי מסך, inventory, flow map ו־state definitions עקביים ומחוברים
- מקורות אמת:
  - `src/core/screen-contract-schema.js`
  - `src/core/screen-validation-checklist.js`
  - `src/core/screen-inventory.js`
  - `src/core/screen-flow-map.js`
  - `test/screen-contract-schema.test.js`
  - `test/screen-validation-checklist.test.js`
  - `test/screen-inventory.test.js`
  - `test/screen-flow-map.test.js`
- סטטוס: עבר
- לקח: שכבת חוזי המסכים הבסיסית עקבית ברמת schema, inventory, flow map ו־validation checklist. כרגע אין עדות לסטייה פנימית בתוך שכבת החוזים עצמה.
- באגים שנפתחו: אין

### W1-TEST-002 - Design system consistency
- מטרה: לוודא ש־design tokens, typography, spacing, color rules ו־interaction states יוצרים שפה אחת עקבית
- מקורות אמת:
  - `src/core/design-token-schema.js`
  - `src/core/typography-system.js`
  - `src/core/spacing-layout-system.js`
  - `src/core/color-usage-rules.js`
  - `src/core/interaction-states-system.js`
  - `test/design-token-schema.test.js`
  - `test/typography-system.test.js`
  - `test/spacing-layout-system.test.js`
  - `test/color-usage-rules.test.js`
  - `test/interaction-states-system.test.js`
- סטטוס: עבר
- לקח: מערכת העיצוב עצמה עקבית ברמת הטוקנים והמערכות הנגזרות ממנה. אין כרגע כשל פנימי בתוך design tokens, typography, layout, color rules או interaction states.
- באגים שנפתחו: אין

### W1-TEST-003 - Component library coherence
- מטרה: לוודא שחוזי הרכיבים והספריות נגזרים מאותה שכבת מערכת עיצוב
- מקורות אמת:
  - `src/core/component-contract-schema.js`
  - `src/core/primitive-components.js`
  - `src/core/feedback-components.js`
  - `src/core/data-display-components.js`
  - `src/core/navigation-components.js`
  - `src/core/layout-components.js`
  - `test/component-contract-schema.test.js`
  - `test/primitive-components.test.js`
  - `test/feedback-components.test.js`
  - `test/data-display-components.test.js`
  - `test/navigation-components.test.js`
  - `test/layout-components.test.js`
- סטטוס: עבר
- לקח: ספריות הרכיבים עצמן קוהרנטיות ונגזרות מחוזי רכיב ומשכבת עיצוב עקבית. לא התגלתה סתירה פנימית בין contracts, primitive components, feedback, data display, navigation ו־layout.
- באגים שנפתחו: אין

### W1-TEST-004 - Screen templates coherence
- מטרה: לוודא ש־screen templates, goals ו־CTA עובדים כמו מערכת מסכים אחת
- מקורות אמת:
  - `src/core/screen-template-schema.js`
  - `src/core/management-template.js`
  - `src/core/detail-page-template.js`
  - `src/core/screen-goal-cta.js`
  - `test/screen-template-schema.test.js`
  - `test/screen-goal-cta.test.js`
  - `test/project-workbench-layout.test.js`
- סטטוס: עבר
- לקח: שכבת ה־templates, ה־goals, ה־CTA וה־workbench layout עקבית ברמת המודלים. אין כרגע סתירה פנימית בין סוגי המסכים לבין מבנה העבודה שהם אמורים לאפשר.
- באגים שנפתחו: אין

### W1-TEST-005 - Screen review and validators
- מטרה: לוודא שה־validators וה־review report מייצרים gate אחד ברור לפני implementation
- מקורות אמת:
  - `src/core/primary-action-validator.js`
  - `src/core/mobile-usability-validator.js`
  - `src/core/state-coverage-validator.js`
  - `src/core/consistency-validator.js`
  - `src/core/screen-review-assembler.js`
  - `test/primary-action-validator.test.js`
  - `test/mobile-usability-validator.test.js`
  - `test/state-coverage-validator.test.js`
  - `test/consistency-validator.test.js`
  - `test/screen-review-assembler.test.js`
- סטטוס: עבר
- לקח: שכבת ה־validators וה־screen review assembler מחזיקה gate פנימי ברור ועקבי. אין כרגע evidence לכשל בתוך הלוגיקה של review ו־validation עצמם.
- באגים שנפתחו: אין

### W1-TEST-006 - AI learning UX outputs
- מטרה: לוודא ש־AI learning outputs ברורים, שימושיים ומחוברים למסכי העבודה
- מקורות אמת:
  - `src/core/learning-insight-ui-schema.js`
  - `src/core/ai-learning-workspace-template.js`
  - `src/core/decision-intelligence-layer.js`
  - `test/ai-learning-workspace-template.test.js`
  - `test/decision-intelligence-layer.test.js`
- סטטוס: עבר
- לקח: שכבת ה־AI learning מוגדרת היטב ברמת התבניות והחלטות המערכת. עדיין צריך לאמת בהמשך שה־outputs האלה לא נשארים רק במודלים אלא גם מגיעים ל־surface המוצרי.
- באגים שנפתחו: אין

### W1-TEST-007 - AI companion behavior
- מטרה: לוודא שה־AI companion עקבי במצב, נראות, עדיפות והפרעה
- מקורות אמת:
  - `src/core/ai-companion-presence-schema.js`
  - `src/core/companion-state-model.js`
  - `src/core/companion-trigger-policy.js`
  - `src/core/companion-message-priority-resolver.js`
  - `src/core/companion-dock-panel-contract.js`
  - `src/core/companion-mode-controls.js`
  - `src/core/companion-interruption-guard.js`
  - `src/core/companion-animation-state-rules.js`
  - `src/core/ai-companion-workspace-template.js`
  - `test/ai-companion-presence-schema.test.js`
  - `test/companion-state-model.test.js`
  - `test/companion-trigger-policy.test.js`
  - `test/companion-message-priority-resolver.test.js`
  - `test/companion-dock-panel-contract.test.js`
  - `test/companion-mode-controls.test.js`
  - `test/companion-interruption-guard.test.js`
  - `test/companion-animation-state-rules.test.js`
  - `test/ai-companion-workspace-template.test.js`
- סטטוס: עבר
- לקח: שכבת ה־AI companion שלמה ועקבית ברמת המודלים, ההחלטות וה־workspace contracts. אם יש כשל, הוא כנראה לא בלוגיקה של ה־companion אלא בחיבור שלו ל־UI/שרת.
- באגים שנפתחו: אין

### W1-TEST-008 - Real-time experience layer
- מטרה: לוודא ש־event stream, live updates ו־progress יוצרים תחושת מוצר חי ולא רעש
- מקורות אמת:
  - `src/core/realtime-event-stream-schema.js`
  - `src/core/live-update-transport-layer.js`
  - `src/core/run-progress-normalizer.js`
  - `src/core/execution-progress-schema.js`
  - `test/realtime-event-stream-schema.test.js`
  - `test/live-update-transport-layer.test.js`
  - `test/run-progress-normalizer.test.js`
  - `test/execution-progress-schema.test.js`
- סטטוס: עבר
- לקח: שכבת ה־real-time הפנימית תקינה ברמת schemas, transport ו־progress normalization. נדרש אימות נפרד שהשכבה הזאת באמת מורגשת במסכי המוצר ולא נשארת רק ב־state.
- באגים שנפתחו: אין

### W1-TEST-009 - Collaboration layer
- מטרה: לוודא ש־presence, events, threads ו־activity feed מוסיפים שליטה ולא בלבול
- מקורות אמת:
  - `src/core/collaboration-event-schema.js`
  - `src/core/project-presence-model.js`
  - `src/core/project-comments-review-threads-module.js`
  - `src/core/shared-approval-flow-model.js`
  - `src/core/collaboration-activity-feed.js`
  - `test/collaboration-event-schema.test.js`
  - `test/project-presence-model.test.js`
  - `test/project-comments-review-threads-module.test.js`
  - `test/shared-approval-flow-model.test.js`
  - `test/collaboration-activity-feed.test.js`
- סטטוס: עבר
- לקח: שכבת ה־collaboration קוהרנטית ברמת ה־event model, presence, review threads, approval flow ו־activity feed. אין כרגע evidence לכשל פנימי בשכבה עצמה.
- באגים שנפתחו: אין

### W1-TEST-010 - Project state versioning layer
- מטרה: לוודא ש־snapshot, diff, restore ו־rollback יוצרים שכבת שליטה אמינה וברורה
- מקורות אמת:
  - `src/core/project-state-snapshot-schema.js`
  - `src/core/project-snapshot-store.js`
  - `src/core/state-diff-compare-module.js`
  - `src/core/project-state-restore-resolver.js`
  - `src/core/project-rollback-execution-module.js`
  - `test/project-state-snapshot-schema.test.js`
  - `test/project-snapshot-store.test.js`
  - `test/state-diff-compare-module.test.js`
  - `test/project-state-restore-resolver.test.js`
  - `test/project-rollback-execution-module.test.js`
- סטטוס: עבר
- לקח: שכבת ה־versioning וה־restore יציבה ברמת הסכמות, האחסון והחלטות ה־rollback. הסיכון הפתוח הוא בעיקר חווייתי: האם היכולות האלה נגישות וברורות למשתמש בפועל.
- באגים שנפתחו: אין

### W1-TEST-011 - Cross-layer coherence
- מטרה: לוודא שהשכבות כולן מחוברות ל־context אחד ול־product surface usable
- מקורות אמת:
  - `src/core/context-builder.js`
  - `src/core/project-service.js`
  - `src/server.js`
  - `web/index.html`
  - `web/app.js`
  - `web/styles.css`
  - `test/context-builder.test.js`
  - `test/project-service.test.js`
- סטטוס: עבר
- לקח: שכבת ה־context, השירות המרכזי וה־cockpit מחוברים עכשיו ל־surface אחד usable. `Wave 1` כבר לא נשארת ברמת payloads בלבד, אלא מוצגת בפועל דרך workbench קוהרנטי עם חיבורי realtime, collaboration, versioning, recommendation ו־product context.
- באגים שנפתחו: אין

### W1-TEST-012 - Entry, auth and onboarding flow coherence
- מטרה: לוודא שהמסלול `entry -> auth -> project creation -> onboarding -> initial state` עובד כזרימה אחת ברורה ולא כאוסף מודולים נפרדים
- מקורות אמת:
  - `src/core/authentication-route-resolver.js`
  - `src/core/authentication-screen-states.js`
  - `src/core/post-auth-redirect-resolver.js`
  - `src/core/project-draft-schema.js`
  - `src/core/project-draft-creation-service.js`
  - `src/core/project-creation-experience-model.js`
  - `src/core/post-project-creation-redirect-resolver.js`
  - `src/core/onboarding-session-service.js`
  - `src/core/onboarding-step-resolver.js`
  - `src/core/onboarding-progress-model.js`
  - `src/core/onboarding-screen-flow.js`
  - `src/core/onboarding-completion-evaluator.js`
  - `src/core/onboarding-to-state-handoff-contract.js`
  - `src/core/initial-project-state-creation-contract.js`
  - `src/core/initial-project-state-schema.js`
  - `src/core/onboarding-to-state-transformation-mapper.js`
  - `src/core/project-state-bootstrap-service.js`
  - `src/core/initial-project-state-validation-module.js`
  - `test/context-builder.test.js`
  - `test/project-service.test.js`
- סטטוס: עבר
- לקח: ה־flow הבסיסי של משתמש חדש מיוצג עכשיו מקצה לקצה ברמת state, routing, onboarding ו־bootstrap של `Project State`. אין כרגע evidence לשבר פנימי במסלול הזה.
- באגים שנפתחו: אין

### W1-TEST-013 - Recommendation and approval handoff coherence
- מטרה: לוודא שהמלצת המערכת מוצגת למשתמש עם `why now`, `impact`, `CTA` ו־approval handoff ברור
- מקורות אמת:
  - `src/core/next-task-selection-resolver.js`
  - `src/core/next-task-presentation-model.js`
  - `src/core/next-task-approval-handoff-panel.js`
  - `src/core/recommendation-display-contract.js`
  - `src/core/recommendation-summary-panel.js`
  - `src/core/cockpit-recommendation-surface.js`
  - `test/next-task-selection-resolver.test.js`
  - `test/next-task-presentation-model.test.js`
  - `test/next-task-approval-handoff-panel.test.js`
  - `test/recommendation-display-contract.test.js`
  - `test/recommendation-summary-panel.test.js`
  - `test/cockpit-recommendation-surface.test.js`
  - `test/web-app-wave1-cockpit.test.js`
- סטטוס: עבר
- לקח: שכבת ה־recommendation וה־approval handoff מחוברת עכשיו גם ל־state וגם ל־surface. ההמלצה כבר לא מוצגת כ־metric חלקי אלא כיחידת עבודה קריאה עם handoff ברור.
- באגים שנפתחו: אין

### W1-TEST-014 - Editable proposal and partial acceptance flow
- מטרה: לוודא שאפשר לערוך proposal, לשמור annotations, לייצר revision, ולאשר חלקית בלי לשבור history
- מקורות אמת:
  - `src/core/editable-proposal-schema.js`
  - `src/core/proposal-editing-system.js`
  - `src/core/partial-acceptance-flow.js`
  - `test/editable-proposal-schema.test.js`
  - `test/proposal-editing-system.test.js`
  - `test/partial-acceptance-flow.test.js`
  - `test/context-builder.test.js`
  - `test/project-service.test.js`
- סטטוס: עבר
- לקח: שכבת ה־human editing וה־partial acceptance של `Wave 1` מחזיקה revision, annotations, history ו־remaining scope בצורה עקבית. אין כרגע evidence לשבירת proposal history או לאובדן scope אחרי partial acceptance.
- באגים שנפתחו: אין

### W1-TEST-015 - Full Wave 1 regression
- מטרה: לוודא שכל שכבות `Wave 1` הממומשות עוברות רגרסיה רוחבית אחת לפני מעבר ל־`Wave 2`
- מקורות אמת:
  - `npm test`
  - כלל קבצי `test/`
- סטטוס: עבר
- לקח: הרגרסיה הרוחבית המלאה עברה בהצלחה על כלל הפרויקט. כל שכבות `Wave 1` הממומשות עוברות את הסבב האוטומטי הנוכחי בלי failures.
- באגים שנפתחו: אין

### W1-TEST-016 - Backend happy path through ProjectService
- מטרה: לוודא שהלופ החדש באמת runnable דרך שכבת השירות, מקצה לקצה: `signup -> project draft -> onboarding -> bootstrap -> recommendation -> editable proposal -> partial acceptance`
- מקורות אמת:
  - `src/core/project-service.js`
  - `src/core/onboarding-service.js`
  - הרצת תרחיש ישיר דרך `ProjectService` ב־Node
- סטטוס: עבר
- לקח: כשה־payloads נשלחים בצורה הנכונה ובסדר הנכון, שכבת השירות מצליחה לייצר `projectDraft`, `onboardingSession`, `initialProjectState`, `recommendationDisplay`, `editableProposal` ו־`partialAcceptanceDecision`.
- באגים שנפתחו: אין

### W1-TEST-017 - Backend API completeness for the new Wave 1 loop
- מטרה: לוודא שהלופ החדש לא רק קיים בשירותים פנימיים אלא גם נגיש דרך שכבת ה־API בפועל
- מקורות אמת:
  - `src/server.js`
  - `src/core/project-service.js`
  - סקירת routes והצלבה מול משימות `project draft`, `proposal editing`, `partial acceptance`
- סטטוס: עבר
- לקח: השרת חושף עכשיו גם `project draft creation` וגם mutation endpoints ל־`proposal editing` ו־`partial acceptance`, כך שהלופ החדש runnable דרך backend surface ולא רק דרך state פנימי.
- באגים שנפתחו: אין

### W1-TEST-018 - Onboarding finish guardrail
- מטרה: לוודא שסיום onboarding ללא intake מספק נחסם בצורה בטוחה ולא קורס
- מקורות אמת:
  - `src/core/project-service.js`
  - `src/core/onboarding-service.js`
  - הרצת תרחיש ישיר של `finishOnboardingSession()` על session חלקי
- סטטוס: עבר
- לקח: `finishOnboardingSession()` מחזיר עכשיו block/validation result קריא על session חלקי, ולא מתקדם ל־bootstrap לא תקין ולא קורס.
- באגים שנפתחו: אין

## תוצאות סבב הבדיקות

### סיכום מצב
- יציבות Wave 1: יציבה ברמת מודולים, schemas, integration, backend surface ו־product surface.
- מה נשבר: לא נמצא כרגע באג חוסם פתוח בסבב ה־validation הנוכחי.
- מה חלש מוצרית: עדיין ייתכנו פערי חוויה או edge cases שלא מכוסים בסבב האוטומטי, אבל לא נשאר באג feasibility/backend חוסם פתוח.
- מה חייבים לתקן לפני Wave 2: אין כרגע חסם פתוח מתוך סבב ה־validation הזה.
- מה אפשר לדחות: ליטוש copy משני או הרחבות presentation שאינן חוסמות מעבר.

### תוצאת הרגרסיה הרוחבית
- פקודה: `npm test`
- תוצאה: `623/623` עברו
- מסקנה: כל המשימות הממומשות של `Wave 1` עברו את סבב הבדיקות האוטומטי הנוכחי

### רשימת באגים פתוחים לטיפול
אין

## V2-W1-BUG-004 - אין backend API ל־project draft creation למרות שהשירות קיים
- סטטוס: נפתר
- חומרה: קריטי
- אזור: cross-layer
- התגלה ב: `W1-TEST-017` / סקירת `src/server.js` מול `src/core/project-service.js`
- תיאור:
  `ProjectService` כולל `createProjectDraft()`, `projectCreationExperience` ו־`projectCreationRedirect`, אבל `server.js` לא חושף endpoint שמאפשר ליצור draft חדש אחרי auth. בפועל ה־flow `post-auth -> project creation` לא runnable דרך ה־backend API.
- צעדי שחזור:
  1. לפתוח את [`/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js`](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js) ולראות שקיימת מתודה `createProjectDraft()`.
  2. לפתוח את [`/Users/yogevlavian/Desktop/The Nexus/src/server.js`](/Users/yogevlavian/Desktop/The%20Nexus/src/server.js) ולראות שאין route ליצירת `projectDraft`.
  3. לוודא שהשרת חושף `auth` ו־`onboarding`, אבל אין path ל־`project creation` כשלב backend רשמי.
- תוצאה בפועל:
  ה־project creation layer קיים רק כשירות פנימי, לא כ־API runnable.
- תוצאה צפויה:
  צריך להיות endpoint backend רשמי ליצירת `projectDraft` ולהחזרת `projectCreationExperience` ו־`projectCreationRedirect`.
- הערות:
  זה חוסם את המסלול הרשמי `auth -> project creation -> onboarding` ברמת backend ownership.
  מימוש הושלם:
  - נוסף route ייעודי `POST /api/project-drafts`
  - ה־route מחובר ל־`ProjectService.createProjectDraft()`
  - ה־response מחזיר `projectDraft`, `projectDraftId`, `projectCreationExperience`, `projectCreationRedirect`
  אימות לאחר התיקון:
  - `node --test test/server-health-endpoints.test.js test/project-service.test.js` עבר בהצלחה
  - `npm test` עבר מלא: `619/619`
- משימת תיקון טכנית:
  - כותרת: `Expose project draft creation over the backend API`
  - מטרה:
    להפוך את `project creation` לחלק runnable מה־backend flow במקום שירות פנימי בלבד.
  - קבצים רלוונטיים:
    - `src/server.js`
    - `src/core/project-service.js`
  - דרישות מימוש:
    - להוסיף route ייעודי ליצירת `projectDraft`
    - להחזיר גם `projectCreationExperience` ו־`projectCreationRedirect`
    - לדרוש user context תקין אחרי auth
  - בדיקות נדרשות:
    - API test ליצירת `projectDraft`
    - בדיקת רגרסיה ל־`postAuthRedirect -> project creation`
    - בדיקה שה־draft נשמר ונשלף נכון

## V2-W1-BUG-005 - proposal editing ו־partial acceptance קיימים ב־state בלבד ואין להם mutation flow אמיתי
- סטטוס: נפתר
- חומרה: קריטי
- אזור: cross-layer
- התגלה ב: `W1-TEST-017` / סקירת `src/server.js`, `src/core/project-service.js`
- תיאור:
  `editableProposal`, `editedProposal`, `proposalEditHistory`, `partialAcceptanceDecision` ו־`remainingProposalScope` מסוריאלזים כחלק מ־project state, אבל אין ב־`ProjectService` mutation methods ייעודיות ואין ב־`server.js` endpoints שמאפשרים לשלוח `userEditInput` או `approvalOutcome` אמיתיים. הלופ החדש נשאר read-only.
- צעדי שחזור:
  1. לפתוח את [`/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js`](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js) ולראות שהערכים מסוריאלזים ל־state.
  2. לחפש ב־[`/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js`](/Users/yogevlavian/Desktop/The%20Nexus/src/core/project-service.js) וב־[`/Users/yogevlavian/Desktop/The Nexus/src/server.js`](/Users/yogevlavian/Desktop/The%20Nexus/src/server.js) ולראות שאין mutation methods/endpoints עבור `proposal editing` או `partial acceptance`.
- תוצאה בפועל:
  שכבת ה־proposal loop נבנית אוטומטית ב־state, אבל המשתמש/לקוח לא יכול להפעיל את הלופ דרך backend אמיתי.
- תוצאה צפויה:
  צריך להיות mutation flow שמקבל `userEditInput` ו־`approvalOutcome`, מעדכן proposal history, ומחזיר revised proposal + partial acceptance result.
- הערות:
  זה חוסם את סוף הלופ החדש שהוגדר ב־`Wave 1`.
  מימוש הושלם:
  - נוספו service mutations:
    - `submitProposalEdits()`
    - `submitPartialAcceptance()`
  - נוספו endpoints:
    - `POST /api/projects/:projectId/proposal-edits`
    - `POST /api/projects/:projectId/partial-acceptance`
  - נוספה בדיקת flow אמיתית דרך `ProjectService` שמוודאת revision, history ו־partial acceptance עם rejected scope
  - נוספו API tests לשני ה־mutation endpoints
  אימות לאחר התיקון:
  - `node --test test/project-service.test.js test/server-health-endpoints.test.js` עבר בהצלחה: `30/30`
  - `npm test` עבר מלא: `623/623`
- משימת תיקון טכנית:
  - כותרת: `Expose proposal editing and partial acceptance as backend mutations`
  - מטרה:
    להפוך את ה־proposal loop ל־runnable backend flow ולא רק serialized state.
  - קבצים רלוונטיים:
    - `src/core/project-service.js`
    - `src/server.js`
    - `src/core/proposal-editing-system.js`
    - `src/core/partial-acceptance-flow.js`
  - דרישות מימוש:
    - להוסיף service methods ל־proposal edit submit ול־partial acceptance submit
    - להוסיף endpoints מקבילים בשרת
    - לשמור history עקבי ולעדכן state/remaining scope
  - בדיקות נדרשות:
    - API test לשליחת edit על proposal
    - API test ל־partial acceptance עם rejected scope
    - בדיקת רגרסיה לשמירת history אחרי revision

## V2-W1-BUG-006 - `finishOnboardingSession()` קורס על session חלקי במקום להחזיר block/validation result
- סטטוס: נפתר
- חומרה: קריטי
- אזור: cross-layer
- התגלה ב: `W1-TEST-018` / הרצת תרחיש ישיר דרך `ProjectService`
- תיאור:
  כאשר יוצרים session חלקי בלי `goal/intake` מספיקים ומנסים לסיים onboarding, `finishOnboardingSession()` מתקדם ל־bootstrap ואז נופל ב־`TypeError: Cannot read properties of undefined (reading 'id')` במקום להחזיר תוצאת חסימה ברורה.
- צעדי שחזור:
  1. לבצע signup למשתמש חדש.
  2. ליצור `projectDraft` עם `projectName` בלבד.
  3. ליצור `onboardingSession` עם `initialInput` חלקי.
  4. לקרוא ל־`finishOnboardingSession(sessionId)`.
- תוצאה בפועל:
  מתקבלת קריסה תפעולית (`TypeError`) במקום תשובת validation/block.
- תוצאה צפויה:
  הסיום צריך להיחסם בצורה בטוחה עם תוצאה מפורשת שמסבירה שחסרים `goal/intake` לפני bootstrap.
- הערות:
  זה באג feasibility מובהק: flow לא תקין לא אמור להפיל את שכבת השירות.
  מימוש הושלם:
  - נוסף readiness gate ב־`ProjectService.finishOnboardingSession()`
  - `finishOnboardingSession()` משתמש עכשיו ב־`onboardingCompletionDecision` וב־`onboardingStateHandoff` לפני bootstrap
  - במקרה לא מוכן מוחזר `blocked result` קריא עם `error`, `onboardingCompletionDecision`, `onboardingStateHandoff`
  - תרחיש תקין ממשיך ל־bootstrap כרגיל
  אימות לאחר התיקון:
  - `node --test test/project-service.test.js` עבר בהצלחה
  - `npm test` עבר מלא: `620/620`
- משימת תיקון טכנית:
  - כותרת: `Guard onboarding finish before bootstrap`
  - מטרה:
    לוודא ש־`finishOnboardingSession()` מחזיר block/validation result על session לא מוכן במקום לקרוס.
  - קבצים רלוונטיים:
    - `src/core/project-service.js`
    - `src/core/onboarding-service.js`
    - `src/core/onboarding-completion-evaluator.js`
    - `src/core/onboarding-to-state-handoff-contract.js`
  - דרישות מימוש:
    - להוסיף readiness gate לפני bootstrap
    - להשתמש ב־completion/handoff outputs הקיימים במקום לעקוף אותם
    - להחזיר error envelope או blocked result קריא
  - בדיקות נדרשות:
    - תרחיש finish על session חלקי שלא קורס
    - תרחיש finish תקין שממשיך ל־bootstrap
    - בדיקת רגרסיה לכך שלא נוצר project לא תקין

## באגים שנפתחו

## V2-W1-BUG-001 - שכבות Wave 1 מסוריאלזות מהשרת אבל לא ממומשות ב־cockpit UI
- סטטוס: נפתר
- חומרה: קריטי
- אזור: cross-layer
- התגלה ב: `W1-TEST-011` / בדיקת `context-builder`, `project-service`, `web/index.html`, `web/app.js`
- תיאור:
  `project-service` מחזיר ללקוח את רוב תוצרי `Wave 1` כולל `screenValidationChecklist`, `designTokens`, `screenReviewReport`, `aiLearningWorkspaceTemplate`, `companionState`, `collaborationFeed`, `snapshotRecord`, `restoreDecision`, `rollbackExecutionResult` ו־`realtimeEventStream`, אבל ה־cockpit לא מציג כמעט אף אחד מהם. בפועל ה־UI נשאר ממוקד ב־status, approvals, scan, analysis, graph, agents ו־events.
- צעדי שחזור:
  1. לפתוח את [project-service.js](/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js#L800) ולראות ששכבות `Wave 1` נשלחות ב־payload של הפרויקט.
  2. לפתוח את [index.html](/Users/yogevlavian/Desktop/The Nexus/web/index.html#L25) ולראות שה־layout כולל רק אזורי overview ישנים ו־advanced details בסיסיים.
  3. לפתוח את [app.js](/Users/yogevlavian/Desktop/The Nexus/web/app.js#L300) ולראות ש־`loadProject` מרנדר רק `renderTop`, `renderCritical`, `renderMissing`, `renderExisting`, `renderLive`, `renderDecision`, `renderExternal`, `renderScanner`, `renderAnalysis`, `renderGraph`, `renderAgents`, `renderEvents`.
- תוצאה בפועל:
  שכבות `Wave 1` קיימות ב־state וב־serialization, אבל לא קיימות כ־surface מוצרי ממשי.
- תוצאה צפויה:
  ה־cockpit אמור להציג לפחות את שכבות ה־AI learning, AI companion, collaboration, versioning ו־screen review כחלק אינטגרלי ממסך העבודה.
- הערות:
  זה הכשל המרכזי של `Wave 1 Validation Gate`: המערכת יודעת יותר ממה שהמוצר מראה.
  מימוש הושלם:
  - נוספו אזורי workbench ייעודיים ל־`screen review`, `AI learning`, `AI companion`, `collaboration` ו־`versioning`
  - `web/app.js` חובר ישירות ל־payload הקנוני ומרנדר את שכבות `Wave 1` כחלק מהמסך הראשי
  - נוסף טסט `test/web-app-wave1-cockpit.test.js` שמוודא שה־DOM מציג `screenReviewReport`, `learningInsightViewModel`, `companionPanel`, `collaborationFeed` ו־`snapshotRecord`
  אימות לאחר התיקון:
  - `node --test test/web-app-wave1-cockpit.test.js test/project-service.test.js` עבר בהצלחה
- משימת תיקון טכנית:
  - כותרת: `Productize Wave 1 context in the cockpit surface`
  - מטרה:
    להפוך את תוצרי `Wave 1` מחלקים חבויים ב־payload לאזורים גלויים, קריאים ושימושיים בתוך ה־cockpit.
  - קבצים רלוונטיים:
    - `src/core/project-service.js`
    - `web/index.html`
    - `web/app.js`
    - `web/styles.css`
  - דרישות מימוש:
    - להוסיף אזורי UI ייעודיים ל־AI learning outputs, AI companion state/panel, collaboration feed, snapshot/versioning controls ו־screen review state.
    - לחבר כל אזור לנתונים הקנוניים שכבר נשלחים מהשרת במקום ליצור שכבת תצוגה חלופית.
    - לאחד את מסך העבודה סביב workbench ברור במקום רשימת כרטיסים כללית.
    - לוודא שהשכבות החדשות מוצגות כחלק מאותו flow עבודה ולא כ־debug dump.
  - בדיקות נדרשות:
    - UI integration שמוודא ש־payload עם `aiLearningWorkspaceTemplate`, `companionState`, `collaborationFeed` ו־`snapshotRecord` אכן מוצג ב־DOM.
    - בדיקה שה־project surface לא נשאר מוגבל רק ל־overview, scan, analysis ו־events.
    - בדיקה שמעבר בין פרויקטים שומר על עקביות בכל אזורי `Wave 1`.

## V2-W1-BUG-002 - שכבת real-time קיימת במודל אבל הלקוח נשאר manual refresh בלבד
- סטטוס: נפתר
- חומרה: גבוה
- אזור: realtime
- התגלה ב: `W1-TEST-011` / בדיקת `realtimeEventStream`, `liveUpdateChannel`, `web/app.js`
- תיאור:
  קיימים `realtimeEventStream` ו־`liveUpdateChannel` ב־context וב־payload, אך ה־web client לא משתמש בהם. ב־`app.js` כל עדכון מתבצע רק אחרי לחיצה על `run-cycle`, `analyze`, `scan` או `sync-casino`, ואז נטען מחדש כל הפרויקט.
- צעדי שחזור:
  1. לפתוח את [project-service.js](/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js#L895) ולראות שהשירות מחזיר `realtimeEventStream` ו־`liveUpdateChannel`.
  2. לפתוח את [app.js](/Users/yogevlavian/Desktop/The Nexus/web/app.js#L331) ולראות שהעדכונים מתבצעים רק ב־click handlers שמבצעים `await loadProject(currentProjectId)`.
  3. לוודא שאין ב־[app.js](/Users/yogevlavian/Desktop/The Nexus/web/app.js) שימוש ב־`WebSocket`, `EventSource`, polling loop או צריכה ישירה של `realtimeEventStream`.
- תוצאה בפועל:
  השכבה מוגדרת אך לא מורגשת; החוויה בזמן אמת אינה קיימת בפועל.
- תוצאה צפויה:
  שינויים ב־progress וב־event stream צריכים להופיע במסך חי או לפחות דרך channel/polling ברור, בלי תלות ברענון ידני בלבד.
- הערות:
  זה פוגע ישירות בקריטריון ה־Validation Gate של "real-time/progress מרגישים חיים ולא מרעישים".
  מימוש הושלם:
  - נוסף endpoint ייעודי `GET /api/projects/:id/live-state` שמחזיר `progressState`, `reactiveWorkspaceState`, `realtimeEventStream`, `liveUpdateChannel`, `collaborationFeed` ו־`events`
  - `web/app.js` שומר state מקומי לפרויקט, מתזמן refresh לפי `liveUpdateChannel.reconnectPolicy`, ומרענן רק את אזורי ה־live/collaboration/events בלי reload מלא של כל הפרויקט
  - אזור `מה קורה כרגע` מציג עכשיו גם channel mode, refresh strategy, progress live ושתי הודעות stream אחרונות
  - נוסף כיסוי טסט שמוודא scheduling אוטומטי ו־DOM update דרך `refreshLiveState()` ללא click handlers
  אימות לאחר התיקון:
  - `node --test test/web-app-wave1-cockpit.test.js test/server-health-endpoints.test.js test/live-update-transport-layer.test.js test/realtime-event-stream-schema.test.js` עבר בהצלחה
- משימת תיקון טכנית:
  - כותרת: `Connect live update channels to the cockpit`
  - מטרה:
    לחבר את שכבת ה־real-time הקנונית ללקוח כך ש־progress, runtime signals ו־workspace activity יתעדכנו בצורה חיה ומבוקרת.
  - קבצים רלוונטיים:
    - `src/core/realtime-event-stream-schema.js`
    - `src/core/live-update-transport-layer.js`
    - `src/core/project-service.js`
    - `src/server.js`
    - `web/app.js`
  - דרישות מימוש:
    - לחשוף transport אמיתי ללקוח או fallback polling מוגדר היטב.
    - לרנדר שינויים אינקרמנטליים ב־progress, events ו־activity בלי reload מלא של כל הפרויקט בכל פעולה.
    - להשתמש ב־`realtimeEventStream`/`liveUpdateChannel` כמקור אמת ולא לבנות stream מקביל.
    - להבטיח שמנגנון העדכון לא יוצר רעש חזותי מיותר.
  - בדיקות נדרשות:
    - בדיקת לקוח שמוודאת ש־progress מתעדכן ללא לחיצה ידנית נוספת.
    - בדיקת fallback כשה־channel ריק או לא זמין.
    - בדיקת רגרסיה לכך שכפתורי הפעולה לא נדרשים כדי לראות כל שינוי runtime.

## V2-W1-BUG-003 - מערכת העיצוב הקנונית לא מניעה את ה־web UI בפועל
- סטטוס: נפתר
- חומרה: גבוה
- אזור: design-system
- התגלה ב: `W1-TEST-011` / בדיקת `designTokens`, `typographySystem`, `layoutSystem`, `colorRules`, `web/styles.css`
- תיאור:
  מערכת העיצוב של `Wave 1` קיימת כמודולים קנוניים ונשלחת כחלק מה־project payload, אבל ה־web UI משתמש בערכי CSS קשיחים משלו. ב־`styles.css` מוגדרים ישירות colors, font family, radii, spacing ו־grid values, בלי חיבור ל־`designTokens`, `typographySystem` או `layoutSystem`.
- צעדי שחזור:
  1. לפתוח את [project-service.js](/Users/yogevlavian/Desktop/The Nexus/src/core/project-service.js#L801) ולראות שהשרת מחזיר `designTokens`, `typographySystem`, `layoutSystem`, `colorRules` ו־`interactionStateSystem`.
  2. לפתוח את [styles.css](/Users/yogevlavian/Desktop/The Nexus/web/styles.css#L1) ולראות variables hard-coded כמו `--bg`, `--panel`, `--ink`, וכן font קבוע `Georgia`.
  3. לוודא שב־[app.js](/Users/yogevlavian/Desktop/The Nexus/web/app.js) אין צריכה של `designTokens` או הזרמה שלהם ל־DOM/CSS.
- תוצאה בפועל:
  יש design system קנוני, אבל ה־UI בפועל נשען על style sheet נפרד ולא מסונכרן.
- תוצאה צפויה:
  ה־web UI אמור להשתמש במערכת העיצוב הקנונית כמקור אמת, כך ששינויים בטוקנים ובמערכות הנגזרות ישפיעו ישירות על המוצר.
- הערות:
  כל עוד זה נשאר כך, קשה לטעון ל־design system consistency ברמת מוצר, גם אם כל טסטי היחידה הירוקים.
  מימוש הושלם:
  - `web/app.js` מזריק עכשיו `CSS custom properties` ישירות מ־`designTokens`, `typographySystem`, `layoutSystem` ו־`colorRules`
  - `web/styles.css` עבר לשימוש ב־design variables עם fallback קנוני במקום החלטות presentation קשיחות נפרדות
  - טסט ה־cockpit עודכן כדי לוודא ש־`--bg`, `--font-body`, `--layout-max-width` ו־`--space-lg` נגזרים מה־payload
  אימות לאחר התיקון:
  - `node --test test/web-app-wave1-cockpit.test.js test/design-token-schema.test.js test/typography-system.test.js test/spacing-layout-system.test.js test/color-usage-rules.test.js` עבר בהצלחה
- משימת תיקון טכנית:
  - כותרת: `Drive cockpit presentation from canonical design system outputs`
  - מטרה:
    ליישר את ה־cockpit עם מערכת העיצוב של `Wave 1` כך שה־tokens והמערכות הנגזרות יניעו את ה־presentation בפועל.
  - קבצים רלוונטיים:
    - `src/core/design-token-schema.js`
    - `src/core/typography-system.js`
    - `src/core/spacing-layout-system.js`
    - `src/core/color-usage-rules.js`
    - `web/app.js`
    - `web/styles.css`
  - דרישות מימוש:
    - למפות design tokens ל־CSS custom properties שמוזרקות ל־client.
    - ליישר typography, spacing, color roles ו־interaction states לנתונים הקנוניים.
    - להסיר hard-coded presentation decisions שמתנגשות עם שכבת העיצוב.
    - לשמור על fallback סביר כשה־tokens לא זמינים.
  - בדיקות נדרשות:
    - בדיקת UI שמוודאת שערכי העיצוב ב־DOM נגזרים מה־payload הקנוני.
    - בדיקה ששינוי design token משפיע על הרינדור בלי עריכה ידנית של stylesheet נפרד.
    - בדיקת fallback כשה־design system לא נטען.

## החלטת שער האימות
- סטטוס שער: עבר
- החלטה: GO
- גל: `Wave 1`
- היקף שאומת:
  - כל משימות `Wave 1` הממומשות
  - feasibility backend מלא של הלופ החדש
  - רגרסיה רוחבית מלאה
- תוצאת אימות סופית:
  - `623/623` טסטים עברו
  - אין באגים חוסמים פתוחים
  - `Wave 1` סגור רשמית ומאושר למעבר ל־`Wave 2`
