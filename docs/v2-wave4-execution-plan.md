# V2 Wave 4 Execution Plan

מטרת הקובץ:
- לרכז את `Wave 4` כקובץ execution נפרד ועצמאי
- לעבוד מול קובץ המשימות המקורי כ־`source of truth`
- לסדר את הבלוקים והמשימות לפי סדר ביצוע אמיתי
- לאפשר עבודה ישירה מהקובץ בלי לחזור שוב לקובץ המקור

## Source Of Truth

קובץ המקור שממנו נגזרות משימות `Wave 4`:
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md)

מסמך end-state קנוני מחייב ל־`Wave 4`:
- [docs/operating-system/wave4-end-state-definition.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-end-state-definition.md)

מסמך planning track קנוני ל־`Minimum Believable Nexus Core`:
- [docs/operating-system/wave4-minimum-believable-core-planning-track.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md)

מסמך external product intelligence קנוני ל־`Wave 4`:
- [docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md)

מסמך execution engine קנוני ל־`Wave 4`:
- [docs/operating-system/wave4-permanent-orchestrator-v1.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-permanent-orchestrator-v1.md)

בלוקי `Wave 4` שנמשכו מהמקור:
- `Nexus Product Go-To-Market`
- `Owner Control Plane`

הרחבת execution plan בגלל תלות מוצרית מחייבת:
- `Product Boundary Model`
- `Minimum Believable Nexus Core`

הערה חשובה:
- `Product Boundary Model` יושבת בקובץ המקור מחוץ לבלוקי `Wave 4`, אבל בפועל היא תנאי עבודה ל־GTM ולהשקה.
- בלי boundary ברור אי אפשר ליישר promises, expectations ו־owner communications.
- `Minimum Believable Nexus Core` עדיין לא מפורק כאן למשימות backlog מלאות, אבל הוא כבר תנאי קנוני מחייב ל־Wave 4 לפי מסמך ה־end-state.
- הפירוק הקנוני הראשוני של `Minimum Believable Nexus Core` ל־lanes, tasks, execution order ו־validation gate מנוהל במסמך ה־planning track הייעודי.
- לכן אין לקרוא את `Wave 4` יותר כ־`boundary + GTM + owner shell` בלבד.

## Status Legend

- `🟢 בוצע`
- `🟡 חלקי / תלות חלקית / תלוי בשכבה קודמת`
- `🔴 לא בוצע`

## Wave 4 Goal

`Wave 4` נועדה להפוך את Nexus ל־`Minimum Believable Nexus`:
- מערכת שאפשר להשתמש בה באמת כדי לקחת `prompt` או `upload`
- להבין איזה מוצר בונים
- להתחיל לבנות אותו אוטומטית ובצורה class-aware
- להראות build progression חי מול המשתמש
- להחזיק local workspace continuity
- לקדם את המוצר ל־`releaseable product state`
- ולאפשר continuation אמיתי אחרי release

רק מעל השכבה הזאת `Wave 4` גם צריכה:
- ליישר `Product Boundary`
- להציג `Go-To-Market`
- ולאפשר `Owner Control Plane`

כלומר:
- `boundary`
- `GTM`
- `owner control`

הם חלק מ־`Wave 4`,
אבל אינם מגדירים אותה לבדם ואינם מספיקים לסגירה truthful של הגל.

## Wave 4 End-State Override

המסמך [docs/operating-system/wave4-end-state-definition.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-end-state-definition.md) הוא override קנוני לפרשנות של `Wave 4`.

מכאן והלאה:
- אסור למסגר את `Wave 4` כגל של `boundary/GTM/owner shell` בלבד
- חייבים לכלול בה `Minimum Believable Nexus Core`
- חייבים להתייחס כ־`non-negotiable` ל:
  - automatic class-aware product skeleton generation
  - real visible product build progression
  - evolving product surfaces
  - local-first / Electron-style workspace continuity
  - runtime / packaging preparation per class
  - releaseable product state and continuation loop
  - no meaningful backend/core/runtime progression without visible surface progression and live browser verification in parallel
  - external product intelligence must be integrated canonically, not copied or bolted on
  - structural UI evolution must go through coherent Figma-backed design planning, not patchwork implementation

הבהרה קנונית:
- Figma היא כלי design support ו־visual planning
- Nexus עצמה חייבת להישאר מנוע היצירה הפנימי:
  - class resolution
  - bootstrap
  - generation
  - runtime direction
  - release path
  - continuation

## Current Progress

- התקדמות נוכחית של הגל: `0/82` משימות סגורות = `0%`
- חלוקת סטטוסים כרגע:
  - `🟢 בוצע`: `0`
  - `🟡 חלקי / תלות חלקית / תלוי בשכבה קודמת`: `0`
  - `🔴 לא בוצע`: `82`

## Block Execution Order

זה סדר הביצוע המחייב ברמת הבלוקים:

1. `Minimum Believable Nexus Core`
2. `Product Boundary Model`
3. `Nexus Product Go-To-Market`
4. `Owner Control Plane`

למה זה הסדר הנכון:
- `Minimum Believable Nexus Core` קודם כי בלי build progression אמיתי, class-aware product skeletons, runtime direction ו־local workspace continuity, Nexus עדיין לא מוצר יצירה אמיתי אלא מעטפת תיאורית.
- `Product Boundary Model` קודם כי לפני שמשיקים צריך לדעת מה Nexus מבטיחה, מה מחוץ לתחום ומה חייב disclosure.
- `Nexus Product Go-To-Market` באה אחרי core + boundary כי messaging ו־launch חייבים להישען על מה Nexus באמת בונה מול המשתמש, לא על shell חיצוני מנותק.
- `Owner Control Plane` בא אחרי שיש מוצר עם product signals, build progression, funnel ו־measurement, כי owner systems נשענים על runtime truth אמיתי.

## Minimum Believable Nexus Core

הבלוק הזה הוא כעת חלק קנוני מ־`Wave 4`.

הפירוק הקנוני הפעיל שלו מנוהל ב:
- [docs/operating-system/wave4-minimum-believable-core-planning-track.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md)
- [docs/operating-system/wave4-product-class-resolution-model.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-product-class-resolution-model.md)
- [docs/operating-system/wave4-stage-runtime-direction-resolver.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-stage-runtime-direction-resolver.md)
- [docs/operating-system/wave4-automatic-product-skeleton-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-automatic-product-skeleton-contract.md)
- [docs/operating-system/wave4-class-specific-skeleton-quality-baseline.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-specific-skeleton-quality-baseline.md)
- [docs/operating-system/wave4-split-workspace-live-build-surface-model.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-split-workspace-live-build-surface-model.md)
- [docs/operating-system/wave4-build-progression-state-machine.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-build-progression-state-machine.md)
- [docs/operating-system/wave4-class-aware-generation-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-aware-generation-contract.md)
- [docs/operating-system/wave4-class-specific-surface-evolution-rules.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-specific-surface-evolution-rules.md)
- [docs/operating-system/wave4-local-workspace-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-local-workspace-contract.md)
- [docs/operating-system/wave4-desktop-shell-scope-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-desktop-shell-scope-contract.md)
- [docs/operating-system/wave4-class-aware-runtime-resolver.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-aware-runtime-resolver.md)
- [docs/operating-system/wave4-packaging-preview-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-packaging-preview-contract.md)
- [docs/operating-system/wave4-releaseable-product-state-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-releaseable-product-state-contract.md)
- [docs/operating-system/wave4-release-evidence-handoff-model.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-release-evidence-handoff-model.md)
- [docs/operating-system/wave4-post-release-continuation-loop.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-post-release-continuation-loop.md)
- [docs/operating-system/wave4-growth-opportunity-surfacing-boundary.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-growth-opportunity-surfacing-boundary.md)
- [docs/operating-system/wave4-class-aware-deployment-release-path.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-class-aware-deployment-release-path.md)
- [docs/operating-system/wave4-deployment-state-feedback-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-deployment-state-feedback-contract.md)
- [docs/operating-system/wave4-cross-surface-continuity-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-cross-surface-continuity-contract.md)
- [docs/operating-system/wave4-live-verification-matrix.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-live-verification-matrix.md)
- [docs/operating-system/wave4-figma-backed-live-build-workspace-contract.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-figma-backed-live-build-workspace-contract.md)
- [docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md)

הוא כולל יכולות שלא ניתן לדחות:
- automatic class-aware skeleton generation
- build progression חי מול העיניים של המשתמש
- real evolving product surfaces
- split workspace / live build surface / simulator-like layout where relevant
- local-first workspace continuity
- runtime / packaging resolver per product class
- releaseable product state
- first truthful post-release continuation loop
- coupled backend-to-surface progression and live verification discipline

בלי הבלוק הזה:
- `Wave 4` לא נסגרת truthfully
- `Product Boundary Model` ו־`GTM` נשארים מנותקים מיכולת הליבה של Nexus
- ו־`Owner Control Plane` נשענת על מוצר שעדיין לא usable מספיק

## Minimum Believable Nexus Core Lane Order

סדר ה־core lanes הקנוני לפני entry לבלוקי GTM / owner:
1. `Product Understanding And Class Resolution`
2. `Automatic Product Bootstrap`
3. `Live Build Surfaces`
4. `Class-Aware Product Generation`
5. `Local Workspace / Electron Shell`
6. `Runtime / Packaging Resolver`
7. `Releaseable Output`
8. `Continuation / Growth Loop`
9. `Deployment / Release Path`
10. `Live Orchestration Continuity`

ה־task graph, dependencies, ו־trueGreen criteria של ה־lanes האלה מוגדרים ב־planning track הייעודי.

חוזה ה־class resolution הקנוני של ה־core מוגדר ב:
- [docs/operating-system/wave4-product-class-resolution-model.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-product-class-resolution-model.md)

הבהרה:
- `productClass` הוא שדה ה־truth הראשי של Wave 4
- `domain specialization` הוא refinement משני
- כל bootstrap, runtime, release, ו־continuation חייבים להישען קודם כל על `productClass`

## Canonical Wave 4 Work Rule

מעכשיו והלאה, ובפרט בתוך `Wave 4`, אסור לבנות שכבות `backend/core/runtime` משמעותיות
בלי שהחזית, ה־routing, ה־continuity והמסך החי מתקדמים יחד איתן.

אם capability חדשה משנה אמת מוצרית, חייבים במקביל:
- לחשוף אותה visibly בתוך Nexus
- לחבר אותה ל־live route או surface אמיתי
- לבדוק אותה בלייב בדפדפן תוך כדי העבודה
- לראות איך המשתמש חווה אותה בפועל
- לוודא שאין disconnect בין engine truth לבין visible product truth

הזרימה הקנונית מעכשיו היא:
1. build capability
2. expose it visibly
3. test live
4. observe real behavior
5. אם משהו נשבר:
   - לתקן מיד
   - או לפתוח task / lane קנוני
6. rerun live
7. רק אז להמשיך

משמעות הכלל:
- no server truth without visible truth
- no planner truth without UI differentiation
- no route truth without restore truth
- no upload truth without downstream continuity

בנוסף, מעכשיו והלאה:
- delegation לסוכנים אחרים צריכה לשמש אקטיבית כאשר היא מאיצה closure מקצה לקצה
- אבל תמיד תחת orchestrator ראשי אחד

ה־main orchestrator נשאר הסמכות העליונה ל:
- architecture direction
- task ordering
- closure decisions
- rerun discipline
- canonical write-back
- lane promotion
- Wave transitions

ה־agents האחרים הם execution workers בלבד.
הם אינם רשאים:
- להמציא framework
- לשנות task ordering
- לפתוח lanes לבד
- לסגור `trueGreen` לבד
- לכתוב canonical truth בלי אישור orchestration

מודל העבודה המועדף מעכשיו:
- bounded investigations
- bounded fixes
- bounded verification
- parallel execution where it truthfully accelerates closure
- canonical unification by the main orchestrator

בנוסף:
- Wave 4 development must actively learn from relevant external builders, workflow systems, and product environments
- but every imported pattern must enter through the canonical lane/task structure, with validation, continuity, and UI integration rules
- if a capability requires structural UI evolution, that evolution must pause for Figma-backed design planning before implementation continues

## Parallelization Rules

מה אפשר במקביל:
- בתוך `Nexus Product Go-To-Market` אפשר להפריד בין:
  - `Product Positioning & Messaging`
  - `Product Website & Conversion Funnel`
  - `Content & Launch Engine`
  כל עוד אין שני סוכנים על אותו `messagingFramework` או `launchCampaignBrief`.
- בתוך `Owner Control Plane` אפשר להפריד בין:
  - `Owner Business Cockpit`
  - `Owner Security & Privileged Access`
  - `Owner Audit & Monitoring`
  רק אחרי ש־`Owner Control Center` קיים.

מה אסור להתחיל מוקדם:
- אסור להתחיל `Create core messaging framework` לפני `Define Nexus positioning schema`.
- אסור להתחיל `Create landing page information architecture` לפני `Define Nexus website schema`.
- אסור להתחיל `Create public site and app boundary model` לפני `Define product delivery model schema`.
- אסור להתחיל `Create app entry gate resolver` לפני `Create public landing to auth handoff flow`.
- אסור להתחיל `Create first value milestone mapper` לפני `Define activation funnel schema`.
- אסור להתחיל `Create launch channel rollout plan` לפני `Create Nexus launch campaign brief`.
- אסור להתחיל `Create launch performance dashboard assembler` לפני `Create website-to-activation funnel analyzer`.
- אסור להתחיל `Create owner control center` לפני `Define owner control plane schema`.
- אסור להתחיל `Create owner priority engine` לפני `Create daily overview generator`.
- אסור להתחיל `Create profit and margin analyzer` לפני `Create revenue tracking system` ו־`Create cost tracking system`.
- אסור להתחיל `Create root cause analysis system` לפני `Create incident timeline tracker`.
- אסור להתחיל `Create admin-only access layer` לפני `Create privileged mode system`.

## Validation Gate

`Wave 4 Validation Gate` מגיע רק אחרי שכל הבלוקים לעיל נסגרו ברמת implementation:
- `Minimum Believable Nexus Core`
- boundary ברור של המוצר
- website + landing + access flows של Nexus
- activation, launch ו־GTM measurement אמיתיים
- owner control center עם operations, security ו־audit
- אין פער בין מה שהמוצר מבטיח בחוץ לבין מה שהבעלים רואה ושולט מבפנים
- והמשתמש רואה את המוצר עצמו נבנה, משתנה ומתקדם מולו בזמן אמת

לצורך planning truth, ה־gate המפורט של `Minimum Believable Nexus` מנוהל ב:
- [docs/operating-system/wave4-minimum-believable-core-planning-track.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md)

## Execution Order By Block

### Block 1 — Product Boundary Model

מטרת הבלוק:
- להגדיר במפורש מה Nexus עושה, מה היא לא עושה, ומה חייב disclosure למשתמשים ולשוק.

#### Sub-block: `Product Boundary Model`

1. `Define product boundary schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד שמגדיר מה Nexus עושה, מה הוא לא עושה, מה הוא אוטומטי ומה נשאר באחריות המשתמש
- input:
  - `productVision`
  - `autonomyControlSchema`
- output:
  - `productBoundaryModel`
- dependencies:
  - `Policy Layer`  | סטטוס: `🟢 בוצע`
  - `Nexus Product Go-To-Market`
- connects_to: `Project State`
- execution_order: `1.1`
- למה עכשיו: בלי boundary schema אי אפשר ליישר promises, onboarding, approvals ו־site messaging.

2. `Create capability promise and limit map`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מפה מוצרית של promises, limits, disclaimers ו־non-goals לפי workflow, agent ו־feature area
- input:
  - `productBoundaryModel`
  - `agentGovernancePolicy`
- output:
  - `capabilityLimitMap`
- dependencies:
  - `Define product boundary schema`  | סטטוס: `🔴 לא בוצע`
  - `Agent Governance & Sandboxing`
- connects_to: `Project State`
- execution_order: `1.2`
- למה עכשיו: זו השכבה שמונעת oversell ומייצרת תיאום בין capability אמיתית לבין marketing promise.

3. `Create boundary disclosure and expectation model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות model להצגת גבולות המוצר בממשק, באתר וב־approval flows כדי למנוע ציפיות שגויות
- input:
  - `capabilityLimitMap`
  - `messagingFramework`
- output:
  - `boundaryDisclosureModel`
- dependencies:
  - `Create capability promise and limit map`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Product Go-To-Market`
- connects_to: `Project State`
- execution_order: `1.3`
- למה עכשיו: disclosure הוא הגשר בין architecture פנימית לבין trust חיצוני.

### Block 2 — Nexus Product Go-To-Market

מטרת הבלוק:
- לבנות מעטפת שיווקית, אתר, access flow, launch system ו־GTM feedback עבור Nexus כמוצר.

#### Sub-block: `Product Positioning & Messaging`

4. `Define Nexus positioning schema`
- סטטוס: `🔴 לא בוצע`
- description: לבנות schema אחיד ל־positioning של Nexus כולל audience, problem, promise, differentiation ו־proof points
- input:
  - `productVision`
  - `targetAudience`
  - `competitiveContext`
- output:
  - `nexusPositioning`
- dependencies:
  - `Business Context Layer`  | סטטוס: `🟢 בוצע`
  - `Content Strategy Engine`
- connects_to: `Project State`
- execution_order: `2.1`
- למה עכשיו: כל שכבת ה־GTM נשענת על positioning חד לפני site, copy ו־launch.

5. `Create core messaging framework`
- סטטוס: `🔴 לא בוצע`
- description: לבנות framework להודעות הליבה של Nexus כולל headline, subheadline, value props, objections ו־CTA angles
- input:
  - `nexusPositioning`
- output:
  - `messagingFramework`
- dependencies:
  - `Define Nexus positioning schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.2`
- למה עכשיו: messaging framework הוא התלות המרכזית של האתר, ה־copy וה־launch assets.

6. `Create audience-specific messaging variants`
- סטטוס: `🔴 לא בוצע`
- description: לבנות וריאציות messaging לקהלים שונים כמו indie builders, agencies, founders ו־operators
- input:
  - `messagingFramework`
  - `audienceSegments`
- output:
  - `messagingVariants`
- dependencies:
  - `Create core messaging framework`  | סטטוס: `🔴 לא בוצע`
  - `Create audience segmentation builder`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.3`
- למה עכשיו: בלי variants אי אפשר לבנות funnelים אמיתיים לפי audience.

7. `Create objection and FAQ map`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מפת objections, trust concerns ו־FAQ product answers עבור Nexus
- input:
  - `messagingFramework`
  - `userFeedback`
- output:
  - `objectionMap`
  - `faqMap`
- dependencies:
  - `Create core messaging framework`  | סטטוס: `🔴 לא בוצע`
  - `Learning Layer`
- connects_to: `Project State`
- execution_order: `2.4`
- למה עכשיו: objections ו־FAQ חייבים להיסגר לפני website copy ו־launch feedback handling.

8. `Create product CTA strategy`
- סטטוס: `🔴 לא בוצע`
- description: להגדיר אילו CTAs מובילים את Nexus כמו join waitlist, request access, start project או book demo
- input:
  - `messagingFramework`
  - `activationGoals`
- output:
  - `productCtaStrategy`
- dependencies:
  - `Create core messaging framework`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `2.5`
- למה עכשיו: CTA strategy מחברת message ל־conversion path אמיתי.

#### Sub-block: `Product Website & Conversion Funnel`

9. `Define Nexus website schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.6`
- למה עכשיו: schema של האתר קודמת ל־IA, copy ו־experiments.

10. `Create landing page information architecture`
- סטטוס: `🔴 לא בוצע`
- description: לבנות information architecture לדף הבית וה־landing pages של Nexus כולל sections, proof blocks ו־CTA placements
- input:
  - `nexusWebsiteSchema`
  - `messagingFramework`
- output:
  - `landingPageIa`
- dependencies:
  - `Define Nexus website schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.7`
- למה עכשיו: IA מסדרת את המבנה לפני copy ו־proof assets.

11. `Create Nexus website copy pack`
- סטטוס: `🔴 לא בוצע`
- description: לבנות חבילת copy מלאה לאתר של Nexus כולל headline, subheadline, sections, FAQ ו־microcopy
- input:
  - `landingPageIa`
  - `messagingVariants`
  - `faqMap`
- output:
  - `websiteCopyPack`
- dependencies:
  - `Create landing page copy generator`  | סטטוס: `🔴 לא בוצע`
  - `Create objection and FAQ map`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.8`
- למה עכשיו: copy pack הוא חומר הגלם של האתר, ה־launch assets וה־proof pages.

12. `Create website conversion flow`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.9`
- למה עכשיו: זהו ה־core funnel לפני access modes ו־activation.

13. `Create waitlist and access request module`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מודול לקליטת משתמשים לרשימת המתנה, access requests ו־status updates
- input:
  - `visitorInput`
  - `websiteConversionFlow`
- output:
  - `waitlistRecord`
  - `accessRequest`
- dependencies:
  - `Create website conversion flow`  | סטטוס: `🔴 לא בוצע`
  - `Notification System`
- connects_to: `Project State`
- execution_order: `2.10`
- למה עכשיו: access control למוצר ציבורי דורש מודול מפורש ל־waitlist/request.

14. `Create website experiment and CTA test layer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות שכבה לניסויי CTA, headlines ו־section variants באתר של Nexus
- input:
  - `websiteCopyPack`
  - `productCtaStrategy`
- output:
  - `websiteExperimentPlan`
- dependencies:
  - `Create website conversion flow`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `2.11`
- למה עכשיו: experiments נכנסים רק אחרי שיש אתר, copy ו־conversion path סגורים.

#### Sub-block: `Landing, Access & App Entry Flow`

15. `Define product delivery model schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.12`
- למה עכשיו: delivery model קובע את גבול האתר, האפליקציה והכניסה למוצר.

16. `Create public site and app boundary model`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מודל ברור שמפריד בין האתר הציבורי של Nexus לבין אזור האפליקציה, כולל routes, trust boundaries ו־handoff points
- input:
  - `productDeliveryModel`
  - `nexusWebsiteSchema`
- output:
  - `siteAppBoundary`
- dependencies:
  - `Define product delivery model schema`  | סטטוס: `🔴 לא בוצע`
  - `Define Nexus website schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.13`
- למה עכשיו: boundary ברור מונע בלבול בין marketing surface לבין app surface.

17. `Create access mode resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שקובע אם Nexus עובד ב־open access, waitlist, invite only או request access לפי stage של המוצר
- input:
  - `productDeliveryModel`
  - `launchStage`
  - `visitorContext`
- output:
  - `accessModeDecision`
- dependencies:
  - `Define product delivery model schema`  | סטטוס: `🔴 לא בוצע`
  - `Create waitlist and access request module`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.14`
- למה עכשיו: access mode הוא מנגנון rollout, לא detail UI.

18. `Create public landing to auth handoff flow`
- סטטוס: `🔴 לא בוצע`
- description: לבנות handoff קנוני מה־landing page ל־signup, login, waitlist או access request בלי לשבור את ההקשר השיווקי
- input:
  - `siteAppBoundary`
  - `accessModeDecision`
  - `productCtaStrategy`
- output:
  - `landingAuthHandoff`
- dependencies:
  - `Create public site and app boundary model`  | סטטוס: `🔴 לא בוצע`
  - `Create access mode resolver`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.15`
- למה עכשיו: handoff חלק הוא אחד המקומות שבהם conversion נשברת.

19. `Create app entry gate resolver`
- סטטוס: `🔴 לא בוצע`
- description: לבנות resolver שמכריע אם משתמש נכנס ישר ל־app, עובר דרך access gate, חוזר ל־login או מנותב ל־waitlist state
- input:
  - `landingAuthHandoff`
  - `authenticationState`
  - `sessionState`
- output:
  - `appEntryDecision`
- dependencies:
  - `Create session and token management`  | סטטוס: `🔴 לא בוצע`
  - `Create public landing to auth handoff flow`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.16`
- למה עכשיו: זו נקודת המעבר הקריטית בין חוץ לפנים.

20. `Create post-login destination resolver`
- סטטוס: `🟡 חלקי`
- description: לבנות resolver שמחליט אם אחרי login המשתמש נוחת ב־dashboard, onboarding resume, waitlist status, approval inbox או first project kickoff
- input:
  - `appEntryDecision`
  - `userSessionMetric`
  - `projectState`
- output:
  - `postLoginDestination`
- dependencies:
  - `Create app entry gate resolver`  | סטטוס: `🔴 לא בוצע`
  - `User Activity & Retention`
- connects_to: `Project State`
- execution_order: `2.17`
- למה עכשיו: destination נכון קובע activation ולא רק login success.
- status_note: קיים כבר runtime resolver צר של `postAuthRedirect`, אבל לא `postLoginDestination` קנוני עם כל היעדים המוצהרים של Wave 4.

21. `Create first project kickoff flow`
- סטטוס: `🟡 חלקי`
- description: לבנות flow מפורש שבו משתמש חדש עובר מה־dashboard או ה־entry destination אל יצירת הפרויקט הראשון וה־onboarding הראשון
- input:
  - `postLoginDestination`
  - `activationFunnel`
  - `onboardingSession`
- output:
  - `firstProjectKickoff`
- dependencies:
  - `Create onboarding session service`  | סטטוס: `🟢 בוצע`
  - `Define activation funnel schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.18`
- למה עכשיו: kickoff מפורש מחבר את כניסת המשתמש ל־first project actual.
- status_note: ה־cockpit path הקיים כבר תומך ב־first project usable flow, אבל עדיין לא כ־entry-system canonical artifact מלא.

22. `Create landing-to-dashboard funnel assembler`
- סטטוס: `🔴 לא בוצע`
- description: להרכיב view model מלא של הזרימה מ־landing דרך access/login ועד dashboard ו־first project
- input:
  - `landingAuthHandoff`
  - `appEntryDecision`
  - `postLoginDestination`
  - `firstProjectKickoff`
- output:
  - `landingToDashboardFlow`
- dependencies:
  - `Create first project kickoff flow`  | סטטוס: `🟡 חלקי`
  - `Create post-login destination resolver`  | סטטוס: `🟡 חלקי`
- connects_to: `Project State`
- execution_order: `2.19`
- למה עכשיו: assembler סוגר את ה־funnel למודל אחד שאפשר למדוד ולשפר.

#### Sub-block: `Product-Led Onboarding Marketing`

23. `Define activation funnel schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.20`
- למה עכשיו: activation funnel מחברת signup ל־first value אמיתי.

24. `Create first value milestone mapper`
- סטטוס: `🔴 לא בוצע`
- description: למפות milestones כמו signup, first project, first task, first execution ו־first visible result
- input:
  - `activationFunnel`
  - `projectJourneys`
- output:
  - `activationMilestones`
- dependencies:
  - `Define activation funnel schema`  | סטטוס: `🔴 לא בוצע`
  - `User Flow System`
- connects_to: `Project State`
- execution_order: `2.21`
- למה עכשיו: milestones נדרשים כדי למדוד activation, drop-off ו־re-engagement.

25. `Create onboarding marketing copy flow`
- סטטוס: `🔴 לא בוצע`
- description: לבנות רצף מסרים ל־signup confirmation, welcome, activation prompts ו־drop-off recovery
- input:
  - `activationFunnel`
  - `messagingFramework`
- output:
  - `onboardingMarketingFlow`
- dependencies:
  - `Create email sequence copy generator`  | סטטוס: `🔴 לא בוצע`
  - `Define activation funnel schema`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.22`
- למה עכשיו: activation בלי רצף מסרים מובנה נשחקת מהר.

26. `Create activation drop-off detector`
- סטטוס: `🔴 לא בוצע`
- description: לבנות detector שמזהה משתמשים שנתקעו בין signup לבין first value ומסווג את סיבת התקיעה
- input:
  - `activationMilestones`
  - `userActivityEvents`
- output:
  - `activationDropOffs`
- dependencies:
  - `User Activity & Retention`
  - `Create first value milestone mapper`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.23`
- למה עכשיו: drop-off detection נדרשת לפני re-engagement.

27. `Create re-engagement trigger planner`
- סטטוס: `🔴 לא בוצע`
- description: לבנות planner שמחליט מתי לשלוח nudges, emails או in-app prompts כדי להחזיר משתמש ל־activation
- input:
  - `activationDropOffs`
  - `notificationPreferences`
- output:
  - `reEngagementPlan`
- dependencies:
  - `Create activation drop-off detector`  | סטטוס: `🔴 לא בוצע`
  - `Notification System`
- connects_to: `Project State`
- execution_order: `2.24`
- למה עכשיו: זה סוגר את הלופ של activation recovery.

#### Sub-block: `Content & Launch Engine`

28. `Create Nexus content strategy profile`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.25`
- למה עכשיו: זה מחבר positioning לתוכן מתמשך ו־launch assets.

29. `Create launch content calendar`
- סטטוס: `🔴 לא בוצע`
- description: לבנות editorial calendar לתקופת pre-launch, launch ו־post-launch של Nexus
- input:
  - `nexusContentStrategy`
  - `launchTimeline`
- output:
  - `launchContentCalendar`
- dependencies:
  - `Create editorial calendar builder`  | סטטוס: `🔴 לא בוצע`
  - `Create Nexus content strategy profile`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.26`
- למה עכשיו: calendar מסדר את רצף התוכן סביב launch.

30. `Create founder and product story asset builder`
- סטטוס: `🔴 לא בוצע`
- description: לבנות assets שמספרים את הסיפור של Nexus, הבעיה שהוא פותר והמסע של הבנייה שלו
- input:
  - `nexusPositioning`
  - `launchContentCalendar`
- output:
  - `storyAssets`
- dependencies:
  - `Create Nexus content strategy profile`  | סטטוס: `🔴 לא בוצע`
  - `Marketing Asset Generation`
- connects_to: `Project State`
- execution_order: `2.27`
- למה עכשיו: story assets הם proof אנושי, לא רק feature list.

31. `Create social and community content pack`
- סטטוס: `🔴 לא בוצע`
- description: לבנות pack של posts, threads, community intros ו־conversation starters להשקת Nexus
- input:
  - `storyAssets`
  - `launchContentCalendar`
- output:
  - `socialCommunityPack`
- dependencies:
  - `Create ad copy generator`  | סטטוס: `🔴 לא בוצע`
  - `Create founder and product story asset builder`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.28`
- למה עכשיו: זה מכין distribution organic/community לפני rollout.

32. `Create product demo and proof asset plan`
- סטטוס: `🔴 לא בוצע`
- description: לבנות plan לנכסי proof כמו demo videos, screenshots, walkthroughs ו־result snapshots
- input:
  - `websiteCopyPack`
  - `activationMilestones`
- output:
  - `productProofPlan`
- dependencies:
  - `Create Nexus website copy pack`  | סטטוס: `🔴 לא בוצע`
  - `Product-Led Onboarding Marketing`
- connects_to: `Project State`
- execution_order: `2.29`
- למה עכשיו: proof assets נדרשים לפני launch checklist ו־publishing plan.

#### Sub-block: `Launch Campaign System`

33. `Create Nexus launch campaign brief`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.30`
- למה עכשיו: brief נכון בא לפני rollout, assets ו־metrics.

34. `Create launch channel rollout plan`
- סטטוס: `🔴 לא בוצע`
- description: לבנות rollout plan לפי ערוצים כמו website, email, X, LinkedIn, communities ו־waitlist updates
- input:
  - `launchCampaignBrief`
  - `socialCommunityPack`
- output:
  - `launchRolloutPlan`
- dependencies:
  - `Create Nexus launch campaign brief`  | סטטוס: `🔴 לא בוצע`
  - `Marketing Distribution Orchestrator`
- connects_to: `Project State`
- execution_order: `2.31`
- למה עכשיו: rollout plan מחבר assets לערוצים ולזמנים.

35. `Create launch asset readiness checklist`
- סטטוס: `🔴 לא בוצע`
- description: לבנות checklist שמוודא שכל ה־assets, copy, CTA flows, proof elements ו־tracking מוכנים לפני push
- input:
  - `launchRolloutPlan`
  - `productProofPlan`
- output:
  - `launchReadinessChecklist`
- dependencies:
  - `Create launch channel rollout plan`  | סטטוס: `🔴 לא בוצע`
  - `Create product demo and proof asset plan`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.32`
- למה עכשיו: readiness checklist היא gate לפני publishing.

36. `Create launch draft publishing plan`
- סטטוס: `🔴 לא בוצע`
- description: לבנות plan שמתרגם rollout ל־drafts, scheduled content, waitlist messages ו־campaign pushes
- input:
  - `launchRolloutPlan`
  - `launchContentCalendar`
- output:
  - `launchPublishingPlan`
- dependencies:
  - `Create campaign draft publisher`  | סטטוס: `🔴 לא בוצע`
  - `Create launch channel rollout plan`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.33`
- למה עכשיו: publishing plan הוא המעבר מ־planning ל־execution של launch.

37. `Create launch feedback intake module`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.34`
- למה עכשיו: feedback intake סוגר את ה־launch loop ולא משאיר signals באוויר.

#### Sub-block: `GTM Measurement & Feedback`

38. `Define GTM metric schema for Nexus`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `2.35`
- למה עכשיו: בלי schema אין launch measurement אמיתי.

39. `Create acquisition source tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker למקורות תנועה והרשמה כמו direct, community, social, referrals ו־campaign links
- input:
  - `projectCreationEvent`
  - `userActivityEvent`
  - `attributionMetadata`
- output:
  - `acquisitionSourceMetrics`
- dependencies:
  - `Define GTM metric schema for Nexus`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.36`
- למה עכשיו: attribution הוא הבסיס ל־optimization ולא ל־guesswork.

40. `Create website-to-activation funnel analyzer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות analyzer שמחבר ביקור באתר, signup, onboarding, first project ו־first activation
- input:
  - `acquisitionSourceMetrics`
  - `activationMilestones`
- output:
  - `websiteActivationFunnel`
- dependencies:
  - `Create acquisition source tracker`  | סטטוס: `🔴 לא בוצע`
  - `Product-Led Onboarding Marketing`
- connects_to: `Project State`
- execution_order: `2.37`
- למה עכשיו: זה המדד המרכזי של go-to-market effectiveness.

41. `Create launch performance dashboard assembler`
- סטטוס: `🔴 לא בוצע`
- description: לבנות assembler שמרכז launch KPIs, website conversion, channel performance ו־activation insights במסך אחד
- input:
  - `websiteActivationFunnel`
  - `launchFeedbackSummary`
  - `revenueSummary`
- output:
  - `launchPerformanceDashboard`
- dependencies:
  - `Create website-to-activation funnel analyzer`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Product Analytics`
- connects_to: `Project State`
- execution_order: `2.38`
- למה עכשיו: dashboard אחד נדרש לבקרה על launch בזמן אמת.

42. `Create GTM optimization loop`
- סטטוס: `🔴 לא בוצע`
- description: לבנות loop שמציע שיפורים ל־positioning, site copy, CTA strategy, channels ו־activation flow לפי נתוני אמת
- input:
  - `launchPerformanceDashboard`
  - `launchFeedbackSummary`
- output:
  - `gtmOptimizationPlan`
- dependencies:
  - `Create launch performance dashboard assembler`  | סטטוס: `🔴 לא בוצע`
  - `Create optimization recommendation engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `2.39`
- למה עכשיו: זה סוגר את ה־GTM loop משיווק למדידה לשיפור.

### Block 3 — Owner Control Plane

מטרת הבלוק:
- לבנות שכבת בעלים אמיתית שמרכזת metrics, decisions, incidents, security ו־audit עבור הפעלת Nexus כמוצר.

#### Sub-block: `Owner Control Center`

43. `Define owner control plane schema`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.1`
- למה עכשיו: זו שכבת ה־control הראשית לפני dashboards ו־owner routines.

44. `Create owner control center`
- סטטוס: `🔴 לא בוצע`
- description: לבנות assembler ראשי שמרכז metrics, incidents, roadmap state, security signals ו־recommended actions לבעלים
- input:
  - `ownerControlPlane`
  - `analyticsSummary`
  - `platformTrace`
- output:
  - `ownerControlCenter`
- dependencies:
  - `Define owner control plane schema`  | סטטוס: `🔴 לא בוצע`
  - `Nexus Product Analytics`
  - `Platform Observability`
- connects_to: `Project State`
- execution_order: `3.2`
- למה עכשיו: control center יושב לפני daily ops, business cockpit ו־security owner flows.

45. `Create daily overview generator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות generator לתמונת מצב יומית של מה חשוב היום, מה השתנה, מה נתקע ומה דורש החלטה
- input:
  - `ownerControlCenter`
  - `platformLogs`
  - `incidentAlert`
- output:
  - `dailyOwnerOverview`
- dependencies:
  - `Create owner control center`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.3`
- למה עכשיו: daily overview הוא בסיס העבודה השוטפת של owner.

46. `Create owner priority engine`
- סטטוס: `🔴 לא בוצע`
- description: לבנות engine שמדרג מה הכי חשוב לבעלים עכשיו לפי risk, revenue impact, user impact ו־execution urgency
- input:
  - `dailyOwnerOverview`
  - `priorityResolution`
- output:
  - `ownerPriorityQueue`
- dependencies:
  - `Create daily overview generator`  | סטטוס: `🔴 לא בוצע`
  - `Strategic Decision Layer`
- connects_to: `Project State`
- execution_order: `3.4`
- למה עכשיו: owner needs prioritization, not just visibility.

47. `Create action recommendation system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system שמציע לבעלים את הפעולה הבאה ברמת מוצר, תפעול, כספים, growth או reliability
- input:
  - `ownerPriorityQueue`
  - `ownerControlCenter`
- output:
  - `ownerActionRecommendations`
- dependencies:
  - `Create owner priority engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.5`
- למה עכשיו: זו שכבת הפעולה של owner, לא רק התצוגה.

48. `Create owner decision dashboard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות dashboard model לבעלים שמרכז החלטות פתוחות, overrides, approvals ו־follow-up actions
- input:
  - `ownerActionRecommendations`
  - `approvalChain`
- output:
  - `ownerDecisionDashboard`
- dependencies:
  - `Create action recommendation system`  | סטטוס: `🔴 לא בוצע`
  - `Approval System`  | סטטוס: `🟡 חלקי`
- connects_to: `Project State`
- execution_order: `3.6`
- למה עכשיו: decision dashboard סוגר את loop ההחלטות של owner.

#### Sub-block: `Owner Daily Operations`

49. `Create daily workflow generator`
- סטטוס: `🔴 לא בוצע`
- description: לבנות generator לשגרת עבודה יומית של בעלים לפי health, growth, delivery ו־open decisions
- input:
  - `dailyOwnerOverview`
  - `ownerPriorityQueue`
- output:
  - `ownerDailyWorkflow`
- dependencies:
  - `Create daily overview generator`  | סטטוס: `🔴 לא בוצע`
  - `Create owner priority engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.7`
- למה עכשיו: workflow יומי מחבר overview לפעולה בפועל.

50. `Create focus area selector`
- סטטוס: `🔴 לא בוצע`
- description: לבנות selector שמכריע אם היום הפוקוס הוא reliability, product, growth, cost, security או delivery
- input:
  - `ownerDailyWorkflow`
  - `ownerControlCenter`
- output:
  - `ownerFocusArea`
- dependencies:
  - `Create daily workflow generator`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.8`
- למה עכשיו: focus area מונע פיזור owner attention.

51. `Create task recommendation engine`
- סטטוס: `🔴 לא בוצע`
- description: לבנות engine שמציע לבעלים task list יומית לפי focus area, blockers ו־strategic priorities
- input:
  - `ownerFocusArea`
  - `ownerActionRecommendations`
- output:
  - `ownerTaskList`
- dependencies:
  - `Create focus area selector`  | סטטוס: `🔴 לא בוצע`
  - `Create action recommendation system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.9`
- למה עכשיו: task list היא תרגום של strategy לרמת execution יומיומית.

52. `Create owner routine assistant`
- סטטוס: `🔴 לא בוצע`
- description: לבנות assistant שמגדיר checklists, recurring reviews ו־end-of-day closure לבעלים
- input:
  - `ownerTaskList`
  - `ownerDailyWorkflow`
- output:
  - `ownerRoutinePlan`
- dependencies:
  - `Create task recommendation engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.10`
- למה עכשיו: routine assistant הופך owner management להרגל ולא לכיבוי שריפות.

#### Sub-block: `Owner Business Cockpit`

53. `Create revenue tracking system`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.11`
- למה עכשיו: owner cockpit חייב להתחיל ב־revenue visibility.

54. `Create cost tracking system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות owner-facing tracking לעלויות AI, compute, storage, tools ו־providers
- input:
  - `costSummary`
  - `budgetDecision`
- output:
  - `ownerCostView`
- dependencies:
  - `Platform Cost & Usage Control`
- connects_to: `Project State`
- execution_order: `3.12`
- למה עכשיו: cost visibility היא תנאי ל־margin ול־cash control.

55. `Create profit and margin analyzer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות analyzer שמחבר revenue ו־cost ל־margin, contribution ואזורי שחיקה
- input:
  - `ownerRevenueView`
  - `ownerCostView`
- output:
  - `profitMarginSummary`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: `🔴 לא בוצע`
  - `Create cost tracking system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.13`
- למה עכשיו: margin הוא owner metric קריטי, לא nice-to-have.

56. `Create unit economics dashboard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות dashboard owner-facing ל־CAC, LTV, payback ו־cost-to-serve assumptions
- input:
  - `unitEconomics`
  - `profitMarginSummary`
- output:
  - `unitEconomicsDashboard`
- dependencies:
  - `Business Viability & Infrastructure`
  - `Create profit and margin analyzer`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.14`
- למה עכשיו: זה מחבר business model ל־owner decisions.

57. `Create cash flow projection engine`
- סטטוס: `🔴 לא בוצע`
- description: לבנות engine שמקרין cash runway, expected inflows ו־upcoming obligations
- input:
  - `ownerRevenueView`
  - `ownerCostView`
- output:
  - `cashFlowProjection`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: `🔴 לא בוצע`
  - `Create cost tracking system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.15`
- למה עכשיו: owner needs forward view, not just current state.

58. `Create user analytics dashboard`
- סטטוס: `🔴 לא בוצע`
- description: לבנות dashboard owner-facing ל־active users, project creation, retention, churn ו־usage segments
- input:
  - `retentionSummary`
  - `retentionCurveSummary`
  - `projectCreationSummary`
  - `taskThroughputSummary`
- output:
  - `ownerUserAnalytics`
- dependencies:
  - `Nexus Product Analytics`
  - `Create durable project creation event history store`  | סטטוס: `🔴 לא בוצע` | owner: `Wave 3`
  - `Create retention curve analyzer`  | סטטוס: `🔴 לא בוצע` | owner: `Wave 3`
- connects_to: `Project State`
- execution_order: `3.16`
- למה עכשיו: owner cockpit צריך לחבר business metrics ל־user metrics.

59. `Create feature usage tracker`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.17`
- למה עכשיו: owner view חייב לדעת לא רק מי משתמש, אלא במה.

60. `Create decision accuracy tracker`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.18`
- למה עכשיו: זה מחבר owner behavior ל־actual outcomes.

61. `Create automation impact tracker`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.19`
- למה עכשיו: automation בלי impact tracking נשארת אמונה ולא metric.

62. `Create system roadmap tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker owner-facing להתקדמות roadmap, delivery slippage, velocity ו־backlog health
- input:
  - `roadmap`
  - `taskThroughputSummary`
- output:
  - `roadmapTracking`
- dependencies:
  - `Universal Project Lifecycle`  | סטטוס: `🟢 בוצע`
  - `Task Execution Metrics`
- connects_to: `Project State`
- execution_order: `3.20`
- למה עכשיו: owner צריך לראות health של roadmap, לא רק של execution ו־revenue.

#### Sub-block: `Owner Billing Operations`

63. `Create coupon application management flow`
- סטטוס: `🔴 לא בוצע`
- description: לבנות flow owner-facing להגדרת והחלת coupons/offers על checkout או plan change כך שהנחות מסחריות ינוהלו כמנגנון מבוקר ולא כחלק מליבת billing action הפשוטה
- input:
  - `ownerRevenueView`
  - `pricingModelDecision`
  - `billingPayload`
- output:
  - `couponApplicationPayload`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: `🔴 לא בוצע`
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create pricing model engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `3.21`
- למה עכשיו: coupons הם commercial/pricing control מתקדם שתלוי גם ב־billing core וגם ב־owner revenue/pricing systems, ולכן נכון למקם אותו ב־Wave 4.

64. `Create manual invoice actions flow`
- סטטוס: `🔴 לא בוצע`
- description: לבנות flow owner/operator לפעולות invoice ידניות כמו review, resend, mark-as-handled או administrative resolution בלי לערבב אותן עם self-serve subscription actions
- input:
  - `ownerRevenueView`
  - `workspaceBillingState`
  - `normalizedBillingEvent`
- output:
  - `manualInvoiceActionPayload`
- dependencies:
  - `Create revenue tracking system`  | סטטוס: `🔴 לא בוצע`
  - `Create checkout and subscription API`  | סטטוס: `🟢 בוצע`
  - `Create self-serve invoice state model`  | סטטוס: `🔴 לא בוצע`
  - `Expand billing settings and plan selection screen model`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Execution Surface`
- execution_order: `3.22`
- למה עכשיו: manual invoice actions הן finance/operator flow מובהק שדורש owner visibility, audit ו־runtime billing history מעבר לליבת checkout של Wave 2.

#### Sub-block: `Owner Operations & Incidents`

65. `Create operations signal aggregator`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.23`
- למה עכשיו: זהו מקור האמת התפעולי של owner mode.

66. `Create critical alert prioritizer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות prioritizer שמבדיל בין alerts קריטיים, חשובים ורועשים מדי לפני שהם מגיעים לבעלים
- input:
  - `ownerOperationsSignals`
  - `ownerPriorityQueue`
- output:
  - `prioritizedOwnerAlerts`
- dependencies:
  - `Create operations signal aggregator`  | סטטוס: `🔴 לא בוצע`
  - `Create owner priority engine`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.24`
- למה עכשיו: owner לא יכול לספוג raw alerts בלי prioritization.

67. `Create noise suppression system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות מנגנון suppression שמונע spam alerts לבעלים ומעלה רק מה שבאמת דורש תשומת לב
- input:
  - `prioritizedOwnerAlerts`
  - `ownerRoutinePlan`
- output:
  - `ownerAlertFeed`
- dependencies:
  - `Create critical alert prioritizer`  | סטטוס: `🔴 לא בוצע`
  - `Owner Daily Operations`
- connects_to: `Project State`
- execution_order: `3.25`
- למה עכשיו: suppression נדרש כדי שהבעלים לא יטבעו ברעש.

68. `Create incident detection system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system לזיהוי incidents, outages, degradation ו־service anomalies ברמת owner
- input:
  - `ownerOperationsSignals`
  - `platformTrace`
- output:
  - `ownerIncident`
- dependencies:
  - `Create operations signal aggregator`  | סטטוס: `🔴 לא בוצע`
  - `Platform Observability`
- connects_to: `Project State`
- execution_order: `3.26`
- למה עכשיו: incident layer הופכת signals ל־actionable owner events.

69. `Create outage response manager`
- סטטוס: `🔴 לא בוצע`
- description: לבנות manager לתגובה owner-facing על outage כולל runbook, owner actions ו־communication state
- input:
  - `ownerIncident`
  - `continuityPlan`
- output:
  - `outageResponsePlan`
- dependencies:
  - `Create incident detection system`  | סטטוס: `🔴 לא בוצע`
  - `Scalability`
- connects_to: `Project State`
- execution_order: `3.27`
- למה עכשיו: owner needs response plan, not just incident detection.

70. `Create incident timeline tracker`
- סטטוס: `🔴 לא בוצע`
- description: לבנות tracker לציר זמן של incident, detection, mitigation, recovery ו־follow-up
- input:
  - `ownerIncident`
  - `platformTrace`
- output:
  - `incidentTimeline`
- dependencies:
  - `Create incident detection system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.28`
- למה עכשיו: timeline מספקת traceability לתפעול וללימוד.

71. `Create root cause analysis system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system שמציע root cause candidates, affected services ו־corrective actions אחרי incident
- input:
  - `incidentTimeline`
  - `causalImpactReport`
- output:
  - `rootCauseSummary`
- dependencies:
  - `Create incident timeline tracker`  | סטטוס: `🔴 לא בוצע`
  - `Operating Model & Defensibility`
- connects_to: `Project State`
- execution_order: `3.29`
- למה עכשיו: RCA סוגר את הלופ בין incident ל־improvement.

#### Sub-block: `Owner Security & Privileged Access`

72. `Create owner secure authentication system`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.30`
- למה עכשיו: owner plane בלי secure auth הוא סיכון ישיר.

73. `Create enforced multi-factor authentication`
- סטטוס: `🔴 לא בוצע`
- description: לבנות enforcement ל־MFA בבעלים עבור login, privileged mode ו־critical actions
- input:
  - `ownerAuthState`
  - `authenticationState`
- output:
  - `ownerMfaDecision`
- dependencies:
  - `Create owner secure authentication system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.31`
- למה עכשיו: MFA הוא baseline ל־owner operations.

74. `Create device trust system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system שבודק trusted devices, device risk ו־session posture עבור owner mode
- input:
  - `ownerAuthState`
  - `requestContext`
- output:
  - `deviceTrustDecision`
- dependencies:
  - `Create owner secure authentication system`  | סטטוס: `🔴 לא בוצע`
  - `Security Hardening`
- connects_to: `Project State`
- execution_order: `3.32`
- למה עכשיו: device trust מחזקת privileged access beyond credentials בלבד.

75. `Create sensitive action confirmation system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות flow אישור נוסף לפעולות כמו override, billing changes, secret access או global toggles
- input:
  - `ownerMfaDecision`
  - `privilegedAuthorityDecision`
- output:
  - `sensitiveActionConfirmation`
- dependencies:
  - `Create enforced multi-factor authentication`  | סטטוס: `🔴 לא בוצע`
  - `Project Permission Matrix`
- connects_to: `Execution Surface`
- execution_order: `3.33`
- למה עכשיו: sensitive actions דורשות step-up ו־confirmation layers.

76. `Create step-up authentication system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות step-up auth למצבים של risk גבוה, session anomalies או privileged mode activation
- input:
  - `deviceTrustDecision`
  - `securitySignals`
- output:
  - `stepUpAuthDecision`
- dependencies:
  - `Create device trust system`  | סטטוס: `🔴 לא בוצע`
  - `Security Hardening`
- connects_to: `Project State`
- execution_order: `3.34`
- למה עכשיו: step-up auth מגשרת בין regular auth ל־privileged mode.

77. `Create privileged mode system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות mode ייעודי לבעלים שמאפשר פעולות רגישות רק לפרק זמן מוגבל ועם audit מלא
- input:
  - `stepUpAuthDecision`
  - `sensitiveActionConfirmation`
- output:
  - `privilegedModeState`
- dependencies:
  - `Create step-up authentication system`  | סטטוס: `🔴 לא בוצע`
  - `Create sensitive action confirmation system`  | סטטוס: `🔴 לא בוצע`
- connects_to: `Project State`
- execution_order: `3.35`
- למה עכשיו: privileged mode מרכזת את כל פעולות owner הרגישות לתוך מסגרת מבוקרת.

78. `Create admin-only access layer`
- סטטוס: `🔴 לא בוצע`
- description: לבנות access layer שמבודדת owner-only routes, dashboards ו־system controls משאר ה־workspace flows
- input:
  - `privilegedModeState`
  - `ownerControlPlane`
- output:
  - `ownerAccessDecision`
- dependencies:
  - `Create privileged mode system`  | סטטוס: `🔴 לא בוצע`
  - `Owner Control Center`
- connects_to: `Execution Surface`
- execution_order: `3.36`
- למה עכשיו: owner routes חייבים הפרדה ברורה מה־workspace הרגיל.

79. `Create critical operation guardrails`
- סטטוס: `🔴 לא בוצע`
- description: לבנות guardrails שמגבילים owner actions מסוכנים, mass overrides ו־global changes בלי confirmations מתאימים
- input:
  - `ownerAccessDecision`
  - `sensitiveActionConfirmation`
- output:
  - `criticalOperationDecision`
- dependencies:
  - `Create admin-only access layer`  | סטטוס: `🔴 לא בוצע`
  - `Policy Layer`  | סטטוס: `🟢 בוצע`
- connects_to: `Execution Surface`
- execution_order: `3.37`
- למה עכשיו: זו שכבת ה־last line of defense לפעולות owner מסוכנות.

#### Sub-block: `Owner Audit & Monitoring`

80. `Create owner audit log viewer`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.38`
- למה עכשיו: owner audit view היא תנאי ל־trust, governance ו־incident review.

81. `Create system-wide activity tracker`
- סטטוס: `🔴 לא בוצע`
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
- execution_order: `3.39`
- למה עכשיו: system-wide tracker מחבר audit, monitoring ו־owner visibility.

82. `Create critical change history system`
- סטטוס: `🔴 לא בוצע`
- description: לבנות system להיסטוריית שינויים קריטיים כמו permission changes, billing changes, owner overrides ו־security policy updates
- input:
  - `systemActivityFeed`
  - `auditLogRecord`
- output:
  - `criticalChangeHistory`
- dependencies:
  - `Create system-wide activity tracker`  | סטטוס: `🔴 לא בוצע`
  - `Create audit log for system actions`  | סטטוס: `🟢 בוצע`
- connects_to: `Project State`
- execution_order: `3.40`
- למה עכשיו: change history סוגרת traceability מלאה לבעלים.

## First Executable Order

אם צריך לענות מיד "מה מתחילים קודם", זה הסדר:

1. `Define product boundary schema`
2. `Create capability promise and limit map`
3. `Define Nexus positioning schema`
4. `Create core messaging framework`
5. `Create product CTA strategy`
6. `Define Nexus website schema`
7. `Define product delivery model schema`
8. `Define activation funnel schema`
9. `Create Nexus launch campaign brief`
10. `Define owner control plane schema`

## What Must Not Start Too Early

- אסור להתחיל `Create capability promise and limit map` לפני `Define product boundary schema`.
- אסור להתחיל `Create boundary disclosure and expectation model` לפני `Create capability promise and limit map`.
- אסור להתחיל `Create core messaging framework` לפני `Define Nexus positioning schema`.
- אסור להתחיל `Create Nexus website copy pack` לפני `Create landing page information architecture` ו־`Create objection and FAQ map`.
- אסור להתחיל `Create app entry gate resolver` לפני `Create public landing to auth handoff flow`.
- אסור להתחיל `Create landing-to-dashboard funnel assembler` לפני `Create first project kickoff flow`.
- אסור להתחיל `Create activation drop-off detector` לפני `Create first value milestone mapper`.
- אסור להתחיל `Create launch asset readiness checklist` לפני `Create launch channel rollout plan` ו־`Create product demo and proof asset plan`.
- אסור להתחיל `Create GTM optimization loop` לפני `Create launch performance dashboard assembler`.
- אסור להתחיל `Create owner priority engine` לפני `Create daily overview generator`.
- אסור להתחיל `Create owner decision dashboard` לפני `Create action recommendation system`.
- אסור להתחיל `Create profit and margin analyzer` לפני `Create revenue tracking system` ו־`Create cost tracking system`.
- אסור להתחיל `Create root cause analysis system` לפני `Create incident timeline tracker`.
- אסור להתחיל `Create privileged mode system` לפני `Create step-up authentication system` ו־`Create sensitive action confirmation system`.
- אסור להתחיל `Create critical operation guardrails` לפני `Create admin-only access layer`.

## Corrected Closure Flow (Audit Sync)

כדי לסגור את `Wave 4` לפי ה־baseline האמיתי:

1. להתייחס ל־entry foundations שמגיעות מ־`Wave 2` כ־`🟡`, לא כ־missing:
   - `Create post-login destination resolver`
   - `Create first project kickoff flow`
2. לסגור קודם את ה־public/app entry chain האמיתית:
   - `product delivery model`
   - `site/app boundary`
   - `access mode`
   - `landing to auth handoff`
   - `app entry gate`
3. רק אז לסגור את ההשלמה של:
   - `post-login destination`
   - `first project kickoff`
   - `landing-to-dashboard funnel assembler`
4. ב־Owner/GTM flows להשתמש ב־billing core שכבר קיים (`checkout and subscription API` = `🟢`), ולא להציג אותו כתלות חסרה.

## End State Of This File

בסוף ההכנה של `Wave 4` צריך להיות ברור:
- מהו `Minimum Believable Nexus`
- אילו capabilities הן `non-negotiable`
- אילו capabilities deferred לגלים מאוחרים יותר
- מהי המשימה הראשונה
- מה בא אחריה
- מהו סדר הביצוע הנכון
- איך `Minimum Believable Nexus Core` קודמת ל־`Go-To-Market` ו־`Owner Control Plane`
- איך `Go-To-Market` ו־`Owner Control Plane` מתחברים
- ואיך `Product Boundary Model` מגינה על ההשקה מפני promises שגויים
