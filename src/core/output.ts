import { z } from "zod";
import type { SearchResult, SuggestionResult } from "./types.js";

const iconSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  style: z.string(),
  size: z.number(),
  svgPath: z.string()
}).passthrough();

export const searchResultsSchema = z.array(iconSchema.extend({
  score: z.number(),
  reasons: z.array(z.string()),
  importStrategy: z.enum(["package", "local"])
}));

export const suggestionResultsSchema = z.array(searchResultsSchema.element.extend({
  rationale: z.string()
}));

export function validateSearchResults(results: SearchResult[]): SearchResult[] {
  searchResultsSchema.parse(results);
  return results;
}

export function validateSuggestionResults(results: SuggestionResult[]): SuggestionResult[] {
  suggestionResultsSchema.parse(results);
  return results;
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
