import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import fg from "fast-glob";

export async function createFixtureLibrary(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "nucleo-ai-fixture-"));
  const iconsRoot = path.join(root, "icons");
  const setsRoot = path.join(iconsRoot, "sets");
  await mkdir(setsRoot, { recursive: true });

  const sql = await readFile(path.join(process.cwd(), "fixtures", "icons.sql"), "utf8");
  const db = new Database(path.join(iconsRoot, "data.sqlite3"));
  db.exec(sql);
  db.close();

  const files = await fg("fixtures/icons/sets/**/*.svg", { cwd: process.cwd(), absolute: true });
  for (const sourcePath of files) {
    const relativePath = path.relative(path.join(process.cwd(), "fixtures", "icons"), sourcePath);
    const targetPath = path.join(iconsRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, await readFile(sourcePath, "utf8"), "utf8");
  }

  return iconsRoot;
}

export async function createTempProject(packageJson: Record<string, unknown>): Promise<string> {
  const projectPath = await mkdtemp(path.join(os.tmpdir(), "nucleo-ai-project-"));
  await writeFile(path.join(projectPath, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  return projectPath;
}
