import type { IconRecord, PackageDetection, ReactUsageRecommendation } from "./types.js";
import { REACT_PACKAGE_GUIDANCE } from "./constants.js";
import { detectPackages } from "./discovery.js";

function buildJsxExample(icon: IconRecord, componentName: string): string {
  if (icon.family === "glass") {
    return `<${componentName} size={32} aria-hidden={true} uniqueId={useId()} />`;
  }

  if (icon.style === "outline") {
    return `<${componentName} size={${icon.size}} aria-label="${icon.name}" strokeWidth={1.5} />`;
  }

  return `<${componentName} size={${icon.size}} aria-hidden={true} />`;
}

function buildNotes(icon: IconRecord, packageDetection: PackageDetection, licenseRequired: boolean): string[] {
  const notes = [
    "Use `size` or Tailwind `size-*` utilities for sizing.",
    "Use `currentColor` or text color utilities for the primary color."
  ];

  if (["fill", "fill-duo", "outline", "outline-duo"].includes(icon.style) || ["core", "ui", "sharp", "pixel", "micro-bold"].includes(icon.family)) {
    notes.push("Target `[data-color=\"color-2\"]` for secondary-color overrides.");
  }
  if (icon.family === "core" && icon.style === "outline") {
    notes.push("Core outline icons support `strokeWidth` and `corners=\"round\"`.");
  }
  if (icon.family === "ui" && icon.style === "outline") {
    notes.push("UI outline icons support `strokeWidth`; the default is 1.5px.");
  }
  if (icon.family === "glass") {
    notes.push("Glass icons use CSS custom properties and should receive `uniqueId` when rendered multiple times.");
  }
  if (licenseRequired && !process.env.NUCLEO_LICENSE_KEY) {
    notes.push("Set `NUCLEO_LICENSE_KEY` for installs in local and CI environments.");
  }
  if (packageDetection.packageJsonPath) {
    notes.push(`Detected package.json at ${packageDetection.packageJsonPath}.`);
  }

  return notes;
}

export async function recommendReactUsage(icon: IconRecord, projectPath?: string): Promise<ReactUsageRecommendation> {
  const packageDetection = await detectPackages(projectPath ?? process.cwd());
  const installed = Boolean(icon.packageName && packageDetection.installedNucleoPackages.includes(icon.packageName));
  const previewPackage = (REACT_PACKAGE_GUIDANCE[icon.family].preview as Record<string, string | undefined>).default;
  const packageName = installed ? icon.packageName : icon.packageName ?? previewPackage;
  const licenseRequired = Boolean(icon.packageName && packageName === icon.packageName && !packageName.includes("essential") && !["glass", "flags", "arcade", "isometric", "social-media", "credit-cards"].includes(icon.family));
  const componentName = icon.componentName ?? `Icon${icon.name}`;

  return {
    icon,
    available: Boolean(packageName),
    mode: packageName ? "package-import" : "local-tsx",
    packageName,
    componentName,
    importStatement: packageName ? `import { ${componentName} } from "${packageName}";` : undefined,
    jsxExample: buildJsxExample(icon, componentName),
    installCommand: packageName ? `npm install ${packageName}` : undefined,
    licenseRequired,
    hasLicenseKey: Boolean(process.env.NUCLEO_LICENSE_KEY),
    installed,
    supports: [...REACT_PACKAGE_GUIDANCE[icon.family].supports],
    notes: buildNotes(icon, packageDetection, licenseRequired)
  };
}
