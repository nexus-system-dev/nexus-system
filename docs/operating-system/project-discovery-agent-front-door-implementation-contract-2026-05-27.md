# Project Discovery Agent Front Door Implementation Contract

תאריך: `2026-05-27`  
סטטוס: `partial; AGT-001D minimal live conversational front door verification still required`  
משימה: `AGT-001`

## Canonical Decision

`AGT-001` אינו סגור כ־`trueGreen`.

היישום הנוכחי הוכיח שיחה, שיפור visible flow, והעברה לשלד ראשון, אבל בדיקת מוצר חיה והבהרת מוצר מצאו שהשיחה המרכזית עדיין יכולה להישען על משפטי copy קשיחים במקום על תשובת סוכן שמנוסחת מתוך השיחה.

`AGT-001A` סגר את חוזה שכבת הסוכנים. `AGT-001C` סגר את גבול ההתנהגות: Nexus מגדירה תפקיד ומדיניות, והסוכן מנסח בעצמו את התשובה למשתמש לפי ההקשר. `AGT-001D` נדרש כדי לסגור את גבול המסך: המשתמש חייב לראות front door מינימלי ושיחתי, לא דוח גילוי, לא כרטיס agent, ולא מסך שמציג טקסטים שבלוניים בשם הסוכן.

עדכון אמת `2026-05-28`:

- הקוד כבר מונע מעבר לשלד ראשון מתשובת fallback או מתבנית מקומית.
- נוצרה קריאת provider ייעודית לתשובת Project Discovery Agent.
- בדיקות יחידה/אינטגרציה מוכיחות שה־handoff נפתח רק מ־`agent-composed-transcript`.
- בדיקת live API דרך השרת המקומי הוכיחה תשובת סוכן חיה עם `responseSource: provider-composed`.
- מסלול ה־create וה־service עודכנו להשתמש ב־`openai/fast/low`, שהוא הנתיב שנבדק בפועל מול `gpt-5-mini`.
- מצב provider שנכשל כבר לא נשאר מוצג כ־`ready`; Nexus מסמן אותו כ־`degraded`.
- תשובת fallback מקומית הוסרה מהשיחה המרכזית; אם אין `provider-composed` response, אין תשובת סוכן גלויה.
- מסך ה־create הוסר ממצב report/dashboard: אין כרטיסי "מה הבנתי", "מה חסר", "מה אבנה ראשון", ואין תווית visible של Project Discovery Agent.
- reset/create path מנקה state ישן, draft ישן ו־demo idea, כך שהמשתמש רואה composer ריק ולא רעיון שנקסוס שתלה מראש.
- המסך מציג רק מעטפת מינימלית (`מה אתה רוצה לבנות?`, `כתוב חופשי. נמשיך משם.`); היא אינה תשובת סוכן ואינה מחליפה שיחה חיה.
- כפתור השליחה הוא icon-only, כדי לא להכניס CTA שבלוני לתוך חוויית הסוכן.
- בדיקת in-app browser הוכיחה מסך נקי: אין report cards, אין label של Project Discovery Agent, אין demo idea, אין תשובת Nexus מזויפת, וה־composer ריק.
- התברר שה־minimal surface הזמני עלול להיקרא כחיקוי של מתחרה אם הוא נסגר בלי design authority של Nexus.
- נוצר artifact חדש ב־Figma עבור כיוון Nexus-native: [Nexus AGT-001D Front Door Direction](https://www.figma.com/design/OatMcC7ZRdWLV7PjPQ3Ryt).
- הכיוון הראשון ב־Figma נדחה משום שהוא לא נשען מספיק על השפה שכבר קיימת ב־Nexus.
- נוצר כיוון מתוקן באותו קובץ: `AGT-001D Nexus Existing-Language Direction`.
- הכיוון המתוקן נשען על שפת Nexus הקיימת: canvas `#f6f7fb`, כרטיסים לבנים, primary `#6d5dfc`, gradient ל־`#3b82f6`, גבולות עדינים, sidebar/topbar/workspace hierarchy.
- ה־Figma direction המתוקן מגדיר את המסך כשיחת גילוי בתוך shell של Nexus: live transcript, hidden understanding, composer, ללא דוח וללא חיקוי מתחרים.
- הקוד יושר לכיוון המתוקן: מסך create/front-door רץ בתוך shell קיים של Nexus עם sidebar/topbar/workspace hierarchy, ולא כ־landing surface שמחקה מתחרים.
- ה־CSS יושר לשפת Nexus הקיימת: canvas של Nexus, כרטיסים לבנים, glows עדינים של primary/blue, composer בכרטיס Nexus, וללא gradient מתחרה מועתק.
- `AGT-001D` עדיין אינו `trueGreen` עד שתושלם בדיקת browser-surface מלאה מהקלדת רעיון במסך create ועד תשובת סוכן חיה, הבנת מוצר, ו־handoff לשלד/Loop.
- מגבלת בדיקה נוכחית: כלי ה־in-app browser לא הצליח להקליד לתוך textarea בגלל virtual clipboard חסר, ולכן הוכחת התשובה החיה דרך הקלדה במסך עדיין פתוחה.

ה־front door הרצוי של Nexus הוא לא Agent card, לא טופס שמתחפש לצ׳אט, ולא one-submit intake.

ה־front door הרצוי הוא Project Discovery Agent אמיתי.

התפקיד שלו:

- להבין רעיון חופשי של משתמש
- לדלות פרטים לפי קטגוריות מוצר
- לזהות מה חסר או סותר
- לשאול המשך בצורה חכמה
- לדעת מתי יש מספיק אמת מוצרית
- להפוך את זה ל־project understanding
- להעביר ל־Build/Loop עם משימה ראשונה ושלד ראשוני

החוק הקנוני של `AGT-001`:

```txt
The Nexus front door is a real role-defined agent,
not an intake screen, not a form, and not an agent-looking card.
```

חוק התנהגות נוסף שננעל דרך `AGT-001C`:

```txt
Nexus defines the Project Discovery Agent role and behavior.
The agent composes the user-facing response from the actual conversation.
```

חוק מסך נוסף שננעל דרך `AGT-001D`:

```txt
The visible Nexus front door is a minimal live conversation surface.
The visible Nexus front door must be Nexus-native and Figma-backed before closure.
Competitor screens are quality references only, not visual source material.
Nexus must not put words in the agent's mouth.
Nexus defines the role, behavior, checks, memory, and handoff contract.
The agent/provider composes every central user-facing discovery response from the actual conversation.
If no provider-composed response exists, Nexus shows no fake agent response.
```

ה־flow הרצוי:

```txt
user message -> agent response -> user reply -> adaptive follow-up or confirmation -> project understanding -> first task -> Loop handoff
```

הסוכן הזה הוא סוכן אמיתי עם תפקיד, חוקים, זיכרון, מצב שיחה ויכולת החלטה.
הוא Codex-like בהתנהגות: מקבל משתמש, מבין משימה/מוצר, חוקר חוסרים, ומוביל עד פעולה קנונית.
הוא לא generic assistant; הסקיל שלו הוא Product Discovery.

הסוכן יכול להשתמש ב־OpenAI, Anthropic או ספק AI אחר מאחורי provider abstraction.
אבל חוויית המשתמש נשארת Nexus: לא provider UI, לא בחירת מודלים גלויה כברירת מחדל, ולא כלי חיצוני שמנהל את השיחה.

החוק הקנוני:

```txt
Enough product truth -> first live skeleton -> Nexus Build/Loop
```

כלומר, הסוכן לא מחכה ל"סוף שיחה" מושלם.
ברגע שיש מספיק אמת מוצרית כדי לבנות שלד ראשון, הוא מפסיק discovery כבד, מציג/יוצר שלד, ומעביר ללופ הבנייה עם משימה ראשונה.

היישום אינו נסגר דרך תיקוני gates של מנוע `intake` ישן.

החלטת ההתקדמות לשלד ראשון נשענת על שכבת הסוכן:

```txt
Project Discovery Agent -> Product Skeleton Agent -> Build / Loop Agent
```

`SURF-001` עדיין חסום על `AGT-001D`.

הסיבה: אסור להתחיל לבנות surface חדש על front door שמציג הבנת סוכן בלי הוכחת תשובת סוכן חיה, ואסור לסגור AGT דרך מסך שנראה כמו דוח/שאלון/תבנית.

המשימה לא פותחת מחדש את `SHL-002`.

המשימה לא מוחקת את מנוע ה־onboarding/intake הישן.

## Preserve / Remove / Build Truth

### Preserved Engine

- onboarding/intake persistence
- onboarding sessions
- summaries
- restore / continuity fallback
- project draft creation
- handoff infrastructure
- adaptive onboarding service tests

### Removed From Visible Default Experience

- rigid questionnaire framing
- helper-card checklist UX
- visible `step 1 / step 2` style entry
- standalone onboarding route as default entry
- orchestration-first create copy

### Built New Shell Behavior

- create/front-door is now a minimal conversational entry surface
- the agent has a role, visible transcript, boundaries, and canonical understanding state
- the visible front door now renders a conversation transcript from hidden onboarding/session conversation state
- the second create submit now sends a user reply into the same onboarding session
- live flow proves user message -> agent response -> user reply -> adapted agent response
- weak or vague input is not treated as enough product truth
- early missing information and product gaps are detected before build framing
- a first-task candidate is produced from the current understanding
- the hidden intake engine is explicitly preserved through front-door state
- automatic project-name derivation keeps Hebrew product ideas intact instead of breaking on English tokens such as `follow-up`
- visible default project-name leakage such as `My SaaS App` is suppressed from agent understanding
- free-form product text enriches hidden intake answers for actor, pain, workflow, build direction, and success condition
- enough product truth triggers Loop handoff without waiting for a perfect end-of-conversation
- the first Build/Loop skeleton is created or revealed when enough truth exists
- visible agent readiness and hidden intake/session truth align for the tested enough-truth path
- front-door handoff now checks Project Discovery Agent state and `nextAgentHandoff`
- stale hidden-intake missing items no longer override a complete free-form product idea that already includes actor, pain, and first workflow
- if the old finish path cannot create a persisted project, Nexus opens the first skeleton through agent-layer handoff instead of returning to the questionnaire
- visible local fallback copy for the central agent answer is removed
- no report-card blocks are visible on the front door
- no visible `Project Discovery Agent`/role label is required or shown in the main screen
- first-skeleton handoff is blocked unless the Project Discovery Agent transcript contains a provider-composed response
- failed live provider execution is surfaced as degraded provider truth instead of remaining visually ready

### Still Blocked

- visible browser proof still must show: user writes an idea -> Nexus receives a provider-composed agent response -> that response is visible as natural conversation -> product understanding is carried into first skeleton/Loop
- `SURF-001` cannot start until `AGT-001D` is accepted as the visible product truth

## Implementation Files

- `/Users/yogevlavian/Desktop/The Nexus/web/shared/project-discovery-agent.js`
- `/Users/yogevlavian/Desktop/The Nexus/web/nexus-ui/adapters/project-adapter.js`
- `/Users/yogevlavian/Desktop/The Nexus/web/nexus-ui/screens/ProjectCreateScreen.js`
- `/Users/yogevlavian/Desktop/The Nexus/web/nexus-ui/styles/screens.css`
- `/Users/yogevlavian/Desktop/The Nexus/web/app.js`
- `/Users/yogevlavian/Desktop/The Nexus/src/core/onboarding-service.js`
- `/Users/yogevlavian/Desktop/The Nexus/src/core/onboarding-completion-evaluator.js`
- `/Users/yogevlavian/Desktop/The Nexus/test/project-discovery-agent-front-door.test.js`
- `/Users/yogevlavian/Desktop/The Nexus/test/project-create-screen-render.test.js`
- `/Users/yogevlavian/Desktop/The Nexus/test/project-adapter.test.js`
- `/Users/yogevlavian/Desktop/The Nexus/test/onboarding-service-conversation.test.js`

## Verification

Passed:

```txt
node --test test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js
```

Passed:

```txt
node --test test/onboarding-standalone-route-removal.test.js test/understanding-standalone-route-removal.test.js test/onboarding-service-conversation.test.js test/onboarding-adapter.test.js
```

Passed:

```txt
node --check web/shared/project-discovery-agent.js
node --check web/nexus-ui/adapters/project-adapter.js
node --check web/nexus-ui/screens/ProjectCreateScreen.js
node --check src/core/onboarding-service.js
node --check src/core/onboarding-completion-evaluator.js
node --check web/app.js
```

Passed:

```txt
node --test test/onboarding-service-conversation.test.js test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js test/onboarding-standalone-route-removal.test.js test/understanding-standalone-route-removal.test.js test/onboarding-adapter.test.js
```

Passed:

```txt
node --check web/shared/project-discovery-agent.js && node --check web/app.js && node --test test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js test/real-agent-layer-contract.test.js test/onboarding-service-conversation.test.js
```

Passed after `AGT-001D` minimal-surface and no-local-agent-copy update:

```txt
node --check web/shared/project-discovery-agent.js
node --check web/nexus-ui/screens/ProjectCreateScreen.js
node --check web/app.js
node --test test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js test/real-agent-layer-contract.test.js test/onboarding-service-conversation.test.js
```

Observed:

```txt
44/44 tests passed
```

Passed:

```txt
node --check src/core/onboarding-provider-client.js && node --check src/core/onboarding-service.js && node --check src/core/project-service.js && node --check src/server.js && node --check web/app.js && node --test test/onboarding-service-conversation.test.js test/project-discovery-agent-front-door.test.js test/project-create-screen-render.test.js test/project-adapter.test.js test/real-agent-layer-contract.test.js
```

Observed before the provider-runtime fix:

```txt
42/42 tests passed
```

Passed:

```txt
node --check src/core/onboarding-service.js && node --test test/onboarding-service-conversation.test.js test/project-discovery-agent-front-door.test.js test/real-agent-layer-contract.test.js
```

Observed:

```txt
41/41 tests passed
```

Live provider check did not close:

```txt
/create?qa=1 -> complete CRM/follow-up idea -> provider prime -> stayed on create
```

Observed:

- `hasLoop = false`
- `hasCreate = true`
- `hasLiveAgentMissing = true`
- no first skeleton was opened from fallback copy
- `POST /api/onboarding/sessions/:sessionId/conversation-prime` returned `provider-backed-degraded`
- provider health was `degraded`
- provider error was `provider-error`
- provider usage stayed at zero tokens
- no `responseSource: provider-composed` was produced

Live provider/runtime fix passed:

```txt
127.0.0.1:4011 API -> draft -> onboarding session -> conversation-prime
```

Observed:

- `providerRuntime.runtimeMode = provider-backed-live`
- `deliveryMode = live-api`
- `availabilityStatus = ready`
- `lastModelUsed = gpt-5-mini-2025-08-07`
- token usage was recorded
- transcript contained an AI entry with `responseSource = provider-composed`
- `providerId = openai`
- the generated Hebrew response reflected the user, pain, first flow, open questions, and why the next question matters

Verification caveat:

- Full browser-surface typing verification did not complete because the Codex browser automation could not input the Hebrew product idea (`clipboard` limitation) and the separate headless Chrome run failed before page interaction.
- This is why `AGT-001C` remains `partial` instead of `trueGreen`.

Live route check passed for the visible front-door contract:

```txt
http://127.0.0.1:4011/create?qa=1
```

Live QA route check passed for enough-truth handoff:

```txt
/create?qa=1 -> enough free-form Hebrew product idea -> /loop
```

Observed:

```txt
appScreen = loop
hasLoop = true
hasSkeletonText = true
hasBackendLeak = false
```

Observed:

- `data-agent-mode="project-discovery"`
- `data-hidden-intake-engine="preserved"`
- visible `Project Discovery Agent`
- no visible `step 1 / step 2 / שאלה 1 / שאלה 2 / שאלה 3`

Live submit check passed:

```txt
/create?qa=1 -> fill idea -> click start
```

Observed:

- project/session truth was created in the hidden intake flow
- session id was persisted into `qaState.onboardingFlow.sessionId`
- current project snapshot was persisted into `qaState.currentProjectSnapshot`
- generated project name stayed coherent: `מערכת שמנהלת לידים לצוות מכירות`
- visible Project Discovery Agent remained the front-door UX
- hidden intake marker remained `preserved`

Live caveat:

- the first static route check saw a bootstrap `404` warning, but both the visible fallback and the later submit flow rendered the Project Discovery Agent correctly and preserved hidden intake state.
- QA preview params such as `productCheck` / `qaScreen` can mask the real handoff state by forcing create-preview state; they are not the closure source for `AGT-001`.

Live non-QA product check passed:

```txt
/create -> fill one free-form Hebrew product idea -> click start -> /loop
```

Observed:

- `data-app-screen="loop"`
- `.nexus-loop-screen`
- product-facing first-build title: `מה נבנה עכשיו`
- first skeleton / artifact expectation visible in the Build/Loop surface
- enough free-form product truth handed off from Project Discovery Agent to Nexus Loop

Live clean Chrome messy-flow check passed:

```txt
/create -> unclear product idea -> adaptive follow-up -> user clarification -> /loop
```

Observed:

- the unclear first idea stayed in Project Discovery Agent instead of jumping straight to Build/Loop
- Nexus asked a single adaptive follow-up about the missing actor
- after the user clarified actor, pain, and first workflow, Nexus moved to `/loop`
- `.nexus-loop-screen` was visible
- the first skeleton / artifact expectation was visible in the Build/Loop surface
- no visible `My SaaS App` leakage appeared
- remaining debt: the messy-flow skeleton display name still derives too much from the vague first sentence; this is a product-naming refinement, not a blocker to the agentic handoff proof

## Closure Rule

`AGT-001` was reopened after a live product check before `SURF-001`.

The prior reopened provider blocker is resolved at the local API/runtime layer, but the visible browser route still needs an end-to-end proof before closure.

The implementation is `partial` for `AGT-001`; `AGT-001A` remains closed as the architecture contract; `AGT-001C` remains the active verification blocker before `SURF-001`.

What passed:

- the old standalone onboarding screen remains removed
- the old intake engine remains preserved as hidden infrastructure
- create/front-door renders Project Discovery Agent instead of questionnaire UX
- create/front-door supports multi-turn discovery chat over the same hidden onboarding session
- live flow proved user message -> agent response -> user reply -> adapted agent response
- the agent exposes canonical understanding, missing information, gaps, boundaries, and first-task candidate
- stale default project name leakage is no longer visible in the agent understanding
- enough product truth no longer hands off from fallback copy alone
- the create/front-door now requires an `agent-composed-transcript` response before first skeleton handoff
- backend `isComplete` is not accepted as first-skeleton proof by itself; the visible Project Discovery Agent handoff must exist before Create, reply, finish, or fallback Loop paths can open the first skeleton
- regression now covers the false-positive case where backend intake is complete but no provider-composed agent response exists
- live check proved a complete CRM/follow-up idea stays on create and surfaces the live-agent-response blocker when the visible response is not provider-composed
- unclear first input does not jump straight to Build/Loop; it asks an adaptive follow-up first
- clarified actor, pain, and first workflow unlock the Build/Loop handoff only after a provider-composed agent response exists
- live API/runtime now produces the required provider-composed Project Discovery Agent response with `openai/fast/low`
- regression tests confirm SHL-002/SHL-003 remain closed

Follow-up debt:

- complete browser-surface verification from visible create input to provider-composed transcript and first skeleton/Loop handoff
- improve skeleton/project display-name derivation after a messy first message so the title is based on the clarified product truth, not the vague opening phrase

## Product Rejection Note

The current implementation is not accepted as final `AGT-001` closure if it is only a smarter intake/completion flow.

The hidden intake engine may remain for persistence, sessions, restore, summaries, and compatibility.

It must not be the agent brain.

The locked product rule remains:

```txt
Project Discovery Agent as chat agent, not Project Discovery Agent as card.
```

The added canonical blocker is:

```txt
Project Discovery Agent -> Product Skeleton Agent -> Build / Loop Agent
```
