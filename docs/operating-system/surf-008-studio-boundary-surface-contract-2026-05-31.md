# SURF-008 — Studio Boundary Surface Contract

Date: `2026-05-31`
Status: `implemented`

## Scope Boundary

`SURF-008` is not the full Nexus Studio product definition.

It is only the Web boundary / handoff surface for Nexus Studio.

The canonical Studio product definition lives in:

- `docs/operating-system/nexus-studio-canonical-product-system-2026-05-31.md`
- `docs/operating-system/nexus-studio-canonical-implementation-task-map-2026-05-31.md`

## Canonical Law

`Nexus Studio` is a local desktop workspace.

`Nexus Web` must not implement Studio as another full web surface. The web product may only identify, explain, and hand off to Nexus Studio Desktop when a task requires local computer capabilities.

In short:

```txt
Nexus Web identifies, explains, and hands off.
Nexus Studio Desktop performs local workspace work.
```

`SURF-008` may be `trueGreen` only as Web boundary truth. It does not make Studio itself implemented, connected, synced, packaged, or release-ready.

## Bidirectional Door Contract

The Studio door is bidirectional:

- Web -> Studio: explain, connect, open, bind active project, request a bounded local action.
- Studio -> Web: return status, sync status, candidate evidence, package/debug result, recovery state, and return-to-Web continuity.

Connection states:

- `not-installed`
- `installed-not-connected`
- `connected-idle`
- `connected-project-bound`
- `version-mismatch`
- `stale-project-binding`
- `syncing`
- `local-dirty`
- `offline-bounded`
- `sync-rejected`
- `handoff-failed`
- `error`

The Web surface must not fake these states. If Desktop is unavailable, Web explains and offers fallback only.

## Web May Show

- what Studio does
- whether Studio is connected/installed
- why the current action requires local desktop capabilities
- a button to open/connect Nexus Studio
- fallback when Studio is not installed
- what remains in Web and what moves to Studio Desktop
- return paths back to Build, Release, and History

## Web Must Not Build

- a full Studio editor
- a local file workspace in the browser
- a Developer console as a product surface
- fake local filesystem access
- fake local runtime control
- Studio as a replacement for Build
- Studio as a regular Web surface like Build / Release / Growth

## Required Regions

- `studio-web-boundary-explanation`
- `studio-desktop-connection-status`
- `studio-open-desktop-action`
- `studio-install-fallback`
- `studio-web-vs-desktop-split`
- `studio-return-to-web-product-truth`

## Implementation Anchors

- `src/core/studio-boundary-surface-contract.js`
- `web/nexus-ui/adapters/studio-boundary-adapter.js`
- `web/nexus-ui/screens/StudioBoundaryScreen.js`
- `test/studio-boundary-surface-contract.test.js`
- `/studio` route in `web/app.js`

## Closure Evidence

- `node --check web/app.js`
- `node --check web/nexus-ui/screens/StudioBoundaryScreen.js`
- `node --check web/nexus-ui/adapters/studio-boundary-adapter.js`
- `node --test test/studio-boundary-surface-contract.test.js test/nexus-sidebar-navigation-contract.test.js` passed `9/9`.
- Shell regression across Release, Growth, History, Share, Studio, and rail contracts passed `18/18`.
- Live `/studio` verification confirmed:
  - `appScreen=studio`
  - `shellRoute=studio`
  - `data-studio-boundary-contract="SURF-008"`
  - all six required Studio boundary regions
  - visible canonical rail active on `studio`
  - rail pinned to the physical right of content
  - no legacy sidebar
  - no Developer / Project Brain leakage
  - no QA/internal debug/orchestration labels
  - no fake local filesystem or web Studio workspace
  - Studio ↔ Share rail click-through works with correct active route state
