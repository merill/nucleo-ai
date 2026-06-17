---
name: nucleo-icons
description: Search, compare, customize, and integrate Nucleo icons for SaaS applications, web apps, and React codebases. Use when Codex needs to choose the best Nucleo icon for a UI task, match an existing icon family or style, generate local SVG or TSX assets, recommend the correct Nucleo React package import, or remember prior icon decisions for a project.
---

# Nucleo Icons

## Overview

This skill turns Nucleo into a reliable agent workflow instead of a manual browse-and-guess exercise. Use the CLI as the source of truth for discovery, ranking, React package guidance, and remembered project decisions.

## Workflow

1. Run `nucleo-icons doctor --json` first.
   Confirm the local Nucleo library, cache, package detection, and `NUCLEO_LICENSE_KEY`.
2. Search broadly.
   Run `nucleo-icons search "<intent>" --json` to get the initial candidate list.
3. Add product context.
   Run `nucleo-icons suggest "<intent>" --usage <kind> --project <path> --json` for SaaS-aware ranking.
4. Compare variants when the metaphor is right but the treatment is unclear.
   Run `nucleo-icons variants "<icon>" --json`.
5. Decide between package import and local asset.
   Run `nucleo-icons react "<icon>" --project <path> --json` for React usage guidance.
6. Install the chosen result.
   Use `install --format svg|tsx|react-import` and `--remember` when the decision should bias future picks.

## Selection Rules

- Prefer `ui` outline `18px` for compact SaaS controls, navigation, filters, and settings.
- Prefer `core` `24px` or `32px` for empty states, product illustrations, and roomier surfaces.
- Match the project’s existing family and style whenever the codebase already has a direction.
- Use familiar metaphors first. A gear or sliders icon is usually stronger than a novel abstract symbol.
- Avoid mixing families inside the same UI zone unless the existing product already does that intentionally.

## React Guidance

- Read [references/react-packages.md](references/react-packages.md) before recommending package installs or imports.
- Prefer exact package imports only when the mapping is reliable or the project already uses that package.
- Fall back to local TSX or SVG output when package guidance is weak, when the repo avoids icon packages, or when license setup is missing.
- Preserve accessibility by choosing one of:
  - meaningful icon: `title` or `aria-label`
  - decorative icon: `aria-hidden={true}`

## References

- CLI contracts: [references/cli.md](references/cli.md)
- SaaS selection heuristics: [references/icon-selection.md](references/icon-selection.md)
- React package behavior: [references/react-packages.md](references/react-packages.md)
- Integration patterns: [references/integration.md](references/integration.md)
