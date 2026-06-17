import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { IconFamily, IconStyle } from "./types.js";
import { detectPackages } from "./discovery.js";
import { loadProjectMemory } from "./memory.js";

export interface ProjectStyleProfile {
  preferredFamily?: IconFamily;
  preferredStyle?: IconStyle;
  installedPackages: string[];
  rememberedKeys: string[];
}

export async function inspectProject(projectPath?: string): Promise<ProjectStyleProfile> {
  if (!projectPath) {
    return {
      installedPackages: [],
      rememberedKeys: []
    };
  }

  const packageDetection = await detectPackages(projectPath);
  const memory = await loadProjectMemory(projectPath);

  const sourceFiles = await fg(["**/*.{ts,tsx,js,jsx,svg}"], {
    cwd: projectPath,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
  });

  const familyCounts = new Map<IconFamily, number>();
  const styleCounts = new Map<IconStyle, number>();

  for (const decision of memory.decisions) {
    const family = decision.key.split(":")[0] as IconFamily;
    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
  }

  for (const filePath of sourceFiles.slice(0, 100)) {
    const contents = await readFile(filePath, "utf8");
    if (contents.includes("nucleo-ui")) {
      familyCounts.set("ui", (familyCounts.get("ui") ?? 0) + 2);
    }
    if (contents.includes("nucleo-core")) {
      familyCounts.set("core", (familyCounts.get("core") ?? 0) + 2);
    }
    if (contents.includes("Outline")) {
      styleCounts.set("outline", (styleCounts.get("outline") ?? 0) + 1);
    }
    if (contents.includes("Fill")) {
      styleCounts.set("fill", (styleCounts.get("fill") ?? 0) + 1);
    }
  }

  const preferredFamily = [...familyCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
  const preferredStyle = [...styleCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];

  return {
    preferredFamily,
    preferredStyle,
    installedPackages: packageDetection.installedNucleoPackages,
    rememberedKeys: memory.decisions.map((decision) => decision.key)
  };
}

export function normalizeProjectPath(projectPath?: string): string | undefined {
  return projectPath ? path.resolve(projectPath) : undefined;
}
