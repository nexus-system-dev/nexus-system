# Wave 4 Split Workspace And Live-Build Surface Model

מטרת המסמך:
- לנעול את מודל ה־split workspace הקנוני של Wave 4
- להגדיר איך orchestration context ו־live build surface חיים יחד
- לקבוע איך ה־workspace משתנה לפי `productClass`
- להבטיח ש־Nexus לא נשארת text-first orchestration shell

## Canonical Principle

Nexus חייבת להציג למשתמש שני דברים באותו זמן:
- למה המערכת עושה את מה שהיא עושה עכשיו
- ואיפה המוצר עצמו נבנה ומתקדם מול העיניים שלו

לכן מודל ה־Wave 4 workspace חייב להיות `split workspace` ולא `single-center text surface`.

## Split Workspace Contract

ה־workspace הקנוני של Wave 4 מורכב משלושה אזורים לוגיים:

1. `orchestration-region`
- מציג mission, build stage, next move, live log truth
- תפקידו להסביר את תנועת המנוע בלי להשתלט על המסך

2. `build-region`
- האזור הראשי והדומיננטי
- מציג את ה־live build surface או preview frame של המוצר עצמו
- חייב להיות class-aware

3. `runtime-region`
- מציג runtime direction, release family, continuation anchor
- תפקידו לקשור את הבנייה ל־runtime/release truth ולא להשאיר אותה כ־artifact detached

## Class-Aware Surface Families

### `landing-page`
- workspaceFamily: `marketing-build-workspace`
- build region emphasis: `web-canvas`
- preview frame: `browser-preview`
- orchestration emphasis: promise, trust, CTA build progress

### `mobile-app`
- workspaceFamily: `mobile-simulator-workspace`
- build region emphasis: `mobile-device-frame`
- preview frame: `simulator-preview`
- orchestration emphasis: screen progression, navigation, first action

### `internal-tool`
- workspaceFamily: `operations-split-workspace`
- build region emphasis: `queue-and-ownership-surface`
- preview frame: `workspace-preview`
- orchestration emphasis: assignments, ownership, operational next move

### `commerce-ops`
- workspaceFamily: `commerce-operations-workspace`
- build region emphasis: `orders-catalog-operations-surface`
- preview frame: `commerce-workspace-preview`
- orchestration emphasis: queue urgency, catalog state, next operational action

### `saas`
- workspaceFamily: `product-workspace`
- build region emphasis: `workflow-and-state-surface`
- preview frame: `product-workspace-preview`
- orchestration emphasis: workflow activation, product state, first productive move

### `game`
- workspaceFamily: `playable-workspace`
- build region emphasis: `play-scene-surface`
- preview frame: `playable-preview`
- orchestration emphasis: scene progression, HUD, interaction

### `book`
- workspaceFamily: `document-outline-workspace`
- build region emphasis: `outline-preview-surface`
- preview frame: `document-preview`
- orchestration emphasis: chapter sequencing, publishing direction

### `content-product`
- workspaceFamily: `content-system-workspace`
- build region emphasis: `module-delivery-surface`
- preview frame: `content-preview`
- orchestration emphasis: module structure, delivery path, expansion readiness

### `generic`
- workspaceFamily: `generic-project-workspace`
- build region emphasis: `generic-preview-surface`
- preview frame: `generic-preview`
- orchestration emphasis: grounding, next move, visible starting point

## Build Region Rules

ה־`build-region` חייב:
- להיות האזור הראשי ב־workspace
- לשאת `previewFrameFamily` שמותאם ל־class
- לשקף `visibleMilestones` של ה־skeleton contract
- לקשור את ה־quality baseline למה שהמשתמש מצפה לראות עכשיו

הוא לא יכול להיות:
- proof summary בלבד
- list of logs בלבד
- placeholder card detached from product class

## Runtime Region Rules

ה־`runtime-region` חייב להציג:
- `runtimeFamily`
- `packagingFamily`
- `releasePathFamily`
- `continuationAnchor`

מטרתו:
- לחבר build progression ל־releaseable direction אמיתי
- להבטיח שה־workspace לא נעצרת ב־build theater

## Restore And Continuity Rules

המודל חייב לשרוד:
- create flow
- upload flow
- restore flow
- continuation entry

כלומר:
- `workspaceFamily`
- `buildRegion`
- `previewFrameFamily`
- `runtimeRegion`
- `continuationAnchor`

חייבים להיות ניתנים לשחזור מתוך project state.

## Inline Evolution Boundary

`W4-MBN-005` נועל את המודל ואת ה־governing implementation anchors,
אבל אינו מאשר עדיין structural redesign מלא של ה־workspace shell.

כל שינוי שחוצה את ה־threshold הבא:
- layout hierarchy
- navigation model
- new workspace region or shell frame
- split behavior at shell level
- simulator frame architecture
- Electron frame architecture

חייב לעבור דרך:
- `W4-MBN-021`
- `W4-MBN-022`
- Figma-backed structural contract

לכן בשלב הזה מותר:
- לחבר model canonical ל־context
- לחשוף אותו בסurface קיים
- ולוודא שאין עוד execution screen גנרי

אבל אסור עדיין לטעון ש־full structural workspace redesign נסגר.

## TrueGreen Conditions For `W4-MBN-005`

`W4-MBN-005` הוא `trueGreen` רק אם:
- יש מודל split workspace קנוני אחד
- המודל class-aware
- הוא מגדיר orchestration/build/runtime regions
- הוא מגדיר preview frame family לכל class
- הוא מחובר ל־context/runtime/skeleton truth
- והוא נחשף לפחות כ־governing visible contract בתוך execution surface קיים

`W4-MBN-005` אינו `trueGreen` אם:
- יש רק wireframe מילולי
- build surface נשאר generic across classes
- execution screen נשאר text-only center-shell
- runtime/release truth מנותקים מה־workspace contract
