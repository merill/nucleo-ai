import { readFile, access } from "node:fs/promises";
import path from "node:path";

const skillDir = path.resolve("skill", "nucleo-icons");
const requiredFiles = [
  "SKILL.md",
  path.join("agents", "openai.yaml"),
  path.join("references", "cli.md"),
  path.join("references", "icon-selection.md"),
  path.join("references", "integration.md"),
  path.join("references", "react-packages.md")
];

async function ensureFiles() {
  for (const relativePath of requiredFiles) {
    const absolutePath = path.join(skillDir, relativePath);
    try {
      await access(absolutePath);
    } catch {
      throw new Error(`Missing required skill file: ${relativePath}`);
    }
  }
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    throw new Error("SKILL.md must start with YAML frontmatter.");
  }

  const parts = markdown.split("---");
  if (parts.length < 3) {
    throw new Error("SKILL.md frontmatter is incomplete.");
  }

  const lines = parts[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = Object.fromEntries(
    lines.map((line) => {
      const match = line.match(/^([a-z_]+):\s*(.+)$/);
      if (!match) {
        throw new Error(`Invalid frontmatter line: ${line}`);
      }
      return [match[1], match[2]];
    })
  );

  return entries;
}

async function main() {
  await ensureFiles();

  const skillMarkdown = await readFile(path.join(skillDir, "SKILL.md"), "utf8");
  const frontmatter = parseFrontmatter(skillMarkdown);

  if (Object.keys(frontmatter).sort().join(",") !== "description,name") {
    throw new Error("SKILL.md frontmatter must contain only name and description.");
  }
  if (frontmatter.name !== "nucleo-icons") {
    throw new Error("Skill name must be nucleo-icons.");
  }
  if (!frontmatter.description.toLowerCase().includes("react")) {
    throw new Error("Skill description should mention React usage guidance.");
  }

  const openAiYaml = await readFile(path.join(skillDir, "agents", "openai.yaml"), "utf8");
  for (const requiredSnippet of [
    'display_name: "Nucleo Icons"',
    'short_description: "Search and guide Nucleo icon usage"',
    'default_prompt: "Use $nucleo-icons'
  ]) {
    if (!openAiYaml.includes(requiredSnippet)) {
      throw new Error(`agents/openai.yaml is missing: ${requiredSnippet}`);
    }
  }

  console.log("Skill is valid!");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
