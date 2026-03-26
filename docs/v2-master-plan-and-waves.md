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
- `Wave 1`: `33%`
- `v2` כולל: `33%`

איך האחוז מחושב:
- `Wave 1` מחושב לפי מספר המשימות שסומנו `🟢` מתוך כלל המשימות הממופות לגל
- כרגע ב־`Wave 1` הושלמו:
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
- סך המשימות הממופות ל־`Wave 1`: `55`
- הושלמו: `18 / 55`

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

1. `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך כללי שימושיות במובייל
- input:
  - `screenContract`
- output:
  - `mobileChecklist`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

2. `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- description: להגדיר לכל מסך מצבי `loading`, `empty`, `error`, `success`
- input:
  - `screenContract`
- output:
  - `screenStates`
- dependencies:
  - `Define screen contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

3. `Create screen validation checklist`  | סטטוס: 🟢 בוצע
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

4. `Define design token schema`  | סטטוס: 🟢 בוצע
- description: להגדיר tokens לצבעים, spacing, typography, radius, borders, shadows
- input:
  - `brandDirection`
- output:
  - `designTokens`
- dependencies:
  - `UI / UX Foundation`
- connects_to: `Project State`

5. `Create typography system`  | סטטוס: 🟢 בוצע
- description: להגדיר scale קבוע לכותרות, טקסט גוף, labels ו־meta text
- input:
  - `designTokens`
- output:
  - `typographySystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

6. `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- description: להגדיר grid, spacing scale, container widths ו־section rhythm
- input:
  - `designTokens`
- output:
  - `layoutSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

7. `Create color usage rules`  | סטטוס: 🟢 בוצע
- description: להגדיר מתי משתמשים בכל צבע, כולל states
- input:
  - `designTokens`
- output:
  - `colorRules`
- dependencies:
  - `Define design token schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

8. `Create interaction states system`  | סטטוס: 🟢 בוצע
- description: להגדיר hover, active, focus, disabled, destructive, success, warning
- input:
  - `designTokens`
- output:
  - `interactionStateSystem`
- dependencies:
  - `Define design token schema`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

9. `Define component contract schema`  | סטטוס: 🟢 בוצע
- description: להגדיר חוזה אחיד לכל רכיב
- input:
  - `componentType`
- output:
  - `componentContract`
- dependencies:
  - `Design System`
- connects_to: `Project State`

10. `Create primitive components`  | סטטוס: 🟢 בוצע
- description: לבנות רכיבי בסיס כמו button, input, textarea, select, badge, icon button
- input:
  - `componentContract`
  - `designTokens`
- output:
  - `primitiveComponents`
- dependencies:
  - `Define component contract schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

11. `Create layout components`  | סטטוס: 🟢 בוצע
- description: לבנות container, section, stack, grid, panel, divider
- input:
  - `layoutSystem`
- output:
  - `layoutComponents`
- dependencies:
  - `Create spacing and layout system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

12. `Create feedback components`  | סטטוס: 🟢 בוצע
- description: לבנות loading, empty state, error state, toast, banner, progress, skeleton
- input:
  - `interactionStateSystem`
- output:
  - `feedbackComponents`
- dependencies:
  - `Create interaction states system`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

13. `Create navigation components`  | סטטוס: 🟢 בוצע
- description: לבנות sidebar, tabs, breadcrumb, topbar, stepper
- input:
  - `screenFlowMap`
- output:
  - `navigationComponents`
- dependencies:
  - `Create screen-to-flow mapping`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

14. `Create data display components`  | סטטוס: 🟢 בוצע
- description: לבנות table, stat card, activity log, timeline, key-value panel, status chip
- input:
  - `screenInventory`
- output:
  - `dataDisplayComponents`
- dependencies:
  - `Define screen inventory`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

15. `Define screen template schema`  | סטטוס: 🟢 בוצע
- description: להגדיר תבנית אחידה למסכים
- input:
  - `screenType`
- output:
  - `screenTemplateSchema`
- dependencies:
  - `Screen UX Contracts`
  - `Component Library`
- connects_to: `Project State`

16. `Create dashboard template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי overview ודשבורדים
- input:
  - `screenTemplateSchema`
- output:
  - `dashboardTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

17. `Create detail page template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי פרטים
- input:
  - `screenTemplateSchema`
- output:
  - `detailPageTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

18. `Create workflow template`  | סטטוס: 🟢 בוצע
- description: לבנות template למסכי flow ו־wizard
- input:
  - `screenTemplateSchema`
- output:
  - `workflowTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

19. `Create list and management template`  | סטטוס: 🔴 לא בוצע
- description: לבנות template למסכי רשימות, טבלאות וניהול
- input:
  - `screenTemplateSchema`
- output:
  - `managementTemplate`
- dependencies:
  - `Define screen template schema`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

20. `Create state-driven template variants`  | סטטוס: 🔴 לא בוצע
- description: לבנות וריאציות `loading / empty / error / success` לכל template
- input:
  - `screenStates`
  - `screenTemplates`
- output:
  - `templateVariants`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

21. `Create primary action validator`  | סטטוס: 🔴 לא בוצע
- description: לבדוק שלכל מסך יש פעולה ראשית ברורה
- input:
  - `screenContract`
  - `screenTemplate`
- output:
  - `primaryActionValidation`
- dependencies:
  - `Create goal and CTA definition module`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

22. `Create mobile usability validator`  | סטטוס: 🔴 לא בוצע
- description: לבדוק שהמסך usable במובייל
- input:
  - `screenTemplate`
  - `mobileChecklist`
- output:
  - `mobileValidation`
- dependencies:
  - `Create mobile readiness checklist`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

23. `Create state coverage validator`  | סטטוס: 🔴 לא בוצע
- description: לבדוק שיש `loading / empty / error / success`
- input:
  - `screenTemplate`
  - `screenStates`
- output:
  - `stateCoverageValidation`
- dependencies:
  - `Create loading empty error states definition`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

24. `Create consistency validator`  | סטטוס: 🔴 לא בוצע
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

25. `Create screen review assembler`  | סטטוס: 🔴 לא בוצע
- description: להרכיב report אחיד של איכות המסך
- input:
  - `primaryActionValidation`
  - `mobileValidation`
  - `stateCoverageValidation`
  - `consistencyValidation`
- output:
  - `screenReviewReport`
- dependencies:
  - `Create consistency validator`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

26. `Define learning insight UI schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד להצגת תובנות למידה, patterns, confidence ו־recommendation reasoning ב־UI
- input:
  - `learningInsights`
  - `learningTrace`
- output:
  - `learningInsightViewModel`
- dependencies:
  - `Learning Layer`
- connects_to: `Project State`

27. `Create recommendation reasoning panel contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות חוזה UI לפאנל שמסביר למה הומלצה משימה או פעולה מסוימת
- input:
  - `impactSummary`
  - `learningTrace`
  - `policyTrace`
- output:
  - `reasoningPanel`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🔴 לא בוצע
  - `Policy Layer`
- connects_to: `Project State`

28. `Create pattern confidence indicator`  | סטטוס: 🔴 לא בוצע
- description: לבנות רכיב שמציג למשתמש אם pattern מסוים מבוסס היטב, חלש או רק השערה
- input:
  - `learningInsightViewModel`
- output:
  - `confidenceIndicator`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

29. `Create user preference signal view`  | סטטוס: 🔴 לא בוצע
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

30. `Create cross-project pattern disclosure panel`  | סטטוס: 🔴 לא בוצע
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

31. `Create passive learning disclosure banner`  | סטטוס: 🔴 לא בוצע
- description: לבנות banner שמבהיר שה־AI הלומדת רק מסיקה וממליצה, ולא מבצעת פעולות בפועל
- input:
  - `learningInsights`
- output:
  - `learningDisclosure`
- dependencies:
  - `Define learning insight UI schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

32. `Create AI learning workspace template`  | סטטוס: 🔴 לא בוצע
- description: לבנות template למסך ייעודי של תובנות למידה, patterns והמלצות משופרות
- input:
  - `screenTemplateSchema`
  - `learningInsightViewModel`
- output:
  - `aiLearningWorkspaceTemplate`
- dependencies:
  - `Screen Template System`
  - `Define learning insight UI schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

33. `Define AI companion presence schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד לנוכחות הוויזואלית של ה־AI כולל states, tone, urgency ו־visibility rules
- input:
  - `assistantState`
  - `interactionContext`
- output:
  - `companionPresence`
- dependencies:
  - `Screen UX Contracts`
- connects_to: `Project State`

34. `Create companion state model`  | סטטוס: 🔴 לא בוצע
- description: לבנות state model לדמות ה־AI עם מצבים כמו observing, analyzing, recommending, warning ו־waiting
- input:
  - `learningInsights`
  - `decisionIntelligence`
  - `notificationPayload`
- output:
  - `companionState`
- dependencies:
  - `Define AI companion presence schema`  | סטטוס: 🔴 לא בוצע
  - `AI Learning UX`
- connects_to: `Project State`

35. `Create companion trigger policy`  | סטטוס: 🔴 לא בוצע
- description: לבנות מדיניות שמכריעה מתי ה־AI companion מופיע, מתי נשאר שקט ומתי מותר לו להפריע
- input:
  - `companionState`
  - `policyTrace`
  - `executionStatus`
- output:
  - `companionTriggerDecision`
- dependencies:
  - `Create companion state model`  | סטטוס: 🔴 לא בוצע
  - `Policy Layer`
- connects_to: `Project State`

36. `Create companion message priority resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמסווג הודעות companion לפי advisory, recommendation, warning ו־critical
- input:
  - `learningInsights`
  - `gatingDecision`
  - `notificationPayload`
- output:
  - `companionMessagePriority`
- dependencies:
  - `Create companion state model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

37. `Create companion dock and panel contract`  | סטטוס: 🔴 לא בוצע
- description: לבנות חוזה UI ל־dock/panel קבוע של ה־AI companion עם summary, suggestions ו־next actions
- input:
  - `companionPresence`
  - `companionMessagePriority`
- output:
  - `companionDock`
  - `companionPanel`
- dependencies:
  - `Define AI companion presence schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

38. `Create companion animation state rules`  | סטטוס: 🔴 לא בוצע
- description: להגדיר שפת אנימציה מתונה לדמות ה־AI לפי state, urgency ו־non-blocking rules
- input:
  - `companionState`
  - `companionTriggerDecision`
- output:
  - `animationStateRules`
- dependencies:
  - `Create companion state model`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

39. `Create companion mode controls`  | סטטוס: 🔴 לא בוצע
- description: לבנות שליטה של המשתמש בין מצבי quiet, assistive ו־active עבור ה־AI companion
- input:
  - `userPreferenceProfile`
  - `companionPresence`
- output:
  - `companionModeSettings`
- dependencies:
  - `Create companion dock and panel contract`  | סטטוס: 🔴 לא בוצע
  - `AI Learning UX`
- connects_to: `Project State`

40. `Create companion interruption guard`  | סטטוס: 🔴 לא בוצע
- description: לבנות guard שמונע מה־AI companion להפריע בזמן execution קריטי או approval flow רגיש
- input:
  - `companionTriggerDecision`
  - `gatingDecision`
  - `progressState`
- output:
  - `interruptionDecision`
- dependencies:
  - `Create companion trigger policy`  | סטטוס: 🔴 לא בוצע
  - `Approval System`  | סטטוס: 🟡 חלקי
- connects_to: `Project State`

41. `Create AI companion workspace template`  | סטטוס: 🔴 לא בוצע
- description: לבנות template למסכי Nexus שבהם ה־AI companion חי כשותף דיגיטלי ולא רק כפאנל טכני
- input:
  - `screenTemplateSchema`
  - `companionDock`
  - `companionPanel`
- output:
  - `aiCompanionTemplate`
- dependencies:
  - `Screen Template System`
  - `Create companion dock and panel contract`  | סטטוס: 🔴 לא בוצע
- connects_to: `Execution Surface`

##### `Real-Time Experience Layer`

1. `Define real-time event stream schema`  | סטטוס: 🔴 לא בוצע
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

2. `Create live update transport layer`  | סטטוס: 🔴 לא בוצע
- description: לבנות transport לשידור updates חיים ל־UI בלי רענון ידני
- input:
  - `realtimeEventStream`
- output:
  - `liveUpdateChannel`
- dependencies:
  - `Define real-time event stream schema`  | סטטוס: 🔴 לא בוצע
  - `Application Runtime Layer`
- connects_to: `Execution Surface`

3. `Create live log streaming module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמזריק command outputs ולוגים ל־terminal view בזמן אמת
- input:
  - `liveUpdateChannel`
  - `formattedLogs`
- output:
  - `liveLogStream`
- dependencies:
  - `Create live update transport layer`  | סטטוס: 🔴 לא בוצע
  - `Create terminal and command console view`  | סטטוס: 🟢 בוצע
- connects_to: `Execution Surface`

4. `Create reactive workspace refresh model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model שמעדכן panels, progress bars, diff states ו־artifact views בזמן אמת
- input:
  - `liveUpdateChannel`
  - `developerWorkspace`
- output:
  - `reactiveWorkspaceState`
- dependencies:
  - `Create live update transport layer`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

##### `Collaboration Layer`

1. `Define collaboration event schema`  | סטטוס: 🔴 לא בוצע
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

2. `Create project presence model`  | סטטוס: 🔴 לא בוצע
- description: לבנות model שמציג מי נמצא כרגע בפרויקט, באיזה workspace ובאיזה context הוא עובד
- input:
  - `collaborationEvent`
  - `userSessionMetric`
- output:
  - `projectPresenceState`
- dependencies:
  - `Define collaboration event schema`  | סטטוס: 🔴 לא בוצע
  - `User Activity & Retention`
- connects_to: `Project State`

3. `Create project comments and review threads module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול ל־comments, review threads ו־contextual discussion על files, diffs, approvals ו־release steps
- input:
  - `collaborationEvent`
  - `branchDiffActivityPanel`
- output:
  - `reviewThreadState`
- dependencies:
  - `Define collaboration event schema`  | סטטוס: 🔴 לא בוצע
  - `Create branch and diff activity panel`  | סטטוס: 🟢 בוצע
- connects_to: `Project State`

4. `Create shared approval flow model`  | סטטוס: 🔴 לא בוצע
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

5. `Create collaboration activity feed`  | סטטוס: 🔴 לא בוצע
- description: לבנות feed של פעולות צוות, comments, approvals ו־workspace transitions ברמת הפרויקט
- input:
  - `collaborationEvent`
  - `projectPresenceState`
- output:
  - `collaborationFeed`
- dependencies:
  - `Create project presence model`  | סטטוס: 🔴 לא בוצע
  - `Create project comments and review threads module`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

##### `Project State Versioning`

1. `Define project state snapshot schema`  | סטטוס: 🔴 לא בוצע
- description: לבנות schema אחיד ל־project snapshots כולל state version, execution graph version, workspace reference ו־restore metadata
- input:
  - `projectState`
  - `executionGraph`
- output:
  - `projectStateSnapshot`
- dependencies:
  - `Nexus Persistence Layer`
- connects_to: `Project State`

2. `Create project snapshot store`  | סטטוס: 🔴 לא בוצע
- description: לבנות storage לשמירת snapshots לפני שינויים גדולים כמו bootstrap, migration, deploy או mass edits
- input:
  - `projectStateSnapshot`
- output:
  - `snapshotRecord`
- dependencies:
  - `Define project state snapshot schema`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

3. `Create state diff and compare module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול להשוואה בין snapshots ולזיהוי שינויים ברמת state, graph ו־artifacts
- input:
  - `snapshotRecord`
  - `comparisonTarget`
- output:
  - `stateDiff`
- dependencies:
  - `Create project snapshot store`  | סטטוס: 🔴 לא בוצע
- connects_to: `Project State`

4. `Create project state restore resolver`  | סטטוס: 🔴 לא בוצע
- description: לבנות resolver שמכריע אם ואיך ניתן לשחזר snapshot מלא או חלקי לפי failure scope, approvals ו־side effects
- input:
  - `snapshotRecord`
  - `rollbackPlan`
- output:
  - `restoreDecision`
- dependencies:
  - `Create project snapshot store`  | סטטוס: 🔴 לא בוצע
  - `Failure Recovery & Rollback`
- connects_to: `Project State`

5. `Create project rollback execution module`  | סטטוס: 🔴 לא בוצע
- description: לבנות מודול שמבצע restore בפועל ל־state, workspace ו־linked metadata כשהוחלט על rollback
- input:
  - `restoreDecision`
  - `snapshotRecord`
- output:
  - `rollbackExecutionResult`
- dependencies:
  - `Create project state restore resolver`  | סטטוס: 🔴 לא בוצע
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

#### Wave 1 Internal Execution Order

כדי שלא נלך לאיבוד בתוך `Wave 1`, סדר העבודה הפנימי הוא:

1. `UI Contracts Completion`
- `Create mobile readiness checklist`
- `Create loading empty error states definition`
- `Create screen validation checklist`

2. `Design System`
- `Define design token schema`
- `Create typography system`
- `Create spacing and layout system`
- `Create color usage rules`
- `Create interaction states system`

3. `Component Library`
- `Define component contract schema`
- `Create primitive components`
- `Create layout components`
- `Create feedback components`
- `Create navigation components`
- `Create data display components`

4. `Screen Templates`
- `Define screen template schema`
- `Create dashboard template`
- `Create detail page template`
- `Create workflow template`
- `Create list and management template`
- `Create state-driven template variants`

5. `UI Review`
- `Create primary action validator`
- `Create mobile usability validator`
- `Create state coverage validator`
- `Create consistency validator`
- `Create screen review assembler`

6. `AI Learning UX`
- `Define learning insight UI schema`
- `Create recommendation reasoning panel contract`
- `Create pattern confidence indicator`
- `Create user preference signal view`
- `Create cross-project pattern disclosure panel`
- `Create passive learning disclosure banner`
- `Create AI learning workspace template`

7. `AI Companion Experience`
- `Define AI companion presence schema`
- `Create companion state model`
- `Create companion trigger policy`
- `Create companion message priority resolver`
- `Create companion dock and panel contract`
- `Create companion animation state rules`
- `Create companion mode controls`
- `Create companion interruption guard`
- `Create AI companion workspace template`

8. `Real-Time Experience Layer`
- `Define real-time event stream schema`
- `Create live update transport layer`
- `Create live log streaming module`
- `Create reactive workspace refresh model`

9. `Collaboration Layer`
- `Define collaboration event schema`
- `Create project presence model`
- `Create project comments and review threads module`
- `Create shared approval flow model`
- `Create collaboration activity feed`

10. `Project State Versioning`
- `Define project state snapshot schema`
- `Create project snapshot store`
- `Create state diff and compare module`
- `Create project state restore resolver`
- `Create project rollback execution module`

#### Wave 1 Validation Gate

מה בודקים לפני שממשיכים:
- האם Nexus מרגישה כמוצר coherent ולא כאוסף payloads
- האם מסכי העבודה מחזיקים context ברור
- האם state changes ברורים למשתמש
- האם real-time/progress מרגישים חיים ולא מרעישים
- האם collaboration/versioning מוסיפים שליטה ולא בלבול

אם יש באגים:
- פותחים קובץ validation ל־Wave 1
- מתקנים רק את מה שחוסם מעבר לגל הבא

---

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
