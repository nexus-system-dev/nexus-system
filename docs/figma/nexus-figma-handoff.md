# Nexus Figma Handoff

Approved source export:

- `/Users/yogevlavian/Desktop/The Nexus/figma-make-export/`

This handoff is the visual source of truth for the new `web/nexus-ui/`
frontend layer. It is not a production-ready app and must not be merged
wholesale into the current Nexus runtime.

Initial integration rules:

1. Extract tokens and base styles first.
2. Reuse only `src/app/components/nexus/*` as shared component sources.
3. Rebuild screen containers with real Nexus runtime data.
4. Implement the primary loop before support and advanced screens.
