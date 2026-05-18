# Wave 4 External Product Intelligence Pass — 2026-05-18

מטרת המסמך:
- לבצע מחקר חיצוני אמיתי על מנועי product-generation, AI builders, orchestration environments, ו־creator workspaces
- לזהות patterns חזקים, חלשים, ושטחיים
- להחזיר את המסקנות בצורה קנונית לתוך `Wave 4`

## Scope

נחקרו מקורות רשמיים, דפי מוצר, ותיעוד עדכני עבור:
- Base44
- Lovable
- Replit
- Cursor
- Figma Make
- v0
- Bolt.new
- Devin / Cognition

המחקר התמקד ב:
- onboarding and first-build flow
- workspace layouts
- split-screen behavior
- live build / preview progression
- orchestration behavior
- continuation depth
- release / deploy framing
- local vs hosted work style

## Comparative Findings

### What Feels Strong

#### 1. Instant First Value

המערכות החזקות ביותר מייצרות תחושה של:
- "המערכת כבר התחילה לבנות"
- לא "עכשיו נגדיר כמה דברים ואז נחשוב"

Patterns חזקים:
- Base44: app creation feels immediate and vertically integrated
- Lovable: fast app/site emergence with visible result and deploy path
- Replit: agent-to-project-to-preview path feels quick and concrete
- Bolt: prompt-to-fullstack-preview in one browser workspace

Why it works:
- user sees output immediately
- confidence rises before deep orchestration is explained

#### 2. Live Preview As The Center Of Gravity

המערכות היותר חזקות מארגנות את החוויה סביב preview/build surface:
- Bolt
- Replit
- v0
- Figma Make

Pattern:
- prompt/chat/context is important
- but the center of gravity is the evolving product surface

Why it works:
- trust comes from "I can see it"
- momentum comes from visible change, not claimed intelligence

#### 3. Familiar Workspace Mental Models

Cursor, Devin, and Replit are strong because they feel like:
- IDE
- branch/review workspace
- real environment

Patterns:
- existing project awareness
- file/workspace framing
- task progress as execution, not only language
- reviewable output path

Why it works:
- creators trust environments that resemble work, not demos

#### 4. Narrow But Clear Success Surfaces

Figma Make and v0 are strong at:
- giving a constrained but visually convincing output loop
- making targeted edits feel direct

Why it works:
- they avoid pretending to solve the whole software company
- they win a specific zone very clearly

#### 5. Visible Deploy / Publish Momentum

Lovable, Bolt, Replit, v0 all benefit from a visible deploy/publish path.

Pattern:
- output is not only "generated"
- it feels one step away from being shareable or live

Why it works:
- creator momentum depends on believable forward motion

### What Feels Weak Or Shallow

#### 1. One-Shot Magic Without Deep Continuation

Many builders feel strong in the first 1-2 minutes,
but weaker after the first generated surface exists.

Common weakness:
- first output is impressive
- continuation becomes patchy
- iteration depth falls back to prompt-churn

This is where Nexus must be stronger.

#### 2. Generic Output Drift

Systems that optimize for fast wow often drift into:
- generic SaaS look
- generic landing structure
- repeated visual heuristics
- shallow class differentiation

This weakens long-term trust even if first output is impressive.

#### 3. Hidden Orchestration

Many systems feel magical but not legible.

Problem:
- user sees result
- but does not understand project state, runtime direction, or continuation logic

That creates short-term wow but weak long-term operating confidence.

#### 4. Weak Local / Durable Workspace Truth

Most browser-first builders are strongest at hosted preview,
not at:
- local workspace continuity
- desktop-style project presence
- durable ongoing product stewardship

This is a strategic opening for Nexus.

#### 5. Release And Continuation Are Often Detached

Some tools are strong at:
- generate
- preview
- publish

But weaker at:
- release evidence
- post-release improvement loop
- credible continuation as the same product

This is another opening for Nexus.

## What Nexus Must Adopt

Nexus should explicitly adopt:

### A. Immediate Build Momentum

Nexus must feel like:
- "it already started building"

Not like:
- "it is still collecting intentions"

### B. Preview-Centered Product Experience

The evolving product surface must become the center of gravity.

### C. Familiar Workspace Credibility

Nexus must feel closer to:
- IDE
- simulator
- creator workspace

Than to:
- pure chat tool
- orchestration shell

### D. Visible Release Direction

The user must always understand:
- what is being built
- where it can run
- how close it is to releaseable state

### E. Durable Continuation

Nexus must outperform others in:
- continuing the same product
- not only generating a first version

## What Nexus Must Do Differently

Nexus should not merely combine the strongest parts.
It must do several things better than any one competitor:

### 1. Product-Class Depth

Nexus must show deeper class-aware behavior:
- mobile app should not feel like "website in a phone frame"
- SaaS should not feel like "dashboard template only"
- game should not feel like "UI mock"

### 2. Orchestration Legibility

Unlike black-box builders,
Nexus should make orchestration understandable without turning it into verbose metadata.

### 3. Continuation As A First-Class Product Truth

Nexus must treat continuation as core,
not as a weaker afterthought after generation.

### 4. Local-First Product Stewardship

Nexus should own the zone most builders leave weak:
- desktop-like continuity
- local workspace identity
- long-running product stewardship

### 5. Coupled Build / Runtime / Release Truth

Nexus must keep:
- build surface
- runtime direction
- package/deploy path
- release evidence
- continuation

in one coherent loop.

## Required Wave 4 UI / Workspace Evolutions

The research implies that Nexus needs explicit design evolution in:

### 1. Split Workspace

Need:
- orchestration context
- live build surface
- project state continuity
- review / proof / release context

in one coherent workspace.

### 2. Simulator / Preview Frames Per Class

Need class-aware preview framing:
- mobile simulator-like shell
- website/landing browser surface
- SaaS application frame
- playable/game preview frame where relevant

### 3. Desktop / Electron Shell Frame

Need a coherent desktop shell model that makes Nexus feel like a real working environment.

### 4. Release And Continuation Surfaces

Need surfaces that show:
- releaseable state
- deploy/release path
- next improvement loop

without fragmenting into unrelated admin panels.

## Required Figma Design Passes

The research makes the following Figma passes mandatory:

1. `Wave 4 Workspace Shell Pass`
- split workspace
- hierarchy
- navigation behavior
- orchestration + build surface balance

2. `Class-Aware Preview Surface Pass`
- mobile simulator frame
- website/browser frame
- SaaS app frame
- game/playable frame

3. `Desktop / Electron Frame Pass`
- app shell
- local workspace frame
- project continuity zones
- tool/navigation chrome

4. `Release And Continuation Surface Pass`
- release state presentation
- runtime/deploy visibility
- next-loop workspace

## Wave 4 Planning Changes Required

### New Or Changed Tasks

The research requires adding or strengthening:

- `W4-MBN-021 — Define Figma-backed live-build workspace contract`
- `W4-MBN-022 — Define Figma-backed desktop shell and local workspace frame`

And requires strengthening the interpretation of:
- `W4-MBN-005`
- `W4-MBN-006`
- `W4-MBN-009`
- `W4-MBN-010`
- `W4-MBN-012`
- `W4-MBN-014`
- `W4-MBN-015`
- `W4-MBN-018`

### Lane-Level Implications

- `Live Build Surfaces` must now explicitly benchmark against live preview-centered builders
- `Local Workspace / Electron Shell` must now explicitly benchmark against IDE/desktop-style environments
- `Runtime / Packaging Resolver` must visibly connect runtime choice to preview and release path
- `Releaseable Output` and `Deployment / Release Path` must feel creator-facing, not ops-only
- `Continuation / Growth Loop` must be treated as a core differentiator, not trailing garnish

## Strategic Direction For Nexus

Nexus should not try to win by being:
- the fastest prompt-to-app toy
- the most magical black box
- the widest but shallowest generator

Nexus should win by being:
- more coherent
- more continuous
- more class-aware
- more release-aware
- more workspace-real
- more durable over time

In short:
- Base44 / Lovable / Bolt / v0 / Replit teach speed and visible momentum
- Cursor / Devin teach workspace credibility and task execution seriousness
- Figma Make teaches design-surface immediacy

Nexus must unify:
- momentum
- depth
- continuity
- runtime truth
- release truth

better than any one of them in isolation.
