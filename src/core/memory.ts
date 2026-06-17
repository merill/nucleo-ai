import os from "node:os";
import path from "node:path";
import type { DecisionRecord, ProjectMemory } from "./types.js";
import { readJsonFile, writeJsonFile } from "./utils.js";

export function getProjectMemoryPath(projectPath: string): string {
  return path.join(projectPath, ".nucleo-icons", "project.json");
}

export function getGlobalConfigPath(): string {
  return path.join(os.homedir(), ".config", "nucleo-ai", "config.json");
}

export async function loadProjectMemory(projectPath: string): Promise<ProjectMemory> {
  const memoryPath = getProjectMemoryPath(projectPath);
  return (
    await readJsonFile<ProjectMemory>(memoryPath)
  ) ?? {
    projectPath,
    decisions: []
  };
}

export async function saveProjectMemory(projectPath: string, memory: ProjectMemory): Promise<void> {
  await writeJsonFile(getProjectMemoryPath(projectPath), memory);
}

export async function rememberDecision(projectPath: string, decision: DecisionRecord): Promise<ProjectMemory> {
  const memory = await loadProjectMemory(projectPath);
  const filtered = memory.decisions.filter((entry) => entry.key !== decision.key);
  filtered.unshift(decision);
  const updated = {
    projectPath,
    decisions: filtered.slice(0, 200)
  };
  await saveProjectMemory(projectPath, updated);
  return updated;
}

export async function forgetDecision(projectPath: string, key: string): Promise<ProjectMemory> {
  const memory = await loadProjectMemory(projectPath);
  const updated = {
    projectPath,
    decisions: key === "all" ? [] : memory.decisions.filter((entry) => entry.key !== key && entry.iconId !== key)
  };
  await saveProjectMemory(projectPath, updated);
  return updated;
}
