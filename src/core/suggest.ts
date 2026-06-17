import type { IconRecord, SuggestionContext, SuggestionResult } from "./types.js";
import { searchIcons } from "./search.js";

function usageBoost(icon: IconRecord, usage?: SuggestionContext["usage"]): number {
  if (!usage) {
    return 0;
  }

  if (usage === "nav" || usage === "toolbar" || usage === "settings") {
    if (icon.family === "ui" && icon.style.startsWith("outline") && icon.size === 18) {
      return 0.15;
    }
  }

  if (usage === "empty-state" || usage === "marketing") {
    if (icon.family === "core" && [24, 32, 48].includes(icon.size)) {
      return 0.12;
    }
  }

  if (usage === "billing" && (icon.family === "credit-cards" || icon.tags.some((tag) => tag.includes("card")))) {
    return 0.18;
  }

  if (usage === "data" && icon.tags.some((tag) => ["chart", "graph", "analytics"].includes(tag))) {
    return 0.14;
  }

  return 0;
}

export async function suggestIcons(
  icons: IconRecord[],
  intent: string,
  context: SuggestionContext
): Promise<SuggestionResult[]> {
  const matches = await searchIcons(icons, intent, { limit: 20 }, context.projectPath);
  const boosted = matches.map((match) => {
    const total = match.score + usageBoost(match, context.usage);
    return {
      ...match,
      score: Number(total.toFixed(4)),
      rationale: buildRationale(match, context)
    } satisfies SuggestionResult;
  });

  return boosted
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, 8);
}

function buildRationale(icon: IconRecord, context: SuggestionContext): string {
  const rationaleParts = [
    `${icon.name} has a strong semantic match`,
    icon.family === "ui" && icon.size === 18 ? "it fits compact SaaS controls" : undefined,
    icon.family === "core" && [24, 32].includes(icon.size) ? "it works well for larger product surfaces" : undefined,
    context.usage ? `it suits ${context.usage} usage` : undefined
  ].filter(Boolean);

  return rationaleParts.join(", ");
}
