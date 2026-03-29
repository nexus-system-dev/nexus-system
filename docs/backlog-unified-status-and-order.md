# Nexus Unified Backlog Status And Order

מסמך זה מכיל את כל המשימות מתוך ה־source of truth, עם כל הפירוט הטכני, ובצד כל משימה סטטוס מימוש בפועל.

מקרא:
- 🟢 `בוצע`
- 🟡 `חלקי`
- 🔴 `לא בוצע`

## סדר מימוש נכון
הערה: זהו סדר העבודה בפועל על הפרויקט מכאן והלאה, לפי `critical path` לגרסה עובדת.  
ה־source of truth של המשימות בהמשך המסמך נשאר כמו שהוא; מה שמשתנה כאן הוא סדר המימוש בפועל.

1. `Context Builder`
2. `Canonical Schema`
3. `Source Adapter Layer`
4. `Project State`
5. `Onboarding Engine`
6. `Universal Project Lifecycle`
7. `Expanded Domain Adaptation`
8. `Smart Defaults Engine`
9. `Business Context Layer`
10. `Decision Intelligence Layer`
11. `Execution Graph`
12. `Task Result Ingestion`
13. `Scheduler`
14. `Agent Runtime`
15. `Execution Surface Layer`
16. `סביבת הרצה בטוחה`
17. `יכולות execution אמיתיות`
18. `Project Bootstrap Layer`
19. `Execution Feedback Layer`
20. `Developer Workbench & Execution Topology`
21. `External Accounts Connector`
22. `Source Control Integration Runtime`
23. `Credentials Management`
24. `Identity & Auth`
25. `Workspace & Access Control`
26. `Build & Release System`
27. `Testing & Quality Assurance Layer`
28. `Delivery / Release Flow`
29. `Deployment & Hosting Orchestrator`
30. `Release Status Tracking`
31. `Approval System`
32. `Policy Layer`
33. `Diff Preview`
34. `Distribution Ownership Model`
35. `Application Runtime Layer`
36. `Nexus Persistence Layer`
37. `Notification System`
38. `Nexus Product Go-To-Market`
39. `Nexus Product Analytics`
40. `Platform Cost & Usage Control`
41. `Billing & Monetization System`
42. `Platform Observability`
43. `Backup & Recovery`
44. `Security Hardening`
45. `Cross-Project Memory`
46. `Learning Layer`
47. `Scalability`

---

## מסגור גרסאות
הערה: זהו מיפוי מוצרי של ה־backlog לגרסאות עבודה.  
הוא לא מחליף dependencies, לא עוקף את `סדר מימוש נכון`, ולא משנה את מקור האמת של המשימות.

כללים:
- אם משימה מסווגת ל־`v1`, עדיין חייבים לממש אותה רק אחרי ה־dependencies שלה.
- אם במהלך העבודה מתגלה חוסר חדש, מותר להוסיף אותו, ואז למפות אותו לגרסה המתאימה.
- אם משימה תפעולית/מוצרית דורשת ייצוג למשתמש, לבעלים או למפעיל, צריך להוסיף לה מקבילה ב־`UI / UX Foundation` או ב־`Developer Workbench & Execution Topology` או ב־`Owner Control Plane`, לפי ההקשר.
- המעבר בין `v1`, `v2`, `v3` הוא שכבתית: קודם יכולת עובדת, אחר כך מעטפת מוצר, אחר כך עומק, למידה וסקייל.

### `v1` — גרסה עובדת ראשונה
מטרה:
- להביא את Nexus למצב שבו אפשר להיכנס, ליצור פרויקט, להריץ לפחות flow אמיתי אחד מקצה לקצה, לראות מה קרה, ולהמשיך לעבוד מתוך Nexus.

Release mode:
- `closed alpha`
- קודם אתה
- אחר כך invite only / waitlist קטן

כולל:
- `Onboarding Engine`
- `Universal Project Lifecycle`
- `Expanded Domain Adaptation`
- `Smart Defaults Engine`
- `Business Context Layer`
- `Decision Intelligence Layer`
- `Execution Graph`
- `Task Result Ingestion`
- `Scheduler`
- `Agent Runtime`
- `Execution Surface Layer`
- `Project Bootstrap Layer`
- `Execution Feedback Layer`
- `Developer Workbench & Execution Topology`
- `External Accounts Connector`
- `Source Control Integration Runtime`
- `Credentials Management`
- `Identity & Auth`
- `Workspace & Access Control`
- `Build & Release System`
- `Testing & Quality Assurance Layer`
- `Delivery / Release Flow`
- `Deployment & Hosting Orchestrator`
- `Release Status Tracking`
- `Approval System`
- `Policy Layer`
- `Diff Preview`
- `Distribution Ownership Model`
- `Application Runtime Layer`
- `Nexus Persistence Layer`
- `Notification System`
- `Product Website & Conversion Funnel`
- `Landing, Access & App Entry Flow`
- `Product-Led Onboarding Marketing`

מה `v1` אמור לדעת לעשות:
- משתמש נכנס ל־Nexus דרך web app
- נרשם / מתחבר
- יוצר פרויקט
- עובר onboarding
- Nexus בונה `Project State`
- נטענות או נוצרות משימות
- המערכת בוחרת משימה הבאה
- מתבצע לפחות execution flow אמיתי אחד
- מתקבל `executionResult`
- התוצאה נקלטת ומעדכנת state/graph
- המשתמש רואה diff, logs, approvals ו־next action

### `v2` — מוצר אמיתי מנוהל
מטרה:
- להפוך את Nexus ממערכת עובדת למוצר שאפשר לנהל, למדוד, לתפעל, להפיץ ולשלוט בו.

Release mode:
- `private beta` או `invite only` רחב יותר
- התחלת onboarding למשתמשים חיצוניים אמיתיים

כולל:
- `Nexus Product Go-To-Market`
- `Nexus Product Analytics`
- `Platform Cost & Usage Control`
- `Billing & Monetization System`
- `Platform Observability`
- `Backup & Recovery`
- `Security Hardening`
- `Owner Control Plane`
- `UI / UX Foundation`
- `Real-Time Experience Layer`
- `Collaboration Layer`
- `Project Permission Matrix`
- `Multi-Tenancy & Workspace Isolation`
- `Project State Versioning`

מה `v2` מוסיף מעבר ל־`v1`:
- אתר מוצר ו־funnel מסודר
- מדידה של acquisition, activation, retention ו־revenue
- cost visibility ו־billing
- owner cockpit
- health/readiness/alerts
- security ו־recovery טובים יותר
- UX יותר שלם ומנוהל

### `v3` — עומק, למידה וסקייל
מטרה:
- להפוך את Nexus למערכת מצטברת, לומדת, ניתנת להרחבה וקשה יותר להעתקה.

Release mode:
- `public beta` / `early access` רחב / rollout מבוקר
- תלוי ביציבות של `v2`

כולל:
- `Cross-Project Memory`
- `Learning Layer`
- `Scalability`
- `Organization Intelligence & Operating Model`
- `Advanced Growth Intelligence`
- `Business Viability & Infrastructure`
- `Strategic Validation & Guided Discovery`
- `Extensibility Framework`
- `Product Boundary Model`

מה `v3` מוסיף מעבר ל־`v2`:
- patterns חוצי־פרויקטים
- learning והמלצות משופרות
- organization/team intelligence
- growth intelligence מתקדם
- תשתית סקייל, reliability ו־continuity עמוקים יותר
- מערכת שמתחילה להיראות כמו operating system מלא לפרויקטים

הערת תכנון:
- כרגע `v1`, `v2`, `v3` מוגדרות רשמית.
- `v4+` יוגדרו רק אחרי ש־`v1` תעבוד בפועל ו־`v2` תהיה ממוסגרת טוב יותר לפי data אמיתי.

---

## כל המשימות עם סטטוס

# Nexus Backlog Source Of Truth

מסמך זה הוא מקור האמת המחייב לרשימת המשימות של `Nexus`.

כל עבודה חדשה צריכה להיגזר מהרשימה הזו בלבד.

אסור:
- למחוק סעיפים מהרשימה
- לשנות סדר
- לשכתב שמות
- להוסיף שכבות חדשות בלי אישור מפורש

מותר:
- לפרק סעיפים קיימים לתת-משימות טכניות
- לעדכן סטטוס ביצוע של סעיפים קיימים

## סדר עדיפויות מעודכן

### שלב 0 — התחלת פרויקט

#### 1. `Onboarding Engine`

Refinements מאושרים:
- להוסיף `signal provenance`
- להוסיף `confidence tags`

משימות טכניות:

1. `Create onboarding session service`  | סטטוס: 🟢 בוצע
- description: לבנות service שמייצר ומנהל session של onboarding עבור פרויקט חדש
- input:
  - `userId`
  - `projectDraftId`
  - `initialInput`
- output:
  - `onboardingSession`
  - `sessionId`
  - `currentStep`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create project intake parser`  | סטטוס: 🟢 בוצע
- description: לבנות parser שמקבל חזון, טקסט חופשי, קבצים וקישורים ומחלץ מהם מבנה intake ראשוני
- input:
  - `visionText`
  - `uploadedFiles`
  - `externalLinks`
- output:
  - `projectIntake`
  - `parsedSignals`
  - `missingInputs`
- dependencies:
  - `Context Builder`  | סטטוס: 🟢 בוצע
  - `Knowledge Ingestion`
- connects_to: `Project State`

3. `Create onboarding step resolver`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שקובע איזה שלב onboarding להציג עכשיו לפי מצב הקליטה ומה עדיין חסר
- input:
  - `onboardingSession`
  - `projectIntake`
- output:
  - `currentStep`
  - `nextStep`
  - `requiredActions`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create onboarding command handlers`  | סטטוס: 🟢 בוצע
- description: לבנות handlers לפעולות כמו יצירת פרויקט, העלאת איפיון, חיבור repo, אישור בחירות והמשך לשלב הבא
- input:
  - `sessionId`
  - `actionType`
  - `payload`
- output:
  - `updatedSession`
  - `projectDraft`
- dependencies:
  - `GitHub / GitLab Integration`
  - `Knowledge Ingestion`
- connects_to: `Project State`

פירוק נוסף:

1. `Create onboarding action registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry שממפה `actionType` ל־handler מתאים עם ולידציה בסיסית לכל פעולה
- input:
  - `actionType`
  - `payload`
- output:
  - `resolvedHandler`
  - `actionSchema`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create project draft mutation handler`  | סטטוס: 🟢 בוצע
- description: לבנות handler שמעדכן `projectDraft` עבור פעולות יצירה ועדכון של טיוטת פרויקט
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `projectDraft`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create intake update handler`  | סטטוס: 🟢 בוצע
- description: לבנות handler שמקבל טקסט, קבצים וקישורים ומעדכן את `projectIntake` של ה־session
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `projectIntake`
- dependencies:
  - `Create project intake parser`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create repo connection handler`  | סטטוס: 🟢 בוצע
- description: לבנות handler שמקבל פרטי repo, שומר source מחובר ומעדכן את ה־session
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `connectedSource`
- dependencies:
  - `GitHub / GitLab Integration`
- connects_to: `Project State`

5. `Create approval capture handler`  | סטטוס: 🟢 בוצע
- description: לבנות handler שמקבל אישורי משתמש ושומר אותם בפורמט אחיד
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `approvalRecord`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create onboarding step advancement handler`  | סטטוס: 🟢 בוצע
- description: לבנות handler שמקדם את ה־session לשלב הבא לפי state ו־intake נוכחי
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `currentStep`
  - `nextStep`
- dependencies:
  - `Create onboarding step resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

7. `Create onboarding command result envelope`  | סטטוס: 🟢 בוצע
- description: לבנות envelope אחיד לתוצאות של כל command handler
- input:
  - `handlerResult`
- output:
  - `updatedSession`
  - `projectDraft`
  - `commandMetadata`
- dependencies:
  - `Create onboarding action registry`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create onboarding API endpoints`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints ליצירת session, עדכון intake, העלאת קבצים, קבלת step נוכחי וסיום onboarding
- input:
  - `http request`
- output:
  - `session payload`
  - `project draft payload`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
  - `Create onboarding command handlers`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Define project draft schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־`projectDraft` לפני בניית `Project State` מלא, כולל name, owner, creation source, onboarding readiness ו־bootstrap metadata
- input:
  - `userIdentity`
  - `initialInput`
- output:
  - `projectDraft`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
  - `Identity & Auth`
- connects_to: `Project State`

7. `Create project draft creation service`  | סטטוס: 🔴 לא בוצע
- description: לבנות service שיוצר `projectDraft` חדש למשתמש מחובר ומחזיר draft id שממנו נכנסים ל־onboarding
- input:
  - `userIdentity`
  - `projectCreationInput`
- output:
  - `projectDraft`
  - `projectDraftId`
- dependencies:
  - `Define project draft schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

8. `Create onboarding answer persistence store`  | סטטוס: 🔴 לא בוצע
- description: לבנות שכבת שמירה ואחזור לתשובות onboarding כדי לאפשר autosave, resume ו־audit של התפתחות ה־intake
- input:
  - `onboardingSession`
  - `projectIntake`
- output:
  - `onboardingAnswerRecord`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

9. `Create onboarding completion evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator שקובע אם נאסף מספיק intake כדי להתקדם לבניית `Project State`, או שצריך clarification נוסף
- input:
  - `projectIntake`
  - `onboardingSession`
- output:
  - `onboardingCompletionDecision`
- dependencies:
  - `Create project intake parser`  | סטטוס: 🟢 בוצע
  - `Create onboarding answer persistence store`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create onboarding-to-state handoff contract`  | סטטוס: 🔴 לא בוצע
- description: להגדיר חוזה ברור בין סוף ה־onboarding לבין יצירת `Project State` הראשוני, כולל intake, approvals, draft metadata ו־missing clarifications
- input:
  - `projectDraft`
  - `projectIntake`
  - `onboardingCompletionDecision`
- output:
  - `onboardingStateHandoff`
- dependencies:
  - `Create onboarding completion evaluator`  | סטטוס: 🔴 לא בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

11. `Create onboarding progress model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל UI להתקדמות onboarding כולל current step, completed steps, missing fields ו־resume state
- input:
  - `onboardingSession`
  - `currentStep`
- output:
  - `onboardingProgress`
- dependencies:
  - `Create onboarding step resolver`  | סטטוס: 🟢 בוצע
  - `Initial Nexus Screens`
- connects_to: `Execution Surface`

12. `Build onboarding screen flow`  | סטטוס: 🔴 לא בוצע
- description: לממש flow מסכי onboarding עם שאלות, autosave, מצבי loading/error ויכולת resume למשתמש
- input:
  - `onboardingSession`
  - `onboardingProgress`
  - `requiredActions`
- output:
  - `onboardingViewState`
- dependencies:
  - `Create onboarding progress model`  | סטטוס: 🔴 לא בוצע
  - `Create onboarding API endpoints`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### 1.5 `Project Identity & Instant Value`

משימות טכניות:

1. `Define project identity schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לזהות הפרויקט כולל name, vision, audience, success definition, differentiation ו־tone
- input:
  - `projectIntake`
  - `businessContext`
  - `domainDecision`
- output:
  - `projectIdentity`
- dependencies:
  - `Create project intake parser`  | סטטוס: 🟢 בוצע
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `projectIdentity` קנוני עם name, vision, audience, success definition, differentiation ו־tone; ה־assembler של זהות הפרויקט עדיין יוסיף בהמשך שכבת presentation ו־completeness מפורשת.

2. `Create project identity assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמרכז את זהות הפרויקט לכרטיס ברור שבו המשתמש רואה מה נבנה, למי ולפי איזה success target
- input:
  - `projectIdentity`
  - `projectDraft`
  - `onboardingSession`
- output:
  - `projectIdentityProfile`
  - `identityCompleteness`
- dependencies:
  - `Define project identity schema`  | סטטוס: 🟢 בוצע
  - `Create project draft mutation handler`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `projectIdentityProfile` ו־`identityCompleteness`; כרגע היא יודעת לעבוד גם בלי onboarding session חי דרך fallback בטוח ל־project draft בסיסי.

3. `Create instant value output resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שבוחר את התוצר המוחשי הכי מהיר שאפשר להציג מיד אחרי onboarding כמו wireframe, bootstrap, plan, repo setup או first visible artifact
- input:
  - `projectIdentity`
  - `onboardingSession`
  - `domainCapabilities`
- output:
  - `instantValuePlan`
- dependencies:
  - `Define project identity schema`  | סטטוס: 🟢 בוצע
  - `Expanded Domain Adaptation`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `instantValuePlan` קנוני שמעדיף wireframe, repo setup, plan, bootstrap או first visible artifact לפי deliverables, onboarding signals ו־domain capabilities.

4. `Create first tangible outcome generator`  | סטטוס: 🟢 בוצע
- description: לבנות generator שמרכיב את התוצר הראשון שהמשתמש יכול לראות ולהרגיש מיד אחרי onboarding לפי ה־instant value plan
- input:
  - `instantValuePlan`
  - `projectState`
  - `bootstrapResult`
- output:
  - `firstValueOutput`
- dependencies:
  - `Create instant value output resolver`  | סטטוס: 🟢 בוצע
  - `Project Bootstrap Layer`
- connects_to: `Project State`

5. `Create progress-to-reality mapper`  | סטטוס: 🟢 בוצע
- description: לבנות mapper שמתרגם progress, runs, artifacts ו־release signals לשפה של תוצאה אמיתית כמו repo created, first file generated, preview ready או deploy blocked
- input:
  - `progressState`
  - `executionResult`
  - `artifacts`
  - `releaseStateUpdate`
- output:
  - `realityProgress`
- dependencies:
  - `Execution Feedback Layer`
  - `Create first tangible outcome generator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create first value summary assembler`  | סטטוס: 🟢 בוצע
- description: לבנות summary קריא למשתמש שמחבר את זהות הפרויקט, התוצר הראשון וההתקדמות המוחשית להסבר אחד ברור של למה כדאי להמשיך עכשיו
- input:
  - `projectIdentityProfile`
  - `firstValueOutput`
  - `realityProgress`
  - `explanationPayload`
- output:
  - `firstValueSummary`
- dependencies:
  - `Create project identity assembler`  | סטטוס: 🟢 בוצע
  - `Create progress-to-reality mapper`  | סטטוס: 🟢 בוצע
  - `Explanation Layer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, ו־`firstValueSummary` כבר מחבר outcome, reality progress ו־explanation payload להסבר אחד ברור למשתמש על בסיס `project identity` שהושלמה.

7. `Create project creation experience model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל מלא ליצירת פרויקט ראשון מתוך ה־app כולל CTA, draft creation, validation, empty workspace state ו־redirect ל־onboarding
- input:
  - `workspaceModel`
  - `postLoginDestination`
- output:
  - `projectCreationExperience`
- dependencies:
  - `Create project draft creation service`  | סטטוס: 🔴 לא בוצע
  - `Landing, Access & App Entry Flow`
- connects_to: `Project State`

8. `Create project draft persistence store`  | סטטוס: 🔴 לא בוצע
- description: לבנות שכבת persistence ל־`projectDraft` כדי לאפשר continuity בין create project, onboarding ו־resume later
- input:
  - `projectDraft`
- output:
  - `projectDraftRecord`
- dependencies:
  - `Create project draft creation service`  | סטטוס: 🔴 לא בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

9. `Create post-project-creation redirect resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמחליט אם אחרי יצירת `projectDraft` המשתמש ממשיך מיד ל־onboarding, חוזר later או נשלח ל־resume flow
- input:
  - `projectDraft`
  - `projectCreationExperience`
- output:
  - `projectCreationRedirect`
- dependencies:
  - `Create project draft persistence store`  | סטטוס: 🔴 לא בוצע
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

10. `Create project ownership binding model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל שקושר `projectDraft` ו־`projectState` למשתמש, ל־workspace ול־membership המתאימים כבר מרגע היצירה
- input:
  - `projectDraft`
  - `workspaceModel`
  - `membershipRecord`
- output:
  - `projectOwnershipBinding`
- dependencies:
  - `Create project draft creation service`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

11. `Define initial project state creation contract`  | סטטוס: 🔴 לא בוצע
- description: להגדיר חוזה ברור ליצירת `Project State` ראשוני מתוך onboarding, כולל required inputs, optional metadata ו־minimum viable state
- input:
  - `onboardingStateHandoff`
  - `projectOwnershipBinding`
- output:
  - `initialProjectStateContract`
- dependencies:
  - `Create onboarding-to-state handoff contract`  | סטטוס: 🔴 לא בוצע
  - `Create project ownership binding model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

12. `Define canonical initial project state schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema קנוני ל־`initialProjectState` כולל identity, goals, constraints, readiness, ownership ו־bootstrap metadata
- input:
  - `initialProjectStateContract`
  - `projectIdentity`
- output:
  - `initialProjectState`
- dependencies:
  - `Define initial project state creation contract`  | סטטוס: 🔴 לא בוצע
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

13. `Create onboarding-to-state transformation mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות mapper שמתרגם intake, approvals, draft metadata ו־clarifications לשדות הקנוניים של `initialProjectState`
- input:
  - `onboardingStateHandoff`
  - `initialProjectState`
- output:
  - `stateBootstrapPayload`
- dependencies:
  - `Define canonical initial project state schema`  | סטטוס: 🔴 לא בוצע
  - `Create onboarding-to-state handoff contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

14. `Create project state bootstrap service`  | סטטוס: 🔴 לא בוצע
- description: לבנות service שמייצר, שומר ומחזיר `initialProjectState` שמיש מיד אחרי ה־onboarding
- input:
  - `stateBootstrapPayload`
  - `projectOwnershipBinding`
- output:
  - `initialProjectState`
  - `projectStateSnapshot`
- dependencies:
  - `Create onboarding-to-state transformation mapper`  | סטטוס: 🔴 לא בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

15. `Create initial state readiness classifier`  | סטטוס: 🔴 לא בוצע
- description: לבנות classifier שקובע אם ה־`initialProjectState` מוכן ל־task seeding, דורש הבהרות או עדיין לא יציב מספיק
- input:
  - `initialProjectState`
  - `completionCriteria`
- output:
  - `initialStateReadiness`
- dependencies:
  - `Create project state bootstrap service`  | סטטוס: 🔴 לא בוצע
  - `Create lifecycle milestone generator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

16. `Create initial state clarification request model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל שמחזיר למשתמש clarification requests כשבניית ה־state הראשוני נתקעת על פערי intake או readiness
- input:
  - `initialStateReadiness`
  - `stateBootstrapPayload`
- output:
  - `initialStateClarification`
- dependencies:
  - `Create initial state readiness classifier`  | סטטוס: 🔴 לא בוצע
  - `Execution Feedback Layer`
- connects_to: `Execution Surface`

17. `Create initial project state validation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות validator שמוודא שה־`initialProjectState` עומד ב־schema הקנוני, כולל required fields, ownership binding, readiness metadata ו־state consistency לפני המשך ל־task seeding
- input:
  - `initialProjectState`
  - `initialProjectStateContract`
- output:
  - `initialProjectStateValidation`
  - `stateValidationIssues`
- dependencies:
  - `Define canonical initial project state schema`  | סטטוס: 🔴 לא בוצע
  - `Create project state bootstrap service`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### 2. `Universal Project Lifecycle`

Refinements מאושרים:
- להוסיף `canonical phase enum`
- להוסיף `domain-specific subphase mapping`

משימות טכניות:

1. `Define lifecycle state model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל פנימי לשלבי lifecycle אחידים של פרויקט
- input:
  - `project`
  - `domain`
- output:
  - `lifecycleState`
  - `currentPhase`
  - `phaseHistory`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create lifecycle phase resolver`  | סטטוס: 🟢 בוצע
- description: לבנות function שקובעת את שלב הפרויקט הנוכחי לפי state, graph, sources ו-results
- input:
  - `projectState`
  - `executionGraph`
  - `runtimeSignals`
- output:
  - `resolvedPhase`
  - `phaseConfidence`
- dependencies:
  - `Execution Graph`  | סטטוס: 🟢 בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create lifecycle transition engine`  | סטטוס: 🟢 בוצע
- description: לבנות מנגנון שמעביר פרויקט בין שלבים לפי תנאי מעבר מוגדרים
- input:
  - `currentPhase`
  - `transitionEvents`
- output:
  - `nextPhase`
  - `transitionRecord`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

4. `Create lifecycle milestone generator`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמייצר milestones אחידים לכל שלב lifecycle
- input:
  - `domain`
  - `lifecyclePhase`
- output:
  - `milestones`
  - `completionCriteria`
- dependencies:
  - `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create live issue intake and triage flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow שמקבל bug reports מהמשתמש או מהמערכת החיה, מסווג severity, impact ו־affected scope ומייצר triage state
- input:
  - `ownerIncident`
  - `feedbackSignals`
  - `projectState`
- output:
  - `liveIssueTriage`
- dependencies:
  - `Owner Operations & Incidents`
  - `Learning Layer`
- connects_to: `Project State`

6. `Create feature request intake and expansion planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמקבל feature requests אחרי launch, מחבר אותם ל־project goals ול־live constraints ומציע expansion path
- input:
  - `featureRequest`
  - `projectState`
  - `roadmap`
- output:
  - `featureExpansionPlan`
- dependencies:
  - `Learning Layer`
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

7. `Create live-state-aware task regeneration engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחדש backlog ומשימות לפי state חי, incidents, feature requests, user feedback ו־post-launch priorities
- input:
  - `projectStateSnapshot`
  - `liveIssueTriage`
  - `featureExpansionPlan`
- output:
  - `regeneratedBacklog`
  - `regenerationReasoning`
- dependencies:
  - `Create live issue intake and triage flow`  | סטטוס: 🔴 לא בוצע
  - `Create feature request intake and expansion planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

8. `Create post-launch backlog manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שממזג backlog קיים עם maintenance, bugfix, feature expansion ו־growth follow-up למשטר עבודה אחד
- input:
  - `regeneratedBacklog`
  - `roadmap`
  - `ownerPriorityQueue`
- output:
  - `postLaunchBacklog`
- dependencies:
  - `Create live-state-aware task regeneration engine`  | סטטוס: 🔴 לא בוצע
  - `Owner Control Center`
- connects_to: `Project State`

9. `Create improvement execution loop manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שמחזיר את Nexus שוב ושוב ללולאת improvement של detect, triage, regenerate, approve ו־execute אחרי launch
- input:
  - `postLaunchBacklog`
  - `schedulerDecision`
  - `learningInsights`
- output:
  - `improvementLoopState`
- dependencies:
  - `Create post-launch backlog manager`  | סטטוס: 🔴 לא בוצע
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

10. `Create project implementation loop orchestrator`  | סטטוס: 🔴 לא בוצע
- description: לבנות orchestrator שמחזיר את הפרויקט ללולאת build רציפה של select, approve, execute, update ו־continue עד השלמת milestones
- input:
  - `schedulerDecision`
  - `updatedProjectState`
  - `lifecycleState`
- output:
  - `projectImplementationLoop`
  - `implementationLoopState`
- dependencies:
  - `Scheduler`  | סטטוס: 🟡 חלקי
  - `Execution Feedback Layer`
- connects_to: `Project State`

11. `Create feature build loop manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שמנהל לולאת בניית פיצ'רים מתוך backlog נבחר, כולל readiness, approvals, execution ו־completion tracking לכל feature increment
- input:
  - `selectedTask`
  - `projectImplementationLoop`
  - `featureExpansionPlan`
- output:
  - `featureBuildLoop`
  - `featureLoopState`
- dependencies:
  - `Create project implementation loop orchestrator`  | סטטוס: 🔴 לא בוצע
  - `Create feature request intake and expansion planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

12. `Create bug fix loop manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שמנהל לולאת תיקון באגים מקבלת issue, דרך triage ו־selection ועד execution, verification ו־closeout
- input:
  - `liveIssueTriage`
  - `schedulerDecision`
  - `productionHealthValidation`
- output:
  - `bugFixLoop`
  - `bugFixLoopState`
- dependencies:
  - `Create live issue intake and triage flow`  | סטטוס: 🔴 לא בוצע
  - `Create project implementation loop orchestrator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

13. `Create refactor and improvement loop manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager ללולאת refactor ושיפור יזום שמזהה debt, improvement opportunities ו־safe rollout path בלי לחכות רק ל־incident או feature request
- input:
  - `projectState`
  - `diffChangeExplanation`
  - `recommendationHints`
- output:
  - `refactorImprovementLoop`
  - `improvementCandidates`
- dependencies:
  - `Create project implementation loop orchestrator`  | סטטוס: 🔴 לא בוצע
  - `Cross-Project Memory`
- connects_to: `Project State`

14. `Create clarification loop manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שמחזיר את המשתמש או את המערכת ללולאת clarification כשחסר מידע לביצוע, לאישור, ל־state update או ל־replanning
- input:
  - `initialStateClarification`
  - `schedulerDecision`
  - `recommendationDisplay`
- output:
  - `clarificationLoop`
  - `clarificationRequests`
- dependencies:
  - `Create initial state clarification request model`  | סטטוס: 🔴 לא בוצע
  - `Create recommendation display contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

15. `Create bug report return entry flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow חזרה ל־Nexus עבור משתמש שחוזר עם bug report אחרי launch, כולל entry point, context carryover ו־handoff ל־issue intake
- input:
  - `visitorContext`
  - `launchConfirmation`
  - `projectState`
- output:
  - `bugReturnFlow`
  - `bugReturnEntry`
- dependencies:
  - `Create live issue intake and triage flow`  | סטטוס: 🔴 לא בוצע
  - `Landing, Access & App Entry Flow`
- connects_to: `Project State`

16. `Create feature request return entry flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow חזרה ל־Nexus עבור משתמש שחוזר עם בקשת פיצ'ר חדשה, כולל context carryover, project selection ו־handoff ל־feature expansion planning
- input:
  - `visitorContext`
  - `launchConfirmation`
  - `projectState`
- output:
  - `featureReturnFlow`
  - `featureReturnEntry`
- dependencies:
  - `Create feature request intake and expansion planner`  | סטטוס: 🔴 לא בוצע
  - `Landing, Access & App Entry Flow`
- connects_to: `Project State`

#### 3. `Expanded Domain Adaptation`

Refinements מאושרים:
- להוסיף `domain decision source`
- להוסיף `decision trace`

משימות טכניות:

1. `Extend domain registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry של domains עם config, signals, release targets ו-bootstrap rules
- input:
  - `domainDefinitions`
- output:
  - `domainRegistry`
- dependencies:
  - `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create domain classification engine`  | סטטוס: 🟢 בוצע
- description: לבנות engine שמזהה domain מתוך חזון, קוד, docs, sources ו-runtime signals
- input:
  - `projectIntake`
  - `scan`
  - `knowledge`
  - `externalSources`
- output:
  - `domain`
  - `domainCandidates`
  - `confidenceScores`
- dependencies:
  - `Context Builder`  | סטטוס: 🟢 בוצע
  - `Knowledge Ingestion`
- connects_to: `Project State`

3. `Create domain capability mapper`  | סטטוס: 🟢 בוצע
- description: לבנות mapper שמתרגם domain לשדות context, task types ו-release targets רלוונטיים
- input:
  - `domain`
- output:
  - `domainCapabilities`
  - `requiredContextFields`
  - `executionModes`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

פירוק נוסף:

1. `Define domain capability schema`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי שנסיים את `Smart Defaults Engine` ונצטרך חוזה קשיח ורב־שימושי ל־domain capabilities, לא רק schema משתמע מתוך המימוש הקיים.
- description: לבנות schema אחיד ליכולות דומיין, שדות context, execution modes ו־release targets
- input:
  - `domain`
- output:
  - `domainCapabilitySchema`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create context field mapper`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: מיד אחרי `Define domain capability schema`, כשנרצה להוציא את שדות ה־context ל־mapper עצמאי ונפרד מהמימוש המרוכז הנוכחי.
- description: לבנות mapper שמתרגם domain לרשימת שדות context נדרשים
- input:
  - `domain`
- output:
  - `requiredContextFields`
- dependencies:
  - `Define domain capability schema`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

3. `Create task family mapper`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: מיד אחרי `Define domain capability schema`, ולפני `Create domain-specific task template loader`, כדי שסוגי המשימות יהיו רכיב מפורש וניתן לטעינה.
- description: לבנות mapper שמתרגם domain למשפחות משימות רלוונטיות
- input:
  - `domain`
- output:
  - `taskFamilies`
- dependencies:
  - `Define domain capability schema`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

4. `Create execution mode mapper`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: לפני `Project Bootstrap Layer` ולפני surfaces אמיתיים, כדי ש־execution modes יהיו מופרדים מהמיפוי הכללי ויוכלו להזין dispatcher ו־runner.
- description: לבנות mapper שמגדיר modes מועדפים של execution לפי domain
- input:
  - `domain`
- output:
  - `executionModes`
- dependencies:
  - `Define domain capability schema`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

5. `Create release target mapper`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: לפני תחילת `Build & Release System` ו־`Delivery / Release Flow`, כדי שמסלולי release ייצאו מ־domain mapping מפורש ולא מהגדרות מרומזות.
- description: לבנות mapper שמתרגם domain ל־release targets תקפים
- input:
  - `domain`
- output:
  - `releaseTargets`
- dependencies:
  - `Define domain capability schema`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

6. `Create capability mapping assembler`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי שנסגור `Define domain capability schema`, ואז נפריד בפועל את ה־mappers לתת־רכיבים מפורשים ולא רק ללוגיקה מרוכזת בתוך mapper אחד.
- description: לבנות assembler שמרכיב את כל ה־mappers לתוצר `domainCapabilities` אחד
- input:
  - `domain`
- output:
  - `domainCapabilities`
  - `requiredContextFields`
  - `executionModes`
- dependencies:
  - `Create context field mapper`  | סטטוס: 🟡 חלקי
  - `Create task family mapper`  | סטטוס: 🟡 חלקי
  - `Create execution mode mapper`  | סטטוס: 🟡 חלקי
  - `Create release target mapper`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

4. `Create domain-specific task template loader`  | סטטוס: 🔴 לא בוצע
- description: לבנות loader של תבניות משימות, תלויות ו-milestones לפי domain
- input:
  - `domain`
  - `lifecyclePhase`
- output:
  - `taskTemplates`
  - `dependencyTemplates`
- dependencies:
  - `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
  - `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

#### 4. `Smart Defaults Engine`

Refinements מאושרים:
- להוסיף `provisional defaults`
- להוסיף `defaults trace`

משימות טכניות:

1. `Create defaults rule engine`  | סטטוס: 🟢 בוצע
- description: לבנות engine שבוחר ברירות מחדל לפי domain, scope, budget ו-maturity
- input:
  - `projectIntake`
  - `domain`
  - `constraints`
- output:
  - `recommendedDefaults`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

פירוק נוסף:

1. `Define defaults input schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לקלט של בחירת ברירות מחדל
- input:
  - `projectIntake`
  - `domain`
  - `constraints`
- output:
  - `normalizedDefaultsInput`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

2. `Create defaults rule registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry של rules לפי domain, scope ו־constraint type
- input:
  - `normalizedDefaultsInput`
- output:
  - `applicableRules`
- dependencies:
  - `Define defaults input schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create defaults scoring module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמחשב ציון התאמה לכל ברירת מחדל אפשרית
- input:
  - `applicableRules`
  - `normalizedDefaultsInput`
- output:
  - `scoredDefaults`
- dependencies:
  - `Create defaults rule registry`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create defaults conflict resolver`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שפותר התנגשויות בין rules ומתעדף override נכון
- input:
  - `scoredDefaults`
- output:
  - `resolvedDefaults`
- dependencies:
  - `Create defaults scoring module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create defaults trace builder`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמסביר למה כל default נבחר
- input:
  - `resolvedDefaults`
  - `applicableRules`
- output:
  - `defaultsTrace`
- dependencies:
  - `Create defaults conflict resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create recommended defaults assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמחזיר `recommendedDefaults` בפורמט קנוני
- input:
  - `resolvedDefaults`
  - `defaultsTrace`
- output:
  - `recommendedDefaults`
- dependencies:
  - `Create defaults trace builder`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create stack recommendation module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמציע stack ראשוני לפרויקט חדש
- input:
  - `domain`
  - `platformTargets`
  - `constraints`
- output:
  - `stackRecommendation`
- dependencies:
  - `Smart Defaults Engine`
- connects_to: `Project State`

3. `Create hosting and release defaults module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמציע hosting, environment strategy ו-release path
- input:
  - `domain`
  - `deliveryTarget`
  - `constraints`
- output:
  - `hostingDefaults`
  - `releaseDefaults`
- dependencies:
  - `Delivery / Release Flow`
- connects_to: `Project State`

4. `Create default approval generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמסמן אילו ברירות מחדל אפשר להחיל אוטומטית ואילו דורשות אישור
- input:
  - `recommendedDefaults`
- output:
  - `autoApprovedDefaults`
  - `pendingApprovals`
- dependencies:
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

---

### שלב 1 — הליבה הקנונית
המטרה: לבנות למערכת שפה פנימית אחת ומוח בסיסי נכון.

1. `Context Builder`  | סטטוס: 🟢 בוצע
- לאחד `scan`, `casino API`, אפיון ידני, ונתונים חיצוניים למבנה אחד
- זה הבסיס לכל החלטה חכמה בהמשך

2. `Canonical Schema`  | סטטוס: 🟢 בוצע
- מודל פנימי אחיד של `project`, `state`, `gaps`, `flows`, `dependencies`, `risks`
- בלי זה כל חיבור חיצוני ישבור את המערכת

3. `Source Adapter Layer`  | סטטוס: 🟢 בוצע
- להפריד בין מה שהקזינו מחזיר לבין איך `Nexus` חושבת
- לכל source יהיה adapter משלו
- לא לערבב שדות עסקיים של קזינו בתוך הליבה

4. להוסיף `metadata` של אמינות
- לכל נתון להוסיף:
  - `source`
  - `confidence`
  - `derivedFrom`
  - `status: verified | inferred | unknown`
- בלי זה המערכת תקבל החלטות על מידע חלש

5. לבנות `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
- planner שיודע להבין סוגי פרויקטים שונים
- למשל `casino`, `saas`, `mobile app`, `agency system`
- כרגע זאת אחת הבעיות הכי גדולות

---

### שלב 2 — הבנה עמוקה יותר של פרויקט
אחרי שיש מוח בסיסי נכון:

6. לבנות `Deep Code Scanner`  | סטטוס: 🟢 בוצע
- frameworks
- dependencies
- architecture patterns
- db schema
- migrations
- tests
- ci
- auth
- messaging
- queues

7. לבנות `Structured Analysis Pipeline`  | סטטוס: 🟢 בוצע
- `scan -> context -> prompt -> analysis`
- בצורה יציבה, מדידה, וניתנת לדיבוג

8. לייצב את שכבת ה־AI  | סטטוס: 🟢 בוצע
- `timeouts`
- `retries`
- `caching`
- `fallback model`
- שמירה של תוצאות analysis כדי לא ליפול כל פעם

9. להוסיף קריאה של מסמכים וידע  | סטטוס: 🟢 בוצע
- `README`
- docs
- PR discussions
- Notion בהמשך

---

### שלב 2.5 — business understanding

10.5 `Business Context Layer`  | סטטוס: 🟢 בוצע
- קהל יעד
- positioning
- funnel
- KPI
- GTM stage
- constraints עסקיים

10.6 `Growth & Marketing Planner`  | סטטוס: 🟢 בוצע
- משימות שיווק, רכישה, onboarding, retention, content

10.7 `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- חיבור בין technical, product, growth, ops

10.8 `Business Bottleneck Resolver`  | סטטוס: 🟢 בוצע
- זיהוי החסם העסקי המרכזי, לא רק הטכני

10.9 `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- מה דורש אישור, מה אפשר לבצע, ומה עדיין לא בטוח

---

### שלב 2.6 — Strategic Validation & Guided Discovery
המטרה: להוסיף לפני build שכבת חשיבה עסקית, ולידציה, scope, שיחה מונחית והחלטות אסטרטגיות בלי לשנות את כיוון ה־v1.

#### `Audience & Product Definition`

משימות טכניות:

1. `Define audience insight schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לקהלים, pains, motivations, awareness stage ו־buying triggers
- input:
  - `businessContext`
  - `productVision`
- output:
  - `audienceInsight`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create target audience profiler`  | סטטוס: 🔴 לא בוצע
- description: לבנות profiler שמזהה למי המוצר רלוונטי קודם לפי pain, urgency ויכולת אימוץ
- input:
  - `audienceInsight`
  - `marketSignals`
- output:
  - `targetAudienceProfile`
- dependencies:
  - `Define audience insight schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create persona generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־personas קנוניים עם goals, objections, constraints ו־success criteria
- input:
  - `targetAudienceProfile`
- output:
  - `personas`
- dependencies:
  - `Create target audience profiler`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create customer journey mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות customer journey map מהגילוי הראשוני דרך evaluation, adoption ו־retention
- input:
  - `personas`
  - `businessContext`
- output:
  - `customerJourneyMap`
- dependencies:
  - `Create persona generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Idea Validation & Pre-Build`

משימות טכניות:

1. `Define idea validation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לולידציית רעיון כולל demand, competition, differentiation, risks ו־evidence quality
- input:
  - `productVision`
  - `audienceInsight`
- output:
  - `ideaValidationSchema`
- dependencies:
  - `Audience & Product Definition`
- connects_to: `Project State`

2. `Create market demand analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמעריך אם יש ביקוש אמיתי לפי demand signals, search behavior ו־pain urgency
- input:
  - `ideaValidationSchema`
  - `marketSignals`
- output:
  - `marketDemandAssessment`
- dependencies:
  - `Define idea validation schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create problem-solution fit evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator שבודק אם הפתרון המוצע באמת פותר pain מספיק חד לקהל הנבחר
- input:
  - `targetAudienceProfile`
  - `productVision`
- output:
  - `problemSolutionFit`
- dependencies:
  - `Define idea validation schema`  | סטטוס: 🔴 לא בוצע
  - `Create target audience profiler`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create risk assessment engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמעריך execution risk, market risk, acquisition risk ו־timing risk לפני build
- input:
  - `marketDemandAssessment`
  - `problemSolutionFit`
- output:
  - `validationRiskReport`
- dependencies:
  - `Create market demand analyzer`  | סטטוס: 🔴 לא בוצע
  - `Create problem-solution fit evaluator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create landing page generator for validation`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator לדף ולידציה ראשוני עם headline, proof, CTA ו־interest capture
- input:
  - `problemSolutionFit`
  - `messagingHypothesis`
- output:
  - `validationLandingSpec`
- dependencies:
  - `Create problem-solution fit evaluator`  | סטטוס: 🔴 לא בוצע
  - `Product Positioning & Messaging`
- connects_to: `Project State`

6. `Create fake door testing system`  | סטטוס: 🔴 לא בוצע
- description: לבנות מערכת לניסוי interest דרך CTA/feature promise לפני build מלא
- input:
  - `validationLandingSpec`
  - `testHypothesis`
- output:
  - `fakeDoorExperiment`
- dependencies:
  - `Create landing page generator for validation`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create waitlist capture system`  | סטטוס: 🔴 לא בוצע
- description: לבנות capture flow ללידים, intent strength ו־follow-up context בשלב validation
- input:
  - `fakeDoorExperiment`
  - `visitorInput`
- output:
  - `validationWaitlistRecord`
- dependencies:
  - `Create fake door testing system`  | סטטוס: 🔴 לא בוצע
  - `Notification System`
- connects_to: `Project State`

8. `Create demand signal tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמאגד clicks, signups, waitlist conversion ו־message resonance ל־validation evidence
- input:
  - `fakeDoorExperiment`
  - `validationWaitlistRecord`
- output:
  - `demandSignalSummary`
- dependencies:
  - `Create waitlist capture system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `MVP & Scope`

משימות טכניות:

1. `Define MVP scope schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להפרדה בין core value, supporting features, optional bets ו־deferred scope
- input:
  - `productVision`
  - `customerJourneyMap`
- output:
  - `mvpScopeSchema`
- dependencies:
  - `Audience & Product Definition`
- connects_to: `Project State`

2. `Create feature prioritization engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמדרג features לפי value, risk, complexity, dependency weight ו־time-to-learning
- input:
  - `mvpScopeSchema`
  - `validationRiskReport`
- output:
  - `featurePriorityMap`
- dependencies:
  - `Define MVP scope schema`  | סטטוס: 🔴 לא בוצע
  - `Create risk assessment engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create build vs skip decision system`  | סטטוס: 🔴 לא בוצע
- description: לבנות decision system שקובע מה לבנות עכשיו, מה לדחות ומה לא לבנות בכלל
- input:
  - `featurePriorityMap`
  - `resourceConstraints`
- output:
  - `buildSkipDecisions`
- dependencies:
  - `Create feature prioritization engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create MVP scope reducer`  | סטטוס: 🔴 לא בוצע
- description: לבנות reducer שמתרגם את החלטות ה־build/skip ל־MVP scope קשיח ובר־ביצוע
- input:
  - `buildSkipDecisions`
  - `crossFunctionalTaskGraph`
- output:
  - `reducedMvpScope`
- dependencies:
  - `Create build vs skip decision system`  | סטטוס: 🔴 לא בוצע
  - `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Founder Challenge & Guided Interaction`

משימות טכניות:

1. `Define founder challenge schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לשאלות challenge, assumptions, weaknesses ו־supportive reframing
- input:
  - `productVision`
  - `businessContext`
- output:
  - `founderChallengeSchema`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create idea assumption extractor`  | סטטוס: 🔴 לא בוצע
- description: לבנות extractor שמחלץ assumptions על audience, value, channels, pricing ו־execution ability
- input:
  - `founderChallengeSchema`
  - `productVision`
- output:
  - `ideaAssumptions`
- dependencies:
  - `Define founder challenge schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create smart questioning system`  | סטטוס: 🔴 לא בוצע
- description: לבנות מנגנון שמייצר שאלות קצרות ומדויקות כדי לסגור חורים קריטיים בלי להעמיס על המשתמש
- input:
  - `ideaAssumptions`
  - `validationRiskReport`
- output:
  - `challengeQuestions`
- dependencies:
  - `Create idea assumption extractor`  | סטטוס: 🔴 לא בוצע
  - `Create risk assessment engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create adaptive question flow engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow engine שבוחר את השאלה הבאה לפי uncertainty, response quality ו־user fatigue
- input:
  - `challengeQuestions`
  - `responseContext`
- output:
  - `nextQuestionDecision`
- dependencies:
  - `Create smart questioning system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create supportive feedback engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמאתגר assumptions בלי לשבור מוטיבציה או לייצר friction מיותר
- input:
  - `nextQuestionDecision`
  - `validationRiskReport`
- output:
  - `supportiveFeedback`
- dependencies:
  - `Create adaptive question flow engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Define guided interaction schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־guided flows כולל question pacing, validation gates ו־hidden background decisions
- input:
  - `responseContext`
  - `supportiveFeedback`
- output:
  - `guidedInteractionSchema`
- dependencies:
  - `Create supportive feedback engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create user intent interpreter`  | סטטוס: 🔴 לא בוצע
- description: לבנות interpreter שמבין אם המשתמש מבקש execution, brainstorm, validation או רק clarification
- input:
  - `userMessage`
  - `guidedInteractionSchema`
- output:
  - `userIntentDecision`
- dependencies:
  - `Define guided interaction schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create ambiguous input resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver לקלט עמום או חסר שמכריע אם צריך לשאול, להניח, או לעצור זמנית
- input:
  - `userIntentDecision`
  - `responseContext`
- output:
  - `ambiguityResolution`
- dependencies:
  - `Create user intent interpreter`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create semantic clarification engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שממיר ניסוחים כלליים, סותרים או לא שלמים ל־canonical clarification objects
- input:
  - `ambiguityResolution`
  - `responseContext`
- output:
  - `clarifiedIntent`
- dependencies:
  - `Create ambiguous input resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create cognitive load regulator`  | סטטוס: 🔴 לא בוצע
- description: לבנות רגולטור שמונע יותר מדי שאלות, יותר מדי הסתעפויות או יותר מדי החלטות בבת אחת
- input:
  - `guidedInteractionSchema`
  - `responseContext`
- output:
  - `interactionLoadDecision`
- dependencies:
  - `Define guided interaction schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

11. `Create pre-next-question validation gate`  | סטטוס: 🔴 לא בוצע
- description: לבנות gate שמוודא שהמערכת לא ממשיכה לשאלה הבאה לפני שהפירוש הנוכחי יציב מספיק
- input:
  - `clarifiedIntent`
  - `interactionLoadDecision`
- output:
  - `questionProgressGate`
- dependencies:
  - `Create semantic clarification engine`  | סטטוס: 🔴 לא בוצע
  - `Create cognitive load regulator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Strategic Decision Layer`

משימות טכניות:

1. `Define strategic decision schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להחלטות אסטרטגיות כמו build path, channel choice, pricing choice ו־resource tradeoffs
- input:
  - `businessContext`
  - `reducedMvpScope`
- output:
  - `strategicDecisionSchema`
- dependencies:
  - `MVP & Scope`
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create tradeoff analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמשווה בין מהירות, איכות, סיכון, עלות ולמידה בכל החלטה אסטרטגית
- input:
  - `strategicDecisionSchema`
  - `resourceConstraints`
- output:
  - `tradeoffAnalysis`
- dependencies:
  - `Define strategic decision schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create priority conflict resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver לקונפליקטים בין product, growth, business ו־execution priorities
- input:
  - `tradeoffAnalysis`
  - `crossFunctionalTaskGraph`
- output:
  - `priorityResolution`
- dependencies:
  - `Create tradeoff analyzer`  | סטטוס: 🔴 לא בוצע
  - `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Business Viability & Infrastructure`

משימות טכניות:

1. `Define business viability schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למוניטיזציה, pricing, costs, legal setup, ops readiness ו־human constraints
- input:
  - `businessContext`
  - `resourceConstraints`
- output:
  - `businessViabilityModel`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create monetization strategy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator שבוחר monetization paths סבירים לפי audience, usage pattern ו־value delivery
- input:
  - `businessViabilityModel`
  - `targetAudienceProfile`
- output:
  - `monetizationStrategy`
- dependencies:
  - `Define business viability schema`  | סטטוס: 🔴 לא בוצע
  - `Create target audience profiler`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create pricing model engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine למודלי pricing כמו subscription, usage-based, seat-based או hybrid
- input:
  - `monetizationStrategy`
  - `usageForecast`
- output:
  - `pricingModelDecision`
- dependencies:
  - `Create monetization strategy generator`  | סטטוס: 🔴 לא בוצע
  - `Billing & Monetization System`
- connects_to: `Project State`

4. `Create revenue projection system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system שמעריך revenue scenarios לפי traffic, conversion, retention ו־pricing assumptions
- input:
  - `pricingModelDecision`
  - `demandSignalSummary`
- output:
  - `revenueProjection`
- dependencies:
  - `Create pricing model engine`  | סטטוס: 🔴 לא בוצע
  - `Create demand signal tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create unit economics analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer ל־CAC, gross margin, payback assumptions ו־cost-to-serve
- input:
  - `revenueProjection`
  - `costSummary`
- output:
  - `unitEconomics`
- dependencies:
  - `Create revenue projection system`  | סטטוס: 🔴 לא בוצע
  - `Platform Cost & Usage Control`
- connects_to: `Project State`

6. `Create skill gap analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמזהה אילו capabilities חסרות למייסד או לצוות כדי להוציא את הפרויקט לפועל
- input:
  - `reducedMvpScope`
  - `resourceConstraints`
- output:
  - `skillGapReport`
- dependencies:
  - `MVP & Scope`
- connects_to: `Project State`

7. `Create role recommendation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמציע אילו roles נדרשים בפועל כמו dev, design, ops או growth ולכמה זמן
- input:
  - `skillGapReport`
  - `crossFunctionalTaskGraph`
- output:
  - `roleRecommendations`
- dependencies:
  - `Create skill gap analyzer`  | סטטוס: 🔴 לא בוצע
  - `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

8. `Create outsourcing planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמחליט אילו חלקים כדאי להוציא החוצה ואילו להשאיר in-house
- input:
  - `roleRecommendations`
  - `resourceConstraints`
- output:
  - `outsourcingPlan`
- dependencies:
  - `Create role recommendation engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create legal structure advisor`  | סטטוס: 🔴 לא בוצע
- description: לבנות advisor ברמת framework לבחירת legal setup, ownership structure ו־basic operating guardrails
- input:
  - `businessViabilityModel`
  - `workspaceModel`
- output:
  - `legalStructureRecommendation`
- dependencies:
  - `Define business viability schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

10. `Create terms and privacy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־terms/privacy skeletons לפי product type, data profile ו־jurisdiction hints
- input:
  - `legalStructureRecommendation`
  - `dataPrivacyClassification`
- output:
  - `legalPolicyDrafts`
- dependencies:
  - `Create legal structure advisor`  | סטטוס: 🔴 לא בוצע
  - `Data Privacy & Compliance`
- connects_to: `Project State`

11. `Create compliance readiness checker`  | סטטוס: 🔴 לא בוצע
- description: לבנות checker שממפה פערי compliance בסיסיים לפני launch או sales motion
- input:
  - `legalPolicyDrafts`
  - `businessViabilityModel`
- output:
  - `complianceReadiness`
- dependencies:
  - `Create terms and privacy generator`  | סטטוס: 🔴 לא בוצע
  - `Data Privacy & Compliance`
- connects_to: `Project State`

12. `Create payment system integrator plan`  | סטטוס: 🔴 לא בוצע
- description: לבנות plan לחיבור payment provider, billing flow ו־revenue capture path
- input:
  - `pricingModelDecision`
  - `productDeliveryModel`
- output:
  - `paymentIntegrationPlan`
- dependencies:
  - `Create pricing model engine`  | סטטוס: 🔴 לא בוצע
  - `Billing & Monetization System`
- connects_to: `Project State`

13. `Create CRM bootstrap system`  | סטטוס: 🔴 לא בוצע
- description: לבנות bootstrap system ל־CRM basics עבור leads, waitlist, outreach ו־sales follow-up
- input:
  - `validationWaitlistRecord`
  - `goToMarketPlan`
- output:
  - `crmBootstrapState`
- dependencies:
  - `Create waitlist capture system`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Go-To-Market`
- connects_to: `Project State`

---

### שלב 3 — project integration אמיתי
רק אחרי שהמוח מספיק טוב:

10. חיבור אמיתי ל־`GitHub/GitLab`  | סטטוס: 🟢 בוצע
- repos
- branches
- commits
- PRs
- diffs

11. חיבור למקורות runtime  | סטטוס: 🟢 בוצע
- CI/CD
- test results
- deployment status
- error logs
- monitoring
- analytics
- product metrics

12. לבנות `Project State` אמיתי  | סטטוס: 🟢 בוצע
- state שמתעדכן אוטומטית ממקורות אמת
- לא רק ממה שהמערכת "חושבת"

---

### שלב 3.5 — Project Bootstrap Layer

שם הרכיב: `Project Bootstrap Layer`

Refinements מאושרים:
- להוסיף `bootstrap artifact manifest`
- להוסיף `validation evidence schema`

משימות טכניות:

1. `Create bootstrap plan generator`  | סטטוס: 🟢 בוצע
- description: לבנות generator שמתרגם intake + domain + defaults לתוכנית bootstrap מפורטת
- input:
  - `projectIntake`
  - `domain`
  - `recommendedDefaults`
- output:
  - `bootstrapPlan`
  - `bootstrapTasks`
- dependencies:
  - `Expanded Domain Adaptation`
  - `Smart Defaults Engine`
- connects_to: `Execution Graph`

2. `Create bootstrap task templates`  | סטטוס: 🟢 בוצע
- description: לבנות ספריית תבניות bootstrap לפי סוג פרויקט
- input:
  - `domain`
  - `targetPlatform`
- output:
  - `bootstrapTemplate`
- dependencies:
  - `Project Bootstrap Layer`
- connects_to: `Execution Graph`

פירוק נוסף:

1. `Define bootstrap template schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לתבניות bootstrap כולל params, artifacts ותלויות
- input:
  - `domain`
  - `targetPlatform`
- output:
  - `bootstrapTemplateSchema`
- dependencies:
  - `Project Bootstrap Layer`
- connects_to: `Execution Graph`

2. `Create base bootstrap templates`  | סטטוס: 🟢 בוצע
- description: לבנות תבניות בסיס גנריות לפרויקטים חדשים
- input:
  - `bootstrapTemplateSchema`
- output:
  - `baseTemplates`
- dependencies:
  - `Define bootstrap template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

3. `Create domain bootstrap templates`  | סטטוס: 🟢 בוצע
- description: לבנות תבניות domain-specific עבור domains נתמכים
- input:
  - `domain`
- output:
  - `domainTemplates`
- dependencies:
  - `Define bootstrap template schema`  | סטטוס: 🟢 בוצע
  - `Expanded Domain Adaptation`
- connects_to: `Execution Graph`

4. `Create platform bootstrap templates`  | סטטוס: 🟢 בוצע
- description: לבנות תבניות platform-specific לפי target platform
- input:
  - `targetPlatform`
- output:
  - `platformTemplates`
- dependencies:
  - `Define bootstrap template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

5. `Create template parameter resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמכניס values בפועל לתבנית bootstrap
- input:
  - `template`
  - `recommendedDefaults`
  - `projectIntake`
- output:
  - `parameterizedTemplate`
- dependencies:
  - `Smart Defaults Engine`
- connects_to: `Execution Graph`

6. `Create bootstrap template merger`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שממזג base, domain ו־platform templates לתבנית אחת סופית
- input:
  - `baseTemplates`
  - `domainTemplates`
  - `platformTemplates`
- output:
  - `bootstrapTemplate`
- dependencies:
  - `Create base bootstrap templates`  | סטטוס: 🟢 בוצע
  - `Create domain bootstrap templates`  | סטטוס: 🟢 בוצע
  - `Create platform bootstrap templates`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

3. `Create bootstrap dispatcher`  | סטטוס: 🟢 בוצע
- description: לבנות dispatcher ששולח משימות bootstrap ל־agent או ל־surface מתאים
- input:
  - `bootstrapTasks`
  - `executionCapabilities`
- output:
  - `bootstrapAssignments`
- dependencies:
  - `Agent Runtime`  | סטטוס: 🟡 חלקי
  - `Execution Surface Layer`
- connects_to: `Agent Runtime`

4. `Create bootstrap execution runner`  | סטטוס: 🔴 לא בוצע
- description: לבנות runner שמריץ בפועל פקודות bootstrap דרך terminal, sandbox, container או branch
- input:
  - `bootstrapAssignment`
- output:
  - `executionResult`
  - `artifacts`
- dependencies:
  - `Execution Surface Layer`
  - `Real Execution Capabilities`
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define bootstrap execution request schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לבקשת ריצה של bootstrap
- input:
  - `bootstrapAssignment`
- output:
  - `executionRequest`
- dependencies:
  - `Create bootstrap dispatcher`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

2. `Create bootstrap surface resolver`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שבוחר surface מתאים להרצת bootstrap
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין לא משלים את `Execution Surface Layer`; כרגע זה רק resolver קנוני שמכין את הקרקע ל־`Create bootstrap execution invoker`.
- input:
  - `executionRequest`
- output:
  - `resolvedSurface`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

3. `Create bootstrap command planner`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמתרגם assignment לרשימת פקודות bootstrap לביצוע
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין לא משלים את `Real Execution Capabilities`; כרגע זה planner קנוני של פקודות ולא שכבת הרצה אמיתית.
- input:
  - `executionRequest`
- output:
  - `plannedCommands`
- dependencies:
  - `Real Execution Capabilities`
- connects_to: `Execution Surface`

4. `Create bootstrap execution invoker`  | סטטוס: 🟢 בוצע
- description: לבנות invoker שמריץ את הפקודות על ה־surface שנבחר
- input:
  - `resolvedSurface`
  - `plannedCommands`
- output:
  - `rawExecutionResult`
- dependencies:
  - `Create bootstrap surface resolver`  | סטטוס: 🟢 בוצע
  - `Create bootstrap command planner`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`rawExecutionResult` עדיין קנוני ומבוסס על surface ו־commands מתוכננים; הוא יקבל ערך מלא יותר אחרי `Execution Surface Layer` ו־`Real Execution Capabilities`.

5. `Create bootstrap artifact collector`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שאוסף artifacts ותוצרי bootstrap לאחר הריצה
- input:
  - `rawExecutionResult`
- output:
  - `artifacts`
  - `executionMetadata`
- dependencies:
  - `Create bootstrap execution invoker`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־artifacts עדיין נגזרים מ־`rawExecutionResult` קנוני ולא מ־filesystem/workspace אמיתי; היא תקבל ערך מלא יותר אחרי `Execution Surface Layer`.

6. `Create bootstrap execution result envelope`  | סטטוס: 🟢 בוצע
- description: לבנות envelope אחיד של `executionResult` ו־artifacts לרכיבי המשך
- input:
  - `rawExecutionResult`
  - `artifacts`
- output:
  - `executionResult`
  - `artifacts`
- dependencies:
  - `Create bootstrap artifact collector`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`executionResult` עדיין בנוי מעל `rawExecutionResult` ו־artifacts קנוניים; הוא יקבל ערך מלא יותר אחרי `Execution Surface Layer` ו־workspace אמיתי.

5. `Create bootstrap validation module`  | סטטוס: 🟢 בוצע
- description: לבנות validator שבודק שהשלד, הקבצים, הפקודות והתוצרים אכן נוצרו
- הערת מצב: המשימה עצמה מומשה, אבל היא תקבל ערך מלא יותר אחרי `Create bootstrap artifact collector`, כי כרגע ה־`bootstrapResult` עדיין נשען על תוצרי bootstrap קנוניים ולא על workspace/filesystem אמיתי.
- input:
  - `bootstrapResult`
  - `expectedArtifacts`
- output:
  - `validationResult`
- dependencies:
  - `Deep Code Scanner`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

6. `Create bootstrap state updater`  | סטטוס: 🟢 בוצע
- description: לבנות updater שמעדכן state ו-graph לפי תוצאות bootstrap
- הערת מצב: המשימה עצמה מומשה, אבל היא תתייצב עוד יותר אחרי הרחבת `Task Result Ingestion`, כי כרגע היא נשענת גם על `validationResult` נגזר ולא רק על תוצאות ריצה מלאות.
- input:
  - `validationResult`
  - `bootstrapTasks`
- output:
  - `updatedProjectState`
  - `updatedExecutionGraph`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
  - `Execution Graph`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

---

### שלב 4 — orchestration אמיתי
רק אחרי שיש הבנה אמינה:

13. `Execution Graph` חכם  | סטטוס: 🟢 בוצע
- `blocked`
- `ready`
- `running`
- `done`
- מתעדכן לפי תוצאות אמיתיות

14. `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי `Scheduler`, אחרי השלמת `Agent Runtime`, ואחרי שעיקר `Project Bootstrap Layer` ו־`Execution Feedback Layer` ימומשו, כדי לקלוט גם תוצאות bootstrap, progress, retries, failures ו־release flows בפורמט אחיד.
- לקלוט תוצאות של משימות ולעדכן את ה־state

15. `Scheduler`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: מיד אחרי `Task Result Ingestion` המורחב, ולפני `Project Bootstrap Layer`, כדי שכל ריצת משימה אמיתית תעבור דרך retries, priority ו־concurrency מסודרים.
- concurrency
- retries
- failure handling
- priority

16. `Memory` מתמשכת לפרויקט  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי `Scheduler` ולפני `Learning Layer`, כשיהיו כבר תוצאות משימה והחלטות שאפשר לשמור כ־project memory אמיתי ולא רק זיכרון agent בסיסי.
- החלטות
- טעויות
- patterns
- architecture history

#### `Dependency Intelligence Extensions`

משימות טכניות:

1. `Define dependency reasoning schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להסבר תלות בין משימות, חסמים, parallel groups ו־critical path
- input:
  - `executionGraph`
  - `taskState`
- output:
  - `dependencyReasoning`
- dependencies:
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

#### `Scheduler`

משימות טכניות:

1. `Define scheduler decision schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להכרעת scheduler כולל selected task, alternatives, blocking reasons, approval posture ו־dispatch rationale
- input:
  - `executionGraph`
  - `projectState`
- output:
  - `schedulerDecision`
- dependencies:
  - `Execution Graph`  | סטטוס: 🟢 בוצע
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create initial task seeding service`  | סטטוס: 🔴 לא בוצע
- description: לבנות service שממיר `Project State` ראשוני ל־backlog התחלתי, task graph ראשוני ו־priority ordering שממנו אפשר להתחיל לעבוד
- input:
  - `projectState`
  - `domainCapabilities`
- output:
  - `initialBacklog`
  - `seededTaskGraph`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
  - `Expanded Domain Adaptation`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

3. `Create task prioritization evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator שמדרג משימות לפי value path, dependency order, urgency, approval friction ו־execution feasibility
- input:
  - `initialBacklog`
  - `activeBottleneck`
- output:
  - `prioritizedTasks`
- dependencies:
  - `Create initial task seeding service`  | סטטוס: 🔴 לא בוצע
  - `Bottleneck Resolver`
- connects_to: `Execution Graph`

4. `Create next task selection resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver קנוני שמכריע מה המשימה הבאה למשתמש או ל־agent מתוך roadmap, blockers, approvals ו־scheduler alternatives
- input:
  - `prioritizedTasks`
  - `policyDecision`
  - `approvalStatus`
- output:
  - `schedulerDecision`
  - `selectedTask`
- dependencies:
  - `Define scheduler decision schema`  | סטטוס: 🔴 לא בוצע
  - `Create task prioritization evaluator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create scheduler decision persistence record`  | סטטוס: 🔴 לא בוצע
- description: לבנות record ששומר את החלטת ה־scheduler, החלופות שנפסלו והסיבה כדי לשמור source of truth עקבי בין UI, runtime ו־audit
- input:
  - `schedulerDecision`
- output:
  - `schedulerDecisionRecord`
- dependencies:
  - `Create next task selection resolver`  | סטטוס: 🔴 לא בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

6. `Create next task selection validation suite`  | סטטוס: 🔴 לא בוצע
- description: לבנות בדיקות שמוודאות התאמה בין roadmap, active bottleneck, selected task, next action explanation ו־assignment behavior
- input:
  - `schedulerDecision`
  - `executionGraph`
- output:
  - `schedulerValidation`
- dependencies:
  - `Create next task selection resolver`  | סטטוס: 🔴 לא בוצע
  - `Create next action explanation builder`  | סטטוס: 🟢 בוצע
- connects_to: `Validation Layer`

7. `Define initial task schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למשימה ראשונית כולל title, objective, priority, dependency metadata, approval posture ו־execution class
- input:
  - `projectState`
  - `domainCapabilities`
- output:
  - `initialTask`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
  - `Expanded Domain Adaptation`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

8. `Define initial task graph schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־task graph הראשוני כולל dependencies, ordering, optional branches ו־critical path hints
- input:
  - `initialTask`
  - `projectState`
- output:
  - `initialTaskGraph`
- dependencies:
  - `Define initial task schema`  | סטטוס: 🔴 לא בוצע
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

9. `Create project-state-to-task transformation mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות mapper שמתרגם `initialProjectState`, readiness ו־domain signals ל־initial backlog קנוני ול־graph התחלתי
- input:
  - `initialProjectState`
  - `initialStateReadiness`
  - `domainCapabilities`
- output:
  - `taskSeedPayload`
- dependencies:
  - `Create initial state readiness classifier`  | סטטוס: 🔴 לא בוצע
  - `Define initial task graph schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

10. `Create initial backlog persistence store`  | סטטוס: 🔴 לא בוצע
- description: לבנות שכבת persistence ל־initial backlog, `seededTaskGraph` ו־selection metadata כדי לשמור continuity בין seeding, scheduling ו־workbench
- input:
  - `initialBacklog`
  - `seededTaskGraph`
- output:
  - `initialBacklogRecord`
- dependencies:
  - `Create initial task seeding service`  | סטטוס: 🔴 לא בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

2. `Create critical path analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמחשב את מסלול החסימה המרכזי של הפרויקט ואת המשימות שמעכבות את ההתקדמות הכי הרבה
- input:
  - `dependencyReasoning`
- output:
  - `criticalPath`
- dependencies:
  - `Define dependency reasoning schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

3. `Create parallel execution eligibility resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אילו משימות אפשר להריץ במקביל בלי לשבור תלות, locks או policy constraints
- input:
  - `dependencyReasoning`
  - `policyDecision`
- output:
  - `parallelExecutionPlan`
- dependencies:
  - `Define dependency reasoning schema`  | סטטוס: 🔴 לא בוצע
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

4. `Create dependency blocking explainer`  | סטטוס: 🔴 לא בוצע
- description: לבנות explainer שמציג למשתמש מה חוסם מה, למה משימה לא רצה ומה צריך לקרות כדי לפתוח אותה
- input:
  - `dependencyReasoning`
  - `criticalPath`
- output:
  - `blockingExplanation`
- dependencies:
  - `Create critical path analyzer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create dependency replan trigger`  | סטטוס: 🔴 לא בוצע
- description: לבנות trigger שמבקש replan כשה־critical path משתנה, כשנכשלת משימה חוסמת או כשנפתחת הזדמנות להרצה מקבילה
- input:
  - `criticalPath`
  - `taskResult`
- output:
  - `replanTrigger`
- dependencies:
  - `Create critical path analyzer`  | סטטוס: 🔴 לא בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

#### `Bottleneck Resolver`

משימות טכניות:

1. `Define bottleneck schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לחסם נוכחי כולל blocker type, severity, affected flow, unblock conditions ו־owner
- input:
  - `projectState`
  - `executionGraph`
  - `taskResults`
- output:
  - `bottleneckState`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create active bottleneck resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שקובע מה החסם האמיתי עכשיו לפי blocked tasks, failures, missing approvals, missing credentials ו־release blockers
- input:
  - `bottleneckState`
  - `approvalStatus`
  - `policyDecision`
- output:
  - `activeBottleneck`
- dependencies:
  - `Define bottleneck schema`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

3. `Create bottleneck priority scorer`  | סטטוס: 🟢 בוצע
- description: לבנות scorer שמדרג חסמים לפי impact על progress, user value, delivery risk ו־time loss
- input:
  - `activeBottleneck`
  - `criticalPath`
- output:
  - `scoredBottleneck`
- dependencies:
  - `Create active bottleneck resolver`  | סטטוס: 🟢 בוצע
  - `Create critical path analyzer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create unblock path generator`  | סטטוס: 🟢 בוצע
- description: לבנות generator שמחזיר מה צריך לקרות כדי לפתוח את החסם עכשיו, כולל next actions, approvals או replans
- input:
  - `scoredBottleneck`
  - `replanTrigger`
- output:
  - `unblockPlan`
- dependencies:
  - `Create bottleneck priority scorer`  | סטטוס: 🟢 בוצע
  - `Create dependency replan trigger`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create bottleneck state updater`  | סטטוס: 🟢 בוצע
- description: לבנות updater שמעדכן את bottleneck state אחרי execution results, approvals, failures או state transitions
- input:
  - `unblockPlan`
  - `taskResult`
- output:
  - `updatedBottleneckState`
- dependencies:
  - `Create unblock path generator`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

#### `Explanation Layer`

משימות טכניות:

1. `Define explanation schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד להסברים כמו why this task, why blocked, why approval, what changed ו־what next
- input:
  - `projectState`
  - `decisionContext`
- output:
  - `explanationSchema`
- dependencies:
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create next action explanation builder`  | סטטוס: 🟢 בוצע
- description: לבנות builder שמסביר למה המשימה הבאה נבחרה עכשיו ולמה היא עדיפה על חלופות
- input:
  - `explanationSchema`
  - `activeBottleneck`
  - `schedulerDecision`
- output:
  - `nextActionExplanation`
- dependencies:
  - `Define explanation schema`  | סטטוס: 🟢 בוצע
  - `Bottleneck Resolver`
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

3. `Create failure explanation builder`  | סטטוס: 🟢 בוצע
- description: לבנות builder שמסביר מה נכשל, למה זה כנראה קרה ומה פעולת התיקון הסבירה הבאה
- input:
  - `failureSummary`
  - `taskResult`
  - `activeBottleneck`
- output:
  - `failureExplanation`
- dependencies:
  - `Define explanation schema`  | סטטוס: 🟢 בוצע
  - `Failure Recovery & Rollback`
  - `Bottleneck Resolver`
- connects_to: `Project State`

4. `Create approval explanation builder`  | סטטוס: 🟢 בוצע
- description: לבנות builder שמסביר למה צריך approval, מה הסיכון, ומה יקרה אם לא יאשרו
- input:
  - `approvalRequest`
  - `policyTrace`
  - `activeBottleneck`
- output:
  - `approvalExplanation`
- dependencies:
  - `Define explanation schema`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create execution change explanation builder`  | סטטוס: 🟢 בוצע
- description: לבנות builder שמסביר מה השתנה בפועל אחרי execution, אילו artifacts עודכנו ואיך state התקדם
- input:
  - `executionResult`
  - `bootstrapStateUpdate`
  - `releaseStateUpdate`
- output:
  - `changeExplanation`
- dependencies:
  - `Define explanation schema`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

6. `Create explanation assembler`  | סטטוס: 🟢 בוצע
- description: להרכיב explanation payload אחד למשתמש שמחבר next action, blockers, approvals, failures ו־change summaries
- input:
  - `nextActionExplanation`
  - `failureExplanation`
  - `approvalExplanation`
  - `changeExplanation`
- output:
  - `projectExplanation`
- dependencies:
  - `Create execution change explanation builder`  | סטטוס: 🟢 בוצע
  - `Create next action explanation builder`  | סטטוס: 🟢 בוצע
  - `Create failure explanation builder`  | סטטוס: 🟢 בוצע
  - `Create approval explanation builder`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

---

### שלב 5 — agents אמיתיים
רק אחרי שהליבה חזקה מספיק:

17. לבנות `Agent Runtime` אמיתי  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי `Scheduler` ולפני `Execution Feedback Layer` ו־`Project Bootstrap Layer`, כדי שיהיו `task.claim`, `task.run`, `task.report` מלאים ולא רק עיבוד assignments בסיסי.
- `task.claim`
- `task.run`
- `task.report`

18. agents אמיתיים  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי השלמת `Agent Runtime` ולפני `Project Bootstrap Layer` ו־`Delivery / Release`, כדי להשלים `docs` ו־`ops` ולייצב interfaces לכל workers.
- `dev`
- `qa`
- `docs`
- `marketing`
- `ops`

19. סביבת הרצה בטוחה  | סטטוס: 🔴 לא בוצע
- `sandbox`
- `temp branch`
- `container` אם צריך

20. יכולות execution אמיתיות  | סטטוס: 🔴 לא בוצע
- ליצור branch
- לערוך קוד
- לכתוב test
- להריץ build
- לפתוח PR

#### Execution Feedback Layer

שם הרכיב: `Execution Feedback Layer`

Refinements מאושרים:
- להוסיף `canonical execution run model`
- להוסיף `log schema`

משימות טכניות:

1. `Create execution event summarizer`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי הרחבת `Task Result Ingestion` ואחרי `Agent Runtime` המלא, כדי שהסיכום יתבסס על run model אחיד ולא על summaries חלקיים מתוך `ProjectService`.
- description: לבנות service שמתרגם events גולמיים לסיכום ברור של מה רץ, מה הושלם ומה נכשל
- input:
  - `runtimeEvents`
  - `taskResults`
- output:
  - `executionSummary`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create live progress model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל התקדמות חי למשימה, שלב, ו-run פעיל
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `progressState`
  - `completionEstimate`
- dependencies:
  - `Agent Runtime`  | סטטוס: 🟡 חלקי
  - `Execution Surface Layer`
- connects_to: `Project State`

פירוק נוסף:

1. `Define execution progress schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־progress של task, run ו־stage
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין לא `Create live progress model`; כרגע זה schema קנוני שמכין את הקרקע ל־normalization, phase resolution ו־progress calculation.
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `progressSchema`
- dependencies:
  - `Agent Runtime`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create run progress normalizer`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמנרמל אירועי runtime ו־task state למודל progress אחיד
- הערת מצב: המשימה עצמה מומשה, אבל היא עדיין נשענת על `Task Result Ingestion` חלקי; כשה־ingestion יורחב, ה־normalization יקבל run inputs עשירים יותר.
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `normalizedProgressInputs`
- dependencies:
  - `Define execution progress schema`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

3. `Create progress phase resolver`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שקובע את שלב ההתקדמות הנוכחי של הריצה
- הערת מצב: המשימה עצמה מומשה, אבל ה־phase resolution יקבל דיוק טוב יותר אחרי `Agent Runtime` מלא ו־`Execution Surface Layer`, כשיהיו phases עשירים יותר מ־queued/running/completed/failed.
- input:
  - `normalizedProgressInputs`
- output:
  - `progressPhase`
- dependencies:
  - `Create run progress normalizer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create progress percentage calculator`  | סטטוס: 🟢 בוצע
- description: לבנות מחשב אחוזי התקדמות על בסיס state, events ו־logs
- הערת מצב: המשימה עצמה מומשה, אבל חישוב האחוזים יקבל דיוק טוב יותר אחרי `Execution Surface Layer` ו־`Agent Runtime` מלא, כשיהיו signals עשירים יותר מ־logs, runs ו־progress events.
- input:
  - `normalizedProgressInputs`
  - `progressPhase`
- output:
  - `progressPercent`
- dependencies:
  - `Create progress phase resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create completion estimate calculator`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמחשב `completionEstimate` לפי מהירות, שלב ו־signals זמינים
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין לא ETA חי מלא; הדיוק ישתפר אחרי `Execution Surface Layer` ו־`Agent Runtime` מלא, כשיהיו timing signals אמיתיים יותר.
- input:
  - `normalizedProgressInputs`
  - `progressPercent`
- output:
  - `completionEstimate`
- dependencies:
  - `Create progress percentage calculator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create live progress assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמחזיר `progressState` מלא לצרכי API ו־UI
- הערת מצב: המשימה עצמה מומשה, אבל ה־`progressState` יקבל fidelity גבוה יותר אחרי `Agent Runtime` מלא ו־`Execution Surface Layer`, כשיהיו progress events ולוגים עשירים יותר.
- input:
  - `progressPhase`
  - `progressPercent`
  - `completionEstimate`
- output:
  - `progressState`
  - `completionEstimate`
- dependencies:
  - `Create completion estimate calculator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create execution log formatter`  | סטטוס: 🟢 בוצע
- description: לבנות formatter ללוגים, פקודות, תוצאות ו-errors כדי להציג אותם בצורה קריאה
- הערת מצב: המשימה עצמה מומשה, אבל ה־formatter עדיין עובד מעל inputs חלקיים; הוא יקבל עומק טוב יותר אחרי `Execution Surface Layer`, כשיהיו command outputs ולוגים אמיתיים מכל surfaces.
- input:
  - `rawLogs`
  - `commandOutputs`
- output:
  - `formattedLogs`
  - `userFacingMessages`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

4. `Create execution status API`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי `Create execution event summarizer` ואחרי `Create live progress model`, כדי להחזיר status, progress, logs ו־last result ממקור אחיד ולא רק endpoints כלליים.
- description: לבנות endpoints לקבלת מצב execution, לוגים, progress ו-last result
- input:
  - `projectId`
  - `taskId`
- output:
  - `executionStatusPayload`
- dependencies:
  - `Create execution event summarizer`  | סטטוס: 🟡 חלקי
  - `Create live progress model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create execution completion notifier`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמייצר הודעות סיום, כשלון או צורך בהתערבות משתמש
- הערת מצב: המשימה עצמה מומשה, אבל ה־notifier עדיין נשען על `Task Result Ingestion` חלקי; כשה־ingestion יורחב, הוא יתמוך ביותר סוגי תוצאות ו־flows.
- input:
  - `executionResult`
- output:
  - `notificationPayload`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create execution result interpretation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמפרש `executionResultEnvelope` לתוצאה מערכתית ברמת success, failure class, side effects, approvals consumed ו־required follow-up
- input:
  - `executionResultEnvelope`
  - `projectState`
- output:
  - `interpretedExecutionResult`
- dependencies:
  - `Execution Action Routing`
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

7. `Create project state update module`  | סטטוס: 🔴 לא בוצע
- description: לבנות updater כללי שמעדכן את `Project State` אחרי execution רגיל, לא רק ב־bootstrap או release flows
- input:
  - `interpretedExecutionResult`
  - `projectState`
- output:
  - `updatedProjectState`
- dependencies:
  - `Create execution result interpretation module`  | סטטוס: 🔴 לא בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

8. `Create task graph update module`  | סטטוס: 🔴 לא בוצע
- description: לבנות updater כללי לגרף המשימות אחרי execution, approvals, retries, failures ו־follow-up generation
- input:
  - `interpretedExecutionResult`
  - `executionGraph`
- output:
  - `updatedExecutionGraph`
- dependencies:
  - `Create execution result interpretation module`  | סטטוס: 🔴 לא בוצע
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

9. `Create progress tracking state model`  | סטטוס: 🔴 לא בוצע
- description: לבנות state model שמרכז progress מצטבר ברמת run, task, project ו־milestone ולא רק progress של ריצה אחת
- input:
  - `progressState`
  - `updatedProjectState`
- output:
  - `progressTrackingState`
- dependencies:
  - `Create live progress model`  | סטטוס: 🔴 לא בוצע
  - `Create project state update module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create diff and change explanation model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model מפורש להצגת diffs, changed artifacts, user-facing impact ו־what changed since last step
- input:
  - `executionArtifacts`
  - `changeExplanation`
- output:
  - `diffChangeExplanation`
- dependencies:
  - `Create execution change explanation builder`  | סטטוס: 🟢 בוצע
  - `Execution Action Routing`
- connects_to: `Project State`

11. `Create execution audit trace recorder`  | סטטוס: 🔴 לא בוצע
- description: לבנות recorder שמתעד invocation, provider choice, approval chain, artifacts, interpreted result ו־state changes ל־audit trace אחד
- input:
  - `executionInvocation`
  - `interpretedExecutionResult`
  - `updatedProjectState`
- output:
  - `executionAuditTrace`
- dependencies:
  - `Create execution result interpretation module`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Project State`

#### `Failure Recovery & Rollback`

משימות טכניות:

1. `Define failure recovery schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־failure classes, retryability, fallback options, rollback scope ו־user recovery prompts
- input:
  - `executionResult`
  - `failureSummary`
- output:
  - `failureRecoveryModel`
- dependencies:
  - `Execution Feedback Layer`
- connects_to: `Project State`

2. `Create retry policy resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שקובע אם failure מסוים צריך retry, כמה פעמים ובאיזה backoff strategy
- input:
  - `failureRecoveryModel`
  - `taskType`
- output:
  - `retryPolicy`
- dependencies:
  - `Define failure recovery schema`  | סטטוס: 🟢 בוצע
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

3. `Create fallback strategy resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמציע דרך חלופית כש־surface, provider או execution path מסוים נכשל
- input:
  - `failureRecoveryModel`
  - `executionModeDecision`
- output:
  - `fallbackStrategy`
- dependencies:
  - `Define failure recovery schema`  | סטטוס: 🟢 בוצע
  - `Execution Topology Model`
- connects_to: `Execution Surface`

4. `Create rollback scope planner`  | סטטוס: 🟢 בוצע
- description: לבנות planner שקובע מה צריך לחזור אחורה אחרי failure: קבצים, state, deploy, release draft או provider side effect
- input:
  - `failureRecoveryModel`
  - `executionMetadata`
- output:
  - `rollbackPlan`
- dependencies:
  - `Define failure recovery schema`  | סטטוס: 🟢 בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

5. `Create recovery orchestration module`  | סטטוס: 🟢 בוצע
- description: לבנות orchestration שמבצע retry, fallback, rollback או בקשת החלטה מהמשתמש לפי recovery policy
- input:
  - `retryPolicy`
  - `fallbackStrategy`
  - `rollbackPlan`
- output:
  - `recoveryDecision`
  - `recoveryActions`
- dependencies:
  - `Create retry policy resolver`  | סטטוס: 🟢 בוצע
  - `Create fallback strategy resolver`  | סטטוס: 🟢 בוצע
  - `Create rollback scope planner`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create user-facing recovery options assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמציג למשתמש מה נשבר, מה ניסינו, מה הוחזר אחורה ומהן אפשרויות ההמשך
- input:
  - `failureRecoveryModel`
  - `recoveryDecision`
- output:
  - `recoveryOptionsPayload`
- dependencies:
  - `Create recovery orchestration module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

---

### שלב 5.5 — Delivery & Release

#### `Delivery / Release Flow`

Refinements מאושרים:
- להוסיף `release target taxonomy`

משימות טכניות:

1. `Create release plan generator`  | סטטוס: 🟢 בוצע
- description: לבנות generator שמתרגם project state ו-domain לתוכנית release מפורטת
- input:
  - `projectState`
  - `domain`
  - `releaseTarget`
- output:
  - `releasePlan`
  - `releaseSteps`
- dependencies:
  - `Universal Project Lifecycle`
  - `Expanded Domain Adaptation`
- connects_to: `Execution Graph`

2. `Create release pipeline orchestrator`  | סטטוס: 🔴 לא בוצע
- description: לבנות orchestrator שמריץ לפי סדר את שלבי ה־build, validation, assets, metadata, submission ו-tracking
- input:
  - `releasePlan`
- output:
  - `releaseRun`
  - `stepAssignments`
- dependencies:
  - `Agent Runtime`  | סטטוס: 🟡 חלקי
  - `Execution Surface Layer`
- connects_to: `Agent Runtime`

3. `Create release validation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות validator שבודק readiness לפני הפצה
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `validationReport`
  - `blockingIssues`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

פירוק נוסף:

1. `Define release requirements schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לדרישות release לפי target
- input:
  - `releaseTarget`
  - `domain`
- output:
  - `releaseRequirementsSchema`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

2. `Create artifact readiness validator`  | סטטוס: 🟢 בוצע
- description: לבנות validator שבודק שכל artifacts הנדרשים קיימים ותקינים
- הערת מצב: המשימה עצמה מומשה, אבל היא תקבל כיסוי טוב יותר אחרי `Build & Release System`, כשיהיו artifacts אמיתיים במקום artifacts נגזרים מה־state.
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `artifactValidation`
- dependencies:
  - `Build & Release System`
- connects_to: `Project State`

3. `Create metadata readiness validator`  | סטטוס: 🟢 בוצע
- description: לבנות validator שבודק שכל metadata לשחרור קיים ותקין
- הערת מצב: המשימה עצמה מומשה, אבל היא תקבל כיסוי מלא יותר אחרי `Delivery / Release Flow`, כשיהיו מקורות metadata עשירים יותר ממסלולי release אמיתיים ולא רק metadata נגזר מהמצב הקיים.
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `metadataValidation`
- dependencies:
  - `Delivery / Release Flow`
- connects_to: `Project State`

4. `Create approval readiness validator`  | סטטוס: 🟢 בוצע
- description: לבנות validator שבודק שכל האישורים הנדרשים קיימים לפני release
- הערת מצב: המשימה עצמה מומשה, אבל היא תקבל תוקף מלא יותר אחרי `Approval System`, כשדרישות approval יגיעו ממנגנון הרשאות ואישורים ייעודי ולא רק מ־release requirements ו־project approvals קיימים.
- input:
  - `releaseRequirements`
  - `projectState`
- output:
  - `approvalValidation`
- dependencies:
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create blocking issues classifier`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמסווג בעיות validation ל־blocking classes
- הערת מצב: המשימה עצמה מומשה, אבל הסיווג יעמיק עוד יותר אחרי `Delivery / Release Flow` מלא, כשיהיו גם classes עשירים יותר של failures, submission blockers ו־provider-side issues.
- input:
  - `artifactValidation`
  - `metadataValidation`
  - `approvalValidation`
- output:
  - `blockingIssues`
- dependencies:
  - `Create artifact readiness validator`  | סטטוס: 🟢 בוצע
  - `Create metadata readiness validator`  | סטטוס: 🟢 בוצע
  - `Create approval readiness validator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create release validation assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמחזיר `validationReport` מלא בפורמט קנוני
- הערת מצב: המשימה עצמה מומשה, אבל ה־`validationReport` יקבל עומק גדול יותר אחרי `Delivery / Release Flow` מלא, כשייכנסו גם תוצאות runtime, provider feedback ו־submission states.
- input:
  - `artifactValidation`
  - `metadataValidation`
  - `approvalValidation`
  - `blockingIssues`
- output:
  - `validationReport`
  - `blockingIssues`
- dependencies:
  - `Create blocking issues classifier`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create release state updater`  | סטטוס: 🟢 בוצע
- description: לבנות updater שמעדכן את state וה-graph לפי התקדמות release
- הערת מצב: המשימה עצמה מומשה, אבל היא תתייצב עוד יותר אחרי הרחבת `Task Result Ingestion`, כי כרגע היא נשענת על `releaseEvents` ו־`validationReport` נגזרים ולא על release runtime מלא.
- input:
  - `releaseEvents`
  - `validationReport`
- output:
  - `updatedProjectState`
  - `updatedExecutionGraph`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

#### `Deployment & Hosting Orchestrator`

Refinements מאושרים:
- להוסיף `provider capability matrix`

משימות טכניות:

1. `Create hosting provider adapter contract`  | סטטוס: 🟢 בוצע
- description: לבנות contract אחיד לחיבור לספקי hosting שונים
- הערת מצב: המשימה עצמה מומשה כולל `provider capability matrix`, אבל זה עדיין contract קנוני ולא שכבת provision או deploy מלאה; החיבור המעשי יגיע בהמשך עם `environment provisioner` ו־`deployment execution module`.
- input:
  - `providerConfig`
- output:
  - `hostingAdapter`
- dependencies:
  - `Source Adapter Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

2. `Create environment provisioner`  | סטטוס: 🔴 לא בוצע
- description: לבנות service שמקים סביבות `development`, `staging`, `production`
- input:
  - `hostingProvider`
  - `environmentConfig`
- output:
  - `environmentResources`
- dependencies:
  - `External Accounts Connector`
  - `Credentials Management`
- connects_to: `Execution Surface`

3. `Create env management module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמייצר, מאמת ושומר משתני סביבה לפי סביבה
- input:
  - `projectConfig`
  - `environmentResources`
- output:
  - `envSet`
  - `missingSecrets`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`

4. `Create domain and routing provisioner`  | סטטוס: 🔴 לא בוצע
- description: לבנות service שמחבר domain, routes ו-endpoints לפרויקט הפרוס
- input:
  - `deploymentTarget`
  - `domainConfig`
- output:
  - `domainBinding`
- dependencies:
  - `Deployment & Hosting Orchestrator`
- connects_to: `Execution Surface`

5. `Create deployment execution module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמריץ deploy בפועל דרך ספק האחסון
- input:
  - `buildArtifact`
  - `deploymentConfig`
- output:
  - `deploymentResult`
- dependencies:
  - `Build & Release System`
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define deployment request schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לבקשת deployment
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין request schema קנוני בלבד; ה־deployment בפועל יגיע רק אחרי `deployment provider resolver`, `deployment invoker` ו־`Execution Surface Layer`.
- input:
  - `buildArtifact`
  - `deploymentConfig`
- output:
  - `deploymentRequest`
- dependencies:
  - `Build & Release System`
- connects_to: `Execution Surface`

2. `Create deployment provider resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שבוחר provider adapter מתאים לביצוע ה־deploy
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין resolver קנוני בלבד; ה־deploy בפועל יגיע רק אחרי `deployment artifact preparer`, `deployment invoker` ו־`Execution Surface Layer`.
- input:
  - `deploymentRequest`
- output:
  - `providerAdapter`
- dependencies:
  - `Create hosting provider adapter contract`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create deployment artifact preparer`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמכין את ה־artifact לפריסה לפי דרישות ה־provider
- הערת מצב: המשימה עצמה מומשה, אבל היא עדיין מכינה `preparedArtifact` קנוני בלבד; ההרצה בפועל תגיע רק עם `deployment invoker` ו־`Execution Surface Layer`.
- input:
  - `buildArtifact`
  - `deploymentConfig`
- output:
  - `preparedArtifact`
- dependencies:
  - `Create deployment request schema`
- connects_to: `Execution Surface`

4. `Create deployment invoker`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמבצע deploy בפועל דרך ה־provider adapter
- input:
  - `providerAdapter`
  - `preparedArtifact`
  - `deploymentConfig`
- output:
  - `providerDeploymentResult`
- dependencies:
  - `Create deployment provider resolver`  | סטטוס: 🟢 בוצע
  - `Create deployment artifact preparer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create deployment evidence collector`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שאוסף URLים, environment ids ו־provider metadata אחרי deploy
- input:
  - `providerDeploymentResult`
- output:
  - `deploymentEvidence`
- dependencies:
  - `Create deployment invoker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

6. `Create deployment result envelope`  | סטטוס: 🔴 לא בוצע
- description: לבנות envelope אחיד של `deploymentResult` לרכיבי tracking ו־state update
- input:
  - `providerDeploymentResult`
  - `deploymentEvidence`
- output:
  - `deploymentResult`
- dependencies:
  - `Create deployment evidence collector`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

7. `Create production health validation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות validator שבודק אחרי deploy זמינות, routing, auth reachability, critical endpoints ו־basic smoke health לפני launch confirmation
- input:
  - `deploymentResult`
  - `environmentResources`
- output:
  - `productionHealthValidation`
- dependencies:
  - `Create deployment result envelope`  | סטטוס: 🔴 לא בוצע
  - `Create environment provisioner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create launch confirmation state`  | סטטוס: 🔴 לא בוצע
- description: לבנות state שמאשר אם הפרויקט אכן עלה לאוויר, מה ה־live endpoints, אילו checks עברו ומה הסטטוס למשתמש
- input:
  - `deploymentResult`
  - `productionHealthValidation`
- output:
  - `launchConfirmation`
- dependencies:
  - `Create production health validation module`  | סטטוס: 🔴 לא בוצע
  - `Release Status Tracking`
- connects_to: `Project State`

9. `Create release readiness evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator קנוני שמכריע אם הפרויקט באמת מוכן ל־release לפי validation, approvals, env readiness ו־deployment prerequisites
- input:
  - `validationReport`
  - `approvalValidation`
  - `environmentResources`
- output:
  - `releaseReadinessDecision`
- dependencies:
  - `Delivery / Release Flow`
  - `Create environment provisioner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create environment preparation checklist`  | סטטוס: 🔴 לא בוצע
- description: לבנות checklist קנוני להכנת environments לפני build או deploy כולל infra, domains, secrets, configs ו־smoke prerequisites
- input:
  - `environmentResources`
  - `deploymentConfig`
- output:
  - `environmentPreparationState`
- dependencies:
  - `Create environment provisioner`  | סטטוס: 🔴 לא בוצע
  - `Create env management module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

11. `Create deployment planning module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמתרגם release readiness, environment state, deployment target ו־provider constraints לתוכנית deployment מפורשת עם sequencing, approvals ו־rollback posture
- input:
  - `releaseReadinessDecision`
  - `environmentPreparationState`
  - `deploymentRequest`
- output:
  - `deploymentPlan`
  - `deploymentSequence`
- dependencies:
  - `Create release readiness evaluator`  | סטטוס: 🔴 לא בוצע
  - `Create environment preparation checklist`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Build & Release System`

Refinements מאושרים:
- להוסיף `artifact manifest`

משימות טכניות:

1. `Create build target resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שקובע אילו builds נדרשים לפי domain ו-release target
- הערת מצב: המשימה עצמה מומשה כולל `artifact manifest` בסיסי, אבל היא עדיין resolver קנוני בלבד; הרצת builds בפועל תגיע רק עם `build runner`.
- input:
  - `domain`
  - `releaseTarget`
- output:
  - `buildTargets`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

2. `Create build runner`  | סטטוס: 🔴 לא בוצע
- description: לבנות runner שמריץ build commands לפי target
- input:
  - `buildTarget`
  - `executionSurface`
- output:
  - `buildArtifact`
  - `buildLogs`
- dependencies:
  - `Execution Surface Layer`
  - `Development Environment Connectors`
- connects_to: `Execution Surface`

3. `Create artifact registry module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול ששומר metadata על artifacts, גרסאות ונתיבי output
- הערת מצב: המשימה עצמה מומשה, אבל ה־registry עדיין נבנה מעל `buildResult` נגזר מהמצב הקיים; הוא יקבל ערך מלא יותר אחרי `build runner` אמיתי.
- input:
  - `buildResult`
- output:
  - `artifactRecord`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create versioning service`  | סטטוס: 🟢 בוצע
- description: לבנות service לניהול version numbers ו-release identifiers
- הערת מצב: המשימה עצמה מומשה, אבל ה־versioning עדיין נשען על state ו־release policy נגזרים; הוא יקבל ערך מלא יותר אחרי `build runner` ו־release runtime אמיתי.
- input:
  - `releasePolicy`
  - `currentVersion`
- output:
  - `nextVersion`
  - `releaseTag`
- dependencies:
  - `Build & Release System`
- connects_to: `Project State`

5. `Create packaging module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמכין חבילות שחרור לפי target
- input:
  - `buildArtifact`
  - `releaseTarget`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create build runner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define packaging requirements schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לדרישות packaging לפי `releaseTarget`
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין packaging requirements schema בלבד; ה־packaging בפועל יגיע רק עם `package format resolver`, `packaging manifest builder` ו־`package assembler`.
- input:
  - `buildArtifact`
  - `releaseTarget`
- output:
  - `packagingRequirements`
- dependencies:
  - `Create build target resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

2. `Create package format resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שבוחר פורמט package מתאים לפי target
- הערת מצב: המשימה עצמה מומשה, אבל זה עדיין resolver קנוני בלבד; בניית package בפועל תגיע רק עם `packaging manifest builder` ו־`package assembler`.
- input:
  - `releaseTarget`
  - `packagingRequirements`
- output:
  - `packageFormat`
- dependencies:
  - `Define packaging requirements schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create packaging manifest builder`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמייצר manifest של קבצים, metadata ו־assets לחבילה
- הערת מצב: המשימה עצמה מומשה, אבל היא עדיין בונה `packagingManifest` קנוני בלבד; הרכבת package בפועל תגיע רק עם `package assembler`.
- input:
  - `buildArtifact`
  - `packageFormat`
- output:
  - `packagingManifest`
- dependencies:
  - `Create package format resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create package assembler`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמרכיב את החבילה הסופית מה־artifact וה־manifest
- הערת מצב: המשימה עצמה מומשה, אבל היא עדיין מרכיבה `packagedArtifact` קנוני בלבד; שכבת packaging execution מלאה תגיע רק יחד עם verification ו־release runtime רחב יותר.
- input:
  - `buildArtifact`
  - `packagingManifest`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create packaging manifest builder`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create package verification module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמאמת שהחבילה שנוצרה תואמת לדרישות target
- input:
  - `packagedArtifact`
  - `packagingRequirements`
- output:
  - `packageVerification`
- dependencies:
  - `Create package assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־verification עדיין בודק package קנוני נגזר; הוא יקבל כיסוי מלא יותר אחרי packaging execution ו־build runner אמיתי.

6. `Create packaging result envelope`  | סטטוס: 🟢 בוצע
- description: לבנות envelope אחיד שמחזיר package, manifest ו־verification metadata
- input:
  - `packagedArtifact`
  - `packagingManifest`
  - `packageVerification`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create package verification module`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־envelope עדיין נאסף מעל packaging קנוני נגזר; הוא יקבל עומק מלא יותר אחרי packaging execution ו־build runner אמיתי.

#### `Testing & Quality Assurance Layer`

משימות טכניות:

1. `Define test execution schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־test runs כולל unit, integration, e2e, smoke ו־sanity checks
- input:
  - `buildTarget`
  - `testConfig`
- output:
  - `testExecutionRequest`
- dependencies:
  - `Build & Release System`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`testExecutionRequest` עדיין קנוני ונגזר מ־build/release context פנימי; הוא יקבל ערך מלא יותר אחרי `Create automated test orchestration module` ו־`Execution Surface Layer`.

2. `Create automated test orchestration module`  | סטטוס: 🟢 בוצע
- description: לבנות orchestration להרצת suites רלוונטיות לפי domain, risk ו־release stage
- input:
  - `testExecutionRequest`
  - `changeSet`
- output:
  - `testRunPlan`
- dependencies:
  - `Define test execution schema`  | סטטוס: 🟢 בוצע
  - `Diff Preview`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`testRunPlan` עדיין קנוני ונגזר מ־changeSet פנימי ולא מ־runner חי; הוא יקבל ערך מלא יותר אחרי `Create test runner adapter layer`.

3. `Create test runner adapter layer`  | סטטוס: 🟢 בוצע
- description: לבנות adapter layer להרצת test runners שונים ולהחזרת תוצאות בפורמט אחיד
- input:
  - `testRunPlan`
  - `executionSurface`
- output:
  - `rawTestResults`
- dependencies:
  - `Create automated test orchestration module`  | סטטוס: 🟢 בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`rawTestResults` עדיין קנוני ונשען על execution surface resolved פנימי ולא על runner חי; הוא יקבל ערך מלא יותר אחרי `Execution Surface Layer`.

4. `Create test result normalization module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמנרמל failures, flaky tests, coverage ו־suite outcomes לתוצאה אחידה
- input:
  - `rawTestResults`
- output:
  - `normalizedTestResults`
- dependencies:
  - `Create test runner adapter layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`normalizedTestResults` עדיין נשען על `rawTestResults` קנוני ולא על runner חי; הוא יקבל ערך מלא יותר אחרי `Execution Surface Layer`.

5. `Create pre-deploy quality gate`  | סטטוס: 🟢 בוצע
- description: לבנות quality gate שמונע deploy כשבדיקות, coverage או smoke checks לא עומדים ברף
- input:
  - `normalizedTestResults`
  - `validationReport`
- output:
  - `qualityGateDecision`
- dependencies:
  - `Create test result normalization module`  | סטטוס: 🟢 בוצע
  - `Delivery / Release Flow`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`qualityGateDecision` עדיין נשען על תוצאות בדיקות קנוניות ולא על runners חיים; הוא יקבל ערך מלא יותר אחרי `Execution Surface Layer`.

6. `Create test reporting and remediation summary`  | סטטוס: 🟢 בוצע
- description: לבנות summary קריא למשתמש של מה נבדק, מה נכשל, מה flaky ומהן פעולות התיקון הבאות
- input:
  - `normalizedTestResults`
  - `failureSummary`
- output:
  - `testReportSummary`
- dependencies:
  - `Create test result normalization module`  | סטטוס: 🟢 בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`testReportSummary` עדיין נשען על `normalizedTestResults` ו־`failureSummary` קנוניים; הוא יקבל ערך מלא יותר אחרי `Failure Recovery & Rollback`.

7. `Create validation and test execution orchestrator`  | סטטוס: 🔴 לא בוצע
- description: לבנות orchestrator מפורש שמריץ validation, tests, smoke checks ו־quality gates כחלק אחד של readiness לפני release
- input:
  - `testRunPlan`
  - `validationReport`
- output:
  - `validationExecutionState`
- dependencies:
  - `Create automated test orchestration module`  | סטטוס: 🟢 בוצע
  - `Delivery / Release Flow`
- connects_to: `Execution Surface`

#### `V1 Acceptance & Reality Test Harness`

משימות טכניות:

1. `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לתרחישי הקבלה של v1 כולל onboarding, first value, execution, approvals, recovery ו־workspace continuity
- input:
  - `productFlows`
  - `expectedOutcomes`
- output:
  - `acceptanceScenario`
- dependencies:
  - `Testing & Quality Assurance Layer`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceScenario` קנוני עבור onboarding, first value, execution, approvals, recovery ו־workspace continuity; תרחישי ההרצה עצמם יגיעו במשימות הקבלה הבאות.

2. `Create onboarding-to-first-value acceptance test`  | סטטוס: 🟢 בוצע
- description: לבנות test flow שמוכיח שמשתמש יכול לעבור onboarding, bootstrap ולקבל first tangible outcome
- input:
  - `acceptanceScenario`
  - `firstValueOutput`
- output:
  - `acceptanceResult`
- dependencies:
  - `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
  - `Create first tangible outcome generator`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceResult` קנוני עבור תרחיש onboarding-to-first-value; תרחישי acceptance נוספים ימשיכו להרחיב את שכבת הקבלה של `v1`.

3. `Create execution-to-state-update acceptance test`  | סטטוס: 🟢 בוצע
- description: לבנות test flow שמוכיח שהרצה אמיתית מעדכנת project state, artifacts ו־project explanation
- input:
  - `acceptanceScenario`
  - `executionResult`
- output:
  - `acceptanceResult`
- dependencies:
  - `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceResult` קנוני עבור תרחיש execution-to-state-update; תרחישי acceptance הבאים ירחיבו את הכיסוי ל־recovery, approvals ו־workspace continuity.

4. `Create failure-recovery acceptance test`  | סטטוס: 🟢 בוצע
- description: לבנות test flow שמוכיח שכשל עובר דרך retry, fallback, rollback ו־user-facing recovery options
- input:
  - `acceptanceScenario`
  - `recoveryDecision`
- output:
  - `acceptanceResult`
- dependencies:
  - `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceResult` קנוני עבור תרחיש failure-recovery; תרחישי acceptance הבאים ירחיבו את הכיסוי ל־approvals ו־workspace continuity.

5. `Create approval-and-explanation acceptance test`  | סטטוס: 🟢 בוצע
- description: לבנות test flow שמוכיח gating של approvals יחד עם explanation ברור למשתמש
- input:
  - `acceptanceScenario`
  - `projectExplanation`
- output:
  - `acceptanceResult`
- dependencies:
  - `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Explanation Layer`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceResult` קנוני עבור תרחיש approval-explanation; תרחיש acceptance האחרון שנותר ב־v1 הוא continuity בין workspaces.

6. `Create workspace-continuity acceptance test`  | סטטוס: 🟢 בוצע
- description: לבנות test flow שמוכיח ניווט בין workspaces, resume ושמירה על context של אותו פרויקט
- input:
  - `acceptanceScenario`
  - `workspaceNavigationModel`
- output:
  - `acceptanceResult`
- dependencies:
  - `Define V1 acceptance scenario schema`  | סטטוס: 🟢 בוצע
  - `Create cross-workspace navigation model`  | סטטוס: 🟢 בוצע
  - `Workspace Recovery & Resume`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה ומחזירה `acceptanceResult` קנוני עבור תרחיש workspace-continuity; שכבת acceptance של `v1` הושלמה.

#### `External Accounts Connector`

משימות טכניות:

1. `Create external account registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry לחשבונות מחוברים לפי סוג שירות
- input:
  - `accountType`
  - `accountMetadata`
- output:
  - `accountRecord`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־registry עדיין שומר account records בלי `Credentials Management` מלא; כששכבת credentials תיכנס, יתווספו credential references ו־access policy מלאים.

2. `Create provider connector contract`  | סטטוס: 🟢 בוצע
- description: לבנות contract אחיד לחיבור ספקים כמו hosting, stores, analytics ו-ad platforms
- input:
  - `providerType`
  - `credentials`
- output:
  - `providerSession`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־contract עדיין מחזיר provider session קנוני בלי `Credentials Management` ובלי provider execution אמיתי; תתי־הרכיבים שמתחתיו ישלימו את שכבת החיבור המלאה.

פירוק נוסף:

1. `Define provider connector schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־provider connectors לפי סוג ספק
- input:
  - `providerType`
- output:
  - `providerConnectorSchema`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create authentication mode contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה עבור סוגי authentication נתמכים לכל provider
- input:
  - `providerType`
  - `credentials`
- output:
  - `authModeDefinition`
- dependencies:
  - `Define provider connector schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create provider session factory`  | סטטוס: 🟢 בוצע
- description: לבנות factory שמייצר `providerSession` אחיד עבור כל provider
- input:
  - `providerType`
  - `credentials`
- output:
  - `providerSession`
- dependencies:
  - `Create authentication mode contract`  | סטטוס: 🟢 בוצע
  - `Credentials Management`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־factory עדיין נשען על credentials חלקיים בלי `Credentials Management` מלא; כשהשכבה הזאת תיבנה, ה־session יישען על secret references ומדיניות גישה מלאה.

4. `Create provider capability descriptor`  | סטטוס: 🟢 בוצע
- description: לבנות descriptor שמחזיר capabilities נתמכות לכל provider מחובר
- input:
  - `providerSession`
- output:
  - `providerCapabilities`
- dependencies:
  - `Create provider session factory`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create provider operation contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה אחיד לפעולות core מול provider כמו validate, submit, poll, revoke
- input:
  - `providerSession`
- output:
  - `providerOperations`
- dependencies:
  - `Create provider capability descriptor`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create provider connector assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמחזיר connector אחיד לשימוש רכיבי deploy ו־release
- input:
  - `providerSession`
  - `providerCapabilities`
  - `providerOperations`
- output:
  - `providerConnector`
- dependencies:
  - `Create provider operation contract`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־connector עדיין יושב מעל sessions קנוניים בלי `Credentials Management` ובלי provider execution אמיתי; כשהשכבות האלה ייכנסו, אותו connector יהפוך לשכבת החיבור המבצעת בפועל.

3. `Create account verification module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שבודק שהחשבון המחובר תקין וניתן לשימוש
- input:
  - `providerSession`
- output:
  - `verificationResult`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־verification עדיין נשען על provider session קנוני בלי `Credentials Management` מלא; כשהשכבה הזאת תיכנס, האימות יתבסס גם על secret references והרשאות גישה אמיתיות.

4. `Create account linking API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לחיבור, ניתוק ובדיקת חשבונות חיצוניים
- input:
  - `userInput`
  - `providerType`
- output:
  - `linkedAccountPayload`
- dependencies:
  - `Create provider connector contract`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־API עדיין נשען על provider sessions ו־verification קנוניים בלי `Credentials Management` מלא; כשהשכבה הזאת תיכנס, החיבור והאימות יתבססו גם על secret references והרשאות גישה אמיתיות.

#### `Provider Authorization Lifecycle`

משימות טכניות:

1. `Define provider authorization state schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־authorization state של ספקים חיצוניים כולל consent mode, token state, scopes, refresh state ו־revocation metadata
- input:
  - `providerType`
  - `accountRecord`
- output:
  - `providerAuthorizationState`
- dependencies:
  - `External Accounts Connector`
  - `Identity & Auth`
- connects_to: `Project State`

2. `Create provider OAuth consent and token exchange module`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow גנרי ל־OAuth / consent / token exchange עבור ספקים חיצוניים כמו Google, GitHub, Stripe ו־App Store Connect adapters
- input:
  - `providerAuthorizationState`
  - `authorizationRequest`
- output:
  - `providerAuthorizationResult`
- dependencies:
  - `Define provider authorization state schema`  | סטטוס: 🔴 לא בוצע
  - `Credentials Management`
- connects_to: `Project State`

3. `Create provider token refresh and revocation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול לחידוש tokens, invalidation, revoke ו־reauthorization flows עבור ספקים מחוברים
- input:
  - `providerAuthorizationResult`
  - `providerSession`
- output:
  - `providerTokenLifecycle`
- dependencies:
  - `Create provider OAuth consent and token exchange module`  | סטטוס: 🔴 לא בוצע
  - `Create provider session factory`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Prompt Provider Integration`

משימות טכניות:

1. `Define prompt provider contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד ל־prompt providers חיצוניים שמקבל task, context, constraints ו־execution mode ומחזיר compiled prompt עם metadata ואזהרות
- input:
  - `taskIntent`
  - `slimmedContextPayload`
  - `executionModeDecision`
- output:
  - `compiledPrompt`
  - `promptMetadata`
- dependencies:
  - `Context Relevance & Reduction`
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create prompt strategy registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry של אסטרטגיות prompt לפי action type כמו debug, refactor, review, bootstrap ו־research
- input:
  - `taskType`
  - `providerType`
- output:
  - `promptStrategy`
- dependencies:
  - `Define prompt provider contract`  | סטטוס: 🔴 לא בוצע
  - `Expanded Domain Adaptation`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create contextual prompt assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמרכיב prompt מלא מתוך task, state, constraints, approvals ו־artifact references לפני שליחה ל־provider
- input:
  - `promptStrategy`
  - `projectState`
  - `artifactRegistry`
- output:
  - `compiledPrompt`
- dependencies:
  - `Create prompt strategy registry`  | סטטוס: 🔴 לא בוצע
  - `Create context slimming pipeline`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

4. `Create provider-specific prompt adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter שמתרגם `compiledPrompt` לחוזה של provider חיצוני כמו Claude prompt generator ושומר תאימות ל־provider capabilities
- input:
  - `compiledPrompt`
  - `providerConnector`
- output:
  - `providerPromptRequest`
- dependencies:
  - `Create contextual prompt assembler`  | סטטוס: 🔴 לא בוצע
  - `Create provider connector assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create prompt generation trace record`  | סטטוס: 🔴 לא בוצע
- description: לבנות trace שמתעד איזה context נכנס ל־prompt, איזה strategy נבחרה ואיזה provider החזיר את התוצאה
- input:
  - `compiledPrompt`
  - `promptMetadata`
- output:
  - `promptTraceRecord`
- dependencies:
  - `Create provider-specific prompt adapter`  | סטטוס: 🔴 לא בוצע
  - `Project Audit Trail`
- connects_to: `Project State`

#### `Source Control Integration Runtime`

משימות טכניות:

1. `Define source control integration schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לחיבורי source control כמו GitHub ו־GitLab כולל installation mode, repo scope, branch policy ו־webhook metadata
- input:
  - `providerType`
  - `accountRecord`
- output:
  - `sourceControlIntegration`
- dependencies:
  - `Create provider connector assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create Git app installation and OAuth flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow מפורש להתקנת GitHub App או OAuth provider, קבלת consent ושיוך installation/user session לחשבון המחובר
- input:
  - `providerType`
  - `userIdentity`
  - `installationRequest`
- output:
  - `sourceControlAuthorization`
- dependencies:
  - `Identity & Auth`
  - `Source Control Integration Runtime`
- connects_to: `Project State`

3. `Create repository permission scope resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע לאילו repos, branches ופעולות יש ל־Nexus הרשאה בפועל לפי installation, token scope ו־workspace policy
- input:
  - `sourceControlAuthorization`
  - `workspaceModel`
- output:
  - `repositoryPermissionScope`
- dependencies:
  - `Create Git app installation and OAuth flow`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

4. `Create repository workspace hydration module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שטוען repo אמיתי לתוך workspace, כולל branch checkout, file snapshot ו־metadata sync
- input:
  - `repositoryPermissionScope`
  - `cloudWorkspaceModel`
- output:
  - `hydratedWorkspace`
- dependencies:
  - `Create cloud execution workspace model`  | סטטוס: 🟢 בוצע
  - `Create repository permission scope resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

5. `Create git change writeback module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול ששומר שינויים מה־workspace חזרה ל־git דרך branch, commit, push ו־optional pull request flow
- input:
  - `hydratedWorkspace`
  - `changeSet`
- output:
  - `gitWritebackResult`
- dependencies:
  - `Create repository workspace hydration module`  | סטטוס: 🔴 לא בוצע
  - `Diff Preview`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create inbound provider webhook ingestion`  | סטטוס: 🔴 לא בוצע
- description: לבנות ingestion layer ל־webhooks נכנסים מ־GitHub, GitLab וספקים נוספים עם verification, signature validation ו־event persistence
- input:
  - `webhookRequest`
  - `providerType`
- output:
  - `providerWebhookEvent`
- dependencies:
  - `Application Runtime Layer`
  - `Source Control Integration Runtime`
- connects_to: `Execution Surface`

7. `Create provider event normalization module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמנרמל אירועי provider כמו push, pull request, install, pipeline failure ו־release events לפורמט אחיד של Nexus
- input:
  - `providerWebhookEvent`
- output:
  - `normalizedProviderEvent`
- dependencies:
  - `Create inbound provider webhook ingestion`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create repository state refresh resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמעדכן את project state וה־workspace כשה־repo השתנה ידנית מחוץ ל־Nexus
- input:
  - `normalizedProviderEvent`
  - `projectState`
- output:
  - `repositoryRefreshDecision`
- dependencies:
  - `Create provider event normalization module`  | סטטוס: 🔴 לא בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Credentials Management`

Refinements מאושרים:
- להוסיף `secret reference lifecycle`

משימות טכניות:

1. `Create credential vault interface`  | סטטוס: 🟢 בוצע
- description: לבנות interface אחיד לשמירה וקריאה של סודות ומפתחות
- input:
  - `credentialKey`
  - `credentialValue`
- output:
  - `credentialReference`
- dependencies:
  - `Policy Layer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־vault עדיין מחזיר secret references קנוניים בלי `Policy Layer` ובלי הצפנה אמיתית; כשהשכבות האלה ייכנסו, אותו interface יישען על access policy ו־secret reference lifecycle מלא.

2. `Create credential encryption module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול להצפנה ופענוח של credentials
- input:
  - `plainCredential`
- output:
  - `encryptedCredential`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל כרגע יש שכבת הצפנה ליצירת `encryptedCredential` בלבד; פענוח, access policy ו־secret resolution מלאים ייכנסו עם שאר שכבת `Credentials Management`.

3. `Create credential access policy`  | סטטוס: 🔴 לא בוצע
- description: לבנות מנגנון שמגדיר מי יכול להשתמש בכל credential ובאיזה flow
- input:
  - `credentialReference`
  - `actorType`
- output:
  - `accessDecision`
- dependencies:
  - `Tool Invocation Policy`
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Agent Runtime`

4. `Create secret resolution module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמזריק secrets ל-build, deploy או execution בלי לחשוף אותם ל־UI
- input:
  - `executionRequest`
  - `credentialReferences`
- output:
  - `resolvedExecutionConfig`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

5. `Create secrets and configuration binding resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקושר secrets, env vars, provider credentials ו־runtime config ל־environment המתאים לפני execution או deployment
- input:
  - `credentialReferences`
  - `environmentPreparationState`
  - `deploymentConfig`
- output:
  - `configurationBinding`
- dependencies:
  - `Create secret resolution module`  | סטטוס: 🔴 לא בוצע
  - `Create environment preparation checklist`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Distribution Ownership Model`

משימות טכניות:

1. `Create ownership policy model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל שמגדיר שהמשתמש הוא owner של assets, accounts ו-distribution targets
- input:
  - `userId`
  - `projectId`
- output:
  - `ownershipPolicy`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: מודל הבעלות הקנוני מומש ומוזן ל־`Project State`, אבל הוא עדיין לא אוכף authorization; הבדיקות וה־guards של שימוש ב־ownership יגיעו במשימות ההמשך.

2. `Create distribution authorization checks`  | סטטוס: 🔴 לא בוצע
- description: לבנות בדיקות שמונעות פרסום או submission בלי owner authorization מתאים
- input:
  - `releaseAction`
  - `ownershipPolicy`
- output:
  - `authorizationResult`
- dependencies:
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

3. `Create owner-consent recorder`  | סטטוס: 🟢 בוצע
- description: לבנות מודול ששומר אישורים של המשתמש על פעולות release והפצה
- input:
  - `projectId`
  - `consentAction`
- output:
  - `consentRecord`
- dependencies:
  - `Distribution Ownership Model`
- connects_to: `Project State`
- הערת מצב: ה־recorder הקנוני מומש ושומר `consentRecord` ב־`Project State`, אבל enforcement מול publish/submission עדיין יגיע רק עם `Approval System` ו־`distribution authorization checks`.

4. `Create ownership-aware release guard`  | סטטוס: 🟢 בוצע
- description: לבנות guard שמוודא שכל flow של release משתמש בחשבונות ובנכסים של המשתמש
- input:
  - `releasePlan`
  - `linkedAccounts`
- output:
  - `guardResult`
- dependencies:
  - `External Accounts Connector`
  - `Distribution Ownership Model`
- connects_to: `Execution Surface`
- הערת מצב: ה־guard הקנוני מומש ומחזיר `guardResult` לפי `ownershipPolicy`, `releasePlan` ו־`linkedAccounts`, אבל enforcement בזמן execution יתחזק עוד אחרי `Approval System` ו־`distribution authorization checks`.

#### `Release Status Tracking`

Refinements מאושרים:
- להוסיף `terminal states`

משימות טכניות:

1. `Create release status state model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל מצב אחיד לסטטוסי build, deploy, review, publish ו-rejection
- input:
  - `releaseEvents`
- output:
  - `releaseStatus`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: מודל ה־release status הקנוני מומש כולל `terminal states`, אבל הוא עדיין נגזר מ־`releaseEvents` פנימיים ולא מ־polling אמיתי מול providers/stores.

2. `Create store and provider status pollers`  | סטטוס: 🟢 בוצע
- description: לבנות pollers שמושכים סטטוס מספקי deployment ו-stores חיצוניים
- input:
  - `releaseTarget`
  - `providerSession`
- output:
  - `statusEvents`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`
- הערת מצב: שכבת polling הקנונית מומשה כולל schema, resolver, execution, normalization, terminal detection ו־metadata, אבל היא עדיין מייצרת `statusEvents` קנוניים ולא מושכת סטטוסים חיים מספקים חיצוניים.

פירוק נוסף:

1. `Define release polling schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לבקשות polling מול providers ו־stores
- input:
  - `releaseTarget`
  - `providerSession`
- output:
  - `pollingRequest`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create provider status resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שבוחר poller מתאים לפי provider ו־release target
- input:
  - `pollingRequest`
- output:
  - `resolvedPoller`
- dependencies:
  - `Define release polling schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create polling execution module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמבצע polling בפועל ומחזיר raw status
- input:
  - `resolvedPoller`
  - `pollingRequest`
- output:
  - `rawStatusResponse`
- dependencies:
  - `Create provider status resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create status normalization module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמנרמל תשובות provider ל־status events אחידים
- input:
  - `rawStatusResponse`
- output:
  - `statusEvents`
- dependencies:
  - `Create polling execution module`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create terminal state detector`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמזהה אם ה־status הנוכחי הוא terminal או דורש המשך polling
- input:
  - `statusEvents`
- output:
  - `pollingDecision`
- dependencies:
  - `Create status normalization module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create polling metadata builder`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמחזיר metadata של polling כמו next poll, attempts ו־provider cursor
- input:
  - `pollingRequest`
  - `statusEvents`
  - `pollingDecision`
- output:
  - `pollingMetadata`
- dependencies:
  - `Create terminal state detector`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create release timeline builder`  | סטטוס: 🟢 בוצע
- description: לבנות builder שמייצר timeline של שלבי release והמצב הנוכחי של כל שלב
- input:
  - `releaseRun`
  - `statusEvents`
- output:
  - `releaseTimeline`
- dependencies:
  - `Release Status Tracking`
- connects_to: `Project State`
- הערת מצב: ה־timeline builder הקנוני מומש ומוזן ל־`Project State`, אבל כרגע הוא נשען על `releaseRun` ו־`statusEvents` פנימיים ולא על polling/provider tracking חי.

4. `Create rejection and failure mapper`  | סטטוס: 🟢 בוצע
- description: לבנות mapper שמתרגם rejection reasons ו-failures לחסמים ומשימות המשך
- input:
  - `providerErrors`
  - `reviewFeedback`
- output:
  - `failureSummary`
  - `followUpTasks`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
  - `Bottleneck Resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`
- הערת מצב: ה־mapper הקנוני מומש ומחזיר `failureSummary` ו־`followUpTasks`, אבל הוא עדיין נשען על `Task Result Ingestion` חלקי ועל ה־bottleneck הקיים, ולא על release failures חיים מכל execution surfaces.

5. `Create release tracking API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לקבלת סטטוס release, timeline ו-failure reasons
- input:
  - `projectId`
  - `releaseRunId`
- output:
  - `releaseTrackingPayload`
- dependencies:
  - `Create release timeline builder`  | סטטוס: 🟢 בוצע
  - `Create rejection and failure mapper`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־API מומש על גבי `ProjectService` ו־HTTP endpoints ומחזיר `releaseStatus`, `releaseTimeline`, `failureSummary` ו־`followUpTasks`, אבל הוא עדיין נשען על tracking קנוני פנימי ולא על provider polling חי.

---

### שלב 5.75 — Growth Execution & Marketing Distribution
המטרה: להפוך את שכבת ה־business/growth מ־planning בלבד למערכת שיודעת לבנות אסטרטגיה, לייצר assets, לתכנן קמפיינים, להפיץ ולמדוד.

#### `Content Strategy Engine`

משימות טכניות:

1. `Define content strategy schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לאסטרטגיית תוכן לפי audience, positioning, channels ו־goals
- input:
  - `businessContext`
  - `domain`
- output:
  - `contentStrategySchema`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create audience and angle resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמתרגם audience, pains ו־positioning לזוויות מסר עיקריות
- input:
  - `businessContext`
  - `contentStrategySchema`
- output:
  - `messageAngles`
  - `audienceSegments`
- dependencies:
  - `Define content strategy schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create channel strategy mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות mapper שבוחר ערוצי תוכן מתאימים לפי stage, audience ו־constraints
- input:
  - `businessContext`
  - `messageAngles`
- output:
  - `channelStrategy`
- dependencies:
  - `Create audience and angle resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create content pillar generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator שמגדיר pillars, themes ו־recurring content formats
- input:
  - `channelStrategy`
  - `businessContext`
- output:
  - `contentPillars`
  - `contentFormats`
- dependencies:
  - `Create channel strategy mapper`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create editorial calendar builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות builder ללוח תוכן לפי cadence, channels ו־pillars
- input:
  - `contentPillars`
  - `channelStrategy`
- output:
  - `editorialCalendar`
- dependencies:
  - `Create content pillar generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create content strategy assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמחזיר `contentStrategy` קנוני לשימוש agents ו־UI
- input:
  - `messageAngles`
  - `channelStrategy`
  - `contentPillars`
  - `editorialCalendar`
- output:
  - `contentStrategy`
- dependencies:
  - `Create editorial calendar builder`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Marketing Copy Engine`

משימות טכניות:

1. `Define marketing copy schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־marketing copy לפי asset type, audience ו־CTA
- input:
  - `assetType`
  - `contentStrategy`
- output:
  - `marketingCopySchema`
- dependencies:
  - `Content Strategy Engine`
- connects_to: `Project State`

2. `Create value proposition resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמתרגם positioning ו־message angles ל־core claims
- input:
  - `businessContext`
  - `messageAngles`
- output:
  - `valueProps`
  - `proofPoints`
- dependencies:
  - `Create audience and angle resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create CTA copy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator לכפתורים, headlines ו־action prompts לפי funnel stage
- input:
  - `marketingCopySchema`
  - `valueProps`
- output:
  - `ctaCopy`
- dependencies:
  - `Define marketing copy schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create landing page copy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמייצר headline, subheadline, benefits, objections ו־CTA למסך שיווקי
- input:
  - `contentStrategy`
  - `valueProps`
  - `ctaCopy`
- output:
  - `landingPageCopy`
- dependencies:
  - `Create CTA copy generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create ad copy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמייצר וריאציות ad copy לפי platform ו־campaign objective
- input:
  - `campaignPlan`
  - `valueProps`
- output:
  - `adCopyVariants`
- dependencies:
  - `Campaign Planning System`
- connects_to: `Project State`

6. `Create email sequence copy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־welcome, onboarding, reactivation ו־retention emails
- input:
  - `contentStrategy`
  - `businessContext`
- output:
  - `emailSequenceCopy`
- dependencies:
  - `Content Strategy Engine`
- connects_to: `Project State`

7. `Create copy review validator`  | סטטוס: 🔴 לא בוצע
- description: לבנות validator שבודק clarity, CTA presence, tone consistency ו־channel fit
- input:
  - `marketingAssets`
- output:
  - `copyValidation`
- dependencies:
  - `Marketing Copy Engine`
- connects_to: `Project State`

#### `Campaign Planning System`

משימות טכניות:

1. `Define campaign plan schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־campaign plan לפי objective, audience, channels, budget ו־KPIs
- input:
  - `businessContext`
  - `constraints`
- output:
  - `campaignPlanSchema`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create campaign objective resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שבוחר objective ראשי כמו acquisition, activation, retention או launch
- input:
  - `businessContext`
  - `businessBottleneck`
- output:
  - `campaignObjective`
- dependencies:
  - `Business Bottleneck Resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create audience segment mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות mapper שמתרגם business context ל־segments ישימים לקמפיין
- input:
  - `businessContext`
  - `campaignObjective`
- output:
  - `campaignSegments`
- dependencies:
  - `Create campaign objective resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create channel mix resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שבוחר channel mix מתאים לפי objective, budget ו־segments
- input:
  - `campaignObjective`
  - `campaignSegments`
  - `constraints`
- output:
  - `channelMix`
- dependencies:
  - `Create audience segment mapper`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create budget allocation planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמחלק budget בין channels, creatives ו־tests
- input:
  - `channelMix`
  - `constraints`
- output:
  - `budgetAllocation`
- dependencies:
  - `Create channel mix resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create campaign KPI target planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמגדיר KPI targets לקמפיין לפי objective ו־budget
- input:
  - `campaignObjective`
  - `budgetAllocation`
  - `businessContext`
- output:
  - `campaignTargets`
- dependencies:
  - `Create budget allocation planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create campaign asset checklist builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות checklist לנכסים נדרשים כמו creatives, copy, landing pages ו־tracking
- input:
  - `channelMix`
  - `campaignObjective`
- output:
  - `campaignAssetChecklist`
- dependencies:
  - `Create channel mix resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create campaign plan assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמחזיר `campaignPlan` קנוני
- input:
  - `campaignObjective`
  - `campaignSegments`
  - `channelMix`
  - `budgetAllocation`
  - `campaignTargets`
  - `campaignAssetChecklist`
- output:
  - `campaignPlan`
- dependencies:
  - `Create campaign KPI target planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Marketing Asset Generation`

משימות טכניות:

1. `Define marketing asset schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־assets כמו landing page, ad creative brief, email, post ו־campaign bundle
- input:
  - `assetType`
  - `campaignPlan`
- output:
  - `marketingAssetSchema`
- dependencies:
  - `Campaign Planning System`
- connects_to: `Project State`

2. `Create landing page brief generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־brief של landing page עם sections, message hierarchy ו־CTA
- input:
  - `campaignPlan`
  - `landingPageCopy`
- output:
  - `landingPageBrief`
- dependencies:
  - `Create landing page copy generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create creative brief generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־creative briefs עבור ads ותוכן ויזואלי
- input:
  - `campaignPlan`
  - `adCopyVariants`
- output:
  - `creativeBriefs`
- dependencies:
  - `Create ad copy generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create content asset pack builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמרכיב pack של copy, briefs ו־distribution instructions
- input:
  - `marketingAssetSchema`
  - `landingPageBrief`
  - `creativeBriefs`
  - `emailSequenceCopy`
- output:
  - `marketingAssetPack`
- dependencies:
  - `Create creative brief generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Marketing Distribution Orchestrator`

משימות טכניות:

1. `Define distribution request schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לבקשות distribution של קמפיינים ותוכן
- input:
  - `campaignPlan`
  - `marketingAssetPack`
- output:
  - `distributionRequest`
- dependencies:
  - `Marketing Asset Generation`
- connects_to: `Execution Surface`

2. `Create marketing channel adapter contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד לחיבור channels כמו email, ads, social ו־content CMS
- input:
  - `channelType`
  - `providerSession`
- output:
  - `marketingChannelAdapter`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

3. `Create distribution channel resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שבוחר adapter מתאים לכל distribution request
- input:
  - `distributionRequest`
- output:
  - `resolvedChannels`
- dependencies:
  - `Create marketing channel adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

4. `Create campaign draft publisher`  | סטטוס: 🔴 לא בוצע
- description: לבנות publisher שיוצר drafts של campaigns/posts/emails בערוצים החיצוניים
- input:
  - `distributionRequest`
  - `resolvedChannels`
- output:
  - `distributionDrafts`
- dependencies:
  - `Create distribution channel resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

5. `Create content distribution scheduler`  | סטטוס: 🔴 לא בוצע
- description: לבנות scheduler לפרסום/שליחה לפי cadence ו־channel windows
- input:
  - `editorialCalendar`
  - `distributionDrafts`
- output:
  - `distributionSchedule`
- dependencies:
  - `Create campaign draft publisher`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

6. `Create marketing distribution state updater`  | סטטוס: 🔴 לא בוצע
- description: לבנות updater שמעדכן state לפי draft creation, scheduling ו־publish outcomes
- input:
  - `distributionDrafts`
  - `distributionSchedule`
- output:
  - `updatedMarketingState`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Growth Analytics & Optimization`

משימות טכניות:

1. `Define growth analytics schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למטריקות acquisition, activation, retention, content ו־campaign performance
- input:
  - `campaignPlan`
  - `businessContext`
- output:
  - `growthAnalyticsSchema`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create funnel performance tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמודד performance לפי שלבי funnel
- input:
  - `runtimeSignals`
  - `growthAnalyticsSchema`
- output:
  - `funnelPerformance`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create campaign performance ingestor`  | סטטוס: 🔴 לא בוצע
- description: לבנות ingestion של תוצאות קמפיין מערוצים חיצוניים
- input:
  - `providerMetrics`
- output:
  - `campaignPerformance`
- dependencies:
  - `Marketing Distribution Orchestrator`
- connects_to: `Project State`

4. `Create content performance tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker למדידת ביצועי תוכן לפי asset, channel ו־CTA
- input:
  - `campaignPerformance`
  - `editorialCalendar`
- output:
  - `contentPerformance`
- dependencies:
  - `Create campaign performance ingestor`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create optimization recommendation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמציע next actions לשיפור תוכן, copy, channels ו־budget
- input:
  - `funnelPerformance`
  - `campaignPerformance`
  - `contentPerformance`
- output:
  - `optimizationRecommendations`
- dependencies:
  - `Create content performance tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create growth feedback loop assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמחזיר feedback loop מלא בין planning, distribution ו־optimization
- input:
  - `campaignPlan`
  - `optimizationRecommendations`
- output:
  - `growthFeedbackLoop`
- dependencies:
  - `Create optimization recommendation engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

---

### שלב 5.76 — Advanced Growth Intelligence
המטרה: להעמיק את ה־growth layer לשיווק אורגני, paid acquisition, competitive intelligence ו־learning marketing loops.

#### `SEO & Organic Growth`

משימות טכניות:

1. `Create keyword research service`  | סטטוס: 🔴 לא בוצע
- description: לבנות service למחקר keywords לפי search intent, competition, funnel stage ו־topic clusters
- input:
  - `contentStrategy`
  - `targetAudienceProfile`
- output:
  - `keywordResearch`
- dependencies:
  - `Content Strategy Engine`
  - `Audience & Product Definition`
- connects_to: `Project State`

2. `Create SEO content generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־SEO briefs ול־content outlines לפי keyword clusters ו־search intent
- input:
  - `keywordResearch`
  - `contentPillars`
- output:
  - `seoContentPlan`
- dependencies:
  - `Create keyword research service`  | סטטוס: 🔴 לא בוצע
  - `Create content pillar generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create SEO optimization analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שבודק metadata, headings, topical coverage, CTR hooks ו־search readiness
- input:
  - `seoContentPlan`
  - `websiteCopyPack`
- output:
  - `seoOptimizationReport`
- dependencies:
  - `Create SEO content generator`  | סטטוס: 🔴 לא בוצע
  - `Product Website & Conversion Funnel`
- connects_to: `Project State`

4. `Create internal linking optimizer`  | סטטוס: 🔴 לא בוצע
- description: לבנות optimizer למבנה internal links בין pages, docs, launch posts ו־feature pages
- input:
  - `seoContentPlan`
  - `nexusWebsiteSchema`
- output:
  - `internalLinkPlan`
- dependencies:
  - `Create SEO optimization analyzer`  | סטטוס: 🔴 לא בוצע
  - `Product Website & Conversion Funnel`
- connects_to: `Project State`

#### `Paid Ads System`

משימות טכניות:

1. `Define paid acquisition schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־paid acquisition כולל campaign goals, audiences, creatives, budget ו־attribution
- input:
  - `campaignObjective`
  - `targetAudienceProfile`
- output:
  - `paidAcquisitionSchema`
- dependencies:
  - `Campaign Planning System`
  - `Audience & Product Definition`
- connects_to: `Project State`

2. `Create ad strategy planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שממפה campaign goals, offer type, audience fit ו־channel hypotheses ל־ad strategy
- input:
  - `paidAcquisitionSchema`
  - `campaignPlan`
- output:
  - `adStrategy`
- dependencies:
  - `Define paid acquisition schema`  | סטטוס: 🔴 לא בוצע
  - `Campaign Planning System`
- connects_to: `Project State`

3. `Create ad creative generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator ל־creative briefs, hooks, visual angles ו־copy blocks לפי ad strategy
- input:
  - `adStrategy`
  - `messagingVariants`
- output:
  - `adCreativePack`
- dependencies:
  - `Create ad strategy planner`  | סטטוס: 🔴 לא בוצע
  - `Product Positioning & Messaging`
- connects_to: `Project State`

4. `Create campaign deployment adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter לפריסת campaigns ו־ad sets לערוצי paid חיצוניים בפורמט אחיד
- input:
  - `adCreativePack`
  - `channelConfig`
- output:
  - `campaignDeploymentResult`
- dependencies:
  - `Create ad creative generator`  | סטטוס: 🔴 לא בוצע
  - `External Marketing Integrations`
- connects_to: `Execution Surface`

5. `Create campaign performance tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker ל־spend, CTR, CPL, CAC, conversion ו־creative fatigue לפי campaign
- input:
  - `campaignDeploymentResult`
  - `analyticsSignals`
- output:
  - `campaignPerformance`
- dependencies:
  - `Create campaign deployment adapter`  | סטטוס: 🔴 לא בוצע
  - `Growth Analytics & Optimization`
- connects_to: `Project State`

6. `Create ad optimization engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמציע pause, reallocate, refresh creative או audience shift לפי performance signals
- input:
  - `campaignPerformance`
  - `adStrategy`
- output:
  - `adOptimizationPlan`
- dependencies:
  - `Create campaign performance tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create budget allocation optimizer`  | סטטוס: 🔴 לא בוצע
- description: לבנות optimizer שמחלק budget בין channels, campaigns ו־experiments לפי ROI ו־confidence
- input:
  - `adOptimizationPlan`
  - `budgetConstraints`
- output:
  - `budgetAllocation`
- dependencies:
  - `Create ad optimization engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `External Marketing Integrations`

משימות טכניות:

1. `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד ל־marketing providers כולל auth, campaign ops, reporting ו־rate limits
- input:
  - `providerType`
  - `providerMetadata`
- output:
  - `marketingProviderAdapter`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Project State`

2. `Create Google Ads adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter קנוני ל־campaign deployment, budget updates ו־performance fetch עבור Google Ads
- input:
  - `marketingProviderAdapter`
  - `campaignPayload`
- output:
  - `googleAdsOperation`
- dependencies:
  - `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

3. `Create Meta Ads adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter קנוני ל־campaign deployment, audience sync ו־performance fetch עבור Meta Ads
- input:
  - `marketingProviderAdapter`
  - `campaignPayload`
- output:
  - `metaAdsOperation`
- dependencies:
  - `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

4. `Create analytics adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter קנוני לחיבור analytics providers ולהבאת traffic, conversion ו־channel attribution data
- input:
  - `marketingProviderAdapter`
  - `analyticsRequest`
- output:
  - `analyticsProviderResult`
- dependencies:
  - `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create search console adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter קנוני ל־search visibility, query trends, CTR ו־index coverage data
- input:
  - `marketingProviderAdapter`
  - `searchRequest`
- output:
  - `searchConsoleResult`
- dependencies:
  - `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create content platform adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter קנוני לפרסום וניהול drafts בבלוגים, CMSים ופלטפורמות community/content
- input:
  - `marketingProviderAdapter`
  - `contentAsset`
- output:
  - `contentPlatformResult`
- dependencies:
  - `Define marketing provider adapter contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Marketing Intelligence Loop`

משימות טכניות:

1. `Create unified marketing data ingestion layer`  | סטטוס: 🔴 לא בוצע
- description: לבנות ingestion layer אחידה ל־campaign data, SEO signals, content performance ו־product acquisition events
- input:
  - `providerResults`
  - `productAnalyticsEvents`
- output:
  - `marketingDataBatch`
- dependencies:
  - `External Marketing Integrations`
  - `Nexus Product Analytics`
- connects_to: `Project State`

2. `Create data normalization layer`  | סטטוס: 🔴 לא בוצע
- description: לבנות normalization layer שממפה metrics, channels, campaign entities ו־content entities לשפה שיווקית אחידה
- input:
  - `marketingDataBatch`
- output:
  - `normalizedMarketingData`
- dependencies:
  - `Create unified marketing data ingestion layer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create insight extraction engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחלץ anomalies, winners, losers, fatigue signals ו־unexpected performance insights
- input:
  - `normalizedMarketingData`
- output:
  - `marketingInsights`
- dependencies:
  - `Create data normalization layer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create pattern recognition engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמזהה patterns חוזרים ב־channel performance, creative resonance ו־audience fit
- input:
  - `marketingInsights`
  - `historicalMarketingData`
- output:
  - `marketingPatterns`
- dependencies:
  - `Create insight extraction engine`  | סטטוס: 🔴 לא בוצע
  - `Learning Layer`
- connects_to: `Project State`

5. `Create decision recommendation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמתרגם insights ו־patterns להמלצות execution שיווקיות ישימות
- input:
  - `marketingInsights`
  - `marketingPatterns`
- output:
  - `marketingRecommendations`
- dependencies:
  - `Create pattern recognition engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create feedback reinforcement loop`  | סטטוס: 🔴 לא בוצע
- description: לבנות loop שמחזק או מחליש heuristics שיווקיות לפי outcomes אמיתיים לאורך זמן
- input:
  - `marketingRecommendations`
  - `campaignPerformance`
- output:
  - `reinforcedMarketingHeuristics`
- dependencies:
  - `Create decision recommendation engine`  | סטטוס: 🔴 לא בוצע
  - `Create campaign performance tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create continuous growth loop engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמריץ observation -> analysis -> recommendation -> execution -> measurement cycle שיווקי מתמשך
- input:
  - `reinforcedMarketingHeuristics`
  - `growthFeedbackLoop`
- output:
  - `continuousGrowthLoop`
- dependencies:
  - `Create feedback reinforcement loop`  | סטטוס: 🔴 לא בוצע
  - `Create growth feedback loop assembler`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Competitive Intelligence`

משימות טכניות:

1. `Define competitive intelligence schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למתחרים, positioning, pricing, feature claims, acquisition signals ו־market gaps
- input:
  - `targetAudienceProfile`
  - `marketSignals`
- output:
  - `competitiveIntelligenceSchema`
- dependencies:
  - `Audience & Product Definition`
- connects_to: `Project State`

2. `Create competitor discovery engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמאתר מתחרים ישירים, עקיפים ו־substitutes לפי problem space ו־search behavior
- input:
  - `competitiveIntelligenceSchema`
- output:
  - `competitorSet`
- dependencies:
  - `Define competitive intelligence schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create market landscape mapper`  | סטטוס: 🔴 לא בוצע
- description: לבנות mapper לשוק, קטגוריות, clusters, wedges ו־white spaces
- input:
  - `competitorSet`
  - `competitiveIntelligenceSchema`
- output:
  - `marketLandscape`
- dependencies:
  - `Create competitor discovery engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create pricing intelligence extractor`  | סטטוס: 🔴 לא בוצע
- description: לבנות extractor שמחלץ plans, pricing anchors, packaging logic ו־upgrade paths
- input:
  - `competitorSet`
- output:
  - `pricingIntelligence`
- dependencies:
  - `Create competitor discovery engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create feature comparison engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמשווה claims, capabilities, workflows ו־missing features בין Nexus למתחרים
- input:
  - `competitorSet`
  - `productVision`
- output:
  - `featureComparison`
- dependencies:
  - `Create competitor discovery engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create traffic and visibility analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמעריך visibility, content reach, search presence ו־acquisition strength יחסית
- input:
  - `marketLandscape`
  - `searchConsoleResult`
- output:
  - `visibilityAssessment`
- dependencies:
  - `Create market landscape mapper`  | סטטוס: 🔴 לא בוצע
  - `Create search console adapter`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create review and sentiment analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer ל־reviews, complaints, praise signals ו־sentiment clusters על מתחרים
- input:
  - `competitorFeedback`
- output:
  - `sentimentInsights`
- dependencies:
  - `Create competitor discovery engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create pain point and feature request miner`  | סטטוס: 🔴 לא בוצע
- description: לבנות miner ל־pain points, unmet needs ו־feature requests מתוך reviews, communities ו־sales objections
- input:
  - `sentimentInsights`
  - `customerJourneyMap`
- output:
  - `painPointMap`
  - `featureRequestMap`
- dependencies:
  - `Create review and sentiment analyzer`  | סטטוס: 🔴 לא בוצע
  - `Create customer journey mapper`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create competitive strategy generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator שמתרגם landscape, pricing, feature gaps ו־pain points ל־competitive strategy
- input:
  - `featureComparison`
  - `painPointMap`
  - `pricingIntelligence`
- output:
  - `competitiveStrategy`
- dependencies:
  - `Create feature comparison engine`  | סטטוס: 🔴 לא בוצע
  - `Create pain point and feature request miner`  | סטטוס: 🔴 לא בוצע
  - `Create pricing intelligence extractor`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create positioning recommendation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמציע differentiation, wedges ו־go-to-market positioning לפי competitive strategy
- input:
  - `competitiveStrategy`
  - `nexusPositioning`
- output:
  - `positioningRecommendations`
- dependencies:
  - `Create competitive strategy generator`  | סטטוס: 🔴 לא בוצע
  - `Product Positioning & Messaging`
- connects_to: `Project State`

---

### שלב 6 — safety
זה חייב להגיע לפני אוטונומיה אמיתית:

21. `Approval System`  | סטטוס: 🟡 חלקי
- לפני שינוי קוד
- לפני migrations
- לפני deploy
- לפני הוצאות כספיות
- מתי לחזור ל־100%: אחרי שנשלים rejection handling חכם, user alternatives, replanning ו־operator overrides, כדי שהמערכת לא רק תחסום execution אלא גם תדע לנתב מחדש ולהמשיך לדחוף לסיום הפרויקט.

משימות טכניות:

1. `Define approval request schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לבקשת אישור לפני פעולה רגישה
- input:
  - `actionType`
  - `projectId`
  - `actorType`
  - `actionPayload`
  - `riskContext`
- output:
  - `approvalRequest`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create approval trigger resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שקובע האם פעולה מסוימת דורשת approval
- input:
  - `actionType`
  - `actionPayload`
  - `policyContext`
- output:
  - `requiresApproval`
  - `approvalReason`
  - `approvalType`
- dependencies:
  - `Policy Layer`  | סטטוס: 🔴 לא בוצע
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Agent Runtime`
- הערת מצב: ה־resolver הקנוני מומש ומכריע מתי צריך approval לפי `Decision Intelligence` ו־action context, אבל הוא יקבל enforcement מלא יותר אחרי `Policy Layer`.

3. `Create approval rule registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry של כל סוגי האישורים לפי action class
- input:
  - `actionType`
- output:
  - `approvalRule`
- dependencies:
  - `Approval System`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`
- הערת מצב: ה־registry הקנוני מומש ומזין את `approvalTrigger`, אבל הוא עדיין יעמיק ויתרחב אחרי השלמת `Approval System` ו־`Policy Layer`.

4. `Create approval record store`  | סטטוס: 🟢 בוצע
- description: לבנות storage קנוני לאישורים, דחיות, expiration ו־audit trail
- input:
  - `approvalRequest`
  - `approvalDecision`
- output:
  - `approvalRecord`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־store הקנוני מומש ומחזיר `approvalRecord` עם החלטה, expiration ו־audit trail, והוא כבר מוזן ל־`Project State`; ה־workflow המלא של סטטוסים, gating ו־API ייסגר במשימות ההמשך.

5. `Create approval status resolver`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שקובע אם יש approval תקף, חסר, פג תוקף או נדחה
- input:
  - `approvalRequest`
  - `approvalRecords`
- output:
  - `approvalStatus`
- dependencies:
  - `Create approval record store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־resolver הקנוני מומש ומחזיר `approved / missing / expired / rejected` מתוך `approvalRecord` יחיד או רשימה, והוא כבר מוזן ל־`Project State`; ה־enforcement בפועל ייסגר ב־`Create approval gating module`.

6. `Create approval gating module`  | סטטוס: 🟢 בוצע
- description: לבנות gate שחוסם execution כשאין אישור תקף
- input:
  - `approvalRequest`
  - `approvalStatus`
- output:
  - `gatingDecision`
- dependencies:
  - `Create approval status resolver`  | סטטוס: 🟢 בוצע
  - `Agent Runtime`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`
- הערת מצב: ה־gate הקנוני מומש ומחזיר `allowed / blocked / requires-approval` מתוך `approvalStatus`, והוא כבר מוזן ל־`Project State`; ה־enforcement בזמן runtime ישתלב עוד יותר אחרי השלמת `Agent Runtime`.

7. `Create approval capture API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints/commands ל־approve, reject, revoke, list approvals
- input:
  - `userInput`
  - `approvalRequestId`
- output:
  - `approvalPayload`
- dependencies:
  - `Create approval record store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־API הקנוני מומש ב־service וב־server עבור `list / approve / reject / revoke`, והוא שומר `approvalRecords` מתמשכים בפרויקט; שכבת UI ייעודית תתווסף בהמשך אם נרצה surface מלא לאישורים.

8. `Create approval audit formatter`  | סטטוס: 🟢 בוצע
- description: לבנות formatter היסטוריה של אישורים לצרכי UI, logs ו־traceability
- input:
  - `approvalRecords`
- output:
  - `approvalAuditTrail`
- dependencies:
  - `Create approval record store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־formatter הקנוני מומש ומחזיר `approvalAuditTrail` שטוח וקריא לצרכי UI ו־traceability, והוא כבר מוזן ל־`Project State`; אם נרצה בהמשך UI עשיר יותר, נוכל רק להלביש אותו על אותו output קנוני.

9. `Define approval outcome schema`  | סטטוס: 🟡 חלקי
- description: לבנות schema אחיד לתוצאות approval כולל דחייה, דחייה עם חלופה, אישור מותנה ודחייה זמנית
- input:
  - `approvalRequest`
  - `approvalDecision`
- output:
  - `approvalOutcome`
- dependencies:
  - `Create approval record store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: יש כבר `approved / rejected / revoked` בתוך `approvalRecord`, אבל עדיין אין outcome schema מלא עבור `deferred`, `approved-with-conditions` ו־`user-alternative-selected`.

10. `Create user alternative action schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לקלט שבו המשתמש דוחה פעולה ומציע חלופה אחרת
- input:
  - `approvalRequest`
  - `userInput`
- output:
  - `alternativeAction`
- dependencies:
  - `Define approval outcome schema`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

11. `Create approval outcome resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע האם דחייה חוסמת, דוחה, דורשת clarification או מפעילה חלופה
- input:
  - `approvalOutcome`
  - `alternativeAction`
- output:
  - `approvalResolution`
- dependencies:
  - `Define approval outcome schema`  | סטטוס: 🟡 חלקי
  - `Create user alternative action schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

12. `Create user-directed replanning module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמעדכן state ו־graph לפי חלופה שהמשתמש בחר במקום ההמלצה של המערכת
- input:
  - `approvalResolution`
  - `projectState`
  - `executionGraph`
- output:
  - `updatedProjectState`
  - `updatedExecutionGraph`
  - `nextRecommendedTask`
- dependencies:
  - `Create approval outcome resolver`  | סטטוס: 🔴 לא בוצע
  - `Execution Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Graph`

13. `Create rejected-action follow-up generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator שמייצר משימות המשך אחרי rejection, כגון clarification, safer alternative או replanning task
- input:
  - `approvalResolution`
  - `approvalRequest`
- output:
  - `followUpTasks`
- dependencies:
  - `Create approval outcome resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Graph`

14. `Create human approval handoff state`  | סטטוס: 🔴 לא בוצע
- description: לבנות state מפורש שבו recommendation, approval request, user decision ו־follow-up action נקשרים לזרימה אנושית אחת וברורה
- input:
  - `approvalRequest`
  - `approvalStatus`
  - `schedulerDecision`
- output:
  - `humanApprovalHandoff`
- dependencies:
  - `Create approval gating module`  | סטטוס: 🟢 בוצע
  - `Create approval status resolver`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

14. `Create approval feedback memory`  | סטטוס: 🔴 לא בוצע
- description: לבנות זיכרון שמצטבר מהחלטות rejection/override של המשתמש כדי לשפר תיעדוף והצעות עתידיות
- input:
  - `approvalOutcome`
  - `approvalResolution`
- output:
  - `approvalFeedbackMemory`
- dependencies:
  - `Memory`  | סטטוס: 🟡 חלקי
  - `Create approval outcome resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

15. `Create operator override API`  | סטטוס: 🟡 חלקי
- description: לבנות endpoints/commands ל־reject-and-replan, approve-with-conditions ו־select-alternative
- input:
  - `approvalRequestId`
  - `userInput`
- output:
  - `overridePayload`
- dependencies:
  - `Create approval capture API`  | סטטוס: 🟢 בוצע
  - `Create user alternative action schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`
- הערת מצב: ה־API הנוכחי כבר תומך ב־`approve / reject / revoke`, אבל עדיין לא תומך ב־override חכם, חלופות משתמש ו־replan.

22. `Diff Preview`  | סטטוס: 🟢 בוצע
- מה ישתנה
- למה
- מה ההשפעה

משימות טכניות:

1. `Define diff preview schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לתצוגת diff לפני ביצוע
- input:
  - `executionPlan`
  - `changeSet`
- output:
  - `diffPreviewSchema`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create code diff collector`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שאוסף diff של קבצי קוד לפני apply
- input:
  - `plannedChanges`
- output:
  - `codeDiff`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`
- הערת מצב: ה־collector הקנוני מומש מעל `plannedChanges` ומחזיר `codeDiff` ל־preview לפני apply; כשה־Execution Surface Layer יהיה מלא, הוא יקבל planned changes עשירים ומדויקים יותר ממסלולי execution אמיתיים.

3. `Create migration diff collector`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמזהה schema changes, migrations ו־DB risks
- input:
  - `plannedChanges`
- output:
  - `migrationDiff`
- dependencies:
  - `Deep Code Scanner`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־collector הקנוני מומש מעל `plannedChanges` ומחזיר `migrationDiff` עם schema changes, migrations ו־DB risks; כשה־Execution Surface Layer יהיה מלא, הוא יקבל planned changes עשירים ומדויקים יותר ממסלולי execution אמיתיים.

4. `Create config and infra diff collector`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שאוסף שינויים ב־env, deploy, CI, hosting ו־routing
- input:
  - `plannedChanges`
- output:
  - `infraDiff`
- dependencies:
  - `Deployment & Hosting Orchestrator`
  - `Build & Release System`
- connects_to: `Execution Surface`
- הערת מצב: ה־collector הקנוני מומש מעל `plannedChanges` ומחזיר `infraDiff` עבור env, deploy, CI, hosting ו־routing; כשה־Execution Surface Layer יהיה מלא, הוא יקבל planned changes עשירים ומדויקים יותר ממסלולי execution אמיתיים.

5. `Create diff impact summarizer`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמסביר מה ההשפעה של ה־diff על המערכת
- input:
  - `codeDiff`
  - `migrationDiff`
  - `infraDiff`
- output:
  - `impactSummary`
  - `riskFlags`
- dependencies:
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־summarizer הקנוני מומש מעל `codeDiff`, `migrationDiff` ו־`infraDiff` ומחזיר `impactSummary` ו־`riskFlags`; כשה־Execution Surface Layer יהיה מלא, הוא יקבל diffs מדויקים ועשירים יותר ממסלולי execution אמיתיים.

6. `Create user-facing diff preview assembler`  | סטטוס: 🟢 בוצע
- description: לבנות assembler שמחזיר preview ברור למשתמש לפני אישור
- input:
  - `codeDiff`
  - `migrationDiff`
  - `infraDiff`
  - `impactSummary`
- output:
  - `diffPreview`
- dependencies:
  - `Create diff impact summarizer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־assembler הקנוני מומש ומחזיר `diffPreview` ברור עם sections, risk flags ו־approval guidance; כשה־Execution Surface Layer יהיה מלא, ה־preview יקבל diffs מדויקים ועשירים יותר ממסלולי execution אמיתיים.

7. `Create diff preview API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לקבלת diff preview לפני execution
- input:
  - `projectId`
  - `executionRequestId`
- output:
  - `diffPreviewPayload`
- dependencies:
  - `Create user-facing diff preview assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־API מומש דרך `ProjectService` ו־HTTP endpoint קנוני ומחזיר `diffPreviewPayload`; כשה־Execution Surface Layer יהיה מלא, הוא יגיש preview עשיר יותר שמבוסס על diffs אמיתיים ממסלולי execution.

23. `Policy Layer`  | סטטוס: 🟢 בוצע
- מה agent יכול
- מה agent לא יכול
- באילו תנאים

משימות טכניות:

1. `Define policy schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד למדיניות execution, approvals, credentials ו־deploy
- input:
  - `policyDefinitions`
- output:
  - `policySchema`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־schema הקנוני מומש ומחזיר `policySchema` עבור execution, approvals, credentials ו־deploy, והוא כבר מוזן ל־`Project State`; ה־registry וה־evaluator יבנו עליו בהמשך.

2. `Create action policy registry`  | סטטוס: 🟢 בוצע
- description: לבנות registry של policies לפי action types
- input:
  - `actionType`
- output:
  - `actionPolicy`
- dependencies:
  - `Define policy schema`  | סטטוס: 🟢 בוצע
- connects_to: `Agent Runtime`
- הערת מצב: ה־registry הקנוני מומש ומחזיר `actionPolicy` מתוך `policySchema`, והוא כבר מוזן ל־`Project State`; ה־evaluator וה־enforcement יבנו עליו בהמשך.

3. `Create execution policy evaluator`  | סטטוס: 🟢 בוצע
- description: לבנות evaluator שבודק אם פעולה מותרת, אסורה או דורשת approval
- input:
  - `actionType`
  - `actorType`
  - `actionPayload`
  - `projectState`
- output:
  - `policyDecision`
- dependencies:
  - `Create action policy registry`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: ה־evaluator הקנוני מומש ומחזיר `policyDecision` מתוך `actionPolicy`, `gatingDecision` ו־project state; שכבת credential policy ו־policy enforcement guard יבנו עליו בהמשך.

4. `Create credential usage policy`  | סטטוס: 🟢 בוצע
- description: לבנות policy לשימוש ב־credentials לפי actor ו־flow
- input:
  - `credentialReference`
  - `actorType`
  - `flowType`
- output:
  - `credentialPolicyDecision`
- dependencies:
  - `Credentials Management`
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Agent Runtime`
- הערת מצב: ה־policy הקנוני מומש ומחזיר `credentialPolicyDecision` לפי actor, flow ו־approval context, והוא כבר מוזן ל־`Project State`; כשה־Approval System יושלם, ההכרעה תהיה עשירה יותר גם עבור overrides וחלופות משתמש.

5. `Create code change policy checks`  | סטטוס: 🟢 בוצע
- description: לבנות checks לשינויים בקוד, קבצי config, migrations ו־tests
- input:
  - `changeSet`
- output:
  - `policyViolations`
- dependencies:
  - `Diff Preview`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־checks הקנוניים מומשו ומחזירים `policyViolations` עבור שינויי קוד, config, migrations ו־tests מתוך `changeSet`, והם כבר מוזנים ל־`Project State`; כשה־Execution Surface Layer יושלם, ה־checks יוכלו להישען גם על diffs חיים ולא רק על change set קנוני.

6. `Create deploy policy checks`  | סטטוס: 🟢 בוצע
- description: לבנות checks שמונעים deploy בלי תנאים נדרשים
- input:
  - `deploymentRequest`
  - `projectState`
- output:
  - `deployPolicyDecision`
- dependencies:
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Distribution Ownership Model`
- connects_to: `Execution Surface`
- הערת מצב: ה־checks הקנוניים מומשו ומחזירים `deployPolicyDecision` לפי approval, ownership, validation ו־credential policy, והם כבר מוזנים ל־`Project State`; כשה־Approval System וה־Execution Surface Layer יושלמו, ההכרעה תתבסס גם על deploy execution חי ולא רק על state קנוני.

7. `Create policy enforcement guard`  | סטטוס: 🟢 בוצע
- description: לבנות guard שמבצע enforcement לפני execution בפועל
- input:
  - `policyDecision`
  - `approvalStatus`
- output:
  - `enforcementResult`
- dependencies:
  - `Create execution policy evaluator`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`
- הערת מצב: ה־guard הקנוני מומש ומחזיר `enforcementResult` מתוך policy, approval, deploy ו־credential decisions, והוא כבר מוזן ל־`Project State`; כשה־Execution Surface Layer יושלם, אותו enforcement יישב גם ישירות לפני execution חי.

8. `Create policy trace builder`  | סטטוס: 🟢 בוצע
- description: לבנות trace שמסביר למה פעולה מותרת, חסומה או דורשת אישור
- input:
  - `policyDecision`
  - `enforcementResult`
- output:
  - `policyTrace`
- dependencies:
  - `Create policy enforcement guard`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־trace הקנוני מומש ומחזיר `policyTrace` עם הסבר של policy decision ושל enforcement result, והוא כבר מוזן ל־`Project State`; ה־Policy API ייחשף מעליו בשלב הבא.

9. `Create policy API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לקבלת policy decisions ו־policy traces
- input:
  - `projectId`
  - `actionType`
- output:
  - `policyPayload`
- dependencies:
  - `Create policy trace builder`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־API הקנוני מומש ומחזיר `policyPayload` עם `policyDecision`, `policyTrace`, `enforcementResult`, `actionPolicy` ו־`policySchema`; כשה־Execution Surface Layer יושלם, אותו payload יקבל גם קשר ישיר יותר ל־execution חי.

10. `Define autonomy control schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לרמות אוטונומיה כמו `safe`, `balanced`, `aggressive` כולל approval thresholds, blocked actions ו־auto-execution policy
- input:
  - `policySchema`
  - `workspaceSettings`
- output:
  - `autonomyControlSchema`
- dependencies:
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

11. `Create autonomy mode resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע באיזו רמת אוטונומיה הפרויקט או ה־workspace פועל כרגע
- input:
  - `autonomyControlSchema`
  - `projectState`
  - `userPreferenceProfile`
- output:
  - `autonomyModeDecision`
- dependencies:
  - `Define autonomy control schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

12. `Create autonomy execution guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמונע מהמערכת לבצע פעולה אוטומטית אם היא חורגת מרמת האוטונומיה שנבחרה
- input:
  - `autonomyModeDecision`
  - `policyDecision`
  - `approvalStatus`
- output:
  - `autonomyGuardDecision`
- dependencies:
  - `Create autonomy mode resolver`  | סטטוס: 🔴 לא בוצע
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

13. `Create autonomy mode user controls`  | סטטוס: 🔴 לא בוצע
- description: לבנות controls שמאפשרים למשתמש או ל־workspace owner לבחור autonomy mode ולראות את ההשלכות שלו
- input:
  - `autonomyControlSchema`
  - `autonomyModeDecision`
- output:
  - `autonomyControls`
- dependencies:
  - `Create autonomy mode resolver`  | סטטוס: 🔴 לא בוצע
  - `UI / UX Foundation`
- connects_to: `Project State`

---

### שלב 6.5 — UI / UX Foundation
המטרה: לסיים את המוצר בלי מעצב חיצוני דרך מערכת UI/UX סיסטמתית, עקבית וברת־תחזוקה.

#### `User Flow System`

משימות טכניות:

1. `Define primary user journeys`  | סטטוס: 🟢 בוצע
- description: להגדיר את כל מסלולי המשתמש הראשיים במערכת
- input:
  - `product goals`
  - `core capabilities`
- output:
  - `userJourneys`
  - `journeySteps`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־journeys הקנוניים מומשו ומחזירים `userJourneys` ו־`journeySteps` מתוך goals, capabilities ו־business context, והם כבר מוזנים ל־`Project State`; ה־journey map והמסכים ייבנו מעליהם בשלב הבא.

2. `Create journey map for core flows`  | סטטוס: 🟢 בוצע
- description: למפות end-to-end flows עבור onboarding, project creation, execution, approvals ו־tracking
- input:
  - `userJourneys`
- output:
  - `journeyMap`
- dependencies:
  - `Define primary user journeys`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־journey map הקנוני מומש ומחזיר flows, entry steps ו־transitions עבור onboarding, execution, release ו־growth, והוא כבר מוזן ל־`Project State`; screen inventory ו־screen mapping ייבנו מעליו בשלב הבא.

3. `Define screen inventory`  | סטטוס: 🟢 בוצע
- description: לגזור מתוך ה־journeys את כל המסכים הנדרשים
- input:
  - `journeyMap`
- output:
  - `screenInventory`
- dependencies:
  - `Create journey map for core flows`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־screen inventory הקנוני מומש ומחזיר `screenInventory` עם screens, screen types ו־flow coverage מתוך `journeyMap`, והוא כבר מוזן ל־`Project State`; ה־screen-to-flow mapping ייבנה מעליו בשלב הבא.

4. `Create screen-to-flow mapping`  | סטטוס: 🟢 בוצע
- description: למפות כל מסך למסלול, שלב, trigger ו־next action
- input:
  - `screenInventory`
  - `journeyMap`
- output:
  - `screenFlowMap`
- dependencies:
  - `Define screen inventory`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־mapping הקנוני מומש ומחזיר `screenFlowMap` עם journey, step, trigger ו־next action לכל מסך, והוא כבר מוזן ל־`Project State`; שכבת `Screen UX Contracts` תיבנה מעליו בהמשך.

#### `Screen UX Contracts`

משימות טכניות:

1. `Define screen contract schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לכל מסך במערכת
- input:
  - `screenType`
- output:
  - `screenContract`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: ה־schema הקנוני מומש ומחזיר `screenContract` לפי `screenType`, והוא כבר מוזן ל־`Project State` כ־`screenContracts`; שכבות CTA, mobile ו־states יבנו עליו בהמשך.

2. `Create goal and CTA definition module`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך מה המטרה שלו ומה הכפתור הראשי
- input:
  - `screenContract`
- output:
  - `screenGoal`
  - `primaryAction`
  - `secondaryActions`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המודול הקנוני מומש ומחזיר `screenGoal`, `primaryAction` ו־`secondaryActions` לפי `screenContract`, והוא כבר מוזן ל־`Project State` דרך `screenContracts`; שכבות mobile, states וה־review יעמיקו את החוזה בהמשך.

3. `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך כללי שימושיות במובייל
- input:
  - `screenContract`
- output:
  - `mobileChecklist`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך מצבי `loading`, `empty`, `error`, `success`
- input:
  - `screenContract`
- output:
  - `screenStates`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create screen validation checklist`  | סטטוס: 🟢 בוצע
- description: לבנות checklist קבוע לכל מסך לפני implementation
- input:
  - `screenContract`
  - `screenStates`
  - `mobileChecklist`
- output:
  - `screenValidationChecklist`
- dependencies:
  - `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Design System`

משימות טכניות:

1. `Define design token schema`  | סטטוס: 🟢 בוצע
- description: להגדיר tokens לצבעים, spacing, typography, radius, borders, shadows
- input:
  - `brandDirection`
- output:
  - `designTokens`
- dependencies:
  - `UI / UX Foundation`
- connects_to: `Project State`

2. `Create typography system`  | סטטוס: 🟢 בוצע
- description: להגדיר scale קבוע לכותרות, טקסט גוף, labels ו־meta text
- input:
  - `designTokens`
- output:
  - `typographySystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- description: להגדיר grid, spacing scale, container widths ו־section rhythm
- input:
  - `designTokens`
- output:
  - `layoutSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create color usage rules`  | סטטוס: 🟢 בוצע
- description: להגדיר מתי משתמשים בכל צבע, כולל states
- input:
  - `designTokens`
- output:
  - `colorRules`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create interaction states system`  | סטטוס: 🟢 בוצע
- description: להגדיר hover, active, focus, disabled, destructive, success, warning
- input:
  - `designTokens`
- output:
  - `interactionStateSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `Component Library`

משימות טכניות:

1. `Define component contract schema`  | סטטוס: 🟢 בוצע
- description: להגדיר חוזה אחיד לכל רכיב
- input:
  - `componentType`
- output:
  - `componentContract`
- dependencies:
  - `Design System`
- connects_to: `Project State`

2. `Create primitive components`  | סטטוס: 🔴 לא בוצע
- description: לבנות רכיבי בסיס כמו button, input, textarea, select, badge, icon button
- input:
  - `componentContract`
  - `designTokens`
- output:
  - `primitiveComponents`
- dependencies:
  - `Define component contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create layout components`  | סטטוס: 🔴 לא בוצע
- description: לבנות container, section, stack, grid, panel, divider
- input:
  - `layoutSystem`
- output:
  - `layoutComponents`
- dependencies:
  - `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create feedback components`  | סטטוס: 🔴 לא בוצע
- description: לבנות loading, empty state, error state, toast, banner, progress, skeleton
- input:
  - `interactionStateSystem`
- output:
  - `feedbackComponents`
- dependencies:
  - `Create interaction states system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create navigation components`  | סטטוס: 🔴 לא בוצע
- description: לבנות sidebar, tabs, breadcrumb, topbar, stepper
- input:
  - `screenFlowMap`
- output:
  - `navigationComponents`
- dependencies:
  - `Create screen-to-flow mapping`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create data display components`  | סטטוס: 🔴 לא בוצע
- description: לבנות table, stat card, activity log, timeline, key-value panel, status chip
- input:
  - `screenInventory`
- output:
  - `dataDisplayComponents`
- dependencies:
  - `Define screen inventory`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Screen Template System`

משימות טכניות:

1. `Define screen template schema`  | סטטוס: 🟢 בוצע
- description: להגדיר תבנית אחידה למסכים
- input:
  - `screenType`
- output:
  - `screenTemplateSchema`
- dependencies:
  - `Screen UX Contracts`
  - `Component Library`
- connects_to: `Project State`

2. `Create dashboard template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי overview ודשבורדים
- input:
  - `screenTemplateSchema`
- output:
  - `dashboardTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create detail page template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי פרטים
- input:
  - `screenTemplateSchema`
- output:
  - `detailPageTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create workflow template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי flow ו־wizard
- input:
  - `screenTemplateSchema`
- output:
  - `workflowTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create list and management template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי רשימות, טבלאות וניהול
- input:
  - `screenTemplateSchema`
- output:
  - `managementTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create state-driven template variants`  | סטטוס: 🟢 בוצע
- description: לבנות וריאציות `loading / empty / error / success` לכל template
- input:
  - `screenStates`
  - `screenTemplates`
- output:
  - `templateVariants`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `UI Review Layer`

משימות טכניות:

1. `Create primary action validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שלכל מסך יש פעולה ראשית ברורה
- input:
  - `screenContract`
  - `screenTemplate`
- output:
  - `primaryActionValidation`
- dependencies:
  - `Create goal and CTA definition module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create mobile usability validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שהמסך usable במובייל
- input:
  - `screenTemplate`
  - `mobileChecklist`
- output:
  - `mobileValidation`
- dependencies:
  - `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create state coverage validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שיש `loading / empty / error / success`
- input:
  - `screenTemplate`
  - `screenStates`
- output:
  - `stateCoverageValidation`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create consistency validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שימוש עקבי ב־tokens, components ו־templates
- input:
  - `screenTemplate`
  - `designTokens`
  - `componentLibrary`
- output:
  - `consistencyValidation`
- dependencies:
  - `Design System`
  - `Component Library`
- connects_to: `Project State`

5. `Create screen review assembler`  | סטטוס: 🟢 בוצע
- description: להרכיב report אחיד של איכות המסך
- input:
  - `primaryActionValidation`
  - `mobileValidation`
  - `stateCoverageValidation`
  - `consistencyValidation`
- output:
  - `screenReviewReport`
- dependencies:
  - `Create consistency validator`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

#### `AI Learning UX`

משימות טכניות:

1. `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד להצגת תובנות למידה, patterns, confidence ו־recommendation reasoning ב־UI
- input:
  - `learningInsights`
  - `learningTrace`
- output:
  - `learningInsightViewModel`
- dependencies:
  - `Learning Layer`
- connects_to: `Project State`

2. `Create recommendation reasoning panel contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה UI לפאנל שמסביר למה הומלצה משימה או פעולה מסוימת
- input:
  - `impactSummary`
  - `learningTrace`
  - `policyTrace`
- output:
  - `reasoningPanel`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
  - `Policy Layer`
- connects_to: `Project State`

3. `Create pattern confidence indicator`  | סטטוס: 🟢 בוצע
- description: לבנות רכיב שמציג למשתמש אם pattern מסוים מבוסס היטב, חלש או רק השערה
- input:
  - `learningInsightViewModel`
- output:
  - `confidenceIndicator`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create user preference signal view`  | סטטוס: 🟢 בוצע
- description: לבנות תצוגה שמסבירה אילו החלטות עבר של המשתמש משפיעות על ההמלצות הנוכחיות
- input:
  - `userPreferenceProfile`
  - `approvalFeedbackMemory`
- output:
  - `userPreferenceSignals`
- dependencies:
  - `Learning Layer`
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

5. `Create cross-project pattern disclosure panel`  | סטטוס: 🟢 בוצע
- description: לבנות פאנל שמציג patterns חוצי־פרויקטים בצורה אנונימית וללא דליפת מידע משתמשים
- input:
  - `crossProjectMemory`
  - `recommendationHints`
- output:
  - `crossProjectPatternPanel`
- dependencies:
  - `Cross-Project Memory`  | סטטוס: 🟡 חלקי
  - `Learning Layer`
- connects_to: `Project State`

6. `Create passive learning disclosure banner`  | סטטוס: 🟢 בוצע
- description: לבנות banner שמבהיר שה־AI הלומדת רק מסיקה וממליצה, ולא מבצעת פעולות בפועל
- input:
  - `learningInsights`
- output:
  - `learningDisclosure`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

7. `Create AI learning workspace template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסך ייעודי של תובנות למידה, patterns והמלצות משופרות
- input:
  - `screenTemplateSchema`
  - `learningInsightViewModel`
- output:
  - `aiLearningWorkspaceTemplate`
- dependencies:
  - `Screen Template System`
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Context Relevance & Reduction`

משימות טכניות:

1. `Define context relevance schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד שמגדיר איך מודדים relevance, priority, freshness ו־token weight עבור context שנשלח ל־AI, ל־review ול־execution
- input:
  - `projectState`
  - `interactionContext`
- output:
  - `contextRelevanceSchema`
- dependencies:
  - `Context Builder`  | סטטוס: 🟢 בוצע
  - `AI Learning UX`
- connects_to: `Project State`

2. `Create context relevance filter`  | סטטוס: 🔴 לא בוצע
- description: לבנות filter שמכריע אילו חלקי context נשארים בבקשה, אילו יורדים ואילו רק מסוכמים
- input:
  - `contextRelevanceSchema`
  - `projectState`
  - `screenContext`
- output:
  - `relevanceFilteredContext`
- dependencies:
  - `Define context relevance schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create context slimming pipeline`  | סטטוס: 🔴 לא בוצע
- description: לבנות pipeline שממיר context גדול ל־minimal execution context עם summaries, drops ו־priority ordering לפני שליחה ל־AI או ל־provider
- input:
  - `relevanceFilteredContext`
  - `tokenBudget`
- output:
  - `slimmedContextPayload`
  - `droppedContextSummary`
- dependencies:
  - `Create context relevance filter`  | סטטוס: 🔴 לא בוצע
  - `AI Learning UX`
- connects_to: `Execution Surface`

#### `Human Editing & Partial Acceptance`

משימות טכניות:

1. `Define editable proposal schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להצעות שניתן לערוך, לתקן, לאשר חלקית או לדחות ברמת section, component, copy ו־next action
- input:
  - `proposalType`
  - `proposalPayload`
- output:
  - `editableProposal`
- dependencies:
  - `AI Learning UX`
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create proposal editing system`  | סטטוס: 🔴 לא בוצע
- description: לבנות מערכת עריכה שמאפשרת למשתמש לשנות proposal קיים, להשאיר annotations וליצור revised proposal בלי לשבור את ה־history
- input:
  - `editableProposal`
  - `userEditInput`
- output:
  - `editedProposal`
  - `proposalEditHistory`
- dependencies:
  - `Define editable proposal schema`  | סטטוס: 🔴 לא בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create partial acceptance flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow שמאפשר לאשר חלק מהצעה, לדחות חלק אחר, ולהחזיר רק את החלקים הבעייתיים ל־regeneration או review נוסף
- input:
  - `editedProposal`
  - `approvalOutcome`
- output:
  - `partialAcceptanceDecision`
  - `remainingProposalScope`
- dependencies:
  - `Create proposal editing system`  | סטטוס: 🔴 לא בוצע
  - `Define approval outcome schema`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

#### `AI Companion Experience`

משימות טכניות:

1. `Define AI companion presence schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לנוכחות הוויזואלית של ה־AI כולל states, tone, urgency ו־visibility rules
- input:
  - `assistantState`
  - `interactionContext`
- output:
  - `companionPresence`
- dependencies:
  - `Screen UX Contracts`
- connects_to: `Project State`

2. `Create companion state model`  | סטטוס: 🟢 בוצע
- description: לבנות state model לדמות ה־AI עם מצבים כמו observing, analyzing, recommending, warning ו־waiting
- input:
  - `learningInsights`
  - `decisionIntelligence`
  - `notificationPayload`
- output:
  - `companionState`
- dependencies:
  - `Define AI companion presence schema`  | סטטוס: 🟢 בוצע
  - `AI Learning UX`
- connects_to: `Project State`

3. `Create companion trigger policy`  | סטטוס: 🟢 בוצע
- description: לבנות מדיניות שמכריעה מתי ה־AI companion מופיע, מתי נשאר שקט ומתי מותר לו להפריע
- input:
  - `companionState`
  - `policyTrace`
  - `executionStatus`
- output:
  - `companionTriggerDecision`
- dependencies:
  - `Create companion state model`  | סטטוס: 🟢 בוצע
  - `Policy Layer`
- connects_to: `Project State`

4. `Create companion message priority resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמסווג הודעות companion לפי advisory, recommendation, warning ו־critical
- input:
  - `learningInsights`
  - `gatingDecision`
  - `notificationPayload`
- output:
  - `companionMessagePriority`
- dependencies:
  - `Create companion state model`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create companion dock and panel contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה UI ל־dock/panel קבוע של ה־AI companion עם summary, suggestions ו־next actions
- input:
  - `companionPresence`
  - `companionMessagePriority`
- output:
  - `companionDock`
  - `companionPanel`
- dependencies:
  - `Define AI companion presence schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create companion animation state rules`  | סטטוס: 🟢 בוצע
- description: להגדיר שפת אנימציה מתונה לדמות ה־AI לפי state, urgency ו־non-blocking rules
- input:
  - `companionState`
  - `companionTriggerDecision`
- output:
  - `animationStateRules`
- dependencies:
  - `Create companion state model`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

7. `Create companion mode controls`  | סטטוס: 🟢 בוצע
- description: לבנות שליטה של המשתמש בין מצבי quiet, assistive ו־active עבור ה־AI companion
- input:
  - `userPreferenceProfile`
  - `companionPresence`
- output:
  - `companionModeSettings`
- dependencies:
  - `Create companion dock and panel contract`  | סטטוס: 🟢 בוצע
  - `AI Learning UX`
- connects_to: `Project State`

8. `Create companion interruption guard`  | סטטוס: 🟢 בוצע
- description: לבנות guard שמונע מה־AI companion להפריע בזמן execution קריטי או approval flow רגיש
- input:
  - `companionTriggerDecision`
  - `gatingDecision`
  - `progressState`
- output:
  - `interruptionDecision`
- dependencies:
  - `Create companion trigger policy`  | סטטוס: 🟢 בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

9. `Create AI companion workspace template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי Nexus שבהם ה־AI companion חי כשותף דיגיטלי ולא רק כפאנל טכני
- input:
  - `screenTemplateSchema`
  - `companionDock`
  - `companionPanel`
- output:
  - `aiCompanionTemplate`
- dependencies:
  - `Screen Template System`
  - `Create companion dock and panel contract`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Priority Order`

1. `Define primary user journeys`
2. `Create journey map for core flows`
3. `Define screen inventory`
4. `Define screen contract schema`
5. `Create goal and CTA definition module`
6. `Create loading empty error states definition`
7. `Create mobile readiness checklist`
8. `Define design token schema`
9. `Create primitive components`
10. `Create layout components`
11. `Create feedback components`
12. `Define screen template schema`
13. `Create dashboard template`
14. `Create workflow template`
15. `Create list and management template`
16. `Create primary action validator`
17. `Create mobile usability validator`
18. `Create state coverage validator`
19. `Define learning insight UI schema`
20. `Create recommendation reasoning panel contract`
21. `Create pattern confidence indicator`
22. `Create passive learning disclosure banner`
23. `Define AI companion presence schema`
24. `Create companion state model`
25. `Create companion trigger policy`
26. `Create companion dock and panel contract`
27. `Create companion mode controls`
28. `Define developer workspace schema`
29. `Create project workbench layout`
30. `Create development workspace`
31. `Create release workspace`
32. `Create cross-workspace navigation model`

#### `Initial Nexus Screens`

1. `Project Dashboard`
2. `Onboarding Flow`
3. `Project Detail`
4. `Execution View`
5. `Approval Center`
6. `Release Tracking`
7. `Settings / Integrations`
8. `Growth Dashboard`
9. `Campaign Planner`
10. `Content Strategy Workspace`
11. `Asset Review / Copy Review`
12. `Distribution & Channel Status`
13. `Learning Insights`
14. `Recommendation Reasoning`
15. `User Preference Signals`
16. `Cross-Project Patterns`
17. `AI Companion Dock`
18. `AI Companion Panel`
19. `AI Companion Preferences`
20. `Project Brain`
21. `Developer Workspace`
22. `Terminal Console`
23. `Branch & Diff Activity`
24. `Artifact & Build Logs`
25. `Release Workspace`
26. `Growth Workspace`

---

### שלב 6.55 — Developer Workbench & Execution Topology
המטרה: להגדיר איפה המשתמש עובד בפועל על הקוד, איך הוא רואה execution בזמן אמת, ואיך Nexus בוחר בין cloud, local ו־remote execution modes.

#### `Developer Workspace Experience`

משימות טכניות:

1. `Define developer workspace schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד למסך העבודה הראשי של המפתח כולל קבצים, editor, terminal, diffs, logs ו־agent activity
- input:
  - `projectState`
  - `executionState`
- output:
  - `developerWorkspace`
- dependencies:
  - `UI / UX Foundation`
  - `Execution Surface Layer`
- connects_to: `Project State`

2. `Create project workbench layout`  | סטטוס: 🟢 בוצע
- description: לבנות layout קבוע ל־workbench של Nexus עם אזורי קוד, activity, output ו־contextual assistant
- input:
  - `developerWorkspace`
  - `screenTemplateSchema`
- output:
  - `projectWorkbenchLayout`
- dependencies:
  - `Define developer workspace schema`  | סטטוס: 🟢 בוצע
  - `Screen Template System`
- connects_to: `Execution Surface`

3. `Create file tree and editor contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה UI ל־file tree, open files, editor tabs ו־inline diff awareness בתוך Nexus
- input:
  - `developerWorkspace`
  - `storageRecord`
- output:
  - `fileEditorContract`
- dependencies:
  - `Define developer workspace schema`  | סטטוס: 🟢 בוצע
  - `Nexus Persistence Layer`
- connects_to: `Execution Surface`

4. `Create terminal and command console view`  | סטטוס: 🟢 בוצע
- description: לבנות תצוגת terminal/console אחידה להרצת פקודות, צפייה ב־stdout/stderr ו־agent command activity
- input:
  - `executionStatusPayload`
  - `formattedLogs`
- output:
  - `commandConsoleView`
- dependencies:
  - `Execution Surface Layer`
  - `Create execution log formatter`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create branch and diff activity panel`  | סטטוס: 🟢 בוצע
- description: לבנות פאנל שמציג branch state, diffs, commits, pending approvals ו־change history
- input:
  - `diffPreviewPayload`
  - `projectState`
- output:
  - `branchDiffActivityPanel`
- dependencies:
  - `Diff Preview`  | סטטוס: 🟢 בוצע
  - `Developer Workspace Experience`
- connects_to: `Project State`

6. `Create artifact and build log panel`  | סטטוס: 🟢 בוצע
- description: לבנות פאנל שמרכז artifacts, build outputs, release packages ו־verification status בתוך workbench אחד
- input:
  - `artifactRecord`
  - `packagedArtifact`
  - `packageVerification`
- output:
  - `artifactBuildPanel`
- dependencies:
  - `Build & Release System`
  - `Developer Workspace Experience`
- connects_to: `Project State`

#### `Real-Time Experience Layer`

משימות טכניות:

1. `Define real-time event stream schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לזרמי עדכון חיים כמו progress, logs, file changes, approvals ו־notifications
- input:
  - `runtimeEvents`
  - `workspaceEvents`
- output:
  - `realtimeEventStream`
- dependencies:
  - `Execution Feedback Layer`
  - `Developer Workspace Experience`
- connects_to: `Project State`

2. `Create live update transport layer`  | סטטוס: 🟡 חלקי
- description: לבנות transport לשידור updates חיים ל־UI בלי רענון ידני
- input:
  - `realtimeEventStream`
- output:
  - `liveUpdateChannel`
- dependencies:
  - `Define real-time event stream schema`  | סטטוס: 🟢 בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create live log streaming module`  | סטטוס: 🟡 חלקי
- description: לבנות מודול שמזריק command outputs ולוגים ל־terminal view בזמן אמת
- input:
  - `liveUpdateChannel`
  - `formattedLogs`
- output:
  - `liveLogStream`
- dependencies:
  - `Create live update transport layer`  | סטטוס: 🟡 חלקי
  - `Create terminal and command console view`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create reactive workspace refresh model`  | סטטוס: 🟢 בוצע
- description: לבנות model שמעדכן panels, progress bars, diff states ו־artifact views בזמן אמת
- input:
  - `liveUpdateChannel`
  - `developerWorkspace`
- output:
  - `reactiveWorkspaceState`
- dependencies:
  - `Create live update transport layer`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

#### `Unified Project Workbench`

משימות טכניות:

1. `Create project brain workspace`  | סטטוס: 🟢 בוצע
- description: לבנות workspace שבו המשתמש רואה project state, next action, blockers, reasoning ו־system understanding
- input:
  - `projectState`
  - `policyTrace`
  - `learningInsights`
- output:
  - `projectBrainWorkspace`
- dependencies:
  - `Developer Workspace Experience`
  - `AI Learning UX`
- connects_to: `Project State`

2. `Create development workspace`  | סטטוס: 🟢 בוצע
- description: לבנות workspace ייעודי לפיתוח שבו המשתמש רואה code, diffs, terminal, branches ו־execution activity
- input:
  - `projectWorkbenchLayout`
  - `fileEditorContract`
  - `commandConsoleView`
- output:
  - `developmentWorkspace`
- dependencies:
  - `Create project workbench layout`  | סטטוס: 🟢 בוצע
  - `Create file tree and editor contract`  | סטטוס: 🟢 בוצע
  - `Create terminal and command console view`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create release workspace`  | סטטוס: 🟢 בוצע
- description: לבנות workspace ייעודי ל־build, deploy, validation, environments ו־release tracking
- input:
  - `releasePlan`
  - `validationReport`
  - `releaseTimeline`
- output:
  - `releaseWorkspace`
- dependencies:
  - `Delivery / Release Flow`
  - `Release Status Tracking`
- connects_to: `Project State`

4. `Create growth workspace`  | סטטוס: 🟢 בוצע
- description: לבנות workspace ייעודי ל־content strategy, campaign planning, distribution ו־growth analytics
- input:
  - `contentStrategy`
  - `campaignPlan`
  - `growthAnalytics`
- output:
  - `growthWorkspace`
- dependencies:
  - `Growth Execution & Marketing Distribution`
  - `Nexus Product Analytics`
- connects_to: `Project State`

5. `Create cross-workspace navigation model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל ניווט אחיד בין Project Brain, Development, Release ו־Growth בלי לאבד context של אותו פרויקט
- input:
  - `projectBrainWorkspace`
  - `developmentWorkspace`
  - `releaseWorkspace`
  - `growthWorkspace`
- output:
  - `workspaceNavigationModel`
- dependencies:
  - `Create project brain workspace`  | סטטוס: 🟢 בוצע
  - `Create development workspace`  | סטטוס: 🟢 בוצע
  - `Create release workspace`  | סטטוס: 🟢 בוצע
  - `Create growth workspace`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create next task presentation model`  | סטטוס: 🔴 לא בוצע
- description: לבנות view model אחיד להצגת המשימה הבאה למשתמש כולל selected task, reason, alternatives, approval state ו־expected outcome
- input:
  - `schedulerDecision`
  - `nextActionExplanation`
  - `approvalStatus`
- output:
  - `nextTaskPresentation`
- dependencies:
  - `Scheduler`  | סטטוס: 🟡 חלקי
  - `Explanation Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

7. `Create next task approval handoff panel`  | סטטוס: 🔴 לא בוצע
- description: לבנות פאנל workbench שבו המשתמש רואה אם הצעד הבא דורש approval, מה יקרה אחרי אישור, ומהן החלופות הבטוחות
- input:
  - `nextTaskPresentation`
  - `approvalExplanation`
- output:
  - `nextTaskApprovalPanel`
- dependencies:
  - `Create next task presentation model`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

8. `Bind scheduler decision to project brain workspace`  | סטטוס: 🔴 לא בוצע
- description: לחבר את `schedulerDecision` ו־`nextTaskPresentation` ל־Project Brain ול־Developer Workspace כך ששניהם נשענים על אותו source of truth
- input:
  - `projectBrainWorkspace`
  - `developmentWorkspace`
  - `schedulerDecisionRecord`
- output:
  - `workspaceNextTaskState`
- dependencies:
  - `Create scheduler decision persistence record`  | סטטוס: 🔴 לא בוצע
  - `Create next task presentation model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create next task user acceptance test`  | סטטוס: 🔴 לא בוצע
- description: לבנות test flow שמוכיח שהמשימה הבאה שנבחרת ב־scheduler היא גם מה שהמשתמש רואה ב־workbench, עם reasoning ו־approval handoff עקביים
- input:
  - `schedulerDecision`
  - `nextTaskPresentation`
  - `projectBrainWorkspace`
- output:
  - `acceptanceResult`
- dependencies:
  - `Bind scheduler decision to project brain workspace`  | סטטוס: 🔴 לא בוצע
  - `V1 Acceptance & Reality Test Harness`
- connects_to: `Execution Surface`

10. `Create recommendation display contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד להצגת recommendation למשתמש כולל headline, why now, expected impact, blockers, alternatives ו־primary CTA
- input:
  - `projectExplanation`
  - `reasoningPanel`
  - `nextTaskPresentation`
- output:
  - `recommendationDisplay`
- dependencies:
  - `Create next task presentation model`  | סטטוס: 🔴 לא בוצע
  - `Create recommendation reasoning panel contract`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

11. `Create recommendation summary panel`  | סטטוס: 🔴 לא בוצע
- description: לבנות פאנל UI מרכזי שמציג למשתמש את ההמלצה הפעילה, את הסיבה, את רמת הדחיפות ואת תוצאת ההמשך הצפויה
- input:
  - `recommendationDisplay`
  - `projectBrainWorkspace`
- output:
  - `recommendationSummaryPanel`
- dependencies:
  - `Create recommendation display contract`  | סטטוס: 🔴 לא בוצע
  - `Initial Nexus Screens`
- connects_to: `Execution Surface`

12. `Bind project explanation to cockpit recommendation surface`  | סטטוס: 🔴 לא בוצע
- description: לחבר את `projectExplanation`, `approvalExplanation`, `reasoningPanel` ו־`recommendationSummaryPanel` ל־cockpit כך שההמלצה למשתמש לא תופיע רק כ־metric או רשימת טקסטים חלקית
- input:
  - `projectExplanation`
  - `approvalExplanation`
  - `recommendationSummaryPanel`
- output:
  - `cockpitRecommendationSurface`
- dependencies:
  - `Create recommendation summary panel`  | סטטוס: 🔴 לא בוצע
  - `Build authentication screen states`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

13. `Create recommendation clarity validation suite`  | סטטוס: 🔴 לא בוצע
- description: לבנות בדיקות שמוודאות שהמלצה שמוצגת למשתמש כוללת selected action, reason, approval state, alternatives ו־CTA ברור ללא סתירה בין surfaces שונים
- input:
  - `recommendationDisplay`
  - `cockpitRecommendationSurface`
- output:
  - `recommendationClarityValidation`
- dependencies:
  - `Bind project explanation to cockpit recommendation surface`  | סטטוס: 🔴 לא בוצע
  - `Create next task user acceptance test`  | סטטוס: 🔴 לא בוצע
- connects_to: `Validation Layer`

14. `Create recommendation presentation state`  | סטטוס: 🔴 לא בוצע
- description: לבנות state מפורש להצגת recommendation למשתמש כולל headline, reason, impact, CTA, alternatives ו־approval handoff במסך אחד
- input:
  - `recommendationDisplay`
  - `humanApprovalHandoff`
- output:
  - `recommendationPresentation`
- dependencies:
  - `Create recommendation display contract`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

15. `Create workbench access entry resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע לאיזה workspace המשתמש נכנס עכשיו לפי project state, role, blocked flows ו־current lifecycle phase
- input:
  - `workspaceNavigationModel`
  - `projectState`
  - `postAuthRedirect`
- output:
  - `workbenchEntryDecision`
- dependencies:
  - `Create cross-workspace navigation model`  | סטטוס: 🟢 בוצע
  - `Identity & Auth`
- connects_to: `Project State`

16. `Create context visibility model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model שמציג איזה context פעיל למשתמש עכשיו, מאיפה הוא הגיע ומה רלוונטי ל־next step
- input:
  - `projectBrainWorkspace`
  - `workspaceNextTaskState`
- output:
  - `contextVisibilityState`
- dependencies:
  - `Create project brain workspace`  | סטטוס: 🟢 בוצע
  - `Bind scheduler decision to project brain workspace`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

17. `Create logs visibility model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model מפורש להצגת logs, run phases ו־user-facing messages בתוך workbench אחד
- input:
  - `formattedLogs`
  - `executionStatusPayload`
- output:
  - `logsVisibilityState`
- dependencies:
  - `Create terminal and command console view`  | סטטוס: 🟢 בוצע
  - `Execution Feedback Layer`
- connects_to: `Execution Surface`

18. `Create diff visibility model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model מפורש להצגת diffs, changed files ו־impact summaries כחלק מה־workbench השוטף
- input:
  - `branchDiffActivityPanel`
  - `diffChangeExplanation`
- output:
  - `diffVisibilityState`
- dependencies:
  - `Create branch and diff activity panel`  | סטטוס: 🟢 בוצע
  - `Create diff and change explanation model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

19. `Create approvals workspace model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model ייעודי ל־approval inbox, request details, decision history ו־safe alternatives כחלק מה־workbench
- input:
  - `approvalRequest`
  - `approvalAuditTrail`
  - `humanApprovalHandoff`
- output:
  - `approvalsWorkspace`
- dependencies:
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Create human approval handoff state`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

20. `Create next-step visibility model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model שמראה למשתמש מה הצעד הבא, מה יקרה אחריו, ומה ייחשב completion של השלב הנוכחי
- input:
  - `workspaceNextTaskState`
  - `progressTrackingState`
  - `milestoneTracking`
- output:
  - `nextStepVisibilityState`
- dependencies:
  - `Bind scheduler decision to project brain workspace`  | סטטוס: 🔴 לא בוצע
  - `Create progress tracking state model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Collaboration Layer`

משימות טכניות:

1. `Define collaboration event schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לשיתופי פעולה כמו comments, mentions, shared reviews, shared approvals ו־presence signals
- input:
  - `workspaceAction`
  - `actorContext`
- output:
  - `collaborationEvent`
- dependencies:
  - `Workspace & Access Control`
  - `Developer Workspace Experience`
- connects_to: `Project State`

2. `Create project presence model`  | סטטוס: 🟡 חלקי
- description: לבנות model שמציג מי נמצא כרגע בפרויקט, באיזה workspace ובאיזה context הוא עובד
- input:
  - `collaborationEvent`
  - `userSessionMetric`
- output:
  - `projectPresenceState`
- dependencies:
  - `Define collaboration event schema`  | סטטוס: 🟢 בוצע
  - `User Activity & Retention`
- connects_to: `Project State`

3. `Create project comments and review threads module`  | סטטוס: 🟡 חלקי
- description: לבנות מודול ל־comments, review threads ו־contextual discussion על files, diffs, approvals ו־release steps
- input:
  - `collaborationEvent`
  - `branchDiffActivityPanel`
- output:
  - `reviewThreadState`
- dependencies:
  - `Define collaboration event schema`  | סטטוס: 🟢 בוצע
  - `Create branch and diff activity panel`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create shared approval flow model`  | סטטוס: 🟡 חלקי
- description: לבנות model לשיתוף approval requests בין reviewers, owners ו־operators עם visibility ותיאום החלטות
- input:
  - `approvalRequest`
  - `workspaceModel`
- output:
  - `sharedApprovalState`
- dependencies:
  - `Approval System`  | סטטוס: 🟡 חלקי
  - `Collaboration Layer`
- connects_to: `Project State`

5. `Create collaboration activity feed`  | סטטוס: 🟡 חלקי
- description: לבנות feed של פעולות צוות, comments, approvals ו־workspace transitions ברמת הפרויקט
- input:
  - `collaborationEvent`
  - `projectPresenceState`
- output:
  - `collaborationFeed`
- dependencies:
  - `Create project presence model`  | סטטוס: 🟡 חלקי
  - `Create project comments and review threads module`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

#### `Execution Topology Model`

משימות טכניות:

1. `Define execution topology schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לטופולוגיות execution של Nexus כולל cloud, local, container, branch ו־remote specialized runners
- input:
  - `executionSurfaces`
  - `environmentConfig`
- output:
  - `executionTopology`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Project State`

2. `Create cloud execution workspace model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל ל־cloud workspace שבו Nexus כותב קבצים, מריץ פקודות ושומר artifacts מתוך סביבת execution מבודדת
- input:
  - `executionTopology`
  - `projectState`
- output:
  - `cloudWorkspaceModel`
- dependencies:
  - `Define execution topology schema`  | סטטוס: 🟢 בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create local development bridge contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה אחיד לחיבור בין Nexus לבין סביבת פיתוח מקומית או IDE חיצוני בלי להפוך את ה־IDE לבית הראשי של המוצר
- input:
  - `executionTopology`
  - `localEnvironmentMetadata`
- output:
  - `localDevelopmentBridge`
- dependencies:
  - `Define execution topology schema`  | סטטוס: 🟢 בוצע
  - `Development Environment Connectors`
- connects_to: `Execution Surface`

4. `Create remote mac runner contract`  | סטטוס: 🟢 בוצע
- description: לבנות חוזה ל־remote Mac execution עבור iOS build, signing, archive ו־Apple-specific tooling
- input:
  - `executionTopology`
  - `appleBuildConfig`
- output:
  - `remoteMacRunner`
- dependencies:
  - `Define execution topology schema`  | סטטוס: 🟢 בוצע
  - `Deployment & Hosting Orchestrator`
- connects_to: `Execution Surface`

5. `Create execution mode resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שבוחר execution mode מתאים לכל משימה לפי project type, tooling requirements ו־available surfaces
- input:
  - `executionTopology`
  - `taskType`
  - `projectState`
- output:
  - `executionModeDecision`
- dependencies:
  - `Create cloud execution workspace model`  | סטטוס: 🟢 בוצע
  - `Create local development bridge contract`  | סטטוס: 🟢 בוצע
  - `Create remote mac runner contract`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Execution Action Routing`

משימות טכניות:

1. `Define execution action routing schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד שממפה action קנוני של Nexus לפעולה מבצעת בעולם האמיתי כולל actor, provider, execution surface ו־side effects צפויים
- input:
  - `actionType`
  - `executionModeDecision`
  - `providerCapabilities`
- output:
  - `executionActionRoute`
- dependencies:
  - `Execution Topology Model`
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create action-to-provider mapping resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע איזה provider, runner או integration מבצעים בפועל actions כמו create repository, push code, deploy backend, build ios או send external event
- input:
  - `executionActionRoute`
  - `providerConnector`
  - `projectState`
- output:
  - `executionDispatchPlan`
- dependencies:
  - `Define execution action routing schema`  | סטטוס: 🔴 לא בוצע
  - `Create provider connector assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create external execution dispatch module`  | סטטוס: 🔴 לא בוצע
- description: לבנות dispatch module שמבצע בפועל actions דרך provider APIs, remote runners או execution surfaces ומחזיר תוצאה אחידה ל־Nexus
- input:
  - `executionDispatchPlan`
  - `resolvedExecutionConfig`
- output:
  - `externalExecutionResult`
- dependencies:
  - `Create action-to-provider mapping resolver`  | סטטוס: 🔴 לא בוצע
  - `Create secret resolution module`  | סטטוס: 🔴 לא בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

4. `Define IDE agent executor contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד ל־IDE / coding agents חיצוניים שמקבלים prompt, workspace reference, allowed actions ו־approval token ומחזירים raw execution result, artifacts ו־logs
- input:
  - `compiledPrompt`
  - `workspaceReference`
  - `approvalStatus`
- output:
  - `ideAgentExecutionRequest`
  - `rawExecutionResult`
- dependencies:
  - `Define execution action routing schema`  | סטטוס: 🔴 לא בוצע
  - `Prompt Provider Integration`
- connects_to: `Execution Surface`

5. `Create local coding agent adapter`  | סטטוס: 🔴 לא בוצע
- description: לבנות adapter שמחבר coding agent חיצוני בסגנון Roo-like executor אל Nexus כ־execution provider מבוקר
- input:
  - `ideAgentExecutionRequest`
  - `providerConnector`
- output:
  - `executionProviderSession`
- dependencies:
  - `Define IDE agent executor contract`  | סטטוס: 🔴 לא בוצע
  - `Create provider connector assembler`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

6. `Create execution provider capability sync`  | סטטוס: 🔴 לא בוצע
- description: לבנות sync שמטען ומנרמל capabilities של coding executors כמו file edit, shell run, repo read, diff apply ו־approval requirements
- input:
  - `executionProviderSession`
- output:
  - `executionProviderCapabilities`
- dependencies:
  - `Create local coding agent adapter`  | סטטוס: 🔴 לא בוצע
  - `Create provider capability descriptor`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

7. `Create external execution session manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager לפתיחת session, חידוש, ביטול ומיפוי session ids בין Nexus לבין execution providers חיצוניים
- input:
  - `executionProviderSession`
  - `workspaceRecoveryState`
- output:
  - `managedExecutionSession`
- dependencies:
  - `Create local coding agent adapter`  | סטטוס: 🔴 לא בוצע
  - `Workspace Recovery & Resume`
- connects_to: `Execution Surface`

8. `Create IDE agent result normalizer`  | סטטוס: 🔴 לא בוצע
- description: לבנות normalizer שממיר תוצאות של coding agents חיצוניים לפורמט אחיד של Nexus כולל status, changed files, artifacts, logs ו־provider trace id
- input:
  - `rawExecutionResult`
  - `executionProviderCapabilities`
- output:
  - `normalizedExecutionResult`
- dependencies:
  - `Create execution provider capability sync`  | סטטוס: 🔴 לא בוצע
  - `Create external execution session manager`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

9. `Create execution invocation contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract קנוני לריצת execution בפועל כולל invocation id, provider session, execution target, approval posture ו־expected side effects
- input:
  - `executionDispatchPlan`
  - `managedExecutionSession`
- output:
  - `executionInvocation`
- dependencies:
  - `Create external execution dispatch module`  | סטטוס: 🔴 לא בוצע
  - `Create external execution session manager`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

10. `Create artifact collection pipeline`  | סטטוס: 🔴 לא בוצע
- description: לבנות pipeline שאוסף files, diffs, logs, previews ו־provider metadata אחרי כל execution ולא רק ב־bootstrap
- input:
  - `executionInvocation`
  - `normalizedExecutionResult`
- output:
  - `executionArtifacts`
- dependencies:
  - `Create execution invocation contract`  | סטטוס: 🔴 לא בוצע
  - `Create IDE agent result normalizer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

11. `Create canonical execution result envelope`  | סטטוס: 🔴 לא בוצע
- description: לבנות envelope אחיד לכל execution שמרכז result status, artifacts, logs, provider trace, approval context ו־follow-up metadata
- input:
  - `normalizedExecutionResult`
  - `executionArtifacts`
- output:
  - `executionResultEnvelope`
- dependencies:
  - `Create artifact collection pipeline`  | סטטוס: 🔴 לא בוצע
  - `Create IDE agent result normalizer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

12. `Create execution provider trust boundary resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמגדיר מה מותר לשלוח ל־provider חיצוני, אילו credentials מוצמדים, ואילו actions נדרשים ל־approval נוסף
- input:
  - `executionProviderCapabilities`
  - `credentialReferences`
  - `approvalStatus`
- output:
  - `providerTrustDecision`
- dependencies:
  - `Create execution provider capability sync`  | סטטוס: 🔴 לא בוצע
  - `Create secret resolution module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Workspace Recovery & Resume`

משימות טכניות:

1. `Define workspace recovery schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להתאוששות workspace כולל last safe state, interrupted runs, open files ו־resume checkpoints
- input:
  - `developerWorkspace`
  - `executionStatusPayload`
- output:
  - `workspaceRecoveryState`
- dependencies:
  - `Developer Workspace Experience`
  - `Execution Feedback Layer`
- connects_to: `Project State`

2. `Create session resume resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמחליט לאן להחזיר את המשתמש אחרי ניתוק, קריסת session או restart של השרת
- input:
  - `workspaceRecoveryState`
  - `userSessionMetric`
- output:
  - `resumeDecision`
- dependencies:
  - `Define workspace recovery schema`  | סטטוס: 🔴 לא בוצע
  - `User Activity & Retention`
- connects_to: `Project State`

3. `Create interrupted run recovery planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner לריצות שנקטעו באמצע שקובע אם להמשיך, להחזיר אחורה או לבקש אישור
- input:
  - `workspaceRecoveryState`
  - `progressState`
- output:
  - `interruptedRunRecoveryPlan`
- dependencies:
  - `Define workspace recovery schema`  | סטטוס: 🔴 לא בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Project State`

4. `Create workspace resume experience assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמציג למשתמש מה נשמר, מה נקטע ואיך ממשיכים מאותה נקודה
- input:
  - `resumeDecision`
  - `interruptedRunRecoveryPlan`
- output:
  - `workspaceResumePayload`
- dependencies:
  - `Create session resume resolver`  | סטטוס: 🔴 לא בוצע
  - `Create interrupted run recovery planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

---

### שלב 6.6 — Identity & Auth
המטרה: לבנות שכבת זהות, התחברות ו־session management למוצר Nexus עצמו.

#### `Identity & Auth`

משימות טכניות:

1. `Define user identity schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד למשתמשי Nexus כולל זהות, סטטוס, verification ו־auth metadata
- input:
  - `userProfile`
  - `authMetadata`
- output:
  - `userIdentity`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`userIdentity` עדיין נשען על profile/auth metadata קנוניים מתוך project context; הוא יקבל ערך מלא יותר אחרי `Create authentication system`.

2. `Create authentication system`  | סטטוס: 🟢 בוצע
- description: לבנות שכבת אימות בסיסית למשתמשי Nexus עם login state ו־auth flows
- input:
  - `userIdentity`
  - `credentials`
- output:
  - `authenticationState`
- dependencies:
  - `Define user identity schema`  | סטטוס: 🟢 בוצע
  - `Credentials Management`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`authenticationState` עדיין קנוני ונשען על user/auth context פנימי; הוא יקבל ערך מלא יותר אחרי `Create signup / login / logout API` ו־`Create session and token management`.

3. `Create signup / login / logout API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לרישום, התחברות וניתוק משתמשים מהמערכת
- input:
  - `userInput`
  - `credentials`
- output:
  - `authPayload`
- dependencies:
  - `Create authentication system`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־API עדיין נשען על store קנוני פנימי למשתמשים ולא על session/token management מלא; הוא יקבל ערך מלא יותר אחרי `Create session and token management`.

4. `Create session and token management`  | סטטוס: 🟢 בוצע
- description: לבנות ניהול sessions, token issuance, expiration ו־revocation למשתמשי Nexus
- input:
  - `userIdentity`
  - `authenticationState`
- output:
  - `sessionState`
  - `tokenBundle`
- dependencies:
  - `Create authentication system`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`sessionState` ו־`tokenBundle` עדיין קנוניים ונשענים על in-memory auth flows; הם יקבלו ערך מלא יותר אחרי auth middleware ו־session security controls.

5. `Create password reset and email verification flow`  | סטטוס: 🟢 בוצע
- description: לבנות flow לשחזור סיסמה ואימות אימייל עם state קנוני ותוקף בקשות
- input:
  - `userIdentity`
  - `verificationRequest`
- output:
  - `verificationFlowState`
- dependencies:
  - `Create signup / login / logout API`  | סטטוס: 🟢 בוצע
  - `Notification System`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`verificationFlowState` עדיין קנוני ונשען על auth flows פנימיים ולא על delivery אמיתי של email; הוא יקבל ערך מלא יותר אחרי `Notification System`.

6. `Create authentication route resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אם המשתמש רואה signup, login, session restore, session expired או redirect ל־workspace
- input:
  - `authenticationState`
  - `sessionState`
- output:
  - `authenticationRouteDecision`
- dependencies:
  - `Create authentication system`  | סטטוס: 🟢 בוצע
  - `Create session and token management`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

7. `Create protected workspace access gate`  | סטטוס: 🔴 לא בוצע
- description: לבנות gate שמונע גישה ל־workspace, project routes ו־execution surfaces בלי session תקין ו־workspace access תקף
- input:
  - `authenticationState`
  - `sessionState`
  - `accessDecision`
- output:
  - `protectedAccessDecision`
- dependencies:
  - `Create authentication route resolver`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

8. `Build authentication screen states`  | סטטוס: 🔴 לא בוצע
- description: לממש מצבי UI למסכי auth כולל sign up, sign in, restore session, error, loading ו־logout redirect
- input:
  - `authenticationRouteDecision`
  - `verificationFlowState`
- output:
  - `authenticationViewState`
- dependencies:
  - `Create authentication route resolver`  | סטטוס: 🔴 לא בוצע
  - `Initial Nexus Screens`
- connects_to: `Execution Surface`

9. `Create post-auth redirect resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע אם אחרי auth המשתמש נוחת ב־project creation, onboarding resume, workbench, approval inbox או waitlist status
- input:
  - `authenticationRouteDecision`
  - `sessionState`
  - `workspaceModel`
- output:
  - `postAuthRedirect`
- dependencies:
  - `Create authentication route resolver`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

---

### שלב 6.61 — Workspace & Access Control
המטרה: לבנות מודל workspace, חברות והרשאות גישה לפרויקטים ולפעולות במוצר.

#### `Workspace & Access Control`

משימות טכניות:

1. `Define workspace and membership model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל אחיד ל־workspace, membership, roles ו־ownership ברמת המוצר
- input:
  - `userIdentity`
  - `workspaceMetadata`
- output:
  - `workspaceModel`
  - `membershipRecord`
- dependencies:
  - `Identity & Auth`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`workspaceModel` ו־`membershipRecord` עדיין קנוניים ונשענים על owner/member defaults מתוך auth context; הם יקבלו ערך מלא יותר אחרי invitation flow ו־workspace settings.

2. `Create project access control module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שקובע מי יכול לצפות, לערוך או להריץ פעולות על פרויקט
- input:
  - `workspaceModel`
  - `projectId`
  - `actorType`
- output:
  - `accessDecision`
- dependencies:
  - `Define workspace and membership model`  | סטטוס: 🟢 בוצע
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`accessDecision` עדיין קנוני ונשען על role defaults ו־policy context פנימי; הוא יקבל ערך מלא יותר אחרי permission matrix והרשאות פעולה עמוקות יותר.

3. `Create role assignment and invitation flow`  | סטטוס: 🟢 בוצע
- description: לבנות flow להזמנת משתמשים, הקצאת roles וניהול membership changes
- input:
  - `workspaceModel`
  - `invitationRequest`
- output:
  - `invitationRecord`
  - `roleAssignment`
- dependencies:
  - `Define workspace and membership model`  | סטטוס: 🟢 בוצע
  - `Notification System`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`invitationRecord` ו־`roleAssignment` עדיין קנוניים ונשענים על flow פנימי ללא delivery אמיתי; הם יקבלו ערך מלא יותר אחרי `Notification System`.

4. `Create organization / workspace settings module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול לניהול הגדרות workspace, defaults, policies ו־team preferences
- input:
  - `workspaceModel`
  - `settingsInput`
- output:
  - `workspaceSettings`
- dependencies:
  - `Define workspace and membership model`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`workspaceSettings` עדיין קנוני ונשען על defaults פנימיים ו־team preferences בסיסיים; הוא יקבל ערך מלא יותר אחרי policy/profile integration עמוק יותר.

#### `Project Permission Matrix`

משימות טכניות:

1. `Define project permission schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להרשאות ברמת פרויקט כמו view, edit, run, approve, deploy, connect accounts ו־manage credentials
- input:
  - `workspaceModel`
  - `projectType`
- output:
  - `projectPermissionSchema`
- dependencies:
  - `Workspace & Access Control`
- connects_to: `Project State`

2. `Create project role capability matrix`  | סטטוס: 🔴 לא בוצע
- description: לבנות matrix שממפה roles כמו owner, member, operator, reviewer ו־viewer ליכולות מותרות בתוך פרויקט
- input:
  - `projectPermissionSchema`
- output:
  - `roleCapabilityMatrix`
- dependencies:
  - `Define project permission schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create action-level project authorization resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע אם actor מסוים רשאי לבצע פעולה ספציפית על פרויקט כמו deploy, code edit, release approval או credential link
- input:
  - `actorType`
  - `projectAction`
  - `roleCapabilityMatrix`
- output:
  - `projectAuthorizationDecision`
- dependencies:
  - `Create project role capability matrix`  | סטטוס: 🔴 לא בוצע
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create privileged action authority resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver לפעולות רגישות במיוחד כמו deploy, approval override, credential use ו־billing changes
- input:
  - `projectAuthorizationDecision`
  - `approvalStatus`
- output:
  - `privilegedAuthorityDecision`
- dependencies:
  - `Create action-level project authorization resolver`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

#### `Multi-Tenancy & Workspace Isolation`

משימות טכניות:

1. `Define tenant isolation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לבידוד בין users, workspaces, projects ו־resources משותפים בלי דליפת מידע בין tenants
- input:
  - `workspaceModel`
  - `resourceDefinitions`
- output:
  - `tenantIsolationSchema`
- dependencies:
  - `Workspace & Access Control`
- connects_to: `Project State`

2. `Create workspace isolation guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמוודא שכל קריאה לנתונים, artifacts, logs ו־linked accounts נשארת בגבולות ה־workspace הנכון
- input:
  - `tenantIsolationSchema`
  - `requestContext`
- output:
  - `workspaceIsolationDecision`
- dependencies:
  - `Define tenant isolation schema`  | סטטוס: 🔴 לא בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create cross-tenant leak detector`  | סטטוס: 🔴 לא בוצע
- description: לבנות detector שמזהה ערבוב state, learning signals או provider data בין tenants שונים
- input:
  - `workspaceIsolationDecision`
  - `learningEvent`
- output:
  - `leakageAlert`
- dependencies:
  - `Create workspace isolation guard`  | סטטוס: 🔴 לא בוצע
  - `Learning Layer`
- connects_to: `Project State`

---

### שלב 6.62 — Nexus Persistence Layer
המטרה: לבנות שכבת persistence מפורשת לישויות הליבה של Nexus כמוצר.

#### `Nexus Persistence Layer`

משימות טכניות:

1. `Define Nexus persistence schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לישויות הדאטה של Nexus כמו users, workspaces, projects, approvals ו־learning records
- input:
  - `coreEntityDefinitions`
- output:
  - `nexusPersistenceSchema`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create Nexus database migrations`  | סטטוס: 🟢 בוצע
- description: לבנות מסלול migrations ל־DB של Nexus בהתאם ל־persistence schema
- input:
  - `nexusPersistenceSchema`
- output:
  - `migrationPlan`
  - `migrationArtifacts`
- dependencies:
  - `Define Nexus persistence schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create repository layer for core entities`  | סטטוס: 🟢 בוצע
- description: לבנות repository layer לישויות המרכזיות של Nexus עם CRUD ו־query contracts
- input:
  - `nexusPersistenceSchema`
  - `entityType`
- output:
  - `entityRepository`
- dependencies:
  - `Define Nexus persistence schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create file and artifact storage module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול אחסון לקבצים, artifacts ו־attachments של פרויקטים והרצות
- input:
  - `artifactMetadata`
  - `storageRequest`
- output:
  - `storageRecord`
- dependencies:
  - `Nexus Persistence Layer`
  - `Build & Release System`
- connects_to: `Project State`

#### `Project State Versioning`

משימות טכניות:

1. `Define project state snapshot schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־project snapshots כולל state version, execution graph version, workspace reference ו־restore metadata
- input:
  - `projectState`
  - `executionGraph`
- output:
  - `projectStateSnapshot`
- dependencies:
  - `Nexus Persistence Layer`
- connects_to: `Project State`

2. `Create project snapshot store`  | סטטוס: 🟢 בוצע
- description: לבנות storage לשמירת snapshots לפני שינויים גדולים כמו bootstrap, migration, deploy או mass edits
- input:
  - `projectStateSnapshot`
- output:
  - `snapshotRecord`
- dependencies:
  - `Define project state snapshot schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create state diff and compare module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול להשוואה בין snapshots ולזיהוי שינויים ברמת state, graph ו־artifacts
- input:
  - `snapshotRecord`
  - `comparisonTarget`
- output:
  - `stateDiff`
- dependencies:
  - `Create project snapshot store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create project state restore resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמכריע אם ואיך ניתן לשחזר snapshot מלא או חלקי לפי failure scope, approvals ו־side effects
- input:
  - `snapshotRecord`
  - `rollbackPlan`
- output:
  - `restoreDecision`
- dependencies:
  - `Create project snapshot store`  | סטטוס: 🟢 בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Project State`

5. `Create project rollback execution module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמבצע restore בפועל ל־state, workspace ו־linked metadata כשהוחלט על rollback
- input:
  - `restoreDecision`
  - `snapshotRecord`
- output:
  - `rollbackExecutionResult`
- dependencies:
  - `Create project state restore resolver`  | סטטוס: 🟢 בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`
- הערת מצב: מודול ה־rollback מבצע עכשיו restore בפועל מתוך `snapshotRecord.restorePayload`, מחזיר `restoredProjectState`, `restoredExecutionGraph`, `restoredWorkspaceReference` ו־`linkedMetadataResults`, ומאפשר ל־execution surface לקבל תוצאת rollback עם payloadים משוחזרים במקום החלטה בלבד.

---

### שלב 6.63 — Application Runtime Layer
המטרה: לבנות את מעטפת השרת, ה־middleware וה־worker runtime של מוצר Nexus עצמו.

#### `Application Runtime Layer`

משימות טכניות:

1. `Create application server bootstrap`  | סטטוס: 🟢 בוצע
- description: לבנות bootstrap קנוני לשרת האפליקציה של Nexus עם startup flow ברור
- input:
  - `runtimeConfig`
- output:
  - `applicationRuntime`
- dependencies:
  - `Nexus Persistence Layer`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`applicationRuntime` עדיין נשען על http server ותצורת startup קנונית בסיסית; הוא יקבל ערך מלא יותר אחרי middleware layer ו־background worker runtime.

2. `Create API routing and middleware layer`  | סטטוס: 🟢 בוצע
- description: לבנות שכבת routing ו־middleware אחידה לכל ה־APIs של Nexus
- input:
  - `applicationRuntime`
  - `routeDefinitions`
- output:
  - `apiRuntime`
- dependencies:
  - `Create application server bootstrap`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`apiRuntime` עדיין מחזיק route definitions ו־middleware stack קנוניים בלי auth middleware ו־request validation עמוקים; הוא יקבל ערך מלא יותר במשימות הבאות.

3. `Create auth middleware`  | סטטוס: 🟢 בוצע
- description: לבנות middleware שמחבר authentication, session validation ו־workspace access ל־API requests
- input:
  - `requestContext`
  - `sessionState`
- output:
  - `authenticatedRequest`
- dependencies:
  - `Identity & Auth`
  - `Workspace & Access Control`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`authenticatedRequest` עדיין קנוני ונשען על auth/session/access context פנימיים ולא על HTTP request pipeline חי; הוא יקבל ערך מלא יותר אחרי request validation ו־error boundary layer.

4. `Create request validation and error boundary layer`  | סטטוס: 🟢 בוצע
- description: לבנות שכבת validation, normalization ו־error boundaries לכל requests של Nexus
- input:
  - `requestPayload`
  - `routeDefinition`
- output:
  - `validatedRequest`
  - `errorEnvelope`
- dependencies:
  - `Create API routing and middleware layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`validatedRequest` ו־`errorEnvelope` עדיין קנוניים ונשענים על route definitions פנימיים ולא על HTTP pipeline מלא; הם יקבלו ערך מלא יותר אחרי background worker runtime ו־route integration עמוק יותר.

5. `Create background worker runtime`  | סטטוס: 🟢 בוצע
- description: לבנות runtime ל־background jobs, polling, notifications ו־async tasks של Nexus
- input:
  - `jobDefinition`
  - `runtimeConfig`
- output:
  - `workerRuntime`
  - `jobState`
- dependencies:
  - `Create application server bootstrap`  | סטטוס: 🟢 בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`workerRuntime` ו־`jobState` עדיין קנוניים ונשענים על queue/job metadata פנימיים ולא על worker execution חי; הם יקבלו ערך מלא יותר אחרי notification system ו־polling integration עמוק יותר.

#### `Runtime Config & Environment Validation`

משימות טכניות:

1. `Define runtime configuration schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־runtime config כולל env vars, service endpoints, feature defaults, secret references ו־startup requirements
- input:
  - `runtimeConfig`
  - `serviceDefinitions`
- output:
  - `runtimeConfigurationSchema`
- dependencies:
  - `Application Runtime Layer`
- connects_to: `Project State`

2. `Create environment validation resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שבודק presence, format ו־compatibility של environment variables, secrets ו־provider config לפני startup או execution
- input:
  - `runtimeConfigurationSchema`
  - `environmentConfig`
- output:
  - `environmentValidationResult`
- dependencies:
  - `Define runtime configuration schema`  | סטטוס: 🔴 לא בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create startup configuration guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמונע startup או מסמן degraded mode כשחסר config קריטי או שיש incompatibility בין services
- input:
  - `environmentValidationResult`
  - `healthStatus`
- output:
  - `startupConfigurationDecision`
- dependencies:
  - `Create environment validation resolver`  | סטטוס: 🔴 לא בוצע
  - `Create health check and readiness endpoints`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

---

### שלב 6.64 — Notification System
המטרה: לבנות מערכת נוטיפיקציות מלאה עבור approvals, failures, completions ו־account events.

---

### שלב 6.635 — Server Queue & Job Control
המטרה: לבנות שכבת queue וניהול עבודות רקע שמווסתת עומס, שולטת ב־concurrency ומונעת קריסה או כפילויות execution.

#### `Server Queue & Job Control`

משימות טכניות:

1. `Define job queue schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־jobs, queue items, priority, attempts, visibility timeout, lease owner ו־dead-letter state
- input:
  - `jobDefinition`
  - `runtimeConfig`
- output:
  - `jobQueueSchema`
- dependencies:
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

2. `Create queue broker contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות contract אחיד ל־enqueue, claim, ack, retry, release ו־dead-letter עבור worker runtime
- input:
  - `jobQueueSchema`
  - `workerRuntime`
- output:
  - `queueBroker`
- dependencies:
  - `Define job queue schema`  | סטטוס: 🔴 לא בוצע
  - `Create background worker runtime`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

3. `Create idempotent job dispatch guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמונע enqueue כפול ו־replay לא מבוקר של jobs עם אותו effect key
- input:
  - `jobRequest`
  - `queueBroker`
- output:
  - `dispatchDecision`
- dependencies:
  - `Create queue broker contract`  | סטטוס: 🔴 לא בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create leased job claim and visibility timeout module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מנגנון claim עם lease, renewal ו־visibility timeout כדי למנוע עבודה כפולה על אותו job
- input:
  - `queueBroker`
  - `workerIdentity`
- output:
  - `jobLease`
  - `claimState`
- dependencies:
  - `Create queue broker contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

5. `Create retry and dead-letter queue module`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow מסודר ל־retry queues, max attempts, poison jobs ו־dead-letter handling
- input:
  - `jobLease`
  - `retryPolicy`
  - `failureSummary`
- output:
  - `queueRecoveryDecision`
  - `deadLetterRecord`
- dependencies:
  - `Create leased job claim and visibility timeout module`  | סטטוס: 🔴 לא בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Execution Surface`

6. `Create queue backpressure and concurrency guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמווסת throughput, priority lanes ו־concurrency limits כדי לא להעמיס על השרת
- input:
  - `queueDepth`
  - `runtimeHealthSignals`
  - `budgetDecision`
- output:
  - `queuePressureDecision`
- dependencies:
  - `Create queue broker contract`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
  - `Platform Cost & Usage Control`
- connects_to: `Execution Surface`

7. `Create graceful worker drain and shutdown flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow ל־worker drain, lease release ו־safe shutdown בלי לאבד jobs באמצע
- input:
  - `workerRuntime`
  - `claimState`
- output:
  - `workerDrainPlan`
- dependencies:
  - `Create leased job claim and visibility timeout module`  | סטטוס: 🔴 לא בוצע
  - `Create background worker runtime`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

8. `Create queue observability payload`  | סטטוס: 🔴 לא בוצע
- description: לבנות payload קנוני של queue depth, lag, retry pressure, dead-letter count ו־stuck jobs עבור owner ו־ops
- input:
  - `queueBroker`
  - `claimState`
  - `deadLetterRecord`
- output:
  - `queueObservability`
- dependencies:
  - `Create queue broker contract`  | סטטוס: 🔴 לא בוצע
  - `Create retry and dead-letter queue module`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Project State`

#### `Execution Safety & Idempotency`

משימות טכניות:

1. `Create external execution deduplication registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry שמזהה execution requests כפולים לפי action identity, effect key, provider target ו־retry lineage
- input:
  - `executionRequest`
  - `executionActionRoute`
- output:
  - `executionDedupRecord`
- dependencies:
  - `Execution Action Routing`
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create idempotent external action executor`  | סטטוס: 🔴 לא בוצע
- description: לבנות executor שמבצע external actions בצורה idempotent, מחזיר existing result כשאותו effect כבר בוצע, ומונע side effects כפולים
- input:
  - `executionRequest`
  - `executionDedupRecord`
  - `resolvedActionProvider`
- output:
  - `idempotentExecutionResult`
- dependencies:
  - `Create external execution dispatch module`  | סטטוס: 🔴 לא בוצע
  - `Create external execution deduplication registry`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

3. `Create atomic external action envelope`  | סטטוס: 🔴 לא בוצע
- description: לבנות envelope אחיד ל־prepare, dispatch, commit, reconcile ו־abort כדי שפעולות חיצוניות לא יישארו ב־half-applied state
- input:
  - `executionRequest`
  - `resolvedActionProvider`
- output:
  - `atomicExecutionEnvelope`
- dependencies:
  - `Create action-to-provider mapping resolver`  | סטטוס: 🔴 לא בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

4. `Create execution consistency validator`  | סטטוס: 🔴 לא בוצע
- description: לבנות validator שבודק התאמה בין requested action, provider result, state update ו־stored evidence כדי לזהות drift או partial execution
- input:
  - `atomicExecutionEnvelope`
  - `externalExecutionResult`
  - `projectState`
- output:
  - `executionConsistencyReport`
- dependencies:
  - `Create atomic external action envelope`  | סטטוס: 🔴 לא בוצע
  - `Create external execution dispatch module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Failure Simulation & Chaos Validation`

משימות טכניות:

1. `Define failure simulation scenario schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לתרחישי כשל כמו provider outage, queue stall, credential revoke, partial deploy ו־workspace disconnect
- input:
  - `runtimeTopology`
  - `providerCapabilities`
- output:
  - `failureSimulationScenario`
- dependencies:
  - `Platform Observability`
  - `Execution Surface Layer`
- connects_to: `Project State`

2. `Create chaos testing and failure injection runner`  | סטטוס: 🔴 לא בוצע
- description: לבנות runner שמזריק failures מבוקרים, בודק recovery paths ואוסף evidence על retry, rollback ו־continuity behavior
- input:
  - `failureSimulationScenario`
  - `continuityPlan`
- output:
  - `failureSimulationResult`
  - `chaosValidationEvidence`
- dependencies:
  - `Define failure simulation scenario schema`  | סטטוס: 🔴 לא בוצע
  - `Create failover and continuity planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Notification System`

משימות טכניות:

1. `Define notification event schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לאירועי notification פנימיים וחיצוניים של Nexus
- input:
  - `eventType`
  - `eventPayload`
- output:
  - `notificationEvent`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`notificationEvent` עדיין נשען על payloads קנוניים פנימיים ולא על delivery runtimes אמיתיים; הוא יקבל ערך מלא יותר אחרי notification center ו־delivery modules.

2. `Create in-app notification center`  | סטטוס: 🟢 בוצע
- description: לבנות מרכז נוטיפיקציות פנימי למשתמש עם inbox, unread state ו־action links
- input:
  - `notificationEvent`
  - `userIdentity`
- output:
  - `notificationCenterState`
- dependencies:
  - `Define notification event schema`  | סטטוס: 🟢 בוצע
  - `UI / UX Foundation`
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`notificationCenterState` עדיין קנוני ונשען על state פנימי יחיד ולא על inbox persistence או UI live updates; הוא יקבל ערך מלא יותר בהמשך שכבת ה־UI וה־realtime.

3. `Create email notification delivery module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול לשליחת נוטיפיקציות אימייל עבור approvals, failures, invites ו־security events
- input:
  - `notificationEvent`
  - `deliveryPreferences`
- output:
  - `emailDeliveryResult`
- dependencies:
  - `Define notification event schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`emailDeliveryResult` עדיין מייצג queue קנוני ולא transport חיצוני אמיתי; הוא יקבל runtime מלא יותר אחרי webhook / adapter / worker delivery flows.

4. `Create webhook / external notification adapter`  | סטטוס: 🟢 בוצע
- description: לבנות adapter לשליחת notifications ל־webhooks או ערוצים חיצוניים
- input:
  - `notificationEvent`
  - `channelConfig`
- output:
  - `externalDeliveryResult`
- dependencies:
  - `Define notification event schema`  | סטטוס: 🟢 בוצע
  - `External Accounts Connector`
- connects_to: `Execution Surface`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`externalDeliveryResult` עדיין מייצג adapter קנוני ו־queue חיצוני לוגי, לא delivery network אמיתי; הוא יקבל חיבור מלא יותר אחרי provider sessions ו־worker dispatch חיצוני.

5. `Create notification preference settings`  | סטטוס: 🟢 בוצע
- description: לבנות מודול להגדרות משתמש על סוגי notifications, channels ותדירות
- input:
  - `userIdentity`
  - `preferenceInput`
- output:
  - `notificationPreferences`
- dependencies:
  - `Identity & Auth`
  - `Define notification event schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`
- הערת מצב: המשימה עצמה מומשה, אבל ה־`notificationPreferences` עדיין נשענות על state קנוני פנימי ולא על persistence/UX של settings אמיתיים; הוא יקבל עומק נוסף אחרי settings UI ו־notification storage.

---

### שלב 6.65 — Platform Observability
המטרה: לבנות observability למערכת Nexus עצמה, מעבר ל־logs והסטטוסים של פרויקטי המשתמשים.

#### `Platform Observability`

משימות טכניות:

1. `Create platform logging and tracing layer`  | סטטוס: 🟢 בוצע
- description: לבנות שכבת logging ו־tracing אחידה לשרת, workers, adapters ו־runtime services של Nexus
- input:
  - `runtimeEvents`
  - `requestContext`
- output:
  - `platformTrace`
  - `platformLogs`
- dependencies:
  - `Application Runtime Layer`
- connects_to: `Project State`
- הערת מצב: השכבה מחוברת עכשיו ל־observability transport משותף, רושמת traces ולוגים מה־context builder, מה־HTTP server ומ־application bootstrap, וחשופה דרך `getPlatformObservability()` ו־`/api/observability`; היא כבר לא נשענת רק על runtime state פנימי.

2. `Create health check and readiness endpoints`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints לבדיקת health, readiness ו־dependency status של המערכת
- input:
  - `runtimeHealthSignals`
- output:
  - `healthStatus`
  - `readinessStatus`
- dependencies:
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create alerting and incident hooks`  | סטטוס: 🟢 בוצע
- description: לבנות hooks והתראות על failures סדרתיים, queue stalls, connector outages ו־runtime incidents
- input:
  - `platformTrace`
  - `healthStatus`
- output:
  - `incidentAlert`

- הערת מצב: ה־incident hooks מחוברים עכשיו לזיהוי incident חמור ביותר, מייצרים incident notification event, מפעילים dispatch בפועל ל־in-app / email / webhook לפי severity, ורושמים incident trace ייעודי ל־observability transport; הם כבר לא נשארים רק כ־incident state מחושב.
4. `Create system bottleneck detector`  | סטטוס: 🟢 בוצע
- description: לבנות detector שמזהה bottlenecks רוחביים במערכת עצמה לפי queue lag, runtime pressure, provider failures ו־stuck execution lanes
- input:
  - `platformTrace`
  - `healthStatus`
  - `queueObservability`
- output:
  - `systemBottleneckSummary`
- dependencies:
  - `Create alerting and incident hooks`  | סטטוס: 🟢 בוצע
  - `Server Queue & Job Control`
- connects_to: `Project State`
- dependencies:
  - `Create platform logging and tracing layer`  | סטטוס: 🟢 בוצע
  - `Notification System`
- connects_to: `Execution Surface`

- הערת מצב: ה־detector מומש ומחשב עכשיו `systemBottleneckSummary` אמיתי מתוך queue lag, retry pressure, runtime degradation, provider failures ו־stuck execution lanes; הוא מחובר ל־`context-builder` ול־project state ומשתמש ב־observability signals חיים במקום placeholder.
4. `Create audit log for system actions`  | סטטוס: 🟢 בוצע
- description: לבנות audit log קנוני לפעולות מערכתיות כמו auth, role changes, approvals ו־security events
- input:
  - `systemAction`
  - `actorContext`
- output:
  - `auditLogRecord`
- dependencies:
  - `Platform Observability`
  - `Identity & Auth`
- connects_to: `Project State`

#### `Provider Circuit Breaker & Degradation Control`

משימות טכניות:

- הערת מצב: ה־audit log מחובר עכשיו ל־store אמיתי עם append/query, נשמר ל־`system-audit.ndjson`, נרשם מתוך `context-builder`, נחשף דרך `ProjectService.getSystemAuditLogs()` ודרך `GET /api/audit-logs`, ומקליט גם audit trace ל־observability transport.
1. `Define provider degradation schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד ל־provider health, consecutive failures, cooldown windows, probe state ו־degraded service flags
- input:
  - `providerSession`
  - `incidentAlert`
- output:
  - `providerDegradationState`
- dependencies:
  - `Platform Observability`
  - `External Accounts Connector`
- connects_to: `Project State`

- הערת מצב: ה־schema כבר מומש ב־`provider-degradation-schema.js`, מכסה `health`, `consecutiveFailures`, `cooldownWindowMs`, `probeState` ו־`degradedServiceFlags`, ונבנה בפועל מתוך `providerSession` ו־`incidentAlert` בתוך `context-builder`; הוא גם נבדק ומופיע ב־project state.
2. `Create provider circuit breaker resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שסוגר provider זמנית אחרי רצף כשלים, timeouts או outage signals, ומכריע מתי fail fast ומתי לאפשר ניסיון מחדש
- input:
  - `providerDegradationState`
  - `runtimeHealthSignals`
- output:
  - `circuitBreakerDecision`
- dependencies:
  - `Define provider degradation schema`  | סטטוס: 🟢 בוצע
  - `Create alerting and incident hooks`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

- הערת מצב: ה־resolver כבר מומש ב־`provider-circuit-breaker-resolver.js`, מקבל `providerDegradationState` ו־`runtimeHealthSignals`, ומחזיר `circuitBreakerDecision` עם `open` / `half-open` / `closed`, fail-fast מול controlled retry, cooldown ו־dependency signals; הוא גם מחובר ב־`context-builder` ומופיע ב־project state.
3. `Create provider recovery probe flow`  | סטטוס: 🟢 בוצע
- description: לבנות flow מבוקר של probe/re-open כדי לבדוק אם provider סגור חזר להיות תקין בלי להעמיס עליו מחדש
- input:
  - `circuitBreakerDecision`
  - `providerSession`
- output:
  - `providerRecoveryProbe`
- dependencies:
  - `Create provider circuit breaker resolver`  | סטטוס: 🟢 בוצע
  - `Create background worker runtime`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Project Audit Trail`

משימות טכניות:

- הערת מצב: ה־flow כבר מומש ב־`provider-recovery-probe-flow.js`, מתרגם `circuitBreakerDecision` ו־`providerSession` ל־`providerRecoveryProbe` עם probe scheduling, worker job, reopen decision ו־controlled retry path; הוא גם מחובר ב־`context-builder` ונחשף ב־project state.
1. `Define project audit event schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לאירועי audit ברמת פרויקט כמו edits, approvals, deploy actions, provider calls ו־state changes
- input:
  - `projectAction`
  - `actorContext`
- output:
  - `projectAuditEvent`
- dependencies:
  - `Platform Observability`
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create project audit event collector`  | סטטוס: 🟢 בוצע
- description: לבנות collector שמקליט אירועי audit מכל execution path, approval flow ו־workspace action
- input:
  - `projectAuditEvent`
- output:
  - `projectAuditRecord`
- dependencies:
  - `Define project audit event schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create actor action trace assembler`  | סטטוס: 🟢 בוצע
- description: לבנות trace שמחבר בין actor, פעולה, תוצאה, provider side effects ו־affected artifacts
- input:
  - `projectAuditRecord`
  - `executionResult`
- output:
  - `actorActionTrace`
- dependencies:
  - `Create project audit event collector`  | סטטוס: 🟢 בוצע
  - `Execution Feedback Layer`
- connects_to: `Project State`

4. `Create project audit API and viewer model`  | סטטוס: 🟢 בוצע
- description: לבנות API ו־viewer model להצגת היסטוריית פעולות ברמת פרויקט לפי actor, זמן, action type ו־sensitivity
- input:
  - `actorActionTrace`
  - `filters`
- output:
  - `projectAuditPayload`
- dependencies:
  - `Create actor action trace assembler`  | סטטוס: 🟢 בוצע
  - `UI / UX Foundation`
- connects_to: `Project State`

---

### שלב 6.66 — Backup & Recovery
המטרה: להבטיח גיבוי, שימור ושחזור של נתוני Nexus עצמו.

#### `Backup & Recovery`

משימות טכניות:

1. `Create backup and restore strategy`  | סטטוס: 🟢 בוצע
- description: לבנות אסטרטגיית גיבוי ושחזור לנתוני המוצר, persistence layer ו־artifacts קריטיים
- input:
  - `nexusPersistenceSchema`
  - `storageRecords`
- output:
  - `backupStrategy`
  - `restorePlan`
- dependencies:
  - `Nexus Persistence Layer`
- connects_to: `Project State`

2. `Create snapshot backup scheduling module`  | סטטוס: 🔴 לא בוצע
- description: לבנות scheduling בסיסי ליצירת snapshots לפי interval קבוע ו־pre-change triggers כמו bootstrap, migration ו־deploy
- input:
  - `backupStrategy`
  - `projectState`
- output:
  - `snapshotSchedule`
- dependencies:
  - `Create backup and restore strategy`  | סטטוס: 🟢 בוצע
  - `Project State Versioning`
- connects_to: `Project State`

3. `Create snapshot retention guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard פשוט שמגביל max snapshots, מזהה snapshots ישנים למחיקה ומכריע איזה history נשמר לכל פרויקט
- input:
  - `snapshotRecord`
  - `snapshotSchedule`
- output:
  - `snapshotRetentionDecision`
- dependencies:
  - `Create snapshot backup scheduling module`  | סטטוס: 🔴 לא בוצע
  - `Create project snapshot store`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create snapshot backup worker job`  | סטטוס: 🔴 לא בוצע
- description: לבנות worker/job שמריץ snapshot creation בפועל לפי schedule ומוחק snapshots ישנים לפי retention guard
- input:
  - `snapshotSchedule`
  - `snapshotRetentionDecision`
- output:
  - `snapshotJobState`
- dependencies:
  - `Create snapshot retention guard`  | סטטוס: 🔴 לא בוצע
  - `Create background worker runtime`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

5. `Create data retention policy module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול מתקדם שמגדיר retention windows, archival rules, data-class policies ו־deletion workflows לנתוני Nexus
- input:
  - `dataClass`
  - `policyInput`
- output:
  - `retentionPolicy`
- dependencies:
  - `Backup & Recovery`
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create disaster recovery checklist`  | סטטוס: 🔴 לא בוצע
- description: לבנות checklist אופרטיבי להתאוששות מתקלות חמורות, אובדן נתונים ו־runtime outages
- input:
  - `backupStrategy`
  - `incidentAlert`
- output:
  - `disasterRecoveryChecklist`
- dependencies:
  - `Create backup and restore strategy`  | סטטוס: 🟢 בוצע
  - `Platform Observability`
- connects_to: `Project State`

7. `Create business continuity lifecycle manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager שמחבר backup, failover, incident recovery, retention policies ו־owner continuity decisions למסלול continuity אחד לאורך חיי המוצר
- input:
  - `backupStrategy`
  - `continuityPlan`
  - `disasterRecoveryChecklist`
- output:
  - `businessContinuityState`
- dependencies:
  - `Create disaster recovery checklist`  | סטטוס: 🔴 לא בוצע
  - `Create failover and continuity planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

---

### שלב 6.67 — Security Hardening
המטרה: לחזק את שכבת האבטחה המערכתית של Nexus מעבר ל־policies, approvals ו־credentials.

#### `Security Hardening`

משימות טכניות:

1. `Create rate limiting and abuse protection`  | סטטוס: 🔴 לא בוצע
- description: לבנות מנגנון rate limiting, abuse detection ו־basic throttling ל־APIs קריטיים
- input:
  - `requestContext`
  - `routeDefinition`
- output:
  - `rateLimitDecision`
- dependencies:
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

2. `Create session security controls`  | סטטוס: 🔴 לא בוצע
- description: לבנות controls ל־session expiry, rotation, suspicious activity detection ו־device/session invalidation
- input:
  - `sessionState`
  - `securitySignals`
- output:
  - `sessionSecurityDecision`
- dependencies:
  - `Identity & Auth`
- connects_to: `Project State`

3. `Create security audit event logger`  | סטטוס: 🔴 לא בוצע
- description: לבנות logger ייעודי לאירועי אבטחה כמו failed login, privilege changes, secret access ו־policy violations
- input:
  - `securityEvent`
  - `actorContext`
- output:
  - `securityAuditRecord`
- dependencies:
  - `Platform Observability`
  - `Security Hardening`
- connects_to: `Project State`

4. `Create secret rotation workflow`  | סטטוס: 🔴 לא בוצע
- description: לבנות workflow לרוטציה של credentials, invalidation של references ועדכון dependent connectors
- input:
  - `credentialReference`
  - `rotationRequest`
- output:
  - `rotationResult`
- dependencies:
  - `Credentials Management`
  - `External Accounts Connector`
- connects_to: `Execution Surface`

#### `Feature Flags & Kill Switch Control`

משימות טכניות:

1. `Define feature flag schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־feature flags, rollout scopes, kill switches, environment targeting ו־default fallbacks
- input:
  - `featureDefinitions`
  - `environmentConfig`
- output:
  - `featureFlagSchema`
- dependencies:
  - `Security Hardening`
  - `Application Runtime Layer`
- connects_to: `Project State`

2. `Create feature flag resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע אילו capabilities, routes או actions מופעלים לפי workspace, user, environment ו־risk level
- input:
  - `featureFlagSchema`
  - `requestContext`
- output:
  - `featureFlagDecision`
- dependencies:
  - `Define feature flag schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Execution Surface`

3. `Create emergency kill switch guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמאפשר לכבות במהירות execution paths, providers או risky capabilities במקרה incident או security event
- input:
  - `featureFlagDecision`
  - `incidentAlert`
- output:
  - `killSwitchDecision`
- dependencies:
  - `Create feature flag resolver`  | סטטוס: 🔴 לא בוצע
  - `Create alerting and incident hooks`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Data Privacy & Compliance`

משימות טכניות:

1. `Define data privacy classification schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לסיווג נתונים כמו public, internal, confidential, secret, personal data ו־learning-safe data
- input:
  - `dataAsset`
  - `storageContext`
- output:
  - `dataPrivacyClassification`
- dependencies:
  - `Security Hardening`
- connects_to: `Project State`

2. `Create privacy retention and deletion policy resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע מה נשמר, לכמה זמן, מה מותר ללמידה ומה חייב להימחק לפי סוג הנתון
- input:
  - `dataPrivacyClassification`
  - `retentionPolicy`
- output:
  - `privacyPolicyDecision`
- dependencies:
  - `Data Privacy & Compliance`
  - `Backup & Recovery`
- connects_to: `Project State`

3. `Create compliance consent and legal basis registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry להסכמות, legal basis ו־processing scopes עבור data usage, learning ו־notifications
- input:
  - `userIdentity`
  - `consentRecord`
- output:
  - `complianceConsentState`
- dependencies:
  - `Identity & Auth`
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

4. `Create privacy rights execution module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול לבקשות export, delete, forget me ו־learning opt-out ברמת user/workspace
- input:
  - `privacyRequest`
  - `privacyPolicyDecision`
- output:
  - `privacyRightsResult`
- dependencies:
  - `Create privacy retention and deletion policy resolver`  | סטטוס: 🔴 לא בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

5. `Create compliance audit summary`  | סטטוס: 🔴 לא בוצע
- description: לבנות summary שמרכז privacy classifications, consents, deletions ו־learning restrictions לצרכי audit ותאימות
- input:
  - `privacyRightsResult`
  - `complianceConsentState`
- output:
  - `complianceAuditSummary`
- dependencies:
  - `Create privacy rights execution module`  | סטטוס: 🔴 לא בוצע
  - `Project Audit Trail`
- connects_to: `Project State`

#### `Agent Governance & Sandboxing`

משימות טכניות:

1. `Define agent governance schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־agent limits, allowed tools, sandbox levels, spend thresholds ו־escalation rules
- input:
  - `agentType`
  - `policySchema`
- output:
  - `agentGovernancePolicy`
- dependencies:
  - `Policy Layer`  | סטטוס: 🟢 בוצע
  - `Security Hardening`
- connects_to: `Project State`

2. `Create agent sandbox policy resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע באיזה sandbox או execution boundary agent מסוים רשאי לפעול
- input:
  - `agentGovernancePolicy`
  - `taskType`
- output:
  - `sandboxDecision`
- dependencies:
  - `Define agent governance schema`  | סטטוס: 🔴 לא בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

3. `Create agent action limit guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמגביל actions מסוכנים, כמות פעולות, cost spikes ו־provider side effects לפי agent policy
- input:
  - `sandboxDecision`
  - `budgetDecision`
  - `taskContext`
- output:
  - `agentLimitDecision`
- dependencies:
  - `Create agent sandbox policy resolver`  | סטטוס: 🔴 לא בוצע
  - `Platform Cost & Usage Control`
- connects_to: `Execution Surface`

4. `Create agent governance audit trail`  | סטטוס: 🔴 לא בוצע
- description: לבנות trace שמסביר אילו limits הוחלו על agent, מה נחסם ומה דרש escalation
- input:
  - `agentGovernancePolicy`
  - `agentLimitDecision`
- output:
  - `agentGovernanceTrace`
- dependencies:
  - `Create agent action limit guard`  | סטטוס: 🔴 לא בוצע
  - `Project Audit Trail`
- connects_to: `Project State`

---

### שלב 6.68 — Platform Cost & Usage Control
המטרה: למדוד ולשלוט בעלויות האמיתיות של Nexus כמו AI, compute, storage ו־build/deploy runtime.

#### `Platform Cost & Usage Control`

משימות טכניות:

1. `Define platform usage cost schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לעלויות usage של מודלים, workspaces, storage, builds ו־provider operations
- input:
  - `usageEvent`
  - `pricingMetadata`
- output:
  - `platformCostMetric`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create AI usage meter`  | סטטוס: 🔴 לא בוצע
- description: לבנות meter שסופר צריכת מודלים, tool runs ו־token usage לכל פרויקט, משתמש וזרימת עבודה
- input:
  - `modelInvocation`
  - `toolInvocation`
- output:
  - `aiUsageMetric`
- dependencies:
  - `Define platform usage cost schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create workspace compute usage tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker ל־CPU, RAM, runtime duration ו־active workspace windows עבור cloud execution workspaces
- input:
  - `cloudWorkspaceModel`
  - `runtimeEvents`
- output:
  - `workspaceComputeMetric`
- dependencies:
  - `Create cloud execution workspace model`  | סטטוס: 🟢 בוצע
  - `Define platform usage cost schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create storage and artifact cost tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לעלויות קבצים, artifacts, logs ו־snapshots לפי נפח, שמירה ומשך חיים
- input:
  - `storageRecord`
  - `artifactMetadata`
- output:
  - `storageCostMetric`
- dependencies:
  - `Create file and artifact storage module`  | סטטוס: 🟢 בוצע
  - `Define platform usage cost schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create build and deploy cost tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לעלויות build, package, deploy ו־specialized runners כמו remote mac
- input:
  - `buildArtifact`
  - `deploymentResult`
  - `executionModeDecision`
- output:
  - `buildDeployCostMetric`
- dependencies:
  - `Build & Release System`
  - `Execution Topology Model`
- connects_to: `Project State`

6. `Create cost summary aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregator שמרכז עלויות לפי משתמש, פרויקט, workspace, provider ותקופה
- input:
  - `platformCostMetrics`
- output:
  - `costSummary`
- dependencies:
  - `Create build and deploy cost tracker`  | סטטוס: 🔴 לא בוצע
  - `Create storage and artifact cost tracker`  | סטטוס: 🔴 לא בוצע
  - `Create AI usage meter`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create usage budget guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמזהה חריגות usage, חוסם פעולות יקרות מדי ומבקש approval לפני חציית תקציב
- input:
  - `costSummary`
  - `budgetPolicy`
- output:
  - `budgetDecision`
- dependencies:
  - `Create cost summary aggregator`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

8. `Create cost visibility API and dashboard model`  | סטטוס: 🔴 לא בוצע
- description: לבנות payload ו־dashboard model שמציגים למשתמש עלויות, usage trends, top cost drivers ו־budget warnings
- input:
  - `costSummary`
  - `budgetDecision`
- output:
  - `costVisibilityPayload`
  - `costDashboardModel`
- dependencies:
  - `Create cost summary aggregator`  | סטטוס: 🔴 לא בוצע
  - `UI / UX Foundation`
- connects_to: `Project State`

#### `Cost-Aware Decision Engine`

משימות טכניות:

1. `Create cost-aware action selector`  | סטטוס: 🔴 לא בוצע
- description: לבנות selector שמעדיף בין actions חלופיים לפי expected value, latency, provider cost ו־budget pressure
- input:
  - `candidateActions`
  - `costSummary`
  - `decisionIntelligence`
- output:
  - `costAwareActionSelection`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Decision Intelligence Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create budget constraint engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחשב budget envelopes, hard limits ו־soft limits לפי workspace, provider lane ו־execution class
- input:
  - `costSummary`
  - `workspaceModel`
  - `pricingMetadata`
- output:
  - `budgetDecision`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Workspace & Access Control`
- connects_to: `Execution Surface`

---

### שלב 6.69 — Billing & Monetization System
המטרה: להגדיר איך Nexus גובה כסף, אילו entitlements יש לכל plan ואיך usage וקנייה מתורגמים לגישה למוצר.

#### `Billing & Monetization System`

משימות טכניות:

1. `Define billing plan schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־plans, limits, entitlements, trial rules ו־pricing model של Nexus
- input:
  - `pricingStrategy`
  - `usageDimensions`
- output:
  - `billingPlanSchema`
- dependencies:
  - `Platform Cost & Usage Control`
- connects_to: `Project State`

2. `Create entitlement resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אילו capabilities, limits ו־features זמינים למשתמש או workspace לפי plan נוכחי
- input:
  - `billingPlanSchema`
  - `workspaceModel`
  - `usageSummary`
- output:
  - `entitlementDecision`
- dependencies:
  - `Define billing plan schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

3. `Create subscription lifecycle module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמנהל trial, active, past_due, canceled ו־grace period עבור subscriptions
- input:
  - `billingEvent`
  - `workspaceModel`
- output:
  - `subscriptionState`
- dependencies:
  - `Define billing plan schema`  | סטטוס: 🔴 לא בוצע
  - `Billing & Revenue Metrics`
- connects_to: `Project State`

4. `Create usage-to-billing mapper`  | סטטוס: 🔴 לא בוצע
- description: למפות usage בפועל ל־billable units כמו active workspaces, AI consumption, builds או premium actions
- input:
  - `costSummary`
  - `billingPlanSchema`
- output:
  - `billableUsage`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Define billing plan schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create checkout and subscription API`  | סטטוס: 🔴 לא בוצע
- description: לבנות API ליצירת checkout, שדרוג plan, ביטול subscription וניהול billing details
- input:
  - `workspaceId`
  - `billingInput`
- output:
  - `billingPayload`
- dependencies:
  - `Create subscription lifecycle module`  | סטטוס: 🔴 לא בוצע
  - `Identity & Auth`
- connects_to: `Project State`

6. `Create billing enforcement guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שחוסם שימוש מחוץ ל־entitlements או מעל limits ומציע upgrade path מתאים
- input:
  - `entitlementDecision`
  - `billableUsage`
- output:
  - `billingGuardDecision`
- dependencies:
  - `Create entitlement resolver`  | סטטוס: 🔴 לא בוצע
  - `Create usage-to-billing mapper`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

7. `Create billing settings and plan selection screen model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model למסכי plan selection, usage visibility, invoices ו־upgrade prompts
- input:
  - `subscriptionState`
  - `billingGuardDecision`
- output:
  - `billingSettingsModel`
- dependencies:
  - `Create checkout and subscription API`  | סטטוס: 🔴 לא בוצע
  - `UI / UX Foundation`
- connects_to: `Project State`

---

### שלב 6.75 — Nexus Product Analytics
המטרה: למדוד את המוצר עצמו, לא רק את הפרויקטים שהוא מנהל, כדי להבין יצירה, ביצוע, חיסכון בזמן, חזרת משתמשים ותשלום.

#### `Project Creation Metrics`

משימות טכניות:

1. `Define project creation event schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לאירועי יצירת פרויקט דרך Nexus
- input:
  - `userId`
  - `projectId`
  - `creationSource`
- output:
  - `projectCreationEvent`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create project creation tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמקליט כל יצירת פרויקט ומעדכן counters מצטברים
- input:
  - `projectCreationEvent`
- output:
  - `projectCreationMetric`
- dependencies:
  - `Define project creation event schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create project creation aggregation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregation לפי יום, שבוע, משתמש ומקור יצירה
- input:
  - `projectCreationMetrics`
- output:
  - `projectCreationSummary`
- dependencies:
  - `Create project creation tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Task Execution Metrics`

משימות טכניות:

1. `Define task execution metric schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למטריקות של משימות שבוצעו בפועל
- input:
  - `taskResult`
  - `runtimeEvent`
- output:
  - `taskExecutionMetric`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create task execution tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שסופר משימות completed, failed, retried ו־blocked
- input:
  - `taskExecutionMetric`
- output:
  - `taskExecutionCounters`
- dependencies:
  - `Define task execution metric schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create task throughput aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregation לפי פרויקט, lane, agent ופרקי זמן
- input:
  - `taskExecutionCounters`
- output:
  - `taskThroughputSummary`
- dependencies:
  - `Create task execution tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Time Saved Estimation`

משימות טכניות:

1. `Define time saved estimation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לחישוב זמן שנחסך מול baseline
- input:
  - `taskType`
  - `executionDuration`
  - `baselineEstimate`
- output:
  - `timeSavedMetric`
- dependencies:
  - `Task Execution Metrics`
- connects_to: `Project State`

2. `Create baseline effort estimator`  | סטטוס: 🔴 לא בוצע
- description: לבנות estimator שמחשב זמן ידני משוער לפי task type, domain ו־scope
- input:
  - `taskType`
  - `domain`
  - `context`
- output:
  - `baselineEstimate`
- dependencies:
  - `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create time saved calculator`  | סטטוס: 🔴 לא בוצע
- description: לבנות calculator שמחשב `timeSaved` לכל משימה ולכל פרויקט
- input:
  - `executionDuration`
  - `baselineEstimate`
- output:
  - `timeSaved`
- dependencies:
  - `Create baseline effort estimator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create productivity summary aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregation של זמן שנחסך לפי משתמש, פרויקט ותקופה
- input:
  - `timeSavedMetrics`
- output:
  - `productivitySummary`
- dependencies:
  - `Create time saved calculator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `User Activity & Retention`

משימות טכניות:

1. `Define user activity event schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לאירועי שימוש במוצר עצמו
- input:
  - `userId`
  - `sessionId`
  - `activityType`
- output:
  - `userActivityEvent`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create session activity tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לסשנים, חזרות, active sessions ו־last seen
- input:
  - `userActivityEvent`
- output:
  - `userSessionMetric`
- dependencies:
  - `Define user activity event schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create returning user resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אם משתמש הוא returning user לפי windows מוגדרים
- input:
  - `userSessionMetrics`
- output:
  - `returningUserMetric`
- dependencies:
  - `Create session activity tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create retention metrics aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregation של D1/D7/D30, repeat usage ו־retention cohorts
- input:
  - `returningUserMetrics`
- output:
  - `retentionSummary`
- dependencies:
  - `Create returning user resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create retention and re-engagement planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner מפורש לשימור, reactivation ו־ongoing re-engagement לפי cohorts, drop-offs ו־product milestones
- input:
  - `retentionSummary`
  - `activationDropOffs`
- output:
  - `retentionLifecyclePlan`
- dependencies:
  - `Create retention metrics aggregator`  | סטטוס: 🔴 לא בוצע
  - `Create re-engagement trigger planner`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Billing & Revenue Metrics`

משימות טכניות:

1. `Define billing event schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לאירועי תשלום, conversion ו־subscription state
- input:
  - `userId`
  - `billingAction`
  - `amount`
- output:
  - `billingEvent`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Project State`

2. `Create paying user tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שסופר משתמשים משלמים, converted users ו־active subscriptions
- input:
  - `billingEvents`
- output:
  - `payingUserMetrics`
- dependencies:
  - `Define billing event schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create revenue summary aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregation של revenue, ARPU בסיסי ו־conversion counts
- input:
  - `payingUserMetrics`
- output:
  - `revenueSummary`
- dependencies:
  - `Create paying user tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Nexus Analytics Dashboard`

משימות טכניות:

1. `Define analytics dashboard schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־product analytics dashboard של Nexus
- input:
  - `analyticsMetrics`
- output:
  - `analyticsDashboardSchema`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`

2. `Create analytics summary assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמאגד project creation, tasks, time saved, retention ו־revenue ל־summary אחד
- input:
  - `projectCreationSummary`
  - `taskThroughputSummary`
  - `productivitySummary`
  - `retentionSummary`
  - `revenueSummary`
- output:
  - `analyticsSummary`
- dependencies:
  - `Create revenue summary aggregator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create analytics API`  | סטטוס: 🔴 לא בוצע
- description: לבנות endpoints לקבלת metrics ו־summaries של Nexus עצמו
- input:
  - `timeRange`
  - `filters`
- output:
  - `analyticsPayload`
- dependencies:
  - `Create analytics summary assembler`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create analytics dashboard screen`  | סטטוס: 🔴 לא בוצע
- description: לבנות מסך dashboard פנימי למדדי Nexus
- input:
  - `analyticsPayload`
- output:
  - `analyticsDashboard`
- dependencies:
  - `Create analytics API`  | סטטוס: 🔴 לא בוצע
  - `UI / UX Foundation`
- connects_to: `Execution Surface`

#### `Product Feedback Loop`

משימות טכניות:

1. `Define feature success schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למדידת הצלחת פיצ'ר לפי activation, repeat usage, completion quality, override rate ו־drop-off points
- input:
  - `featureUsageEvents`
  - `analyticsSummary`
- output:
  - `featureSuccessMetric`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`

2. `Create feature success tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמחשב עבור כל feature את adoption, stickiness, success rate ו־friction indicators
- input:
  - `featureSuccessMetric`
  - `userActivityEvent`
- output:
  - `featureSuccessSummary`
- dependencies:
  - `Define feature success schema`  | סטטוס: 🔴 לא בוצע
  - `User Activity & Retention`
- connects_to: `Project State`

3. `Create product iteration feedback engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחזיר recommendations לשיפור flows, features ו־defaults לפי feature success, outcome scores ו־user behavior
- input:
  - `featureSuccessSummary`
  - `outcomeFeedbackState`
  - `analyticsSummary`
- output:
  - `productIterationInsights`
- dependencies:
  - `Create feature success tracker`  | סטטוס: 🔴 לא בוצע
  - `Create outcome feedback loop`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Outcome & Goal Evaluation`

משימות טכניות:

1. `Define outcome evaluation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להערכת outcomes של פעולות ברמת execution, product, user value ו־business impact
- input:
  - `actionResult`
  - `projectState`
  - `analyticsSummary`
- output:
  - `outcomeEvaluation`
- dependencies:
  - `Task Execution Metrics`
  - `Nexus Product Analytics`
- connects_to: `Project State`

2. `Create action success scoring engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחשב success score אמיתי לפעולה לפי outcome quality, side effects, reversals ו־user acceptance
- input:
  - `outcomeEvaluation`
  - `taskResult`
- output:
  - `actionSuccessScore`
- dependencies:
  - `Define outcome evaluation schema`  | סטטוס: 🔴 לא בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

3. `Create outcome feedback loop`  | סטטוס: 🔴 לא בוצע
- description: לבנות loop שמחזיר success scores ו־failure patterns חזרה ל־learning, recommendation ו־priority systems
- input:
  - `actionSuccessScore`
  - `projectLearningRecords`
- output:
  - `outcomeFeedbackState`
- dependencies:
  - `Create action success scoring engine`  | סטטוס: 🔴 לא בוצע
  - `Learning Layer`
- connects_to: `Project State`

4. `Create goal progress evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator שמודד כמה התקדמנו למטרה המוצהרת של הפרויקט לפי outcomes, blockers, throughput ו־first value progression
- input:
  - `projectGoal`
  - `outcomeFeedbackState`
  - `taskThroughputSummary`
- output:
  - `goalProgressState`
- dependencies:
  - `Create outcome feedback loop`  | סטטוס: 🔴 לא בוצע
  - `Universal Project Lifecycle`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

5. `Create milestone tracking system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system שממפה milestones קריטיים, עוקב אחרי completion שלהם ומציג drift בין milestone plan לבין actual outcome
- input:
  - `goalProgressState`
  - `lifecycleMilestones`
- output:
  - `milestoneTracking`
- dependencies:
  - `Create lifecycle milestone generator`  | סטטוס: 🟢 בוצע
  - `Create goal progress evaluator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Meta Orchestration Layer`

משימות טכניות:

1. `Define post-execution evaluation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לזרימה שאחרי execution כולל consistency, outcome, bottleneck, cost ו־feedback signals
- input:
  - `executionResult`
  - `projectState`
  - `analyticsSummary`
- output:
  - `postExecutionEvaluation`
- dependencies:
  - `Outcome & Goal Evaluation`
  - `Execution Safety & Idempotency`
- connects_to: `Project State`

2. `Create post-execution evaluation pipeline`
- סטטוס: `🔴 לא בוצע`
- description: לבנות pipeline שמריץ לפי סדר consistency validation, outcome evaluation, bottleneck analysis ו־feedback assembly אחרי כל execution משמעותי
- input:
  - `postExecutionEvaluation`
  - `executionConsistencyReport`
  - `outcomeEvaluation`
  - `systemBottleneckSummary`
- output:
  - `postExecutionReport`
- dependencies:
  - `Define post-execution evaluation schema`  | סטטוס: `🔴 לא בוצע`
  - `Create execution consistency validator`  | סטטוס: `🔴 לא בוצע`
  - `Create system bottleneck detector`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`

3. `Create cross-layer feedback orchestrator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות orchestrator שמפיץ insights מתוך post-execution report ל־learning, recommendation, cost ו־product iteration layers
- input:
  - `postExecutionReport`
  - `outcomeFeedbackState`
  - `productIterationInsights`
- output:
  - `crossLayerFeedbackState`
- dependencies:
  - `Create post-execution evaluation pipeline`  | סטטוס: `🔴 לא בוצע`
  - `Create outcome feedback loop`  | סטטוס: `🔴 לא בוצע`
  - `Create product iteration feedback engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`

4. `Create adaptive execution loop`
- סטטוס: `🔴 לא בוצע`
- description: לבנות loop שמעדכן execution strategy, action ordering, provider choice או approval posture לפי cross-layer feedback מצטבר
- input:
  - `crossLayerFeedbackState`
  - `decisionIntelligence`
  - `budgetDecision`
- output:
  - `adaptiveExecutionDecision`
- dependencies:
  - `Create cross-layer feedback orchestrator`  | סטטוס: `🔴 לא בוצע`
  - `Cost-Aware Decision Engine`
- connects_to: `Execution Surface`

5. `Create system optimization cycle`
- סטטוס: `🔴 לא בוצע`
- description: לבנות cycle מחזורי שמרכז adaptive decisions, reliability signals ו־product insights לתוכנית אופטימיזציה אחת של המערכת
- input:
  - `adaptiveExecutionDecision`
  - `serviceReliabilityDashboard`
  - `productIterationInsights`
- output:
  - `systemOptimizationPlan`
- dependencies:
  - `Create adaptive execution loop`  | סטטוס: `🔴 לא בוצע`
  - `Create service reliability dashboard model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`

---

### שלב 6.8 — Nexus Product Go-To-Market
המטרה: לבנות מעטפת שיווקית והפצה עבור Nexus עצמו כמוצר, כדי שאנשים יגלו אותו, יבינו אותו, יירשמו, יתנסו ויחזרו.

#### `Product Positioning & Messaging`

משימות טכניות:

1. `Define Nexus positioning schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־positioning של Nexus כולל audience, problem, promise, differentiation ו־proof points
- input:
  - `productVision`
  - `targetAudience`
  - `competitiveContext`
- output:
  - `nexusPositioning`
- dependencies:
  - `Business Context Layer`  | סטטוס: 🟢 בוצע
  - `Content Strategy Engine`
- connects_to: `Project State`

2. `Create core messaging framework`  | סטטוס: 🔴 לא בוצע
- description: לבנות framework להודעות הליבה של Nexus כולל headline, subheadline, value props, objections ו־CTA angles
- input:
  - `nexusPositioning`
- output:
  - `messagingFramework`
- dependencies:
  - `Define Nexus positioning schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create audience-specific messaging variants`  | סטטוס: 🔴 לא בוצע
- description: לבנות וריאציות messaging לקהלים שונים כמו indie builders, agencies, founders ו־operators
- input:
  - `messagingFramework`
  - `audienceSegments`
- output:
  - `messagingVariants`
- dependencies:
  - `Create core messaging framework`  | סטטוס: 🔴 לא בוצע
  - `Create audience segmentation builder`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create objection and FAQ map`  | סטטוס: 🔴 לא בוצע
- description: לבנות מפת objections, trust concerns ו־FAQ product answers עבור Nexus
- input:
  - `messagingFramework`
  - `userFeedback`
- output:
  - `objectionMap`
  - `faqMap`
- dependencies:
  - `Create core messaging framework`  | סטטוס: 🔴 לא בוצע
  - `Learning Layer`
- connects_to: `Project State`

5. `Create product CTA strategy`  | סטטוס: 🔴 לא בוצע
- description: להגדיר אילו CTAs מובילים את Nexus כמו join waitlist, request access, start project או book demo
- input:
  - `messagingFramework`
  - `activationGoals`
- output:
  - `productCtaStrategy`
- dependencies:
  - `Create core messaging framework`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Analytics`
- connects_to: `Project State`

#### `Product Website & Conversion Funnel`

משימות טכניות:

1. `Define Nexus website schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למבנה האתר של Nexus כולל home, product, pricing, FAQ ו־conversion pages
- input:
  - `messagingFramework`
  - `productCtaStrategy`
- output:
  - `nexusWebsiteSchema`
- dependencies:
  - `Product Positioning & Messaging`
  - `UI / UX Foundation`
- connects_to: `Project State`

2. `Create landing page information architecture`  | סטטוס: 🔴 לא בוצע
- description: לבנות information architecture לדף הבית וה־landing pages של Nexus כולל sections, proof blocks ו־CTA placements
- input:
  - `nexusWebsiteSchema`
  - `messagingFramework`
- output:
  - `landingPageIa`
- dependencies:
  - `Define Nexus website schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create Nexus website copy pack`  | סטטוס: 🔴 לא בוצע
- description: לבנות חבילת copy מלאה לאתר של Nexus כולל headline, subheadline, sections, FAQ ו־microcopy
- input:
  - `landingPageIa`
  - `messagingVariants`
  - `faqMap`
- output:
  - `websiteCopyPack`
- dependencies:
  - `Create landing page copy generator`  | סטטוס: 🔴 לא בוצע
  - `Create objection and FAQ map`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create website conversion flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow קנוני של מבקר -> CTA -> signup/waitlist/access request -> onboarding entry
- input:
  - `productCtaStrategy`
  - `authenticationState`
- output:
  - `websiteConversionFlow`
- dependencies:
  - `Identity & Auth`
  - `Product Website & Conversion Funnel`
- connects_to: `Project State`

5. `Create waitlist and access request module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול לקליטת משתמשים לרשימת המתנה, access requests ו־status updates
- input:
  - `visitorInput`
  - `websiteConversionFlow`
- output:
  - `waitlistRecord`
  - `accessRequest`
- dependencies:
  - `Create website conversion flow`  | סטטוס: 🔴 לא בוצע
  - `Notification System`
- connects_to: `Project State`

6. `Create website experiment and CTA test layer`  | סטטוס: 🔴 לא בוצע
- description: לבנות שכבה לניסויי CTA, headlines ו־section variants באתר של Nexus
- input:
  - `websiteCopyPack`
  - `productCtaStrategy`
- output:
  - `websiteExperimentPlan`
- dependencies:
  - `Create website conversion flow`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Analytics`
- connects_to: `Project State`

7. `Create trust proof block builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות builder ל־proof blocks, credibility signals, demos, testimonials ו־trust messaging עבור דפי הכניסה של Nexus
- input:
  - `messagingFramework`
  - `objectionMap`
- output:
  - `trustProofBlocks`
- dependencies:
  - `Create landing page information architecture`  | סטטוס: 🔴 לא בוצע
  - `Create objection and FAQ map`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create persona-specific landing variant resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שבוחר variant נכון של landing page לפי persona, channel intent ו־entry context
- input:
  - `messagingVariants`
  - `visitorContext`
  - `acquisitionSourceMetrics`
- output:
  - `landingVariantDecision`
- dependencies:
  - `Create audience-specific messaging variants`  | סטטוס: 🔴 לא בוצע
  - `Create acquisition source tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Landing, Access & App Entry Flow`

משימות טכניות:

1. `Define product delivery model schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למודל האספקה של Nexus כמוצר web-first, כולל public site, app entry, future CLI ו־future desktop wrappers
- input:
  - `productStrategy`
  - `distributionConstraints`
- output:
  - `productDeliveryModel`
- dependencies:
  - `Product Positioning & Messaging`
  - `Application Runtime Layer`
- connects_to: `Project State`

2. `Create public site and app boundary model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל ברור שמפריד בין האתר הציבורי של Nexus לבין אזור האפליקציה, כולל routes, trust boundaries ו־handoff points
- input:
  - `productDeliveryModel`
  - `nexusWebsiteSchema`
- output:
  - `siteAppBoundary`
- dependencies:
  - `Define product delivery model schema`  | סטטוס: 🔴 לא בוצע
  - `Define Nexus website schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create access mode resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אם Nexus עובד ב־open access, waitlist, invite only או request access לפי stage של המוצר
- input:
  - `productDeliveryModel`
  - `launchStage`
  - `visitorContext`
- output:
  - `accessModeDecision`
- dependencies:
  - `Define product delivery model schema`  | סטטוס: 🔴 לא בוצע
  - `Create waitlist and access request module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create public landing to auth handoff flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות handoff קנוני מה־landing page ל־signup, login, waitlist או access request בלי לשבור את ההקשר השיווקי
- input:
  - `siteAppBoundary`
  - `accessModeDecision`
  - `productCtaStrategy`
- output:
  - `landingAuthHandoff`
- dependencies:
  - `Create public site and app boundary model`  | סטטוס: 🔴 לא בוצע
  - `Create access mode resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create app entry gate resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע אם משתמש נכנס ישר ל־app, עובר דרך access gate, חוזר ל־login או מנותב ל־waitlist state
- input:
  - `landingAuthHandoff`
  - `authenticationState`
  - `sessionState`
- output:
  - `appEntryDecision`
- dependencies:
  - `Create session and token management`  | סטטוס: 🔴 לא בוצע
  - `Create public landing to auth handoff flow`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create post-login destination resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמחליט אם אחרי login המשתמש נוחת ב־dashboard, onboarding resume, waitlist status, approval inbox או first project kickoff
- input:
  - `appEntryDecision`
  - `userSessionMetric`
  - `projectState`
- output:
  - `postLoginDestination`
- dependencies:
  - `Create app entry gate resolver`  | סטטוס: 🔴 לא בוצע
  - `User Activity & Retention`
- connects_to: `Project State`

7. `Create first project kickoff flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow מפורש שבו משתמש חדש עובר מה־dashboard או ה־entry destination אל יצירת הפרויקט הראשון וה־onboarding הראשון
- input:
  - `postLoginDestination`
  - `activationFunnel`
  - `onboardingSession`
- output:
  - `firstProjectKickoff`
- dependencies:
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
  - `Define activation funnel schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create landing-to-dashboard funnel assembler`  | סטטוס: 🔴 לא בוצע
- description: להרכיב view model מלא של הזרימה מ־landing דרך access/login ועד dashboard ו־first project
- input:
  - `landingAuthHandoff`
  - `appEntryDecision`
  - `postLoginDestination`
  - `firstProjectKickoff`
- output:
  - `landingToDashboardFlow`
- dependencies:
  - `Create first project kickoff flow`  | סטטוס: 🔴 לא בוצע
  - `Create post-login destination resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create app landing entry experience`  | סטטוס: 🔴 לא בוצע
- description: לבנות חוויית כניסה ראשית ל־app עם value framing, CTAs, first-visit states ו־handoff ברור ל־signup, login או create project
- input:
  - `siteAppBoundary`
  - `accessModeDecision`
  - `productCtaStrategy`
- output:
  - `appLandingEntry`
- dependencies:
  - `Create public site and app boundary model`  | סטטוס: 🔴 לא בוצע
  - `Initial Nexus Screens`
- connects_to: `Execution Surface`

10. `Create entry state variants and redirects`  | סטטוס: 🔴 לא בוצע
- description: לבנות מצבי UI ו־redirects למשתמש חדש, משתמש מחובר בלי פרויקט, משתמש עם פרויקט קיים ו־session expired
- input:
  - `appEntryDecision`
  - `postLoginDestination`
- output:
  - `entryStateVariants`
- dependencies:
  - `Create app entry gate resolver`  | סטטוס: 🔴 לא בוצע
  - `Create app landing entry experience`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

11. `Create entry loading and recovery states`  | סטטוס: 🔴 לא בוצע
- description: לבנות מצבי loading, bootstrap failure, empty workspace ו־resume recovery למסך הכניסה הראשי של האפליקציה
- input:
  - `appEntryDecision`
  - `sessionState`
- output:
  - `entryRecoveryState`
- dependencies:
  - `Create entry state variants and redirects`  | סטטוס: 🔴 לא בוצע
  - `Workspace Recovery & Resume`
- connects_to: `Execution Surface`

12. `Create app entry trust and orientation panel`  | סטטוס: 🔴 לא בוצע
- description: לבנות panel שמסביר למשתמש החדש מה Nexus עושה, למה לסמוך עליו, ומה יקרה אחרי הלחיצה הראשונה
- input:
  - `appLandingEntry`
  - `trustProofBlocks`
- output:
  - `entryOrientationPanel`
- dependencies:
  - `Create app landing entry experience`  | סטטוס: 🔴 לא בוצע
  - `Create trust proof block builder`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

13. `Create entry decision support flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow שעוזר למשתמש לבחור בין signup, demo, waitlist, login או create first project לפי readiness, trust level ו־access mode
- input:
  - `entryStateVariants`
  - `accessModeDecision`
  - `visitorContext`
- output:
  - `entryDecisionSupport`
- dependencies:
  - `Create entry state variants and redirects`  | סטטוס: 🔴 לא בוצע
  - `Create app entry trust and orientation panel`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

#### `Product-Led Onboarding Marketing`

משימות טכניות:

1. `Define activation funnel schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־activation funnel של Nexus מההרשמה עד first project success
- input:
  - `websiteConversionFlow`
  - `onboardingFlow`
- output:
  - `activationFunnel`
- dependencies:
  - `Onboarding Engine`
  - `Product Website & Conversion Funnel`
- connects_to: `Project State`

2. `Create first value milestone mapper`  | סטטוס: 🔴 לא בוצע
- description: למפות milestones כמו signup, first project, first task, first execution ו־first visible result
- input:
  - `activationFunnel`
  - `projectJourneys`
- output:
  - `activationMilestones`
- dependencies:
  - `Define activation funnel schema`  | סטטוס: 🔴 לא בוצע
  - `User Flow System`
- connects_to: `Project State`

3. `Create onboarding marketing copy flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות רצף מסרים ל־signup confirmation, welcome, activation prompts ו־drop-off recovery
- input:
  - `activationFunnel`
  - `messagingFramework`
- output:
  - `onboardingMarketingFlow`
- dependencies:
  - `Create email sequence copy generator`  | סטטוס: 🔴 לא בוצע
  - `Define activation funnel schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create activation drop-off detector`  | סטטוס: 🔴 לא בוצע
- description: לבנות detector שמזהה משתמשים שנתקעו בין signup לבין first value ומסווג את סיבת התקיעה
- input:
  - `activationMilestones`
  - `userActivityEvents`
- output:
  - `activationDropOffs`
- dependencies:
  - `User Activity & Retention`
  - `Create first value milestone mapper`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create re-engagement trigger planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמחליט מתי לשלוח nudges, emails או in-app prompts כדי להחזיר משתמש ל־activation
- input:
  - `activationDropOffs`
  - `notificationPreferences`
- output:
  - `reEngagementPlan`
- dependencies:
  - `Create activation drop-off detector`  | סטטוס: 🔴 לא בוצע
  - `Notification System`
- connects_to: `Project State`

#### `Content & Launch Engine`

משימות טכניות:

1. `Create Nexus content strategy profile`  | סטטוס: 🔴 לא בוצע
- description: לבנות profile ייעודי לאסטרטגיית התוכן של Nexus כולל pillars, formats, founder voice ו־channel fit
- input:
  - `nexusPositioning`
  - `messagingVariants`
- output:
  - `nexusContentStrategy`
- dependencies:
  - `Content Strategy Engine`
  - `Product Positioning & Messaging`
- connects_to: `Project State`

2. `Create launch content calendar`  | סטטוס: 🔴 לא בוצע
- description: לבנות editorial calendar לתקופת pre-launch, launch ו־post-launch של Nexus
- input:
  - `nexusContentStrategy`
  - `launchTimeline`
- output:
  - `launchContentCalendar`
- dependencies:
  - `Create editorial calendar builder`  | סטטוס: 🔴 לא בוצע
  - `Create Nexus content strategy profile`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create founder and product story asset builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות assets שמספרים את הסיפור של Nexus, הבעיה שהוא פותר והמסע של הבנייה שלו
- input:
  - `nexusPositioning`
  - `launchContentCalendar`
- output:
  - `storyAssets`
- dependencies:
  - `Create Nexus content strategy profile`  | סטטוס: 🔴 לא בוצע
  - `Marketing Asset Generation`
- connects_to: `Project State`

4. `Create social and community content pack`  | סטטוס: 🔴 לא בוצע
- description: לבנות pack של posts, threads, community intros ו־conversation starters להשקת Nexus
- input:
  - `storyAssets`
  - `launchContentCalendar`
- output:
  - `socialCommunityPack`
- dependencies:
  - `Create ad copy generator`  | סטטוס: 🔴 לא בוצע
  - `Create founder and product story asset builder`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create product demo and proof asset plan`  | סטטוס: 🔴 לא בוצע
- description: לבנות plan לנכסי proof כמו demo videos, screenshots, walkthroughs ו־result snapshots
- input:
  - `websiteCopyPack`
  - `activationMilestones`
- output:
  - `productProofPlan`
- dependencies:
  - `Create Nexus website copy pack`  | סטטוס: 🔴 לא בוצע
  - `Product-Led Onboarding Marketing`
- connects_to: `Project State`

#### `Launch Campaign System`

משימות טכניות:

1. `Create Nexus launch campaign brief`  | סטטוס: 🔴 לא בוצע
- description: לבנות brief לקמפיין ההשקה הראשון של Nexus כולל audience, message, channels, budget assumption ו־success criteria
- input:
  - `nexusPositioning`
  - `launchGoals`
- output:
  - `launchCampaignBrief`
- dependencies:
  - `Campaign Planning System`
  - `Product Positioning & Messaging`
- connects_to: `Project State`

2. `Create launch channel rollout plan`  | סטטוס: 🔴 לא בוצע
- description: לבנות rollout plan לפי ערוצים כמו website, email, X, LinkedIn, communities ו־waitlist updates
- input:
  - `launchCampaignBrief`
  - `socialCommunityPack`
- output:
  - `launchRolloutPlan`
- dependencies:
  - `Create Nexus launch campaign brief`  | סטטוס: 🔴 לא בוצע
  - `Marketing Distribution Orchestrator`
- connects_to: `Project State`

3. `Create launch asset readiness checklist`  | סטטוס: 🔴 לא בוצע
- description: לבנות checklist שמוודא שכל ה־assets, copy, CTA flows, proof elements ו־tracking מוכנים לפני push
- input:
  - `launchRolloutPlan`
  - `productProofPlan`
- output:
  - `launchReadinessChecklist`
- dependencies:
  - `Create launch channel rollout plan`  | סטטוס: 🔴 לא בוצע
  - `Create product demo and proof asset plan`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create launch draft publishing plan`  | סטטוס: 🔴 לא בוצע
- description: לבנות plan שמתרגם rollout ל־drafts, scheduled content, waitlist messages ו־campaign pushes
- input:
  - `launchRolloutPlan`
  - `launchContentCalendar`
- output:
  - `launchPublishingPlan`
- dependencies:
  - `Create campaign draft publisher`  | סטטוס: 🔴 לא בוצע
  - `Create launch channel rollout plan`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create launch feedback intake module`  | סטטוס: 🔴 לא בוצע
- description: לבנות intake לתגובות משתמשים, replies, objections ו־early signal clustering מההשקה
- input:
  - `launchPublishingPlan`
  - `feedbackSignals`
- output:
  - `launchFeedbackSummary`
- dependencies:
  - `Launch Campaign System`
  - `Learning Layer`
- connects_to: `Project State`

6. `Create go-to-market planning model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model מפורש לתוכנית go-to-market של Nexus שמחברת positioning, channels, rollout, activation ו־success criteria
- input:
  - `launchCampaignBrief`
  - `websiteConversionFlow`
  - `activationFunnel`
- output:
  - `goToMarketPlan`
- dependencies:
  - `Create Nexus launch campaign brief`  | סטטוס: 🔴 לא בוצע
  - `Product-Led Onboarding Marketing`
- connects_to: `Project State`

7. `Create promotion execution planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner מפורש להרצת promotion בערוצים השונים כולל schedule, assets, approvals ו־distribution responsibilities
- input:
  - `launchRolloutPlan`
  - `launchPublishingPlan`
- output:
  - `promotionExecutionPlan`
- dependencies:
  - `Create launch draft publishing plan`  | סטטוס: 🔴 לא בוצע
  - `Marketing Distribution Orchestrator`
- connects_to: `Project State`

8. `Create launch marketing execution tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמראה מה כבר פורסם, מה בתור, מה נכשל ומה דורש התערבות ידנית בהרצת ההשקה השיווקית
- input:
  - `promotionExecutionPlan`
  - `launchFeedbackSummary`
- output:
  - `launchMarketingExecution`
- dependencies:
  - `Create promotion execution planner`  | סטטוס: 🔴 לא בוצע
  - `Create launch feedback intake module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `GTM Measurement & Feedback`

משימות טכניות:

1. `Define GTM metric schema for Nexus`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד למטריקות go-to-market של Nexus כמו visits, signups, activation, waitlist conversion ו־campaign attribution
- input:
  - `campaignPlan`
  - `websiteConversionFlow`
- output:
  - `gtmMetricSchema`
- dependencies:
  - `Nexus Product Analytics`
  - `Launch Campaign System`
- connects_to: `Project State`

2. `Create acquisition source tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker למקורות תנועה והרשמה כמו direct, community, social, referrals ו־campaign links
- input:
  - `projectCreationEvent`
  - `userActivityEvent`
  - `attributionMetadata`
- output:
  - `acquisitionSourceMetrics`
- dependencies:
  - `Define GTM metric schema for Nexus`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create website-to-activation funnel analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמחבר ביקור באתר, signup, onboarding, first project ו־first activation
- input:
  - `acquisitionSourceMetrics`
  - `activationMilestones`
- output:
  - `websiteActivationFunnel`
- dependencies:
  - `Create acquisition source tracker`  | סטטוס: 🔴 לא בוצע
  - `Product-Led Onboarding Marketing`
- connects_to: `Project State`

4. `Create launch performance dashboard assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שמרכז launch KPIs, website conversion, channel performance ו־activation insights במסך אחד
- input:
  - `websiteActivationFunnel`
  - `launchFeedbackSummary`
  - `revenueSummary`
- output:
  - `launchPerformanceDashboard`
- dependencies:
  - `Create website-to-activation funnel analyzer`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Analytics`
- connects_to: `Project State`

5. `Create GTM optimization loop`  | סטטוס: 🔴 לא בוצע
- description: לבנות loop שמציע שיפורים ל־positioning, site copy, CTA strategy, channels ו־activation flow לפי נתוני אמת
- input:
  - `launchPerformanceDashboard`
  - `launchFeedbackSummary`
- output:
  - `gtmOptimizationPlan`
- dependencies:
  - `Create launch performance dashboard assembler`  | סטטוס: 🔴 לא בוצע
  - `Create optimization recommendation engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create first-touch attribution recorder`  | סטטוס: 🔴 לא בוצע
- description: לבנות recorder ששומר first-touch source, landing variant, CTA path ו־anonymous visit context עוד לפני auth או signup
- input:
  - `visitorContext`
  - `landingVariantDecision`
  - `productCtaStrategy`
- output:
  - `firstTouchAttribution`
- dependencies:
  - `Create persona-specific landing variant resolver`  | סטטוס: 🔴 לא בוצע
  - `Create product CTA strategy`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create pre-auth conversion event collector`  | סטטוס: 🔴 לא בוצע
- description: לבנות collector לאירועי pre-auth כמו landing views, CTA clicks, waitlist attempts, demo requests ו־auth handoff starts
- input:
  - `firstTouchAttribution`
  - `landingAuthHandoff`
- output:
  - `preAuthConversionEvents`
- dependencies:
  - `Create first-touch attribution recorder`  | סטטוס: 🔴 לא בוצע
  - `Create public landing to auth handoff flow`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create conversion analytics model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model מפורש ל־conversion analytics שמחבר visits, CTA clicks, signup starts, activation ו־drop-off reasons
- input:
  - `preAuthConversionEvents`
  - `websiteActivationFunnel`
- output:
  - `conversionAnalytics`
- dependencies:
  - `Create pre-auth conversion event collector`  | סטטוס: 🔴 לא בוצע
  - `Create website-to-activation funnel analyzer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create growth loop management state`  | סטטוס: 🔴 לא בוצע
- description: לבנות state ניהולי שמרכז hypotheses, experiments, conversions, retention moves ו־next growth actions ללולאת שיפור מתמשכת
- input:
  - `continuousGrowthLoop`
  - `conversionAnalytics`
- output:
  - `growthLoopManagement`
- dependencies:
  - `Create continuous growth loop engine`  | סטטוס: 🔴 לא בוצע
  - `Create conversion analytics model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

---

### שלב 6.85 — Owner Control Plane
המטרה: לבנות שכבת בעלים פנימית בתוך Nexus, לא כמערכת נפרדת, כדי לרכז החלטות, שגרה, תפעול, סיכונים, אבטחה ותמונת מצב מלאה של המוצר.

#### `Owner Control Center`

משימות טכניות:

1. `Define owner control plane schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־owner mode כולל owner identity, privileged views, critical KPIs, alerts ו־decision queues
- input:
  - `ownerContext`
  - `platformState`
- output:
  - `ownerControlPlane`
- dependencies:
  - `Identity & Auth`
  - `Workspace & Access Control`
- connects_to: `Project State`

2. `Create owner control center`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler ראשי שמרכז metrics, incidents, roadmap state, security signals ו־recommended actions לבעלים
- input:
  - `ownerControlPlane`
  - `analyticsSummary`
  - `platformTrace`
- output:
  - `ownerControlCenter`
- dependencies:
  - `Define owner control plane schema`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Analytics`
  - `Platform Observability`
- connects_to: `Project State`

3. `Create daily overview generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator לתמונת מצב יומית של מה חשוב היום, מה השתנה, מה נתקע ומה דורש החלטה
- input:
  - `ownerControlCenter`
  - `platformLogs`
  - `incidentAlert`
- output:
  - `dailyOwnerOverview`
- dependencies:
  - `Create owner control center`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create owner priority engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמדרג מה הכי חשוב לבעלים עכשיו לפי risk, revenue impact, user impact ו־execution urgency
- input:
  - `dailyOwnerOverview`
  - `priorityResolution`
- output:
  - `ownerPriorityQueue`
- dependencies:
  - `Create daily overview generator`  | סטטוס: 🔴 לא בוצע
  - `Strategic Decision Layer`
- connects_to: `Project State`

5. `Create action recommendation system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system שמציע לבעלים את הפעולה הבאה ברמת מוצר, תפעול, כספים, growth או reliability
- input:
  - `ownerPriorityQueue`
  - `ownerControlCenter`
- output:
  - `ownerActionRecommendations`
- dependencies:
  - `Create owner priority engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create owner decision dashboard`  | סטטוס: 🔴 לא בוצע
- description: לבנות dashboard model לבעלים שמרכז החלטות פתוחות, overrides, approvals ו־follow-up actions
- input:
  - `ownerActionRecommendations`
  - `approvalChain`
- output:
  - `ownerDecisionDashboard`
- dependencies:
  - `Create action recommendation system`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

#### `Owner Daily Operations`

משימות טכניות:

1. `Create daily workflow generator`  | סטטוס: 🔴 לא בוצע
- description: לבנות generator לשגרת עבודה יומית של בעלים לפי health, growth, delivery ו־open decisions
- input:
  - `dailyOwnerOverview`
  - `ownerPriorityQueue`
- output:
  - `ownerDailyWorkflow`
- dependencies:
  - `Create daily overview generator`  | סטטוס: 🔴 לא בוצע
  - `Create owner priority engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

2. `Create focus area selector`  | סטטוס: 🔴 לא בוצע
- description: לבנות selector שמכריע אם היום הפוקוס הוא reliability, product, growth, cost, security או delivery
- input:
  - `ownerDailyWorkflow`
  - `ownerControlCenter`
- output:
  - `ownerFocusArea`
- dependencies:
  - `Create daily workflow generator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create task recommendation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמציע לבעלים task list יומית לפי focus area, blockers ו־strategic priorities
- input:
  - `ownerFocusArea`
  - `ownerActionRecommendations`
- output:
  - `ownerTaskList`
- dependencies:
  - `Create focus area selector`  | סטטוס: 🔴 לא בוצע
  - `Create action recommendation system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create owner routine assistant`  | סטטוס: 🔴 לא בוצע
- description: לבנות assistant שמגדיר checklists, recurring reviews ו־end-of-day closure לבעלים
- input:
  - `ownerTaskList`
  - `ownerDailyWorkflow`
- output:
  - `ownerRoutinePlan`
- dependencies:
  - `Create task recommendation engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Owner Business Cockpit`

משימות טכניות:

1. `Create revenue tracking system`  | סטטוס: 🔴 לא בוצע
- description: לבנות owner-facing tracking לרווחים, paid conversions ו־revenue events
- input:
  - `revenueSummary`
  - `subscriptionState`
- output:
  - `ownerRevenueView`
- dependencies:
  - `Billing & Revenue Metrics`
  - `Billing & Monetization System`
- connects_to: `Project State`

2. `Create cost tracking system`  | סטטוס: 🔴 לא בוצע
- description: לבנות owner-facing tracking לעלויות AI, compute, storage, tools ו־providers
- input:
  - `costSummary`
  - `budgetDecision`
- output:
  - `ownerCostView`
- dependencies:
  - `Platform Cost & Usage Control`
- connects_to: `Project State`

3. `Create profit and margin analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמחבר revenue ו־cost ל־margin, contribution ואזורי שחיקה
- input:
  - `ownerRevenueView`
  - `ownerCostView`
- output:
  - `profitMarginSummary`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: 🔴 לא בוצע
  - `Create cost tracking system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create unit economics dashboard`  | סטטוס: 🔴 לא בוצע
- description: לבנות dashboard owner-facing ל־CAC, LTV, payback ו־cost-to-serve assumptions
- input:
  - `unitEconomics`
  - `profitMarginSummary`
- output:
  - `unitEconomicsDashboard`
- dependencies:
  - `Business Viability & Infrastructure`
  - `Create profit and margin analyzer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create cash flow projection engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמקרין cash runway, expected inflows ו־upcoming obligations
- input:
  - `ownerRevenueView`
  - `ownerCostView`
- output:
  - `cashFlowProjection`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: 🔴 לא בוצע
  - `Create cost tracking system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create user analytics dashboard`  | סטטוס: 🔴 לא בוצע
- description: לבנות dashboard owner-facing ל־active users, project creation, retention, churn ו־usage segments
- input:
  - `retentionSummary`
  - `projectCreationSummary`
  - `taskThroughputSummary`
- output:
  - `ownerUserAnalytics`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`

7. `Create feature usage tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לשימוש בפיצ'רים, modules ו־adoption depth ברמת owner view
- input:
  - `userActivityEvents`
  - `analyticsSummary`
- output:
  - `featureUsageSummary`
- dependencies:
  - `User Activity & Retention`
  - `Nexus Analytics Dashboard`
- connects_to: `Project State`

8. `Create decision accuracy tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שבודק אם recommendations, priorities ו־owner decisions הובילו לתוצאות טובות
- input:
  - `ownerActionRecommendations`
  - `actionOutcomeCorrelations`
- output:
  - `decisionAccuracySummary`
- dependencies:
  - `Operating Model & Defensibility`
  - `Owner Control Center`
- connects_to: `Project State`

9. `Create automation impact tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker להשפעת automation על זמן שנחסך, throughput, failures ו־owner workload
- input:
  - `taskThroughputSummary`
  - `productivitySummary`
  - `ownerRoutinePlan`
- output:
  - `automationImpactSummary`
- dependencies:
  - `Task Execution Metrics`
  - `Time Saved Estimation`
  - `Owner Daily Operations`
- connects_to: `Project State`

10. `Create system roadmap tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker owner-facing להתקדמות roadmap, delivery slippage, velocity ו־backlog health
- input:
  - `roadmap`
  - `taskThroughputSummary`
- output:
  - `roadmapTracking`
- dependencies:
  - `Universal Project Lifecycle`  | סטטוס: 🟢 בוצע
  - `Task Execution Metrics`
- connects_to: `Project State`

#### `Owner Operations & Incidents`

משימות טכניות:

1. `Create operations signal aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות aggregator שמרכז health, queue, runtime, security, cost ו־growth anomalies לשכבת owner אחת
- input:
  - `platformTrace`
  - `healthStatus`
  - `budgetDecision`
  - `incidentAlert`
- output:
  - `ownerOperationsSignals`
- dependencies:
  - `Platform Observability`
  - `Platform Cost & Usage Control`
- connects_to: `Project State`

2. `Create critical alert prioritizer`  | סטטוס: 🔴 לא בוצע
- description: לבנות prioritizer שמבדיל בין alerts קריטיים, חשובים ורועשים מדי לפני שהם מגיעים לבעלים
- input:
  - `ownerOperationsSignals`
  - `ownerPriorityQueue`
- output:
  - `prioritizedOwnerAlerts`
- dependencies:
  - `Create operations signal aggregator`  | סטטוס: 🔴 לא בוצע
  - `Create owner priority engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create noise suppression system`  | סטטוס: 🔴 לא בוצע
- description: לבנות מנגנון suppression שמונע spam alerts לבעלים ומעלה רק מה שבאמת דורש תשומת לב
- input:
  - `prioritizedOwnerAlerts`
  - `ownerRoutinePlan`
- output:
  - `ownerAlertFeed`
- dependencies:
  - `Create critical alert prioritizer`  | סטטוס: 🔴 לא בוצע
  - `Owner Daily Operations`
- connects_to: `Project State`

4. `Create incident detection system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system לזיהוי incidents, outages, degradation ו־service anomalies ברמת owner
- input:
  - `ownerOperationsSignals`
  - `platformTrace`
- output:
  - `ownerIncident`
- dependencies:
  - `Create operations signal aggregator`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Project State`

5. `Create outage response manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager לתגובה owner-facing על outage כולל runbook, owner actions ו־communication state
- input:
  - `ownerIncident`
  - `continuityPlan`
- output:
  - `outageResponsePlan`
- dependencies:
  - `Create incident detection system`  | סטטוס: 🔴 לא בוצע
  - `Scalability`
- connects_to: `Project State`

6. `Create incident timeline tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לציר זמן של incident, detection, mitigation, recovery ו־follow-up
- input:
  - `ownerIncident`
  - `platformTrace`
- output:
  - `incidentTimeline`
- dependencies:
  - `Create incident detection system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create root cause analysis system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system שמציע root cause candidates, affected services ו־corrective actions אחרי incident
- input:
  - `incidentTimeline`
  - `causalImpactReport`
- output:
  - `rootCauseSummary`
- dependencies:
  - `Create incident timeline tracker`  | סטטוס: 🔴 לא בוצע
  - `Operating Model & Defensibility`
- connects_to: `Project State`

8. `Create live project monitoring model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model שמרכז health, runtime, deploy status, verification signals ו־live alerts ברמת פרויקט בודד אחרי launch
- input:
  - `platformTrace`
  - `releaseStateUpdate`
  - `ownerIncident`
- output:
  - `liveProjectMonitoring`
- dependencies:
  - `Create incident detection system`  | סטטוס: 🔴 לא בוצע
  - `Release Status Tracking`
- connects_to: `Project State`

9. `Create maintenance task generation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמפיק maintenance tasks מתוך incidents, degraded health, security signals ו־aging operational debt
- input:
  - `liveProjectMonitoring`
  - `incidentTimeline`
- output:
  - `maintenanceBacklog`
- dependencies:
  - `Create live project monitoring model`  | סטטוס: 🔴 לא בוצע
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Graph`

#### `Owner Security & Privileged Access`

משימות טכניות:

1. `Create owner secure authentication system`  | סטטוס: 🔴 לא בוצע
- description: לבנות auth layer מחמירה יותר ל־owner mode עם elevated trust requirements
- input:
  - `userIdentity`
  - `sessionSecurityDecision`
- output:
  - `ownerAuthState`
- dependencies:
  - `Identity & Auth`
  - `Security Hardening`
- connects_to: `Project State`

2. `Create enforced multi-factor authentication`  | סטטוס: 🔴 לא בוצע
- description: לבנות enforcement ל־MFA בבעלים עבור login, privileged mode ו־critical actions
- input:
  - `ownerAuthState`
  - `authenticationState`
- output:
  - `ownerMfaDecision`
- dependencies:
  - `Create owner secure authentication system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create device trust system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system שבודק trusted devices, device risk ו־session posture עבור owner mode
- input:
  - `ownerAuthState`
  - `requestContext`
- output:
  - `deviceTrustDecision`
- dependencies:
  - `Create owner secure authentication system`  | סטטוס: 🔴 לא בוצע
  - `Security Hardening`
- connects_to: `Project State`

4. `Create sensitive action confirmation system`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow אישור נוסף לפעולות כמו override, billing changes, secret access או global toggles
- input:
  - `ownerMfaDecision`
  - `privilegedAuthorityDecision`
- output:
  - `sensitiveActionConfirmation`
- dependencies:
  - `Create enforced multi-factor authentication`  | סטטוס: 🔴 לא בוצע
  - `Project Permission Matrix`
- connects_to: `Execution Surface`

5. `Create step-up authentication system`  | סטטוס: 🔴 לא בוצע
- description: לבנות step-up auth למצבים של risk גבוה, session anomalies או privileged mode activation
- input:
  - `deviceTrustDecision`
  - `securitySignals`
- output:
  - `stepUpAuthDecision`
- dependencies:
  - `Create device trust system`  | סטטוס: 🔴 לא בוצע
  - `Security Hardening`
- connects_to: `Project State`

6. `Create privileged mode system`  | סטטוס: 🔴 לא בוצע
- description: לבנות mode ייעודי לבעלים שמאפשר פעולות רגישות רק לפרק זמן מוגבל ועם audit מלא
- input:
  - `stepUpAuthDecision`
  - `sensitiveActionConfirmation`
- output:
  - `privilegedModeState`
- dependencies:
  - `Create step-up authentication system`  | סטטוס: 🔴 לא בוצע
  - `Create sensitive action confirmation system`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create admin-only access layer`  | סטטוס: 🔴 לא בוצע
- description: לבנות access layer שמבודדת owner-only routes, dashboards ו־system controls משאר ה־workspace flows
- input:
  - `privilegedModeState`
  - `ownerControlPlane`
- output:
  - `ownerAccessDecision`
- dependencies:
  - `Create privileged mode system`  | סטטוס: 🔴 לא בוצע
  - `Owner Control Center`
- connects_to: `Execution Surface`

8. `Create critical operation guardrails`  | סטטוס: 🔴 לא בוצע
- description: לבנות guardrails שמגבילים owner actions מסוכנים, mass overrides ו־global changes בלי confirmations מתאימים
- input:
  - `ownerAccessDecision`
  - `sensitiveActionConfirmation`
- output:
  - `criticalOperationDecision`
- dependencies:
  - `Create admin-only access layer`  | סטטוס: 🔴 לא בוצע
  - `Policy Layer`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

#### `Owner Audit & Monitoring`

משימות טכניות:

1. `Create owner audit log viewer`  | סטטוס: 🔴 לא בוצע
- description: לבנות viewer model לבעלים עבור system actions, privileged actions, security events ו־critical changes
- input:
  - `auditLogRecord`
  - `projectAuditPayload`
- output:
  - `ownerAuditView`
- dependencies:
  - `Platform Observability`
  - `Project Audit Trail`
- connects_to: `Project State`

2. `Create system-wide activity tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker רוחבי לפעילות users, workspaces, agents, providers ו־owner actions
- input:
  - `platformTrace`
  - `projectAuditRecord`
- output:
  - `systemActivityFeed`
- dependencies:
  - `Platform Observability`
  - `Project Audit Trail`
- connects_to: `Project State`

3. `Create critical change history system`  | סטטוס: 🔴 לא בוצע
- description: לבנות system להיסטוריית שינויים קריטיים כמו permission changes, billing changes, owner overrides ו־security policy updates
- input:
  - `systemActivityFeed`
  - `auditLogRecord`
- output:
  - `criticalChangeHistory`
- dependencies:
  - `Create system-wide activity tracker`  | סטטוס: 🔴 לא בוצע
  - `Create audit log for system actions`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

---

### שלב 7 — scaling וידע מצטבר
רק אחרי שהמערכת באמת עובדת:

### שלב 7.1 — Organization Intelligence & Operating Model
המטרה: להרחיב את Nexus אחרי ה־v1 לשכבת עבודה ארגונית, מודעות הקשר ו־operating model שקשה להעתיק.

#### `Team Intelligence`

משימות טכניות:

1. `Define team context schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לצוות, roles, authority zones, decision owners ו־cross-team dependencies
- input:
  - `workspaceModel`
  - `membershipRecords`
- output:
  - `teamContext`
- dependencies:
  - `Workspace & Access Control`
- connects_to: `Project State`

2. `Create multi-actor project state system`  | סטטוס: 🔴 לא בוצע
- description: לבנות state system שמכיל views, responsibilities ו־pending decisions לפי actor ולא רק לפי project אחד שטוח
- input:
  - `teamContext`
  - `projectState`
- output:
  - `multiActorProjectState`
- dependencies:
  - `Define team context schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create authority resolution engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמכריע מי מוסמך להחליט על deploy, approvals, billing, content ו־sensitive actions
- input:
  - `teamContext`
  - `projectPermissionMatrix`
- output:
  - `authorityDecision`
- dependencies:
  - `Define team context schema`  | סטטוס: 🔴 לא בוצע
  - `Project Permission Matrix`
- connects_to: `Project State`

4. `Create approval chain manager`  | סטטוס: 🔴 לא בוצע
- description: לבנות manager לשרשראות אישור מרובות־actors לפי action type, severity ו־ownership
- input:
  - `authorityDecision`
  - `approvalRequest`
- output:
  - `approvalChain`
- dependencies:
  - `Create authority resolution engine`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

5. `Create stakeholder alignment tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker לקונפליקטים, misalignment ו־open decisions בין stakeholders שונים
- input:
  - `multiActorProjectState`
  - `approvalChain`
- output:
  - `stakeholderAlignment`
- dependencies:
  - `Create multi-actor project state system`  | סטטוס: 🔴 לא בוצע
  - `Create approval chain manager`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create portfolio workspace registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry שמרכז את כל הפרויקטים הפעילים, מצבם, owner mapping ו־shared signals ברמת workspace או organization
- input:
  - `workspaceModel`
  - `projectStateSnapshot`
- output:
  - `portfolioWorkspace`
- dependencies:
  - `Workspace & Access Control`
  - `Nexus Persistence Layer`
- connects_to: `Project State`

7. `Create multi-project overview assembler`  | סטטוס: 🔴 לא בוצע
- description: לבנות assembler שנותן תמונת מצב רוחבית על כמה פרויקטים במקביל כולל health, stage, blockers, growth ו־owner priorities
- input:
  - `portfolioWorkspace`
  - `ownerPriorityQueue`
- output:
  - `multiProjectOverview`
- dependencies:
  - `Create portfolio workspace registry`  | סטטוס: 🔴 לא בוצע
  - `Owner Control Center`
- connects_to: `Project State`

8. `Create collaboration expansion planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמגדיר איך להרחיב פרויקט מ־solo flow ל־team collaboration כולל roles, invitations, approvals ו־shared workspaces
- input:
  - `teamContext`
  - `workspaceUsageSignals`
- output:
  - `collaborationExpansionPlan`
- dependencies:
  - `Define team context schema`  | סטטוס: 🔴 לא בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

#### `Context & Scope Awareness`

משימות טכניות:

1. `Define user and organization context schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־individual mode, team mode, enterprise mode ו־project intent boundaries
- input:
  - `workspaceModel`
  - `teamContext`
- output:
  - `interactionContext`
- dependencies:
  - `Workspace & Access Control`
  - `Team Intelligence`
- connects_to: `Project State`

2. `Create organization vs individual detector`  | סטטוס: 🔴 לא בוצע
- description: לבנות detector שמבין אם הזרימה הנוכחית שייכת ל־solo builder, small team או enterprise context
- input:
  - `interactionContext`
  - `workspaceUsageSignals`
- output:
  - `operatingModeDecision`
- dependencies:
  - `Define user and organization context schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create scope boundary engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמגדיר מה in-scope, מה out-of-scope ומה optional suggestion לפי user intent ו־project mode
- input:
  - `operatingModeDecision`
  - `userIntentDecision`
- output:
  - `scopeBoundary`
- dependencies:
  - `Create organization vs individual detector`  | סטטוס: 🔴 לא בוצע
  - `Founder Challenge & Guided Interaction`
- connects_to: `Project State`

4. `Create relevance filter system`  | סטטוס: 🔴 לא בוצע
- description: לבנות filter שמונע הצעות לא רלוונטיות, premature recommendations או enterprise-only flows במקומות שלא צריך
- input:
  - `scopeBoundary`
  - `projectState`
- output:
  - `relevanceFilteredActions`
- dependencies:
  - `Create scope boundary engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create context-aware silence engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמחליט מתי עדיף לא להציע כלום כדי לא להפריע לזרימה או להעמיס noise
- input:
  - `relevanceFilteredActions`
  - `interactionLoadDecision`
- output:
  - `silenceDecision`
- dependencies:
  - `Create relevance filter system`  | סטטוס: 🔴 לא בוצע
  - `Founder Challenge & Guided Interaction`
- connects_to: `Project State`

#### `Operating Model & Defensibility`

משימות טכניות:

1. `Create single source of truth engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמבטיח consistency בין project state, workbench state, growth state ו־analytics state
- input:
  - `projectState`
  - `multiDomainSnapshots`
- output:
  - `sourceOfTruthState`
- dependencies:
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create cross-system dependency linker`  | סטטוס: 🔴 לא בוצע
- description: לבנות linker שמקשר בין code, release, growth, billing ו־team decisions לגרף תלותים אחד
- input:
  - `sourceOfTruthState`
  - `crossFunctionalTaskGraph`
- output:
  - `crossSystemDependencies`
- dependencies:
  - `Create single source of truth engine`  | סטטוס: 🔴 לא בוצע
  - `Cross-Functional Task Graph`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create action-outcome correlation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמקשר בין פעולות שבוצעו לבין outcomes אמיתיים ב־product, growth ו־runtime
- input:
  - `crossSystemDependencies`
  - `taskResults`
  - `analyticsSummary`
- output:
  - `actionOutcomeCorrelations`
- dependencies:
  - `Create cross-system dependency linker`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Analytics`
- connects_to: `Project State`

4. `Create context propagation engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמפיץ context נכון בין agents, workspaces, releases ו־marketing surfaces בלי drift
- input:
  - `sourceOfTruthState`
  - `loadedExtensions`
- output:
  - `propagatedContext`
- dependencies:
  - `Create single source of truth engine`  | סטטוס: 🔴 לא בוצע
  - `Extensibility Framework`
- connects_to: `Project State`

5. `Create multi-domain synchronization engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמסנכרן state transitions בין development, release, growth, billing ו־learning
- input:
  - `propagatedContext`
  - `actionOutcomeCorrelations`
- output:
  - `synchronizationState`
- dependencies:
  - `Create context propagation engine`  | סטטוס: 🔴 לא בוצע
  - `Create action-outcome correlation engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create causal impact analyzer`  | סטטוס: 🔴 לא בוצע
- description: לבנות analyzer שמבדיל בין correlation לבין causal impact משוער של החלטות, changes ו־campaigns
- input:
  - `synchronizationState`
  - `actionOutcomeCorrelations`
- output:
  - `causalImpactReport`
- dependencies:
  - `Create multi-domain synchronization engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create unified execution narrative engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמסביר כסיפור אחד מה קרה בפרויקט across build, release, growth, team ו־outcomes
- input:
  - `synchronizationState`
  - `causalImpactReport`
- output:
  - `executionNarrative`
- dependencies:
  - `Create causal impact analyzer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

24. `Cross-Project Memory`  | סטטוס: 🟡 חלקי
- מתי לחזור ל־100%: אחרי `Memory` מתמשכת לפרויקט ואחרי שיש כמה flows יציבים של execution ו־release, כדי לשמור patterns חוצי־פרויקטים על בסיס data אמיתי.
- patterns חוזרים
- best practices
- common bottlenecks

משימות טכניות:

1. `Define cross-project pattern schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־patterns אנונימיים חוצי־פרויקטים בלי לדלוף מידע ספציפי של משתמש
- input:
  - `projectLearnings`
- output:
  - `crossProjectPattern`
- dependencies:
  - `Memory`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create pattern anonymization module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמסיר מזהים, שמות לקוח ופרטים רגישים לפני שמירה של pattern חוצה־פרויקטים
- input:
  - `projectLearningRecord`
- output:
  - `anonymizedLearningRecord`
- dependencies:
  - `Define cross-project pattern schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create repeated bottleneck detector`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמזהה bottlenecks שחוזרים על עצמם בין פרויקטים דומים
- input:
  - `anonymizedLearningRecords`
- output:
  - `repeatedBottlenecks`
- dependencies:
  - `Create pattern anonymization module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create best-practice pattern extractor`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמחלץ best practices מתוך רצפי tasks, approvals ו־results מוצלחים
- input:
  - `anonymizedLearningRecords`
- output:
  - `bestPracticePatterns`
- dependencies:
  - `Create pattern anonymization module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create domain pattern aggregator`  | סטטוס: 🔴 לא בוצע
- description: לבנות אגרגטור שמקבץ patterns לפי domain, lifecycle phase ו־release target
- input:
  - `crossProjectPatterns`
- output:
  - `domainPatternSummary`
- dependencies:
  - `Create repeated bottleneck detector`  | סטטוס: 🔴 לא בוצע
  - `Create best-practice pattern extractor`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create cross-project recommendation hints`  | סטטוס: 🔴 לא בוצע
- description: לבנות hint layer שמשפר המלצות עתידיות על בסיס patterns חוצי־פרויקטים
- input:
  - `domainPatternSummary`
  - `projectState`
- output:
  - `recommendationHints`
- dependencies:
  - `Create domain pattern aggregator`  | סטטוס: 🔴 לא בוצע
  - `Learning Layer`
- connects_to: `Project State`

7. `Create cross-project memory registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry מתמשך לשמירת patterns חוצי־פרויקטים, score שלהם ותוקף הזמן שלהם
- input:
  - `crossProjectPatterns`
- output:
  - `crossProjectMemory`
- dependencies:
  - `Create domain pattern aggregator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create domain playbook builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות builder שמתרגם `domainPatternSummary` ל־playbooks ישימים לפי domain, phase ו־release target
- input:
  - `domainPatternSummary`
  - `bestPracticePatterns`
- output:
  - `domainPlaybooks`
- dependencies:
  - `Create domain pattern aggregator`  | סטטוס: 🔴 לא בוצע
  - `Create best-practice pattern extractor`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

9. `Create reusable solution patterns registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry שמארגן פתרונות שעבדו כ־assets רב־שימושיים לפי בעיה, domain ותנאי שימוש
- input:
  - `bestPracticePatterns`
  - `domainPlaybooks`
- output:
  - `reusableSolutionPatterns`
- dependencies:
  - `Create domain playbook builder`  | סטטוס: 🔴 לא בוצע
  - `Create cross-project memory registry`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create template and pattern reuse resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע מתי אפשר ליישם template, playbook או reusable pattern על פרויקט חדש בלי לשבור domain fit או privacy scope
- input:
  - `reusableSolutionPatterns`
  - `projectState`
- output:
  - `patternReuseDecision`
- dependencies:
  - `Create reusable solution patterns registry`  | סטטוס: 🔴 לא בוצע
  - `Learning Governance`
- connects_to: `Project State`

11. `Create cross-project learning application planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמתרגם learnings חוצי־פרויקטים ל־recommended actions, defaults או warnings לפרויקט הנוכחי
- input:
  - `crossProjectMemory`
  - `patternReuseDecision`
  - `projectState`
- output:
  - `crossProjectLearningPlan`
- dependencies:
  - `Create cross-project memory registry`  | סטטוס: 🔴 לא בוצע
  - `Create template and pattern reuse resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Knowledge Ownership & Learning Rights`

משימות טכניות:

1. `Define knowledge ownership schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד שמגדיר למי שייכים learnings, patterns, prompts, artifacts ו־derived knowledge ברמת user, workspace ו־global pool
- input:
  - `projectLearningRecords`
  - `workspaceModel`
- output:
  - `knowledgeOwnershipPolicy`
- dependencies:
  - `Cross-Project Memory`
  - `Workspace & Access Control`
- connects_to: `Project State`

2. `Create learning scope resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע אם learning מסוים נשאר פרטי, shared בתוך workspace, anonymized cross-project או blocked entirely
- input:
  - `knowledgeOwnershipPolicy`
  - `dataPrivacyClassification`
- output:
  - `learningScopeDecision`
- dependencies:
  - `Define knowledge ownership schema`  | סטטוס: 🔴 לא בוצע
  - `Data Privacy & Compliance`
- connects_to: `Project State`

3. `Create knowledge deletion and unlearning module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמוחק או מסיר learnings ו־patterns לפי בקשת משתמש, סיום workspace או privacy requirement
- input:
  - `learningScopeDecision`
  - `privacyRightsResult`
- output:
  - `unlearningResult`
- dependencies:
  - `Create learning scope resolver`  | סטטוס: 🔴 לא בוצע
  - `Cross-Project Memory`
- connects_to: `Project State`

#### `Learning Governance`

משימות טכניות:

1. `Define learning governance schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לניהול למידה כולל classification, confidence, promotion status, application scope ו־behavior impact
- input:
  - `projectLearningRecords`
  - `crossProjectPatterns`
- output:
  - `learningGovernancePolicy`
- dependencies:
  - `Cross-Project Memory`
  - `Learning Layer`
- connects_to: `Project State`

2. `Create learning classification resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמסווג learning ל־project-specific, user-specific, workspace-shared או global-candidate
- input:
  - `learningGovernancePolicy`
  - `learningScopeDecision`
- output:
  - `learningClassification`
- dependencies:
  - `Define learning governance schema`  | סטטוס: 🔴 לא בוצע
  - `Knowledge Ownership & Learning Rights`
- connects_to: `Project State`

3. `Create learning confidence evaluator`  | סטטוס: 🔴 לא בוצע
- description: לבנות evaluator שמחשב confidence ללמידה עצמה לפי recurrence, outcome quality, sample size ו־stability
- input:
  - `learningClassification`
  - `patternEvaluation`
- output:
  - `learningConfidence`
- dependencies:
  - `Create learning classification resolver`  | סטטוס: 🔴 לא בוצע
  - `Define pattern evaluation schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create learning promotion flow`  | סטטוס: 🔴 לא בוצע
- description: לבנות flow שמקדם learning מ־observed ל־repeated, validated ו־promoted behavior candidate
- input:
  - `learningConfidence`
  - `recommendationBenchmark`
- output:
  - `learningPromotionState`
- dependencies:
  - `Create learning confidence evaluator`  | סטטוס: 🔴 לא בוצע
  - `Create recommendation benchmark tracker`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create learning application guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שקובע מתי מותר להחיל learning על פרויקט חדש, ומתי צריך לעצור בגלל low confidence, privacy scope או domain mismatch
- input:
  - `learningPromotionState`
  - `projectState`
- output:
  - `learningApplicationDecision`
- dependencies:
  - `Create learning promotion flow`  | סטטוס: 🔴 לא בוצע
  - `Create learning scope resolver`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create explainable learning application builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות builder שמסביר למה learning מסוים הוחל, מאיפה הוא הגיע, ובאיזה confidence הוא משפיע על recommendation
- input:
  - `learningApplicationDecision`
  - `learningTrace`
- output:
  - `learningApplicationExplanation`
- dependencies:
  - `Create learning application guard`  | סטטוס: 🔴 לא בוצע
  - `Create learning trace builder`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create learning opt-out and reset controls`  | סטטוס: 🔴 לא בוצע
- description: לבנות controls שמאפשרים להגביל, לאפס או לכבות שימוש בלמידה ברמת user, workspace או project
- input:
  - `learningGovernancePolicy`
  - `privacyRightsResult`
- output:
  - `learningControlState`
- dependencies:
  - `Define learning governance schema`  | סטטוס: 🔴 לא בוצע
  - `Create privacy rights execution module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

25. `Learning Layer`  | סטטוס: 🔴 לא בוצע
- שיפור המלצות לפי history
- לא training של מודל חדש, אלא שכבת למידה תפעולית

משימות טכניות:

1. `Define project learning event schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לאירועי למידה מתוך execution, approvals, failures ו־user overrides
- input:
  - `projectEvent`
  - `taskResult`
- output:
  - `learningEvent`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

2. `Create project learning collector`  | סטטוס: 🔴 לא בוצע
- description: לבנות collector שאוסף learnings מתוך state transitions, runtime results ו־approval outcomes
- input:
  - `learningEvents`
- output:
  - `projectLearningRecords`
- dependencies:
  - `Define project learning event schema`  | סטטוס: 🔴 לא בוצע
  - `Memory`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

3. `Create success and failure pattern extractor`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמחלץ patterns של מה עבד ומה נכשל בתוך פרויקט יחיד
- input:
  - `projectLearningRecords`
- output:
  - `successPatterns`
  - `failurePatterns`
- dependencies:
  - `Create project learning collector`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create user preference inference module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמסיק העדפות משתמש מתוך approvals, rejections, overrides ו־manual selections
- input:
  - `projectLearningRecords`
- output:
  - `userPreferenceProfile`
- dependencies:
  - `Create project learning collector`  | סטטוס: 🔴 לא בוצע
  - `Create approval feedback memory`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

5. `Create recommendation improvement engine`  | סטטוס: 🔴 לא בוצע
- description: לבנות engine שמשפר task ordering, defaults, approval prompts ו־fallbacks לפי learnings שנצברו
- input:
  - `successPatterns`
  - `failurePatterns`
  - `userPreferenceProfile`
  - `projectState`
- output:
  - `improvedRecommendations`
- dependencies:
  - `Create success and failure pattern extractor`  | סטטוס: 🔴 לא בוצע
  - `Create user preference inference module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create learning trace builder`  | סטטוס: 🔴 לא בוצע
- description: לבנות trace שמסביר אילו learnings השפיעו על recommendation מסוים
- input:
  - `improvedRecommendations`
  - `projectLearningRecords`
- output:
  - `learningTrace`
- dependencies:
  - `Create recommendation improvement engine`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create passive learning observer`  | סטטוס: 🔴 לא בוצע
- description: לבנות observer לומד בלבד שאוסף, מסכם ומסיק מסקנות בלי לבצע actions ובלי לשנות execution state לבד
- input:
  - `projectLearningRecords`
  - `crossProjectMemory`
- output:
  - `learningInsights`
- dependencies:
  - `Create recommendation improvement engine`  | סטטוס: 🔴 לא בוצע
  - `Cross-Project Memory`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

8. `Create learning insight API`  | סטטוס: 🔴 לא בוצע
- description: לבנות API שמחזיר תובנות למידה, patterns והצעות משופרות בלי להריץ פעולות בפועל
- input:
  - `projectId`
- output:
  - `learningPayload`
- dependencies:
  - `Create learning trace builder`  | סטטוס: 🔴 לא בוצע
  - `Create passive learning observer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

#### `Extensibility Framework`

משימות טכניות:

1. `Define extension contract schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להרחבות כמו provider adapters, agent types, domains ו־workflow plugins
- input:
  - `extensionType`
  - `extensionMetadata`
- output:
  - `extensionContract`
- dependencies:
  - `Source Adapter Layer`  | סטטוס: 🟢 בוצע
  - `External Accounts Connector`
- connects_to: `Project State`

2. `Create extension registry`  | סטטוס: 🔴 לא בוצע
- description: לבנות registry שמרשום extensions זמינים, versions, capabilities ו־compatibility constraints
- input:
  - `extensionContract`
- output:
  - `extensionRegistry`
- dependencies:
  - `Define extension contract schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create extension loading and validation module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שטוען הרחבות חדשות, מוודא compatibility ומחבר אותן לשכבות runtime ו־planning בלי שינוי ליבה ידני
- input:
  - `extensionRegistry`
  - `runtimeConfig`
- output:
  - `loadedExtensions`
- dependencies:
  - `Create extension registry`  | סטטוס: 🔴 לא בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

4. `Create extension sandbox and permission guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמגביל מה extension חדש יכול לקרוא, לכתוב או לבצע לפני activation
- input:
  - `loadedExtensions`
  - `agentGovernancePolicy`
- output:
  - `extensionSecurityDecision`
- dependencies:
  - `Create extension loading and validation module`  | סטטוס: 🔴 לא בוצע
  - `Agent Governance & Sandboxing`
- connects_to: `Execution Surface`

9. `Define pattern evaluation schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להערכת pattern לפי confidence, applicability, sample size, success rate ו־failure rate
- input:
  - `successPatterns`
  - `failurePatterns`
- output:
  - `patternEvaluation`
- dependencies:
  - `Create success and failure pattern extractor`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

10. `Create pattern outcome scorer`  | סטטוס: 🔴 לא בוצע
- description: לבנות scorer שמחשב score אמיתי ל־patterns לפי outcomes, stability ותנאי הצלחה
- input:
  - `patternEvaluation`
  - `projectLearningRecords`
- output:
  - `scoredPatterns`
- dependencies:
  - `Define pattern evaluation schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

11. `Create recommendation benchmark tracker`  | סטטוס: 🔴 לא בוצע
- description: לבנות tracker שמשווה בין מה הומלץ, מה בוצע בפועל ומה הצליח בפועל
- input:
  - `improvedRecommendations`
  - `taskResults`
  - `projectLearningRecords`
- output:
  - `recommendationBenchmark`
- dependencies:
  - `Create recommendation improvement engine`  | סטטוס: 🔴 לא בוצע
  - `Task Result Ingestion`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

26. `Scalability`  | סטטוס: 🔴 לא בוצע
- כמה פרויקטים במקביל
- כמה agents במקביל
- בלי לקרוס

משימות טכניות:

1. `Define scalability architecture schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־capacity units, queue topology, workspace density, concurrency limits ו־autoscaling dimensions
- input:
  - `runtimeConfig`
  - `usageForecast`
- output:
  - `scalabilityArchitecture`
- dependencies:
  - `Application Runtime Layer`
  - `Platform Cost & Usage Control`
- connects_to: `Project State`

2. `Create queue and workload partitioning model`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודל לחלוקת עומסים בין agents, workers, execution types ו־priority lanes
- input:
  - `scalabilityArchitecture`
  - `taskThroughputSummary`
- output:
  - `workloadPartitioning`
- dependencies:
  - `Define scalability architecture schema`  | סטטוס: 🔴 לא בוצע
  - `Scheduler`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

3. `Create autoscaling policy resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמחליט מתי להגדיל או להקטין workers, queues ו־workspace capacity
- input:
  - `workloadPartitioning`
  - `runtimeHealthSignals`
- output:
  - `autoscalingDecision`
- dependencies:
  - `Create queue and workload partitioning model`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Execution Surface`

4. `Create high-load degradation policy`  | סטטוס: 🔴 לא בוצע
- description: לבנות policy למצבי עומס גבוה שמגדירה מה נדחה, מה מונמך ומה נשאר זמין כדי למנוע קריסה מלאה
- input:
  - `autoscalingDecision`
  - `budgetDecision`
- output:
  - `degradationPolicy`
- dependencies:
  - `Create autoscaling policy resolver`  | סטטוס: 🔴 לא בוצע
  - `Platform Cost & Usage Control`
- connects_to: `Execution Surface`

5. `Define reliability and SLA schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־uptime targets, recovery objectives, failure classes ו־service guarantees של Nexus
- input:
  - `serviceTierDefinitions`
  - `runtimeCapabilities`
- output:
  - `reliabilitySlaModel`
- dependencies:
  - `Platform Observability`
  - `Backup & Recovery`
- connects_to: `Project State`

6. `Create failover and continuity planner`  | סטטוס: 🔴 לא בוצע
- description: לבנות planner שמחליט איך ממשיכים כששכבת runtime, queue, provider או workspace cluster נופלים
- input:
  - `reliabilitySlaModel`
  - `incidentAlert`
- output:
  - `continuityPlan`
- dependencies:
  - `Define reliability and SLA schema`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Execution Surface`

7. `Create service reliability dashboard model`  | סטטוס: 🔴 לא בוצע
- description: לבנות dashboard model ל־uptime, queue lag, workspace pressure, incident status ו־SLA health
- input:
  - `reliabilitySlaModel`
  - `continuityPlan`
- output:
  - `serviceReliabilityDashboard`
- dependencies:
  - `Create failover and continuity planner`  | סטטוס: 🔴 לא בוצע
  - `Platform Observability`
- connects_to: `Project State`

#### `Product Boundary Model`

משימות טכניות:

1. `Define product boundary schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד שמגדיר מה Nexus עושה, מה הוא לא עושה, מה הוא אוטומטי ומה נשאר באחריות המשתמש
- input:
  - `productVision`
  - `autonomyControlSchema`
- output:
  - `productBoundaryModel`
- dependencies:
  - `Policy Layer`  | סטטוס: 🟢 בוצע
  - `Nexus Product Go-To-Market`
- connects_to: `Project State`

2. `Create capability promise and limit map`  | סטטוס: 🔴 לא בוצע
- description: לבנות מפה מוצרית של promises, limits, disclaimers ו־non-goals לפי workflow, agent ו־feature area
- input:
  - `productBoundaryModel`
  - `agentGovernancePolicy`
- output:
  - `capabilityLimitMap`
- dependencies:
  - `Define product boundary schema`  | סטטוס: 🔴 לא בוצע
  - `Agent Governance & Sandboxing`
- connects_to: `Project State`

3. `Create boundary disclosure and expectation model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model להצגת גבולות המוצר בממשק, באתר וב־approval flows כדי למנוע ציפיות שגויות
- input:
  - `capabilityLimitMap`
  - `messagingFramework`
- output:
  - `boundaryDisclosureModel`
- dependencies:
  - `Create capability promise and limit map`  | סטטוס: 🔴 לא בוצע
  - `Nexus Product Go-To-Market`
- connects_to: `Project State`

#### `System Capability Registry`

משימות טכניות:

1. `Define system capability registry schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לרישום capabilities, limits, supported workflows, execution classes ו־unsupported operations של Nexus
- input:
  - `productBoundaryModel`
  - `extensionRegistry`
- output:
  - `systemCapabilityRegistry`
- dependencies:
  - `Define product boundary schema`  | סטטוס: 🔴 לא בוצע
  - `Extensibility Framework`
- connects_to: `Project State`

2. `Create system capability resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שקובע בזמן אמת אם פעולה או workflow נתמכים, מוגבלים, דורשים אישור מיוחד או מחוץ לגבולות Nexus
- input:
  - `systemCapabilityRegistry`
  - `requestedAction`
  - `workspaceModel`
- output:
  - `capabilityDecision`
- dependencies:
  - `Define system capability registry schema`  | סטטוס: 🔴 לא בוצע
  - `Create capability promise and limit map`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

---

## 10% הכי קריטיים
אם אתה רוצה רק את מה שבאמת הכי חשוב עכשיו:

1. `Context Builder`  | סטטוס: 🟢 בוצע
2. `Canonical Schema`  | סטטוס: 🟢 בוצע
3. `Source Adapter Layer`  | סטטוס: 🟢 בוצע
4. `Confidence Metadata`
5. `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
6. `Deep Code Scanner`  | סטטוס: 🟢 בוצע
7. `Structured Analysis Pipeline`  | סטטוס: 🟢 בוצע
8. `Project State` אמיתי  | סטטוס: 🟢 בוצע
9. `Execution Graph` חכם  | סטטוס: 🟢 בוצע
10. `Approval + Safety Layer`

---

## מה הייתי מוסיף מעבר למה שכתבת
יש 4 משימות שחייבות להיות ברשימה:

1. `Bottleneck Resolver`  | סטטוס: 🔴 לא בוצע
- מנגנון שמחליט מה החסם האמיתי עכשיו
- זה הלב של החוויה

2. `Decision Layer`  | סטטוס: 🔴 לא בוצע
- להבדיל בין:
  - מה דורש אישור משתמש
  - מה agent יכול לעשות לבד
  - מה עדיין לא בטוח מספיק

3. `Explanation Layer`  | סטטוס: 🔴 לא בוצע
- המערכת חייבת להסביר:
  - למה זה חסר
  - למה זה חסום
  - למה זאת המשימה הבאה

4. `Normalization Layer`  | סטטוס: 🟢 בוצע
- להפוך מידע ממקורות שונים לשפה פנימית אחת
- אחרת כל source "יזהם" את הליבה

---

## התעדוף הסופי שלי
אם אתה רוצה לעבוד נכון, זה הסדר:

1. `Context Builder`  | סטטוס: 🟢 בוצע
2. `Canonical Schema`  | סטטוס: 🟢 בוצע
3. `Source Adapter Layer`  | סטטוס: 🟢 בוצע
4. `Confidence / Source Metadata`
5. `Domain-Aware Planner`  | סטטוס: 🟢 בוצע
6. `Deep Scanner`
7. `AI Pipeline`
8. `Git + Docs + External Sources`
9. `Project State + Execution Graph`  | סטטוס: 🟢 בוצע
10. `Approval + Safety`
11. `Real Agents`
12. `Learning + Cross-Project Knowledge`
