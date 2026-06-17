import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import Database from "better-sqlite3";
import type { IconFamily, IconRecord, IconStyle, IndexSource, IndexSummary } from "./types.js";
import { getCacheFilePath, writeCache } from "./cache.js";
import { CLASS_STYLE_MAP, GROUP_FAMILY_MAP, REACT_PACKAGE_GUIDANCE, SET_FAMILY_HINTS } from "./constants.js";
import { detectNucleoLocation } from "./discovery.js";
import { pascalCase, slugify, unique } from "./utils.js";

interface RawIconRow {
  id: number;
  name: string | null;
  filename: string | null;
  tags: string | null;
  nucleo_tags: string | null;
  klass: string | null;
  grid: number | null;
  width: number | null;
  height: number | null;
  size: number | null;
  set_id: number | null;
  set_title: string | null;
  group_title: string | null;
}

function deriveFamily(groupTitle: string | null, setTitle: string | null): IconFamily {
  if (groupTitle && GROUP_FAMILY_MAP[groupTitle]) {
    return GROUP_FAMILY_MAP[groupTitle];
  }

  if (setTitle) {
    for (const [pattern, family] of SET_FAMILY_HINTS) {
      if (pattern.test(setTitle)) {
        return family;
      }
    }
  }

  return "unknown";
}

function deriveStyle(klass: string | null): IconStyle {
  if (!klass) {
    return "unknown";
  }
  return CLASS_STYLE_MAP[klass] ?? "unknown";
}

function inferPackageName(family: IconFamily, style: IconStyle, size: number): string | undefined {
  const guidance = REACT_PACKAGE_GUIDANCE[family];
  if (!guidance) {
    return undefined;
  }

  const premium = guidance.premium as Record<string, string | undefined>;
  const preview = guidance.preview as Record<string, string | undefined>;
  const key = `${style}-${size}`;
  return premium[key] ?? preview[key] ?? premium.default ?? preview.default;
}

function inferComponentName(icon: Pick<IconRecord, "family" | "name" | "style" | "size">): string {
  const base = `Icon${pascalCase(icon.name)}`;
  if (icon.family === "core" || icon.family === "ui") {
    const styleSuffix =
      icon.style === "fill" ? "Fill"
        : icon.style === "outline" ? "Outline"
          : icon.style === "fill-duo" ? "FillDuo"
            : icon.style === "outline-duo" ? "OutlineDuo"
              : "";
    return `${base}${styleSuffix}${icon.size}`;
  }

  return base;
}

function buildKeywords(name: string, tags: string[], titles: Array<string | undefined>): string[] {
  return unique(
    [name, ...tags, ...titles.filter(Boolean) as string[]]
      .flatMap((value) => value.split(/[,\s/]+/))
      .map((value) => slugify(value))
      .filter(Boolean)
  );
}

function normalizeIconRecord(row: RawIconRow, svgDir: string, source: IndexSource): IconRecord {
  const family = deriveFamily(row.group_title, row.set_title);
  const style = deriveStyle(row.klass);
  const name = row.name ?? row.filename ?? `icon-${row.id}`;
  const filename = row.filename ?? name;
  const tags = unique(
    `${row.tags ?? ""},${row.nucleo_tags ?? ""}`
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  );
  const size = row.size ?? row.grid ?? row.width ?? 24;
  const icon: IconRecord = {
    id: `${source}:${row.id}`,
    numericId: row.id,
    source,
    name,
    filename,
    tags,
    family,
    style,
    size,
    grid: row.grid ?? size,
    width: row.width ?? size,
    height: row.height ?? size,
    setId: row.set_id ?? undefined,
    setTitle: row.set_title ?? undefined,
    groupTitle: row.group_title ?? undefined,
    svgPath: path.join(svgDir, `${row.set_id ?? 0}`, `${row.id}.svg`),
    keywords: []
  };
  icon.packageName = inferPackageName(icon.family, icon.style, icon.size);
  icon.componentName = inferComponentName(icon);
  icon.keywords = buildKeywords(icon.name, icon.tags, [icon.setTitle, icon.groupTitle, icon.family, icon.style]);
  return icon;
}

export async function indexLocalNucleo(explicitPath?: string): Promise<IconRecord[]> {
  const location = await detectNucleoLocation(explicitPath);
  if (!location.sqlitePath || !location.svgDir) {
    throw new Error("Unable to locate a Nucleo SQLite database and SVG directory.");
  }

  const database = new Database(location.sqlitePath, { readonly: true, fileMustExist: true });
  const query = database.prepare<[], RawIconRow>(`
    select
      i.id,
      i.name,
      i.filename,
      i.tags,
      i.nucleo_tags,
      i.klass,
      i.grid,
      i.width,
      i.height,
      i.size,
      i.set_id,
      s.title as set_title,
      g.title as group_title
    from icons i
    left join sets s on s.id = i.set_id
    left join groups g on g.id = s.group_id
  `);
  const rows = query.all();
  database.close();
  return rows.map((row) => normalizeIconRecord(row, location.svgDir!, "local"));
}

export async function indexSvgDirectory(svgDir: string): Promise<IconRecord[]> {
  const files = await fg("**/*.svg", { cwd: svgDir, absolute: true });
  return files.map((filePath, index) => {
    const filename = path.basename(filePath, ".svg");
    const name = filename.replace(/[-_]+/g, " ");
    const icon: IconRecord = {
      id: `svg-dir:${index + 1}`,
      numericId: index + 1,
      source: "svg-dir",
      name,
      filename,
      tags: [],
      family: "unknown",
      style: "unknown",
      size: 24,
      grid: 24,
      width: 24,
      height: 24,
      svgPath: filePath,
      keywords: buildKeywords(name, [], [])
    };
    icon.componentName = inferComponentName(icon);
    return icon;
  });
}

export async function indexJsonFile(jsonPath: string): Promise<IconRecord[]> {
  const parsed = JSON.parse(await readFile(jsonPath, "utf8")) as Array<Partial<IconRecord>>;
  return parsed.map((entry, index) => {
    const name = entry.name ?? entry.filename ?? `icon-${index + 1}`;
    const icon: IconRecord = {
      id: entry.id ?? `nucleo-json:${index + 1}`,
      numericId: entry.numericId ?? index + 1,
      source: "nucleo-json",
      name,
      filename: entry.filename ?? slugify(name),
      tags: entry.tags ?? [],
      family: entry.family ?? "unknown",
      style: entry.style ?? "unknown",
      size: entry.size ?? 24,
      grid: entry.grid ?? entry.size ?? 24,
      width: entry.width ?? entry.size ?? 24,
      height: entry.height ?? entry.size ?? 24,
      setId: entry.setId,
      setTitle: entry.setTitle,
      groupTitle: entry.groupTitle,
      packageName: entry.packageName,
      componentName: entry.componentName ?? inferComponentName({
        family: entry.family ?? "unknown",
        name,
        style: entry.style ?? "unknown",
        size: entry.size ?? 24
      }),
      svgPath: entry.svgPath ?? "",
      keywords: entry.keywords ?? buildKeywords(name, entry.tags ?? [], [entry.setTitle, entry.groupTitle])
    };
    return icon;
  });
}

export async function buildIndex(options: { source: IndexSource; path?: string }): Promise<{ icons: IconRecord[]; summary: IndexSummary }> {
  const icons =
    options.source === "local" ? await indexLocalNucleo(options.path)
      : options.source === "svg-dir" ? await indexSvgDirectory(options.path ?? "")
        : await indexJsonFile(options.path ?? "");

  const summary: IndexSummary = {
    source: options.source,
    cachePath: getCacheFilePath(),
    count: icons.length,
    generatedAt: new Date().toISOString()
  };

  await writeCache(summary, icons);
  return { icons, summary };
}
