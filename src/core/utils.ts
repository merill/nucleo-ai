import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-");
}

export function pascalCase(value: string): string {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await readFile(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(targetPath: string): Promise<T | undefined> {
  try {
    const contents = await readFile(targetPath, "utf8");
    return JSON.parse(contents) as T;
  } catch {
    return undefined;
  }
}

export async function writeJsonFile(targetPath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function parseCsvList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
