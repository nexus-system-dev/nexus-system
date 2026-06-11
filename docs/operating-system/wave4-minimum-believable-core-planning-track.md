# Wave 4 Minimum Believable Nexus Core Planning Track

מטרת המסמך:
- לפרק את `Minimum Believable Nexus Core` ל־execution map קנוני
- להגדיר lanes, tasks, dependencies, ו־validation logic
- לקבוע מהו סדר הביצוע המחייב לפני Wave 4 execution
- למנוע implementation כאוטי או backlog drift

## Source Of Truth

המסמך הזה נגזר רק מתוך:
- [docs/operating-system/wave4-permanent-orchestrator-v1.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-permanent-orchestrator-v1.md)
- [docs/operating-system/wave4-end-state-definition.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-end-state-definition.md)
- [docs/v2-wave4-execution-plan.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/v2-wave4-execution-plan.md)
- [docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/operating-system/wave4-external-product-intelligence-pass-2026-05-18.md)
- [docs/wave3-canonical-state.json](/Users/yogevlavian/Desktop/The%20Nexus/docs/wave3-canonical-state.json)
- [docs/nexus-loop-productization-canonical-block.json](/Users/yogevlavian/Desktop/The%20Nexus/docs/nexus-loop-productization-canonical-block.json)
- [docs/backlog-unified-status-and-order.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-unified-status-and-order.md)

## Track Mission

לתרגם את Nexus ממערכת שיודעת:
- להבין
- לתזמר
- להציג proof
- להחזיק artifact

למערכת שיודעת גם:
- לבנות שלד מוצר אוטומטית
- להראות build progression אמיתי
- לחבר runtime / packaging direction מתאים
- להחזיק local workspace continuity
- להגיע ל־`releaseable product state`
- ולהמשיך ללופ הבא

המסמך הזה מניח עיקרון קנוני:
- Nexus owns the internal product creation engine
- Figma may assist design evolution
- but Figma does not replace generation, runtime, release, or continuation capability

## Hard Planning Rules

- זהו `planning pass` בלבד
- אין execution של Wave 4 בתור הזה
- אין implementation רחב
- אין live browser execution בתור הזה
- אין פתיחת Wave 5
- אין framework מקביל למסמכים הקנוניים
- אין capability שנחשבת מתוכננת truthfully אם היא נשארת detached מ־visible product truth
- אין external inspiration שנכנסת ל־Wave 4 בלי lane integration קנוני
- אין structural UI evolution שנשארת מחוץ ל־design system / Figma planning
- מנוע הביצוע הפעיל של Wave 4 הוא `wave4-permanent-orchestrator-v1.md`

## External Product Intelligence Planning Rule

כל lane ב־Wave 4 רשאי וחייב ללמוד גם ממערכות חיצוניות רלוונטיות כאשר זה משפר את Nexus truthfully.

מקורות חיצוניים רלוונטיים כוללים:
- AI builders
- product generation engines
- workflow systems
- build / orchestration environments
- websites, screenshots, flows, and interaction models

מטרת הלמידה החיצונית:
- לא להעתיק
- אלא לזהות patterns שעובדים באמת
- להבין מה מרגיש עמוק ומוצרי
- ולהכניס רק את מה שמתאים לחזון של Nexus

כל pattern כזה חייב לעבור דרך:
- lane ownership
- task integration
- validation rules
- continuity rules
- live verification planning
- UI / system integration

## Figma Design Evolution Planning Rule

אם lane כלשהו יוצר שינוי מבני ב:
- split workspace
- build surfaces
- live generation layout
- Electron / local shell frame
- simulator-like surfaces
- release / runtime surfaces
- continuation flows
- navigation hierarchy

אז planning truthful מחייב:
- לעצור ולדרוש Figma prompt מסודר
- להגדיר layout, hierarchy, components, navigation, and interaction model
- לוודא design coherence מול שאר Nexus

זה אינו optional polish.
זה חלק מה־execution structure של Wave 4.

Figma integration היא כבר execution capability אמיתית.
לכן tasks שמפעילים structural design evolution רשאים בעתיד לכלול:
- create/update Figma file
- Figma-backed design contract
- canonical write-back of Figma artifact reference

אבל Figma tasks אינם מחליפים את ה־Wave 4 core lanes שאחראים על:
- product understanding
- automatic product bootstrap
- live build surfaces
- class-aware product generation
- runtime / packaging resolver
- releaseable output
- continuation loop

## Lane Structure

### Lane 1 — Product Understanding And Class Resolution

- lane purpose: לנעול הבנת פרויקט, class, stage, runtime direction, ו־next move
- why it exists in Wave 4: בלי הבנת class אמיתית אי אפשר לבנות bootstrap אוטומטי או runtime מתאים
- product truth it owns: `project-class truth`
- depends on:
  - Wave 3 create / upload / onboarding truth
  - canonical project state
- can run in parallel with:
  - planning work for lanes 4, 5, 6
- must remain under central orchestration:
  - class taxonomy
  - resolution rules
  - stage model
- delegation is appropriate for:
  - bounded taxonomy audits
  - class-specific rule validation

Tasks:

1. `W4-MBN-001 — Define canonical product-class resolution model`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-product-class-resolution-model.md`
- dependencies: none inside Wave 4
- required inputs:
  - current class matrix from Wave 3
  - upload/create evidence
- expected visible output:
  - class identity is visibly stable in Nexus surfaces
- pass/fail truth:
  - pass if class can be resolved deterministically and survives create/upload/restore
- live verification rule:
  - future execution must verify class identity across create, upload, restore
- restore/continuity expectations:
  - class identity must survive refresh and return
- trueGreen:
  - one canonical model for class resolution exists and governs create/upload paths
  - current repository entry points use one shared class-resolution contract
  - downstream bootstrap/runtime/release families are explicit per class
- not trueGreen:
  - class guessed ad hoc per screen
  - frontend onboarding, backend onboarding, and domain resolution drift across different taxonomies
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-product-class-resolution-model.md`
  - governing implementation anchors:
    - `web/shared/product-class-model.js`
    - `web/app.js`
    - `src/core/onboarding-service.js`
    - `src/core/domain-registry.js`
    - `src/core/domain-classifier.js`

2. `W4-MBN-002 — Define project stage and runtime-direction resolver`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-stage-runtime-direction-resolver.md`
- dependencies:
  - `W4-MBN-001`
- required inputs:
  - product classes
  - runtime/package options
- expected visible output:
  - user sees correct build mode and runtime direction implied by product type
- pass/fail truth:
  - pass if runtime direction is chosen before bootstrap starts
- live verification rule:
  - must later be proven on visible project surfaces, not logs only
- restore/continuity expectations:
  - chosen direction survives return to project
- trueGreen:
  - runtime selection rules are explicit and class-aware
- not trueGreen:
  - runtime implied only by hidden backend state
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-stage-runtime-direction-resolver.md`
  - governing implementation anchors:
    - `src/core/project-stage-runtime-direction-resolver.js`
    - `src/core/bootstrap-plan-generator.js`
    - `src/core/release-plan-generator.js`
    - `src/core/context-builder.js`

### Lane 2 — Automatic Product Bootstrap

- lane purpose: ליצור שלד מוצר אמיתי אוטומטית מיד אחרי class resolution
- why it exists in Wave 4: זהו לב ה־Minimum Believable Nexus
- product truth it owns: `automatic bootstrap truth`
- depends on:
  - lane 1
- can run in parallel with:
  - lane 5 planning
  - lane 6 planning
- must remain under central orchestration:
  - bootstrap contract
  - project skeleton quality bar
- delegation is appropriate for:
  - class-specific skeleton templates
  - bounded bootstrap verification plans

Tasks:

3. `W4-MBN-003 — Define automatic class-aware skeleton contract`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-automatic-product-skeleton-contract.md`
- dependencies:
  - `W4-MBN-001`
  - `W4-MBN-002`
- required inputs:
  - class taxonomy
  - runtime direction rules
- expected visible output:
  - user sees a real initial product structure appear automatically
- pass/fail truth:
  - pass if no explicit “generate” request is required after class resolution
- live verification rule:
  - must later verify automatic skeleton creation on live create/upload flows
- restore/continuity expectations:
  - skeleton state survives restore
- trueGreen:
  - class-aware bootstrap contract exists per product class
- not trueGreen:
  - only plan text or artifact summary exists
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-automatic-product-skeleton-contract.md`
  - governing implementation anchors:
    - `src/core/automatic-product-skeleton-contract.js`
    - `src/core/bootstrap-plan-generator.js`
    - `src/core/bootstrap-task-templates.js`
    - `src/core/context-builder.js`

4. `W4-MBN-004 — Define class-specific skeleton quality baseline`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-class-specific-skeleton-quality-baseline.md`
- dependencies:
  - `W4-MBN-003`
- required inputs:
  - class exemplars
  - visible surface requirements
- expected visible output:
  - first visible product surface feels coherent for its class
- pass/fail truth:
  - pass if each class has minimum believable structure expectations
- live verification rule:
  - must later verify on class matrix
- restore/continuity expectations:
  - baseline must remain coherent after return
- trueGreen:
  - each class has minimum viable structure definition
- not trueGreen:
  - one generic skeleton reused everywhere
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-class-specific-skeleton-quality-baseline.md`
  - governing implementation anchors:
    - `src/core/class-specific-skeleton-quality-baseline.js`
    - `src/core/class-specific-skeleton-quality-baseline-bridge.js`
    - `src/core/bootstrap-plan-generator.js`
    - `src/core/context-builder.js`

### Lane 3 — Live Build Surfaces

- lane purpose: להראות למשתמש build progression אמיתי על המסך
- why it exists in Wave 4: בלי זה Nexus נשארת orchestration shell
- product truth it owns: `visible build truth`
- depends on:
  - lane 2
- can run in parallel with:
  - lane 4
  - lane 5
- must remain under central orchestration:
  - split workspace model
  - visible progression rules
- external-product-intelligence responsibility:
  - ללמוד מ־workspace systems, builders, and simulator-like environments
  - אבל לתרגם את זה ל־Nexus-specific layout truth
- delegation is appropriate for:
  - bounded surface prototypes
  - preview-state mapping audits
  - bounded external surface pattern analysis

Tasks:

5. `W4-MBN-005 — Define split-workspace and live-build surface model`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-split-workspace-live-build-surface-model.md`
- dependencies:
  - `W4-MBN-003`
- required inputs:
  - workspace style requirements
  - class preview needs
- expected visible output:
  - clear live build surface beside orchestration context
- pass/fail truth:
  - pass if product is not reduced to text-only center screen
- live verification rule:
  - must later verify screen-level live progression
- restore/continuity expectations:
  - returning user resumes into same workspace state
- trueGreen:
  - split workspace model is explicit and class-aware
  - one shared governing implementation model exists across context and execution surface
- not trueGreen:
  - only panels/tabs with summaries
  - workspace contract exists only in backend state without visible surface exposure
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-split-workspace-live-build-surface-model.md`
  - governing implementation anchors:
    - `web/shared/split-workspace-live-build-surface-model.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

6. `W4-MBN-006 — Define build progression state machine`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-build-progression-state-machine.md`
- dependencies:
  - `W4-MBN-005`
- required inputs:
  - bootstrap contract
  - execution loop states
- expected visible output:
  - user sees meaningful stage-to-stage evolution
- pass/fail truth:
  - pass if build states map to visible product changes
- live verification rule:
  - must later verify stage transitions on live routes
- restore/continuity expectations:
  - state machine survives refresh/restore
- trueGreen:
  - visible progression states are defined and route-bound
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - hidden internal stages with no user-facing change
  - only `percent/status` exists without route-bound visible states
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-build-progression-state-machine.md`
  - governing implementation anchors:
    - `src/core/build-progression-state-machine.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

21. `W4-MBN-021 — Define Figma-backed live-build workspace contract`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-005`
  - `W4-MBN-006`
- required inputs:
  - split workspace model
  - build progression state machine
  - design coherence requirements
- expected visible output:
  - one coherent workspace / build-surface interaction model for Nexus
- pass/fail truth:
  - pass if structural surface evolution is routed through one coherent design contract
- live verification rule:
  - later verify the implemented workspace against the approved design model
- restore/continuity expectations:
  - workspace contract must preserve continuity behavior
- trueGreen:
  - Figma-backed workspace contract exists for structural build surfaces
- not trueGreen:
  - layout left to ad hoc implementation per feature
- future execution note:
  - this task may truthfully open or update a Figma design file as part of execution
  - Figma auth health must be rechecked at design-pass start, before meaningful write, and before closure write-back
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-figma-backed-live-build-workspace-contract.md`
  - design artifact:
    - `https://www.figma.com/design/eKC3qzCYpgqIekEmyDc74o`
  - governing implementation anchors:
    - `web/shared/split-workspace-live-build-surface-model.js`
    - `src/core/build-progression-state-machine.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

### Lane 4 — Class-Aware Product Generation

- lane purpose: לקשור execution וג׳נרציה לשינוי אמיתי במוצר עצמו
- why it exists in Wave 4: build progression בלי generation depth תהיה הצגה חלולה
- product truth it owns: `class-aware generation truth`
- depends on:
  - lanes 1, 2, 3
- can run in parallel with:
  - lane 6
  - lane 7 planning
- must remain under central orchestration:
  - generation-to-surface contract
  - class differentiation rules
- delegation is appropriate for:
  - class-specific generator slices
  - bounded quality heuristics

Tasks:

7. `W4-MBN-007 — Define class-aware generation contract`
- source of truth:
  - Wave 4 end-state definition
  - `docs/operating-system/wave4-class-aware-generation-contract.md`
- dependencies:
  - `W4-MBN-004`
  - `W4-MBN-006`
- required inputs:
  - class baselines
  - visible surface rules
- expected visible output:
  - each class changes differently and credibly
- pass/fail truth:
  - pass if generation output is class-differentiated and visible
- live verification rule:
  - later prove via class matrix reruns
- restore/continuity expectations:
  - generated state persists across return
- trueGreen:
  - explicit generation contract per class
  - one governing implementation model exists across context and AI generation request path
- not trueGreen:
  - same generic flow for all classes
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-class-aware-generation-contract.md`
  - governing implementation anchors:
    - `src/core/class-aware-generation-contract.js`
    - `src/core/context-builder.js`
    - `src/core/ai-design-service.js`
    - `src/core/ai-design-request-schema.js`

8. `W4-MBN-008 — Define frontend/backend/scene evolution rules per class`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-007`
- required inputs:
  - product class taxonomy
  - runtime direction resolver
- expected visible output:
  - user sees screens/pages/scenes/workflows forming according to class
- pass/fail truth:
  - pass if surface evolution follows class-specific logic
- live verification rule:
  - later verify visible evolution, not hidden file trees only
- restore/continuity expectations:
  - surface identity persists after restore
- trueGreen:
  - per-class evolution rules exist
  - one governing implementation model exists across context, AI request path, and execution surface
- not trueGreen:
  - frontend/backend direction only in internal state
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-class-specific-surface-evolution-rules.md`
  - governing implementation anchors:
    - `src/core/class-specific-surface-evolution-rules.js`
    - `src/core/context-builder.js`
    - `src/core/ai-design-service.js`
    - `src/core/ai-design-request-schema.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

### Lane 5 — Local Workspace / Electron Shell

- lane purpose: להפוך את Nexus ל־workspace מקומי אמיתי
- why it exists in Wave 4: local-first is part of Minimum Believable Nexus
- product truth it owns: `local workspace truth`
- depends on:
  - lane 3
- can run in parallel with:
  - lane 6
  - lane 8
- must remain under central orchestration:
  - desktop shell boundary
  - workspace identity rules
- external-product-intelligence responsibility:
  - ללמוד מ־desktop workspaces, IDEs, and local-first tools
  - בלי להעתיק layout או behavior בצורה עיוורת
- delegation is appropriate for:
  - bounded shell research
  - filesystem continuity verification planning

Tasks:

9. `W4-MBN-009 — Define local workspace contract`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-005`
- required inputs:
  - workspace continuity expectations
  - local project awareness requirements
- expected visible output:
  - project appears and continues as a local workspace, not only a web session
- pass/fail truth:
  - pass if workspace continuity is explicit and product-facing
- live verification rule:
  - later verify local reopen/continue flows
- restore/continuity expectations:
  - local project identity must survive reopen
- trueGreen:
  - local workspace contract is explicit
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - “desktop later” with no Wave 4 contract
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-local-workspace-contract.md`
  - governing implementation anchors:
    - `src/core/local-workspace-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

10. `W4-MBN-010 — Define Electron/desktop shell scope for Wave 4`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-009`
- required inputs:
  - desktop shell requirements
  - local release workflow
- expected visible output:
  - clear desktop/workspace frame for Nexus where relevant
- pass/fail truth:
  - pass if Wave 4 shell boundary is explicit and non-optional
- live verification rule:
  - later verify shell truth on the chosen local shell path
- restore/continuity expectations:
  - shell must preserve workspace and project continuity
- trueGreen:
  - shell scope and obligations are defined
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - desktop shell deferred implicitly
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-desktop-shell-scope-contract.md`
  - governing implementation anchors:
    - `src/core/desktop-shell-scope-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

22. `W4-MBN-022 — Define Figma-backed desktop shell and local workspace frame`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-009`
  - `W4-MBN-010`
  - `W4-MBN-021`
- required inputs:
  - local workspace contract
  - desktop shell scope
  - Nexus design-system coherence
- expected visible output:
  - one coherent desktop/local-workspace frame for Nexus
- pass/fail truth:
  - pass if local shell evolution is designed as a unified product surface
- live verification rule:
  - later verify shell implementation against the approved frame
- restore/continuity expectations:
  - frame must preserve reopen and project-return logic
- trueGreen:
  - Figma-backed shell frame exists
- not trueGreen:
  - desktop shell shape left to engineering improvisation

- future execution note:
  - this task may truthfully open or update a Figma design file as part of execution
  - Figma auth health must be rechecked at design-pass start, before meaningful write, and before closure write-back
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-figma-backed-desktop-shell-local-workspace-frame.md`
  - design artifact:
    - `https://www.figma.com/design/0517zfC9FgOpBMo50bc9Mi`
  - governing implementation anchors:
    - `src/core/local-workspace-contract.js`
    - `src/core/desktop-shell-scope-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

### Lane 6 — Runtime / Packaging Resolver

- lane purpose: לבחור ולהכין מעטפת הרצה אמיתית לפי class
- why it exists in Wave 4: בלי זה אין path אמיתי ל־releaseable output
- product truth it owns: `runtime packaging truth`
- depends on:
  - lanes 1, 2, 4, 5
- can run in parallel with:
  - lane 7
  - lane 8
- must remain under central orchestration:
  - runtime/package taxonomy
- delegation is appropriate for:
  - class runtime investigations
  - bounded packaging strategy slices

Tasks:

11. `W4-MBN-011 — Define class-aware runtime resolver`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-002`
  - `W4-MBN-008`
- required inputs:
  - runtime types
  - class resolution
- expected visible output:
  - visible indication of correct runtime path per project class
- pass/fail truth:
  - pass if runtime selection is deterministic and project-facing
- live verification rule:
  - later verify visible runtime behavior per class
- restore/continuity expectations:
  - runtime assignment survives return
- trueGreen:
  - one resolver governs all major classes
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - manual ad hoc runtime choice
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-class-aware-runtime-resolver.md`
  - governing implementation anchors:
    - `src/core/class-aware-runtime-resolver.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

12. `W4-MBN-012 — Define packaging and preview contract per class`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-011`
  - `W4-MBN-010`
- required inputs:
  - shell scope
  - runtime resolver
- expected visible output:
  - preview/package mode feels appropriate to class
- pass/fail truth:
  - pass if every core class has preview/package expectations
- live verification rule:
  - later verify preview/package surfaces live
- restore/continuity expectations:
  - preview/package mode persists per project
- trueGreen:
  - explicit package/preview contract exists
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - no class-aware preview logic
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-packaging-preview-contract.md`
  - governing implementation anchors:
    - `src/core/class-aware-packaging-preview-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

### Lane 7 — Releaseable Output

- lane purpose: להוביל את הבנייה למצב שניתן להריץ, לבדוק ולשחרר
- why it exists in Wave 4: artifact-only closure לא מספיק
- product truth it owns: `releaseable output truth`
- depends on:
  - lanes 4, 6
- can run in parallel with:
  - lane 8 planning
  - lane 9 planning
- must remain under central orchestration:
  - releaseable definition
- delegation is appropriate for:
  - bounded release-shape investigations
  - verification contract drafting

Tasks:

13. `W4-MBN-013 — Define releaseable product state contract`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-012`
- required inputs:
  - runtime/package rules
  - generation contract
- expected visible output:
  - user can tell when the project reached a releaseable state
- pass/fail truth:
  - pass if releaseable state is more than approved artifact
- live verification rule:
  - later verify visible releaseability cues and runnable state
- restore/continuity expectations:
  - release state survives return
- trueGreen:
  - explicit releaseable contract exists
  - one governing implementation model exists across context and execution surface
- not trueGreen:
  - release inferred from proof text only
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-18`
  - contract artifact: `docs/operating-system/wave4-releaseable-product-state-contract.md`
  - governing implementation anchors:
    - `src/core/releaseable-product-state-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

14. `W4-MBN-014 — Define release evidence and handoff model`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-013`
- required inputs:
  - release state contract
  - timeline/proof continuity
- expected visible output:
  - release path is visible and explainable inside Nexus
- pass/fail truth:
  - pass if user can see what was built, wrapped, and made releasable
- live verification rule:
  - later verify visible release handoff
- restore/continuity expectations:
  - release evidence survives revisit
- trueGreen:
  - release handoff model is explicit
  - one governing implementation model exists across context and proof surface
- not trueGreen:
  - release hidden behind internal events
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-19`
  - contract artifact: `docs/operating-system/wave4-release-evidence-handoff-model.md`
  - governing implementation anchors:
    - `src/core/release-evidence-handoff-model.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/proof-adapter.js`
    - `web/nexus-ui/screens/ProofResultScreen.js`

### Lane 8 — Continuation / Growth Loop

- lane purpose: להחזיר את המוצר ללופ הבא אחרי release
- why it exists in Wave 4: בלי continuation, Nexus לא מנוע המשך אמיתי
- product truth it owns: `post-release continuation truth`
- depends on:
  - lane 7
- can run in parallel with:
  - lane 9
  - lane 10
- must remain under central orchestration:
  - continuation semantics
  - growth loop boundary
- delegation is appropriate for:
  - bounded loop-state investigations
  - post-release UI audit slices

Tasks:

15. `W4-MBN-015 — Define first post-release continuation loop`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-014`
- required inputs:
  - release handoff
  - loop model
- expected visible output:
  - user sees next fixes/improvements/growth moves emerge after release
- pass/fail truth:
  - pass if continuation is real and product-connected
- live verification rule:
  - later verify post-release continuation on live project surfaces
- restore/continuity expectations:
  - continuation survives return
- trueGreen:
  - first post-release loop is explicitly defined
  - one governing implementation model exists across context and next-task surface
- not trueGreen:
  - release is terminal end state
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-19`
  - contract artifact: `docs/operating-system/wave4-post-release-continuation-loop.md`
  - governing implementation anchors:
    - `src/core/post-release-continuation-loop.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/next-task-adapter.js`
    - `web/nexus-ui/screens/NextTaskScreen.js`

16. `W4-MBN-016 — Define growth/opportunity surfacing boundary for Wave 4`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-015`
- required inputs:
  - continuation model
  - deferred boundary rules
- expected visible output:
  - user sees meaningful next moves without fake autonomous company behavior
- pass/fail truth:
  - pass if growth surfacing stays credible and bounded
- live verification rule:
  - later verify next-move credibility on live projects
- restore/continuity expectations:
  - opportunity state remains coherent after return
- trueGreen:
  - bounded growth loop scope is explicit
- not trueGreen:
  - Wave 7 autonomy implied as Wave 4
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-19`
  - contract artifact: `docs/operating-system/wave4-growth-opportunity-surfacing-boundary.md`
  - governing implementation anchors:
    - `src/core/growth-opportunity-surfacing-boundary.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/next-task-adapter.js`
    - `web/nexus-ui/screens/NextTaskScreen.js`

### Lane 9 — Deployment / Release Path

- lane purpose: לקשור releaseable state ל־delivery path אמיתי
- why it exists in Wave 4: בלי delivery path releaseable output נשאר תיאורטי
- product truth it owns: `deployment path truth`
- depends on:
  - lanes 6, 7
- can run in parallel with:
  - lane 8
  - lane 10
- must remain under central orchestration:
  - deployment boundary
  - release semantics
- delegation is appropriate for:
  - bounded packaging/deploy investigations

Tasks:

17. `W4-MBN-017 — Define canonical deployment/release path per core class`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-012`
  - `W4-MBN-013`
- required inputs:
  - packaging contract
  - releaseable state
- expected visible output:
  - user can see where the build is headed operationally
- pass/fail truth:
  - pass if delivery path is class-aware and credible
- live verification rule:
  - later verify visible release path per class
- restore/continuity expectations:
  - release path status survives revisit
- trueGreen:
  - each major class has a bounded release path
- not trueGreen:
  - “deployment later” with no Wave 4 path
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-class-aware-deployment-release-path.md`
  - governing implementation anchors:
    - `src/core/class-aware-deployment-release-path.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

18. `W4-MBN-018 — Define deployment-state feedback contract`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-017`
- required inputs:
  - release path
  - continuity model
- expected visible output:
  - deployment/release progress is visible and not hidden in backend events
- pass/fail truth:
  - pass if product surfaces reflect deployment/release status
- live verification rule:
  - later verify deployment feedback visibly
- restore/continuity expectations:
  - deployment state restorable after refresh
- trueGreen:
  - deployment feedback contract is explicit
- not trueGreen:
  - deploy state only in logs
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-deployment-state-feedback-contract.md`
  - governing implementation anchors:
    - `src/core/deployment-state-feedback-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/execution-adapter.js`
    - `web/nexus-ui/screens/ExecutionLiveScreen.js`

### Lane 10 — Live Orchestration Continuity

- lane purpose: לוודא שה־orchestration, routing, restore, proof, artifact, timeline וה־surfaces נשארים מחוברים
- why it exists in Wave 4: כדי לא לחזור לפערי Wave 3
- product truth it owns: `continuity truth`
- depends on:
  - lanes 3, 4, 7, 8, 9
- can run in parallel with:
  - no lane may close without this lane’s criteria
- must remain under central orchestration:
  - cross-lane truth
  - closure judgment
- delegation is appropriate for:
  - bounded rerun plans
  - restore / continuity verification slices

Tasks:

19. `W4-MBN-019 — Define cross-surface continuity contract`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-006`
  - `W4-MBN-014`
  - `W4-MBN-018`
- required inputs:
  - visible progression states
  - release evidence
  - deployment feedback
- expected visible output:
  - user can move through build, proof, artifact, release, timeline, and continuation without disconnect
- pass/fail truth:
  - pass if continuity is explicit across the full loop
- live verification rule:
  - later verify route/restore/timeline continuity live
- restore/continuity expectations:
  - continuity is the point of the task and must survive return
- trueGreen:
  - cross-surface continuity contract is explicit
- not trueGreen:
  - each surface truthful in isolation only
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-cross-surface-continuity-contract.md`
  - governing implementation anchors:
    - `src/core/cross-surface-continuity-contract.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/timeline-adapter.js`
    - `web/nexus-ui/screens/TimelineHistoryScreen.js`

20. `W4-MBN-020 — Define Wave 4 live verification matrix`
- source of truth: Wave 4 end-state definition
- dependencies:
  - `W4-MBN-019`
- required inputs:
  - all lane contracts
- expected visible output:
  - one deterministic live verification matrix for Wave 4 execution
- pass/fail truth:
  - pass if every major capability has visible verification criteria
- live verification rule:
  - this task defines the later live verification rule set
- restore/continuity expectations:
  - matrix must include restore and continuity checks
- trueGreen:
  - one canonical verification matrix exists
- not trueGreen:
  - verification left to ad hoc agent interpretation
- canonical closure write-back:
  - status: `trueGreen` on `2026-05-20`
  - contract artifact: `docs/operating-system/wave4-live-verification-matrix.md`
  - governing implementation anchors:
    - `src/core/wave4-live-verification-matrix.js`
    - `src/core/context-builder.js`
    - `web/nexus-ui/adapters/timeline-adapter.js`
    - `web/nexus-ui/screens/TimelineHistoryScreen.js`
    - `web/app.js`

## Canonical Execution Order

### Phase 1 — Resolve Product Identity Before Build

1. `W4-MBN-001`
2. `W4-MBN-002`

These must come first because no truthful bootstrap or runtime planning can precede class and runtime identity.

### Phase 2 — Define Automatic Bootstrap And Visible Build

3. `W4-MBN-003`
4. `W4-MBN-004`
5. `W4-MBN-005`
6. `W4-MBN-006`
7. `W4-MBN-021`

Build-before-UI is forbidden here.
Bootstrap and live build surfaces must be planned as one coupled product path.

### Phase 3 — Define Product Generation And Local Shell

8. `W4-MBN-007`
9. `W4-MBN-008`
10. `W4-MBN-009`
11. `W4-MBN-010`
12. `W4-MBN-022`

These may partially overlap in planning,
but shell scope may not be treated as deferred if it is required by class experience.

### Phase 4 — Define Runtime, Packaging, And Releaseability

13. `W4-MBN-011`
14. `W4-MBN-012`
15. `W4-MBN-013`
16. `W4-MBN-014`

### Phase 5 — Define Post-Release Continuation And Delivery

17. `W4-MBN-015`
18. `W4-MBN-016`
19. `W4-MBN-017`
20. `W4-MBN-018`

### Phase 6 — Lock Cross-Lane Continuity And Verification

21. `W4-MBN-019`
22. `W4-MBN-020`

No Wave 4 execution lane may claim truthful closure before Phase 6 is canonically defined.

## Post-Wave-4 Continuation Preparation

After `W4-MBN-020` closes truthfully, Nexus must prepare one canonical post-Wave-4 continuation lane for learning and intake intelligence.

This prepared lane is not part of the active `W4-MBN-*` core order.

It exists so that:
- learning does not remain optional polish
- adaptive intake does not remain a disconnected future note
- both systems enter canonical execution structure with dependencies, pass/fail truth, live verification requirements, continuity rules, and generation integration rules

Prepared continuation lane:
- `post-wave4-learning-and-intake-continuation`
- canonical contract:
  - `docs/operating-system/wave4-post-wave4-learning-intake-continuation-lane.md`
  - `docs/operating-system/wave4-canonical-learning-system-contract.md`
  - `docs/operating-system/wave4-adaptive-onboarding-agent-contract.md`

Prepared tasks:
- `W4-LEARN-001 — Define canonical learning system contract` — `trueGreen`
- `W4-INTAKE-001 — Define adaptive onboarding agent contract` — `trueGreen`
- `W4-LEARN-002 — Implement deep adaptive learning decision impact` — `trueGreen`
- `W4-GEN-001 — Connect learning signals to generation decisions` — `trueGreen`
- `W4-INTAKE-002 — Replace fixed 3-question onboarding with adaptive intake flow` — `trueGreen`
- `W4-INTAKE-003 — Connect learning signals to adaptive onboarding question selection` — `trueGreen`
- `W4-INTAKE-004 — Implement shell-level provider-backed canonical onboarding agent runtime` — `trueGreen`
- `W4-INTAKE-005 — Inject smart onboarding agent truth into canonical downstream system surfaces` — `trueGreen`
- `W4-INTAKE-006 — Connect onboarding agent to real external model provider APIs` — `trueGreen`
- `W4-INTAKE-007 — Stream live provider responses through the onboarding conversation surface` — `trueGreen`
- `W4-INTAKE-008 — Add retry recovery and provider failover continuity to onboarding runtime` — `trueGreen`
- `W4-INTAKE-009 — Harden onboarding provider runtime to production-safe operation` — `trueGreen`
- `W4-INTAKE-010 — Expose user-facing provider, model, and intelligence controls on the onboarding agent` — `trueGreen`
- `W4-AGENT-001 — Enforce minimum real product-conversation depth before understanding closure` — `trueGreen`
- `W4-AGENT-001A — Enforce co-founder-style exploratory product reasoning before understanding closure` — `trueGreen`
- `W4-AGENT-002 — Add floating cross-Nexus product-conversation agent presence` — `trueGreen`
- `W4-AGENT-003 — Implement post-onboarding clarification and correction loop` — `trueGreen`
- `W4-AGENT-004 — Bring competitor and comparable-product intelligence into the live agent dialogue` — `trueGreen`
- `W4-AGENT-004A — Convert external product-conversation patterns into Nexus product-family wrapper packs` — `trueGreen`
- `W4-AGENT-004B — Derive live conversational tone and pacing rules from external product intelligence` — `trueGreen`
- `W4-AGENT-005A — Define conversation-first entry foundation contract and route ownership` — `trueGreen`
- `W4-AGENT-005B — Run Figma-backed primary entry shell structural pass` — `trueGreen`
- `W4-AGENT-005C — Implement conversation-first front door with hidden project/session/bootstrap` — `trueGreen`
- `W4-AGENT-005D — Harden durability, idempotency, restore, and stale-state isolation on the new entry path` — `trueGreen`
- `W4-AGENT-005E — Attach conversation-first origin to Understanding and downstream continuity` — `trueGreen`
- `W4-GEN-003 — Transition conversation-first entry into entry-to-live-skeleton continuity` — `trueGreen`
- `W4-FIX-001 — Isolate fresh project identity and kill shared project reuse across new conversations` — `trueGreen`
- `AUTH-SESSION-PROJECT-ISO-001 — Guest/auth session project isolation bridge` — `trueGreen`
- `W4-FIX-002 — Flush stale hidden brief, summary, placeholder, and family residue on fresh start and explicit correction` — `prepared-not-started`
- `W4-FIX-003 — Gate family reasoning behind confidence, grounded evidence, and synthesized referents` — `prepared-not-started`
- `W4-FIX-004 — Add canonical dual-audience and multi-actor product modeling` — `prepared-not-started`
- `W4-FIX-005 — Replace full-state URL serialization with short route identity and server-backed restore` — `trueGreen`
- `W4-FIX-006 — Make the companion truthful, scoped to the canonical brief, and safely interactive` — `prepared-not-started`
- `W4-FIX-007 — Add convergence guardrails and a fast path from corrected understanding to the first on-class skeleton` — `prepared-not-started`
- `W4-UPGRADE-001 — Reach the first on-class skeleton within competitor-parity speed on the Sela regression case` — `prepared-not-started`
- `W4-UPGRADE-002 — Make the first visible skeleton deepen progressively and explain why this shape exists` — `prepared-not-started`
- `W4-UPGRADE-003 — Beat competitor first-artifact quality inside the same time band` — `prepared-not-started`
- `W4-GEN-002 — Implement feedback-driven product mutation loop` — `prepared-not-started`

Reality-audit reopeners required after repository inspection:
- `W4-LEARN-002` is now closed truthfully as the first real decision-impact implementation layer
- `W4-GEN-001` is now closed truthfully as the first generation-facing learning integration layer
- `W4-INTAKE-002` is now closed truthfully after live QA proof covered direct onboarding entry, landing-page early-stop, fresh ambiguous clarification rerun, and non-blocked refresh/revisit behavior
- `W4-INTAKE-003` is now closed truthfully after live QA proof covered learning-guided question selection, generic-answer clarification, landing-page solution gating, stronger Understanding handoff, and continuity-safe restore on the same learned intake path
- `W4-INTAKE-004` is now closed truthfully only as shell-level provider runtime closure after live QA proof covered provider selection, visible provider-backed runtime identity, stale local QA restore rejection, bounded clarification under weak input, premature Understanding bounce-back into the live conversation, and continuity-safe reload on the same provider-backed clarification path
- `W4-INTAKE-005` is now closed truthfully after live QA proof showed the same completed onboarding conversation surviving into one consistent downstream artifact/class truth across Understanding, Loop, Next Task, and Proof
- `W4-INTAKE-006` is now closed truthfully after live QA proof showed a real OpenAI onboarding provider path, visible `provider-backed-live` runtime truth, visible token accounting, and continuity-safe refresh on a compact QA restore envelope
- `W4-AGENT-005A` is now closed truthfully after canonical state was corrected to release the conversation-first entry pivot ahead of `W4-GEN-002`, the replacement-first and Figma-threshold rules were locked into one contract, and the required decomposition into design, hidden bootstrap, durability, and downstream continuity tasks was written back explicitly
- `W4-AGENT-005B` is now closed truthfully after a Figma-backed primary entry shell artifact was created with explicit states for the empty conversation front door, hidden bootstrap, clarification with progressive reveal, and migration-safe fallback before any route demotion
- founder field-test intake on `2026-05-24` proved that broad conversation-first closure coverage was still too narrow for fresh ambiguous dual-audience ideas because repository reality can still leak shared project identity, stale hidden brief truth, wrong-family confidence, and non-truthful companion framing into a brand-new project
- therefore `W4-GEN-002` may not execute next, and a dedicated `W4-FIX-001` through `W4-FIX-007` repair chain must run first in canonical order
- the stronger Sela repair brief also adds a strict `Track A before Track B` rule and a stopwatch-based competitor-parity target, so two additional upgrade tasks must run after the correctness chain and before feedback-driven mutation work
- the upgraded founder brief further raises the bar from parity to superiority, so Nexus must now prove the first artifact is not only fast enough but visibly better than the competitor baseline inside the same time band
- founder live field-test on `2026-06-03` with the lead-management internal-tool idea confirms the repair chain ordering:
  - stale courier-app state leaked into a fresh lead-management run, so `W4-FIX-001` and `W4-FIX-002` remain upstream release blockers
  - the agent reached enough understanding and a generated on-class skeleton was reachable manually through `/loop`, but the visible create screen stayed disabled in a preparing-skeleton state, so the handoff belongs to `W4-FIX-007`
  - reload and direct loop restore still relied on a large serialized `nexusState` URL, so route truth remains owned by `W4-FIX-005`
  - the first skeleton preserved no-WhatsApp-integration / no-automation boundaries but exposed internal or mistranslated trust-breaking copy, so first-artifact quality belongs to `W4-UPGRADE-002` after the correctness and speed gates
- user project-leakage clarification on `2026-06-04` adds `AUTH-SESSION-PROJECT-ISO-001` between `W4-FIX-001` and `W4-FIX-005`:
  - `ID-001` already owns the broader first-release login/session/account boundary, but it is too broad and too late for the immediate leakage repair.
  - `AUTH-SESSION-PROJECT-ISO-001` owns the minimum guest/auth session and project-owner bridge so short-route restore cannot accept stale QA state, URL state, localStorage, or process-global project state as authority.
  - `W4-FIX-005` must now depend on this bridge before claiming server-backed restore truth.
- `W4-FIX-001` closed truthfully on `2026-06-04` after focused tests and visible Chrome proof showed a fresh Create route with `qaReset=1` ignores stale courier-project URL/storage truth and renders an empty new-project composer instead of inherited project id, copy, assistant transcript, or snapshot truth.
- `AUTH-SESSION-PROJECT-ISO-001` closed truthfully on `2026-06-04` after project records gained stable owner/workspace truth, project list and direct restore became user-scoped, unauthenticated project list returns `401`, cross-user restore returns `404`, and live API proof showed a fresh user cannot see or restore existing project state.
- `W4-FIX-005` closed truthfully on `2026-06-04` after workspace routes began persisting short `projectId` URLs, direct `/loop?projectId=<id>` restore loaded from backend project truth, stale `qaState`/`nexusState`/`qaScreen`/`qaReset` were removed after restore, bootstrap QA preview restore was bypassed for explicit project ids, and live browser proof showed stale `qa-preview-project` state no longer replaced a fresh backend project. Screenshot: `/private/tmp/nexus-w4-fix-005-short-route-live.png`
- implementation-map remap on `2026-06-03` supersedes this old Wave 4 queue for active task selection:
  - `VSKEL-001` closed `trueGreen` after the second canonical premium embroidered gifts browser proof
  - `SLICE-005` closed `trueGreen` on `2026-06-04` with product-type runtime skeleton proof; the active next implementation-map task was `BLD-AGT-001` until the live regression override below
  - the `W4-FIX-001` through `W4-FIX-007` chain remains prepared repair work, but it is not the active next task while earlier implementation-map release blockers precede it
- `2026-06-07` professional skeleton quality revalidation adds a newer active-order override:
  - `PRO-SKEL-002` remains closed only as a structured/live market-calibrated skeleton envelope, not as proof that the first Build output feels like a credible real product
  - `PRO-SKEL-003` blocked `BLD-AGT-001`, `VBUILD-001`, and `MUT-001` on the user-visible Build path until mobile, landing page, and internal tool skeletons passed the stronger product-realism bar; it did not reopen already-closed backend truth, mutation truth, or learning event contracts
  - `2026-06-07` closure update: `PRO-SKEL-003` is now `trueGreen` after code, tests, and live project-backed Build screenshots passed for mobile app, landing page, and internal tool skeletons. Evidence: `/private/tmp/nexus-pro-skel-003-1780848998219-report.json`
  - `2026-06-07` unknown-kind clarification: `PRO-SKEL-003` remains closed for the proven class-specific product-realistic path, but it does not close arbitrary product-pattern discovery. `PRODUCT-KIND-001` now becomes the next active blocker before `BLD-AGT-001`, followed by `LEARNING-PRODUCT-INTELLIGENCE-001`.
  - `2026-06-07` unknown-kind closure update: `PRODUCT-KIND-001` is now `trueGreen` after product-pattern discovery, runtime skeleton selection, product-domain mapping, project-truth persistence, tests, and live browser proof passed for game, editor, and simulator ideas. Evidence: `/private/tmp/nexus-product-kind-001-1780850270444-report.json`. `LEARNING-PRODUCT-INTELLIGENCE-001` is now the next active blocker before `BLD-AGT-001`.
  - `2026-06-07` learning product-intelligence closure update: `LEARNING-PRODUCT-INTELLIGENCE-001` is now `trueGreen` after bounded learning decisions influenced a weak future skeleton choice without overwriting project truth, and live browser proof showed an editor-canvas skeleton selected from learned guidance. Evidence: `/private/tmp/nexus-learning-product-intelligence-001-1780851177559-report.json`. `BLD-AGT-001` is now the next active blocker.
  - `2026-06-07` Build Agent closure update: `BLD-AGT-001` is now `trueGreen` after safe product-domain changes, safe visual changes, product-direction approval boundaries, verification routing boundaries, and release/provider boundaries all produced visible Build rail state, project-truth persistence, and refresh restore. Evidence: `/private/tmp/nexus-bld-agt-001-boundary-1780852361903-report.json`. The next active blocker is now `SKELETON-CHOICE-001`.
  - `2026-06-07` multi-provider skeleton choice clarification: `SKELETON-CHOICE-001` is now inserted after `BLD-AGT-001` and before `VBUILD-001` as a future release-blocker for provider-backed skeleton alternatives. It requires real provider/adaptor integration, candidate generation over the same Nexus product truth, user selection or approved recommendation, persisted selected direction, and downstream handoff into Build, Visual Build, Mutation, Learning, Restore, History, Release, and Verification. It does not replace the current active `BLD-AGT-001` task.
  - `2026-06-08` skeleton choice closure update: `SKELETON-CHOICE-001` is now `trueGreen` for provider/adaptor-backed skeleton candidates over Nexus truth. Nexus creates three valid candidate directions from configured internal adaptor paths, records bounded unavailable-provider truth for the external design provider path, rejects detached visual-only candidates, hides provider plumbing from the normal user surface, persists selectedSkeletonCandidateId/selectedDesignProvider/selectedCompositionStyle/selectedProductDirection, restores the selected direction after refresh, and hands selected direction identity into Build Agent, Visual Build, Mutation, Learning, Restore, History, Release, and Verification truth. Evidence: `/private/tmp/nexus-skeleton-choice-001-1780920824537-report.json`. This does not close production external provider execution or full `VBUILD-001`; the next active blocker is `VBUILD-001`.
  - `2026-06-08` visual build closure update: `VBUILD-001` is now `trueGreen` for safe active visual continuation from a selected skeleton direction. Build rail visual instructions now route through the Visual Build Agent, persist `visualBuildTruth`, render the visible lead-card plus follow-up-today surface from project truth, restore after refresh on a clean `/loop?projectId=<real-project-id>` route, and require approval for significant style changes without faking a visual mutation. Evidence: `/private/tmp/nexus-vbuild-001-1780921640537-report.json`. This does not close deeper artifact/product mutation; the next active blocker is `SLICE-006`.
  - `2026-06-08` independent live lead-management field test added closure pressure to `SLICE-006`, `ID-001`, `STATE-001`, and `DATA-001`: Nexus understood the lead-management idea and produced a relevant skeleton, but visible actions leaked internal operation names like `record.create`, some active controls did not visibly mutate/filter, refresh did not clearly restore the Build conversation/action transcript, and the visible no-login entry contradicted `/api/projects` authentication requirements. No new duplicate task was added; these are now explicit pass/fail criteria on the owning tasks.
  - `2026-06-08` conversation mutation closure update: `SLICE-006` is now `trueGreen` for safe artifact mutations from the Build rail and runtime controls. Add-lead requests now route to persisted mutation truth, update the generated product-domain records and visible runtime rows, render product-language summaries instead of internal operation ids, restore the Build transcript and mutation after refresh on a clean `/loop?projectId=<real-project-id>` route, and visibly bound WhatsApp/publish requests without adding mutation history. Evidence: `/private/tmp/nexus-slice-006-1780922831912-report.json`. This does not close the known `/live-events` 401 cleanup debt or broader refresh/return continuity; the next active blocker is `SLICE-007`.
  - `2026-06-08` refresh/return closure update: `SLICE-007` is now `trueGreen` for first-slice project truth continuity. A clean `/loop?projectId=slice007-proof-1780925110507` route restored the runtime skeleton and persisted add-lead mutation from project truth, refresh preserved the same Build state, `/home?projectId=slice007-proof-1780925110507` preserved project identity, explicit return to Build restored the same skeleton/domain rows, browser back/forward did not fall to Create or QA state, and `/live-events` produced no authenticated-session `401`. Evidence: `/private/tmp/nexus-slice-007-1780925110507-report.json`. Exact replay of every intermediate support-route browser-history entry remains `HIST-AGT-001`; the next active blocker is `SLICE-008`.
  - `2026-06-08` standalone artifact clarification: Nexus-internal runtime skeletons and generated product-domain skeletons are not enough for user-ready release language. `STANDALONE-ARTIFACT-001` is now inserted before `VER-AGT-001` and all release gates as a release-blocker requiring a standalone product artifact with screens, actions, persistence, backend/domain execution boundary, run/preview target outside Nexus, and verification or a precise blocker. This leaves `PRODUCT-BACKEND-SKEL-001` closed for mock/local domain truth but prevents release from claiming a user-owned product until the standalone artifact exists.
  - `2026-06-08` product-owned backend skeleton clarification: the user's definition of "skeleton" now requires frontend and backend to be generated together from the first Build output. `PRODUCT-BACKEND-SKEL-001` remains closed only for Nexus-internal mock/local product-domain truth. `PRODUCT-BACKEND-SKEL-002` is now inserted immediately after it and before the runtime/professional skeleton chain, requiring a generated product-owned backend scaffold with models, operations, local/mock persistence, UI bindings, restore identity, and mutation growth alongside the frontend. Prior runtime/professional/Build closures are not deleted, but they may not be interpreted as satisfying this stricter backend-owning skeleton bar.
  - `2026-06-08` product-owned backend skeleton closure: `PRODUCT-BACKEND-SKEL-002` is now `trueGreen` for a generated product-owned local/mock backend scaffold created with the first runtime skeleton and grown by Build mutations. The implementation adds product-owned artifact root/directories/files, schema models, operation endpoints, local/mock persistence, API-like boundaries, frontend/backend pairing truth, project persistence, mutation replay, DOM evidence, targeted tests, and live browser proof. This still does not close production backend hosting or standalone releasable product output; `STANDALONE-ARTIFACT-001` owns that later release gate.
  - `2026-06-08` generated product package clarification: product-owned backend scaffolding still does not close a real generated product package with dependencies, install plan, run command, preview target, tests directory, package manager, and dependency failure handling. `PRODUCT-RUNTIME-PACKAGE-001` is now inserted before `STANDALONE-ARTIFACT-001` as the bridge between Nexus internal skeleton truth and standalone artifact truth. It requires generated product dependencies to belong to the generated product package, not to Nexus itself.
  - `2026-06-08` dependency-quality clarification: `PRODUCT-RUNTIME-PACKAGE-001` is not a design-only or dependency-install task. It may close only when dependencies improve the generated product as a working product across relevant behavior, domain operations, persistence, run/preview, testing, accessibility/performance, interaction quality, and future mutation capacity. Listed or installed-but-unused dependencies do not count.
  - the added blocker exists because Nexus must identify the product's shape of life before choosing a skeleton for unfamiliar products, instead of mapping unknown ideas to a generic dashboard, SaaS shell, landing page, or app frame
- live regression override on `2026-06-04` narrows that remap:
  - `SLICE-005` remains `trueGreen` only for the destination Build runtime skeleton once Loop is open
  - `W4-FIX-007` was promoted before `BLD-AGT-001` because live verification showed the lead-management idea reached `advance-to-skeleton` / `skeletonReady=true` but stayed on the Create screen with `runtimeTask=null` and visible copy `מכין שלד...`
  - `2026-06-04` implementation evidence now proves the narrowed handoff regression is fixed: the live lead-management journey moved from `מכין שלד...` at wait second 44 to `/loop` at wait second 45 with `runtimeTask=SLICE-005`, `runtimeClass=internal-tool`, and no manual navigation. Screenshots: `/private/tmp/nexus-w4-fix-007-final-page.png` and `/private/tmp/nexus-w4-fix-007-runtime-skeleton-element.png`
  - `2026-06-04` visible Chrome field test on `http://127.0.0.1:4011/?qa=1&qaReset=1` reconfirmed the narrowed handoff fix with a real lead-management internal-tool idea: Create moved automatically into `/loop`, rendered an internal-tool runtime skeleton, and the Build rail stayed visible. This live run also found a refresh/restore regression still owned by `W4-FIX-005`: because `qaReset=1` remained in the URL after handoff, refresh replaced the lead-management project with the generic `qa-preview-project` landing-page skeleton. Screenshot: `/private/tmp/nexus-live-visible-leads-refresh-regression.png`
  - `2026-06-04` canonical order correction after the auth/session project-isolation review: `W4-FIX-007` keeps its partial handoff proof, but full closure must return to `W4-FIX-001`, then `AUTH-SESSION-PROJECT-ISO-001`, then `W4-FIX-005`, before `W4-FIX-007` can close truthfully.
  - `2026-06-06` repair pass tightened that closure boundary: `finishOnboardingSession` now treats a discovery-agent `advance-to-skeleton` / `skeletonReady=true` decision as valid build-ready project truth, and the browser no longer routes to `/loop` unless `/finish` returns a real backend project id. Focused verification passed, but the live rerun did not complete a stable `/loop` plus refresh restore proof before timeout, so `W4-FIX-007` remains partial.
  - `W4-FIX-007` is still not `trueGreen` as a full canonical task because its broader convergence-guardrail dependencies remain unresolved: `W4-FIX-003`, `W4-FIX-004`, `W4-FIX-005`, `W4-FIX-006`, and `W4-GEN-003`
  - `BLD-AGT-001` remains blocked by missing dependency truth until canonical orchestration explicitly accepts the partial live handoff fix or the full `W4-FIX-007` dependency chain closes
- canonical coverage is still insufficient for end-to-end onboarding runtime hardening because repository reality and current prepared tasks did not yet explicitly release:
  - visible live response streaming on the onboarding route
  - same-thread retry recovery and provider failover continuity
  - production-safe onboarding runtime hardening beyond the first real provider hookup
  - truthful user-facing control over provider, model, and bounded intelligence/runtime depth
- `W4-AGENT-001` is now closed truthfully after live QA proof showed shallow product understanding bouncing back into the live onboarding conversation, refresh preserving the same open depth gate, stronger `build-direction` answers opening `Understanding`, and `finish` staying blocked until that minimum depth signal existed
- canonical coverage is still insufficient for the clarified smart-onboarding direction because repository reality and current tasks still do not explicitly cover:
  - provider-backed onboarding agent runtime with user provider choice
  - canonical Nexus rule enforcement across provider choice
  - mandatory structured downstream injection of learned intake into the correct Nexus system surfaces
  - minimum real conversation depth before product understanding can close
  - end-to-end onboarding runtime wrapping through streaming, retry/failover continuity, and production-safe runtime hardening
  - user-facing runtime controls so provider/model/intelligence choice does not remain hidden from the user
  - bounded co-founder-style exploratory product reasoning before `Understanding` closes on an ambiguous product idea
  - floating project-aware agent presence across Nexus surfaces
  - explicit post-onboarding clarification / correction loop
  - speaker / perspective correction when the user says `זה אני` / `לקוח שלי`
  - imported competitor/product-conversation intelligence translated into family wrapper packs and a human tone/pacing contract instead of staying as detached research
  - competitor and comparable-product intelligence inside the live agent dialogue

Preparation rule:
- these tasks may be written back immediately after `W4-MBN-020` closes
- they may not begin implementation ahead of unresolved active Wave 4 core tasks
- if repository reality proves contract-only closure without real behavior change, the continuation lane must reopen and release the missing implementation task canonically instead of leaving the gap as a future note

## Cross-Lane Dependency Rules

- lanes 2 and 3 cannot proceed truthfully without lane 1
- lane 4 cannot proceed truthfully without lanes 2 and 3
- lane 5 cannot be implicitly deferred if product classes require local workspace truth
- lane 6 cannot proceed truthfully without lane 1 and class generation direction from lane 4
- lane 7 cannot proceed truthfully without lane 6
- lane 8 cannot proceed truthfully without lane 7
- lane 9 cannot proceed truthfully without lanes 6 and 7
- lane 10 governs closure truth across all previous lanes

## Delegation Rules For Execution Planning

Delegation should accelerate:
- class-specific research
- bounded skeleton quality work
- bounded shell investigations
- bounded runtime/package investigations
- bounded verification matrix drafting

Central orchestration only for:
- lane structure
- task ordering
- cross-lane dependency judgment
- Wave 4 validation gate
- first canonical execution task selection
- canonical write-back
- approval of externally learned patterns before integration
- approval of structural Figma-driven design evolution

## Minimum Believable Nexus Validation Gate

`Minimum Believable Nexus` can be considered truthfully closed only if all of the following become visibly true in later execution:

- Nexus detects project class and automatically starts building the right product skeleton
- the user sees real build progression in front of them
- class-aware generation changes the product itself, not only surrounding text
- frontend/build surfaces evolve live on screen
- runtime / packaging direction is class-aware and visible
- local workspace continuity is real
- Electron / desktop shell truth is real where the product class requires it
- a releaseable product state is visible and meaningful
- a post-release continuation loop is visible and meaningful
- route / restore / proof / artifact / timeline continuity remain connected
- no capability relies on backend truth without visible product truth

## 2026-06-08 — SLICE-008 First-Slice Trust Cleanup Write-Back

- `SLICE-008` is trueGreen only for first user-ready trust cleanup in the current Nexus runtime skeleton slice.
- Nexus now avoids visible premature readiness language before a generated product package, standalone runnable artifact, verification, and explicit release approval exist.
- Build shows a bounded release marker (`גבול שחרור`) instead of implying release readiness from the first skeleton.
- Runtime action feedback is product-language and refresh-preserved; raw operation names and raw field labels are blocked from the visible first-slice proof.
- This does not close `PRODUCT-RUNTIME-PACKAGE-001`, `STANDALONE-ARTIFACT-001`, `BUILD-RELEASE-GATE-001`, or `REL-AGT-001`.
- The next canonical execution task returns to `EXP-001`; release/user-ready product claims remain blocked until generated product package and standalone artifact truth exist.

## 2026-06-08 — EXP-001 Direct Build Editing Write-Back

- `EXP-001` is trueGreen only for bounded Build-surface selection and direct editing on the current runtime skeleton.
- Nexus now exposes a visible direct-edit frame for a selected product record, routes selection and record edits through product-domain operations, persists the result through project truth and the product-owned local/mock backend scaffold, and restores the same selected/edited state after refresh.
- The live proof used `/loop?projectId=exp001-live-1780930702514`, selected a visible record, assigned the owner to `נועה`, refreshed, and confirmed `selectedRecordId=rec-1`, `firstRecordOwner=נועה`, `productOwnedBackendTask=PRODUCT-BACKEND-SKEL-002`, `productionBackend=false`, and zero bad events.
- This closes the first direct-edit slice only. It does not close arbitrary inline editing, deep product-direction changes, full mutation approval, standalone product package generation, production backend, release, providers, payments, or publishing.
- The next canonical execution task is `MUT-001` because `FND-002`, `ENG-004`, `VBUILD-001`, and `EXP-001` are closed.

## 2026-06-08 — MUT-001 Mutation Ownership Write-Back

- `MUT-001` is trueGreen for Build-originating meaningful change ownership.
- Nexus now creates a mutation decision before applying a Build change, distinguishes safe small changes from product-direction changes, records approval/checkpoint/verification flags, persists a product-readable mutation history record, and exposes the decision on the Build rail.
- Safe request proof: `תוסיף שדה מקור ליד` produced `MUT-001`, status `applied`, change type `small`, product-truth mutation `true`, approval `false`, and a persisted lead-source field.
- Direction-change proof: `תשנה את זה להזמנות במקום לידים` produced `MUT-001`, status `pending-approval`, change type `product-truth`, approval `true`, no silent identity switch, and refresh restored the pending approval state.
- Live browser proof passed on `http://127.0.0.1:4014/loop?projectId=mut001-live-1780931764085`; evidence is `/private/tmp/nexus-mut-001-1780931764085-report.json` with screenshots for initial, safe change, direction request, and refresh.
- This does not close `EXP-002`, `BUILD-APPROVAL-001`, `HIST-AGT-001`, `VER-AGT-001`, `REL-AGT-001`, provider connection, payments, publishing, production backend, or standalone generated product package output.
- The next canonical execution task is `EXP-002`.

## 2026-06-08 — EXP-002 Canonical Mutation Flow Shell Write-Back

- `EXP-002` is trueGreen for the visible Build-shell mutation flow that consumes `MUT-001` decisions.
- Nexus now shows a product-readable sequence on the Build rail: request, decision, approval, apply, and history. The flow is persisted in project truth and restored after refresh.
- Safe request proof: `תוסיף שדה מקור ליד` produced EXP-002 status `applied`, approval skipped, apply done, history done, and MUT-001 status `applied`.
- Direction-change proof: `תשנה את זה להזמנות במקום לידים` produced EXP-002 status `pending-approval`, approval waiting, apply blocked, MUT-001 status `pending-approval`, and no silent change from leads to orders.
- Live proof first exposed a false apply state when a previous mutation existed. The flow law was fixed so pending approval always blocks application even when older Build mutation history exists.
- Refresh proof restored the same pending approval flow from project truth with apply still blocked.
- Live browser proof passed on `http://127.0.0.1:4014/loop?projectId=exp002-live-1781006481898`; evidence is `/private/tmp/nexus-exp-002-1781006481898-report.json` with screenshots for initial, safe change, direction request, and refresh.
- This does not close approval execution UI, deep rollback/checkpoint history, verification execution, release execution, provider connection, payments, publishing, production backend, or standalone generated product package output.
- The next canonical execution task is `HIST-AGT-001`.

## 2026-06-09 — HIST-AGT-001 Partial Continuity Agent Write-Back

- `HIST-AGT-001` is partial, not trueGreen.
- Nexus now creates and persists a History / Continuity Agent envelope from project truth, mutation decisions, mutation history, and Build mutation history.
- The History surface now shows product-readable change history, checkpoint candidates, restore-impact explanation, return-after-time summary, and a return-to-Build continuation path.
- Live proof on `http://127.0.0.1:4014/timeline?projectId=histagt-live-1781007332744` showed: small lead-source change recorded as product history, product-direction change recorded as pending approval with checkpoint, restore-impact decision recorded without silent restore, refresh restored the same decision, and return to Build restored the pending approval flow.
- Evidence: `/private/tmp/nexus-hist-agt-001-1781007332744-report.json` with screenshots for initial, after changes, History before restore, restore decision, refresh, and return to Build.
- Canonical blocker: `BUILD-APPROVAL-001` is now a missing dependency for full `HIST-AGT-001` closure because History cannot prove approved direction-change restore/rollback until Build-facing approve/reject/cancel execution exists over `MUT-001` truth.
- The next canonical execution task is `BUILD-APPROVAL-001`.

## 2026-06-09 — BUILD-APPROVAL-001 Product-Direction Approval Write-Back

- `BUILD-APPROVAL-001` is trueGreen for the Build-facing approval bridge over `MUT-001` truth.
- Nexus now blocks product-direction changes from applying silently, shows a visible impact and approval state in Build, and supports approve, reject, and cancel decisions backed by project truth.
- Rejection preserves the original lead product truth after refresh; approval applies the order product truth after refresh, including domain model `הזמנה` and runtime title `ניהול הזמנות`.
- Live proof passed on `http://127.0.0.1:4015`; evidence is `/private/tmp/nexus-build-approval-001-1781008927427-report.json` with screenshots for pending, rejected, rejected-after-refresh, approved, and approved-after-refresh paths.
- This closes only the approval bridge. It does not close deep rollback, full History restore, verification execution, release execution, providers, payments, publishing, production backend, or standalone generated product package output.
- The next canonical execution task returns to `HIST-AGT-001`, now unblocked for approved direction-change restore/rollback proof.

## 2026-06-09 — HIST-AGT-001 Restore Execution Write-Back

- `HIST-AGT-001` is now trueGreen for History / Continuity Agent ownership of product-readable history, checkpoints, restore-impact decision, explicit restore execution, refresh persistence, and return-to-Build continuity.
- Nexus now captures product snapshots before meaningful changes, including the human product model name, so a lead-product checkpoint is not saved as a generic record checkpoint.
- Restore now requires an explicit restore action after impact framing, then applies the chosen checkpoint back into Product Graph truth and the visible Build surface.
- A live regression exposed that rebuildContext could reapply a previously approved direction change after restore. The rebuild path now preserves restored History truth instead of reapplying the old approved direction.
- Live proof passed on `http://127.0.0.1:4016`; evidence is `/private/tmp/nexus-hist-agt-001-1781010552491-report.json` with screenshots for initial, after changes, History before restore, restore decision, restore executed, after refresh, and return to Build.
- The proof restored a project from approved orders direction back to lead product truth; backend evidence ended with `historyStatus=restored`, `restoreDecisionStatus=restored`, `restoreTruthUnchanged=false`, `domainModel=ליד`, and runtime title `ניהול לידים עם היסטוריה`.
- This does not close `EXP-003`, release rollback, production backend, generated product runtime package, standalone artifact, providers, payments, publishing, or release gates.
- The next canonical execution task is `SHARE-AGT-001`.

## Explicit Wave 4 Non-Goals

The following are outside `Wave 4`:
- full autonomous software company behavior
- infinite generation depth
- unlimited repository reasoning
- enterprise-scale governance
- broad multi-provider autonomy at scale
- portfolio-level optimization across many products
- Wave 7-grade renderer perfection

These may only enter planning here as deferred boundaries, not as hidden Wave 4 scope.

## First Canonical Execution Task

The first canonical execution task of `Wave 4` should be:

`W4-MBN-001 — Define canonical product-class resolution model`

Why first:
- every other Wave 4 core lane depends on truthful class identity
- it determines bootstrap
- it determines runtime direction
- it determines visible build expectations
- it determines shell / packaging / release path rules

It is the narrowest truthful starting point that unlocks the rest of the Wave 4 execution map without prematurely jumping to implementation.
