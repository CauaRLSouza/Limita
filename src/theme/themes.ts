import { semanticColors } from "./colors";

export type ThemeName = "light" | "dark";

export type AppTheme = {
  name: ThemeName;

  colors: {
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
};

export const darkTheme: AppTheme = {
  name: "dark",

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
};

export const lightTheme: AppTheme = {
  name: "light",

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
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};