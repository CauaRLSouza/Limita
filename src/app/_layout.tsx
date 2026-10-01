import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ThemeProvider,
  useTheme,
} from "../theme/ThemeContext";

function AppNavigation() {
  const { themeName } = useTheme();

  return (
    <>
      <StatusBar
        style={themeName === "dark" ? "light" : "dark"}
      />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}