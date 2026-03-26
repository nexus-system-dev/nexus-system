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

1. `Create onboarding session service`
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
  - `Canonical Schema`
  - `Project State`
- connects_to: `Project State`

2. `Create project intake parser`
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
  - `Context Builder`
  - `Knowledge Ingestion`
- connects_to: `Project State`

3. `Create onboarding step resolver`
- description: לבנות מודול שקובע איזה שלב onboarding להציג עכשיו לפי מצב הקליטה ומה עדיין חסר
- input:
  - `onboardingSession`
  - `projectIntake`
- output:
  - `currentStep`
  - `nextStep`
  - `requiredActions`
- dependencies:
  - `Project State`
- connects_to: `Project State`

4. `Create onboarding command handlers`
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

1. `Create onboarding action registry`
- description: לבנות registry שממפה `actionType` ל־handler מתאים עם ולידציה בסיסית לכל פעולה
- input:
  - `actionType`
  - `payload`
- output:
  - `resolvedHandler`
  - `actionSchema`
- dependencies:
  - `Create onboarding session service`
- connects_to: `Project State`

2. `Create project draft mutation handler`
- description: לבנות handler שמעדכן `projectDraft` עבור פעולות יצירה ועדכון של טיוטת פרויקט
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `projectDraft`
- dependencies:
  - `Create onboarding session service`
- connects_to: `Project State`

3. `Create intake update handler`
- description: לבנות handler שמקבל טקסט, קבצים וקישורים ומעדכן את `projectIntake` של ה־session
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `projectIntake`
- dependencies:
  - `Create project intake parser`
- connects_to: `Project State`

4. `Create repo connection handler`
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

5. `Create approval capture handler`
- description: לבנות handler שמקבל אישורי משתמש ושומר אותם בפורמט אחיד
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `approvalRecord`
- dependencies:
  - `Create onboarding session service`
- connects_to: `Project State`

6. `Create onboarding step advancement handler`
- description: לבנות handler שמקדם את ה־session לשלב הבא לפי state ו־intake נוכחי
- input:
  - `sessionId`
  - `payload`
- output:
  - `updatedSession`
  - `currentStep`
  - `nextStep`
- dependencies:
  - `Create onboarding step resolver`
- connects_to: `Project State`

7. `Create onboarding command result envelope`
- description: לבנות envelope אחיד לתוצאות של כל command handler
- input:
  - `handlerResult`
- output:
  - `updatedSession`
  - `projectDraft`
  - `commandMetadata`
- dependencies:
  - `Create onboarding action registry`
- connects_to: `Project State`

5. `Create onboarding API endpoints`
- description: לבנות endpoints ליצירת session, עדכון intake, העלאת קבצים, קבלת step נוכחי וסיום onboarding
- input:
  - `http request`
- output:
  - `session payload`
  - `project draft payload`
- dependencies:
  - `Create onboarding session service`
  - `Create onboarding command handlers`
- connects_to: `Project State`

#### 2. `Universal Project Lifecycle`

Refinements מאושרים:
- להוסיף `canonical phase enum`
- להוסיף `domain-specific subphase mapping`

משימות טכניות:

1. `Define lifecycle state model`
- description: לבנות מודל פנימי לשלבי lifecycle אחידים של פרויקט
- input:
  - `project`
  - `domain`
- output:
  - `lifecycleState`
  - `currentPhase`
  - `phaseHistory`
- dependencies:
  - `Canonical Schema`
- connects_to: `Project State`

2. `Create lifecycle phase resolver`
- description: לבנות function שקובעת את שלב הפרויקט הנוכחי לפי state, graph, sources ו-results
- input:
  - `projectState`
  - `executionGraph`
  - `runtimeSignals`
- output:
  - `resolvedPhase`
  - `phaseConfidence`
- dependencies:
  - `Execution Graph`
  - `Project State`
- connects_to: `Project State`

3. `Create lifecycle transition engine`
- description: לבנות מנגנון שמעביר פרויקט בין שלבים לפי תנאי מעבר מוגדרים
- input:
  - `currentPhase`
  - `transitionEvents`
- output:
  - `nextPhase`
  - `transitionRecord`
- dependencies:
  - `Task Result Ingestion`
  - `Execution Graph`
- connects_to: `Execution Graph`

4. `Create lifecycle milestone generator`
- description: לבנות מודול שמייצר milestones אחידים לכל שלב lifecycle
- input:
  - `domain`
  - `lifecyclePhase`
- output:
  - `milestones`
  - `completionCriteria`
- dependencies:
  - `Domain-Aware Planner`
- connects_to: `Project State`

#### 3. `Expanded Domain Adaptation`

Refinements מאושרים:
- להוסיף `domain decision source`
- להוסיף `decision trace`

משימות טכניות:

1. `Extend domain registry`
- description: לבנות registry של domains עם config, signals, release targets ו-bootstrap rules
- input:
  - `domainDefinitions`
- output:
  - `domainRegistry`
- dependencies:
  - `Domain-Aware Planner`
- connects_to: `Project State`

2. `Create domain classification engine`
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
  - `Context Builder`
  - `Knowledge Ingestion`
- connects_to: `Project State`

3. `Create domain capability mapper`
- description: לבנות mapper שמתרגם domain לשדות context, task types ו-release targets רלוונטיים
- input:
  - `domain`
- output:
  - `domainCapabilities`
  - `requiredContextFields`
  - `executionModes`
- dependencies:
  - `Canonical Schema`
- connects_to: `Project State`

פירוק נוסף:

1. `Define domain capability schema`
- description: לבנות schema אחיד ליכולות דומיין, שדות context, execution modes ו־release targets
- input:
  - `domain`
- output:
  - `domainCapabilitySchema`
- dependencies:
  - `Canonical Schema`
- connects_to: `Project State`

2. `Create context field mapper`
- description: לבנות mapper שמתרגם domain לרשימת שדות context נדרשים
- input:
  - `domain`
- output:
  - `requiredContextFields`
- dependencies:
  - `Define domain capability schema`
- connects_to: `Project State`

3. `Create task family mapper`
- description: לבנות mapper שמתרגם domain למשפחות משימות רלוונטיות
- input:
  - `domain`
- output:
  - `taskFamilies`
- dependencies:
  - `Define domain capability schema`
- connects_to: `Execution Graph`

4. `Create execution mode mapper`
- description: לבנות mapper שמגדיר modes מועדפים של execution לפי domain
- input:
  - `domain`
- output:
  - `executionModes`
- dependencies:
  - `Define domain capability schema`
- connects_to: `Project State`

5. `Create release target mapper`
- description: לבנות mapper שמתרגם domain ל־release targets תקפים
- input:
  - `domain`
- output:
  - `releaseTargets`
- dependencies:
  - `Define domain capability schema`
- connects_to: `Project State`

6. `Create capability mapping assembler`
- description: לבנות assembler שמרכיב את כל ה־mappers לתוצר `domainCapabilities` אחד
- input:
  - `domain`
- output:
  - `domainCapabilities`
  - `requiredContextFields`
  - `executionModes`
- dependencies:
  - `Create context field mapper`
  - `Create task family mapper`
  - `Create execution mode mapper`
  - `Create release target mapper`
- connects_to: `Project State`

4. `Create domain-specific task template loader`
- description: לבנות loader של תבניות משימות, תלויות ו-milestones לפי domain
- input:
  - `domain`
  - `lifecyclePhase`
- output:
  - `taskTemplates`
  - `dependencyTemplates`
- dependencies:
  - `Domain-Aware Planner`
  - `Cross-Functional Task Graph`
- connects_to: `Execution Graph`

#### 4. `Smart Defaults Engine`

Refinements מאושרים:
- להוסיף `provisional defaults`
- להוסיף `defaults trace`

משימות טכניות:

1. `Create defaults rule engine`
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

1. `Define defaults input schema`
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

2. `Create defaults rule registry`
- description: לבנות registry של rules לפי domain, scope ו־constraint type
- input:
  - `normalizedDefaultsInput`
- output:
  - `applicableRules`
- dependencies:
  - `Define defaults input schema`
- connects_to: `Project State`

3. `Create defaults scoring module`
- description: לבנות מודול שמחשב ציון התאמה לכל ברירת מחדל אפשרית
- input:
  - `applicableRules`
  - `normalizedDefaultsInput`
- output:
  - `scoredDefaults`
- dependencies:
  - `Create defaults rule registry`
- connects_to: `Project State`

4. `Create defaults conflict resolver`
- description: לבנות מודול שפותר התנגשויות בין rules ומתעדף override נכון
- input:
  - `scoredDefaults`
- output:
  - `resolvedDefaults`
- dependencies:
  - `Create defaults scoring module`
- connects_to: `Project State`

5. `Create defaults trace builder`
- description: לבנות מודול שמסביר למה כל default נבחר
- input:
  - `resolvedDefaults`
  - `applicableRules`
- output:
  - `defaultsTrace`
- dependencies:
  - `Create defaults conflict resolver`
- connects_to: `Project State`

6. `Create recommended defaults assembler`
- description: לבנות assembler שמחזיר `recommendedDefaults` בפורמט קנוני
- input:
  - `resolvedDefaults`
  - `defaultsTrace`
- output:
  - `recommendedDefaults`
- dependencies:
  - `Create defaults trace builder`
- connects_to: `Project State`

2. `Create stack recommendation module`
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

3. `Create hosting and release defaults module`
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

4. `Create default approval generator`
- description: לבנות מודול שמסמן אילו ברירות מחדל אפשר להחיל אוטומטית ואילו דורשות אישור
- input:
  - `recommendedDefaults`
- output:
  - `autoApprovedDefaults`
  - `pendingApprovals`
- dependencies:
  - `Decision Intelligence Layer`
  - `Approval System`
- connects_to: `Project State`

---

### שלב 1 — הליבה הקנונית
המטרה: לבנות למערכת שפה פנימית אחת ומוח בסיסי נכון.

1. `Context Builder`
- לאחד `scan`, `casino API`, אפיון ידני, ונתונים חיצוניים למבנה אחד
- זה הבסיס לכל החלטה חכמה בהמשך
בוצע

2. `Canonical Schema`
- מודל פנימי אחיד של `project`, `state`, `gaps`, `flows`, `dependencies`, `risks`
- בלי זה כל חיבור חיצוני ישבור את המערכת
בוצע

3. `Source Adapter Layer`
- להפריד בין מה שהקזינו מחזיר לבין איך `Nexus` חושבת
- לכל source יהיה adapter משלו
- לא לערבב שדות עסקיים של קזינו בתוך הליבה
בוצע

4. להוסיף `metadata` של אמינות
- לכל נתון להוסיף:
  - `source`
  - `confidence`
  - `derivedFrom`
  - `status: verified | inferred | unknown`
- בלי זה המערכת תקבל החלטות על מידע חלש
בוצע

5. לבנות `Domain-Aware Planner`
- planner שיודע להבין סוגי פרויקטים שונים
- למשל `casino`, `saas`, `mobile app`, `agency system`
- כרגע זאת אחת הבעיות הכי גדולות
בוצע

---

### שלב 2 — הבנה עמוקה יותר של פרויקט
אחרי שיש מוח בסיסי נכון:

6. לבנות `Deep Code Scanner`
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
בוצע

7. לבנות `Structured Analysis Pipeline`
- `scan -> context -> prompt -> analysis`
- בצורה יציבה, מדידה, וניתנת לדיבוג
בוצע

8. לייצב את שכבת ה־AI
- `timeouts`
- `retries`
- `caching`
- `fallback model`
- שמירה של תוצאות analysis כדי לא ליפול כל פעם
בוצע

9. להוסיף קריאה של מסמכים וידע
- `README`
- docs
- PR discussions
- Notion בהמשך
בוצע

---

### שלב 2.5 — business understanding

10.5 `Business Context Layer`
- קהל יעד
- positioning
- funnel
- KPI
- GTM stage
- constraints עסקיים

10.6 `Growth & Marketing Planner`
- משימות שיווק, רכישה, onboarding, retention, content

10.7 `Cross-Functional Task Graph`
- חיבור בין technical, product, growth, ops

10.8 `Business Bottleneck Resolver`
- זיהוי החסם העסקי המרכזי, לא רק הטכני

10.9 `Decision Intelligence Layer`
- מה דורש אישור, מה אפשר לבצע, ומה עדיין לא בטוח

---

### שלב 3 — project integration אמיתי
רק אחרי שהמוח מספיק טוב:

10. חיבור אמיתי ל־`GitHub/GitLab`
- repos
- branches
- commits
- PRs
- diffs
בוצע

11. חיבור למקורות runtime
- CI/CD
- test results
- deployment status
- error logs
- monitoring
- analytics
- product metrics
בוצע

12. לבנות `Project State` אמיתי
- state שמתעדכן אוטומטית ממקורות אמת
- לא רק ממה שהמערכת "חושבת"
בוצע

---

### שלב 3.5 — Project Bootstrap Layer

שם הרכיב: `Project Bootstrap Layer`

Refinements מאושרים:
- להוסיף `bootstrap artifact manifest`
- להוסיף `validation evidence schema`

משימות טכניות:

1. `Create bootstrap plan generator`
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

2. `Create bootstrap task templates`
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

1. `Define bootstrap template schema`
- description: לבנות schema אחיד לתבניות bootstrap כולל params, artifacts ותלויות
- input:
  - `domain`
  - `targetPlatform`
- output:
  - `bootstrapTemplateSchema`
- dependencies:
  - `Project Bootstrap Layer`
- connects_to: `Execution Graph`

2. `Create base bootstrap templates`
- description: לבנות תבניות בסיס גנריות לפרויקטים חדשים
- input:
  - `bootstrapTemplateSchema`
- output:
  - `baseTemplates`
- dependencies:
  - `Define bootstrap template schema`
- connects_to: `Execution Graph`

3. `Create domain bootstrap templates`
- description: לבנות תבניות domain-specific עבור domains נתמכים
- input:
  - `domain`
- output:
  - `domainTemplates`
- dependencies:
  - `Define bootstrap template schema`
  - `Expanded Domain Adaptation`
- connects_to: `Execution Graph`

4. `Create platform bootstrap templates`
- description: לבנות תבניות platform-specific לפי target platform
- input:
  - `targetPlatform`
- output:
  - `platformTemplates`
- dependencies:
  - `Define bootstrap template schema`
- connects_to: `Execution Graph`

5. `Create template parameter resolver`
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

6. `Create bootstrap template merger`
- description: לבנות מודול שממזג base, domain ו־platform templates לתבנית אחת סופית
- input:
  - `baseTemplates`
  - `domainTemplates`
  - `platformTemplates`
- output:
  - `bootstrapTemplate`
- dependencies:
  - `Create base bootstrap templates`
  - `Create domain bootstrap templates`
  - `Create platform bootstrap templates`
- connects_to: `Execution Graph`

3. `Create bootstrap dispatcher`
- description: לבנות dispatcher ששולח משימות bootstrap ל־agent או ל־surface מתאים
- input:
  - `bootstrapTasks`
  - `executionCapabilities`
- output:
  - `bootstrapAssignments`
- dependencies:
  - `Agent Runtime`
  - `Execution Surface Layer`
- connects_to: `Agent Runtime`

4. `Create bootstrap execution runner`
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

1. `Define bootstrap execution request schema`
- description: לבנות schema אחיד לבקשת ריצה של bootstrap
- input:
  - `bootstrapAssignment`
- output:
  - `executionRequest`
- dependencies:
  - `Create bootstrap dispatcher`
- connects_to: `Execution Surface`

2. `Create bootstrap surface resolver`
- description: לבנות מודול שבוחר surface מתאים להרצת bootstrap
- input:
  - `executionRequest`
- output:
  - `resolvedSurface`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

3. `Create bootstrap command planner`
- description: לבנות מודול שמתרגם assignment לרשימת פקודות bootstrap לביצוע
- input:
  - `executionRequest`
- output:
  - `plannedCommands`
- dependencies:
  - `Real Execution Capabilities`
- connects_to: `Execution Surface`

4. `Create bootstrap execution invoker`
- description: לבנות invoker שמריץ את הפקודות על ה־surface שנבחר
- input:
  - `resolvedSurface`
  - `plannedCommands`
- output:
  - `rawExecutionResult`
- dependencies:
  - `Create bootstrap surface resolver`
  - `Create bootstrap command planner`
- connects_to: `Execution Surface`

5. `Create bootstrap artifact collector`
- description: לבנות מודול שאוסף artifacts ותוצרי bootstrap לאחר הריצה
- input:
  - `rawExecutionResult`
- output:
  - `artifacts`
  - `executionMetadata`
- dependencies:
  - `Create bootstrap execution invoker`
- connects_to: `Execution Surface`

6. `Create bootstrap execution result envelope`
- description: לבנות envelope אחיד של `executionResult` ו־artifacts לרכיבי המשך
- input:
  - `rawExecutionResult`
  - `artifacts`
- output:
  - `executionResult`
  - `artifacts`
- dependencies:
  - `Create bootstrap artifact collector`
- connects_to: `Execution Surface`

5. `Create bootstrap validation module`
- description: לבנות validator שבודק שהשלד, הקבצים, הפקודות והתוצרים אכן נוצרו
- input:
  - `bootstrapResult`
  - `expectedArtifacts`
- output:
  - `validationResult`
- dependencies:
  - `Deep Code Scanner`
  - `Task Result Ingestion`
- connects_to: `Project State`

6. `Create bootstrap state updater`
- description: לבנות updater שמעדכן state ו-graph לפי תוצאות bootstrap
- input:
  - `validationResult`
  - `bootstrapTasks`
- output:
  - `updatedProjectState`
  - `updatedExecutionGraph`
- dependencies:
  - `Project State`
  - `Execution Graph`
  - `Task Result Ingestion`
- connects_to: `Execution Graph`

---

### שלב 4 — orchestration אמיתי
רק אחרי שיש הבנה אמינה:

13. `Execution Graph` חכם
- `blocked`
- `ready`
- `running`
- `done`
- מתעדכן לפי תוצאות אמיתיות
בוצע

14. `Task Result Ingestion`
- לקלוט תוצאות של משימות ולעדכן את ה־state

15. `Scheduler`
- concurrency
- retries
- failure handling
- priority

16. `Memory` מתמשכת לפרויקט
- החלטות
- טעויות
- patterns
- architecture history

---

### שלב 5 — agents אמיתיים
רק אחרי שהליבה חזקה מספיק:

17. לבנות `Agent Runtime` אמיתי
- `task.claim`
- `task.run`
- `task.report`

18. agents אמיתיים
- `dev`
- `qa`
- `docs`
- `marketing`
- `ops`

19. סביבת הרצה בטוחה
- `sandbox`
- `temp branch`
- `container` אם צריך

20. יכולות execution אמיתיות
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

1. `Create execution event summarizer`
- description: לבנות service שמתרגם events גולמיים לסיכום ברור של מה רץ, מה הושלם ומה נכשל
- input:
  - `runtimeEvents`
  - `taskResults`
- output:
  - `executionSummary`
- dependencies:
  - `Task Result Ingestion`
- connects_to: `Project State`

2. `Create live progress model`
- description: לבנות מודל התקדמות חי למשימה, שלב, ו-run פעיל
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `progressState`
  - `completionEstimate`
- dependencies:
  - `Agent Runtime`
  - `Execution Surface Layer`
- connects_to: `Project State`

פירוק נוסף:

1. `Define execution progress schema`
- description: לבנות schema אחיד ל־progress של task, run ו־stage
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `progressSchema`
- dependencies:
  - `Agent Runtime`
- connects_to: `Project State`

2. `Create run progress normalizer`
- description: לבנות מודול שמנרמל אירועי runtime ו־task state למודל progress אחיד
- input:
  - `taskExecutionState`
  - `runtimeLogs`
- output:
  - `normalizedProgressInputs`
- dependencies:
  - `Define execution progress schema`
  - `Task Result Ingestion`
- connects_to: `Project State`

3. `Create progress phase resolver`
- description: לבנות מודול שקובע את שלב ההתקדמות הנוכחי של הריצה
- input:
  - `normalizedProgressInputs`
- output:
  - `progressPhase`
- dependencies:
  - `Create run progress normalizer`
- connects_to: `Project State`

4. `Create progress percentage calculator`
- description: לבנות מחשב אחוזי התקדמות על בסיס state, events ו־logs
- input:
  - `normalizedProgressInputs`
  - `progressPhase`
- output:
  - `progressPercent`
- dependencies:
  - `Create progress phase resolver`
- connects_to: `Project State`

5. `Create completion estimate calculator`
- description: לבנות מודול שמחשב `completionEstimate` לפי מהירות, שלב ו־signals זמינים
- input:
  - `normalizedProgressInputs`
  - `progressPercent`
- output:
  - `completionEstimate`
- dependencies:
  - `Create progress percentage calculator`
- connects_to: `Project State`

6. `Create live progress assembler`
- description: לבנות assembler שמחזיר `progressState` מלא לצרכי API ו־UI
- input:
  - `progressPhase`
  - `progressPercent`
  - `completionEstimate`
- output:
  - `progressState`
  - `completionEstimate`
- dependencies:
  - `Create completion estimate calculator`
- connects_to: `Project State`

3. `Create execution log formatter`
- description: לבנות formatter ללוגים, פקודות, תוצאות ו-errors כדי להציג אותם בצורה קריאה
- input:
  - `rawLogs`
  - `commandOutputs`
- output:
  - `formattedLogs`
  - `userFacingMessages`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

4. `Create execution status API`
- description: לבנות endpoints לקבלת מצב execution, לוגים, progress ו-last result
- input:
  - `projectId`
  - `taskId`
- output:
  - `executionStatusPayload`
- dependencies:
  - `Create execution event summarizer`
  - `Create live progress model`
- connects_to: `Project State`

5. `Create execution completion notifier`
- description: לבנות מודול שמייצר הודעות סיום, כשלון או צורך בהתערבות משתמש
- input:
  - `executionResult`
- output:
  - `notificationPayload`
- dependencies:
  - `Task Result Ingestion`
  - `Decision Intelligence Layer`
- connects_to: `Project State`

---

### שלב 5.5 — Delivery & Release

#### `Delivery / Release Flow`

Refinements מאושרים:
- להוסיף `release target taxonomy`

משימות טכניות:

1. `Create release plan generator`
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

2. `Create release pipeline orchestrator`
- description: לבנות orchestrator שמריץ לפי סדר את שלבי ה־build, validation, assets, metadata, submission ו-tracking
- input:
  - `releasePlan`
- output:
  - `releaseRun`
  - `stepAssignments`
- dependencies:
  - `Agent Runtime`
  - `Execution Surface Layer`
- connects_to: `Agent Runtime`

3. `Create release validation module`
- description: לבנות validator שבודק readiness לפני הפצה
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `validationReport`
  - `blockingIssues`
- dependencies:
  - `Project State`
  - `Approval System`
- connects_to: `Project State`

פירוק נוסף:

1. `Define release requirements schema`
- description: לבנות schema אחיד לדרישות release לפי target
- input:
  - `releaseTarget`
  - `domain`
- output:
  - `releaseRequirementsSchema`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

2. `Create artifact readiness validator`
- description: לבנות validator שבודק שכל artifacts הנדרשים קיימים ותקינים
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `artifactValidation`
- dependencies:
  - `Build & Release System`
- connects_to: `Project State`

3. `Create metadata readiness validator`
- description: לבנות validator שבודק שכל metadata לשחרור קיים ותקין
- input:
  - `projectArtifacts`
  - `releaseRequirements`
- output:
  - `metadataValidation`
- dependencies:
  - `Delivery / Release Flow`
- connects_to: `Project State`

4. `Create approval readiness validator`
- description: לבנות validator שבודק שכל האישורים הנדרשים קיימים לפני release
- input:
  - `releaseRequirements`
  - `projectState`
- output:
  - `approvalValidation`
- dependencies:
  - `Approval System`
- connects_to: `Project State`

5. `Create blocking issues classifier`
- description: לבנות מודול שמסווג בעיות validation ל־blocking classes
- input:
  - `artifactValidation`
  - `metadataValidation`
  - `approvalValidation`
- output:
  - `blockingIssues`
- dependencies:
  - `Create artifact readiness validator`
  - `Create metadata readiness validator`
  - `Create approval readiness validator`
- connects_to: `Project State`

6. `Create release validation assembler`
- description: לבנות assembler שמחזיר `validationReport` מלא בפורמט קנוני
- input:
  - `artifactValidation`
  - `metadataValidation`
  - `approvalValidation`
  - `blockingIssues`
- output:
  - `validationReport`
  - `blockingIssues`
- dependencies:
  - `Create blocking issues classifier`
- connects_to: `Project State`

4. `Create release state updater`
- description: לבנות updater שמעדכן את state וה-graph לפי התקדמות release
- input:
  - `releaseEvents`
  - `validationReport`
- output:
  - `updatedProjectState`
  - `updatedExecutionGraph`
- dependencies:
  - `Task Result Ingestion`
  - `Execution Graph`
- connects_to: `Execution Graph`

#### `Deployment & Hosting Orchestrator`

Refinements מאושרים:
- להוסיף `provider capability matrix`

משימות טכניות:

1. `Create hosting provider adapter contract`
- description: לבנות contract אחיד לחיבור לספקי hosting שונים
- input:
  - `providerConfig`
- output:
  - `hostingAdapter`
- dependencies:
  - `Source Adapter Layer`
- connects_to: `Execution Surface`

2. `Create environment provisioner`
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

3. `Create env management module`
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

4. `Create domain and routing provisioner`
- description: לבנות service שמחבר domain, routes ו-endpoints לפרויקט הפרוס
- input:
  - `deploymentTarget`
  - `domainConfig`
- output:
  - `domainBinding`
- dependencies:
  - `Deployment & Hosting Orchestrator`
- connects_to: `Execution Surface`

5. `Create deployment execution module`
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

1. `Define deployment request schema`
- description: לבנות schema אחיד לבקשת deployment
- input:
  - `buildArtifact`
  - `deploymentConfig`
- output:
  - `deploymentRequest`
- dependencies:
  - `Build & Release System`
- connects_to: `Execution Surface`

2. `Create deployment provider resolver`
- description: לבנות resolver שבוחר provider adapter מתאים לביצוע ה־deploy
- input:
  - `deploymentRequest`
- output:
  - `providerAdapter`
- dependencies:
  - `Create hosting provider adapter contract`
- connects_to: `Execution Surface`

3. `Create deployment artifact preparer`
- description: לבנות מודול שמכין את ה־artifact לפריסה לפי דרישות ה־provider
- input:
  - `buildArtifact`
  - `deploymentConfig`
- output:
  - `preparedArtifact`
- dependencies:
  - `Create deployment request schema`
- connects_to: `Execution Surface`

4. `Create deployment invoker`
- description: לבנות מודול שמבצע deploy בפועל דרך ה־provider adapter
- input:
  - `providerAdapter`
  - `preparedArtifact`
  - `deploymentConfig`
- output:
  - `providerDeploymentResult`
- dependencies:
  - `Create deployment provider resolver`
  - `Create deployment artifact preparer`
- connects_to: `Execution Surface`

5. `Create deployment evidence collector`
- description: לבנות מודול שאוסף URLים, environment ids ו־provider metadata אחרי deploy
- input:
  - `providerDeploymentResult`
- output:
  - `deploymentEvidence`
- dependencies:
  - `Create deployment invoker`
- connects_to: `Execution Surface`

6. `Create deployment result envelope`
- description: לבנות envelope אחיד של `deploymentResult` לרכיבי tracking ו־state update
- input:
  - `providerDeploymentResult`
  - `deploymentEvidence`
- output:
  - `deploymentResult`
- dependencies:
  - `Create deployment evidence collector`
- connects_to: `Execution Surface`

#### `Build & Release System`

Refinements מאושרים:
- להוסיף `artifact manifest`

משימות טכניות:

1. `Create build target resolver`
- description: לבנות resolver שקובע אילו builds נדרשים לפי domain ו-release target
- input:
  - `domain`
  - `releaseTarget`
- output:
  - `buildTargets`
- dependencies:
  - `Expanded Domain Adaptation`
- connects_to: `Project State`

2. `Create build runner`
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

3. `Create artifact registry module`
- description: לבנות מודול ששומר metadata על artifacts, גרסאות ונתיבי output
- input:
  - `buildResult`
- output:
  - `artifactRecord`
- dependencies:
  - `Project State`
- connects_to: `Project State`

4. `Create versioning service`
- description: לבנות service לניהול version numbers ו-release identifiers
- input:
  - `releasePolicy`
  - `currentVersion`
- output:
  - `nextVersion`
  - `releaseTag`
- dependencies:
  - `Build & Release System`
- connects_to: `Project State`

5. `Create packaging module`
- description: לבנות מודול שמכין חבילות שחרור לפי target
- input:
  - `buildArtifact`
  - `releaseTarget`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create build runner`
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define packaging requirements schema`
- description: לבנות schema אחיד לדרישות packaging לפי `releaseTarget`
- input:
  - `buildArtifact`
  - `releaseTarget`
- output:
  - `packagingRequirements`
- dependencies:
  - `Create build target resolver`
- connects_to: `Execution Surface`

2. `Create package format resolver`
- description: לבנות resolver שבוחר פורמט package מתאים לפי target
- input:
  - `releaseTarget`
  - `packagingRequirements`
- output:
  - `packageFormat`
- dependencies:
  - `Define packaging requirements schema`
- connects_to: `Execution Surface`

3. `Create packaging manifest builder`
- description: לבנות מודול שמייצר manifest של קבצים, metadata ו־assets לחבילה
- input:
  - `buildArtifact`
  - `packageFormat`
- output:
  - `packagingManifest`
- dependencies:
  - `Create package format resolver`
- connects_to: `Execution Surface`

4. `Create package assembler`
- description: לבנות מודול שמרכיב את החבילה הסופית מה־artifact וה־manifest
- input:
  - `buildArtifact`
  - `packagingManifest`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create packaging manifest builder`
- connects_to: `Execution Surface`

5. `Create package verification module`
- description: לבנות מודול שמאמת שהחבילה שנוצרה תואמת לדרישות target
- input:
  - `packagedArtifact`
  - `packagingRequirements`
- output:
  - `packageVerification`
- dependencies:
  - `Create package assembler`
- connects_to: `Execution Surface`

6. `Create packaging result envelope`
- description: לבנות envelope אחיד שמחזיר package, manifest ו־verification metadata
- input:
  - `packagedArtifact`
  - `packagingManifest`
  - `packageVerification`
- output:
  - `packagedArtifact`
- dependencies:
  - `Create package verification module`
- connects_to: `Execution Surface`

#### `External Accounts Connector`

משימות טכניות:

1. `Create external account registry`
- description: לבנות registry לחשבונות מחוברים לפי סוג שירות
- input:
  - `accountType`
  - `accountMetadata`
- output:
  - `accountRecord`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`

2. `Create provider connector contract`
- description: לבנות contract אחיד לחיבור ספקים כמו hosting, stores, analytics ו-ad platforms
- input:
  - `providerType`
  - `credentials`
- output:
  - `providerSession`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define provider connector schema`
- description: לבנות schema אחיד ל־provider connectors לפי סוג ספק
- input:
  - `providerType`
- output:
  - `providerConnectorSchema`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create authentication mode contract`
- description: לבנות חוזה עבור סוגי authentication נתמכים לכל provider
- input:
  - `providerType`
  - `credentials`
- output:
  - `authModeDefinition`
- dependencies:
  - `Define provider connector schema`
- connects_to: `Execution Surface`

3. `Create provider session factory`
- description: לבנות factory שמייצר `providerSession` אחיד עבור כל provider
- input:
  - `providerType`
  - `credentials`
- output:
  - `providerSession`
- dependencies:
  - `Create authentication mode contract`
  - `Credentials Management`
- connects_to: `Execution Surface`

4. `Create provider capability descriptor`
- description: לבנות descriptor שמחזיר capabilities נתמכות לכל provider מחובר
- input:
  - `providerSession`
- output:
  - `providerCapabilities`
- dependencies:
  - `Create provider session factory`
- connects_to: `Execution Surface`

5. `Create provider operation contract`
- description: לבנות חוזה אחיד לפעולות core מול provider כמו validate, submit, poll, revoke
- input:
  - `providerSession`
- output:
  - `providerOperations`
- dependencies:
  - `Create provider capability descriptor`
- connects_to: `Execution Surface`

6. `Create provider connector assembler`
- description: לבנות assembler שמחזיר connector אחיד לשימוש רכיבי deploy ו־release
- input:
  - `providerSession`
  - `providerCapabilities`
  - `providerOperations`
- output:
  - `providerConnector`
- dependencies:
  - `Create provider operation contract`
- connects_to: `Execution Surface`

3. `Create account verification module`
- description: לבנות מודול שבודק שהחשבון המחובר תקין וניתן לשימוש
- input:
  - `providerSession`
- output:
  - `verificationResult`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`

4. `Create account linking API`
- description: לבנות endpoints לחיבור, ניתוק ובדיקת חשבונות חיצוניים
- input:
  - `userInput`
  - `providerType`
- output:
  - `linkedAccountPayload`
- dependencies:
  - `Create provider connector contract`
- connects_to: `Project State`

#### `Credentials Management`

Refinements מאושרים:
- להוסיף `secret reference lifecycle`

משימות טכניות:

1. `Create credential vault interface`
- description: לבנות interface אחיד לשמירה וקריאה של סודות ומפתחות
- input:
  - `credentialKey`
  - `credentialValue`
- output:
  - `credentialReference`
- dependencies:
  - `Policy Layer`
- connects_to: `Project State`

2. `Create credential encryption module`
- description: לבנות מודול להצפנה ופענוח של credentials
- input:
  - `plainCredential`
- output:
  - `encryptedCredential`
- dependencies:
  - `Credentials Management`
- connects_to: `Project State`

3. `Create credential access policy`
- description: לבנות מנגנון שמגדיר מי יכול להשתמש בכל credential ובאיזה flow
- input:
  - `credentialReference`
  - `actorType`
- output:
  - `accessDecision`
- dependencies:
  - `Tool Invocation Policy`
  - `Approval System`
- connects_to: `Agent Runtime`

4. `Create secret resolution module`
- description: לבנות מודול שמזריק secrets ל-build, deploy או execution בלי לחשוף אותם ל־UI
- input:
  - `executionRequest`
  - `credentialReferences`
- output:
  - `resolvedExecutionConfig`
- dependencies:
  - `Execution Surface Layer`
- connects_to: `Execution Surface`

#### `Distribution Ownership Model`

משימות טכניות:

1. `Create ownership policy model`
- description: לבנות מודל שמגדיר שהמשתמש הוא owner של assets, accounts ו-distribution targets
- input:
  - `userId`
  - `projectId`
- output:
  - `ownershipPolicy`
- dependencies:
  - `Canonical Schema`
- connects_to: `Project State`

2. `Create distribution authorization checks`
- description: לבנות בדיקות שמונעות פרסום או submission בלי owner authorization מתאים
- input:
  - `releaseAction`
  - `ownershipPolicy`
- output:
  - `authorizationResult`
- dependencies:
  - `Approval System`
- connects_to: `Execution Surface`

3. `Create owner-consent recorder`
- description: לבנות מודול ששומר אישורים של המשתמש על פעולות release והפצה
- input:
  - `projectId`
  - `consentAction`
- output:
  - `consentRecord`
- dependencies:
  - `Distribution Ownership Model`
- connects_to: `Project State`

4. `Create ownership-aware release guard`
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

#### `Release Status Tracking`

Refinements מאושרים:
- להוסיף `terminal states`

משימות טכניות:

1. `Create release status state model`
- description: לבנות מודל מצב אחיד לסטטוסי build, deploy, review, publish ו-rejection
- input:
  - `releaseEvents`
- output:
  - `releaseStatus`
- dependencies:
  - `Project State`
- connects_to: `Project State`

2. `Create store and provider status pollers`
- description: לבנות pollers שמושכים סטטוס מספקי deployment ו-stores חיצוניים
- input:
  - `releaseTarget`
  - `providerSession`
- output:
  - `statusEvents`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

פירוק נוסף:

1. `Define release polling schema`
- description: לבנות schema אחיד לבקשות polling מול providers ו־stores
- input:
  - `releaseTarget`
  - `providerSession`
- output:
  - `pollingRequest`
- dependencies:
  - `External Accounts Connector`
- connects_to: `Execution Surface`

2. `Create provider status resolver`
- description: לבנות resolver שבוחר poller מתאים לפי provider ו־release target
- input:
  - `pollingRequest`
- output:
  - `resolvedPoller`
- dependencies:
  - `Define release polling schema`
- connects_to: `Execution Surface`

3. `Create polling execution module`
- description: לבנות מודול שמבצע polling בפועל ומחזיר raw status
- input:
  - `resolvedPoller`
  - `pollingRequest`
- output:
  - `rawStatusResponse`
- dependencies:
  - `Create provider status resolver`
- connects_to: `Execution Surface`

4. `Create status normalization module`
- description: לבנות מודול שמנרמל תשובות provider ל־status events אחידים
- input:
  - `rawStatusResponse`
- output:
  - `statusEvents`
- dependencies:
  - `Create polling execution module`
- connects_to: `Execution Surface`

5. `Create terminal state detector`
- description: לבנות מודול שמזהה אם ה־status הנוכחי הוא terminal או דורש המשך polling
- input:
  - `statusEvents`
- output:
  - `pollingDecision`
- dependencies:
  - `Create status normalization module`
- connects_to: `Project State`

6. `Create polling metadata builder`
- description: לבנות מודול שמחזיר metadata של polling כמו next poll, attempts ו־provider cursor
- input:
  - `pollingRequest`
  - `statusEvents`
  - `pollingDecision`
- output:
  - `pollingMetadata`
- dependencies:
  - `Create terminal state detector`
- connects_to: `Project State`

3. `Create release timeline builder`
- description: לבנות builder שמייצר timeline של שלבי release והמצב הנוכחי של כל שלב
- input:
  - `releaseRun`
  - `statusEvents`
- output:
  - `releaseTimeline`
- dependencies:
  - `Release Status Tracking`
- connects_to: `Project State`

4. `Create rejection and failure mapper`
- description: לבנות mapper שמתרגם rejection reasons ו-failures לחסמים ומשימות המשך
- input:
  - `providerErrors`
  - `reviewFeedback`
- output:
  - `failureSummary`
  - `followUpTasks`
- dependencies:
  - `Task Result Ingestion`
  - `Bottleneck Resolver`
- connects_to: `Execution Graph`

5. `Create release tracking API`
- description: לבנות endpoints לקבלת סטטוס release, timeline ו-failure reasons
- input:
  - `projectId`
  - `releaseRunId`
- output:
  - `releaseTrackingPayload`
- dependencies:
  - `Create release timeline builder`
  - `Create rejection and failure mapper`
- connects_to: `Project State`

---

### שלב 6 — safety
זה חייב להגיע לפני אוטונומיה אמיתית:

21. `Approval System`
- לפני שינוי קוד
- לפני migrations
- לפני deploy
- לפני הוצאות כספיות

22. `Diff Preview`
- מה ישתנה
- למה
- מה ההשפעה

23. `Policy Layer`
- מה agent יכול
- מה agent לא יכול
- באילו תנאים

---

### שלב 7 — scaling וידע מצטבר
רק אחרי שהמערכת באמת עובדת:

24. `Cross-Project Memory`
- patterns חוזרים
- best practices
- common bottlenecks

25. `Learning Layer`
- שיפור המלצות לפי history
- לא training של מודל חדש, אלא שכבת למידה תפעולית

26. `Scalability`
- כמה פרויקטים במקביל
- כמה agents במקביל
- בלי לקרוס

---

## 10% הכי קריטיים
אם אתה רוצה רק את מה שבאמת הכי חשוב עכשיו:

1. `Context Builder`
2. `Canonical Schema`
3. `Source Adapter Layer`
4. `Confidence Metadata`
5. `Domain-Aware Planner`
6. `Deep Code Scanner`
7. `Structured Analysis Pipeline`
8. `Project State` אמיתי
9. `Execution Graph` חכם
10. `Approval + Safety Layer`

---

## מה הייתי מוסיף מעבר למה שכתבת
יש 4 משימות שחייבות להיות ברשימה:

1. `Bottleneck Resolver`
- מנגנון שמחליט מה החסם האמיתי עכשיו
- זה הלב של החוויה

2. `Decision Layer`
- להבדיל בין:
  - מה דורש אישור משתמש
  - מה agent יכול לעשות לבד
  - מה עדיין לא בטוח מספיק

3. `Explanation Layer`
- המערכת חייבת להסביר:
  - למה זה חסר
  - למה זה חסום
  - למה זאת המשימה הבאה

4. `Normalization Layer`
- להפוך מידע ממקורות שונים לשפה פנימית אחת
- אחרת כל source "יזהם" את הליבה

---

## התעדוף הסופי שלי
אם אתה רוצה לעבוד נכון, זה הסדר:

1. `Context Builder`
2. `Canonical Schema`
3. `Source Adapter Layer`
4. `Confidence / Source Metadata`
5. `Domain-Aware Planner`
6. `Deep Scanner`
7. `AI Pipeline`
8. `Git + Docs + External Sources`
9. `Project State + Execution Graph`
10. `Approval + Safety`
11. `Real Agents`
12. `Learning + Cross-Project Knowledge`
