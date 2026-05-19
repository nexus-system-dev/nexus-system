# Wave 4 End-State Definition

מטרת המסמך:
- לנעול את ה־end-state הקנוני של `Wave 4`
- להגדיר מהו `Minimum Believable Nexus`
- להפריד בינו לבין `Full Long-Term Nexus Vision`
- לקבוע מה `non-negotiable` בגל הזה ומה נדחה בגלים מאוחרים יותר

## Source Of Truth

מסמכי הקשר מחייבים:
- [docs/operating-system/wave4-permanent-orchestrator-v1.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-permanent-orchestrator-v1.md)
- [docs/v2-wave4-execution-plan.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/v2-wave4-execution-plan.md)
- [docs/operating-system/wave4-minimum-believable-core-planning-track.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md)
- [docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md)
- [docs/wave3-canonical-state.json](/Users/yogevlavian/Desktop/The%20Nexus/docs/wave3-canonical-state.json)
- [docs/nexus-loop-productization-canonical-block.json](/Users/yogevlavian/Desktop/The%20Nexus/docs/nexus-loop-productization-canonical-block.json)
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md)

## Wave 4 Planning Principle

`Wave 4` איננו רק:
- `boundary`
- `GTM`
- `owner shell`

`Wave 4` הוא הגל שבו Nexus חייבת להפוך ל־`Minimum Believable Nexus`:
- מערכת שאפשר להשתמש בה באמת כדי לקחת `prompt` או `upload`
- להבין איזה מוצר בונים
- להתחיל לבנות אותו אוטומטית
- להראות build progression חי מול המשתמש
- להחזיק continuity
- להביא את המוצר ל־`releaseable product state`
- ולהחזיר אותו ללופ הבא של שיפור, תיקון וצמיחה

אם `Wave 4` הייתה נסגרת עם:
- proof
- artifact
- orchestration
- launch shell

אבל בלי product build progression אמיתי מול העיניים של המשתמש,
היא לא הייתה Truthful `Wave 4`.

## Minimum Believable Nexus

`Minimum Believable Nexus` היא הגרסה הראשונה שבה Nexus כבר מתנהגת כמו מנוע יצירת והמשך מוצרים אמיתי.

Nexus עצמה היא מנוע היצירה הפנימי.

כלומר Nexus חייבת לדעת בעצמה:
- להבין איזה מוצר המשתמש בונה
- לזהות `product class`
- לבנות שלד מוצר מתאים
- להציג `preview / simulator / build surface`
- ליצור ולהתקדם במסכים, קבצים, ו־project structure
- לנהל continuation
- להכין `releaseable output`
- לבחור `runtime / package direction`

היא חייבת לדעת:
- לקבל `prompt` או `upload`
- להבין את `product class`
- לבחור `runtime direction` מתאים
- להתחיל אוטומטית לבנות שלד מוצר אמיתי לפי ה־class
- להחזיק `class-aware generation contract` שמבדיל בין section flow, screen flow, workspace flow, scene flow, ו־module flow לפי class
- להציג build surfaces חיות שמתפתחות על המסך
- לייצר `frontend/backend direction` אמיתיים
- להחזיק loop שמתקדם אל `releaseable product state`
- להחזיק `releaseable product state contract` גלוי שמראה readiness, package path, preview path, ו־next action אמיתי
- להחזיק `release evidence and handoff model` גלוי שמסביר מה נבנה, איך הוא נעטף, ולאן ה־release path ממשיך
- לאפשר continuation אמיתי אחרי release
- להחזיק `post-release continuation loop` גלוי שמראה מה נפתח מיד אחרי release ולמה זה bounded

## Full Long-Term Nexus Vision

החזון הארוך של Nexus רחב יותר מ־`Wave 4`.

הוא כולל:
- orchestration עמוק בין מנועים וספקים רבים
- multi-project / portfolio intelligence
- experimentation and optimization loops
- autonomous growth and expansion systems
- cross-project learning
- long-horizon product strategy memory

אלה אינם תנאי סגירה של `Wave 4`,
אבל `Wave 4` חייבת להניח להם foundations נכונים בלי לזייף שהם כבר סגורים.

## Non-Negotiable Wave 4 Requirements

### 0. No More Behind-The-Scenes Core Progress

מעכשיו והלאה אסור לבנות שכבות `backend/core/runtime` משמעותיות "מאחורי הקלעים"
בלי שהחזית נבנית, מתחברת, ונבדקת יחד איתן.

אם capability חדשה משנה אמת מוצרית,
חייבים במקביל:
- לחבר אותה למסך חי
- להציג אותה בתוך Nexus
- לבדוק אותה בלייב בדפדפן
- לראות איך המשתמש באמת חווה אותה
- לוודא שאין disconnect בין מה שהמנוע יודע לבין מה שהמשתמש רואה

אסור לחזור למצב שבו:
- backend מתקדם
- state פנימי מתקדם
- orchestration מתקדם

אבל:
- המוצר עצמו לא מציג את זה נכון
- או שהמסלול נשבר בחזית

### 0.1 Coupled Full-Stack Progression Rule

מעכשיו יכולות משמעותיות ב־Nexus חייבות להתקדם יחד דרך:
- backend
- orchestration
- routing
- persistence
- UI
- continuity
- proof
- artifact
- timeline

Capability אינה נחשבת מתקדמת truthfully אם אחת השכבות הקריטיות הללו נשארת detached.

### 0.2 Live Verification During Development

כל פיתוח משמעותי חייב לכלול `live verification` תוך כדי העבודה,
לא רק בסוף.

זרימת העבודה הקנונית היא:
1. build capability
2. expose it visibly
3. test live
4. observe real behavior
5. אם משהו נשבר:
   - או לתקן מיד
   - או לפתוח task / lane קנוני לסגירת השבירה
6. rerun live
7. רק אז להמשיך הלאה

המטרה של הכלל הזה היא למנוע חזרה לפערים כמו:
- server truth בלי visible truth
- upload truth בלי downstream continuity
- planner truth בלי UI differentiation
- route truth בלי restore truth

### 0.3 Active Delegation Under One Orchestrator

מעכשיו Nexus development צריך להשתמש בצורה הרבה יותר אקטיבית ב־delegation לסוכנים אחרים
כאשר זה מאיץ סגירה מקצה לקצה.

זה לא מודל של chaos בין כמה סוכנים עצמאיים.
זה מודל של:
- orchestrator ראשי אחד
- execution workers ממוקדים
- bounded investigations
- bounded fixes
- bounded verification
- וחזרה ל־canonical truth אחד

במודל הזה:
- ה־main orchestrator נשאר הסמכות העליונה
- סוכנים אחרים הם execution workers בלבד

ה־main orchestrator הוא הסמכות העליונה ל:
- architecture direction
- task ordering
- closure decisions
- rerun discipline
- canonical write-back
- lane promotion
- Wave transitions

ה־execution workers אינם רשאים:
- להמציא framework
- לשנות task ordering
- לפתוח lanes לבד
- לסגור `trueGreen` לבד
- לכתוב canonical truth בלי אישור orchestration

### 0.4 Canonical Delegation Pattern

כאשר delegation מאיצה closure truthfully, יש לעבוד כך:
1. ה־orchestrator מגדיר task או slice תחום וברור
2. ה־orchestrator מקצה אותו ל־execution worker מתאים
3. ה־worker מבצע investigation, fix, או verification ממוקדים בלבד
4. ה־worker מחזיר evidence ו־findings
5. ה־orchestrator מאחד את התוצאות
6. ה־orchestrator מחליט על closure, rerun, write-back, או lane promotion

המטרה היא לעבוד יותר כמו צוות מוצר/הנדסה אמיתי:
- parallel bounded execution
- central orchestration
- canonical truth אחד

### 0.5 External Product Intelligence Rule

Nexus לא צריכה להתפתח בתוך בועה.

מעכשיו והלאה, כל תכנון ו־implementation של `Wave 4` חייבים לקחת בחשבון באופן פעיל:
- product generation engines אחרים
- AI builders אחרים
- workflow systems אחרים
- build / orchestration / generation environments אחרים
- וכל מוצר רלוונטי שיכול ללמד משהו חשוב ל־Nexus

אם קיימת גישה ישירה למערכת הרלוונטית, מותר ורצוי להשתמש בה לצורך למידה תחומה.
אם אין גישה ישירה, יש לנתח באופן פעיל:
- websites
- flows
- screenshots
- UX
- interaction models
- workspace layouts
- build surfaces
- onboarding patterns
- orchestration patterns
- continuity patterns

המטרה איננה להעתיק.
המטרה היא:
- לזהות מה באמת עובד
- מה באמת מוצרי
- מה באמת מרגיש עמוק
- מה רלוונטי לחזון של Nexus

ואז להכניס את מה שטוב דרך הארכיטקטורה הקנונית של Nexus,
לא כ־feature מבודד ולא כ־hack נקודתי.

### 0.6 Canonical External-Inspiration Integration Rule

כל capability חדש שנלמד ממנוע, מערכת, או מוצר אחר חייב:
- להיכנס דרך ה־Wave 4 execution structure הקנוני
- להשתלב ב־lane המתאים
- לקבל validation rules
- לקבל continuity rules
- לקבל live verification
- לקבל UI / system integration מסודר

אסור להכניס evolution חיצוני כ:
- isolated feature
- visual patch
- interaction hack
- local workaround

כל evolution חיצוני חייב להפוך לחלק אורגני מה־architecture של Nexus.

המחקר הקנוני הפעיל שמזין את הכלל הזה מנוהל ב:
- [docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md)

### 0.7 Figma-Required Design Evolution Rule

כאשר `Wave 4` דורשת evolution עיצובי בגלל:
- build surfaces חדשים
- split workspace
- live generation
- Electron / local shell
- simulator-like product view
- orchestration changes
- continuation flows חדשים
- release / runtime surfaces
- או כל שינוי מבני משמעותי אחר

אסור לדחות את זה ל־"UI אחר כך".

במקום זה חייבים:
1. לעצור
2. לבנות prompt מסודר ל־Figma
3. להגדיר:
   - layout
   - interaction model
   - hierarchy
   - component structure
   - navigation behavior
   - split workspace behavior
   - simulator / build surface behavior
4. לוודא אחידות מול שאר Nexus

Figma integration היא כבר capability execution אמיתית,
לא future assumption.

אבל Figma איננה מנוע היצירה של Nexus.

Figma נשארת:
- design support
- layout exploration
- design-system aid
- structural visual planning tool

Nexus נשארת:
- internal product creation engine
- generation/runtime/release engine
- continuation engine

Figma נדרשת רק כאשר Nexus עצמה עוברת evolution עיצובי/מבני.

Figma אסורה כתחליף ל:
- product generation for the user's product
- bootstrap logic
- class resolution
- runtime direction
- release logic
- continuation logic

### 0.7.1 Figma Structural Threshold Rule

שינוי יכול להישאר `inline evolution` רק אם הוא:
- לא משנה layout hierarchy
- לא משנה navigation behavior
- לא מוסיף workspace region חדש
- לא משנה split workspace behavior
- לא משנה simulator / preview frame logic
- לא משנה Electron / local shell frame
- לא משנה release / continuation surface structure
- לא יוצר סיכון ל־component/design-system divergence

אם אחד מהתנאים הללו אינו מתקיים,
נדרש `Figma structural pass`.

### 0.8 Coherence-Over-Patchwork Rule

Nexus חייבת להישאר:
- coherent
- systematic
- product-grade
- visually unified

גם כשהמנוע גדל.

אסור להגיע למצב שבו:
- כל feature נראה אחרת
- כל lane ממציא layout חדש
- כל surface מרגיש כמו מוצר אחר

כל התפתחות מבנית חייבת לעבור דרך design/system integration קנוני,
ולא להישאר patchwork UI.

### 1. Real Visible Product Construction

ברגע ש־Nexus מבינה איזה סוג מוצר המשתמש בונה,
היא חייבת להתחיל לבנות אוטומטית שלד אמיתי ומתאים לאותו סוג מוצר.

הבנייה חייבת להיות:
- automatic
- class-aware
- visible
- progressive
- tied to the real project loop

אסור ש־Wave 4 תדרוש:
- ללחוץ `generate`
- להפעיל flow חבוי
- להסתפק ב־text orchestration

### 2. Build The Product In Front Of The User

Nexus חייבת לבנות את המוצר מול העיניים של המשתמש בזמן אמת.

המשתמש חייב לראות:
- המוצר נבנה
- המוצר משתנה
- המוצר מתפתח
- המוצר מתקדם

אסור להסתפק ב:
- plan בלבד
- proof text בלבד
- artifact summary בלבד
- representation בלבד

### 3. Real Evolving Product Surfaces

`Wave 4` חייבת לכלול surfaces אמיתיים של המוצר עצמו:
- website / landing page surfaces
- app screens
- SaaS workflows
- game scenes / gameplay UI
- backend / API / runtime direction כאשר זה רלוונטי

ה־surfaces חייבים להתפתח לאורך ה־loop ולא להיות placeholder קבוע.

### 4. Workspace-Style Product Building

המוצר לא יוצג רק כטקסט במרכז המסך.

`Wave 4` חייבת לתכנן ולעבור לכיוון של:
- split workspace
- side-by-side generation
- live build surface
- evolving preview surfaces
- simulator-like layout where relevant
- workspace-style interaction

המטרה היא שהחוויה תרגיש יותר כמו סביבת עבודה אמיתית ופחות כמו chat shell עם summary panels.

### 5. Local-First Working Environment

Nexus חייבת לעבוד מקומית על המחשב כמו סביבת עבודה אמיתית.

זה כולל:
- `Electron app` או desktop shell מתאים
- filesystem / workspace continuity
- local project awareness
- local generation workflow
- local release workflow

זה איננו `future nice-to-have`.
זה חלק מה־`Minimum Believable Nexus`.

### 6. Class-Aware Runtime / Packaging Preparation

Nexus לא רק מתכננת מוצר ולא רק מציגה proof או artifact.
היא חייבת להתחיל להכין את מעטפת ההרצה הנכונה עבור סוג המוצר.

דוגמאות:
- `desktop-capable product`:
  - `Electron` או shell דסקטופי מתאים
- `website / landing page`:
  - web build מתאים
- `SaaS`:
  - frontend/backend structure והרצה מתאימה
- `mobile app`:
  - app structure + simulator / preview direction
- `game`:
  - playable / preview environment מתאים

### 7. Releaseable Product State

`Wave 4` חייבת להוביל ל־`releaseable product state`,
לא רק ל־artifact review.

זה אומר:
- buildable structure
- runnable direction
- package / shell preparation
- release path
- יכולת לחזור ללולאת שיפור אחרי release

## Required Wave 4 Capabilities

אלה היכולות שחייבות להיות בתוך `Wave 4` ואינן deferred:

### A. Product Understanding Engine

Nexus חייבת להבין:
- איזה class של מוצר נבנה
- מי המשתמש
- מה stage של המוצר
- מה ה־next truthful move
- מה runtime / package direction הנכון

הבהרה קנונית:
- `productClass` הוא שדה truth ראשי
- `domain specialization` הוא refinement משני בלבד
- Nexus חייבת לפתור class דרך מודל אחד קנוני ולא דרך heuristics שונות בכל surface

### B. Automatic Class-Aware Product Bootstrap

אחרי ההבנה, Nexus חייבת:
- לבחור skeleton מתאים ל־class
- ליצור project structure ראשוני אמיתי
- לייצר frontend / backend / scene / flow directions לפי ה־class
- לעשות זאת אוטומטית בלי שהמשתמש יבקש build ידנית

### C. Live Build Surface

Nexus חייבת להציג:
- build progression חי
- preview שמתעדכן
- surfaces משתנים
- קשר ברור בין loop decisions לבין המוצר שנבנה בפועל

### D. Orchestration That Changes The Product

ה־orchestration ב־Wave 4 לא יכולה להישאר textual בלבד.

היא חייבת:
- לבחור next task אמיתי
- לבצע handoff אל build surfaces
- לשנות את המוצר בפועל
- לשמר continuity בין סבבים

### E. Runtime / Packaging Resolver

Nexus חייבת לבחור ולהכין:
- web runtime
- desktop shell
- mobile preview path
- SaaS frontend/backend layout
- playable game preview

לפי class ומצב הפרויקט.

### F. Local Workspace Continuity

Nexus חייבת לדעת:
- לעבוד מול workspace מקומי
- לשמר project identity על הדיסק
- לחזור לאותו פרויקט
- להמשיך build / fix / improve מתוך הסביבה המקומית

### G. Release And Continuation Loop

Nexus חייבת:
- לקדם את המוצר ל־releaseable state
- להראות release path אמיתי
- לייצר המשך לולאה של:
  - fixes
  - improvement
  - growth
  - expansion

## Expected Product-Class Behavior In Wave 4

### Mobile App

החוויה צריכה להרגיש קרובה ל:
- app workspace
- simulator-like progression

Nexus חייבת להציג:
- app structure
- screens
- navigation
- frontend skeleton
- backend direction
- live progression של האפליקציה

### Website / Landing Page

Nexus חייבת להציג:
- האתר עצמו נבנה
- sections מתווספים
- layout / copy / visual structure מתפתחים
- preview שמתעדכן חי

### SaaS

Nexus חייבת להציג:
- dashboard / workflows / product surfaces מתחילים להיווצר
- frontend/backend direction אמיתי
- progression מתוך loop אל runnable product shape

### Game

Nexus חייבת להציג:
- gameplay surfaces
- scenes
- HUD / UI
- playable or previewable progression

## Deferred Vs Non-Deferred Boundary

### Non-Deferred In Wave 4

היכולות הבאות חייבות להיות ב־`Wave 4`:
- automatic class-aware skeleton generation
- visible product build progression
- live build surfaces
- workspace-style interaction
- local-first project continuity
- runtime / packaging preparation per class
- releaseable product state
- first real post-release continuation loop

### Deferred Beyond Wave 4

היכולות הבאות יכולות להידחות:
- broad multi-provider autonomy at scale
- portfolio-level optimization across many products
- advanced experimentation engines
- heavy enterprise governance
- full autonomous GTM systems
- deep multi-agent specialization fabric
- cross-project intelligence at large scale
- Wave 7-grade renderer perfection

הדחייה מותרת רק אם אינה שוברת את `Minimum Believable Nexus`.

## Planning Interpretation Rule

כל תכנון או execution של `Wave 4` חייבים להיקרא דרך המסמך הזה.

הפירוק האופרטיבי של `Minimum Believable Nexus Core` ל־lanes, tasks, execution order, ו־validation gate
מנוהל ב:
- [docs/operating-system/wave4-minimum-believable-core-planning-track.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-minimum-believable-core-planning-track.md)

מנוע הביצוע הקנוני של `Wave 4` מנוהל ב:
- [docs/operating-system/wave4-permanent-orchestrator-v1.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-permanent-orchestrator-v1.md)

בפרט:
- `Product Boundary Model`
- `Nexus Product Go-To-Market`
- `Owner Control Plane`

אינם מספיקים לבדם כדי להגדיר או לסגור את `Wave 4`.

הם חייבים לשבת מעל שכבת core שמוכיחה:
- product understanding
- automatic skeleton generation
- live build progression
- class-specific frontend/backend/scene evolution
- browser-backed local workspace continuity before Electron shell closure
- explicit desktop shell scope before shell implementation
- deterministic runtime family assignment per core class
- deterministic packaging and preview contract per core class
- runtime-aware product shaping
- local workspace continuity
- releaseable product loop
- coupled backend-to-surface progression
- live verification during development, not only at the end

## What Makes Wave 4 Truthful

`Wave 4` יכולה להיחשב truthful only if:
- Nexus כבר usable ככלי אמיתי לבניית מוצר
- המשתמש רואה את המוצר מתהווה מולו
- ה־loop משנה את המוצר עצמו ולא רק את הטקסט סביבו
- קיימת מעטפת הרצה / package direction אמיתית לכל class עיקרי
- אפשר להמשיך מאותו מוצר גם אחרי release

אם Nexus עדיין:
- מדברת על המוצר
- מסכמת את המוצר
- מתכננת את המוצר

אבל לא בונה אותו visibly ובאופן class-aware,
אז `Wave 4` עדיין לא נסגרה truthfully.
