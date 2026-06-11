# DESIGN-PLUG-002 Implementation Evidence — 2026-06-03

## Task

`DESIGN-PLUG-002 — First Built-In Design Plugins`

## Closure Scope

This closure defines the first built-in visual rules for the V1 Design Plugin Layer. It does not close user brand input, live visual proof, or the Visual Product Skeleton Agent.

## Built-In Plugins Defined

- `minimal-saas`
- `premium-brand`
- `startup-landing`
- `mobile-app`
- `internal-tool`
- `ecommerce`
- `israeli-smb`
- `logistics-map`
- `ai-product`

## What Each Plugin Now Carries

Each plugin now carries real visual rules:

- style name
- colors
- typography
- spacing
- card shape
- button shape
- light/dark guidance
- Hebrew / RTL support
- sample regions
- anti-clutter rules
- anti-generic-design rules
- desired wow level
- dashboard default policy

## Anti-Fake-Dashboard Boundary

The fallback plugin is `minimal-saas`, and its fallback policy explicitly says:

`Fallback must provide a clean first workflow surface, not a generic dashboard.`

Every built-in plugin sets `dashboardDefault: false`.

## Verification Evidence

- `test/design-plugin-built-ins.test.js`
  - proves all required V1 plugin ids exist
  - proves all required plugins have visual rules
  - proves lead-management resolves to `israeli-smb`
  - proves premium gifts resolves to `premium-brand`
  - proves those two products receive different visual rules
  - proves unknown products use a bounded `minimal-saas` fallback, not a generic dashboard

## Boundary Still Open

- `DESIGN-PLUG-003` still owns user design preference and brand input.
- `DESIGN-PLUG-004` still owns live proof that different products render visibly different product-appropriate first skeletons.
- `VSKEL-001` still owns the live Visual Product Skeleton Agent and first visible product screen.

