import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import {
  AppTheme,
  applySpecialTheme,
  BaseThemeName,
  MeanGirlsMode,
  PrideMode,
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

  prideMode: PrideMode;

  setPrideMode: (
    mode: PrideMode
  ) => void;
};

type StoredThemePreferences = {
  themeName: BaseThemeName;
  specialTheme: SpecialThemeName;
  meanGirlsMode: MeanGirlsMode;
  prideMode: PrideMode;
};

const THEME_STORAGE_KEY =
  "@limita:theme-preferences";

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

  const [prideMode, setPrideMode] =
    useState<PrideMode>("june");

  const [preferencesLoaded, setPreferencesLoaded] =
    useState(false);

  useEffect(() => {
    async function loadThemePreferences() {
      try {
        const storedPreferences =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );

        if (storedPreferences) {
          const preferences: StoredThemePreferences =
            JSON.parse(storedPreferences);

          if (
            preferences.themeName === "light" ||
            preferences.themeName === "dark" ||
            preferences.themeName === "system"
          ) {
            setThemeName(
              preferences.themeName
            );
          }

          if (
            preferences.specialTheme === "none" ||
            preferences.specialTheme ===
              "meanGirls" ||
            preferences.specialTheme === "pride"
          ) {
            setSpecialThemeState(
              preferences.specialTheme
            );
          }

          if (
            preferences.meanGirlsMode ===
              "always" ||
            preferences.meanGirlsMode ===
              "wednesday"
          ) {
            setMeanGirlsMode(
              preferences.meanGirlsMode
            );
          }

          if (
            preferences.prideMode === "always" ||
            preferences.prideMode === "june"
          ) {
            setPrideMode(
              preferences.prideMode
            );
          }
        }
      } catch (error) {
        console.error(
          "Erro ao carregar preferências de tema:",
          error
        );
      } finally {
        setPreferencesLoaded(true);
      }
    }

    loadThemePreferences();
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    async function saveThemePreferences() {
      const preferences: StoredThemePreferences = {
        themeName,
        specialTheme,
        meanGirlsMode,
        prideMode,
      };

      try {
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.error(
          "Erro ao salvar preferências de tema:",
          error
        );
      }
    }

    saveThemePreferences();
  }, [
    themeName,
    specialTheme,
    meanGirlsMode,
    prideMode,
    preferencesLoaded,
  ]);

  const resolvedThemeName: ResolvedThemeName =
    themeName === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeName;

  const baseTheme = themes[resolvedThemeName];

  const agora = new Date();

  const isWednesday =
    agora.getDay() === 3;

  const isJune =
    agora.getMonth() === 5;

  let activeSpecialTheme: SpecialThemeName =
    specialTheme;

  if (
    specialTheme === "meanGirls" &&
    meanGirlsMode === "wednesday" &&
    !isWednesday
  ) {
    activeSpecialTheme = "none";
  }

  if (
    specialTheme === "pride" &&
    prideMode === "june" &&
    !isJune
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

        prideMode,
        setPrideMode,
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