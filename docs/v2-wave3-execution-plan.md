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

הרחבת execution plan בגלל gap קריטי נוסף שהתברר בבדיקת repo:
- `Nexus Core Product Experience & Surface Delivery`
- `AI Observability & Safety Ops`

הרחבת execution plan בגלל gap קריטי נוסף שהתברר בבדיקת repo:
- `Existing Business Intake & Diagnosis`
- `External Capability Fabric`

הרחבת execution plan בגלל gap קריטי נוסף שהתברר בבדיקת repo:
- `Persistence & Return Continuity`
- `Unified Home Dashboard & Guided Execution`

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

## Canonical Execution Order Encoding

ה־execution ledger הקנוני של `Wave 3` ב־[docs/wave3-canonical-state.json](/Users/yogevlavian/Desktop/The%20Nexus/docs/wave3-canonical-state.json) משתמש עכשיו רק ב־`execution_order` כמחרוזת zero-padded רציפה:

- `001`
- `002`
- `003`
- ...

כלומר:
- אין יותר `execution_order` מספרי
- אין יותר insertions עשרוניים כמו `7.10`
- decimal ordering אסור בלדג'ר הקנוני
- הסדר הקנוני נקבע רק לפי המיקום ב־`wave3OrderedExecutionMap`

חשוב:
- המספור המקומי בתוך מסמך התכנון נשאר תיאורי בלבד
- הניווט המחייב בזמן execution הוא רק דרך ה־JSON הקנוני

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

- התקדמות נוכחית של הגל: `27/103` משימות סגורות = `26.2%`
- חלוקת סטטוסים כרגע:
  - `🟢 בוצע`: `27`
  - `🟡 חלקי / תלות חלקית / תלוי בשכבה קודמת`: `0`
  - `🔴 לא בוצע`: `76`

## Block Execution Order

זה סדר הביצוע המחייב ברמת הבלוקים:

1. `Design Runtime Foundations`
2. `Nexus Core Product Experience & Surface Delivery`
3. `Existing Business Intake & Diagnosis`
4. `Persistence & Return Continuity`
5. `Behavioral Analytics & User Truth`
6. `Autonomous Product Ops`
7. `External Capability Fabric`
8. `Execution Surface / Real Execution`
9. `Deployment Reality`
10. `Live Release Verification`
11. `AI Generation Engine`
12. `AI Observability & Safety Ops`
13. `Owner Creative Control Plane & Generated Surface Proof`
14. `Growth & Monetization Expansion`

למה זה הסדר הנכון:
- `Design Runtime Foundations` קודם כי Wave 3 לא יכולה לטעון autonomy, UX surfaces או AI generation בלי boundary / capability / reliability truth.
- `Nexus Core Product Experience & Surface Delivery` חייב לבוא מוקדם, כי בלי owner קנוני ל־app shell, navigation, dashboard home, daily workspace ו־generated surface delivery, backend state נשאר מפורק ולא הופך למוצר אמיתי.
- `Existing Business Intake & Diagnosis` חייב לבוא מוקדם, כי בלי intake/import/diagnosis owner Nexus נשארת מכוונת רק ל־greenfield onboarding ולא יודעת להמשיך עסק/מוצר קיים מתוך repo, אתר, קבצים ו־analytics exports.
- `Persistence & Return Continuity` חייב לבוא מוקדם, כי בלי durability למשתמשים / פרויקטים / sessions ובלי return-tomorrow owner, Nexus נשארת product shell שנשענת על in-memory state ולא באמת שורדת יום עבודה אמיתי.
- `Behavioral Analytics & User Truth` מגיעים לפני לולאות optimization עמוקות, כדי ש־retention / attribution / productivity יישענו על history אמיתי ולא על signals אפמרליים.
- `Autonomous Product Ops` יושב אחרי שיש behavioral truth, כדי שהערכה, feedback ו־adaptation loops יסתמכו על evidence אמיתי.
- `External Capability Fabric` חייב להגיע לפני `AI Generation Engine`, כי provider routing, credentials, inbound provider events, source-control binding ו־design imports לא יכולים להישאר fragmentים לא־בבעלות בזמן ש־Wave 3 מתחילה להישען על generation ו־import flows.
- `Execution Surface / Real Execution` חייב לשבת אחרי `External Capability Fabric` ולפני `AI Generation Engine`, כדי ש־Wave 3 לא תעצור ב־planning בלבד אלא תדע לנתב, להפעיל, לנרמל ולאסוף artifacts של execution אמיתי.
- `Deployment Reality` יושב מיד אחרי execution realness, כדי ש־deploy יהפוך לפעולה קנונית עם evidence ו־result envelope במקום side effect לא־מבוקר.
- `Live Release Verification` מגיע לפני `AI Generation Engine`, כדי שלא תהיה טענת launch בלי production health, launch confirmation ו־release readiness truth.
- `AI Generation Engine` בונה את צינור ה־request/provider/service/normalization.
- `AI Observability & Safety Ops` חייב לשבת מיד אחריו כדי ש־provider failures, prompt-contract breaks, generation success ו־acceptance יהיו שקופים לפני הפיכת generated surfaces ל־owner-facing flow.
- `Owner Creative Control Plane & Generated Surface Proof` מגיע אחרי שיש גם generation וגם observability, כדי ש־preview/review/diff/apply יתבססו על generation שהוא גם measurable.
- `Growth & Monetization Expansion` אחרון, כי הוא מרחיב self-serve monetization על גבי surface/product foundations קיימות.

## Structural Repair After Full Product-Layer Audit

בדיקת המבנה גילתה שני gaps קריטיים שלא היו בבעלות קנונית:

1. `Nexus Core Product Experience & Surface Delivery`
- ה־repo כבר כולל חלקים אמיתיים של auth screens, onboarding, workspace navigation, companion surfaces, analytics screen ו־billing screen model.
- לא היה owner קנוני ל־Nexus product shell עצמו:
  - authenticated app shell
  - navigation / route binding
  - dashboard home
  - daily workspace
  - settings / profile
  - delivery של generated Nexus screens לתוך המוצר

2. `AI Observability & Safety Ops`
- ה־repo כבר כולל health/fallback/provider primitives.
- לא היה owner קנוני ל־AI runtime truth:
  - prompt failures
  - provider latency / failure
  - generation success
  - review acceptance / rejection
  - operator-facing review telemetry

משמעות:
- Wave 3 לא הייתה בטוחה לביצוע בלי שני הבלוקים האלה, כי generation יכול היה להתקדם בלי delivery owner ובלי observability owner.

## Structural Repair After Integration And Intake Audit

בדיקת המבנה גילתה שני gaps קריטיים נוספים:

1. `Existing Business Intake & Diagnosis`
- ה־repo כבר כולל intake uploads, repository connection, project scanner ו־knowledge reader.
- לא היה owner קנוני לשרשרת המלאה:
  - uploaded intake -> scanner handoff
  - normalization של assets קיימים
  - repo/codebase diagnosis
  - website/funnel diagnosis
  - analytics import normalization
  - task extraction
  - import-and-continue roadmap

2. `External Capability Fabric`
- ה־repo כבר כולל provider connector schema/contract/assembler, Git connector, degraded/recovery primitives ו־encrypted credentials.
- לא היה owner קנוני לשרשרת החיבור המלאה:
  - external capability registry
  - source-control binding
  - secret resolution
  - connector credential binding
  - inbound provider webhooks
  - connector health/failover
  - design tool imports

משמעות:
- בלי `Existing Business Intake & Diagnosis`, Nexus נשארת מערכת שמתחילה מ־zero במקום להמשיך מצב עסקי/מוצרי קיים.
- בלי `External Capability Fabric`, Wave 3 הייתה מסתמכת על primitives מפוזרים בלי owner קנוני לשכבת החיבור החיצוני עצמה.

## Structural Repair After Core Value Audit

בדיקת product-value גילתה שלושה אזורים חלשים:

1. `Unified Home Dashboard`
- ה־repo כבר מציג workspace top shell, owner dashboards, analytics summaries ו־progress state.
- לא היה owner קנוני ל־main home אחד שמרכז:
  - instant wow-value
  - unified progress
  - priorities today
  - next best actions
  - owner visibility

2. `Real Persistence Database / Return Tomorrow Continuity`
- ה־repo כבר כולל persistence schemas, snapshot contracts ו־durable analytics history חלקי.
- לא היה owner קנוני לשרשרת המלאה:
  - durable users
  - durable projects/workspaces
  - durable sessions
  - continuity אחרי restart
  - return tomorrow flow

3. `Guided Task Execution UX`
- ה־repo כבר יודע לייצר roadmap, assigned tasks, approvals ו־progress state.
- לא היה owner קנוני לשרשרת UX ממוקדת:
  - focused task runner
  - step-by-step execution flow
  - task progress during execution
  - approval handoff בזמן אמת

משמעות:
- בלי שלושת השכבות האלה Nexus עדיין נראית כמו מערכת חזקה עם shell, לא כמו מוצר מלוטש עם home ברור, continuity אמיתי ו־task-doing experience אמיתי.

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
- סטטוס: `🟢 בוצע`
- description: לבנות schema אחיד לאירוע יצירת פרויקט דרך Nexus שנפלט רק ב־`createProjectDraft`, כאשר `projectId` נקשר ל־draft id הזמין בזמן היצירה כדי למנוע double-counting מול onboarding
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
- סטטוס: `🟢 בוצע`
- description: לבנות tracker אינקרמנטלי שמקבל `projectCreationEvent` יחיד יחד עם מצב tracker קודם ומעדכן רק את המונה המצטבר `totalProjectsCreated`, בלי להכניס grouping או aggregation
- input:
  - `projectCreationEvent`
- output:
  - `projectCreationMetric`
- dependencies:
  - `Define project creation event schema`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.2`

3. `Create project creation aggregation module`
- סטטוס: `🟢 בוצע`
- description: לחשוף תחילה `projectCreationEvents[]` דרך project/context payload הקיים, ואז לבנות aggregation לבעלי workspace/admin על בסיס האירועים לפי יום, משתמש ומקור יצירה, כאשר `projectCreationMetric.totalProjectsCreated` משמש רק כ־reference total
- input:
  - `projectCreationEvents[]`
  - `projectCreationMetric`
- output:
  - `projectCreationSummary`
- dependencies:
  - `Create project creation tracker`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.3`

3.5. `Create durable project creation event history store`
- סטטוס: `🔴 לא בוצע`
- description: לבנות store durable ל־`projectCreationEvent` הקנוני כדי ש־`projectCreationEvents[]` ו־`projectCreationSummary` ישמרו היסטוריית יצירת פרויקטים מעבר ל־server restart ויוכלו להזין product/owner analytics אמינים
- input:
  - `projectCreationEvent`
- output:
  - `projectCreationEventHistory`
- dependencies:
  - `Define project creation event schema`  | סטטוס: `🟢 בוצע`
  - `Create project creation aggregation module`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.3.5`
- completion_type: `durable-history`
- coverage_check:
  - description: `planned`
  - input: `planned`
  - output: `planned`
  - dependencies: `planned`
- status_note: מימוש Wave 2 מספק `projectCreationEvents[]` רק מתוך store פנימי in-memory בתוך `ProjectService`; המשימה הזו מוסיפה durability כדי שהיסטוריית project creation לא תאבד ב־restart ותוכל להישען עליה analytics מאוחרים
- user_facing_path:
  - `owner analytics and product analytics over project creation history`
- green_criteria:
  - כל `projectCreationEvent` קנוני נכתב ל־store durable
  - restart שומר על `projectCreationEvents[]`
  - `projectCreationSummary` יכול להיבנות מחדש מההיסטוריה הדורבילית ולא רק מ־process memory
  - יש tests ל־restart continuity ולמניעת duplicate replay לפי event id
- missing_for_green:
  - `durable store implementation`
  - `restart continuity tests`
  - `aggregation rebuild from durable history`
- risks:
  - `owner/product analytics יכולים להתאפס או להטעות אחרי restart עד שההיסטוריה תהיה durable`
  - `יש סיכון ל־duplicate replay אם event ids לא ינורמלו נכון בזמן rebuild`

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
- description: לבנות estimator דטרמיניסטי ראשוני שמחזיר `baselineEstimateMs` לפי lookup קבוע, כ־initial defaults בלבד, בלי scope inference ובלי לטעון שזה המודל הסופי ארוך הטווח
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

8.5. `Create learned baseline estimator from execution history`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מודל baseline נלמד שמחשב `baselineEstimateMs` מתוך historical `executionDurationMs`, מקובץ לפחות לפי `taskType` ובאופן אופציונלי לפי dimensions יציבים נוספים, כדי להחליף או להעשיר את default lookup של ה־Wave 2 estimator
- input:
  - `timeSavedMetric`
  - `taskExecutionMetric`
  - `historicalExecutionDurations`
- output:
  - `learnedBaselineEstimate`
- dependencies:
  - `Define time saved estimation schema`  | סטטוס: `🟢 בוצע`
  - `Create baseline effort estimator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.85`
- completion_type: `learned-estimator`
- coverage_check:
  - description: `planned`
  - input: `planned`
  - output: `planned`
  - dependencies: `planned`
- status_note: המשימה הזו אינה חוסמת את Wave 2. היא מוסיפה learned baseline שמבוסס על execution history אמיתי, עם fallback מפורש ל־Wave 2 default lookup כאשר אין מספיק data.
- user_facing_path:
  - `owner productivity and execution efficiency analytics`
- green_criteria:
  - baseline נלמד לפחות לפי `taskType`
  - learned baseline נשען על historical `executionDurationMs`, לא רק על values קשיחים
  - יש fallback ברור ל־Wave 2 defaults כשאין מספיק data
  - learned baseline יכול להחליף או להעשיר `baselineEstimateMs` בלי לשבור את חוזה ה־milliseconds
- missing_for_green:
  - `history collection implementation`
  - `learned baseline computation`
  - `fallback policy to default baseline`
  - `tests for learned vs fallback behavior`
- risks:
  - `אם taskType taxonomy תורחב בלי update תואם, learned baseline עלול להישאר sparse או noisy`

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

10.5. `Create user-agent ownership mapping model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מודל קנוני שמקשר בין `userId` אנושי, `membershipRecord`, `projectOwnershipBinding` ו־`projectAgents`, כדי שיהיה אפשר לייחס בהמשך execution של agents למשתמשים אמיתיים
- input:
  - `workspaceModel`
  - `membershipRecord`
  - `projectOwnershipBinding`
  - `projectAgents`
- output:
  - `userAgentMapping`
- dependencies:
  - `Define workspace and membership model`  | סטטוס: `🟢 בוצע`
  - `Create project ownership binding model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.105`
- user_facing_path:
  - `owner productivity and execution efficiency analytics`
- green_criteria:
  - `קיים mapping קנוני בין userId אנושי לבין agentIds ברמת project/workspace`
  - `המודל נשען על membership ו־project ownership מפורשים, לא על השוואת ids שרירותית`
  - `אפשר לדעת עבור כל project אילו agents שייכים לאיזה userId`
- missing_for_green:
  - `mapping persistence/wiring`
  - `tests for multi-project and multi-user ownership cases`
- risks:
  - `אם agents יישארו משותפים בין כמה users בלי ownership rule מפורש, attribution עתידי ל־true byUser עלול להיות ambiguous`

10.6. `Create human user productivity resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שממיר `timeSaved` מ־agent-scoped entries ל־human user-scoped entries באמצעות `userAgentMapping` ו־`projectOwnershipBinding`, כדי לאפשר future `byUser` אמיתי ששונה מ־`byAgentId`
- input:
  - `timeSaved`
  - `userAgentMapping`
  - `projectOwnershipBinding`
- output:
  - `userScopedTimeSaved`
- dependencies:
  - `Create time saved calculator`  | סטטוס: `🔴 לא בוצע`
  - `Create user-agent ownership mapping model`  | סטטוס: `🔴 לא בוצע`
  - `Create project ownership binding model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.106`
- user_facing_path:
  - `owner productivity and execution efficiency analytics`
- green_criteria:
  - `כל entry ב־userScopedTimeSaved כולל userId אנושי קנוני במקום להישען רק על agentId`
  - `mapping של productivity ל־user שונה מפורשות מ־raw byAgentId`
  - `entries לא ממופים מסומנים או מופרדים בצורה דטרמיניסטית, בלי inference רופף`
- missing_for_green:
  - `resolver implementation`
  - `handling for unmapped/ambiguous agent ownership`
  - `tests for distinct userId vs agentId behavior`
- risks:
  - `אם ownership binding או membership יהיו חלקיים, true byUser יישאר חלקי גם אם byAgentId זמין`

10.7. `Upgrade productivity summary to true byUser aggregation`
- סטטוס: `🔴 לא בוצע`
- description: לשדרג את `productivitySummary` כך ש־`byUser` יתבסס על `userScopedTimeSaved` עם `userId` אנושי קנוני, ולא על פירוש זמני של `agentId`
- input:
  - `productivitySummary`
  - `userScopedTimeSaved`
- output:
  - `productivitySummary`
- dependencies:
  - `Create productivity summary aggregator`  | סטטוס: `🔴 לא בוצע`
  - `Create human user productivity resolver`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.107`
- user_facing_path:
  - `owner productivity and execution efficiency analytics`
- green_criteria:
  - `byUser` ב־productivitySummary מבוסס על userId אנושי קנוני
  - `המערכת מבדילה במפורש בין byAgentId הזמני של Wave 2 לבין byUser אמיתי`
  - `tests מוכיחים שמשתמש אחד עם כמה agents מאוחד תחת אותו userId`
- missing_for_green:
  - `upgrade implementation for productivitySummary`
  - `tests for merged multi-agent per-user aggregation`
- risks:
  - `אם יישארו consumers שמניחים byUser=byAgentId, המעבר ל־true byUser עלול ליצור incompatibility downstream`

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

13.5. `Create durable user activity and session history store`
- סטטוס: `🟢 בוצע`
- description: לבנות history store durable ל־`userActivityEvent`, `userSessionMetric` ו־`returningUserMetric`, כדי לאפשר retention analytics אמיתי, time-window analysis ו־cohort grouping מעבר ל־signals האינקרמנטליים של Wave 2
- input:
  - `userActivityEvent`
  - `userSessionMetric`
  - `returningUserMetric`
- output:
  - `userActivityHistory`
  - `userSessionHistory`
- dependencies:
  - `Define user activity event schema`  | סטטוס: `🟢 בוצע` | owner: `Wave 2`
  - `Create session activity tracker`  | סטטוס: `🟢 בוצע` | owner: `Wave 2`
  - `Create returning user resolver`  | סטטוס: `🟢 בוצע` | owner: `Wave 2`
- connects_to: `Project State`
- execution_order: `1.13.5`
- user_facing_path:
  - `owner retention analytics foundations`
- green_criteria:
  - כל activity/session/returning signal קנוני נכתב ל־history durable
  - restart לא מאפס user/session retention history
  - אפשר לשחזר timeline אמיתי של session returns לפי `userId` ו־timestamps
  - יש tests ל־restart continuity ולמניעת duplicate replay לפי event/metric ids
- missing_for_green:
  - `none`
- status_note:
  - `implemented via durable user activity/session history store wired through ProjectService -> context-builder -> serialized project payload`
  - `history persists across restart and deduplicates replayed activity/session metrics by canonical ids`
- risks:
  - `בלי history durable, D1/D7/D30, cohorts ו־retention curves נשענים על signals אפמרליים ולא על timeline אמיתי`

14. `Create true retention metrics aggregator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות aggregation אמיתי של `D1/D7/D30`, `repeat usage` ו־`retention cohorts` מתוך history session/activity durable ולא מתוך ה־Wave 2 narrow summary
- input:
  - `userActivityHistory`
  - `userSessionHistory`
  - `returningUserMetric`
- output:
  - `retentionSummary`
- dependencies:
  - `Create durable user activity and session history store`  | סטטוס: `🟢 בוצע`
  - `Create returning user resolver`  | סטטוס: `🟢 בוצע` | owner: `Wave 2`
- connects_to: `Project State`
- execution_order: `1.14`
- user_facing_path:
  - `owner retention analytics`
- green_criteria:
  - `retentionSummary` מחשב `D1`, `D7`, `D30` מתוך היסטוריית sessions אמיתית
  - `retentionSummary` מחשב `repeat usage` בלי להסתמך על signal יחיד בלבד
  - `retentionSummary` כולל retention cohorts מפורשים לפי cohort start date
  - אין שימוש ב־ephemeral-only Wave 2 summary כתחליף ל־history analytics
  - tests מכסים D1/D7/D30, cohort grouping ו־insufficient-history handling
- missing_for_green:
  - `history-backed retention calculations`
  - `cohort grouping implementation`
  - `tests for D1/D7/D30`
- risks:
  - `אם aggregation תיבנה בלי history אמיתי, retention numbers ייראו מדויקים אבל לא ישקפו user behavior לאורך זמן`

14.5. `Create retention curve analyzer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות analyzer שמפיק retention curves לאורך זמן מתוך `retentionSummary` והיסטוריית הפעילות/סשנים, כדי לאפשר time-based retention analysis מעבר לנקודות D1/D7/D30
- input:
  - `retentionSummary`
  - `userActivityHistory`
  - `userSessionHistory`
- output:
  - `retentionCurveSummary`
- dependencies:
  - `Create durable user activity and session history store`  | סטטוס: `🔴 לא בוצע`
  - `Create true retention metrics aggregator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.14.5`
- user_facing_path:
  - `owner retention analytics`
- green_criteria:
  - קיימת הפקה קנונית של retention curves לפי זמן
  - curve data נשען על history אמיתי ולא על snapshot יחיד
  - אפשר לצרוך את ה־curves ב־dashboards owner-facing עתידיים
  - tests מכסים multiple time points ו־empty-history handling
- missing_for_green:
  - `curve generation logic`
  - `dashboard-facing shape`
  - `tests for timeline analysis`
- risks:
  - `ללא curve analyzer, ה־owner יראה retention checkpoints בלי להבין את צורת הדעיכה לאורך זמן`

#### Sub-block: `Billing & Revenue Metrics`

- owner: `Wave 2`
- moved billing runtime foundations to:
  - [docs/v2-wave2-execution-plan.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/v2-wave2-execution-plan.md)
- moved tasks:
  - `Define billing event schema`
  - `Create paying user tracker`
  - `Create revenue summary aggregator`
- reason:
  - billing runtime now depends directly on the Wave 2 chain:
    - `billing event ingestion and normalization`
    - `workspace billing state source`
    - `subscription lifecycle`
    - `checkout and subscription API`
- usage in Wave 3:
  - `revenueSummary` remains an external dependency consumed by analytics

#### Sub-block: `Nexus Analytics Dashboard`

15. `Define analytics dashboard schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ל־product analytics dashboard של Nexus
- input:
  - `analyticsMetrics`
- output:
  - `analyticsDashboardSchema`
- dependencies:
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `1.15`

16. `Create analytics summary assembler`
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
  - `Create revenue summary aggregator`  | סטטוס: `🟡 בוצע חלקית` | owner: `Wave 2`
  - `Create durable project creation event history store`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `1.16`

17. `Create analytics API`
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
- execution_order: `1.17`

18. `Create analytics dashboard screen`
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
- execution_order: `1.18`

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
  - `Create execution consistency validator`  | סטטוס: `🟢 בוצע`
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
  - `Create service reliability dashboard model`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `1.34`

35. `Create canonical backlog regeneration bridge`
- סטטוס: `🔴 לא בוצע`
- description: להמיר learning, feedback, insight ו־optimization outputs למשימות קנוניות שנכנסות ל־execution_order אמיתי עם dependencies, במקום להישאר sidecar roadmap items
- input:
  - `importAndContinueRoadmap`
  - `postExecutionEvaluation`
  - `postExecutionReport`
  - `crossLayerFeedbackState`
  - `adaptiveExecutionDecision`
  - `systemOptimizationPlan`
- output:
  - `canonicalBacklogRegeneration`
- dependencies:
  - `Create import-and-continue roadmap assembler`  | סטטוס: `🔴 לא בוצע`
  - `Define post-execution evaluation schema`  | סטטוס: `🔴 לא בוצע`
  - `Create post-execution evaluation pipeline`  | סטטוס: `🔴 לא בוצע`
  - `Create cross-layer feedback orchestrator`  | סטטוס: `🔴 לא בוצע`
  - `Create adaptive execution loop`  | סטטוס: `🔴 לא בוצע`
  - `Create system optimization cycle`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Canonical Execution Map`
- execution_order: `1.35`

### Inserted Canonical Block — Execution Surface / Real Execution

Execution-order range in canonical JSON: `057–067`

1. `Define execution action routing schema`  | סטטוס: `🔴 לא בוצע`
2. `Create action-to-provider mapping resolver`  | סטטוס: `🔴 לא בוצע`
3. `Create external execution dispatch module`  | סטטוס: `🔴 לא בוצע`
4. `Define IDE agent executor contract`  | סטטוס: `🔴 לא בוצע`
5. `Create local coding agent adapter`  | סטטוס: `🔴 לא בוצע`
6. `Create execution provider capability sync`  | סטטוס: `🔴 לא בוצע`
7. `Create external execution session manager`  | סטטוס: `🔴 לא בוצע`
8. `Create IDE agent result normalizer`  | סטטוס: `🔴 לא בוצע`
9. `Create execution invocation contract`  | סטטוס: `🔴 לא בוצע`
10. `Create artifact collection pipeline`  | סטטוס: `🔴 לא בוצע`
11. `Create canonical execution result envelope`  | סטטוס: `🔴 לא בוצע`

### Inserted Canonical Block — Deployment Reality

Execution-order range in canonical JSON: `068–070`

1. `Create deployment invoker`  | סטטוס: `🔴 לא בוצע`
2. `Create deployment evidence collector`  | סטטוס: `🔴 לא בוצע`
3. `Create deployment result envelope`  | סטטוס: `🔴 לא בוצע`

### Inserted Canonical Block — Live Release Verification

Execution-order range in canonical JSON: `071–073`

1. `Create production health validation module`  | סטטוס: `🔴 לא בוצע`
2. `Create launch confirmation state`  | סטטוס: `🔴 לא בוצע`
3. `Create release readiness evaluator`  | סטטוס: `🔴 לא בוצע`

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
- סטטוס: `🟢 בוצע`
- description: לבנות schema אחיד לרישום capabilities, limits, supported workflows, execution classes ו־unsupported operations של Nexus
- input:
  - `productBoundaryModel`
  - `extensionRegistry`
- output:
  - `systemCapabilityRegistry`
- dependencies:
  - `Define product boundary schema`  | סטטוס: `🟢 בוצע`
  - `Extensibility Framework`
- connects_to: `Project State`
- execution_order: `2.11`

12. `Create system capability resolver`
- סטטוס: `🟢 בוצע`
- description: לבנות resolver שקובע בזמן אמת אם פעולה או workflow נתמכים, מוגבלים, דורשים אישור מיוחד או מחוץ לגבולות Nexus
- input:
  - `systemCapabilityRegistry`
  - `requestedAction`
  - `workspaceModel`
- output:
  - `capabilityDecision`
- dependencies:
  - `Define system capability registry schema`  | סטטוס: `🟢 בוצע`
  - `Create capability promise and limit map`  | סטטוס: `🟢 בוצע`
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
- סטטוס: `🟡 בוצע חלקית`
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
- status_note: baseline runtime selector כבר קיים ב־Wave 2, אבל Wave 3 מגדיר scope רחב יותר של expected value / latency / provider cost / budget pressure ולכן נשארת השלמת scope.

10. `Create budget constraint engine`
- סטטוס: `🟡 בוצע חלקית`
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
- status_note: baseline constraint helper וה־`budgetDecision` runtime כבר קיימים, אבל Wave 3 מגדיר scope רחב יותר של provider lane / execution class envelopes ולכן נשארת השלמת scope.

### Block 4 — Billing & Monetization System

מטרת הבלוק:
- להגדיר איך Nexus גובה כסף, מפעילה entitlements ומחברת usage לגישה למוצר.

1. `Define billing plan schema`
- סטטוס: `🟢 בוצע`
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
- סטטוס: `🟡 בוצע חלקית`
- description: לבנות resolver שקובע אילו capabilities, limits ו־features זמינים למשתמש או workspace לפי plan נוכחי
- input:
  - `billingPlanSchema`
  - `workspaceModel`
  - `usageSummary`
- output:
  - `entitlementDecision`
- dependencies:
  - `Define billing plan schema`  | סטטוס: `🟢 בוצע`
  - `Workspace & Access Control`
- connects_to: `Project State`
- execution_order: `4.2`

3. `Create subscription lifecycle module`
- סטטוס: `🟡 בוצע חלקית`
- description: לבנות מודול שמנהל `trial`, `active`, `past_due`, `canceled` ו־`grace period` עבור subscriptions
- input:
  - `billingEvent`
  - `workspaceModel`
- output:
  - `subscriptionState`
- dependencies:
  - `Define billing plan schema`  | סטטוס: `🟢 בוצע`
  - `Billing & Revenue Metrics`
- connects_to: `Project State`
- execution_order: `4.3`

4. `Create usage-to-billing mapper`
- סטטוס: `🟢 בוצע`
- description: למפות usage בפועל ל־billable units כמו active workspaces, AI consumption, builds או premium actions
- input:
  - `costSummary`
  - `billingPlanSchema`
- output:
  - `billableUsage`
- dependencies:
  - `Platform Cost & Usage Control`
  - `Define billing plan schema`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `4.4`

5. `Create checkout and subscription API`
- סטטוס: `🟢 בוצע`
- description: לבנות API ליצירת checkout, שדרוג plan, ביטול subscription וניהול billing details
- input:
  - `workspaceId`
  - `billingInput`
- output:
  - `billingPayload`
- dependencies:
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
  - `Identity & Auth`
- connects_to: `Project State`
- execution_order: `4.5`

6. `Create billing enforcement guard`
- סטטוס: `🟢 בוצע`
- description: לבנות guard שחוסם שימוש מחוץ ל־entitlements או מעל limits ומציע upgrade path מתאים
- input:
  - `entitlementDecision`
  - `billableUsage`
- output:
  - `billingGuardDecision`
- dependencies:
  - `Create entitlement resolver`  | סטטוס: `🟡 בוצע חלקית`
  - `Create usage-to-billing mapper`  | סטטוס: `🟢 בוצע`
- connects_to: `Execution Surface`
- execution_order: `4.6`

7. `Create billing plan catalog and selection model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model מפורש ל־current plan מול available plans ולבחירת plan ב־billing self-serve, כדי להחליף current-plan display צר ב־plan selection אמיתי
- input:
  - `billingPlanSchema`
  - `workspaceBillingState`
  - `subscriptionState`
- output:
  - `billingPlanSelectionModel`
- dependencies:
  - `Define billing plan schema`  | סטטוס: `🟢 בוצע`
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
- connects_to: `Project State`
- execution_order: `4.7`

8. `Create payment method state model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model קנוני ל־current payment method מתוך billing evidence ואירועי update כדי להוסיף section אמיתי ל־billing self-serve
- input:
  - `normalizedBillingEvents`
  - `workspaceBillingState`
- output:
  - `paymentMethodState`
- dependencies:
  - `Create billing event ingestion and normalization module`  | סטטוס: `🟢 בוצע`
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `4.8`

9. `Create billing details state model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model קנוני ל־billing details נוכחיים מתוך billing evidence ואירועי update כדי שהמסך יציג state אמיתי ולא רק action
- input:
  - `normalizedBillingEvents`
  - `workspaceBillingState`
- output:
  - `billingDetailsState`
- dependencies:
  - `Create billing event ingestion and normalization module`  | סטטוס: `🟢 בוצע`
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `4.9`

10. `Create self-serve invoice state model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model קנוני ל־invoice list ו־invoice state עבור משתמש self-serve, מופרד מ־owner/operator invoice actions של Wave 4
- input:
  - `normalizedBillingEvents`
  - `subscriptionState`
- output:
  - `invoiceState`
- dependencies:
  - `Create billing event ingestion and normalization module`  | סטטוס: `🟢 בוצע`
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
- connects_to: `Project State`
- execution_order: `4.10`

11. `Expand billing settings and plan selection screen model`
- סטטוס: `🔴 לא בוצע`
- description: להרחיב את billing self-serve מעבר למסך הבסיסי כך שישמרו sectionי הבסיס של Wave 2 (`currentPlan`, `subscription`, `availableActions`, `history`) בלי לממש אותם מחדש, ובנוסף יתווספו plan selection אמיתי, usage visibility, invoices ו־upgrade prompts על בסיס models קנוניים
- input:
  - `billingSettingsModel`
  - `billingPlanSelectionModel`
  - `paymentMethodState`
  - `billingDetailsState`
  - `invoiceState`
  - `costVisibilityPayload`
  - `billingGuardDecision`
- output:
  - `billingSettingsModel`
- dependencies:
  - `Create billing settings base screen model`  | סטטוס: `🟢 בוצע`
  - `Create billing plan catalog and selection model`  | סטטוס: `🔴 לא בוצע`
  - `Create payment method state model`  | סטטוס: `🔴 לא בוצע`
  - `Create billing details state model`  | סטטוס: `🔴 לא בוצע`
  - `Create self-serve invoice state model`  | סטטוס: `🔴 לא בוצע`
  - `Create cost visibility API and dashboard model`  | סטטוס: `🟢 בוצע`
  - `UI / UX Foundation`
- connects_to: `Project State`
- execution_order: `4.11`
- expansion_rules:
  - משמר את ארבעת sectionי הבסיס של Wave 2: `currentPlan`, `subscription`, `availableActions`, `history`
  - לא מממש מחדש את ארבעת sectionי הבסיס ולא מחליף את חוזה ה־Wave 2 base screen
  - מוסיף רק capabilities של Wave 3: plan selection אמיתי, usage visibility, invoices ו־upgrade prompts
  - `renew` מצטרף ל־`availableActions` של המסך המורחב רק לאחר מימוש `Create renew subscription action`

#### Sub-block: `Advanced Subscription Lifecycle`

12. `Create pause subscription action`
- סטטוס: `🔴 לא בוצע`
- description: לבנות פעולה מפורשת להקפאת subscription כך שמשתמש יוכל לעצור חיוב שוטף בלי להפוך את ה־subscription ל־cancel, תוך שמירה על lifecycle evidence ו־resume path עתידי
- input:
  - `workspaceId`
  - `billingPayload`
  - `subscriptionState`
- output:
  - `subscriptionPausePayload`
- dependencies:
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
  - `Expand billing settings and plan selection screen model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `4.12`
- למה עכשיו: pause היא הרחבת lifecycle מתקדמת שנשענת על core billing actions, state ו־user-facing billing surface, ולכן לא שייכת ל־Wave 2 core.

13. `Create reactivate subscription action`
- סטטוס: `🔴 לא בוצע`
- description: לבנות פעולה להחזרת subscription ממצב paused/canceled eligible בחזרה ל־billing flow פעיל, בלי להמציא lifecycle semantics שלא קיימים ב־runtime
- input:
  - `workspaceId`
  - `billingPayload`
  - `subscriptionState`
- output:
  - `subscriptionReactivationPayload`
- dependencies:
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
  - `Create pause subscription action`  | סטטוס: `🔴 לא בוצע`
  - `Expand billing settings and plan selection screen model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `4.13`
- למה עכשיו: reactivation תלויה כבר בשכבת lifecycle עשירה יותר וב־pause/cancel semantics קיימים, ולכן היא הרחבת monetization/lifecycle ולא חלק מליבת checkout.

14. `Create renew subscription action`
- סטטוס: `🔴 לא בוצע`
- description: לבנות פעולה מפורשת ל־renew עבור subscriptions eligible בלי לבלבל בינה לבין retry payment, create checkout או reactivate flow, כך שהפעולה תהיה חלק מ־`availableActions` של billing self-serve המורחב
- input:
  - `workspaceId`
  - `billingPayload`
  - `subscriptionState`
- output:
  - `subscriptionRenewalPayload`
- dependencies:
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create subscription lifecycle module`  | סטטוס: `🟡 בוצע חלקית`
  - `Expand billing settings and plan selection screen model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `4.14`
- למה עכשיו: renew הוא self-serve lifecycle flow נפרד שלא מכוסה על ידי retry, checkout או reactivation, ולכן דורש contract מפורש רק אחרי שיש billing surface עשיר ו־subscription posture אמיתי.
- integration_path:
  - `renew` הוא חלק מ־Wave 3 self-serve billing UX
  - הפעולה נחשפת דרך `availableActions` של `billingSettingsModel` המורחב
  - אין ל־`renew` top-level section נפרד

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

## Corrected Closure Flow (Audit Sync)

כדי לסגור את `Wave 3` לפי הקוד וה־dependencies האמיתיים:

1. להתייחס ליסודות שמגיעים מ־`Wave 2` לפי הסטטוס המתוקן שלהם, לא לפי הסטטוס הישן:
   - `revenueSummary` = `🟡`
   - `entitlement resolver` = `🟡`
   - `subscription lifecycle` = `🟡`
   - `billing plan schema` / `usage-to-billing mapper` / `checkout API` / `billing enforcement guard` = `🟢`
2. לסגור קודם את ה־partial foundations ש־Wave 3 באמת תלויה בהם:
   - `Create cost-aware action selector`
   - `Create budget constraint engine`
   - `Create entitlement resolver`
   - `Create subscription lifecycle module`
3. רק אחרי זה לסגור blocks שבנויים עליהם:
   - `Nexus Analytics Dashboard`
   - `Outcome & Goal Evaluation`
   - `Product Feedback Loop`
   - `Meta Orchestration Layer`
4. לא לסמן analytics/revenue כמלאים עד שיש source monetary אמיתי או narrowing רשמי של ה־scope.

## End State Of This File

בסוף ההכנה של `Wave 3` צריך להיות ברור:
- מהי המשימה הראשונה
- מה בא אחריה
- מהו סדר הביצוע הנכון
- איפה `AI Design Pipeline` נכנסת
- ואילו משימות חסרו ב־backlog המקורי וקיבלו כאן פירוק execution מפורש
