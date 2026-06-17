import { describe, expect, it } from "vitest";
import { indexLocalNucleo } from "../src/core/indexer.js";
import { createFixtureLibrary } from "./helpers.js";

describe("indexLocalNucleo", () => {
  it("indexes the fixture library and derives families and packages", async () => {
    const fixturePath = await createFixtureLibrary();
    const icons = await indexLocalNucleo(fixturePath);

    expect(icons).toHaveLength(5);
    expect(icons.find((icon) => icon.name === "settings")?.family).toBe("ui");
    expect(icons.find((icon) => icon.name === "chart bar")?.family).toBe("core");
    expect(icons.find((icon) => icon.name === "visa")?.family).toBe("credit-cards");
    expect(icons.find((icon) => icon.name === "settings")?.packageName).toBe("nucleo-ui-outline-18");
  });
});
