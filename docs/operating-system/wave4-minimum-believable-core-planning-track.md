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
