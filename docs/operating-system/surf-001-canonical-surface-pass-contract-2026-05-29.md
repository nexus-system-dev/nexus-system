# SURF-001 Canonical Surface Pass Contract

Date: `2026-05-29`
Status: `canonical surface contract`

## Mission

`SURF-001` defines the structural truth of the new Nexus surfaces before deeper shell implementation.

This is not final visual polish. It is the product law that prevents Nexus from drifting into disconnected chat, preview, dashboard, or internal-loop screens.

## Main Surfaces

The new Nexus shell has these canonical main surfaces:

- `Home`
- `Build`
- `Release`
- `Growth`
- `History`
- `Share`
- `Studio`

All surfaces are views over the same Product Graph. They do not own separate product truth.

## Build Surface Law

Build is the heart of Nexus.

```txt
Build surface = persistent agent conversation rail + live artifact/build canvas in the same workspace.
```

The user should feel:

```txt
I am talking to Nexus, and Nexus is building the product in front of me.
```

Transition motion law:

```txt
Discovery chat does not disappear. It compresses into the persistent right-side agent rail while the live build canvas opens beside it.
```

Motion constraints:

- gentle, futuristic, respectful
- no confetti, no hard page jump, no theatrical spin
- target duration: `650ms-900ms`
- preserve visible transcript continuity during the transition
- support reduced-motion by removing non-essential animation

Required structure:

- persistent agent conversation rail
- live artifact/build canvas
- human progress state
- fast change affordance
- release/readiness affordance
- continuity/restore anchor

Forbidden structures:

- only chat
- only artifact preview
- dashboard-first Build
- detached preview
- internal loop/orchestration screen
- classic IDE as the primary product metaphor

## Surface Contracts

### Home

Purpose: momentum gateway.

Must contain:

- central create/continue entry
- recent active product continuation
- last meaningful action

Must not become:

- dashboard
- workspace manager
- onboarding ritual

### Build

Purpose: live creation workspace.

Must contain:

- agent rail
- live build canvas
- product progress state
- change direction action
- release readiness signal

Must not become:

- chat with tiny preview
- preview without conversation
- orchestration console

### Release

Purpose: freeze and ship verified truth.

Must contain:

- release candidate
- verification state
- blockers
- publish/release decision

Must not become:

- raw deployment log
- hidden runtime status screen

### Growth

Purpose: post-product learning and distribution.

Must contain:

- product learning signals
- audience/channel experiments
- next growth action

Must not appear before a product exists.

### History

Purpose: truth evolution and recovery.

Must contain:

- checkpoints
- product changes
- rollback/restore affordance

Must not become:

- debug timeline
- internal event stream

### Share

Purpose: review/demo/collaboration path.

Must contain:

- shareable artifact or product state
- audience/reviewer context
- safe visibility boundary

Must not become:

- raw file export list
- permission system alone

### Studio

Purpose: advanced/local/deeper build boundary.

Must contain:

- explicit boundary from core Build
- local runtime/heavy build affordance when available
- safe handoff back to product truth

Must not become:

- default entry
- replacement for Build

## Closure Standard

`SURF-001` can close only when:

- the canonical surface list is represented in code
- Build has a first-class paired workspace contract
- the visible Loop/Build route exposes agent rail + live build canvas structure
- tests prevent Build from becoming only chat, only preview, dashboard, or internal loop
- the discovery-to-build proof shows the central discovery conversation carrying product understanding into the persistent agent rail while the live build canvas opens beside it
- canonical docs and implementation task map agree on the next task
