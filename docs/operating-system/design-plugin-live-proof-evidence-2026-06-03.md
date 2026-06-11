# DESIGN-PLUG-004 — Design Plugin Live Proof Evidence

Date: 2026-06-03

Task: `DESIGN-PLUG-004`

Status: `trueGreen`

## Scope

This evidence closes the live proof bridge for the Design Plugin Layer.

It proves that the Build / Loop surface can receive a provider-composed Product Skeleton Agent output, resolve a product-appropriate design plugin, and render visible plugin proof in the live browser without claiming `VSKEL-001`.

## Preserved Truth

- `Product Skeleton Agent` remains the source of first product skeleton truth.
- `Design Plugin Layer` selects visual direction from the skeleton and optional user design preference.
- `Visual Product Skeleton Agent` remains open under `VSKEL-001`.
- No fixed dashboard, local fallback skeleton, or generic template is allowed to impersonate plugin output.

## Code Changes

- `web/nexus-ui/adapters/loop-adapter.js` now resolves the selected design plugin when provider-composed `productSkeletonAgentOutput` exists.
- `web/nexus-ui/screens/LoopCoreScreen.js` now renders a visible `DESIGN-PLUG-004` live proof card in the Build canvas.
- `web/nexus-ui/styles/screens.css` now styles plugin proof variants differently for work-tool and premium-brand products.
- `web/app.js` now preserves provider-composed `productSkeletonAgentOutput` through compact QA project snapshots so live browser proof can use real skeleton truth instead of falling back to the default preview project.
- `test/loop-core-screen-render.test.js` now covers live-proof model/rendering for lead-management and premium-gift skeletons.

## Live Browser Proof

Command:

```bash
node --input-type=module -e '<Playwright live proof script>'
```

Server:

```bash
PORT=4013 npm run dev
```

Result:

```json
{
  "lead": {
    "appScreen": "loop",
    "skeletonSource": "provider-composed",
    "pluginId": "israeli-smb",
    "pluginName": "Israeli SMB",
    "proofKind": "work-tool-lead-flow",
    "boundary": "plugin-live-proof-not-visual-agent-closure",
    "matchedBy": "product-or-preference-fit",
    "regions": ["today", "lead-list", "owner", "action"]
  },
  "gift": {
    "appScreen": "loop",
    "skeletonSource": "provider-composed",
    "pluginId": "premium-brand",
    "pluginName": "Premium Brand",
    "proofKind": "premium-commerce-brand",
    "boundary": "plugin-live-proof-not-visual-agent-closure",
    "matchedBy": "product-or-preference-fit",
    "regions": ["hero", "products", "embroidery", "cta"]
  },
  "differs": true,
  "requiredBoundaryHeld": true,
  "skeletonSourceHeld": true
}
```

## Verification

Passed:

```bash
node --check web/app.js
node --check web/nexus-ui/adapters/loop-adapter.js
node --check web/nexus-ui/screens/LoopCoreScreen.js
node --test test/loop-core-screen-render.test.js test/design-plugin-registry-contract.test.js test/design-plugin-built-ins.test.js test/design-plugin-user-preference.test.js
```

## Closure Boundary

This does not close `VSKEL-001`.

`DESIGN-PLUG-004` proves only that the selected plugin is visible, live, product-specific, and structurally different across products.

The next task must implement the live Visual Product Skeleton Agent that turns this design direction into the first visible product skeleton.
