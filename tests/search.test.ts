import { describe, expect, it } from "vitest";
import { rememberDecision } from "../src/core/memory.js";
import { indexLocalNucleo } from "../src/core/indexer.js";
import { searchIcons } from "../src/core/search.js";
import { createFixtureLibrary, createTempProject } from "./helpers.js";

describe("searchIcons", () => {
  it("finds the best semantic match", async () => {
    const fixturePath = await createFixtureLibrary();
    const icons = await indexLocalNucleo(fixturePath);
    const [result] = await searchIcons(icons, "settings", { limit: 1 });

    expect(result.name).toBe("settings");
    expect(result.reasons).toContain("name match");
  });

  it("biases toward remembered project decisions", async () => {
    const fixturePath = await createFixtureLibrary();
    const icons = await indexLocalNucleo(fixturePath);
    const projectPath = await createTempProject({
      name: "demo-app",
      dependencies: {
        "nucleo-ui-outline-18": "^1.0.0"
      }
    });

    await rememberDecision(projectPath, {
      key: "ui:sliders:tsx",
      iconId: "local:2",
      iconName: "sliders",
      format: "tsx",
      customization: {},
      rationale: "Existing settings surface uses sliders",
      createdAt: new Date().toISOString()
    });

    const results = await searchIcons(icons, "controls", { limit: 2 }, projectPath);
    expect(results[0].name).toBe("sliders");
  });
});
