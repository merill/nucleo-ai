# nucleo-ai

`nucleo-ai` is a TypeScript CLI and bundled Codex skill for searching, ranking, customizing, and integrating Nucleo icons in SaaS apps, web apps, and React projects.

## What it ships

- A CLI exposed as `nucleo-icons`
- A bundled skill at `skill/nucleo-icons`
- Release artifacts for npm and skill submission

## Local development

```bash
npm install
npm run check
npm run test
npm run build
```

## Core commands

```bash
npx nucleo-icons doctor --json
npx nucleo-icons index --source local --path "$HOME/Library/Application Support/Nucleo/icons"
npx nucleo-icons search "settings" --json
npx nucleo-icons suggest "billing settings" --usage settings --project /path/to/app --json
npx nucleo-icons react "settings" --project /path/to/app --json
npx nucleo-icons install "settings" --out ./icons/SettingsIcon.tsx --format tsx --remember
```

## React package guidance

The skill and CLI encode official guidance from [Nucleo React Packages](https://nucleoapp.com/react-packages):

- Detect installed Nucleo React packages from `package.json`
- Recommend exact package imports when the family, style, and size are reliable
- Fall back to local TSX or SVG when package guidance is uncertain
- Account for `NUCLEO_LICENSE_KEY` on premium package installs and CI

## Packaging

Build release artifacts locally:

```bash
npm run package:release
```

This produces:

- `artifacts/nucleo-ai-<version>.tgz` for npm/package verification
- `artifacts/nucleo-icons-skill.tgz`
- `artifacts/nucleo-icons-skill.zip`

## GitHub Actions

- `.github/workflows/ci.yml` runs typecheck, tests, build, skill validation, and artifact packaging on pushes and pull requests.
- `.github/workflows/release.yml` builds artifacts and publishes to npm on tags like `v0.1.0` or on GitHub Release publish events.

To publish to npm from GitHub Actions, add an `NPM_TOKEN` repository secret.

## Skill submission

Use the generated `artifacts/nucleo-icons-skill.zip` or `artifacts/nucleo-icons-skill.tgz` when submitting the skill to external skill repositories or marketplaces. The bundle includes:

- `SKILL.md`
- `agents/openai.yaml`
- `references/*.md`
