export type IconFamily =
  | "ui"
  | "core"
  | "micro-bold"
  | "sharp"
  | "pixel"
  | "glass"
  | "flags"
  | "arcade"
  | "isometric"
  | "social-media"
  | "credit-cards"
  | "unknown";

export type IconStyle =
  | "fill"
  | "outline"
  | "fill-duo"
  | "outline-duo"
  | "glyph"
  | "colored"
  | "unknown";

export type UsageKind =
  | "nav"
  | "button"
  | "toolbar"
  | "empty-state"
  | "settings"
  | "billing"
  | "data"
  | "marketing";

export type IndexSource = "local" | "svg-dir" | "nucleo-json";

export interface IconRecord {
  id: string;
  numericId?: number;
  source: IndexSource;
  name: string;
  filename: string;
  tags: string[];
  family: IconFamily;
  style: IconStyle;
  size: number;
  grid: number;
  width: number;
  height: number;
  setId?: number;
  setTitle?: string;
  groupTitle?: string;
  packageName?: string;
  componentName?: string;
  svgPath: string;
  keywords: string[];
}

export interface SearchFilters {
  family?: IconFamily;
  style?: IconStyle;
  size?: number;
  limit?: number;
}

export interface SearchResult extends IconRecord {
  score: number;
  reasons: string[];
  importStrategy: "package" | "local";
}

export interface SuggestionContext {
  projectPath?: string;
  usage?: UsageKind;
}

export interface SuggestionResult extends SearchResult {
  rationale: string;
}

export interface CustomizationSpec {
  size?: number;
  color?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  corners?: "square" | "round";
  padding?: number;
  rotate?: number;
  title?: string;
  ariaLabel?: string;
  decorative?: boolean;
}

export interface ReactUsageRecommendation {
  icon: IconRecord;
  available: boolean;
  mode: "package-import" | "local-tsx" | "local-svg";
  packageName?: string;
  componentName?: string;
  importStatement?: string;
  jsxExample?: string;
  installCommand?: string;
  licenseRequired: boolean;
  hasLicenseKey: boolean;
  installed: boolean;
  supports: string[];
  notes: string[];
}

export interface DecisionRecord {
  key: string;
  iconId: string;
  iconName: string;
  usage?: UsageKind;
  outputPath?: string;
  format?: "svg" | "tsx" | "react-import";
  customization: CustomizationSpec;
  rationale: string;
  createdAt: string;
}

export interface PackageDetection {
  packageJsonPath?: string;
  dependencies: string[];
  installedNucleoPackages: string[];
}

export interface DoctorReport {
  cwd: string;
  nucleoPath?: string;
  sqlitePath?: string;
  svgDir?: string;
  cachePath: string;
  configPath: string;
  hasLicenseKey: boolean;
  packageDetection: PackageDetection;
  indexed: boolean;
  iconCount?: number;
}

export interface IndexSummary {
  source: IndexSource;
  cachePath: string;
  count: number;
  generatedAt: string;
}

export interface ProjectMemory {
  projectPath: string;
  decisions: DecisionRecord[];
}
