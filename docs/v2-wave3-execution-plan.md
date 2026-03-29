# V2 Wave 3 Execution Plan

מטרת הקובץ:
- לרכז את `Wave 3` כקובץ execution נפרד ועצמאי
- לעבוד מול קובץ המשימות המקורי כ־`source of truth`
- לסמן במפורש gaps ארכיטקטוניים שלא פורקו עדיין למשימות טכניות
- לייצר סדר ביצוע אמיתי לגל כך שנוכל להתחיל ממנו מיד כשנגיע אליו

## Source Of Truth

קובץ המקור שממנו נגזרות משימות `Wave 3`:
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md)

בלוקי `Wave 3` שנמשכו מהמקור:
- `Nexus Product Analytics`
- `Platform Cost & Usage Control`
- `Billing & Monetization System`

הרחבת execution plan בגלל gap אמיתי:
- `AI Design Pipeline`
- `Outcome & Goal Evaluation`
- `Meta Orchestration Layer`
- `System Capability Registry`
- `Cost-Aware Decision Engine`
- `Product Feedback Loop`

הערה חשובה:
- `AI Design Pipeline` לא קיימת כרגע כבלוק מפורק בקובץ המקור.
- כן קיימת תשתית חלקית שמרמזת עליה:
  - `Design System`
  - `Screen Templates`
  - `UI Review Layer`
  - `AI Learning UX`
  - `AI Companion Experience`
  - דפוסי `provider adapter` בבלוקים אחרים
- לכן הבלוק הזה נוסף כאן כ־execution gap רשמי בתוך `Wave 3`, בלי לשכתב את source of truth.

תלויות קדם חוצות־גלים שאינן בבעלות `Wave 3`:
- `Context Relevance & Reduction`
- `Human Editing & Partial Acceptance`

הערת בעלות:
- שש המשימות תחת שני האזורים האלה נשארות בבעלות המיפוי של `Wave 1` ב־[docs/v2-master-plan-and-waves.md](/Users/yogevlavian/Desktop/The Nexus/docs/v2-master-plan-and-waves.md)
- בקובץ הזה מותר להזכיר אותן רק כ־`prerequisite` ל־`AI Design Pipeline`, לא כמשימות owner של `Wave 3`

## Status Legend

- `🟢 בוצע`
- `🟡 חלקי / תלות חלקית / תלוי בשכבה קודמת`
- `🔴 לא בוצע`

## Wave 3 Goal

`Wave 3` נועדה להפוך את Nexus ממערכת רחבה בנויה למערכת שגם:
- מודדת את עצמה
- שולטת בעלויות
- יודעת לחייב
- ומתחילה להפעיל שכבות אינטליגנציה עמוקות יותר כמו `AI Design Pipeline`

## Current Progress

- התקדמות נוכחית של הגל: `0/63` משימות סגורות = `0%`
- חלוקת סטטוסים כרגע:
  - `🟢 בוצע`: `0`
  - `🟡 חלקי / תלות חלקית / תלוי בשכבה קודמת`: `0`
  - `🔴 לא בוצע`: `63`

## Block Execution Order

זה סדר הביצוע המחייב ברמת הבלוקים:

1. `Nexus Product Analytics`
2. `AI Design Pipeline`
3. `Platform Cost & Usage Control`
4. `Billing & Monetization System`

למה זה הסדר הנכון:
- `Nexus Product Analytics` קודם כי צריך למדוד usage, activation, retention ופעולות אמיתיות לפני cost/billing ולפני optimization עמוק.
- `AI Design Pipeline` באה אחרי שיש `Wave 1` design foundation ואחרי `Wave 2` trust/security, אבל לפני cost/billing כדי שנדע למדוד גם design generation כפעולה מערכתית אמיתית.
- `Platform Cost & Usage Control` צריך לשבת אחרי שיש analytics בסיסי ו־AI execution lanes מוגדרים, אחרת לא נמדוד את cost drivers הנכונים.
- `Billing & Monetization System` אחרון, כי הוא חייב להישען על usage, cost ו־entitlements אמינים.

## Parallelization Rules

מה אפשר במקביל:
- בתוך `Nexus Product Analytics`, אפשר לקדם במקביל schema + tracker רק כשאין נגיעה לאותו aggregator.
- בתוך `AI Design Pipeline`, אפשר לבנות במקביל:
  - `request schema` ו־`provider contract`
  - `response normalizer` ו־`proposal store`
  כל עוד אין שני סוכנים שנוגעים יחד באותו assembler/validator.
- בתוך `Platform Cost & Usage Control`, אפשר להפריד בין trackers שונים (`AI`, `workspace`, `storage`) ורק אחר כך למזג ל־`costSummary`.

מה אסור להתחיל מוקדם:
- אסור להתחיל `design provider adapter` לפני שיש `design provider contract`.
- אסור להתחיל `design validation layer` לפני שיש `design response normalizer`.
- אסור להתחיל `design enforcement guard` לפני שיש גם `validation` וגם `proposal store`.
- אסור להתחיל `billing enforcement guard` לפני שיש גם `entitlementDecision` וגם `billableUsage`.

## Validation Gate

`Wave 3 Validation Gate` מגיע רק אחרי שכל הבלוקים לעיל נסגרו ברמת implementation:
- product analytics אמיתי
- outcome evaluation ו־goal tracking אמיתיים
- meta orchestration שמחברת execution, evaluation, feedback ו־adaptation
- AI design pipeline עם generation + validation + enforcement + review
- system capability boundaries שמכריעות מה Nexus בכלל יודעת ורשאית לעשות
- cost visibility אמיתית
- cost-aware decisions אמיתיות ולא רק cost tracking
- product feedback loop שמחזיר feature success חזרה להחלטות המוצר
- billing events / entitlements / limits אמינים
- אין פער בין usage אמיתי, usage מדווח ו־billable usage

תנאי קדם לפני תחילת `AI Design Pipeline` ב־`Wave 3`:
- `Context Relevance & Reduction` צריך להיות סגור דרך `Wave 1`
- `Human Editing & Partial Acceptance` צריך להיות סגור דרך `Wave 1`

## Coverage Assessment For AI Design

### מה כבר קיים
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md#L4638) `Design System`
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md#L4823) `UI Review Layer`
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md#L4886) `AI Learning UX`
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md#L4970) `AI Companion Experience`
- דפוסי provider adapter קיימים ב־hosting / marketing / extension ecosystems

### מה מכוסה חלקית בלבד
- reasoning על design recommendations
- confidence / review / disclosure
- companion surfaces שמסוגלים להציג המלצות
- screen validators שיכולים לשמש שכבת enforcement

### מה חסר לגמרי
- `design request schema`
- `design request builder`
- `design provider contract`
- `design provider adapter`
- `design response normalizer`
- `design proposal schema/store`
- `design validation pipeline` ברמת generation output
- `design enforcement guard`
- `design review assembler`
- `design regeneration loop`

### מסקנה
- `AI Design Pipeline` היא gap אמיתי.
- היא לא מכוסה מספיק בתוך ה־backlog הקיים.
- לכן היא ממוסגרת כאן כבלוק חדש ומפורק למשימות בתוך `Wave 3`.

## Execution Order By Block

### Block 1 — Nexus Product Analytics

מטרת הבלוק:
- למדוד את Nexus כמוצר, לא רק את הפרויקטים שהיא מנהלת.

#### Sub-block: `Project Creation Metrics`

1. `Define project creation event schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד לאירועי יצירת פרויקט דרך Nexus
- input:
  - `userId`
  - `projectId`
  - `creationSource`
- output:
  - `projectCreationEvent`
- dependencies:
  - `Project State`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.1`

2. `Create project creation tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker שמקליט כל יצירת פרויקט ומעדכן counters מצטברים
- input:
  - `projectCreationEvent`
- output:
  - `projectCreationMetric`
- dependencies:
  - `Define project creation event schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.2`

3. `Create project creation aggregation module`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation לפי יום, שבוע, משתמש ומקור יצירה
- input:
  - `projectCreationMetrics`
- output:
  - `projectCreationSummary`
- dependencies:
  - `Create project creation tracker`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.3`

#### Sub-block: `Task Execution Metrics`

4. `Define task execution metric schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד למטריקות של משימות שבוצעו בפועל
- input:
  - `taskResult`
  - `runtimeEvent`
- output:
  - `taskExecutionMetric`
- dependencies:
  - `Task Result Ingestion`  | סטטוס: `🟡 חלקי`
- connects_to: `Project State`
- execution_order: `1.4`

5. `Create task execution tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker שסופר משימות `completed`, `failed`, `retried` ו־`blocked`
- input:
  - `taskExecutionMetric`
- output:
  - `taskExecutionCounters`
- dependencies:
  - `Define task execution metric schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.5`

6. `Create task throughput aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation לפי פרויקט, lane, agent ופרקי זמן
- input:
  - `taskExecutionCounters`
- output:
  - `taskThroughputSummary`
- dependencies:
  - `Create task execution tracker`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.6`

#### Sub-block: `Time Saved Estimation`

7. `Define time saved estimation schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `1.7`

8. `Create baseline effort estimator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות estimator שמחשב זמן ידני משוער לפי `task type`, `domain` ו־`scope`
- input:
  - `taskType`
  - `domain`
  - `context`
- output:
  - `baselineEstimate`
- dependencies:
  - `Domain-Aware Planner`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.8`

9. `Create time saved calculator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות calculator שמחשב `timeSaved` לכל משימה ולכל פרויקט
- input:
  - `executionDuration`
  - `baselineEstimate`
- output:
  - `timeSaved`
- dependencies:
  - `Create baseline effort estimator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.9`

10. `Create productivity summary aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation של זמן שנחסך לפי משתמש, פרויקט ותקופה
- input:
  - `timeSavedMetrics`
- output:
  - `productivitySummary`
- dependencies:
  - `Create time saved calculator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.10`

#### Sub-block: `User Activity & Retention`

11. `Define user activity event schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד לאירועי שימוש במוצר עצמו
- input:
  - `userId`
  - `sessionId`
  - `activityType`
- output:
  - `userActivityEvent`
- dependencies:
  - `Project State`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.11`

12. `Create session activity tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker לסשנים, חזרות, active sessions ו־last seen
- input:
  - `userActivityEvent`
- output:
  - `userSessionMetric`
- dependencies:
  - `Define user activity event schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.12`

13. `Create returning user resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שקובע אם משתמש הוא `returning user` לפי windows מוגדרים
- input:
  - `userSessionMetrics`
- output:
  - `returningUserMetric`
- dependencies:
  - `Create session activity tracker`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.13`

14. `Create retention metrics aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation של `D1/D7/D30`, `repeat usage` ו־`retention cohorts`
- input:
  - `returningUserMetrics`
- output:
  - `retentionSummary`
- dependencies:
  - `Create returning user resolver`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.14`

#### Sub-block: `Billing & Revenue Metrics`

15. `Define billing event schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `1.15`

16. `Create paying user tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker שסופר משתמשים משלמים, converted users ו־active subscriptions
- input:
  - `billingEvents`
- output:
  - `payingUserMetrics`
- dependencies:
  - `Define billing event schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.16`

17. `Create revenue summary aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation של revenue, `ARPU` בסיסי ו־conversion counts
- input:
  - `payingUserMetrics`
- output:
  - `revenueSummary`
- dependencies:
  - `Create paying user tracker`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.17`

#### Sub-block: `Nexus Analytics Dashboard`

18. `Define analytics dashboard schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ל־product analytics dashboard של Nexus
- input:
  - `analyticsMetrics`
- output:
  - `analyticsDashboardSchema`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `1.18`

19. `Create analytics summary assembler`
- סטטוס: `🔴 לא בוצע`
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
  - `Create revenue summary aggregator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.19`

20. `Create analytics API`
- סטטוס: `🔴 לא בוצע`
- description: לבנות endpoints לקבלת metrics ו־summaries של Nexus עצמו
- input:
  - `timeRange`
  - `filters`
- output:
  - `analyticsPayload`
- dependencies:
  - `Create analytics summary assembler`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.20`

21. `Create analytics dashboard screen`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מסך dashboard פנימי למדדי Nexus
- input:
  - `analyticsPayload`
- output:
  - `analyticsDashboard`
- dependencies:
  - `Create analytics API`  | סטטוס: `🔴 לא בוצע`
  - `UI / UX Foundation`
- connects_to: `Execution Surface`
- execution_order: `1.21`

#### Sub-block: `Outcome & Goal Evaluation`

22. `Define outcome evaluation schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `1.22`

23. `Create action success scoring engine`
- סטטוס: `🔴 לא בוצע`
- description: לבנות engine שמחשב success score אמיתי לפעולה לפי outcome quality, side effects, reversals ו־user acceptance
- input:
  - `outcomeEvaluation`
  - `taskResult`
- output:
  - `actionSuccessScore`
- dependencies:
  - `Define outcome evaluation schema`  | סטטוס: `🔴 לא בוצע`
  - `Task Result Ingestion`  | סטטוס: `🟡 חלקי`
- connects_to: `Project State`
- execution_order: `1.23`

24. `Create outcome feedback loop`
- סטטוס: `🔴 לא בוצע`
- description: לבנות loop שמחזיר success scores ו־failure patterns חזרה ל־learning, recommendation ו־priority systems
- input:
  - `actionSuccessScore`
  - `projectLearningRecords`
- output:
  - `outcomeFeedbackState`
- dependencies:
  - `Create action success scoring engine`  | סטטוס: `🔴 לא בוצע`
  - `Learning Layer`
- connects_to: `Project State`
- execution_order: `1.24`

25. `Create goal progress evaluator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות evaluator שמודד כמה התקדמנו למטרה המוצהרת של הפרויקט לפי outcomes, blockers, throughput ו־first value progression
- input:
  - `projectGoal`
  - `outcomeFeedbackState`
  - `taskThroughputSummary`
- output:
  - `goalProgressState`
- dependencies:
  - `Create outcome feedback loop`  | סטטוס: `🔴 לא בוצע`
  - `Universal Project Lifecycle`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.25`

26. `Create milestone tracking system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system שממפה milestones קריטיים, עוקב אחרי completion שלהם ומציג drift בין milestone plan לבין actual outcome
- input:
  - `goalProgressState`
  - `lifecycleMilestones`
- output:
  - `milestoneTracking`
- dependencies:
  - `Create lifecycle milestone generator`  | סטטוס: `🟢 בוצע`
  - `Create goal progress evaluator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.26`

#### Sub-block: `Product Feedback Loop`

27. `Define feature success schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד למדידת הצלחת פיצ'ר לפי activation, repeat usage, completion quality, override rate ו־drop-off points
- input:
  - `featureUsageEvents`
  - `analyticsSummary`
- output:
  - `featureSuccessMetric`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `1.27`

28. `Create feature success tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker שמחשב עבור כל feature את adoption, stickiness, success rate ו־friction indicators
- input:
  - `featureSuccessMetric`
  - `userActivityEvent`
- output:
  - `featureSuccessSummary`
- dependencies:
  - `Define feature success schema`  | סטטוס: `🔴 לא בוצע`
  - `User Activity & Retention`
- connects_to: `Project State`
- execution_order: `1.28`

29. `Create product iteration feedback engine`
- סטטוס: `🔴 לא בוצע`
- description: לבנות engine שמחזיר recommendations לשיפור flows, features ו־defaults לפי feature success, outcome scores ו־user behavior
- input:
  - `featureSuccessSummary`
  - `outcomeFeedbackState`
  - `analyticsSummary`
- output:
  - `productIterationInsights`
- dependencies:
  - `Create feature success tracker`  | סטטוס: `🔴 לא בוצע`
  - `Create outcome feedback loop`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.29`

#### Sub-block: `Meta Orchestration Layer`

30. `Define post-execution evaluation schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `1.30`

31. `Create post-execution evaluation pipeline`
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
- execution_order: `1.31`

32. `Create cross-layer feedback orchestrator`
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
- execution_order: `1.32`

33. `Create adaptive execution loop`
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
- execution_order: `1.33`

34. `Create system optimization cycle`
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
- execution_order: `1.34`

### Block 2 — AI Design Pipeline

מטרת הבלוק:
- לחבר מודל חיצוני ל־Nexus ליצירת UI, תוך שליטה פנימית מלאה על context, validation, enforcement, review ו־persistence.

הערה ארכיטקטונית:
- הכיוון המועדף הוא `external model generation + internal Nexus control plane`.
- כלומר:
  - Nexus בונה request מובנה
  - provider חיצוני מייצר proposal
  - Nexus מנרמלת, בודקת, אוכפת ושומרת

1. `Define AI design request schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ל־design generation requests כך שהמודל יקבל context מובנה במקום prompt חופשי
- input:
  - `screenContract`
  - `screenStates`
  - `screenTemplate`
  - `designTokens`
  - `componentLibrary`
- output:
  - `designRequestSchema`
- dependencies:
  - `UI / UX Foundation`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `2.1`

2. `Create AI design request builder`
- סטטוס: `🔴 לא בוצע`
- description: לבנות builder שמרכיב request קנוני מתוך screen goals, templates, tokens, allowed components ו־constraints
- input:
  - `designRequestSchema`
  - `screenReviewReport`
  - `projectContext`
- output:
  - `designGenerationRequest`
- dependencies:
  - `Define AI design request schema`  | סטטוס: `🔴 לא בוצע`
  - `UI Review Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `2.2`

3. `Define design provider contract`
- סטטוס: `🔴 לא בוצע`
- description: לבנות contract אחיד ל־provider חיצוני שמייצר UI proposals לפי structured request
- input:
  - `providerConfig`
  - `designGenerationRequest`
- output:
  - `designProviderContract`
- dependencies:
  - `Create AI design request builder`  | סטטוס: `🔴 לא בוצע`
  - `External Model Integration`
- connects_to: `Project State`
- execution_order: `2.3`

4. `Create design provider adapter`
- סטטוס: `🔴 לא בוצע`
- description: לבנות adapter שמבצע request/response אמיתי מול provider חיצוני ליצירת design proposals
- input:
  - `designProviderContract`
  - `designGenerationRequest`
- output:
  - `designProviderResponse`
- dependencies:
  - `Define design provider contract`  | סטטוס: `🔴 לא בוצע`
  - `Application Runtime Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Execution Surface`
- execution_order: `2.4`

5. `Create design response normalizer`
- סטטוס: `🔴 לא בוצע`
- description: לנרמל את תשובת המודל לפורמט קנוני של Nexus במקום להסתמך על output חופשי
- input:
  - `designProviderResponse`
- output:
  - `normalizedDesignProposal`
- dependencies:
  - `Create design provider adapter`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.5`

6. `Create design proposal schema and store`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema ו־store ל־design proposals, variants, proposal history ו־decision metadata
- input:
  - `normalizedDesignProposal`
  - `screenContext`
- output:
  - `designProposalRecord`
- dependencies:
  - `Create design response normalizer`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Persistence Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `2.6`

7. `Create design validation layer`
- סטטוס: `🔴 לא בוצע`
- description: לבדוק שה־proposal עומד ב־tokens, templates, allowed components, primary action, states ו־mobile rules
- input:
  - `normalizedDesignProposal`
  - `screenReviewReport`
  - `designTokens`
- output:
  - `designValidationResult`
- dependencies:
  - `Create design response normalizer`  | סטטוס: `🔴 לא בוצע`
  - `UI Review Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `2.7`

8. `Create design enforcement guard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות guard שמכריע אם proposal מאושר, דורש normalization נוסף, נדחה או חוזר ל־regeneration
- input:
  - `designValidationResult`
  - `policyTrace`
  - `projectAuthorizationDecision`
- output:
  - `designEnforcementDecision`
- dependencies:
  - `Create design validation layer`  | סטטוס: `🔴 לא בוצע`
  - `Policy Layer`  | סטטוס: `🟢 בוצע`
  - `Project Permission Matrix`
- connects_to: `Execution Surface`
- execution_order: `2.8`

9. `Create design review assembler`
- סטטוס: `🔴 לא בוצע`
- description: לבנות assembler שמחזיר review report אחד ברור עם proposal summary, violations, reasoning, approval state ו־next step
- input:
  - `designProposalRecord`
  - `designValidationResult`
  - `designEnforcementDecision`
- output:
  - `designReviewReport`
- dependencies:
  - `Create design proposal schema and store`  | סטטוס: `🔴 לא בוצע`
  - `Create design enforcement guard`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.9`

10. `Create rejected proposal regeneration loop`
- סטטוס: `🔴 לא בוצע`
- description: לבנות loop שמחזיר proposal שנדחתה ל־regeneration עם violation context, retry policy ו־attempt history
- input:
  - `designEnforcementDecision`
  - `designReviewReport`
- output:
  - `designRegenerationRequest`
  - `designRetryState`
- dependencies:
  - `Create design review assembler`  | סטטוס: `🔴 לא בוצע`
  - `Failure Recovery & Rollback`  | סטטוס: `🟢 בוצע`
- connects_to: `Execution Surface`
- execution_order: `2.10`

#### Sub-block: `Context Relevance & Reduction`

- הקטע הזה אינו owner של משימות ב־`Wave 3`.
- owner בפועל:
  - [docs/v2-master-plan-and-waves.md](/Users/yogevlavian/Desktop/The Nexus/docs/v2-master-plan-and-waves.md)
- סטטוס בקובץ זה:
  - `prerequisite only`
- משימות ההפניה:
  - `Define context relevance schema`
  - `Create context relevance filter`
  - `Create context slimming pipeline`
- למה הן מוזכרות כאן:
  - `AI Design Pipeline` תלויה בהשלמתן כדי למנוע `garbage context`, אבל הבעלות שלהן לא עוברת ל־`Wave 3`

#### Sub-block: `Human Editing & Partial Acceptance`

- הקטע הזה אינו owner של משימות ב־`Wave 3`.
- owner בפועל:
  - [docs/v2-master-plan-and-waves.md](/Users/yogevlavian/Desktop/The Nexus/docs/v2-master-plan-and-waves.md)
- סטטוס בקובץ זה:
  - `prerequisite only`
- משימות ההפניה:
  - `Define editable proposal schema`
  - `Create proposal editing system`
  - `Create partial acceptance flow`
- למה הן מוזכרות כאן:
  - `AI Design Pipeline` צריכה להישען על proposal editing ו־partial acceptance שכבר הוגדרו מוקדם יותר, אבל אין כאן בעלות מחדש על המשימות

#### Sub-block: `System Capability Registry`

11. `Define system capability registry schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד לרישום capabilities, limits, supported workflows, execution classes ו־unsupported operations של Nexus
- input:
  - `productBoundaryModel`
  - `extensionRegistry`
- output:
  - `systemCapabilityRegistry`
- dependencies:
  - `Define product boundary schema`  | סטטוס: `🔴 לא בוצע`
  - `Extensibility Framework`
- connects_to: `Project State`
- execution_order: `2.11`

12. `Create system capability resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שקובע בזמן אמת אם פעולה או workflow נתמכים, מוגבלים, דורשים אישור מיוחד או מחוץ לגבולות Nexus
- input:
  - `systemCapabilityRegistry`
  - `requestedAction`
  - `workspaceModel`
- output:
  - `capabilityDecision`
- dependencies:
  - `Define system capability registry schema`  | סטטוס: `🔴 לא בוצע`
  - `Create capability promise and limit map`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `2.12`

### Block 3 — Platform Cost & Usage Control

מטרת הבלוק:
- להבין usage ועלות אמיתית של Nexus לפי משתמש, פרויקט, workspace, provider ופעולה.

1. `Define platform usage cost schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ליחידות usage ועלות של Nexus כמו AI calls, builds, storage, logs, snapshots ו־workspace compute
- input:
  - `usageDimensions`
  - `providerPricing`
- output:
  - `platformCostSchema`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `3.1`

2. `Create AI usage meter`
- סטטוס: `🔴 לא בוצע`
- description: לבנות meter שמודד צריכת AI לפי request type, model/provider, tokens, latency ו־action class
- input:
  - `providerCall`
  - `actionContext`
- output:
  - `aiUsageMetric`
- dependencies:
  - `Define platform usage cost schema`  | סטטוס: `🔴 לא בוצע`
  - `AI Design Pipeline`
- connects_to: `Project State`
- execution_order: `3.2`

3. `Create workspace compute cost tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker לעלות compute של cloud workspaces, runtime events ו־background jobs
- input:
  - `cloudWorkspaceModel`
  - `runtimeEvents`
- output:
  - `workspaceComputeMetric`
- dependencies:
  - `Create cloud execution workspace model`  | סטטוס: `🟢 בוצע`
  - `Define platform usage cost schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.3`

4. `Create storage and artifact cost tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker לעלויות קבצים, artifacts, logs ו־snapshots לפי נפח, שמירה ומשך חיים
- input:
  - `storageRecord`
  - `artifactMetadata`
- output:
  - `storageCostMetric`
- dependencies:
  - `Create file and artifact storage module`  | סטטוס: `🟢 בוצע`
  - `Define platform usage cost schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.4`

5. `Create build and deploy cost tracker`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.5`

6. `Create cost summary aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregator שמרכז עלויות לפי משתמש, פרויקט, workspace, provider ותקופה
- input:
  - `platformCostMetrics`
- output:
  - `costSummary`
- dependencies:
  - `Create build and deploy cost tracker`  | סטטוס: `🔴 לא בוצע`
  - `Create storage and artifact cost tracker`  | סטטוס: `🔴 לא בוצע`
  - `Create AI usage meter`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.6`

7. `Create usage budget guard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות guard שמזהה חריגות usage, חוסם פעולות יקרות מדי ומבקש approval לפני חציית תקציב
- input:
  - `costSummary`
  - `budgetPolicy`
- output:
  - `budgetDecision`
- dependencies:
  - `Create cost summary aggregator`  | סטטוס: `🔴 לא בוצע`
  - `Approval System`  | סטטוס: `🟡 חלקי`
- connects_to: `Execution Surface`
- execution_order: `3.7`

8. `Create cost visibility API and dashboard model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות payload ו־dashboard model שמציגים עלויות, usage trends, top cost drivers ו־budget warnings
- input:
  - `costSummary`
  - `budgetDecision`
- output:
  - `costVisibilityPayload`
  - `costDashboardModel`
- dependencies:
  - `Create cost summary aggregator`  | סטטוס: `🔴 לא בוצע`
  - `UI / UX Foundation`
- connects_to: `Project State`
- execution_order: `3.8`

#### Sub-block: `Cost-Aware Decision Engine`

9. `Create cost-aware action selector`
- סטטוס: `🔴 לא בוצע`
- description: לבנות selector שמעדיף בין actions חלופיים לפי expected value, latency, provider cost ו־budget pressure
- input:
  - `candidateActions`
  - `costSummary`
  - `decisionIntelligence`
- output:
  - `costAwareActionSelection`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Decision Intelligence Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `3.9`

10. `Create budget constraint engine`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.10`

### Block 4 — Billing & Monetization System

מטרת הבלוק:
- להגדיר איך Nexus גובה כסף, מפעילה entitlements ומחברת usage לגישה למוצר.

1. `Define billing plan schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ל־plans, limits, entitlements, trial rules ו־pricing model של Nexus
- input:
  - `pricingStrategy`
  - `usageDimensions`
- output:
  - `billingPlanSchema`
- dependencies:
  - `Platform Cost & Usage Control`
- connects_to: `Project State`
- execution_order: `4.1`

2. `Create entitlement resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שקובע אילו capabilities, limits ו־features זמינים למשתמש או workspace לפי plan נוכחי
- input:
  - `billingPlanSchema`
  - `workspaceModel`
  - `usageSummary`
- output:
  - `entitlementDecision`
- dependencies:
  - `Define billing plan schema`  | סטטוס: `🔴 לא בוצע`
  - `Workspace & Access Control`
- connects_to: `Project State`
- execution_order: `4.2`

3. `Create subscription lifecycle module`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מודול שמנהל `trial`, `active`, `past_due`, `canceled` ו־`grace period` עבור subscriptions
- input:
  - `billingEvent`
  - `workspaceModel`
- output:
  - `subscriptionState`
- dependencies:
  - `Define billing plan schema`  | סטטוס: `🔴 לא בוצע`
  - `Billing & Revenue Metrics`
- connects_to: `Project State`
- execution_order: `4.3`

4. `Create usage-to-billing mapper`
- סטטוס: `🔴 לא בוצע`
- description: למפות usage בפועל ל־billable units כמו active workspaces, AI consumption, builds או premium actions
- input:
  - `costSummary`
  - `billingPlanSchema`
- output:
  - `billableUsage`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Define billing plan schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `4.4`

5. `Create checkout and subscription API`
- סטטוס: `🔴 לא בוצע`
- description: לבנות API ליצירת checkout, שדרוג plan, ביטול subscription וניהול billing details
- input:
  - `workspaceId`
  - `billingInput`
- output:
  - `billingPayload`
- dependencies:
  - `Create subscription lifecycle module`  | סטטוס: `🔴 לא בוצע`
  - `Identity & Auth`
- connects_to: `Project State`
- execution_order: `4.5`

6. `Create billing enforcement guard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות guard שחוסם שימוש מחוץ ל־entitlements או מעל limits ומציע upgrade path מתאים
- input:
  - `entitlementDecision`
  - `billableUsage`
- output:
  - `billingGuardDecision`
- dependencies:
  - `Create entitlement resolver`  | סטטוס: `🔴 לא בוצע`
  - `Create usage-to-billing mapper`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `4.6`

7. `Create billing settings and plan selection screen model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model למסכי plan selection, usage visibility, invoices ו־upgrade prompts
- input:
  - `subscriptionState`
  - `billingGuardDecision`
- output:
  - `billingSettingsModel`
- dependencies:
  - `Create checkout and subscription API`  | סטטוס: `🔴 לא בוצע`
  - `UI / UX Foundation`
- connects_to: `Project State`
- execution_order: `4.7`

## First Executable Order

אם צריך לענות מיד "מה מתחילים קודם", זה הסדר:

1. `Define project creation event schema`
2. `Create project creation tracker`
3. `Create project creation aggregation module`
4. `Define task execution metric schema`
5. `Create task execution tracker`
6. `Create task throughput aggregator`
7. `Define AI design request schema`
8. `Create AI design request builder`
9. `Define design provider contract`
10. `Create design provider adapter`

## What Must Not Start Early

- אסור להתחיל `Create design provider adapter` לפני `Define design provider contract`.
- אסור להתחיל `Create design validation layer` לפני `Create design response normalizer`.
- אסור להתחיל עבודה על `AI Design Pipeline` לפני שסגורים ב־`Wave 1`:
  - `Context Relevance & Reduction`
  - `Human Editing & Partial Acceptance`
- אסור להתחיל `Create system capability resolver` לפני `Define system capability registry schema`.
- אסור להתחיל `Create post-execution evaluation pipeline` לפני `Create execution consistency validator` ו־`Create system bottleneck detector`.
- אסור להתחיל `Create cross-layer feedback orchestrator` לפני `Create post-execution evaluation pipeline`.
- אסור להתחיל `Create adaptive execution loop` לפני `Create cross-layer feedback orchestrator`.
- אסור להתחיל `Create system optimization cycle` לפני `Create adaptive execution loop`.
- אסור להתחיל `Create product iteration feedback engine` לפני `Create feature success tracker` ו־`Create outcome feedback loop`.
- אסור להתחיל `Create cost summary aggregator` לפני ש־`AI usage meter`, `workspace compute`, `storage` ו־`build/deploy` קיימים.
- אסור להתחיל `Create cost-aware action selector` לפני `Create cost summary aggregator`.
- אסור להתחיל `Create billing enforcement guard` לפני ש־`entitlementDecision` ו־`billableUsage` סגורים.

## End State Of This File

בסוף ההכנה של `Wave 3` צריך להיות ברור:
- מהי המשימה הראשונה
- מה בא אחריה
- מהו סדר הביצוע הנכון
- איפה `AI Design Pipeline` נכנסת
- ואילו משימות חסרו ב־backlog המקורי וקיבלו כאן פירוק execution מפורש
