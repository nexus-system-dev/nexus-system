# Nexus Studio V1 Canonical Visual Vision

Date: `2026-06-02`
Task: `STD-VISION-001`
Status: `canonical visual artifact created`
Design tool: `Figma`
Figma file: `https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g`
Figma file key: `PayxllrD8TrZdg3FIASn4g`

## Purpose

This document records the canonical visual vision for Nexus Studio V1 before any Studio implementation begins.

Studio remains:

- Nexus desktop-local power mode
- Mac-only in V1
- Electron-first in V1 unless proven otherwise
- product-first
- agent-guided
- cloud-canonical
- not a Web route
- not a Developer page
- not a VS Code clone
- not file-tree-first
- not terminal-first

Core visual law:

```txt
Studio creates wow through calm control over local work, not through noise.
```

## Figma Artifact

The Figma artifact created for this task is:

```txt
Nexus Studio V1 Canonical Visual Vision — STD-VISION-001
https://www.figma.com/design/PayxllrD8TrZdg3FIASn4g
```

The artifact contains 12 top-level frames:

1. `00 Outside Application Identity`
2. `01 Studio Opening`
3. `02 Web Project Opening Confirmation`
4. `03 Main Project Workspace — Deep Locked Frame`
5. `04 Error / Debug State — Deep Locked Frame`
6. `05 Preview Before Sync — Deep Locked Frame`
7. `06 Cloud Conflict — Deep Locked Frame`
8. `07 Permissions — Deep Locked Frame`
9. `08 Read-Only Mode`
10. `09 Local Recovery`
11. `10 Package / Release Candidate — Deep Locked Frame`
12. `11 Basic Studio Settings`

This satisfies the canonical requirement for:

- one outside-application frame
- one frame for each of the 11 Studio V1 screens
- six deep locked frames

## Visual Direction

Studio uses:

```txt
Nexus Design System + Studio Depth Layer
```

The visual language is:

- quiet
- professional
- stable
- local-power aware
- product-first
- serious
- premium
- controlled

Studio does not use:

- loud marketing colors
- generic developer dashboard language
- file tree as the primary opening state
- terminal as the primary opening state
- raw logs as the first error experience
- Web `/studio` as the Studio application

## Persistent Studio Shell

The canonical Studio shell has three persistent regions:

1. Product center
2. Nexus local side panel
3. Bottom truth/status bar

The top shell also includes a persistent return action:

```txt
חזור ל־Web
```

The shell must always make clear:

- which project is open
- whether the project is connected to cloud truth
- what is local
- what is synced
- what is running
- what requires approval
- what can return to Web

## Outside Application Frame

Frame:

```txt
00 Outside Application Identity
```

Purpose:

- proves Studio is a real Mac desktop application
- shows the `Nexus Studio` name
- shows a Studio app icon direction
- shows a basic Mac window
- shows Web-handed opening and standalone opening as separate entry modes

Canonical law:

```txt
Studio is not another page in the website. It is a local Nexus application.
```

## V1 Screen Frames

### 1. Studio Opening

Frame:

```txt
01 Studio Opening
```

Shows:

- recent project first when opened directly
- visible connection state
- project cards
- missing permission cards
- primary open project action

Law:

```txt
The user sees what they are working on before connection mechanics.
```

### 2. Web Project Opening Confirmation

Frame:

```txt
02 Web Project Opening Confirmation
```

Shows:

- `פותחים את הפרויקט הזה ב־Nexus Studio`
- project identity
- what Studio will receive
- what remains in Web
- primary `פתח פרויקט` action

Law:

```txt
Web can hand off to Studio, but local project binding is visible and intentional.
```

### 3. Main Project Workspace

Frame:

```txt
03 Main Project Workspace — Deep Locked Frame
```

Shows:

- product picture first
- sync truth
- next local action
- local run action
- relevant files as product context
- Nexus Local Agent panel
- quiet bottom status bar

Law:

```txt
The first workspace is product-first, not file-first.
```

### 4. Error / Debug State

Frame:

```txt
04 Error / Debug State — Deep Locked Frame
```

Shows:

- human explanation before raw log
- why the failure matters
- proposed fix
- filtered technical detail
- approval-gated install/change path
- high-attention status bar

Law:

```txt
Debugging starts with meaning, then details.
```

### 5. Preview Before Sync

Frame:

```txt
05 Preview Before Sync — Deep Locked Frame
```

Shows:

- product meaning first
- files second
- tests/evidence third
- actions: sync, keep local, cancel

Law:

```txt
Sync starts with product meaning, not a file list.
```

### 6. Cloud Conflict

Frame:

```txt
06 Cloud Conflict — Deep Locked Frame
```

Shows:

- cloud changed while local work happened
- guided Nexus explanation
- cloud change
- local change
- conflict area
- safe choices: merge, save local as draft, accept cloud, open comparison

Law:

```txt
Studio never overwrites cloud or local truth silently.
```

### 7. Permissions

Frame:

```txt
07 Permissions — Deep Locked Frame
```

Shows permission cards for:

- folder
- read
- write
- run
- secrets
- install
- sync

Each card explains:

- why the permission is needed
- what it enables
- whether it is active or locked
- the risk boundary

Law:

```txt
The agent never bypasses permissions, and permissions never replace explanation.
```

### 8. Read-Only Mode

Frame:

```txt
08 Read-Only Mode
```

Shows:

- normal project workspace feel
- locked local actions
- visible unlock path
- no separate dead-end screen

Law:

```txt
Read-only mode is still the project, with actions truthfully locked.
```

### 9. Local Recovery

Frame:

```txt
09 Local Recovery
```

Shows:

- unsynced local work
- primary `ראה מה נשמר`
- continue, sync, or cancel options

Law:

```txt
Recovery starts by showing what exists before asking the user to sync.
```

### 10. Package / Release Candidate

Frame:

```txt
10 Package / Release Candidate — Deep Locked Frame
```

Shows:

- package as candidate
- evidence
- what is still local
- handoff to Web Release

Law:

```txt
Studio packages a candidate. Web Release approves release.
```

### 11. Basic Studio Settings

Frame:

```txt
11 Basic Studio Settings
```

Shows:

- Web connection
- local permissions
- local storage
- platform scope

Law:

```txt
Settings expose local trust boundaries without turning Studio into a technical control panel.
```

## Deep Locked Frames

The six deep locked frames are:

1. `03 Main Project Workspace`
2. `04 Error / Debug State`
3. `05 Preview Before Sync`
4. `06 Cloud Conflict`
5. `07 Permissions`
6. `10 Package / Release Candidate`

These frames are the visual anchors for implementation.

They lock:

- product-first workspace
- local-agent side panel
- permission boundaries
- sync meaning
- error meaning
- conflict behavior
- package-as-candidate handoff
- quiet/high-attention status behavior

## Forbidden Visual Directions

This vision explicitly rejects:

- Studio as a Web `/studio` work surface
- Studio as a Developer page
- Studio as a file-tree-first app
- Studio as a terminal-first app
- Studio as a generic IDE
- Studio as a VS Code clone
- Studio as a second truth owner
- Studio as a raw local runtime console
- Studio as a fake release surface

## Verification

Verification performed:

- Figma file was created successfully.
- Figma frame creation returned `frameCount: 12`.
- Created frame names match the required outside frame plus 11 Studio V1 screens.
- Six deep locked frames exist.
- Visual artifact includes product center, Nexus Local Agent panel, bottom status bar, return-to-Web action, Web handoff, permissions, sync, conflict, recovery, and package candidate states.

Verification not performed:

- No Studio code was implemented.
- No desktop app was launched.
- No browser route was changed.
- No runtime UI test was run.

## Status

`STD-VISION-001` can be marked `trueGreen` as a planning/design artifact task only.

No Studio implementation task is trueGreen.

Next canonical task:

```txt
STD-SCREENS-001 — Nexus Studio V1 screen and workspace map
```
