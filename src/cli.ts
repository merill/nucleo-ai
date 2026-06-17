#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { readCache } from "./core/cache.js";
import { EXIT_CODES } from "./core/constants.js";
import { createDoctorReport } from "./core/discovery.js";
import { buildIndex } from "./core/indexer.js";
import { rememberDecision, forgetDecision, loadProjectMemory } from "./core/memory.js";
import { printJson, validateSearchResults, validateSuggestionResults } from "./core/output.js";
import { normalizeProjectPath } from "./core/project.js";
import { recommendReactUsage } from "./core/react.js";
import { findExactIcon, searchIcons } from "./core/search.js";
import { suggestIcons } from "./core/suggest.js";
import type { CustomizationSpec, IconRecord } from "./core/types.js";
import { customizeSvg, svgToTsx } from "./core/svg.js";
import { pascalCase } from "./core/utils.js";

async function ensureIcons(): Promise<IconRecord[]> {
  const cache = await readCache();
  if (cache) {
    return cache.icons;
  }

  const { icons } = await buildIndex({ source: "local" });
  return icons;
}

function buildCustomizationSpec(options: Record<string, unknown>): CustomizationSpec {
  return {
    size: typeof options.size === "number" ? options.size : undefined,
    color: typeof options.color === "string" ? options.color : undefined,
    secondaryColor: typeof options.secondaryColor === "string" ? options.secondaryColor : undefined,
    strokeWidth: typeof options.strokeWidth === "number" ? options.strokeWidth : undefined,
    corners: options.corners === "round" ? "round" : options.corners === "square" ? "square" : undefined,
    padding: typeof options.padding === "number" ? options.padding : undefined,
    rotate: typeof options.rotate === "number" ? options.rotate : undefined,
    title: typeof options.title === "string" ? options.title : undefined,
    ariaLabel: typeof options.ariaLabel === "string" ? options.ariaLabel : undefined,
    decorative: Boolean(options.decorative)
  };
}

async function resolveIcon(query: string, projectPath?: string): Promise<IconRecord> {
  const icons = await ensureIcons();
  const exact = findExactIcon(icons, query);
  if (exact) {
    return exact;
  }

  const results = await searchIcons(icons, query, { limit: 1 }, projectPath);
  const first = results[0];
  if (!first) {
    throw new Error(`No icon found for "${query}".`);
  }
  return first;
}

async function writeOutputFile(outPath: string, contents: string): Promise<string> {
  const resolved = path.resolve(outPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, contents, "utf8");
  return resolved;
}

const program = new Command();
program.name("nucleo-icons").description("Search, select, and integrate Nucleo icons.").version("0.1.0");

program
  .command("doctor")
  .option("--path <path>")
  .option("--json", "print JSON output", true)
  .action(async (options) => {
    const report = await createDoctorReport(process.cwd(), options.path);
    printJson(report);
  });

program
  .command("index")
  .option("--source <source>", "local|svg-dir|nucleo-json", "local")
  .option("--path <path>")
  .option("--json", "print JSON output", true)
  .action(async (options) => {
    const result = await buildIndex({ source: options.source, path: options.path });
    printJson(result.summary);
  });

program
  .command("search")
  .argument("<query>")
  .option("--family <family>")
  .option("--style <style>")
  .option("--size <size>", "filter by icon size", Number)
  .option("--limit <limit>", "maximum results", Number)
  .option("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (query, options) => {
    const icons = await ensureIcons();
    const results = await searchIcons(icons, query, {
      family: options.family,
      style: options.style,
      size: options.size,
      limit: options.limit
    }, normalizeProjectPath(options.project));
    printJson(validateSearchResults(results));
  });

program
  .command("suggest")
  .argument("<intent>")
  .requiredOption("--usage <usage>")
  .option("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (intent, options) => {
    const icons = await ensureIcons();
    const results = await suggestIcons(icons, intent, {
      projectPath: normalizeProjectPath(options.project),
      usage: options.usage
    });
    printJson(validateSuggestionResults(results));
  });

program
  .command("variants")
  .argument("<query>")
  .option("--json", "print JSON output", true)
  .action(async (query) => {
    const icons = await ensureIcons();
    const icon = await resolveIcon(query);
    const variants = icons
      .filter((candidate) => candidate.name === icon.name || candidate.filename === icon.filename)
      .sort((left, right) => left.family.localeCompare(right.family) || left.size - right.size);
    printJson(variants);
  });

program
  .command("preview")
  .requiredOption("--ids <ids>")
  .requiredOption("--out <path>")
  .action(async (options) => {
    const icons = await ensureIcons();
    const selected = options.ids.split(",").map((id: string) => id.trim()).filter(Boolean);
    const resolvedIcons = icons.filter((icon) => selected.includes(icon.id) || selected.includes(String(icon.numericId)));
    if (resolvedIcons.length === 0) {
      process.exitCode = EXIT_CODES.notFound;
      throw new Error("No icons matched the requested preview IDs.");
    }
    const svgBlocks = await Promise.all(resolvedIcons.map(async (icon) => {
      const svg = await readFile(icon.svgPath, "utf8");
      return `<article><div>${svg}</div><h2>${icon.name}</h2><p>${icon.family} ${icon.style} ${icon.size}px</p></article>`;
    }));
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Nucleo Icon Preview</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; background: #f7f7f5; color: #111827; }
      main { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
      article { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
      article div { height: 96px; display: grid; place-items: center; }
      svg { width: 48px; height: 48px; }
      h2 { font-size: 14px; margin: 0 0 8px; }
      p { font-size: 12px; color: #6b7280; margin: 0; }
    </style>
  </head>
  <body>
    <main>${svgBlocks.join("")}</main>
  </body>
</html>
`;
    const written = await writeOutputFile(options.out, html);
    printJson({ outPath: written, count: resolvedIcons.length });
  });

program
  .command("react")
  .argument("<query>")
  .option("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (query, options) => {
    const icon = await resolveIcon(query, normalizeProjectPath(options.project));
    const recommendation = await recommendReactUsage(icon, normalizeProjectPath(options.project));
    printJson(recommendation);
  });

program
  .command("install")
  .argument("<query>")
  .requiredOption("--out <path>")
  .option("--project <path>")
  .option("--format <format>", "svg|tsx|react-import", "svg")
  .option("--name <name>")
  .option("--remember", "persist the decision in project memory")
  .option("--size <size>", "set the output size", Number)
  .option("--color <color>")
  .option("--secondary-color <secondaryColor>")
  .option("--stroke-width <strokeWidth>", "override stroke width", Number)
  .option("--corners <corners>")
  .option("--padding <padding>", "expand the viewBox by this amount", Number)
  .option("--rotate <rotate>", "rotate the icon in degrees", Number)
  .option("--title <title>")
  .option("--aria-label <ariaLabel>")
  .option("--decorative", "mark the output as decorative")
  .action(async (query, options) => {
    const projectPath = normalizeProjectPath(options.project);
    const icon = await resolveIcon(query, projectPath);
    const spec = buildCustomizationSpec(options);
    const componentName = options.name ? pascalCase(options.name) : icon.componentName ?? `Icon${pascalCase(icon.name)}`;

    let contents: string;
    if (options.format === "tsx") {
      contents = await svgToTsx(icon, spec, componentName);
    } else if (options.format === "react-import") {
      const recommendation = await recommendReactUsage(icon, projectPath);
      if (!recommendation.packageName || !recommendation.componentName || !recommendation.importStatement) {
        contents = await svgToTsx(icon, spec, componentName);
      } else {
        const accessibilityProp = spec.decorative ? "aria-hidden={true}" : spec.ariaLabel ? `aria-label="${spec.ariaLabel}"` : `title="${spec.title ?? icon.name}"`;
        contents = `${recommendation.importStatement}
import type { ComponentProps } from "react";

export function ${componentName}(props: ComponentProps<typeof ${recommendation.componentName}>) {
  return <${recommendation.componentName} ${accessibilityProp} {...props} />;
}
`;
      }
    } else {
      contents = await customizeSvg(icon, spec);
    }

    const outPath = await writeOutputFile(options.out, contents);

    if (options.remember && projectPath) {
      await rememberDecision(projectPath, {
        key: `${icon.family}:${icon.name}:${options.format}`,
        iconId: icon.id,
        iconName: icon.name,
        usage: undefined,
        outputPath: outPath,
        format: options.format,
        customization: spec,
        rationale: "Installed through nucleo-icons CLI",
        createdAt: new Date().toISOString()
      });
    }

    printJson({ outPath, icon, format: options.format });
  });

const memory = program.command("memory");

memory
  .command("list")
  .requiredOption("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (options) => {
    const projectPath = normalizeProjectPath(options.project)!;
    printJson(await loadProjectMemory(projectPath));
  });

memory
  .command("get")
  .argument("<key>")
  .requiredOption("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (key, options) => {
    const projectPath = normalizeProjectPath(options.project)!;
    const memoryState = await loadProjectMemory(projectPath);
    const decision = memoryState.decisions.find((entry) => entry.key === key || entry.iconId === key || entry.iconName === key);
    if (!decision) {
      process.exitCode = EXIT_CODES.notFound;
      throw new Error(`No remembered decision found for "${key}".`);
    }
    printJson(decision);
  });

memory
  .command("forget")
  .argument("<key>")
  .requiredOption("--project <path>")
  .option("--json", "print JSON output", true)
  .action(async (key, options) => {
    const projectPath = normalizeProjectPath(options.project)!;
    printJson(await forgetDecision(projectPath, key));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  if (!process.exitCode || process.exitCode === EXIT_CODES.ok) {
    process.exitCode = message.includes("No icon found") ? EXIT_CODES.notFound : EXIT_CODES.operationalFailure;
  }
});
