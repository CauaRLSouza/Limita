import { semanticColors } from "./colors";

export type BaseThemeName =
  | "light"
  | "dark"
  | "system";

export type ResolvedThemeName =
  | "light"
  | "dark";

export type SpecialThemeName =
  | "none"
  | "meanGirls"
  | "pride";

export type MeanGirlsMode =
  | "always"
  | "wednesday";

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;

  primary: string;
  primarySoft: string;

  text: string;
  textSecondary: string;

  border: string;

  success: string;
  danger: string;
  warning: string;
  info: string;
};

export type SpecialVisuals = {
  gradientColors: string[];
  borderGradientColors: string[];
  controlGradientColors: string[];
  decorativeColors: string[];

  useGradientPrimary: boolean;
  useGradientBorders: boolean;
  showDecorations: boolean;

  decorationStyle?: "meanGirls" | "pride";

  contentAsCard: boolean;
};

export type AppTheme = {
  name: ResolvedThemeName;

  specialTheme: SpecialThemeName;

  colors: ThemeColors;

  visuals: SpecialVisuals;
};

export type PrideThemeDefinition = {
  visuals: SpecialVisuals;
};

const emptyVisuals: SpecialVisuals = {
  gradientColors: [],
  borderGradientColors: [],
  controlGradientColors: [],
  decorativeColors: [],

  useGradientPrimary: false,
  useGradientBorders: false,
  showDecorations: false,

  contentAsCard: false,
};

export const darkTheme: AppTheme = {
  name: "dark",

  specialTheme: "none",

  colors: {
    background: "#07111A",
    surface: "#101D28",
    surfaceSecondary: "#172633",

    primary: "#168AF2",
    primarySoft: "#163A59",

    text: "#F8FAFC",
    textSecondary: "#94A3B8",

    border: "#243746",

    ...semanticColors,
  },

  visuals: emptyVisuals,
};

export const lightTheme: AppTheme = {
  name: "light",

  specialTheme: "none",

  colors: {
    background: "#F7F9FC",
    surface: "#FFFFFF",
    surfaceSecondary: "#EDF3F8",

    primary: "#168AF2",
    primarySoft: "#DCEEFF",

    text: "#111827",
    textSecondary: "#64748B",

    border: "#DCE4EC",

    ...semanticColors,
  },

  visuals: emptyVisuals,
};

export const meanGirlsTheme: AppTheme = {
  name: "light",

  specialTheme: "meanGirls",

  colors: {
    background: "transparent",

    surface: "#FCE6EF",
    surfaceSecondary: "#F7C9DC",

    primary: "#EC1F7A",
    primarySoft: "#F8B8D3",

    text: "#650D35",
    textSecondary: "#914866",

    border: "#E9A9C3",

    success: semanticColors.success,
    danger: semanticColors.danger,
    warning: semanticColors.warning,
    info: semanticColors.info,
  },

  visuals: {
    gradientColors: [
      "#FF72AE",
      "#F43F8C",
      "#EC1F7A",
      "#D91668",
    ],

    borderGradientColors: [],

    controlGradientColors: [
      "#FF62A5",
      "#F52F88",
      "#EC1F7A",
    ],

    decorativeColors: [
      "#F5A6C5",
      "#EC86B1",
      "#F7BDD4",
      "#E978A5",
    ],

    useGradientPrimary: true,
    useGradientBorders: false,
    showDecorations: true,

    decorationStyle: "meanGirls",

    contentAsCard: false,
  },
};

export const prideTheme: PrideThemeDefinition = {
  visuals: {
    gradientColors: [
      "#FF2D55",
      "#FF8A00",
      "#FFD60A",
      "#22C55E",
      "#06B6D4",
      "#2563EB",
      "#7C3AED",
      "#D946EF",
    ],

    borderGradientColors: [
      "#FF2D55",
      "#FF8A00",
      "#FFD60A",
      "#22C55E",
      "#06B6D4",
      "#2563EB",
      "#7C3AED",
      "#D946EF",
    ],

    controlGradientColors: [
      "#FF2D55",
      "#FF8A00",
      "#FFD60A",
      "#22C55E",
      "#06B6D4",
      "#2563EB",
      "#7C3AED",
      "#D946EF",
    ],

    decorativeColors: [
      "#F9A8D4",
      "#FDE68A",
      "#A7F3D0",
      "#BFDBFE",
      "#DDD6FE",
    ],

    useGradientPrimary: true,
    useGradientBorders: true,
    showDecorations: true,

    decorationStyle: "pride",

    contentAsCard: false,
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export function applySpecialTheme(
  baseTheme: AppTheme,
  specialTheme: SpecialThemeName
): AppTheme {
  if (specialTheme === "none") {
    return {
      ...baseTheme,

      specialTheme: "none",

      visuals: emptyVisuals,
    };
  }

  if (specialTheme === "meanGirls") {
    return meanGirlsTheme;
  }

  return {
    ...baseTheme,

    specialTheme: "pride",

    colors: {
      ...baseTheme.colors,
    },

    visuals: {
      ...emptyVisuals,
      ...prideTheme.visuals,
    },
  };
}