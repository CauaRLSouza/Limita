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

export type AchievementThemeName =
  | "none"
  | "spark"
  | "oasis"
  | "aurora"
  | "constellation";

export type MeanGirlsMode =
  | "always"
  | "wednesday";

export type PrideMode =
  | "always"
  | "june";

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

  decorationStyle?:
    | "meanGirls"
    | "pride"
    | "spark"
    | "oasis"
    | "aurora"
    | "constellation";

  contentAsCard: boolean;
};

export type AppTheme = {
  name: ResolvedThemeName;

  specialTheme: SpecialThemeName;
  achievementTheme: AchievementThemeName;

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
  achievementTheme: "none",

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
  achievementTheme: "none",

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

export const sparkTheme: AppTheme = {
  name: "dark",

  specialTheme: "none",
  achievementTheme: "spark",

  colors: {
    background: "#130B02",
    surface: "#291604",
    surfaceSecondary: "#3B2107",

    primary: "#FFD34E",
    primarySoft: "#563308",

    text: "#FFF9E8",
    textSecondary: "#E5C98C",

    border: "#754713",

    ...semanticColors,
  },

  visuals: {
    gradientColors: [
      "#130B02",
      "#241203",
      "#3B1D04",
      "#1A0D02",
    ],

    borderGradientColors: [
      "#B86A0A",
      "#F59E0B",
      "#FFD34E",
      "#FFF0A3",
    ],

    controlGradientColors: [
      "#C96A06",
      "#F59E0B",
      "#FFD34E",
      "#FFF0A3",
    ],

    decorativeColors: [
      "#FFF4B8",
      "#FFE169",
      "#FFC42E",
      "#F59E0B",
    ],

    useGradientPrimary: true,
    useGradientBorders: false,
    showDecorations: true,

    decorationStyle: "spark",

    contentAsCard: false,
  },
};

export const oasisTheme: AppTheme = {
  name: "dark",

  specialTheme: "none",
  achievementTheme: "oasis",

  colors: {
    background: "#011B1D",
    surface: "#06312E",
    surfaceSecondary: "#0B4840",

    primary: "#35E6C3",
    primarySoft: "#0A6157",

    text: "#FFF8E8",
    textSecondary: "#D7D0AD",

    border: "#168E7B",

    ...semanticColors,
  },

  visuals: {
    gradientColors: [
      "#01191C",
      "#032D31",
      "#07504B",
      "#087567",
      "#03282B",
    ],

    borderGradientColors: [
      "#0C6B63",
      "#19B89E",
      "#42E8C5",
      "#D5BC79",
    ],

    controlGradientColors: [
      "#087F73",
      "#12BFA6",
      "#32E6C2",
      "#8CF4D9",
    ],

    decorativeColors: [
      "#1FD1B0",
      "#57E6C5",
      "#0B6D72",
      "#D5BC79",
      "#F0DFAD",
    ],

    useGradientPrimary: true,
    useGradientBorders: true,
    showDecorations: true,

    decorationStyle: "oasis",

    contentAsCard: false,
  },
};

export const auroraTheme: AppTheme = {
  name: "dark",

  specialTheme: "none",
  achievementTheme: "aurora",

  colors: {
    background: "#080D24",
    surface: "#111833",
    surfaceSecondary: "#192142",

    primary: "#D95D8B",
    primarySoft: "#47213C",

    text: "#FFF7FA",
    textSecondary: "#C1B4CB",

    border: "#34375C",

    ...semanticColors,
  },

  visuals: {
    gradientColors: [
      "#080D24",
      "#172554",
      "#4C1D66",
      "#7A294F",
      "#080D24",
    ],

    borderGradientColors: [
      "#4338CA",
      "#A855F7",
      "#FB7185",
      "#D6B56D",
    ],

    controlGradientColors: [
      "#7C3AED",
      "#D946EF",
      "#FB7185",
    ],

    decorativeColors: [
      "#6366F1",
      "#A855F7",
      "#FB7185",
      "#D6B56D",
    ],

    useGradientPrimary: true,
    useGradientBorders: false,
    showDecorations: true,

    decorationStyle: "aurora",

    contentAsCard: false,
  },
};

export const constellationTheme: AppTheme = {
  name: "dark",

  specialTheme: "none",
  achievementTheme: "constellation",

  colors: {
    background: "#030617",
    surface: "#0C122A",
    surfaceSecondary: "#131B3A",

    primary: "#9D4EDD",
    primarySoft: "#321B55",

    text: "#F8F7FF",
    textSecondary: "#AAA9C8",

    border: "#29325A",

    ...semanticColors,
  },

  visuals: {
    gradientColors: [
      "#030617",
      "#0B1235",
      "#17124A",
      "#28104D",
      "#030617",
    ],

    borderGradientColors: [
      "#2563EB",
      "#7C3AED",
      "#A855F7",
      "#D6B56D",
    ],

    controlGradientColors: [
      "#7C3AED",
      "#9333EA",
      "#C026D3",
    ],

    decorativeColors: [
      "#38BDF8",
      "#6366F1",
      "#A855F7",
      "#D6B56D",
    ],

    useGradientPrimary: true,
    useGradientBorders: false,
    showDecorations: true,

    decorationStyle: "constellation",

    contentAsCard: false,
  },
};

export const meanGirlsTheme: AppTheme = {
  name: "light",

  specialTheme: "meanGirls",
  achievementTheme: "none",

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

export const achievementThemes: Record<
  Exclude<AchievementThemeName, "none">,
  AppTheme
> = {
  spark: sparkTheme,
  oasis: oasisTheme,
  aurora: auroraTheme,
  constellation: constellationTheme,
};

export function applyAchievementTheme(
  baseTheme: AppTheme,
  achievementTheme: AchievementThemeName
): AppTheme {
  if (achievementTheme === "none") {
    return baseTheme;
  }

  return achievementThemes[
    achievementTheme
  ];
}

export function applySpecialTheme(
  baseTheme: AppTheme,
  specialTheme: SpecialThemeName
): AppTheme {
  if (specialTheme === "none") {
    return {
      ...baseTheme,

      specialTheme: "none",

      visuals: baseTheme.visuals,
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
      ...baseTheme.visuals,
      ...prideTheme.visuals,
    },
  };
}