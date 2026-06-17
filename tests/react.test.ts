import { describe, expect, it } from "vitest";
import { indexLocalNucleo } from "../src/core/indexer.js";
import { recommendReactUsage } from "../src/core/react.js";
import { createFixtureLibrary, createTempProject } from "./helpers.js";

describe("recommendReactUsage", () => {
  it("prefers installed React packages when present", async () => {
    const fixturePath = await createFixtureLibrary();
    const projectPath = await createTempProject({
      name: "react-app",
      dependencies: {
        "nucleo-ui-outline-18": "^1.0.0"
      }
    });
    const icons = await indexLocalNucleo(fixturePath);
    const icon = icons.find((entry) => entry.name === "settings");
    const recommendation = await recommendReactUsage(icon!, projectPath);

    expect(recommendation.mode).toBe("package-import");
    expect(recommendation.installed).toBe(true);
    expect(recommendation.packageName).toBe("nucleo-ui-outline-18");
  });

  it("falls back to preview guidance without a license key", async () => {
    const fixturePath = await createFixtureLibrary();
    const projectPath = await createTempProject({ name: "react-app", dependencies: {} });
    const icons = await indexLocalNucleo(fixturePath);
    const icon = icons.find((entry) => entry.name === "settings");
    const recommendation = await recommendReactUsage(icon!, projectPath);

    expect(recommendation.packageName).toBe("nucleo-ui-outline-18");
    expect(recommendation.hasLicenseKey).toBe(false);
    expect(recommendation.notes.some((note) => note.includes("NUCLEO_LICENSE_KEY"))).toBe(true);
  });
});
