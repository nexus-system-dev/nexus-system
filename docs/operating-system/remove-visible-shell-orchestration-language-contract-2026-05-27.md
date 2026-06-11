# SHL-005 — Remove Orchestration Language From Visible Shell

Date: `2026-05-27`
Status: `closed`
Classification: `new shell task`

---

## Canonical Decision

Nexus may keep orchestration engines, adapters, route keys, proof engines, runtime contracts, and QA utilities internally.

The visible shell cannot expose those internals as product language.

The user-facing experience must speak in product terms:

- creation
- build
- live preview
- product readiness
- release / sharing
- history
- next step

Not in orchestration terms:

- Loop
- Proof
- Timeline
- QA mode
- runtime internals
- orchestration
- handoff
- verification matrix
- route mechanics

---

## Preserve

- loop / proof / timeline engines
- execution adapters
- release readiness model
- QA opt-in navigation as a development aid
- artifact rendering
- continuity and restore behavior
- internal route keys and data attributes where needed for routing

---

## Remove From Visible UX

- English QA route labels
- `QA mode`
- `Loop`
- `Proof`
- `Timeline`
- visible `orchestration`
- visible `runtime`
- visible `handoff`
- visible verification-matrix framing
- visible internal shell contract labels

---

## Build

- Added a shared visible-shell copy sanitizer:
  - `web/nexus-ui/copy/visible-shell-language.js`
- Applied product-facing copy to:
  - QA navigation
  - topbar project labels
  - sidebar labels
  - buttons
  - task cards
  - artifact preview copy
- execution live screen
- next task screen
- state update screen
- proof result screen
- timeline history screen
- loop core screen
- live route fallback copy in `web/app.js`

---

## Verification

Passed:

```bash
node --test test/visible-shell-language-removal.test.js test/execution-live-screen-render.test.js test/next-task-screen-render.test.js test/state-update-screen-render.test.js test/proof-result-screen-render.test.js test/timeline-history-screen-render.test.js
node --test test/visible-shell-language-removal.test.js test/legacy-orchestration-first-ux-removal.test.js test/execution-live-screen-render.test.js test/next-task-screen-render.test.js test/state-update-screen-render.test.js test/proof-result-screen-render.test.js test/timeline-history-screen-render.test.js && node --check web/app.js && node --check web/nexus-ui/copy/visible-shell-language.js
```

The guard test checks rendered visible text, not internal HTML classes or data attributes.

Live check:

```txt
http://127.0.0.1:4011/loop?qa=1
banned visible strings: []
```

---

## Closure Rule

`SHL-005` is closed only for visible shell language.

Internal code, route keys, filenames, adapters, data attributes, and tests may still use legacy technical names while preserved engines are still being bridged into the new shell.

Canonical law:

```txt
The visible product speaks Nexus product language.
The internal system may keep orchestration machinery hidden.
```
