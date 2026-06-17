import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { optimize } from "svgo";
import type { CustomizationSpec, IconRecord } from "./types.js";

function parseViewBox(viewBox: string | undefined): [number, number, number, number] {
  const parts = (viewBox ?? "0 0 24 24").split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return [0, 0, 24, 24];
  }
  return [parts[0], parts[1], parts[2], parts[3]];
}

function camelCaseSvgAttributes(svg: string): string {
  return svg
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/class=/g, "className=")
    .replace(/xmlns:xlink=/g, "xmlnsXlink=")
    .replace(/xlink:href=/g, "xlinkHref=");
}

export async function customizeSvg(icon: IconRecord, spec: CustomizationSpec): Promise<string> {
  const rawSvg = await readFile(icon.svgPath, "utf8");
  const $ = load(rawSvg, { xmlMode: true });
  const svg = $("svg").first();
  const [minX, minY, width, height] = parseViewBox(svg.attr("viewBox"));
  const padding = spec.padding ?? 0;
  const color = spec.color ?? "currentColor";

  svg.attr("viewBox", `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`);

  if (spec.size) {
    svg.attr("width", String(spec.size));
    svg.attr("height", String(spec.size));
  }

  svg.find("*").each((_, element) => {
    const node = $(element);
    const isSecondary = node.attr("data-color") === "color-2";
    const elementColor = isSecondary ? spec.secondaryColor ?? color : color;
    const fill = node.attr("fill");
    const stroke = node.attr("stroke");

    if (stroke && stroke !== "none" && !stroke.startsWith("url(")) {
      node.attr("stroke", elementColor);
    }
    if (fill && fill !== "none" && !fill.startsWith("url(")) {
      node.attr("fill", elementColor);
    }
    if (!fill && !stroke) {
      node.attr("fill", elementColor);
    }
    if (spec.strokeWidth && node.attr("stroke-width")) {
      node.attr("stroke-width", String(spec.strokeWidth));
    }
    if (spec.corners === "round") {
      if (node.attr("stroke-linecap")) {
        node.attr("stroke-linecap", "round");
      }
      if (node.attr("stroke-linejoin")) {
        node.attr("stroke-linejoin", "round");
      }
    }
  });

  if (spec.rotate) {
    const children = svg.children().toArray().map((child) => $.xml(child)).join("");
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    svg.empty().append(`<g transform="rotate(${spec.rotate} ${centerX} ${centerY})">${children}</g>`);
  }

  if (spec.title) {
    svg.prepend(`<title>${spec.title}</title>`);
  }

  if (spec.ariaLabel) {
    svg.attr("aria-label", spec.ariaLabel);
  }
  if (spec.decorative) {
    svg.attr("aria-hidden", "true");
  }

  const optimized = optimize($.xml(svg), {
    multipass: true,
    plugins: ["preset-default"]
  });

  return optimized.data;
}

export async function svgToTsx(icon: IconRecord, spec: CustomizationSpec, componentName: string): Promise<string> {
  const svg = await customizeSvg(icon, spec);
  const jsxSvg = camelCaseSvgAttributes(svg).replace(/<svg /, "<svg {...props} ");
  return `import type { SVGProps } from "react";

export function ${componentName}(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsxSvg}
  );
}
`;
}
