import type { IconFamily, IconStyle } from "./types.js";

export const EXIT_CODES = {
  ok: 0,
  operationalFailure: 1,
  invalidArguments: 2,
  notFound: 3
} as const;

export const GROUP_FAMILY_MAP: Record<string, IconFamily> = {
  "Nucleo UI": "ui",
  "Nucleo Core": "core",
  "Nucleo Micro Bold": "micro-bold",
  "Nucleo Sharp": "sharp",
  "Nucleo Pixel": "pixel"
};

export const SET_FAMILY_HINTS: Array<[RegExp, IconFamily]> = [
  [/Nucleo UI Essential/i, "ui"],
  [/Nucleo Core Essential/i, "core"],
  [/Nucleo Micro Bold Essential/i, "micro-bold"],
  [/Nucleo Sharp Essential/i, "sharp"],
  [/Nucleo Pixel Essential/i, "pixel"],
  [/Nucleo Glass/i, "glass"],
  [/Nucleo Flags/i, "flags"],
  [/Nucleo Arcade/i, "arcade"],
  [/Nucleo Isometric/i, "isometric"],
  [/Nucleo Social Media/i, "social-media"],
  [/Nucleo Credit Cards/i, "credit-cards"]
];

export const CLASS_STYLE_MAP: Record<string, IconStyle> = {
  glyph: "fill",
  "glyph-duo": "fill-duo",
  outline: "outline",
  "outline-duo": "outline-duo",
  colored: "colored"
};

export const KNOWN_NUCLEO_PACKAGES = [
  "nucleo-core-fill-24",
  "nucleo-core-outline-24",
  "nucleo-core-fill-32",
  "nucleo-core-outline-32",
  "nucleo-core-fill-48",
  "nucleo-core-outline-48",
  "nucleo-core-essential-fill-24",
  "nucleo-core-essential-outline-24",
  "nucleo-core-essential-fill-32",
  "nucleo-core-essential-outline-32",
  "nucleo-core-essential-fill-48",
  "nucleo-core-essential-outline-48",
  "nucleo-ui-fill-12",
  "nucleo-ui-outline-12",
  "nucleo-ui-fill-18",
  "nucleo-ui-fill-duo-18",
  "nucleo-ui-outline-18",
  "nucleo-ui-outline-duo-18",
  "nucleo-ui-essential-fill-12",
  "nucleo-ui-essential-outline-12",
  "nucleo-ui-essential-fill-18",
  "nucleo-ui-essential-fill-duo-18",
  "nucleo-ui-essential-outline-18",
  "nucleo-ui-essential-outline-duo-18",
  "nucleo-sharp",
  "nucleo-sharp-essential",
  "nucleo-pixel",
  "nucleo-pixel-essential",
  "nucleo-micro-bold",
  "nucleo-micro-bold-essential",
  "nucleo-glass",
  "nucleo-flags",
  "nucleo-arcade",
  "nucleo-isometric",
  "nucleo-social-media",
  "nucleo-credit-cards"
] as const;

export const REACT_PACKAGE_GUIDANCE = {
  core: {
    premium: {
      "fill-24": "nucleo-core-fill-24",
      "outline-24": "nucleo-core-outline-24",
      "fill-32": "nucleo-core-fill-32",
      "outline-32": "nucleo-core-outline-32",
      "fill-48": "nucleo-core-fill-48",
      "outline-48": "nucleo-core-outline-48"
    },
    preview: {
      "fill-24": "nucleo-core-essential-fill-24",
      "outline-24": "nucleo-core-essential-outline-24",
      "fill-32": "nucleo-core-essential-fill-32",
      "outline-32": "nucleo-core-essential-outline-32",
      "fill-48": "nucleo-core-essential-fill-48",
      "outline-48": "nucleo-core-essential-outline-48"
    },
    supports: ["size", "currentColor", "secondary color", "strokeWidth", "corners", "title", "aria-label", "aria-hidden"]
  },
  ui: {
    premium: {
      "fill-12": "nucleo-ui-fill-12",
      "outline-12": "nucleo-ui-outline-12",
      "fill-18": "nucleo-ui-fill-18",
      "fill-duo-18": "nucleo-ui-fill-duo-18",
      "outline-18": "nucleo-ui-outline-18",
      "outline-duo-18": "nucleo-ui-outline-duo-18"
    },
    preview: {
      "fill-12": "nucleo-ui-essential-fill-12",
      "outline-12": "nucleo-ui-essential-outline-12",
      "fill-18": "nucleo-ui-essential-fill-18",
      "fill-duo-18": "nucleo-ui-essential-fill-duo-18",
      "outline-18": "nucleo-ui-essential-outline-18",
      "outline-duo-18": "nucleo-ui-essential-outline-duo-18"
    },
    supports: ["size", "currentColor", "secondary color", "strokeWidth", "title", "aria-label", "aria-hidden"]
  },
  sharp: {
    premium: { default: "nucleo-sharp" },
    preview: { default: "nucleo-sharp-essential" },
    supports: ["size", "currentColor", "secondary color", "title", "aria-label", "aria-hidden"]
  },
  pixel: {
    premium: { default: "nucleo-pixel" },
    preview: { default: "nucleo-pixel-essential" },
    supports: ["size", "currentColor", "secondary color", "title", "aria-label", "aria-hidden"]
  },
  "micro-bold": {
    premium: { default: "nucleo-micro-bold" },
    preview: { default: "nucleo-micro-bold-essential" },
    supports: ["size", "currentColor", "secondary color", "title", "aria-label", "aria-hidden"]
  },
  glass: {
    premium: { default: "nucleo-glass" },
    preview: {},
    supports: ["size", "CSS custom properties", "uniqueId", "title", "aria-label", "aria-hidden"]
  },
  flags: {
    premium: { default: "nucleo-flags" },
    preview: {},
    supports: ["size", "title", "aria-label", "aria-hidden"]
  },
  arcade: {
    premium: { default: "nucleo-arcade" },
    preview: {},
    supports: ["size", "currentColor", "title", "aria-label", "aria-hidden"]
  },
  isometric: {
    premium: { default: "nucleo-isometric" },
    preview: {},
    supports: ["size", "title", "aria-label", "aria-hidden"]
  },
  "social-media": {
    premium: { default: "nucleo-social-media" },
    preview: {},
    supports: ["size", "title", "aria-label", "aria-hidden"]
  },
  "credit-cards": {
    premium: { default: "nucleo-credit-cards" },
    preview: {},
    supports: ["size", "title", "aria-label", "aria-hidden"]
  },
  unknown: {
    premium: {},
    preview: {},
    supports: []
  }
} as const;
