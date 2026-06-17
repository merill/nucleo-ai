import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createFixtureLibrary } from "./helpers.js";

function runCli(args: string[], env: NodeJS.ProcessEnv) {
  return spawnSync("node", ["--import", "tsx", "src/cli.ts", ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env
    },
    encoding: "utf8"
  });
}

describe("cli", () => {
  it("prints JSON for doctor and search", async () => {
    const fixturePath = await createFixtureLibrary();
    const home = await mkdtemp(path.join(os.tmpdir(), "nucleo-ai-home-"));
    const doctor = runCli(["doctor", "--json", "--path", fixturePath], { HOME: home });
    expect(doctor.status).toBe(0);
    expect(JSON.parse(doctor.stdout).svgDir).toContain("sets");

    const indexed = runCli(["index", "--source", "local", "--path", fixturePath], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });
    expect(indexed.status).toBe(0);

    const search = runCli(["search", "settings", "--json"], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });
    expect(search.status).toBe(0);
    const parsed = JSON.parse(search.stdout);
    expect(parsed[0].name).toBe("settings");
  });

  it("writes preview and memory output", async () => {
    const fixturePath = await createFixtureLibrary();
    const home = await mkdtemp(path.join(os.tmpdir(), "nucleo-ai-home-"));
    const projectPath = await mkdtemp(path.join(os.tmpdir(), "nucleo-ai-project-"));
    await writeFile(path.join(projectPath, "package.json"), JSON.stringify({ name: "app" }), "utf8");
    runCli(["index", "--source", "local", "--path", fixturePath], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });

    const previewOut = path.join(projectPath, "preview.html");
    const preview = runCli(["preview", "--ids", "local:1,local:2", "--out", previewOut], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });
    expect(preview.status).toBe(0);
    expect(JSON.parse(preview.stdout).count).toBe(2);

    const installOut = path.join(projectPath, "icons", "settings.svg");
    const install = runCli(["install", "settings", "--out", installOut, "--project", projectPath, "--remember"], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });
    expect(install.status).toBe(0);

    const memory = runCli(["memory", "list", "--project", projectPath], { HOME: home, NUCLEO_LIBRARY_PATH: fixturePath });
    expect(memory.status).toBe(0);
    expect(JSON.parse(memory.stdout).decisions).toHaveLength(1);
  });
});
