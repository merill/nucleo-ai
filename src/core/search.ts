import type { IconRecord, SearchFilters, SearchResult } from "./types.js";
import Fuse from "fuse.js";
import { loadProjectMemory } from "./memory.js";
import { inspectProject } from "./project.js";
import { normalizeText } from "./utils.js";

function computeReasons(icon: IconRecord, query: string, projectProfile: Awaited<ReturnType<typeof inspectProject>>): string[] {
  const normalizedQuery = normalizeText(query);
  const reasons: string[] = [];

  if (normalizeText(icon.name).includes(normalizedQuery)) {
    reasons.push("name match");
  }
  if (icon.tags.some((tag) => normalizeText(tag).includes(normalizedQuery))) {
    reasons.push("tag match");
  }
  if (projectProfile.preferredFamily && projectProfile.preferredFamily === icon.family) {
    reasons.push("matches project family");
  }
  if (projectProfile.preferredStyle && projectProfile.preferredStyle === icon.style) {
    reasons.push("matches project style");
  }
  if ((icon.family === "ui" && icon.size === 18) || (icon.family === "core" && [24, 32].includes(icon.size))) {
    reasons.push("fits SaaS defaults");
  }

  return reasons;
}

function applyFilters(icons: IconRecord[], filters: SearchFilters): IconRecord[] {
  return icons.filter((icon) => {
    if (filters.family && icon.family !== filters.family) {
      return false;
    }
    if (filters.style && icon.style !== filters.style) {
      return false;
    }
    if (filters.size && icon.size !== filters.size) {
      return false;
    }
    return true;
  });
}

export async function searchIcons(
  icons: IconRecord[],
  query: string,
  filters: SearchFilters = {},
  projectPath?: string
): Promise<SearchResult[]> {
  const filteredIcons = applyFilters(icons, filters);
  const projectProfile = await inspectProject(projectPath);
  const projectMemory = projectPath ? await loadProjectMemory(projectPath) : undefined;

  const fuse = new Fuse(filteredIcons, {
    includeScore: true,
    threshold: 0.35,
    keys: [
      { name: "name", weight: 0.5 },
      { name: "tags", weight: 0.25 },
      { name: "keywords", weight: 0.25 }
    ]
  });

  const results = query.trim()
    ? fuse.search(query).map((result) => ({ icon: result.item, score: result.score ?? 0.99 }))
    : filteredIcons.map((icon) => ({ icon, score: 0.8 }));

  const scored = results.map(({ icon, score }) => {
    let finalScore = 1 - score;
    if (projectProfile.preferredFamily && icon.family === projectProfile.preferredFamily) {
      finalScore += 0.08;
    }
    if (projectProfile.preferredStyle && icon.style === projectProfile.preferredStyle) {
      finalScore += 0.05;
    }
    if (projectMemory?.decisions.some((decision) => decision.iconId === icon.id || decision.iconName === icon.name)) {
      finalScore += 0.2;
    } else if (projectMemory?.decisions.some((decision) => decision.key.startsWith(`${icon.family}:`))) {
      finalScore += 0.06;
    }
    if (icon.family === "ui" && icon.size === 18) {
      finalScore += 0.04;
    }
    if (icon.family === "core" && [24, 32].includes(icon.size)) {
      finalScore += 0.03;
    }

    return {
      ...icon,
      score: Number(finalScore.toFixed(4)),
      reasons: computeReasons(icon, query, projectProfile),
      importStrategy: icon.packageName && projectProfile.installedPackages.includes(icon.packageName) ? "package" : "local"
    } satisfies SearchResult;
  });

  return scored
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, filters.limit ?? 12);
}

export function findExactIcon(icons: IconRecord[], query: string): IconRecord | undefined {
  const normalizedQuery = normalizeText(query);
  return icons.find((icon) =>
    normalizeText(icon.id) === normalizedQuery ||
    normalizeText(icon.name) === normalizedQuery ||
    normalizeText(icon.filename) === normalizedQuery
  );
}
