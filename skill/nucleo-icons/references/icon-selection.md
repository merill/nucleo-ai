# SaaS Icon Selection

Use these heuristics when choosing among plausible matches:

- Prefer `ui` outline `18px` for dense SaaS navigation, toolbars, settings rows, tables, and compact controls.
- Prefer `core` `24px` or `32px` for empty states, onboarding, feature surfaces, and larger product illustrations.
- Keep one family/style per product area unless the codebase already mixes families intentionally.
- Prefer familiar metaphors over clever ones. A gear usually beats an abstract settings glyph.
- Favor icons with fewer strokes and clearer silhouettes for repeated UI use.
- For billing or payments, prefer the `credit-cards` family or strong card/payment metaphors.
- For analytics, reporting, dashboards, and metrics, bias toward clear chart or trend metaphors instead of decorative data shapes.
- When a project already uses a Nucleo package or remembered icon decisions, keep matching that direction unless the user explicitly asks for a visual reset.

## React-specific choices

- For interactive controls, default to decorative icons with `aria-hidden`.
- For standalone labels, status indicators, or meaning-bearing icons, add `title` or `aria-label`.
- Prefer package imports for apps already using Nucleo React packages; prefer local TSX/SVG when exact package mapping is uncertain or the repo avoids package-level icon dependencies.
