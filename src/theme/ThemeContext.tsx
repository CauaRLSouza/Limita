import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

import {
  AppTheme,
  darkTheme,
  ThemeName,
  themes,
} from "./themes";

type ThemeContextData = {
  theme: AppTheme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextData | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [themeName, setThemeName] =
    useState<ThemeName>("dark");

  const theme = themes[themeName];

  function setTheme(newTheme: ThemeName) {
    setThemeName(newTheme);
  }

  function toggleTheme() {
    setThemeName((current) =>
      current === "dark" ? "light" : "dark"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme,
        toggleTheme,
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