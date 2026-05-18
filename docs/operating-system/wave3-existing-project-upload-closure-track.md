# Wave 3 Existing-Project Upload Closure Track

## Purpose

This document is the canonical execution lane for proving that Nexus can take an existing uploaded project and continue the live product loop truthfully on `http://127.0.0.1:4011/`.

This is not Wave 4 expansion.

This lane exists because the repeated-loop closure lane is now trueGreen, but the uploaded-project path has not yet been proven on the live site.

## Active Closure Truth

The live create surface already exposes a real upload path:

- `גרור קבצים לכאן או לחץ להעלאה`
- a real hidden `input[type=file]`
- accepted types now include project-evidence material such as:
  - `.pdf`
  - `.doc`
  - `.docx`
  - `.txt`
  - `.md`
  - `.png`
  - `.jpg`
  - `.jpeg`
  - `.json`
  - `.js`
  - `.jsx`
  - `.ts`
  - `.tsx`
  - `.css`
  - `.scss`
  - `.html`
  - `.yml`
  - `.yaml`
  - `.csv`

New truth established on `2026-05-17`:

- the root `/` route on `4011` now remains on the create surface after hydration instead of auto-restoring the first project into `loop`
- real local file attachment was proven on the live create surface through Playwright-driven browser automation against `4011`
- two representative multi-file bundles were attached live:
  - `milan.co` evidence bundle
  - `The Nexus` evidence bundle
- the upload surface acknowledged real selected files, including `4 קבצי פרויקט נבחרו`
- both bundles opened live onboarding flows after create

New truth established later on `2026-05-17`:

- the false `429` restore / onboarding-completion blocker was removed from the live path
- uploaded files now persist canonically into the onboarding session instead of living only in client-side hidden fields until finish-time replay
- uploaded project type can now be resolved from uploaded file material itself, not only from free-text vision input
- both representative bundles (`milan.co` and `The Nexus`) now reach a real class-aware workspace / loop surface after onboarding instead of blocking on project-type clarification
- the `confirmation -> state-update` handoff is now truthfully wired to the artifact approval request rather than a weaker runtime approval path
- a full live rerun on `4011` now proves routed progression for both representative uploaded bundles through:
  - `Loop`
  - `Proof`
  - `Artifact`
  - `Confirmation`
  - `State Update`
  - `Timeline`
- comparative differentiation is now visibly real and downstream, not only server-side:
  - `milan.co` lands in a commerce / operations workspace with commerce-specific next actions, stats, proof, and timeline
  - `The Nexus` lands in an internal-tool workspace with internal-tool-specific next actions, stats, proof, and timeline
- uploaded-project identity survives visibly through the downstream path:
  - project title
  - project class
  - project-specific action framing
  - project-specific proof / timeline surfaces

This lane is now trueGreen on the live site.

## Scope Boundary

This lane is limited to proving one truthful uploaded-project loop through:

- `Create`
- `Understanding`
- `Loop`
- `Proof`
- `Artifact`
- `Timeline`

This lane does not include:

- new scanner architecture
- new deep runtime generation systems
- Wave 4 imported-project autonomy
- large new backend infrastructure

## Upload Truth Requirement

It is not enough for the uploaded file to merely appear or survive technically inside project state.

Nexus must also truthfully demonstrate that it:

- understood the uploaded material
- extracted the correct project/product context from it
- selected a coherent next loop direction
- generated a relevant task / proof / artifact path from the uploaded content itself

The uploaded-project loop fails truthfully if:

- the loop/task/proof feels generic
- the system ignores the uploaded material
- the next task does not logically follow from the uploaded file
- the Understanding layer does not reflect the uploaded content accurately
- the product direction feels disconnected from the uploaded project

So the lane must validate:

- upload continuity
- upload comprehension
- upload-driven loop relevance
- upload-driven product progression

## Realistic Upload Contract

For this lane, a minimally product-real existing-project upload contract must allow at least one truthful intake shape such as:

- a connected repository URL that Nexus can scan truthfully
- a compressed project export or representative source bundle from the user's computer
- a multi-file project evidence bundle that includes believable project context such as:
  - `README`
  - package / app manifest
  - core source snapshot
  - architecture or product docs

The contract must not collapse the intake into:

- one tiny support file only
- one manually copied text note
- one toy asset that cannot represent a real existing project

The contract is minimally product-real only if:

- the user can provide more than one file or one real project bundle
- the accepted types can represent believable project material, not only lightweight support docs
- the accepted size envelope is large enough for representative source/context intake
- Nexus preserves original filenames and material identity truthfully into onboarding / understanding

For truthful Wave 3 verification, the minimum practical envelope is:

- at least one representative uploaded project bundle in the tens-of-megabytes range
- or one multi-file uploaded intake that can stand in for a real existing project

`10MB` is below that threshold and is therefore not product-truthful for this lane.

## Canonical Task

### W3-UP-001 — Prove existing-project upload loop on 4011

- depends_on:
  - `W3-SL-005`
- why_this_task_exists:
  - Wave 3 cannot truthfully claim imported-project continuity if the live upload path has never been proven end-to-end from file selection through product progression
  - must_be_true:
    - a real local file can be attached from the live create surface
    - the upload contract itself is product-real for existing-project intake
    - the project can be created from that uploaded source
    - the uploaded context survives into `Understanding`
  - the Understanding surface reflects the uploaded material accurately
  - the next loop direction follows coherently from the uploaded file
  - the task / proof / artifact path is visibly driven by the uploaded content itself
  - the project continues through `Loop -> Proof -> Artifact -> Timeline`
  - route truth, continuity truth, and restore truth remain intact
  - the visible experience feels product-first, not orchestration-first
- live_status:
  - state: `trueGreen`
  - last_validated_at: `2026-05-17`
  - evidence_paths:
    - `docs/operating-system/wave3-final-hardening/evidence/upload-loop/live-note-2026-05-16.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/upload-loop/live-note-2026-05-17.txt`
    - `docs/operating-system/wave3-final-hardening/evidence/upload-loop/playwright-upload-verification-2026-05-17.json`
  - what_is_true_now:
    - the root `/` route now stays on `create` after hydration instead of auto-loading the first stored project into `loop`
    - the live create surface exposes a real upload dropzone on `4011`
    - a real hidden `input[type=file]` exists behind the dropzone
    - the live upload contract no longer advertises `10MB`
    - the live upload control now exposes `multiple` selection on `4011`
    - the accepted file types now include project-evidence inputs such as `README`, `package.json`, source files, docs, and structured context files
    - the live create surface now presents multi-file project evidence intake instead of a single support-file picker
    - real multi-file attachment was proven against the live site through Playwright browser automation using:
      - `milan.co` bundle
      - `The Nexus` bundle
    - both bundles opened live onboarding after create
    - comparative differentiation is now visible earlier and more truthfully:
      - uploaded file material can resolve project type before explicit manual class clarification
      - `milan.co` and `The Nexus` both now reach a class-aware handoff from real uploaded bundles
    - the current create flow stores uploaded evidence as a multi-file bundle for onboarding rather than one support-file placeholder
    - uploaded evidence is now synced canonically into the onboarding session before finish instead of being deferred to a separate best-effort upload replay
    - the downstream uploaded-intake-to-scanner handoff already exists in code and is already wired into onboarding completion
    - that means the apparent dependency `Create uploaded intake to scanner handoff` did not truthfully open as a new promoted task
    - a direct finish trace now proves that server-side onboarding completion can create a real uploaded-project with preserved uploaded files and an imported-task roadmap
    - the live uploaded-project path is now proven end-to-end through `Create -> Understanding -> Loop -> Proof -> Artifact -> Timeline`
    - the visible downstream chain is now routed and real for both representative uploaded bundles:
      - `loop -> proof -> artifact -> confirmation -> state-update -> timeline`
    - uploaded-project comprehension and loop selection now differ meaningfully by project class on the live site
    - proof / artifact / timeline surfaces now preserve uploaded-project identity and show project-specific next actions
  - exact_remaining_gap:
    - none inside `W3-UP-001`
  - why_not_true_green:
    - none
  - return_when:
    - return to this lane only if a fresh live rerun on `4011` reintroduces regression in uploaded-project continuity, route truth, comparative differentiation, or downstream `Loop -> Proof -> Artifact -> Timeline` progression

## Execution Status

- state: `execution-promoted-blocking-wave4`
- lowest_truthful_executable_task:
  - `W3-UP-001`
- execution_discipline:
  - do not claim upload success from API-only truth
  - do not claim upload success from code-only truth
  - do not treat hidden file-input existence as file-upload proof
  - do not treat project-state survival alone as uploaded-project success
  - uploaded-project truth requires visible comprehension and loop relevance, not only continuity
