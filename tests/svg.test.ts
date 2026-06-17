import { describe, expect, it } from "vitest";
import { indexLocalNucleo } from "../src/core/indexer.js";
import { customizeSvg, svgToTsx } from "../src/core/svg.js";
import { createFixtureLibrary } from "./helpers.js";

describe("svg customization", () => {
  it("applies primary and secondary colors", async () => {
    const fixturePath = await createFixtureLibrary();
    const icons = await indexLocalNucleo(fixturePath);
    const icon = icons.find((entry) => entry.name === "chart bar");
    const svg = await customizeSvg(icon!, {
      color: "currentColor",
      secondaryColor: "#ef4444",
      title: "Chart icon"
    });

    expect(svg).toContain("currentColor");
    expect(svg).toContain("#ef4444");
    expect(svg).toContain("<title>Chart icon</title>");
  });

  it("emits TSX output", async () => {
    const fixturePath = await createFixtureLibrary();
    const icons = await indexLocalNucleo(fixturePath);
    const icon = icons.find((entry) => entry.name === "settings");
    const tsx = await svgToTsx(icon!, { decorative: true }, "SettingsIcon");

    expect(tsx).toContain("export function SettingsIcon");
    expect(tsx).toContain("SVGProps");
    expect(tsx).toContain("aria-hidden");
  });
});
