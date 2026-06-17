# CLI Workflow

Use `nucleo-icons` whenever an agent needs a machine-readable way to search, compare, customize, or install Nucleo icons.

## Default sequence

1. Run `nucleo-icons doctor --json` to confirm the local Nucleo library, cache, package.json detection, and `NUCLEO_LICENSE_KEY`.
2. Run `nucleo-icons search "<intent>" --json` for a broad pass.
3. Run `nucleo-icons suggest "<intent>" --usage <kind> --project <path> --json` when the project context matters.
4. Run `nucleo-icons variants "<icon>" --json` when you need to compare styles or sizes for the same metaphor.
5. Run `nucleo-icons react "<icon>" --project <path> --json` for React import guidance.
6. Run `nucleo-icons install "<icon>" ... --remember` once you have made a decision.

## Command contracts

`doctor --json`
- Returns the detected Nucleo path, SQLite path, SVG path, cache path, config path, package detection, and whether a license key is present.

`search "<query>" --json`
- Returns ranked `SearchResult[]` records with `score`, `reasons`, `packageName`, `componentName`, and `importStrategy`.

`suggest "<intent>" --usage <kind> --project <path> --json`
- Returns ranked `SuggestionResult[]` records with a short `rationale`.

`react "<icon>" --project <path> --json`
- Returns `ReactUsageRecommendation`, including package import guidance, install command, support notes, and fallback mode.

`install "<icon>" --out <path> --format svg|tsx|react-import`
- Writes the chosen asset or wrapper to disk and can remember the decision in project memory.

`memory list|get|forget --project <path> --json`
- Reads or updates `.nucleo-icons/project.json`.

## Output expectations

- Treat JSON as the primary interface.
- Prefer exact `id` values for follow-up operations after a search.
- Re-run `index` when the Nucleo library changed and results look stale.
