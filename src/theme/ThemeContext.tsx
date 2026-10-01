import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import {
  AppTheme,
  applySpecialTheme,
  BaseThemeName,
  MeanGirlsMode,
  ResolvedThemeName,
  SpecialThemeName,
  themes,
} from "./themes";

type ThemeContextData = {
  theme: AppTheme;

  themeName: BaseThemeName;
  resolvedThemeName: ResolvedThemeName;

  setTheme: (theme: BaseThemeName) => void;
  toggleTheme: () => void;

  specialTheme: SpecialThemeName;
  activeSpecialTheme: SpecialThemeName;

  setSpecialTheme: (
    theme: SpecialThemeName
  ) => void;

  meanGirlsMode: MeanGirlsMode;

  setMeanGirlsMode: (
    mode: MeanGirlsMode
  ) => void;
};

const ThemeContext = createContext<
  ThemeContextData | undefined
>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [themeName, setThemeName] =
    useState<BaseThemeName>("dark");

  const [specialTheme, setSpecialThemeState] =
    useState<SpecialThemeName>("none");

  const [meanGirlsMode, setMeanGirlsMode] =
    useState<MeanGirlsMode>("wednesday");

  const resolvedThemeName: ResolvedThemeName =
    themeName === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeName;

  const baseTheme = themes[resolvedThemeName];

  const isWednesday =
    new Date().getDay() === 3;

  let activeSpecialTheme: SpecialThemeName =
    specialTheme;

  if (
    specialTheme === "meanGirls" &&
    meanGirlsMode === "wednesday" &&
    !isWednesday
  ) {
    activeSpecialTheme = "none";
  }

  const theme = applySpecialTheme(
    baseTheme,
    activeSpecialTheme
  );

  function setTheme(
    newTheme: BaseThemeName
  ) {
    setThemeName(newTheme);
  }

  function setSpecialTheme(
    newTheme: SpecialThemeName
  ) {
    setSpecialThemeState(newTheme);
  }

  function toggleTheme() {
    setThemeName((current) => {
      const currentResolved =
        current === "system"
          ? systemColorScheme === "dark"
            ? "dark"
            : "light"
          : current;

      return currentResolved === "dark"
        ? "light"
        : "dark";
    });
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,

        themeName,
        resolvedThemeName,

        setTheme,
        toggleTheme,

        specialTheme,
        activeSpecialTheme,
        setSpecialTheme,

        meanGirlsMode,
        setMeanGirlsMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme deve ser usado dentro de ThemeProvider"
    );
  }

  return context;
}