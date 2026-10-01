import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import ThemeBackground from "../components/ThemeBackground";
import {
  ThemeProvider,
  useTheme,
} from "../theme/ThemeContext";

function AppNavigation() {
  const {
    activeSpecialTheme,
    resolvedThemeName,
  } = useTheme();

  const statusBarStyle =
    activeSpecialTheme === "meanGirls"
      ? "dark"
      : resolvedThemeName === "dark"
        ? "light"
        : "dark";

  return (
    <ThemeBackground>
      <StatusBar style={statusBarStyle} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </ThemeBackground>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}