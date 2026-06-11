# Design Plugin Layer Contract — 2026-06-01

## Canonical Status

This document defines the Design Plugin Layer required by `VSKEL-001` and `VBUILD-001`.

Design Plugins are not product truth. They are visual language providers that help Nexus render product truth beautifully and specifically.

Canonical law:

`Design Plugin affects how the product looks and feels. It does not decide what the product is.`

## Purpose

The Design Plugin Layer lets Nexus choose or apply a visual system that fits the user's product, audience, and preference.

Nexus must not always use the same internal robotic look.

Users eat with their eyes. The first visible product should create trust, interest, and a real sense that the product is taking shape.

## Registry Requirement

Nexus V1 needs a simple Design Plugin Registry, not a full marketplace.

The registry tracks:
- plugin id
- plugin name
- when to use it
- when not to use it
- supported product types
- active/experimental status
- internal Nexus / Figma / design system / user brand kit source
- V1 or post-release scope

Future versions may support a marketplace, team-provided brand kits, component packs, design agents, and user-added design systems. V1 only needs the canonical registry and first built-in plugins.

## Required Plugin Output

Every Design Plugin must return:
- style name
- when to use
- when not to use
- colors
- typography
- spacing
- card shape
- button shape
- light/dark guidance
- Hebrew and RTL support
- sample regions
- anti-clutter rules
- anti-generic-design rules
- desired wow level
- product-type fit
- audience fit

The output styles the skeleton. It must not replace product understanding or Product Graph truth.

## First Built-In Plugins For V1

V1 must define at least:

- `minimal-saas`
  - clean B2B, CRM, dashboards only when needed, simple tools
- `premium-brand`
  - luxury/lifestyle/beauty/fashion/gifts
- `startup-landing`
  - SaaS landing, AI products, acquisition pages
- `mobile-app`
  - mobile flows, fast actions, tabs, onboarding
- `internal-tool`
  - back office, operations, tables, workflows, tasks
- `ecommerce`
  - catalog, product page, cart, checkout, inventory
- `israeli-smb`
  - Hebrew, RTL, WhatsApp/phone/service, simple trust, local business feel
- `logistics-map`
  - delivery, routing, drivers, locations, statuses
- `ai-product`
  - AI products that do not collapse into generic chat UI

Additional post-release candidates:
- `creator-portfolio`
- `dark-pro-app`
- `playful-consumer`
- `luxury-editorial`
- `dashboard-only-when-needed`

## Design Plugin Selection

The user may choose a plugin or style preference directly:
- `make it premium`
- `make it a clean B2B tool`
- `make it young and colorful`
- `make it a serious internal system`
- `make it Israeli and simple`

If the user does not choose, Nexus may recommend a plugin based on the product.

Nexus should explain the choice briefly. It must not open a heavy design settings flow before first skeleton.

## User Design Preference / Brand Input

Nexus must support a path for user-provided design preference:
- short style instruction
- inspiration/reference
- uploaded brand kit
- Figma connection
- existing design system

For V1, this may be minimal and bounded. The chosen or inferred design input must be visible in the Visual Product Skeleton Agent output.

## Figma Boundary

Figma may act as:
- design plugin source
- design system source
- brand/design reference source
- deeper post-skeleton design workflow

Figma is not required for every first skeleton.

Default V1 first skeleton should render directly in Nexus Build using a selected Design Plugin.

## Prohibitions

Nexus must not:
- always use the same design
- rely only on robotic internal Nexus styling
- display dashboard for every product
- choose design unrelated to the product
- create fake wow that does not serve the product
- let a Design Plugin replace Product Graph
- let design invent product truth
- let an external plugin become source of truth
- build a marketplace before V1 is strong
- create plugin hell

## Live Proof

The Design Plugin Layer is not trueGreen until live proof shows two different products selecting different design plugins and producing visibly different, product-appropriate first skeletons.

Required proof:
- selected plugin recorded
- plugin reason recorded
- visual output reflects plugin rules
- same product input with changed user preference can change style without changing product truth
- Design Plugin does not invent product scope

