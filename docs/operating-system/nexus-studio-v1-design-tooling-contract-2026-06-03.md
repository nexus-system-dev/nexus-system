# Nexus Studio V1 Design And Tooling Contract

Date: `2026-06-03`
Task: `STD-DESIGN-001`
Status: `canonical design/tooling contract created`
Depends on:

- `STD-VISION-001`
- `STD-SCREENS-001`
- `STD-PKG-001`

Consumes:

- `docs/operating-system/nexus-studio-visual-vision-2026-06-02.md`
- `docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md`
- `docs/operating-system/nexus-studio-packaging-debug-release-handoff-contract-2026-06-03.md`
- `docs/operating-system/nexus-studio-canonical-product-system-2026-05-31.md`

## Purpose

This contract locks how Nexus Studio V1 must look, feel, and be judged before implementation.

It prevents Studio from becoming:

- a VS Code clone
- a generic file editor
- a terminal-first tool
- a developer dashboard
- a Web `/studio` page pretending to be Desktop
- an Electron shell with Nexus branding but no Studio product language
- a fake local-power surface

Core law:

```txt
Studio is Nexus in deep local work mode.
```

Second law:

```txt
Studio creates wow through calm control over local chaos, not through visual noise.
```

## Scope

This task creates a planning/design-tooling contract only.

It does not implement:

- Desktop UI
- Web UI changes
- Figma edits
- Electron app shell
- local runtime UI
- live permissions UI
- live sync UI
- browser or Desktop verification

It may be marked `trueGreen` only as a planning/design-tooling contract task.

No Studio implementation task may become `trueGreen` from this contract alone.

## Design Authority

The first design authority for Studio V1 is Figma.

Canonical Figma artifact:

```txt
https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g
```

Canonical visual document:

```txt
docs/operating-system/nexus-studio-visual-vision-2026-06-02.md
```

Canonical screen map:

```txt
docs/operating-system/nexus-studio-v1-screen-workspace-map-2026-06-02.md
```

Implementation must be judged against these artifacts.

Text-only interpretation is not enough.

## Required Design System

Studio uses:

```txt
Nexus Design System + Studio Depth Layer
```

Studio must not create a new design system from scratch.

Studio Depth Layer adds:

- deeper background
- professional contrast
- calm dense work surfaces
- local-action icons
- permission language
- sync language
- error language
- run language
- package language
- evidence/candidate labels
- local/cloud truth status colors
- danger states that are visible but not panic-driven

## Visual Relationship To Web

Nexus Web:

- light
- fast
- alive
- conversational
- cloud-first

Nexus Studio:

- deep
- stable
- local
- precise
- permission-aware
- evidence-aware
- product-first

Studio must feel like the same Nexus, not a separate product.

The user should feel:

```txt
אני עדיין בתוך נקסוס, רק עכשיו היא עובדת מהמחשב שלי.
```

## Persistent Shell Requirements

Every primary Studio workspace must preserve:

- product center
- Nexus local side panel
- bottom truth/status bar
- top `חזור ל־Web` action
- next-action card when action guidance is relevant

The first workspace view must show:

- project identity
- product picture
- cloud/local state
- next local action
- permission needs
- what can return to Web

The first workspace view must not show first:

- file tree
- terminal
- raw logs
- package list
- developer dashboard
- blank technical state

## Tooling Model

Studio V1 tooling is product-framed.

Allowed tooling surfaces:

- relevant files as product context
- local run as a guided action
- preview as local evidence
- debug as human explanation plus filtered details
- package as candidate card
- permissions as clear cards
- sync as product meaning before files
- conflict as guided Nexus decision before diff

Forbidden tooling surfaces:

- full IDE clone
- terminal-first workflow
- file-tree-first workspace
- generic devtools dashboard
- raw log viewer as primary screen
- unlimited command palette as core UX
- hidden local-power controls
- fake local capability in Web

## State Design Requirements

Figma and implementation must cover:

- empty
- loading
- error
- locked
- conflict
- no permission
- unsynced
- read-only
- package failed
- sync rejected
- local dirty
- offline bounded

State visuals must make truth clear:

- what is cloud truth
- what is local
- what is evidence
- what is a candidate
- what is accepted
- what is rejected
- what requires approval

## Required Deep Frames

The following frames are deep locked design references:

- main project workspace
- error/debug
- preview before sync
- cloud conflict
- permissions
- package/release candidate

Implementation must not reinterpret these frames into:

- generic cards unrelated to local truth
- developer tables
- file-first panels
- terminal-heavy layouts
- fake status pills with no truth boundary

## Studio Side Panel Contract

The Nexus side panel in Studio is not a direct copy of Web chat.

It must show:

- local action explanation
- running state
- failure explanation
- permission requests
- approval prompts
- evidence summaries
- sync status
- what will return to Web

It must not become:

- generic assistant chat
- command-only launcher
- hidden debug console
- marketing explanation panel

## Bottom Status Bar Contract

The bottom status bar is quiet by default and prominent only when trust is at risk.

Quiet states:

- synced
- local
- running
- waiting

Prominent states:

- conflict
- error
- unsynced local work
- missing permission
- pre-sync risk
- package failed
- sync rejected

The status bar must never imply a state that engines have not returned.

## Design Proof Requirements

Before implementation starts, design review must prove:

- Studio is visibly a Mac desktop application
- Studio is not the Web `/studio` route
- the shell is product-first
- files are contextual, not the primary structure
- terminal is not primary
- debugging starts with meaning
- sync starts with product meaning
- package is a candidate, not release
- permissions are visible and revocable
- local/cloud truth labels are clear
- Nexus side panel is local-aware
- bottom status bar shows truth state

## Anti-Pattern Checklist

Studio fails this contract if any primary V1 screen looks like:

- VS Code with a Nexus sidebar
- a terminal wrapper
- a filesystem browser
- a generic developer dashboard
- a Web admin screen
- a fake local runtime surface
- a release screen that bypasses Web Release
- a package screen that says public release happened
- a sync screen that starts with file diff before product meaning
- a debug screen that starts with raw logs

## Tool Selection

V1 design/tooling decisions:

- Figma is first visual authority.
- Electron is V1 shell default from the Studio platform contract.
- Nexus Web design tokens are the base.
- Studio Depth Layer is the local-power extension.

Post-release evaluation:

- Tauri
- native Mac shell
- deeper Figma component system
- advanced diff/merge tooling
- command palette as secondary layer
- deeper local debugging surfaces

## Closure Criteria

`STD-DESIGN-001` can be marked `trueGreen` as a planning/design-tooling contract task only when:

- this contract exists
- Figma is recorded as first design authority
- `Nexus Design System + Studio Depth Layer` is defined
- required shell regions are defined
- forbidden directions are defined
- tooling surfaces are product-framed
- state design requirements are defined
- deep frame requirements are defined
- anti-pattern checklist is defined
- no implementation is implied

## Verification

Verification performed:

- contract consumes the canonical visual vision and screen map
- contract defines Figma as first design authority
- contract defines Studio Depth Layer
- contract forbids VS Code clone, file-tree-first, terminal-first, developer dashboard, and fake Web Studio
- contract defines required proof states and deep frames
- contract defines product-first tooling surfaces

Verification not performed:

- no Desktop UI implemented
- no Figma file changed in this task
- no browser route changed
- no Desktop verification performed

## Status

`STD-DESIGN-001` may be marked `trueGreen` as a planning/design-tooling contract task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-AGENT-001 — Define bounded Studio local agents
```
