# V2 Master Plan And Waves

מסמך זה הוא תוכנית העבודה של `v2`.

הוא **לא** מחליף את [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md), אלא נגזר ממנו.

העקרונות המחייבים:
- קובץ המשימות המקורי נשאר `source of truth`
- `v2` ממופה מתוך המשימות שכבר קיימות שם
- עובדים על `v2` **גל־אחרי־גל**
- בסוף כל גל יש `validation gate`
- לא מתחילים את הגל הבא לפני:
  - בדיקות
  - רישום ממצאים
  - תיקון באגים קריטיים
  - החלטה מודעת להמשיך

---

## מה v1 הוכיחה

`v1` הוכיחה:
- לופ עבודה אמיתי
- onboarding -> project creation
- project state
- execution / recovery / approval / explanation
- developer workbench בסיסי
- first value
- acceptance tests

`v1` **לא** מיועדת לשחרור כמוצר חיצוני.

המסקנה:
- `v1` היא `validated internal foundation`
- `v2` היא השלב שבו Nexus צריכה להפוך ל־`first real product`

---

## איך v2 תעבוד

מבנה העבודה של `v2`:

1. קובץ אחד לכל `v2`
- כל 4 הגלים נמצאים כאן
- כל המשימות הטכניות הרלוונטיות נמצאות כאן

2. ביצוע מדורג
- עובדים רק על הגל הנוכחי
- לא מדלגים קדימה

3. עצירה מחייבת בסוף כל גל
- בדיקות
- לקחים
- באגים
- תיקונים
- החלטת מעבר לגל הבא

4. מקור האמת לבאגים של כל גל
- ייפתח קובץ bug/validation נפרד לכל גל, אם נצטרך

---

## Progress Tracking

מצב נוכחי:
- `v2` כוללת `4` גלים
- עובדים עכשיו על `Wave 1`

אחוזי התקדמות:
- `Wave 1`: `100%`
- `v2` כולל: `100%`

איך האחוז מחושב:
- `Wave 1` מחושב לפי מספר המשימות שסומנו `🟢` מתוך כלל המשימות הממופות לגל
- כרגע ב־`Wave 1` הושלמו:
  - `Define primary user journeys`
  - `Create journey map for core flows`
  - `Define screen inventory`
  - `Create screen-to-flow mapping`
  - `Define screen contract schema`
  - `Create goal and CTA definition module`
  - `Create mobile readiness checklist`
  - `Create loading empty error states definition`
  - `Create screen validation checklist`
  - `Define design token schema`
  - `Create typography system`
  - `Create spacing and layout system`
  - `Create color usage rules`
  - `Create interaction states system`
  - `Define component contract schema`
  - `Create primitive components`
  - `Create layout components`
  - `Create feedback components`
  - `Create navigation components`
  - `Create data display components`
  - `Define screen template schema`
  - `Create dashboard template`
  - `Create detail page template`
  - `Create workflow template`
  - `Create list and management template`
  - `Create state-driven template variants`
  - `Create primary action validator`
  - `Create mobile usability validator`
  - `Create state coverage validator`
  - `Create consistency validator`
  - `Create screen review assembler`
  - `Define learning insight UI schema`
  - `Create recommendation reasoning panel contract`
  - `Create pattern confidence indicator`
  - `Create user preference signal view`
  - `Create cross-project pattern disclosure panel`
  - `Create passive learning disclosure banner`
  - `Create AI learning workspace template`
  - `Create authentication system`
  - `Create signup / login / logout API`
  - `Create session and token management`
  - `Create authentication route resolver`
  - `Build authentication screen states`
  - `Create project draft creation service`
  - `Create project creation experience model`
  - `Create post-project-creation redirect resolver`
  - `Create onboarding progress model`
  - `Build onboarding screen flow`
  - `Create onboarding completion evaluator`
  - `Create onboarding-to-state handoff contract`
  - `Define initial project state creation contract`
  - `Define canonical initial project state schema`
  - `Create onboarding-to-state transformation mapper`
  - `Create project state bootstrap service`
  - `Create onboarding session service`
  - `Create onboarding step resolver`
  - `Create onboarding command handlers`
  - `Create onboarding API endpoints`
  - `Create first value summary assembler`
  - `Define AI companion presence schema`
  - `Create companion state model`
  - `Create companion trigger policy`
  - `Create companion message priority resolver`
  - `Create companion dock and panel contract`
  - `Create companion animation state rules`
  - `Create companion mode controls`
  - `Create companion interruption guard`
  - `Create AI companion workspace template`
  - `Define context relevance schema`
  - `Create context relevance filter`
  - `Create context slimming pipeline`
  - `Define editable proposal schema`
  - `Create proposal editing system`
  - `Create partial acceptance flow`
  - `Define real-time event stream schema`
  - `Create live update transport layer`
  - `Create live log streaming module`
  - `Create reactive workspace refresh model`
  - `Define collaboration event schema`
  - `Create project presence model`
  - `Create project comments and review threads module`
  - `Create shared approval flow model`
  - `Create collaboration activity feed`
  - `Define project state snapshot schema`
  - `Create project snapshot store`
  - `Create state diff and compare module`
  - `Create project state restore resolver`
  - `Create project rollback execution module`
- סך המשימות הממופות ל־`Wave 1`: `98`
- הושלמו: `98 / 98`

כלל עבודה:
- בסוף כל משימה מעדכנים:
  - אחוז התקדמות של `Wave 1`
  - אחוז התקדמות של `v2`
- כל עוד לא מיפינו את הגלים הבאים לרמת execution מלאה, אחוז `v2` הכולל יישאר זהה לאחוז של הגל הפעיל

---

## v2 Waves

### Wave 1 — Product Experience

מטרה:
- להפוך את הליבה של `v1` ממערכת עובדת למוצר שמרגיש קוהרנטי, חי ושמיש יותר.

נכנס מ־source of truth:
- `Identity & Auth`
- `Onboarding Engine`
- `Project Identity & Instant Value`
- `Task Selection & Recommendation Presentation`
- `UI / UX Foundation`
- `Real-Time Experience Layer`
- `Collaboration Layer`
- `Project State Versioning`

סדר עבודה בתוך הגל:
1. `UI / UX Foundation`
2. `Real-Time Experience Layer`
3. `Collaboration Layer`
4. `Project State Versioning`

למה הגל הזה ראשון:
- כי כרגע החסם הגדול אחרי `v1` הוא לא רק יכולת, אלא חוויית מוצר.
- לפני scale, billing או owner control, Nexus צריכה להרגיש כמו מוצר אמיתי.

#### Wave 1 Detailed Technical Tasks

הערות בסיס:
- משימות `User Flow System` ו־`Screen UX Contracts` שכבר סומנו `🟢` ב־`v1` נשארות בסיס קיים לגל הזה, ולא נכנסות כמשימות ביצוע חדשות.
- `Developer Workspace Experience` ו־`Unified Project Workbench` גם הם בסיס קיים מה־`v1`.

##### `UI / UX Foundation`

##### `Entry, Authentication, Onboarding And First Action Flow`

1. `Create authentication system`  | סטטוס: 🟢 בוצע
- description: לבנות שכבת אימות בסיסית למשתמשי Nexus עם login state ו־auth flows
- input:
  - `userIdentity`
  - `credentials`
- output:
  - `authenticationState`
- dependencies:
  - `Define user identity schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create signup / login / logout API`  | סטטוס: 🟢 בוצע
- description: לבנות endpoints/commands בסיסיים עבור sign up, login ו־logout למשתמשי Nexus
- input:
  - `userInput`
  - `credentials`
- output:
  - `authPayload`
- dependencies:
  - `Create authentication system`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create session and token management`  | סטטוס: 🟢 בוצע
- description: לבנות state אחיד ל־session, token bundle ו־session lifecycle אחרי auth
- input:
  - `authenticationState`
  - `authPayload`
- output:
  - `sessionState`
  - `tokenBundle`
- dependencies:
  - `Create authentication system`  | סטטוס: 🟢 בוצע
  - `Create signup / login / logout API`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create authentication route resolver`  | סטטוס: 🟢 בוצע
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

5. `Build authentication screen states`  | סטטוס: 🟢 בוצע
- description: לממש מצבי UI למסכי auth כולל sign up, sign in, restore session, error, loading ו־logout redirect
- input:
  - `authenticationRouteDecision`
  - `verificationFlowState`
- output:
  - `authenticationViewState`
- dependencies:
  - `Create authentication route resolver`  | סטטוס: 🟢 בוצע
  - `Initial Nexus Screens`
- connects_to: `Execution Surface`

6. `Create post-auth redirect resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמכריע אם אחרי auth המשתמש נוחת ב־project creation, onboarding resume, workbench, approval inbox או waitlist status
- input:
  - `authenticationRouteDecision`
  - `sessionState`
  - `workspaceModel`
- output:
  - `postAuthRedirect`
- dependencies:
  - `Create authentication route resolver`  | סטטוס: 🟢 בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

7. `Define project draft schema`  | סטטוס: 🟢 בוצע
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

8. `Create project draft creation service`  | סטטוס: 🟢 בוצע
- description: לבנות service שיוצר `projectDraft` חדש למשתמש מחובר ומחזיר draft id שממנו נכנסים ל־onboarding
- input:
  - `userIdentity`
  - `projectCreationInput`
- output:
  - `projectDraft`
  - `projectDraftId`
- dependencies:
  - `Define project draft schema`  | סטטוס: 🟢 בוצע
  - `Workspace & Access Control`
- connects_to: `Project State`

9. `Create project creation experience model`  | סטטוס: 🟢 בוצע
- description: לבנות מודל מלא ליצירת פרויקט ראשון מתוך ה־app כולל CTA, draft creation, validation, empty workspace state ו־redirect ל־onboarding
- input:
  - `workspaceModel`
  - `postLoginDestination`
- output:
  - `projectCreationExperience`
- dependencies:
  - `Create project draft creation service`  | סטטוס: 🟢 בוצע
  - `Landing, Access & App Entry Flow`
- connects_to: `Project State`

10. `Create post-project-creation redirect resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שמחליט אם אחרי יצירת `projectDraft` המשתמש ממשיך מיד ל־onboarding, חוזר later או נשלח ל־resume flow
- input:
  - `projectDraft`
  - `projectCreationExperience`
- output:
  - `projectCreationRedirect`
- dependencies:
  - `Create project draft persistence store`
  - `Create onboarding session service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

11. `Create onboarding session service`  | סטטוס: 🟢 בוצע
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

12. `Create onboarding step resolver`  | סטטוס: 🟢 בוצע
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

13. `Create onboarding command handlers`  | סטטוס: 🟢 בוצע
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

14. `Create onboarding API endpoints`  | סטטוס: 🟢 בוצע
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

15. `Create onboarding progress model`  | סטטוס: 🟢 בוצע
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

16. `Build onboarding screen flow`  | סטטוס: 🟢 בוצע
- description: לממש flow מסכי onboarding עם שאלות, autosave, מצבי loading/error ויכולת resume למשתמש
- input:
  - `onboardingSession`
  - `onboardingProgress`
  - `requiredActions`
- output:
  - `onboardingViewState`
- dependencies:
  - `Create onboarding progress model`  | סטטוס: 🟢 בוצע
  - `Create onboarding API endpoints`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

17. `Create onboarding completion evaluator`  | סטטוס: 🟢 בוצע
- description: לבנות evaluator שקובע אם נאסף מספיק intake כדי להתקדם לבניית `Project State`, או שצריך clarification נוסף
- input:
  - `projectIntake`
  - `onboardingSession`
- output:
  - `onboardingCompletionDecision`
- dependencies:
  - `Create project intake parser`
  - `Create onboarding answer persistence store`
- connects_to: `Project State`

18. `Create onboarding-to-state handoff contract`  | סטטוס: 🟢 בוצע
- description: להגדיר חוזה ברור בין סוף ה־onboarding לבין יצירת `Project State` הראשוני, כולל intake, approvals, draft metadata ו־missing clarifications
- input:
  - `projectDraft`
  - `projectIntake`
  - `onboardingCompletionDecision`
- output:
  - `onboardingStateHandoff`
- dependencies:
  - `Create onboarding completion evaluator`  | סטטוס: 🟢 בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

19. `Define initial project state creation contract`  | סטטוס: 🟢 בוצע
- description: להגדיר חוזה ברור ליצירת `Project State` ראשוני מתוך onboarding, כולל required inputs, optional metadata ו־minimum viable state
- input:
  - `onboardingStateHandoff`
  - `projectOwnershipBinding`
- output:
  - `initialProjectStateContract`
- dependencies:
  - `Create onboarding-to-state handoff contract`  | סטטוס: 🟢 בוצע
  - `Create project ownership binding model`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

20. `Define canonical initial project state schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema קנוני ל־`initialProjectState` כולל identity, goals, constraints, readiness, ownership ו־bootstrap metadata
- input:
  - `initialProjectStateContract`
  - `projectIdentity`
- output:
  - `initialProjectState`
- dependencies:
  - `Define initial project state creation contract`  | סטטוס: 🟢 בוצע
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

21. `Create onboarding-to-state transformation mapper`  | סטטוס: 🟢 בוצע
- description: לבנות mapper שמתרגם intake, approvals, draft metadata ו־clarifications לשדות הקנוניים של `initialProjectState`
- input:
  - `onboardingStateHandoff`
  - `initialProjectState`
- output:
  - `stateBootstrapPayload`
- dependencies:
  - `Define canonical initial project state schema`  | סטטוס: 🟢 בוצע
  - `Create onboarding-to-state handoff contract`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

22. `Create project state bootstrap service`  | סטטוס: 🟢 בוצע
- description: לבנות service שמייצר, שומר ומחזיר `initialProjectState` שמיש מיד אחרי ה־onboarding
- input:
  - `stateBootstrapPayload`
  - `projectOwnershipBinding`
- output:
  - `initialProjectState`
  - `projectStateSnapshot`
- dependencies:
  - `Create onboarding-to-state transformation mapper`  | סטטוס: 🟢 בוצע
  - `Nexus Persistence Layer`
- connects_to: `Project State`

23. `Create initial project state validation module`  | סטטוס: 🟢 בוצע
- description: לבנות validator שמוודא שה־`initialProjectState` עומד ב־schema הקנוני, כולל required fields, ownership binding, readiness metadata ו־state consistency לפני המשך ל־task seeding
- input:
  - `initialProjectState`
  - `initialProjectStateContract`
- output:
  - `initialProjectStateValidation`
  - `stateValidationIssues`
- dependencies:
  - `Define canonical initial project state schema`  | סטטוס: 🟢 בוצע
  - `Create project state bootstrap service`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

24. `Create initial task seeding service`  | סטטוס: 🟢 בוצע
- description: לבנות service שמייצר סט ראשוני של משימות מתוך ה־`initialProjectState`
- input:
  - `initialProjectState`
  - `domainDecision`
- output:
  - `initialTasks`
  - `taskSeedMetadata`
- dependencies:
  - `Create project state bootstrap service`  | סטטוס: 🟢 בוצע
  - `Expanded Domain Adaptation`
- connects_to: `Execution Graph`

25. `Create next task selection resolver`  | סטטוס: 🟢 בוצע
- description: לבנות resolver שקובע מה המשימה הבאה למשתמש או ל־agent מתוך roadmap, blockers, approvals ו־scheduler alternatives
- input:
  - `roadmap`
  - `blockers`
  - `approvalStatus`
- output:
  - `selectedTask`
  - `selectionReason`
- dependencies:
  - `Scheduler`
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

26. `Create next task presentation model`  | סטטוס: 🟢 בוצע
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

27. `Create next task approval handoff panel`  | סטטוס: 🟢 בוצע
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

28. `Create recommendation display contract`  | סטטוס: 🟢 בוצע
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

29. `Create recommendation summary panel`  | סטטוס: 🟢 בוצע
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

30. `Bind project explanation to cockpit recommendation surface`  | סטטוס: 🟢 בוצע
- description: לחבר את `projectExplanation`, `approvalExplanation`, `reasoningPanel` ו־`recommendationSummaryPanel` ל־cockpit כך שההמלצה למשתמש לא תופיע רק כ־metric או רשימת טקסטים חלקית
- input:
  - `projectExplanation`
  - `approvalExplanation`
  - `recommendationSummaryPanel`
- output:
  - `cockpitRecommendationSurface`
- dependencies:
  - `Create recommendation summary panel`  | סטטוס: 🔴 לא בוצע
  - `Build authentication screen states`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

31. `Create first value summary assembler`  | סטטוס: 🟢 בוצע
- description: לבנות summary קריא למשתמש שמחבר את זהות הפרויקט, התוצר הראשון וההתקדמות המוחשית להסבר אחד ברור של למה כדאי להמשיך עכשיו
- input:
  - `projectIdentityProfile`
  - `firstValueOutput`
  - `realityProgress`
  - `explanationPayload`
- output:
  - `firstValueSummary`
- dependencies:
  - `Create project identity assembler`
  - `Create progress-to-reality mapper`
  - `Explanation Layer`
- connects_to: `Project State`

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

2. `Create journey map for core flows`  | סטטוס: 🟢 בוצע
- description: למפות end-to-end flows עבור onboarding, project creation, execution, approvals ו־tracking
- input:
  - `userJourneys`
- output:
  - `journeyMap`
- dependencies:
  - `Define primary user journeys`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Define screen inventory`  | סטטוס: 🟢 בוצע
- description: לגזור מתוך ה־journeys את כל המסכים הנדרשים
- input:
  - `journeyMap`
- output:
  - `screenInventory`
- dependencies:
  - `Create journey map for core flows`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

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

5. `Define screen contract schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לכל מסך במערכת
- input:
  - `screenType`
- output:
  - `screenContract`
- dependencies:
  - `Canonical Schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

6. `Create goal and CTA definition module`  | סטטוס: 🟢 בוצע
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

7. `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך כללי שימושיות במובייל
- input:
  - `screenContract`
- output:
  - `mobileChecklist`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

8. `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך מצבי `loading`, `empty`, `error`, `success`
- input:
  - `screenContract`
- output:
  - `screenStates`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

9. `Create screen validation checklist`  | סטטוס: 🟢 בוצע
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

10. `Define design token schema`  | סטטוס: 🟢 בוצע
- description: להגדיר tokens לצבעים, spacing, typography, radius, borders, shadows
- input:
  - `brandDirection`
- output:
  - `designTokens`
- dependencies:
  - `UI / UX Foundation`
- connects_to: `Project State`

11. `Create typography system`  | סטטוס: 🟢 בוצע
- description: להגדיר scale קבוע לכותרות, טקסט גוף, labels ו־meta text
- input:
  - `designTokens`
- output:
  - `typographySystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

12. `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- description: להגדיר grid, spacing scale, container widths ו־section rhythm
- input:
  - `designTokens`
- output:
  - `layoutSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

13. `Create color usage rules`  | סטטוס: 🟢 בוצע
- description: להגדיר מתי משתמשים בכל צבע, כולל states
- input:
  - `designTokens`
- output:
  - `colorRules`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

14. `Create interaction states system`  | סטטוס: 🟢 בוצע
- description: להגדיר hover, active, focus, disabled, destructive, success, warning
- input:
  - `designTokens`
- output:
  - `interactionStateSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

15. `Define component contract schema`  | סטטוס: 🟢 בוצע
- description: להגדיר חוזה אחיד לכל רכיב
- input:
  - `componentType`
- output:
  - `componentContract`
- dependencies:
  - `Design System`
- connects_to: `Project State`

16. `Create primitive components`  | סטטוס: 🟢 בוצע
- description: לבנות רכיבי בסיס כמו button, input, textarea, select, badge, icon button
- input:
  - `componentContract`
  - `designTokens`
- output:
  - `primitiveComponents`
- dependencies:
  - `Define component contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

17. `Create layout components`  | סטטוס: 🟢 בוצע
- description: לבנות container, section, stack, grid, panel, divider
- input:
  - `layoutSystem`
- output:
  - `layoutComponents`
- dependencies:
  - `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

18. `Create feedback components`  | סטטוס: 🟢 בוצע
- description: לבנות loading, empty state, error state, toast, banner, progress, skeleton
- input:
  - `interactionStateSystem`
- output:
  - `feedbackComponents`
- dependencies:
  - `Create interaction states system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

19. `Create navigation components`  | סטטוס: 🟢 בוצע
- description: לבנות sidebar, tabs, breadcrumb, topbar, stepper
- input:
  - `screenFlowMap`
- output:
  - `navigationComponents`
- dependencies:
  - `Create screen-to-flow mapping`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

20. `Create data display components`  | סטטוס: 🟢 בוצע
- description: לבנות table, stat card, activity log, timeline, key-value panel, status chip
- input:
  - `screenInventory`
- output:
  - `dataDisplayComponents`
- dependencies:
  - `Define screen inventory`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

21. `Define screen template schema`  | סטטוס: 🟢 בוצע
- description: להגדיר תבנית אחידה למסכים
- input:
  - `screenType`
- output:
  - `screenTemplateSchema`
- dependencies:
  - `Screen UX Contracts`
  - `Component Library`
- connects_to: `Project State`

22. `Create dashboard template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי overview ודשבורדים
- input:
  - `screenTemplateSchema`
- output:
  - `dashboardTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

23. `Create detail page template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי פרטים
- input:
  - `screenTemplateSchema`
- output:
  - `detailPageTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

24. `Create workflow template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי flow ו־wizard
- input:
  - `screenTemplateSchema`
- output:
  - `workflowTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

25. `Create list and management template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי רשימות, טבלאות וניהול
- input:
  - `screenTemplateSchema`
- output:
  - `managementTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

26. `Create state-driven template variants`  | סטטוס: 🟢 בוצע
- description: לבנות וריאציות `loading / empty / error / success` לכל template
- input:
  - `screenStates`
  - `screenTemplates`
- output:
  - `templateVariants`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

27. `Create primary action validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שלכל מסך יש פעולה ראשית ברורה
- input:
  - `screenContract`
  - `screenTemplate`
- output:
  - `primaryActionValidation`
- dependencies:
  - `Create goal and CTA definition module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

28. `Create mobile usability validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שהמסך usable במובייל
- input:
  - `screenTemplate`
  - `mobileChecklist`
- output:
  - `mobileValidation`
- dependencies:
  - `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

29. `Create state coverage validator`  | סטטוס: 🟢 בוצע
- description: לבדוק שיש `loading / empty / error / success`
- input:
  - `screenTemplate`
  - `screenStates`
- output:
  - `stateCoverageValidation`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

30. `Create consistency validator`  | סטטוס: 🟢 בוצע
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

31. `Create screen review assembler`  | סטטוס: 🟢 בוצע
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

32. `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד להצגת תובנות למידה, patterns, confidence ו־recommendation reasoning ב־UI
- input:
  - `learningInsights`
  - `learningTrace`
- output:
  - `learningInsightViewModel`
- dependencies:
  - `Learning Layer`
- connects_to: `Project State`

33. `Create recommendation reasoning panel contract`  | סטטוס: 🟢 בוצע
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

34. `Create pattern confidence indicator`  | סטטוס: 🟢 בוצע
- description: לבנות רכיב שמציג למשתמש אם pattern מסוים מבוסס היטב, חלש או רק השערה
- input:
  - `learningInsightViewModel`
- output:
  - `confidenceIndicator`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

35. `Create user preference signal view`  | סטטוס: 🟢 בוצע
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

36. `Create cross-project pattern disclosure panel`  | סטטוס: 🟢 בוצע
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

37. `Create passive learning disclosure banner`  | סטטוס: 🟢 בוצע
- description: לבנות banner שמבהיר שה־AI הלומדת רק מסיקה וממליצה, ולא מבצעת פעולות בפועל
- input:
  - `learningInsights`
- output:
  - `learningDisclosure`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

38. `Create AI learning workspace template`  | סטטוס: 🟢 בוצע
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

39. `Define AI companion presence schema`  | סטטוס: 🟢 בוצע
- description: לבנות schema אחיד לנוכחות הוויזואלית של ה־AI כולל states, tone, urgency ו־visibility rules
- input:
  - `assistantState`
  - `interactionContext`
- output:
  - `companionPresence`
- dependencies:
  - `Screen UX Contracts`
- connects_to: `Project State`

40. `Create companion state model`  | סטטוס: 🟢 בוצע
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

41. `Create companion trigger policy`  | סטטוס: 🟢 בוצע
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

42. `Create companion message priority resolver`  | סטטוס: 🟢 בוצע
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

43. `Create companion dock and panel contract`  | סטטוס: 🟢 בוצע
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

44. `Create companion animation state rules`  | סטטוס: 🟢 בוצע
- description: להגדיר שפת אנימציה מתונה לדמות ה־AI לפי state, urgency ו־non-blocking rules
- input:
  - `companionState`
  - `companionTriggerDecision`
- output:
  - `animationStateRules`
- dependencies:
  - `Create companion state model`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

45. `Create companion mode controls`  | סטטוס: 🟢 בוצע
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

46. `Create companion interruption guard`  | סטטוס: 🟢 בוצע
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

47. `Create AI companion workspace template`  | סטטוס: 🟢 בוצע
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

48. `Define context relevance schema`  | סטטוס: 🟢 בוצע
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

49. `Create context relevance filter`  | סטטוס: 🟢 בוצע
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

50. `Create context slimming pipeline`  | סטטוס: 🟢 בוצע
- description: לבנות pipeline שממיר context גדול ל־minimal execution context עם summaries, drops ו־priority ordering לפני שליחה ל־AI או ל־provider
- input:
  - `relevanceFilteredContext`
  - `tokenBudget`
- output:
  - `slimmedContextPayload`
  - `droppedContextSummary`
- dependencies:
  - `Create context relevance filter`  | סטטוס: 🟢 בוצע
  - `AI Learning UX`
- connects_to: `Execution Surface`

51. `Define editable proposal schema`  | סטטוס: 🟢 בוצע
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

52. `Create proposal editing system`  | סטטוס: 🟢 בוצע
- description: לבנות מערכת עריכה שמאפשרת למשתמש לשנות proposal קיים, להשאיר annotations וליצור revised proposal בלי לשבור את ה־history
- input:
  - `editableProposal`
  - `userEditInput`
- output:
  - `editedProposal`
  - `proposalEditHistory`
- dependencies:
  - `Define editable proposal schema`  | סטטוס: 🟢 בוצע
  - `Project State`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

53. `Create partial acceptance flow`  | סטטוס: 🟢 בוצע
- description: לבנות flow שמאפשר לאשר חלק מהצעה, לדחות חלק אחר, ולהחזיר רק את החלקים הבעייתיים ל־regeneration או review נוסף
- input:
  - `editedProposal`
  - `approvalOutcome`
- output:
  - `partialAcceptanceDecision`
  - `remainingProposalScope`
- dependencies:
  - `Create proposal editing system`  | סטטוס: 🟢 בוצע
  - `Define approval outcome schema`  | סטטוס: 🟡 חלקי
- connects_to: `Execution Surface`

##### `Real-Time Experience Layer`

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

2. `Create live update transport layer`  | סטטוס: 🟢 בוצע
- description: לבנות transport לשידור updates חיים ל־UI בלי רענון ידני
- input:
  - `realtimeEventStream`
- output:
  - `liveUpdateChannel`
- dependencies:
  - `Define real-time event stream schema`  | סטטוס: 🟢 בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create live log streaming module`  | סטטוס: 🟢 בוצע
- description: לבנות מודול שמזריק command outputs ולוגים ל־terminal view בזמן אמת
- input:
  - `liveUpdateChannel`
  - `formattedLogs`
- output:
  - `liveLogStream`
- dependencies:
  - `Create live update transport layer`  | סטטוס: 🟢 בוצע
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
  - `Create live update transport layer`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

##### `Collaboration Layer`

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

2. `Create project presence model`  | סטטוס: 🟢 בוצע
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

3. `Create project comments and review threads module`  | סטטוס: 🟢 בוצע
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

4. `Create shared approval flow model`  | סטטוס: 🟢 בוצע
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

5. `Create collaboration activity feed`  | סטטוס: 🟢 בוצע
- description: לבנות feed של פעולות צוות, comments, approvals ו־workspace transitions ברמת הפרויקט
- input:
  - `collaborationEvent`
  - `projectPresenceState`
- output:
  - `collaborationFeed`
- dependencies:
  - `Create project presence model`  | סטטוס: 🟢 בוצע
  - `Create project comments and review threads module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

##### `Project State Versioning`

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

#### Wave 1 Internal Execution Order

כדי שלא נלך לאיבוד בתוך `Wave 1`, סדר העבודה הפנימי הוא:

1. `User Flow System`
- `Define primary user journeys`
- `Create journey map for core flows`
- `Define screen inventory`
- `Create screen-to-flow mapping`

2. `Entry, Authentication And Project Creation`
- `Create authentication system`
- `Create signup / login / logout API`
- `Create session and token management`
- `Create authentication route resolver`
  - `Build authentication screen states`
  - `Define project draft schema`
  - `Create post-auth redirect resolver`
- `Create post-auth redirect resolver`
- `Define project draft schema`
- `Create project draft creation service`
- `Create project creation experience model`
- `Create post-project-creation redirect resolver`

3. `Onboarding To Initial State`
- `Create onboarding session service`
- `Create onboarding step resolver`
- `Create onboarding command handlers`
- `Create onboarding API endpoints`
- `Create onboarding progress model`
- `Build onboarding screen flow`
- `Create onboarding completion evaluator`
- `Create onboarding-to-state handoff contract`
- `Define initial project state creation contract`
- `Define canonical initial project state schema`
- `Create onboarding-to-state transformation mapper`
- `Create project state bootstrap service`
- `Create initial project state validation module`

4. `First Task And Result Presentation`
- `Create initial task seeding service`
- `Create next task selection resolver`
- `Create next task presentation model`
- `Create next task approval handoff panel`
- `Create recommendation display contract`
- `Create recommendation summary panel`
- `Bind project explanation to cockpit recommendation surface`
- `Create first value summary assembler`

5. `Screen UX Contracts Foundation`
- `Define screen contract schema`
- `Create goal and CTA definition module`

6. `UI Contracts Completion`
- `Create mobile readiness checklist`
- `Create loading empty error states definition`
- `Create screen validation checklist`

7. `Design System`
- `Define design token schema`
- `Create typography system`
- `Create spacing and layout system`
- `Create color usage rules`
- `Create interaction states system`

8. `Component Library`
- `Define component contract schema`
- `Create primitive components`
- `Create layout components`
- `Create feedback components`
- `Create navigation components`
- `Create data display components`

9. `Screen Templates`
- `Define screen template schema`
- `Create dashboard template`
- `Create detail page template`
- `Create workflow template`
- `Create list and management template`
- `Create state-driven template variants`

10. `UI Review`
- `Create primary action validator`
- `Create mobile usability validator`
- `Create state coverage validator`
- `Create consistency validator`
- `Create screen review assembler`

11. `AI Learning UX`
- `Define learning insight UI schema`
- `Create recommendation reasoning panel contract`
- `Create pattern confidence indicator`
- `Create user preference signal view`
- `Create cross-project pattern disclosure panel`
- `Create passive learning disclosure banner`
- `Create AI learning workspace template`

12. `AI Companion Experience`
- `Define AI companion presence schema`
- `Create companion state model`
- `Create companion trigger policy`
- `Create companion message priority resolver`
- `Create companion dock and panel contract`
- `Create companion animation state rules`
- `Create companion mode controls`
- `Create companion interruption guard`
- `Create AI companion workspace template`

13. `Context Relevance & Reduction`
- `Define context relevance schema`
- `Create context relevance filter`
- `Create context slimming pipeline`

14. `Human Editing & Partial Acceptance`
- `Define editable proposal schema`
- `Create proposal editing system`
- `Create partial acceptance flow`

15. `Real-Time Experience Layer`
- `Define real-time event stream schema`
- `Create live update transport layer`
- `Create live log streaming module`
- `Create reactive workspace refresh model`

16. `Collaboration Layer`
- `Define collaboration event schema`
- `Create project presence model`
- `Create project comments and review threads module`
- `Create shared approval flow model`
- `Create collaboration activity feed`

17. `Project State Versioning`
- `Define project state snapshot schema`
- `Create project snapshot store`
- `Create state diff and compare module`
- `Create project state restore resolver`
- `Create project rollback execution module`

#### Wave 1 Validation Gate

מה בודקים לפני שממשיכים:
- האם Nexus מרגישה כמוצר coherent ולא כאוסף payloads
- האם מסלול `entry -> auth -> project creation -> onboarding -> initial state` עובד כזרימה אחת ברורה
- האם מסכי העבודה מחזיקים context ברור
- האם state changes ברורים למשתמש
- האם recommendation מוצגת בצורה קריאה עם `why now`, `impact`, `CTA` ו־approval handoff ברור
- האם proposal editing ו־partial acceptance עובדים בלי לשבור history ובלי לבלבל את המשתמש
- האם real-time/progress מרגישים חיים ולא מרעישים
- האם collaboration/versioning מוסיפים שליטה ולא בלבול

אם יש באגים:
- פותחים קובץ validation ל־Wave 1
- מתקנים רק את מה שחוסם מעבר לגל הבא

---

#### Wave 1 Locked Execution Scope — Minimum Real User Flow

```text
execution_order | task name | למה היא חובה
1 | Create app landing entry experience | נדרש כדי שלמשתמש תהיה נקודת כניסה ראשית ל־app
2 | Create authentication route resolver | נדרש כדי להכריע אם המשתמש רואה login/signup/restore/redirect
3 | Build authentication screen states | נדרש כדי שהמשתמש יוכל להירשם או להתחבר בפועל
4 | Create protected workspace access gate | נדרש כדי למנוע כניסה לזרימות הפרויקט בלי session תקין
5 | Create post-auth redirect resolver | נדרש כדי להעביר את המשתמש מה־auth ליצירת פרויקט או workbench
6 | Create project draft creation service | נדרש כדי ליצור project draft שממנו ממשיכים הלאה
7 | Create project creation experience model | נדרש כדי שלמשתמש יהיה flow מפורש של יצירת פרויקט
8 | Create onboarding progress model | נדרש כדי לנהל את התקדמות ה־onboarding
9 | Create onboarding answer persistence store | נדרש כדי לשמור תשובות onboarding ולאפשר המשך תקין
10 | Create onboarding completion evaluator | נדרש כדי להחליט אם אפשר לסיים onboarding
11 | Create onboarding-to-state handoff contract | נדרש כדי להעביר intake תקין לבניית state
12 | Build onboarding screen flow | נדרש כדי שהמשתמש יעבור onboarding מלא בפועל
13 | Create project ownership binding model | נדרש כדי לקשור את הפרויקט למשתמש ול־workspace
14 | Define initial project state creation contract | נדרש כדי לקבע מה חייב להיכנס ל־initial state
15 | Define canonical initial project state schema | נדרש כדי של־Project State יהיה מבנה קנוני
16 | Create onboarding-to-state transformation mapper | נדרש כדי לתרגם onboarding ל־state שמיש
17 | Create project state bootstrap service | נדרש כדי לייצר Project State אמיתי
18 | Create initial project state validation module | נדרש כדי לוודא שה־state שנוצר תקין לפני המשך
19 | Create initial state readiness classifier | נדרש כדי לדעת אם אפשר להתקדם ליצירת עבודה
20 | Define initial task schema | נדרש כדי שלמשימות הראשונות יהיה מבנה ישיר וברור
21 | Define initial task graph schema | נדרש כדי לקשור בין המשימות הראשונות בגרף עבודה
22 | Create project-state-to-task transformation mapper | נדרש כדי לתרגם state ראשוני ל־task seed payload
23 | Create initial task seeding service | נדרש כדי לייצר backlog ראשוני
24 | Create task prioritization evaluator | נדרש כדי לדרג את המשימות הראשונות
25 | Define scheduler decision schema | נדרש כדי להחזיק החלטת scheduler ברורה
26 | Create next task selection resolver | נדרש כדי לבחור משימה אחת לביצוע
27 | Create scheduler decision persistence record | נדרש כדי לשמור את הבחירה ולהשתמש בה בהמשך ה־flow
28 | Define prompt provider contract | נדרש כדי לאפשר בניית prompt מבוקרת ל־execution
29 | Create contextual prompt assembler | נדרש כדי להרכיב prompt אמיתי מתוך state ו־task
30 | Define execution action routing schema | נדרש כדי למפות action לביצוע בפועל
31 | Create action-to-provider mapping resolver | נדרש כדי לבחור provider/executor מתאים
32 | Create secret resolution module | נדרש כדי לספק credentials/config ל־execution בלי לחשוף אותם
33 | Create external execution dispatch module | נדרש כדי לשלוח את הפעולה לביצוע אמיתי
34 | Create execution invocation contract | נדרש כדי להחזיק invocation עקבי לריצה
35 | Create artifact collection pipeline | נדרש כדי לאסוף logs/files/diffs מההרצה
36 | Create canonical execution result envelope | נדרש כדי לאחד את תוצאת ההרצה לפורמט שמיש
37 | Create execution result interpretation module | נדרש כדי לפרש מה באמת קרה בהרצה
38 | Create project state update module | נדרש כדי לעדכן Project State אחרי execution
39 | Create task graph update module | נדרש כדי לעדכן את גרף העבודה אחרי execution
40 | Create progress tracking state model | נדרש כדי לחשב progress מצטבר אחרי ההרצה
41 | Create diff and change explanation model | נדרש כדי להראות מה השתנה
42 | Create next task presentation model | נדרש כדי להראות למשתמש איזו משימה נבחרה
43 | Create human approval handoff state | נדרש כדי לייצג את שלב האישור אם הוא נדרש
44 | Create next task approval handoff panel | נדרש כדי להראות למשתמש את approval handoff במסך העבודה
45 | Bind scheduler decision to project brain workspace | נדרש כדי לחבר את בחירת המשימה ל־workbench
46 | Create recommendation display contract | נדרש כדי להציג recommendation קריאה וברורה
47 | Create recommendation summary panel | נדרש כדי לרכז את ההמלצה במקום אחד
48 | Create recommendation presentation state | נדרש כדי להציג recommendation מלאה עם CTA
49 | Create workbench access entry resolver | נדרש כדי להכניס את המשתמש ל־workbench הנכון
50 | Create context visibility model | נדרש כדי להראות context רלוונטי ל־next step
51 | Create logs visibility model | נדרש כדי להראות logs מההרצה
52 | Create diff visibility model | נדרש כדי להראות את השינויים בפועל
53 | Create next-step visibility model | נדרש כדי להראות למשתמש מה הצעד הבא
```

מספר המשימות הכולל: `53`
- אפשר להריץ flow אמיתי: `yes`

### Wave 2 — Trust, Reliability And Security

מטרה:
- להפוך את Nexus למערכת שאפשר לסמוך עליה עם משתמשים אמיתיים, פרויקטים אמיתיים ו־state אמיתי.

נכנס מ־source of truth:
- `Platform Observability`
- `Backup & Recovery`
- `Security Hardening`
- `Project Permission Matrix`
- `Multi-Tenancy & Workspace Isolation`

סדר עבודה בתוך הגל:
1. `Platform Observability`
2. `Backup & Recovery`
3. `Security Hardening`
4. `Project Permission Matrix`
5. `Multi-Tenancy & Workspace Isolation`

למה הגל הזה שני:
- כי אחרי שהמוצר usable יותר, צריך להפוך אותו ליציב, בטוח ומופרד.
- זה הגל שמבדיל בין demo יפה למערכת שאפשר להפעיל באמת.

#### Wave 2 Validation Gate

מה בודקים לפני שממשיכים:
- health / readiness / alerts
- incident visibility
- restore / snapshot / recovery
- permission correctness
- workspace isolation
- security flows שלא נשברים בקלות

---

### Wave 3 — Measurement, Cost And Monetization

מטרה:
- לאפשר ל־Nexus למדוד את עצמה, לנהל עלויות, להבין usage ולחייב בצורה מבוקרת.

נכנס מ־source of truth:
- `Platform Cost & Usage Control`
- `Billing & Monetization System`
- `Nexus Product Analytics`

סדר עבודה בתוך הגל:
1. `Nexus Product Analytics`
2. `Platform Cost & Usage Control`
3. `Billing & Monetization System`

למה analytics לפני billing:
- קודם צריך להבין שימוש, activation, retention ועלות
- אחר כך אפשר לבנות monetization בלי לטוס עיוור

#### Wave 3 Validation Gate

מה בודקים לפני שממשיכים:
- האם אפשר למדוד activation / retention / usage
- האם אפשר להבין cost per workspace / action / project
- האם billing events אמינים
- האם אין פער בין usage אמיתי לבין usage מדווח

---

### Wave 4 — Owner And Go-To-Market

מטרה:
- להפוך את Nexus למוצר שאפשר גם להפעיל, לגדל, ולנהל כבעלים.

נכנס מ־source of truth:
- `Nexus Product Go-To-Market`
- `Owner Control Plane`

סדר עבודה בתוך הגל:
1. `Nexus Product Go-To-Market`
2. `Owner Control Plane`

למה owner לא ראשון:
- owner plane חשוב, אבל לא נכון לבנות אותו מעל מערכת שעוד לא usable, stable ומדידה
- owner layer צריכה לשבת על product signals אמיתיים

#### Wave 4 Validation Gate

מה בודקים:
- funnel / acquisition / onboarding entry
- owner daily overview
- incident visibility
- revenue / cost / usage / retention view
- operator confidence בקבלת החלטות

---

## Execution Rules

כללים מחייבים לעבודה על `v2`:
- עובדים רק על הגל הפעיל
- כל משימה נלקחת מה־source of truth המקורי
- בסוף כל משימה:
  - מעדכנים סטטוס
  - מעדכנים אחוז התקדמות של הגל
  - ומעדכנים אחוז התקדמות של `v2`
- בסוף כל גל:
  - לא ממשיכים אוטומטית
  - קודם עושים validation מלא
  - אחר כך bug fixing
  - ורק אז החלטה להמשיך

---

## Definition Of Done For v2

`v2` תיחשב גמורה רק אם:
- כל 4 הגלים הושלמו
- כל 4 ה־validation gates עברו
- אין באגים קריטיים פתוחים
- Nexus מרגישה כמו מוצר אמיתי, לא רק מערכת חכמה שעובדת
- אפשר להפעיל אותה בסביבה מבוקרת עם משתמשים חיצוניים אמיתיים

---

## Start Point

הגל הראשון של `v2` הוא:
- `Wave 1 — Product Experience`

המשימה הראשונה לבחירה צריכה להגיע מתוך:
- `UI / UX Foundation`
