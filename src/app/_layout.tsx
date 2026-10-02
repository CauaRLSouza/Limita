import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import ThemeBackground from "../components/ThemeBackground";
import { NotificationPreferencesProvider } from "../notifications/NotificationPreferencesContext";
import { configurarNotificacoes } from "../notifications/notifications";
import {
  ThemeProvider,
  useTheme,
} from "../theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

function AppNavigation() {
  const {
    activeSpecialTheme,
    resolvedThemeName,
    preferencesLoaded,
  } = useTheme();

  useEffect(() => {
    configurarNotificacoes().catch((error) => {
      console.error(
        "Erro ao configurar notificações:",
        error
      );
    });
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    SplashScreen.hide();
  }, [preferencesLoaded]);

  if (!preferencesLoaded) {
    return null;
  }

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
      <NotificationPreferencesProvider>
        <AppNavigation />
      </NotificationPreferencesProvider>
    </ThemeProvider>
  );
}