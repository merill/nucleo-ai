import { access, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { DoctorReport, PackageDetection } from "./types.js";
import { getCacheDir, readCache } from "./cache.js";
import { KNOWN_NUCLEO_PACKAGES } from "./constants.js";
import { readJsonFile } from "./utils.js";

interface NucleoLocation {
  nucleoPath?: string;
  sqlitePath?: string;
  svgDir?: string;
}

async function exists(targetPath: string | undefined): Promise<boolean> {
  if (!targetPath) {
    return false;
  }

  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function detectNucleoLocation(explicitPath?: string): Promise<NucleoLocation> {
  const candidates = [
    explicitPath,
    process.env.NUCLEO_LIBRARY_PATH,
    await readJsonFile<string>(path.join(os.homedir(), "Library", "Application Support", "Nucleo", "storage", "dataPath.json")),
    path.join(os.homedir(), "Library", "Application Support", "Nucleo", "icons")
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const sqlitePath = path.join(candidate, "data.sqlite3");
    const svgDir = path.join(candidate, "sets");
    if (await exists(sqlitePath) || await exists(svgDir)) {
      return {
        nucleoPath: candidate,
        sqlitePath: (await exists(sqlitePath)) ? sqlitePath : undefined,
        svgDir: (await exists(svgDir)) ? svgDir : undefined
      };
    }
  }

  return {};
}

export async function findNearestPackageJson(startPath: string): Promise<string | undefined> {
  let currentPath = path.resolve(startPath);

  while (true) {
    const packageJsonPath = path.join(currentPath, "package.json");
    if (await exists(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      return undefined;
    }
    currentPath = parentPath;
  }
}

export async function detectPackages(startPath: string): Promise<PackageDetection> {
  const packageJsonPath = await findNearestPackageJson(startPath);
  if (!packageJsonPath) {
    return {
      dependencies: [],
      installedNucleoPackages: []
    };
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  const dependencies = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {})
  ].sort();

  const installedNucleoPackages = dependencies.filter((dependency) =>
    KNOWN_NUCLEO_PACKAGES.includes(dependency as (typeof KNOWN_NUCLEO_PACKAGES)[number])
  );

  return {
    packageJsonPath,
    dependencies,
    installedNucleoPackages
  };
}

export async function createDoctorReport(cwd: string, explicitPath?: string): Promise<DoctorReport> {
  const location = await detectNucleoLocation(explicitPath);
  const cache = await readCache();
  const packageDetection = await detectPackages(cwd);

  return {
    cwd,
    nucleoPath: location.nucleoPath,
    sqlitePath: location.sqlitePath,
    svgDir: location.svgDir,
    cachePath: getCacheDir(),
    configPath: path.join(os.homedir(), ".config", "nucleo-ai", "config.json"),
    hasLicenseKey: Boolean(process.env.NUCLEO_LICENSE_KEY),
    packageDetection,
    indexed: Boolean(cache),
    iconCount: cache?.summary.count
  };
}
