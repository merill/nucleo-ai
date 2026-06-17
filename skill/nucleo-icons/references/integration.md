# Integration Patterns

## React and Next.js

- Prefer `nucleo-icons react "<icon>" --project <path> --json` before writing JSX by hand.
- When the exact package is installed, use the recommended import statement from the CLI.
- When the package is missing or uncertain, generate a local TSX component with `install --format tsx`.

## Tailwind CSS

- Use `size-*` for sizing.
- Use text color utilities for primary color.
- Use attribute selectors for secondary color targets, for example: `**:data-[color="color-2"]:text-[red]`.
- For Glass icons, use CSS custom property utilities such as `[--nc-gradient-1-color-1:#575757]`.

## Local asset mode

- Use `install --format svg` for static asset pipelines or non-React consumers.
- Use `install --format tsx` for local React components that should not depend on Nucleo packages.
- Use `install --format react-import` when the app already uses Nucleo React packages and you want a small wrapper component with the chosen accessibility defaults.

## Memory

- Store stable decisions in `.nucleo-icons/project.json`.
- Reuse remembered icons for repeated surfaces such as navigation, settings, filters, and billing actions unless a redesign is requested.
