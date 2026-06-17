import os from "node:os";
import path from "node:path";
import type { IconRecord, IndexSummary } from "./types.js";
import { readJsonFile, writeJsonFile } from "./utils.js";

interface CacheFile {
  summary: IndexSummary;
  icons: IconRecord[];
}

export function getCacheDir(): string {
  return path.join(os.homedir(), ".cache", "nucleo-agent-icons");
}

export function getCacheFilePath(): string {
  return path.join(getCacheDir(), "index.json");
}

export async function readCache(): Promise<CacheFile | undefined> {
  return readJsonFile<CacheFile>(getCacheFilePath());
}

export async function writeCache(summary: IndexSummary, icons: IconRecord[]): Promise<void> {
  await writeJsonFile(getCacheFilePath(), { summary, icons });
}
