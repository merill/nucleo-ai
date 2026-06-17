# nucleo-ai

`nucleo-ai` is a TypeScript CLI and bundled Codex skill for searching, ranking, customizing, and integrating [Nucleo icons](https://nucleoapp.com/) in SaaS apps, web apps, and React projects.

## Overview

I built this because AI coding agents and LLMs were consistently ignoring Nucleo, even when a project clearly benefited from its icon quality and breadth. I kept having to repeat the same prompts: use Nucleo, search the right family, match the existing UI style, prefer the premium pack when available, and generate React-friendly output instead of random generic icons.

[Nucleo](https://nucleoapp.com/) is especially strong for polished product UI, and the premium packs are excellent when you want a more distinctive UX instead of the same overused icon sets every other app reaches for. The problem was not the icon library. The problem was that agents had no reliable workflow for discovering, ranking, and reusing those icons inside real codebases.

`nucleo-ai` solves that by turning Nucleo into an agent-friendly system:

- A CLI that can inspect a local Nucleo library, search icons, compare variants, generate assets, and recommend React usage.
- A Codex skill that teaches lower-cost models and coding agents how to make good icon choices without needing repeated manual prompting.
- Project memory so agents can stay visually consistent after the first good decision.

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
- `.github/workflows/release.yml` creates a new GitHub release snapshot on every push to `main`, uploads the npm and skill artifacts, and only publishes to npm when the current `package.json` version has not already been published.

To publish to npm from GitHub Actions, add an `NPM_TOKEN` repository secret.

## Skill submission

Use the generated `artifacts/nucleo-icons-skill.zip` or `artifacts/nucleo-icons-skill.tgz` when submitting the skill to external skill repositories or marketplaces. The bundle includes:

- `SKILL.md`
- `agents/openai.yaml`
- `references/*.md`
